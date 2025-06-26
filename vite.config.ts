import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// IMPORTANT: Do NOT hardcode sensitive API keys directly here if this file is committed to a public repository.
// For production, use environment variables loaded outside of the client-side bundle.
// This approach exposes them to the client-side JavaScript bundle.
const VITE_CLIENT_ID = "gY4W8HgfoKLPPj_itX7oqY8XlIa";
const VITE_CLIENT_SECRET = "jB34ClQIza3ZkxfSbUkic8hVDgsa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    'import.meta.env.VITE_CLIENT_ID': JSON.stringify(VITE_CLIENT_ID),
    'import.meta.env.VITE_CLIENT_SECRET': JSON.stringify(VITE_CLIENT_SECRET),
  },
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://api.qa.bltelecoms.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api-split': {
        target: 'https://api.qa.bluelabeltelecoms.co.za',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-split/, ''),
      },
      '/v2': {
        target: 'https://api.qa.bltelecoms.net',
        changeOrigin: true,
        secure: false,
      },
      '/token': {
        target: 'https://api.qa.bluelabeltelecoms.co.za',
        changeOrigin: true,
        secure: false,
        ws: false,
        rewrite: (path) => path.replace(/^\/token/, '/token'),
      },
      '/voucher-balance-proxy': {
        target: 'https://api.qa.bltelecoms.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/voucher-balance-proxy/, ''),
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
