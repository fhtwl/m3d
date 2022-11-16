import { defineConfig } from "vite"
import path from "path"
import { version } from "./package.json"
import { createHtmlPlugin } from "vite-plugin-html"
import config from "./src/config"
import eslintPlugin from "vite-plugin-eslint"

function resolve(url: string): string {
  return path.resolve(__dirname, url)
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    eslintPlugin({
      include: ["src/**/*.ts", "src/**/*.json"],
    }),
    createHtmlPlugin({
      inject: {
        data: {
          title: config.title,
          description: config.description,
          version,
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve("./src"),
      "~@": resolve("./src"),
    },
    // 省略文件后缀
    extensions: [".js", ".ts", ".json", ".jsx"],
  },
  // 声明node变量
  define: {
    "process.env": {},
  },
  css: {
    preprocessorOptions: {
      less: {
        // 全局添加less
        additionalData: `@import '@/assets/styles/common/var.less';`,
        javascriptEnabled: true,
      },
    },
  },
  build: {
    outDir: "./dist",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    port: 8001,
    proxy: {
      "/api": {
        target: "http://1.116.40.155:9002/",
        ws: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api/v1"),
      },
      "/resource": {
        target: "https://static.fhtwl.cc",
        ws: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/resource/, ""),
      },
    },
  },
})
