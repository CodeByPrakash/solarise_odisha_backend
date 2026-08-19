import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0', // Expose to LAN / Wi-Fi network
    port: 5173,
  },
});
