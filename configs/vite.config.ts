import {join, resolve} from 'path';
import {defineConfig} from 'virmator/dist/compiled-base-configs/base-vite';

export default defineConfig(
    {
        forGitHubPages: true,
        packageDirPath: resolve(__dirname, '..'),
    },
    (baseConfig, basePaths) => {
        return {
            ...baseConfig,
            build: {
                outDir: join(basePaths.cwd, 'dist-frontend'),
            },
        };
    },
);
