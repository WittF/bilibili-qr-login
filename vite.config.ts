import { execSync } from 'child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { defineConfig, type Plugin, type ViteDevServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';
import { startApiServer } from './server/utils';

// 读取package.json获取版本号
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

const getGitVersion = (): string | undefined => {
  try {
    const tag = execSync('git describe --tags --abbrev=0', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    return tag.replace(/^v/, '') || undefined;
  } catch {
    return undefined;
  }
};

const appVersion = process.env.APP_VERSION || getGitVersion() || packageJson.version;
const appBuildDate = process.env.APP_BUILD_DATE || new Date().toISOString().slice(0, 10);

const createSitemap = (lastModified: string) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">
  <url>
    <loc>https://login.bilibili.bi/</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <mobile:mobile/>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="https://login.bilibili.bi/?lang=zh-CN"/>
    <xhtml:link rel="alternate" hreflang="zh-TW" href="https://login.bilibili.bi/?lang=zh-TW"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://login.bilibili.bi/?lang=en"/>
    <xhtml:link rel="alternate" hreflang="ja" href="https://login.bilibili.bi/?lang=ja"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://login.bilibili.bi/"/>
  </url>
  <url>
    <loc>https://login.bilibili.bi/?mode=iframe</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <mobile:mobile/>
  </url>
  <url>
    <loc>https://login.bilibili.bi/?mode=window</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <mobile:mobile/>
  </url>
  <url>
    <loc>https://login.bilibili.bi/?lang=zh-CN</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <mobile:mobile/>
  </url>
  <url>
    <loc>https://login.bilibili.bi/?lang=zh-TW</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <mobile:mobile/>
  </url>
  <url>
    <loc>https://login.bilibili.bi/?lang=en</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <mobile:mobile/>
  </url>
  <url>
    <loc>https://login.bilibili.bi/?lang=ja</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <mobile:mobile/>
  </url>
</urlset>
`;

const appMetadataPlugin = (): Plugin => {
  let sitemapPath = resolve('dist/static/sitemap.xml');

  return {
    name: 'app-metadata',
    configResolved(config) {
      sitemapPath = resolve(config.root, config.build.outDir, 'sitemap.xml');
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== '/sitemap.xml') {
          next();
          return;
        }

        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.end(createSitemap(appBuildDate));
      });
    },
    transformIndexHtml(html) {
      return html.replace(/%APP_VERSION%/g, appVersion).replace(/%APP_BUILD_DATE%/g, appBuildDate);
    },
    writeBundle() {
      mkdirSync(dirname(sitemapPath), { recursive: true });
      writeFileSync(sitemapPath, createSitemap(appBuildDate));
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'serve') startApiServer();
  return {
    plugins: [vue(), svgLoader(), appMetadataPlugin()],
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
      __APP_VERSION__: JSON.stringify(appVersion),
    },
  };
});
