import {reactRouter} from "@react-router/dev/vite"
import autoprefixer from "autoprefixer"
import {defineConfig} from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import postcssPresetMantine from "postcss-preset-mantine"

export default defineConfig({
  css: {
    postcss: {
      plugins: [postcssPresetMantine(), autoprefixer],
    },
  },
  plugins: [reactRouter(), tsconfigPaths()],
})
