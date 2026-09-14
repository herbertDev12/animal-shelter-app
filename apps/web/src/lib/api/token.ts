const TOKEN_COOKIE =
  import.meta.env.VITE_PUBLIC_TOKEN_COOKIE_NAME ?? "animal_shelter_token";

const DEFAULT_MAX_AGE = 60 * 60 * 24;

const parsedMaxAge = Number(import.meta.env.VITE_PUBLIC_TOKEN_MAX_AGE);
const MAX_AGE =
  Number.isFinite(parsedMaxAge) && parsedMaxAge > 0
    ? parsedMaxAge
    : DEFAULT_MAX_AGE;

export function getToken(): string | null {
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${TOKEN_COOKIE}=`));

  if (!match) return null;

  try {
    const value = decodeURIComponent(match.slice(TOKEN_COOKIE.length + 1));
    return value.length > 0 ? value : null;
  } catch {
    clearToken();
    return null;
  }
}

export function setToken(token: string): void {
  const attributes = [
    `${TOKEN_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${MAX_AGE}`,
    "SameSite=Strict",
  ];

  if (window.location.protocol === "https:") attributes.push("Secure");

  document.cookie = attributes.join("; ");
}

export function clearToken(): void {
  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Strict`;
}
