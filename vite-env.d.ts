/// <reference types="vite/client" />

// Vite environment variables injected via defineConfig
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GEMINI_API_KEY: string;
      API_KEY: string;
    }
  }

  var process: {
    env: {
      GEMINI_API_KEY: string;
      API_KEY: string;
    };
  };
}

// Alternative: Use import.meta.env (Vite's standard way)
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
