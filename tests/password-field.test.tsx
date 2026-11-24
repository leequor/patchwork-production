import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PasswordField } from "@/components/ui/password-field";

/**
 * The reveal toggle is a small control with three jobs: stop masking, announce
 * what it did, and never submit the form. All three are worth a test, because
 * each one fails silently in use.
 */
describe("PasswordField", () => {
  const mount = () =>
    render(<PasswordField id="password" name="password" label="Password" />);

  it("masks the input by default", () => {
    mount();
    const input = screen.getByLabelText("Password");
    expect(input.getAttribute("type")).toBe("password");
  });

  it("reveals the value and announces the new state", () => {
    mount();
    const input = screen.getByLabelText("Password");
    const toggle = screen.getByRole("button", { name: "Show password" });

    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(toggle);

    expect(input.getAttribute("type")).toBe("text");
    expect(screen.getByRole("button", { name: "Hide password" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it("hides it again, and is never a submit button", () => {
    mount();
    const input = screen.getByLabelText("Password");
    const toggle = screen.getByRole("button", { name: "Show password" });

    expect(toggle.getAttribute("type")).toBe("button");

    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));

    expect(input.getAttribute("type")).toBe("password");
  });
});
