import { readFileSync } from 'fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';
import { startApiServer } from './server/utils';

// 读取package.json获取版本号
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'serve') startApiServer();
  return {
    plugins: [vue(), svgLoader()],
    server: {
      proxy: {
        '/api': 'http://127.0.0.1:3000',
      },
    },
    build: {
      outDir: 'dist/static',
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue'],
            qrcode: ['@chenfengyuan/vue-qrcode', 'qrcode'],
          },
        },
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
        },
      },
    },
    define: {
      __TRUST_ORIGIN__: JSON.stringify(process.env.TRUST_ORIGIN || (mode === 'development' ? '*' : '')),
      __APP_VERSION__: JSON.stringify(packageJson.version),
    },
  };
});
