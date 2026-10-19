import { defineConfig } from "vite";
export default defineConfig({
  root: "client",
  base: "/zoy/",
  resolve: { alias: { "/src": new URL("./src", import.meta.url).pathname } },
  build: { outDir: "../dist", emptyOutDir: true },
});
