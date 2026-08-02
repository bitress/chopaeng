import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
    server: {
        port: 3000,
    },
    resolve: {
        alias: {
            'react-helmet-async': path.resolve(__dirname, 'node_modules/react-helmet-async/lib/index.js')
        }
    },
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // React core — tiny, needed on every page
                    if (
                        id.includes('node_modules/react/') || 
                        id.includes('node_modules/react-dom/') ||
                        id.includes('node_modules/scheduler/') ||
                        id.includes('node_modules/object-assign/') ||
                        id.includes('node_modules/react-is/')
                    ) {
                        return 'vendor-react';
                    }
                    // Router
                    if (id.includes('node_modules/react-router')) {
                        return 'vendor-router';
                    }
                    // Simple-datatables (only used on Profile page)
                    if (id.includes('node_modules/simple-datatables')) {
                        return 'vendor-datatables';
                    }
                    // All other node_modules go into a shared vendor chunk
                    if (id.includes('node_modules/')) {
                        return 'vendor';
                    }
                },
            },
        },
    },
})

