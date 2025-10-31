import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

// Library build config for browser consumption
export default defineConfig({
  plugins: [svelte({
    compilerOptions: {
      customElement: false,
      dev: true  // Include debug info
    },
    emitCss: false
  })],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': {}
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/lib/FundingSimulator.svelte'),
      name: 'FundingSimulator',
      formats: ['es'],
      fileName: () => 'funding-simulator.js'
    },
    minify: false,  // Disable minification
    sourcemap: true,  // Generate sourcemaps
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true,
        sourcemap: true  // Ensure sourcemap in output
      }
    },
    outDir: 'dist-lib',
    cssCodeSplit: false
  },
  resolve: {
    alias: {
      '$lib': path.resolve(__dirname, './src/lib'),
      '$lib/*': path.resolve(__dirname, './src/lib/*'),
      '$app/environment': path.resolve(__dirname, './src/lib/stubs/app-environment.js'),
      '$app/navigation': path.resolve(__dirname, './src/lib/stubs/app-navigation.js')
    }
  }
});