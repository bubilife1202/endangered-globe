import { defineConfig } from 'vite';

export default defineConfig({
    base: '/',
    server: {
        port: 3000,
        open: true
    },
    preview: {
        port: 4173,
        open: true
    },
    build: {
        target: 'es2015',
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: false, // Keep console for debugging
                drop_debugger: true,
                pure_funcs: ['console.debug']
            }
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    'three': ['three'],
                    'three-addons': [
                        'three/addons/controls/OrbitControls.js',
                        'three/addons/renderers/CSS2DRenderer.js'
                    ]
                }
            }
        },
        chunkSizeWarningLimit: 600
    }
});
