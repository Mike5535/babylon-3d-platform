import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'public/runtime-template',
    emptyOutDir: false,
    lib: {
      entry: 'src/runtime/index.ts',
      formats: ['es'],
      fileName: () => 'runtime.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
