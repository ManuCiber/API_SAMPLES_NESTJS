import { defineConfig } from 'vitest/config';
import path from 'path';
export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
    },
    resolve: {
        alias: {
            '@config': path.resolve(__dirname, './src/config'),
            '@controllers': path.resolve(__dirname, './src/controllers'),
            '@middleware': path.resolve(__dirname, './src/middleware'),
            '@models': path.resolve(__dirname, './src/models'),
            '@routes': path.resolve(__dirname, './src/routes'),
            '@services': path.resolve(__dirname, './src/services'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@server': path.resolve(__dirname, './src/server'),
            '@lib': path.resolve(__dirname, './src/lib'),
            '@schemas': path.resolve(__dirname, './src/schemas'),
            '@generated': path.resolve(__dirname, './src/generated'),
        },
    },
});
