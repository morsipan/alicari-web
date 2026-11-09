import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'rifa-history-rewrite',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url) {
            const [urlPath, query] = req.url.split('?');
            if (
              urlPath === '/rifa' ||
              urlPath.startsWith('/rifa/') ||
              urlPath === '/comprobante'
            ) {
              req.url = '/rifa.html' + (query ? `?${query}` : '');
            } else if (
              urlPath === '/labs' ||
              urlPath.startsWith('/labs/')
            ) {
              req.url = '/labs.html' + (query ? `?${query}` : '');
            }
          }
          next();
        });
      },
    },
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        labs: path.resolve(__dirname, 'labs.html'),
        labsIndex: path.resolve(__dirname, 'labs/index.html'),
        rifa: path.resolve(__dirname, 'rifa.html'),
        rifaGestion: path.resolve(__dirname, 'rifa/safe/gestion/index.html'),
        comprobante: path.resolve(__dirname, 'comprobante/index.html'),
        about: path.resolve(__dirname, 'about.html'),
        portfolio2027: path.resolve(__dirname, '2027/index.html'),
        portfolio2027b: path.resolve(__dirname, '2027b/index.html'),
        animate: path.resolve(__dirname, 'animate/index.html'),
        parishRobertson: path.resolve(__dirname, 'ParishRobertson/index.html'),
        parishRobertsonTriptico: path.resolve(__dirname, 'ParishRobertson/triptico.html'),
        vertical: path.resolve(__dirname, 'main-stage/vertical.html'),
        mainStage: path.resolve(__dirname, 'main-stage/index.html'),
      },
    },
  },
})
