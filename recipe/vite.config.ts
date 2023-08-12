import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import mkcert from "vite-plugin-mkcert";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), mkcert(), VitePWA({ registerType: "autoUpdate" })],
  server: {
    hmr: {
      host: "localhost",
    },
    watch: {
      usePolling: true,
    },
  },
});
