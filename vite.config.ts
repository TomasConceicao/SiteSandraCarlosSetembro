import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gscCode = (env.VITE_GSC_VERIFICATION || process.env.VITE_GSC_VERIFICATION || '').trim();

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'html-gsc-transform',
        transformIndexHtml(html) {
          if (gscCode && !gscCode.startsWith('%')) {
            return html.replace(
              '<!-- VITE_GSC_META_PLACEHOLDER -->',
              `<meta name="google-site-verification" content="${gscCode}" />`
            );
          }
          return html.replace('<!-- VITE_GSC_META_PLACEHOLDER -->', '');
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
