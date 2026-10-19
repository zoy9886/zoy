import { defineConfig } from "vite";
export default defineConfig({
  root: "client",
  base: "/zoy/",
  resolve: { alias: { "/src": new URL("./src", import.meta.url).pathname } },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: new URL("./client/index.html", import.meta.url).pathname,
        legacy: new URL("./client/legacy.html", import.meta.url).pathname,
      },
    },
  },
});
