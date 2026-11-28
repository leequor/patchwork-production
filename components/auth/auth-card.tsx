import type { ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="w-full">
      <h2 className="display-tight text-[clamp(27px,3vw,38px)] text-ink">
        {title}
      </h2>
      <p
        className="rise mt-2 max-w-[46ch] font-sans text-[15px] leading-6 text-ink-secondary"
        style={{ animationDelay: "160ms" }}
      >
        {description}
      </p>

      <div className="rise mt-7" style={{ animationDelay: "210ms" }}>
        {children}
      </div>

      {footer ? (
        <div className="mt-6 border-t border-dashed border-hairline-strong pt-4 text-[13px] leading-5 text-ink-secondary">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
