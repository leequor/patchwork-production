/** Isometric service-manual drawings. The adjacent phase title supplies the meaning. */
export function RepairPlate({ phase }: { phase: "intake" | "bench" | "pickup" }) {
  const opened = phase === "bench";
  return (
    <svg viewBox="0 0 300 150" fill="none" aria-hidden="true" className="h-32 w-full sm:h-40">
      <g stroke="currentColor" opacity=".23" strokeWidth=".8">
        <path d="m32 111 116-52 119 43-115 42Z" strokeDasharray="2 5" />
        <path d="M16 111h14m-7-7v14m244-15h14m-7-7v14" />
      </g>
      <g transform="matrix(.92 -.41 .79 .38 55 96)" strokeLinejoin="round">
        <rect x="0" y="8" width="146" height="72" rx="10" fill="#252039" stroke="#9385b6" strokeWidth="2" />
        <rect width="146" height="72" rx="10" fill="#3c3553" stroke="#d3c9e6" strokeWidth="2" />
        {opened ? (
          <>
            <rect x="7" y="8" width="86" height="56" rx="5" fill="#282335" stroke="#9d8eb3" />
            <path d="M17 47h31m-31 4h20m58-40h37v49H96m8-41h18v20h-18z" stroke="#c0b0dc" />
            <path d="M108 44v8h16v-8m-28 9h6m-6 4h6" stroke="#c0b0dc" />
          </>
        ) : (
          <>
            <rect x="5" y="4" width="136" height="64" rx="7" fill="#252235" stroke="#8b819e" />
            <path d="M12 29v14" stroke="#ab9bc3" strokeWidth="2.5" strokeLinecap="round" />
            {phase === "pickup" ? <path d="m58 36 11 11 24-24" stroke="#a3dfc5" strokeWidth="4" /> : <path d="m43 54 36-36m-23 36 36-36" stroke="#a696c0" opacity=".58" />}
          </>
        )}
      </g>
      {opened ? (
        <>
          <path d="M57 65v31m131-90v31m56-4v31m-131 28v31" stroke="#b8a9d2" opacity=".6" strokeDasharray="2 5" />
          <g transform="matrix(.92 -.41 .79 .38 55 65)" stroke="#d8cce8">
            <rect width="146" height="72" rx="9" fill="#413a54" />
            <rect x="4" y="4" width="138" height="64" rx="7" fill="#544864" />
            <path d="m55 55 35-35m-18 35 35-35" opacity=".6" />
          </g>
        </>
      ) : null}
      {phase === "intake" ? (
        <g transform="translate(190 82) rotate(-12)">
          <path d="M2 10C-14-9-22-1-25 4" stroke="#b6abc4" />
          <path d="m0 8 10-8h40v24H10L0 16Z" fill="#d8cfe6" />
          <circle cx="8" cy="12" r="2" fill="#332c43" />
          <path d="M17 9h24m-24 6h17" stroke="#655773" strokeWidth="2" />
        </g>
      ) : null}
    </svg>
  );
}
