import { defineConfig } from 'vite';

export default defineConfig({
    base: '/endangered-globe/',
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true
    }
});
