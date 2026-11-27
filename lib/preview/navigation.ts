const PREVIEW_ROOT = "/design-preview";

export function previewHref(href: string) {
  const queryAt = href.indexOf("?");
  const pathname = queryAt < 0 ? href : href.slice(0, queryAt);
  const query = queryAt < 0 ? "" : href.slice(queryAt);
  const previewPath = pathname === "/" ? `${PREVIEW_ROOT}/workspace` : `${PREVIEW_ROOT}${pathname}`;

  return `${previewPath}${query}`;
}

export function previewPathname(pathname: string) {
  if (!pathname.startsWith(`${PREVIEW_ROOT}/`)) return pathname;

  const route = pathname.slice(PREVIEW_ROOT.length);
  return route === "/workspace" ? "/" : route;
}
