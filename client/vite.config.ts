import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Same-origin API calls in the browser (/api/*) are proxied to the Express server in dev,
// so we don't need CORS on the server side.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
    },
  },
});
