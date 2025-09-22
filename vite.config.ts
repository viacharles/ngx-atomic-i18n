import { defineConfig } from 'vite';
import { resolve } from 'path';
import angular from '@analogjs/vite-plugin-angular';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    angular({
      tsconfig: './tsconfig.app.json',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'ngx-atomic-i18n': resolve(__dirname, './projects/ngx-atomic-i18n/src/public-api.ts'),
    },
  },
  server: {
    port: 4200,
    host: 'localhost',
    fs: {
      strict: false,
      allow: ['..'],
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist/demo-app',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      external: [
        'node:path',
        'node:fs'
      ],
    },
  },
  optimizeDeps: {
    include: ['@angular/common', '@angular/core'],
  },
});
