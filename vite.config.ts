import {reactRouter} from "@react-router/dev/vite"
import autoprefixer from "autoprefixer"
import {defineConfig, loadEnv} from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import postcssPresetMantine from "postcss-preset-mantine"

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), "")
  const PORT = env.PORT || process.env.PORT || "8080"

  return {
    css: {
      postcss: {
        plugins: [postcssPresetMantine(), autoprefixer],
      },
    },
    plugins: [reactRouter(), tsconfigPaths()],
    server: {
      port: parseInt(PORT),
    },
  }
})
