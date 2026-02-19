import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://localhost:3000";

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Proxy API requests to backend server
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@/app": path.resolve(__dirname, "./src/app"),
        "@/modules": path.resolve(__dirname, "./src/modules"),
        "@/shared": path.resolve(__dirname, "./src/shared"),
        "@/pages": path.resolve(__dirname, "./src/pages"),
        "@/assets": path.resolve(__dirname, "./src/assets"),
        "@/config": path.resolve(__dirname, "./src/config"),
        "@/contexts": path.resolve(__dirname, "./src/contexts"),
        "@/utils": path.resolve(__dirname, "./src/utils"),
      },
    },
  };
});
