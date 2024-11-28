// electron.vite.config.ts
import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
var electron_vite_config_default = defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
        build: {
            copyPublicDir: true
        }
    },
    preload: {
        plugins: [externalizeDepsPlugin()]
    },
    renderer: {
        resolve: {
            alias: {
                '@renderer': resolve('src/renderer/src')
            }
        },
        build: {
            rollupOptions: {
                input: resolve(path.join('src', 'renderer', 'index.html'))
            },
            outDir: path.join('out', 'renderer')
        },
        plugins: [react()]
    }
});
export { electron_vite_config_default as default };
