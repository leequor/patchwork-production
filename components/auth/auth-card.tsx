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
    <div className="w-full max-w-form">
      <h1 className="text-balance text-[24px] font-semibold leading-[1.15] tracking-[-0.025em] text-ink">
        {title}
      </h1>
      <p className="mt-2 text-[14px] leading-6 text-muted">{description}</p>

      <div className="mt-7">{children}</div>

      {footer ? (
        <div className="mt-8 rounded-sm bg-raised px-3 py-3 text-[13px] leading-5 text-muted">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
