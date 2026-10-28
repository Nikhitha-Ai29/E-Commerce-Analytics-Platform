import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        configure(proxy) {
          proxy.on("error", (error, _request, response) => {
            console.error(`[api proxy] ${error.message}`);
            if (!response.headersSent && !response.writableEnded) {
              response.writeHead(502, { "Content-Type": "application/json" });
              response.end(JSON.stringify({
                message: "Backend API at http://127.0.0.1:8080 is unavailable. Start the backend and verify its Spanner configuration.",
              }));
            }
          });
        },
      },
    },
  },
});
