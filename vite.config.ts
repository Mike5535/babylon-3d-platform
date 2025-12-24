import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3001,
    host: 'localhost',
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          // Откуда берем файл
          src: 'node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm',
          // Куда кладем (относительно корня dist)
          dest: 'assets',
        },
      ],
    }),
    react(),
  ],
  base: './',
});
