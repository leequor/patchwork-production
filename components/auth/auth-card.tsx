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
      <h2 className="rise display text-[26px] text-ink" style={{ animationDelay: "120ms" }}>
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
        <div className="mt-7 rounded-sm bg-overlay px-3.5 py-3 font-sans text-[13px] leading-5 text-ink-secondary">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
