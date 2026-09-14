/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_API_URL: string;
  readonly VITE_PUBLIC_TOKEN_COOKIE_NAME?: string;
  readonly VITE_PUBLIC_TOKEN_MAX_AGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
