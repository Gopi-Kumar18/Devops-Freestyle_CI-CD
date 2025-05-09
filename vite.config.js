import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  root: './frontend',
  build: {
    outDir: '../dist', 
    emptyOutDir: true
  },
  publicDir: './public', 
  plugins: [react()]
})