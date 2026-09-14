export const safeRedirect = (href: string | undefined): string | null =>
  href &&
  href.startsWith("/") &&
  !href.startsWith("//") &&
  !href.startsWith("/\\")
    ? href
    : null;
