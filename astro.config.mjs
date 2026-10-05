import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const privateJaPreview = process.env.LOVESCAPE_PRIVATE_JA_PREVIEW === "local-only";

export default defineConfig({
  site: "https://lovescape.bond",
  output: "static",
  outDir: privateJaPreview ? "./dist/private-ja-preview" : "./dist/client",
  trailingSlash: "always",
  integrations: [sitemap()],
  build: { format: "directory" },
});
