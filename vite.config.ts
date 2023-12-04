import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactProfile',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        exports: "named",
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        assetFileNames: chunkInfo => {
          return chunkInfo.name || ''
        },
      },
    },
  },
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
    dts(),
  ],
})