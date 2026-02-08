import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Validate required environment variables in production
    if (mode === 'production' && !env.GEMINI_API_KEY) {
      console.warn('WARNING: GEMINI_API_KEY not set. AI features will not work.');
    }
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Only expose API key to client in a safe way
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        // Add app environment
        'process.env.APP_ENV': JSON.stringify(env.VITE_APP_ENV || mode),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Production build optimizations
        target: 'es2020',
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production',
            drop_debugger: mode === 'production',
          },
        },
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              'ui-vendor': ['recharts', 'lucide-react'],
            },
          },
        },
        // Source maps for production debugging (can be disabled)
        sourcemap: mode !== 'production',
      },
    };
});
