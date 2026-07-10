import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; // Switched to SWC for better TS support
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Required for Tailwind v4
  ],
  resolve: {
    alias: {
      'react-native': path.resolve(__dirname, 'node_modules/react-native-web'),
      'react-native-web': path.resolve(__dirname, 'node_modules/react-native-web'),
      '@': path.resolve(__dirname, './src'),
      react: path.resolve(__dirname, 'node_modules/react'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
  },
});