/**
 * Which device the bench is holding.
 *
 * The shop repairs more than phones, so the teardown has to be shaped like the
 * thing that came in. Every form is the same five-part stack — shell, frame,
 * power, board, front — at that device's proportions, with the details that
 * belong to it: a camera block and charging coil on a handset, vents and ports
 * on a console, a keyboard deck on a laptop.
 *
 * This module is deliberately free of client/server markers and of three.js: a
 * server component (the tracker) needs to pick a form before the scene is ever
 * loaded.
 */

export type DeviceForm = "handheld" | "tablet" | "clamshell" | "box";

export type FormSpec = {
  width: number;
  height: number;
  radius: number;
  /** Camera block, lenses and flash on the back panel. */
  camera: boolean;
  /** Charging coil on the inside of the back panel. */
  coil: boolean;
  /** A front glass panel. A console has a vented cover instead. */
  screen: boolean;
  /** Vents in the shell. */
  vents: boolean;
};

export const DEVICE_FORMS: DeviceForm[] = ["handheld", "tablet", "clamshell", "box"];

export const FORM_SPECS: Record<DeviceForm, FormSpec> = {
  handheld: {
    width: 7.0,
    height: 14.4,
    radius: 1.45,
    camera: true,
    coil: true,
    screen: true,
    vents: false,
  },
  tablet: {
    width: 11.2,
    height: 13.4,
    radius: 1.0,
    camera: true,
    coil: false,
    screen: true,
    vents: false,
  },
  clamshell: {
    width: 12.8,
    height: 8.9,
    radius: 0.55,
    camera: false,
    coil: false,
    screen: true,
    vents: true,
  },
  box: {
    width: 12.4,
    height: 7.6,
    radius: 0.5,
    camera: false,
    coil: false,
    screen: false,
    vents: true,
  },
};

/** Map a device category onto the form the bench draws. */
export function formForCategory(category: string | null | undefined): DeviceForm {
  switch (category) {
    case "laptop":
      return "clamshell";
    case "console":
    case "camera":
      return "box";
    case "tablet":
      return "tablet";
    default:
      return "handheld";
  }
}
