import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PointerDust } from "@/components/patchwork/pointer-dust";

const preference = vi.hoisted(() => ({ reduced: false }));
vi.mock("@/lib/use-reduced-motion", () => ({ usePrefersReducedMotion: () => preference.reduced }));

const originalGetContext = HTMLCanvasElement.prototype.getContext;
const context = {
  createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  fillRect: vi.fn(), setTransform: vi.fn(), clearRect: vi.fn(),
  beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn(), drawImage: vi.fn(),
};
let nextFrame: FrameRequestCallback;
let time = 0;
let nextId = 0;

function tick() {
  time += 16;
  act(() => nextFrame(time));
}

describe("pointer dust lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    preference.reduced = false;
    nextId = 0;
    time = performance.now();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => context) as unknown as typeof originalGetContext;
    vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(800);
    vi.spyOn(Element.prototype, "clientHeight", "get").mockReturnValue(600);
    vi.spyOn(Math, "random").mockReturnValue(0.4);
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => { nextFrame = callback; return ++nextId; }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    cleanup();
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("caches its two glow sprites and stops the animation after unmount", () => {
    const { unmount } = render(<PointerDust />);
    expect(context.createRadialGradient).toHaveBeenCalledTimes(2);
    tick();
    expect(context.drawImage).toHaveBeenCalledTimes(40);
    tick();
    expect(context.createRadialGradient).toHaveBeenCalledTimes(2);
    expect(context.drawImage).toHaveBeenCalledTimes(80);
    fireEvent(window, new Event("resize"));
    tick();
    expect(context.drawImage).toHaveBeenCalledTimes(120);
    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it("responds to a mouse, ignores touch, and clears its halo when the pointer leaves", () => {
    render(<PointerDust />);
    const mouse = new MouseEvent("pointermove", { clientX: 500, clientY: 300 });
    Object.defineProperty(mouse, "pointerType", { value: "mouse" });
    fireEvent(window, mouse);
    tick();
    expect(context.arc).toHaveBeenCalledTimes(1);
    expect(context.arc.mock.calls[0]?.slice(0, 2).every(Number.isFinite)).toBe(true);
    fireEvent.pointerLeave(window);
    tick();
    expect(context.arc).toHaveBeenCalledTimes(1);
    const touch = new MouseEvent("pointermove", { clientX: 400, clientY: 300 });
    Object.defineProperty(touch, "pointerType", { value: "touch" });
    fireEvent(window, touch);
    tick();
    expect(context.arc).toHaveBeenCalledTimes(1);
  });

  it("pauses while the document is hidden and resumes when visible", () => {
    render(<PointerDust />);
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    fireEvent(document, new Event("visibilitychange"));
    expect(cancelAnimationFrame).toHaveBeenCalled();
    const calls = vi.mocked(requestAnimationFrame).mock.calls.length;
    hidden.mockReturnValue(false);
    fireEvent(document, new Event("visibilitychange"));
    expect(requestAnimationFrame).toHaveBeenCalledTimes(calls + 1);
    tick();
    expect(context.drawImage).toHaveBeenCalled();
  });

  it("does not start rendering for reduced motion or an unavailable canvas context", () => {
    preference.reduced = true;
    const view = render(<PointerDust />);
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    view.unmount();
    preference.reduced = false;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
    render(<PointerDust />);
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });
});
