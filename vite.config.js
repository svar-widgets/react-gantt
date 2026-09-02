import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Check if we're building demos
  const isDemoBuild = process.env.BUILD_DEMOS === 'true';
  // Check if we're building full CSS
  const isFullCssBuild = process.env.BUILD_FULL_CSS === 'true';

  if (isDemoBuild) {
    // Demo build configuration - includes all dependencies
    return {
      plugins: [react()],
      base: './',
      build: {
        outDir: 'dist-demos',
        rollupOptions: {
          input: {
            main: resolve(__dirname, 'index.html'),
          },
        },
      },
    };
  }

  const rollupOptions = {
    output: {
      assetFileNames: 'index.css',
    },
    external: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
    ],
  };

  const rollupOptionsStrict = {
    ...rollupOptions,
    external: [
      ...rollupOptions.external,
      // the public build renames deps to the @svar-ui scope, so both must be external
      /^@svar\//,
      /^@svar-ui\//,
    ],
  };

  if (isFullCssBuild) {
    // Full CSS build configuration - includes base styles and component styles
    return {
      plugins: [react()],
      build: {
        outDir: 'dist-full',
        lib: {
          entry: resolve(__dirname, 'src/full-css.js'),
          fileName: 'index',
          formats: ['es'],
        },
        rollupOptions,
      },
    };
  }

  // Library build configuration (original)
  return {
    plugins: [react()],
    build: {
      sourcemap: true,
      lib: {
        //eslint-disable-next-line no-undef
        entry: resolve(__dirname, 'src/index.js'),
        fileName: (format) => (format === 'cjs' ? 'index.cjs' : 'index.es.js'),
        formats: ['es', 'cjs'],
      },
      rollupOptions: rollupOptionsStrict,
    },
  };
});
