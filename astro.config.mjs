import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

export default defineConfig({
    adapter: vercel(),
    vite: {
        minify: false
    },
    output: "server"
});
