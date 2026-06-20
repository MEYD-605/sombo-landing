// @ts-check
import { defineConfig } from "astro/config"
import cloudflare from "@astrojs/cloudflare"
import react from "@astrojs/react"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import tailwindcss from "@tailwindcss/vite"
import { execFileSync } from "node:child_process"

const commitHash = execFileSync("git", ["rev-parse", "--short", "HEAD"]).toString().trim()
const branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"]).toString().trim()
const buildDate = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC"

export default defineConfig({
  site: "https://sombo.buildwithoracle.com",
  output: "static",
  adapter: cloudflare(),
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    define: {
      __COMMIT_HASH__: JSON.stringify(commitHash),
      __BRANCH__: JSON.stringify(branch),
      __BUILD_DATE__: JSON.stringify(buildDate),
    },
  },
})
