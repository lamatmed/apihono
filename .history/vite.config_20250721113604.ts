import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: 'src/app',
  plugins: [react()],
  build: {
    outDir: '../../public',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/app/index.tsx'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
}); 