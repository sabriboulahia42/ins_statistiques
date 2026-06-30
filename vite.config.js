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
      'react-native': 'react-native-web', // Keep your existing alias
      '@': path.resolve(__dirname, './src'), // Add the @ alias here
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
  }
});