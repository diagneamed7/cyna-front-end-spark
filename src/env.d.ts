/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENV: string
  readonly VITE_DEBUG: string       // vrai/false stocké en tant que string
  readonly VITE_MEDIA_BASE_URL: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_DEFAULT_PAGE_SIZE: string   // on le convertira en nombre au runtime
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
