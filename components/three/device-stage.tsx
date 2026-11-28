"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import { Box, Laptop, Smartphone, Tablet } from "lucide-react";

import type { TicketStatus } from "@/lib/repair/types";
import { TICKET_STATUS_META } from "@/lib/repair/format";
import { FORM_SPECS, type DeviceForm } from "@/lib/device-form";
import { cn } from "@/lib/utils";

/**
 * The bench stage.
 *
 * One device taken down to the five parts a technician actually lifts out:
 * back glass, frame, battery, logic board, display. Every layer is modelled as
 * a real component — the board carries its chips and shield can, the battery
 * carries its label, the frame carries its screws — so the exploded state is
 * readable as a repair, not as a stack of plates.
 *
 * That is also why it can stand in for the progress of a job: intake is a closed
 * device, diagnosis lifts the display, waiting on parts leaves a hole where the
 * battery should be, a repair in progress is open on the bench, and collection
 * sets it back down.
 *
 * Three.js is imported only by this module, and this module is only loaded
 * dynamically, so no other route on the site pays for it.
 */

type Lean = "warm" | "moss" | "steel";

type Stage = {
  /** 0 = closed stack, 1 = fully opened on the bench. */
  explode: number;
  /** Extra lift on the display, for the diagnostic state. */
  lift: number;
  /** The part the shop is waiting on, drawn out of the stack. */
  ghost: number;
  /** Sweep across the logic board while the fault is being found. */
  scan: boolean;
  /** Overall presence; a collected device sits back on the bench. */
  presence: number;
  lean: Lean;
};

const STAGES: Record<TicketStatus, Stage> = {
  intake: { explode: 0, lift: 0, ghost: 0, scan: false, presence: 0.88, lean: "warm" },
  diagnosing: { explode: 0.42, lift: 1, ghost: 0, scan: true, presence: 1, lean: "warm" },
  waiting_parts: { explode: 0.66, lift: 0, ghost: 1, scan: false, presence: 1, lean: "warm" },
  in_repair: { explode: 1, lift: 0, ghost: 0, scan: false, presence: 1, lean: "warm" },
  ready: { explode: 0.1, lift: 0, ghost: 0, scan: false, presence: 1, lean: "moss" },
  picked_up: { explode: 0, lift: 0, ghost: 0, scan: false, presence: 0.36, lean: "steel" },
  cancelled: { explode: 0, lift: 0, ghost: 0, scan: false, presence: 0.2, lean: "steel" },
};

const LEAN_COLOR: Record<Lean, number> = {
  warm: 0xffd9a2,
  moss: 0x9fe9c4,
  steel: 0xa8bcc9,
};

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

/** A rounded rectangle centred on the origin, in the XY plane. */
function roundedRect(width: number, height: number, radius: number) {
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  const shape = new THREE.Shape();

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  return shape;
}

type SlabOptions = {
  width: number;
  height: number;
  depth: number;
  radius: number;
  bevel?: number;
  /** Inner cut-out, turning a plate into a machined frame. */
  hole?: { width: number; height: number; radius: number };
};

function slabGeometry({ width, height, depth, radius, bevel = 0.2, hole }: SlabOptions) {
  const shape = roundedRect(width, height, radius);

  if (hole) {
    shape.holes.push(
      new THREE.Path(roundedRect(hole.width, hole.height, hole.radius).getPoints(28)),
    );
  }

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 16,
  });

  geometry.center();
  geometry.computeVertexNormals();

  /* ExtrudeGeometry writes UVs in shape space, so a 0..1 map would tile once
     per unit. Remap the front and back faces onto the whole texture. */
  const uv = geometry.getAttribute("uv") as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i += 1) {
    uv.setXY(i, uv.getX(i) / width + 0.5, uv.getY(i) / height + 0.5);
  }
  uv.needsUpdate = true;

  return geometry;
}

/* ------------------------------------------------------------------ */
/* Procedural maps — nothing bitmap ships with this scene              */
/* ------------------------------------------------------------------ */

/** Deterministic noise, so the board looks identical on every load. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function canvasTexture(draw: (g: CanvasRenderingContext2D, size: number) => void, size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d");
  if (!g) return null;
  draw(g, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** The logic board: solder mask, copper runs, silkscreen. */
function pcbTexture() {
  return canvasTexture((g, size) => {
    const rand = seeded(20261027);

    g.fillStyle = "#101c16";
    g.fillRect(0, 0, size, size);

    g.strokeStyle = "rgba(150, 128, 88, 0.30)";
    g.lineWidth = 1.6;
    for (let i = 0; i < 64; i += 1) {
      const x = Math.round(rand() * size);
      const y = Math.round(rand() * size);
      const runX = Math.round((rand() - 0.5) * 170);
      const runY = Math.round((rand() - 0.5) * 170);
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + runX, y);
      g.lineTo(x + runX, y + runY);
      g.stroke();

      g.fillStyle = "rgba(196, 166, 110, 0.42)";
      g.beginPath();
      g.arc(x + runX, y + runY, 2.2, 0, Math.PI * 2);
      g.fill();
    }

    g.fillStyle = "rgba(232, 234, 226, 0.13)";
    for (let i = 0; i < 110; i += 1) {
      g.fillRect(rand() * size, rand() * size, 3 + rand() * 6, 1.6);
    }

    /* Mounting pads in the corners, the way a real board reads at a glance. */
    g.strokeStyle = "rgba(196, 166, 110, 0.5)";
    g.lineWidth = 3;
    [
      [26, 26],
      [size - 26, 26],
      [26, size - 26],
      [size - 26, size - 26],
    ].forEach(([x, y]) => g.strokeRect(x - 9, y - 9, 18, 18));
  });
}

/** The back panel: brushed enamel, antenna breaks, the regulatory block. */
function backPanelTexture() {
  return canvasTexture((g, size) => {
    const rand = seeded(77123);

    g.fillStyle = "#2c3138";
    g.fillRect(0, 0, size, size);

    /* Brushed grain, longitudinal only. */
    for (let i = 0; i < 900; i += 1) {
      const y = rand() * size;
      g.strokeStyle = `rgba(255,255,255,${0.012 + rand() * 0.02})`;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(size, y);
      g.stroke();
    }

    /* Antenna breaks, top and bottom. */
    g.strokeStyle = "rgba(12, 14, 16, 0.75)";
    g.lineWidth = 5;
    [size * 0.16, size * 0.85].forEach((y) => {
      g.beginPath();
      g.moveTo(size * 0.08, y);
      g.lineTo(size * 0.92, y);
      g.stroke();
    });

    /* Regulatory block, low on the panel. */
    g.fillStyle = "rgba(237, 237, 230, 0.16)";
    for (let i = 0; i < 4; i += 1) {
      g.fillRect(size * 0.3, size * 0.9 + i * 6, size * (0.18 + (i % 2) * 0.1), 2);
    }
  }, 512);
}

/** The battery: a label wrapped on a soft cell. */
function batteryTexture() {
  return canvasTexture((g, size) => {
    g.fillStyle = "#26292f";
    g.fillRect(0, 0, size, size);

    g.strokeStyle = "rgba(237, 237, 230, 0.12)";
    g.lineWidth = 1.5;
    g.strokeRect(14, 14, size - 28, size - 28);

    g.fillStyle = "rgba(237, 237, 230, 0.5)";
    g.font = "600 26px 'IBM Plex Mono', monospace";
    g.fillText("PW-BAT-15P", 40, 84);

    g.fillStyle = "rgba(237, 237, 230, 0.26)";
    g.font = "500 20px 'IBM Plex Mono', monospace";
    g.fillText("Li-ion   3.87V   3349mAh", 40, 122);

    g.fillStyle = "rgba(217, 164, 65, 0.42)";
    g.fillRect(40, 156, 150, 4);

    /* Tab outline, so the cell reads as a fitted part. */
    g.strokeStyle = "rgba(217, 164, 65, 0.3)";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(size * 0.5, size - 14);
    g.lineTo(size * 0.5, size - 60);
    g.stroke();
  }, 512);
}

/** A soft radial falloff, used for the lamp pool and the contact shadow. */
function radialTexture(red: number, green: number, blue: number, alpha: number) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d");
  if (!g) return null;

  const gradient = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, `rgba(${red},${green},${blue},${alpha})`);
  gradient.addColorStop(0.42, `rgba(${red},${green},${blue},${alpha * 0.4})`);
  gradient.addColorStop(1, `rgba(${red},${green},${blue},0)`);
  g.fillStyle = gradient;
  g.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** A small procedural studio so metal and glass have something to reflect. */
function environmentTexture(renderer: THREE.WebGLRenderer) {
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x09080f);

  const panel = (
    color: number,
    intensity: number,
    width: number,
    height: number,
    pos: [number, number, number],
  ) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) }),
    );
    mesh.position.set(...pos);
    mesh.lookAt(0, 0, 0);
    envScene.add(mesh);
  };

  /* One warm softbox overhead, one cool strip behind, one bounce below. */
  panel(0xffe7cc, 3.4, 30, 30, [0, 18, 8]);
  panel(0xc6dcea, 2.8, 12, 40, [-20, 4, -14]);
  panel(0xf3f6ff, 1.4, 10, 44, [18, -2, 10]);
  panel(0x1a1a17, 1, 70, 70, [0, -22, 0]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(envScene, 0.035);
  pmrem.dispose();
  envScene.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.geometry.dispose();
      (node.material as THREE.Material).dispose();
    }
  });
  return target.texture;
}

/* ------------------------------------------------------------------ */
/* The scene                                                           */
/* ------------------------------------------------------------------ */

export type DeviceStageProps = {
  status: TicketStatus;
  form?: DeviceForm;
  className?: string;
  quality?: "high" | "low";
  label?: string;
};

export default function DeviceStage({
  status,
  form = "handheld",
  className,
  quality = "high",
  label = "Bench view of the device, opened into its parts",
}: DeviceStageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<TicketStatus>(status);
  const DeviceIcon = { handheld: Smartphone, tablet: Tablet, clamshell: Laptop, box: Box }[form];

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: quality === "high",
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      // The stage is optional; a machine without WebGL must still open the ticket.
      return;
    }
    renderer.setClearAlpha(0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === "high" ? 2 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.7;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    /* Every dimension below is derived from the form, so a laptop reads as a wide
       shallow stack and a console as a squat one, without a second scene. */
    const spec = FORM_SPECS[form];
    const CARD = { width: spec.width, height: spec.height, radius: spec.radius };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 1, 320);
    camera.position.set(8, 6, 34);
    camera.lookAt(0, -0.2, 0);

    scene.environment = environmentTexture(renderer);
    scene.environmentIntensity = 1.5;

    /* The bench lamp, a violet rim from behind, and a little cool bounce. */
    const lamp = new THREE.SpotLight(0xffd9a8, 3000, 260, Math.PI / 4.4, 0.72, 1.35);
    lamp.position.set(-16, 28, 26);
    lamp.target.position.set(0, 0, 0);
    scene.add(lamp);
    scene.add(lamp.target);

    const key = new THREE.DirectionalLight(0xf0efff, 2.4);
    key.position.set(16, 20, 28);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x8f7dff, 3.8);
    rim.position.set(-24, 8, -20);
    scene.add(rim);

    const fill = new THREE.DirectionalLight(0xcfd2ff, 2.15);
    fill.position.set(20, -14, 16);
    scene.add(fill);

    scene.add(new THREE.HemisphereLight(0x2c2450, 0x0b0916, 1.5));

    /* Bench surface: the lamp pool, and the device's own contact shadow. */
    const pool = new THREE.Mesh(
      new THREE.PlaneGeometry(54, 54),
      new THREE.MeshBasicMaterial({
        map: radialTexture(110, 92, 247, 0.65) ?? undefined,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.24,
      }),
    );
    pool.position.set(0, -1.5, -18);
    scene.add(pool);


    /* ---- Materials ---- */

    const brass = new THREE.MeshPhysicalMaterial({
      color: 0xc08a33,
      metalness: 1,
      roughness: 0.3,
      envMapIntensity: 1.3,
    });

    const aluminium = new THREE.MeshPhysicalMaterial({
      color: 0xc4c9d0,
      metalness: 1,
      roughness: 0.24,
      envMapIntensity: 1.5,
    });

    const backGlass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      map: backPanelTexture() ?? undefined,
      metalness: 0.55,
      roughness: 0.24,
      clearcoat: 0.55,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.2,
    });

    const batteryMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      map: batteryTexture() ?? undefined,
      metalness: 0.18,
      roughness: 0.66,
      envMapIntensity: 0.6,
    });

    const boardMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      map: pcbTexture() ?? undefined,
      metalness: 0.3,
      roughness: 0.62,
      envMapIntensity: 0.7,
    });

    const chipMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x191b1e,
      metalness: 0.85,
      roughness: 0.3,
      envMapIntensity: 1.1,
    });

    const shieldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xb9bdc2,
      metalness: 1,
      roughness: 0.38,
      envMapIntensity: 1.3,
    });

    const plastic = new THREE.MeshPhysicalMaterial({
      color: 0x25272a,
      metalness: 0.1,
      roughness: 0.78,
      envMapIntensity: 0.4,
    });

    const displayGlass = new THREE.MeshPhysicalMaterial({
      color: 0x15181d,
      metalness: 0.25,
      roughness: 0.07,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 2,
    });

    /* ---- Layers, back to front ---- */

    type Layer = {
      group: THREE.Group;
      /** Position within the closed stack, on the device's local Z. */
      z: number;
      /** Travel at full explode. */
      travel: number;
      /** Extra travel when the display is lifted for diagnosis. */
      lift?: number;
      /** The part a job can be held up waiting for. */
      ghostable?: boolean;
    };

    const stage = new THREE.Group();
    stage.rotation.order = "YXZ";
    scene.add(stage);

    const layers: Layer[] = [];
    const addLayer = (layer: Layer) => {
      stage.add(layer.group);
      layers.push(layer);
    };

    /* 0 — back panel, with the camera block and its lenses. */
    {
      const group = new THREE.Group();

      group.add(
        new THREE.Mesh(
          slabGeometry({ ...CARD, depth: 0.38, radius: CARD.radius, bevel: 0.22 }),
          backGlass,
        ),
      );

      if (spec.camera) {
        const plateau = new THREE.Mesh(
          slabGeometry({ width: 2.7, height: 3.1, depth: 0.26, radius: 0.7, bevel: 0.12 }),
          aluminium,
        );
        plateau.position.set(-1.7, 4.5, -0.3);
        group.add(plateau);

        const lensBody = new THREE.CylinderGeometry(0.44, 0.44, 0.16, 30);
        const lensGlass = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 30);
        const lensMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x05080c,
          metalness: 0.95,
          roughness: 0.05,
          clearcoat: 1,
          envMapIntensity: 2.4,
        });

        [
          [-0.52, 0.72],
          [-0.52, -0.72],
          [0.68, 0],
        ].forEach(([dx, dy]) => {
          const ring = new THREE.Mesh(lensBody, aluminium);
          ring.rotation.x = Math.PI / 2;
          ring.position.set(-1.7 + dx, 4.5 + dy, -0.44);
          group.add(ring);

          const glass = new THREE.Mesh(lensGlass, lensMaterial);
          glass.rotation.x = Math.PI / 2;
          glass.position.set(-1.7 + dx, 4.5 + dy, -0.5);
          group.add(glass);
        });
      }

      /* The charging coil, on the inside face of the back panel. */
      if (spec.coil) {
        const coil = new THREE.Mesh(
          new THREE.TorusGeometry(2.35, 0.075, 10, 64),
          new THREE.MeshPhysicalMaterial({
            color: 0xb08432,
            metalness: 1,
            roughness: 0.34,
            envMapIntensity: 1.2,
          }),
        );
        coil.position.set(0, -1.4, 0.19);
        group.add(coil);

        const coilInner = new THREE.Mesh(
          new THREE.TorusGeometry(1.92, 0.055, 10, 64),
          new THREE.MeshPhysicalMaterial({
            color: 0x8c6a28,
            metalness: 1,
            roughness: 0.42,
            envMapIntensity: 1,
          }),
        );
        coilInner.position.set(0, -1.4, 0.19);
        group.add(coilInner);
      }

      if (spec.camera) {
        const flash = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.16, 0.1, 18),
          new THREE.MeshPhysicalMaterial({
            color: 0xe8dcc4,
            metalness: 0,
            roughness: 0.5,
            emissive: new THREE.Color(0x2a2418),
          }),
        );
        flash.rotation.x = Math.PI / 2;
        flash.position.set(-0.9, 3.2, -0.44);
        group.add(flash);
      }

      addLayer({ group, z: -0.42, travel: -7.0 });
    }

    /* 1 — machined frame, hollow, screws in the corners. */
    {
      const group = new THREE.Group();

      group.add(
        new THREE.Mesh(
          slabGeometry({
            width: CARD.width + 0.18,
            height: CARD.height + 0.18,
            depth: 0.52,
            radius: CARD.radius + 0.07,
            bevel: 0.09,
            hole: { width: CARD.width - 0.62, height: CARD.height - 0.62, radius: CARD.radius - 0.3 },
          }),
          aluminium,
        ),
      );

      const screwGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.16, 12);
      [
        [-CARD.width / 2 + 0.4, CARD.height / 2 - 0.4],
        [CARD.width / 2 - 0.4, CARD.height / 2 - 0.4],
        [-CARD.width / 2 + 0.4, -CARD.height / 2 + 0.4],
        [CARD.width / 2 - 0.4, -CARD.height / 2 + 0.4],
      ].forEach(([x, y]) => {
        const screw = new THREE.Mesh(screwGeometry, brass);
        screw.rotation.x = Math.PI / 2;
        screw.position.set(x, y, 0.22);
        group.add(screw);
      });

      const buttonMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x9aa0a6,
        metalness: 1,
        roughness: 0.34,
        envMapIntensity: 1.4,
      });
      if (spec.screen) {
      [
        { y: 2.6, h: 1.5 },
        { y: 0.5, h: 0.9 },
        { y: -1.1, h: 0.9 },
      ].forEach(({ y, h }) => {
        const button = new THREE.Mesh(new THREE.BoxGeometry(0.16, h, 0.34), buttonMaterial);
        button.position.set((CARD.width + 0.18) / 2, y, 0);
        group.add(button);
      });
      }

      /* A laptop base carries a keyboard and a trackpad; a phone's frame does not. */
      if (form === "clamshell") {
        const deckW = CARD.width - 0.62;
        const deckH = CARD.height - 0.62;
        const keycap = new THREE.MeshPhysicalMaterial({
          color: 0x24262a,
          metalness: 0.25,
          roughness: 0.72,
          envMapIntensity: 0.6,
        });

        const keyWell = new THREE.Mesh(
          new THREE.BoxGeometry(deckW * 0.9, deckH * 0.56, 0.05),
          new THREE.MeshPhysicalMaterial({ color: 0x0a0a09, metalness: 0.3, roughness: 0.88 }),
        );
        keyWell.position.set(0, deckH * 0.16, 0.2);
        group.add(keyWell);

        for (let row = 0; row < 5; row += 1) {
          for (let col = 0; col < 14; col += 1) {
            const key = new THREE.Mesh(
              new THREE.BoxGeometry(deckW * 0.052, deckH * 0.072, 0.035),
              keycap,
            );
            key.position.set(
              (col - 6.5) * deckW * 0.0605,
              deckH * 0.16 + (2 - row) * deckH * 0.092,
              0.235,
            );
            group.add(key);
          }
        }

        const trackpad = new THREE.Mesh(
          new THREE.BoxGeometry(deckW * 0.36, deckH * 0.24, 0.04),
          new THREE.MeshPhysicalMaterial({
            color: 0x1b1d20,
            metalness: 0.2,
            roughness: 0.5,
            envMapIntensity: 0.8,
          }),
        );
        trackpad.position.set(0, -deckH * 0.31, 0.22);
        group.add(trackpad);
      }

      /* A console's back edge is ports, not buttons. */
      if (form === "box") {
        const portMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x08080a,
          metalness: 0.6,
          roughness: 0.4,
        });
        [
          { w: 1.1, h: 0.18, x: -CARD.width * 0.3 },
          { w: 0.5, h: 0.16, x: -CARD.width * 0.12 },
          { w: 0.6, h: 0.16, x: CARD.width * 0.3 },
        ].forEach(({ w, h, x }) => {
          const port = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), portMaterial);
          port.position.set(x, -CARD.height / 2 + 0.22, 0.18);
          group.add(port);
        });
      }

      addLayer({ group, z: -0.06, travel: -3.4 });
    }

    /* 2 — battery: the part that holds a job up. */
    {
      const group = new THREE.Group();

      if (spec.screen) {
        const cell = new THREE.Mesh(
          slabGeometry({
            width: Math.min(5.4, CARD.width * 0.44),
            height: Math.min(6.2, CARD.height * 0.46),
            depth: 0.32,
            radius: 0.5,
            bevel: 0.14,
          }),
          batteryMaterial,
        );
        cell.position.y = CARD.height * 0.12;
        group.add(cell);

        /* Fitted into the frame rather than floating: a sub-plate under the board. */
        const subPlate = new THREE.Mesh(
          new THREE.BoxGeometry(1.9, CARD.height * 0.32, 0.16),
          plastic,
        );
        subPlate.position.set(0, -CARD.height * 0.19, 0);
        group.add(subPlate);
      } else {
        /* A console's power stage is a heatsink and a fan, not a cell. */
        for (let i = 0; i < 11; i += 1) {
          const fin = new THREE.Mesh(
            new THREE.BoxGeometry(CARD.width * 0.62, 0.09, 0.55),
            aluminium,
          );
          fin.position.set(-CARD.width * 0.12, -CARD.height * 0.22 + i * 0.14, 0.1);
          group.add(fin);
        }

        const fan = new THREE.Mesh(
          new THREE.TorusGeometry(CARD.height * 0.17, 0.1, 10, 40),
          plastic,
        );
        fan.position.set(CARD.width * 0.3, CARD.height * 0.1, 0.12);
        group.add(fan);
      }

      addLayer({ group, z: 0.22, travel: 0, ghostable: true });
    }

    /* 3 — logic board: traces, chips, a shield can, the charge connector. */
    const boardGroup = new THREE.Group();
    {
      /* The active area of the board scales with the device. */
      const boardW = Math.min(4.5, spec.width * 0.56);
      const boardH = Math.min(5.5, spec.height * 0.62);

      boardGroup.add(
        new THREE.Mesh(
          slabGeometry({ width: boardW, height: boardH, depth: 0.14, radius: 0.28, bevel: 0.05 }),
          boardMaterial,
        ),
      );

      const chips: Array<[number, number, number, number, number]> = [
        [-0.95, 1.55, 1.0, 0.82, 0.12],
        [1.05, 1.8, 0.6, 0.5, 0.09],
        [-1.05, -0.25, 0.55, 1.1, 0.1],
        [1.05, 0.35, 0.72, 0.86, 0.1],
        [0.1, -1.9, 1.05, 0.42, 0.08],
        [-1.15, 2.35, 0.5, 0.32, 0.07],
        [0.85, -0.75, 0.42, 0.6, 0.07],
        [-0.15, 0.6, 0.36, 0.3, 0.06],
        [1.15, -1.55, 0.36, 0.44, 0.07],
      ];
      chips.forEach(([x, y, w, h, d]) => {
        const chip = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), chipMaterial);
        chip.position.set(x, y, 0.13 + d / 2);
        boardGroup.add(chip);
      });

      const can = new THREE.Mesh(
        slabGeometry({ width: 1.14, height: 1.14, depth: 0.12, radius: 0.16, bevel: 0.04 }),
        shieldMaterial,
      );
      can.position.set(-0.95, 1.55, 0.24);
      boardGroup.add(can);

      const connector = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.3, 0.24), brass);
      connector.position.set(0, -2.5, 0.18);
      boardGroup.add(connector);

      /* Edge contacts, the way a logic board reads at a glance. */
      for (let i = 0; i < 7; i += 1) {
        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.22, 0.05), brass);
        pad.position.set(-0.9 + i * 0.3, 2.62, 0.08);
        boardGroup.add(pad);
      }

      addLayer({ group: boardGroup, z: 0.44, travel: 3.2 });
    }

    /* 4 — display assembly: the front of the phone, and the first thing lifted. */
    {
      const group = new THREE.Group();

      const bezel = new THREE.Mesh(
        slabGeometry({ ...CARD, depth: 0.34, radius: CARD.radius, bevel: 0.16 }),
        new THREE.MeshPhysicalMaterial({
          color: 0x141618,
          metalness: 0.5,
          roughness: 0.4,
          envMapIntensity: 0.7,
        }),
      );
      group.add(bezel);

      if (spec.screen) {
        const glass = new THREE.Mesh(
          slabGeometry({
            width: CARD.width - 0.16,
            height: CARD.height - 0.16,
            depth: 0.16,
            radius: CARD.radius - 0.08,
            bevel: 0.12,
          }),
          displayGlass,
        );
        glass.position.z = 0.24;
        group.add(glass);
      } else {
        /* Vents, so the last layer reads as a console cover. */
        for (let i = 0; i < 16; i += 1) {
          const slot = new THREE.Mesh(
            new THREE.BoxGeometry(CARD.width * 0.5, 0.07, 0.06),
            new THREE.MeshPhysicalMaterial({
              color: 0x0a0a09,
              metalness: 0.4,
              roughness: 0.8,
            }),
          );
          slot.position.set(
            i % 2 === 0 ? -CARD.width * 0.24 : CARD.width * 0.1,
            CARD.height * 0.34 - Math.floor(i / 2) * 0.19,
            0.25,
          );
          group.add(slot);
        }
      }

      const punch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.06, 20),
        new THREE.MeshPhysicalMaterial({ color: 0x020304, roughness: 0.1, metalness: 0.9 }),
      );
      punch.rotation.x = Math.PI / 2;
      punch.position.set(0, CARD.height / 2 - 0.55, 0.33);
      if (spec.screen) group.add(punch);

      /* The ribbon that carries the panel, tucked behind it. */
      const flex = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 2.2, 0.025),
        new THREE.MeshPhysicalMaterial({
          color: 0x4a3718,
          metalness: 0.55,
          roughness: 0.55,
          envMapIntensity: 0.4,
        }),
      );
      flex.position.set(0, -1.9, -0.24);
      group.add(flex);

      addLayer({ group, z: 0.56, travel: 6.4, lift: 8 });
    }

    /* ---- Scan sweep, only while the fault is being found ---- */
    const scanBar = new THREE.Mesh(
      new THREE.BoxGeometry(4.7, 0.045, 0.02),
      new THREE.MeshBasicMaterial({
        color: 0x9c8bff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    scanBar.position.z = 0.42;
    boardGroup.add(scanBar);

    /* ---- State, damped toward the stage the ticket is in ---- */
    const target0 = STAGES[statusRef.current];
    const current = { ...target0 };
    const aim = { x: 0, y: 0 };
    const pointer = { x: 0, y: 0 };
    const yawClosed = -0.3;
    const yawOpen = -0.8;
    const pitchClosed = 0.05;
    const pitchOpen = 0.17;

    let scanPhase = 0;
    let visible = true;
    let frame = 0;
    let previous = performance.now();
    let yawValue = yawClosed;
    let pitchValue = pitchClosed;

    const resize = () => {
      const width = host.clientWidth || 1;
      const height = host.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;

      /* Fit the frame to the host. The opened stack needs ~13.5 units across and
         the closed device ~17.5 down; whichever binds, the camera sits back far
         enough to hold it, so the device is never a speck inside a big panel. */
      const fitHeight = Math.max(19.5, 15 / camera.aspect);
      camera.position.z = fitHeight / 2 / Math.tan((camera.fov * Math.PI) / 360);
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const onPointerMove = (event: PointerEvent) => {
      if (reduced) return;
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      aim.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      aim.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onPointerLeave = () => {
      aim.x = 0;
      aim.y = 0;
    };
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerleave", onPointerLeave);

    const intersection = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
      },
      { rootMargin: "140px" },
    );
    intersection.observe(host);

    const damp = (from: number, to: number, lambda: number, dt: number) =>
      from + (to - from) * (1 - Math.exp(-lambda * dt));

    const render = (now: number) => {
      frame = requestAnimationFrame(render);

      const dt = Math.min(0.05, Math.max(0.001, (now - previous) / 1000));
      previous = now;

      if (!visible || document.hidden) return;

      const target = STAGES[statusRef.current];

      current.explode = damp(current.explode, target.explode, 4.2, dt);
      current.lift = damp(current.lift, target.lift, 4.2, dt);
      current.ghost = damp(current.ghost, target.ghost, 4.2, dt);
      current.presence = damp(current.presence, target.presence, 3.2, dt);

      pointer.x = damp(pointer.x, aim.x, 6, dt);
      pointer.y = damp(pointer.y, aim.y, 6, dt);

      const time = now / 1000;
      const drift = reduced ? 0 : Math.sin(time * 0.26) * 0.05;

      const open = current.explode;
      yawValue = damp(
        yawValue,
        yawClosed + (yawOpen - yawClosed) * open + pointer.x * 0.2 + drift,
        5,
        dt,
      );
      pitchValue = damp(
        pitchValue,
        pitchClosed + (pitchOpen - pitchClosed) * open + pointer.y * 0.11,
        5,
        dt,
      );

      stage.rotation.y = yawValue;
      stage.rotation.x = pitchValue;
      stage.position.y = reduced ? 0 : Math.sin(time * 0.48) * 0.2;
      stage.scale.setScalar(0.95 + current.presence * 0.05);

      layers.forEach((layer) => {
        const travel = layer.travel * current.explode + (layer.lift ?? 0) * current.lift;
        layer.group.position.z = layer.z + travel;
        layer.group.position.y = travel * 0.17;

        if (layer.ghostable) {
          const fade = 1 - current.ghost * 0.9;
          layer.group.visible = fade > 0.06;
          layer.group.scale.setScalar(1 - current.ghost * 0.16);
          batteryMaterial.opacity = fade;
          batteryMaterial.transparent = fade < 0.99;
          batteryMaterial.depthWrite = fade > 0.9;
        }
      });

      const scanner = scanBar.material as THREE.MeshBasicMaterial;
      if (target.scan) {
        scanPhase = (scanPhase + dt * 0.5) % 1;
        scanBar.position.y = 2.9 - scanPhase * 5.9;
        scanner.opacity = Math.sin(scanPhase * Math.PI) * 0.9;
        scanBar.visible = true;
      } else {
        scanner.opacity = damp(scanner.opacity, 0, 6, dt);
        scanBar.visible = scanner.opacity > 0.01;
      }

      const poolMaterial = pool.material as THREE.MeshBasicMaterial;
      poolMaterial.opacity = damp(poolMaterial.opacity, target.presence * 0.32, 3, dt);

      const lean = new THREE.Color(LEAN_COLOR[target.lean]);
      poolMaterial.color.lerp(lean, 1 - Math.exp(-3 * dt));
      lamp.color.lerp(lean, 1 - Math.exp(-2.4 * dt));

      renderer.render(scene, camera);
    };

    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      intersection.disconnect();
      observer.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      scene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.geometry.dispose();
          const material = node.material as THREE.Material | THREE.Material[];
          if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
          else material.dispose();
        }
      });
      scene.environment?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [quality, form]);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={label}
      className={cn("device-render relative h-full w-full", className)}
      style={{ touchAction: "pan-y" }}
    >
      <div aria-hidden="true" className="device-fallback absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-ink-secondary">
        <DeviceIcon size={46} strokeWidth={1} />
        <span className="text-sm">{TICKET_STATUS_META[status].description}</span>
      </div>
    </div>
  );
}
