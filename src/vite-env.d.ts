/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_IP: string;
  // add more env variables here later if you need them!
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}