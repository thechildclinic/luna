import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
      // Define environment variables for the client bundle
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },

      // Path resolution
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },

      // Build configuration optimized for production
      build: {
        // Output directory (default is 'dist')
        outDir: 'dist',

        // Generate source maps for debugging in production
        sourcemap: mode === 'development',

        // Optimize bundle size
        minify: 'terser',

        // Configure chunk splitting for better caching
        rollupOptions: {
          output: {
            manualChunks: {
              // Separate vendor chunks for better caching
              'react-vendor': ['react', 'react-dom'],
              'google-genai': ['@google/genai']
            }
          }
        },

        // Asset handling
        assetsDir: 'assets',

        // Ensure service worker and manifest are copied to output
        copyPublicDir: true
      },

      // Development server configuration
      server: {
        port: 3000,
        host: true, // Allow external connections
        open: true  // Open browser on start
      },

      // Preview server configuration (for testing production build)
      preview: {
        port: 3000,
        host: true
      },

      // Public base path - adjust if deploying to a subdirectory
      base: '/',

      // Ensure proper handling of public files
      publicDir: 'public'
    };
});
