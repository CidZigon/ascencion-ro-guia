import vinext from "vinext";
import { defineConfig } from "vite";
import { sites } from "./build/sites-vite-plugin";

// El sitio se compila para Cloudflare Workers mediante @cloudflare/vite-plugin.
// No usa base de datos ni almacenamiento de objetos: todos los catálogos se
// sirven como archivos estáticos desde `public/data/`.
const workerConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: [],
  r2_buckets: [],
};

export default defineConfig(async () => {
  // Mantiene el estado de Wrangler y Miniflare dentro del proyecto. Son ajustes
  // de herramientas, no secretos; la configuración de la aplicación va en
  // archivos `.env*`, que están ignorados por git.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler fija su ruta de logs al importar el plugin de Cloudflare.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: workerConfig,
      }),
    ],
  };
});
