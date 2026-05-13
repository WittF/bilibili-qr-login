import { existsSync } from 'fs';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { app } from './app';
import { initProxy } from './proxy';

app.get('*', serveStatic({ root: './dist/static' }));
initProxy();

const port = Number(process.env.PORT) || 3000;
const isDebugMode = process.env.DEBUG === '1' || process.env.DEBUG === 'true';
const isDevelopment = process.env.NODE_ENV === 'development';
const hasStaticFiles = existsSync('./dist/static');

serve(
  {
    fetch: app.fetch,
    port,
  },
  () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 哔哩哔哩QR登录服务启动成功');
    console.log('='.repeat(50));

    if (!hasStaticFiles) {
      console.log('⚠️  警告: 静态文件未找到！');
      console.log('📦 请先运行构建命令: npm run build');
      console.log('🌐 构建完成后访问: http://localhost:' + port);
    } else {
      console.log(`🌐 访问地址: http://localhost:${port}`);
    }

    console.log(`🔧 运行环境: ${isDevelopment ? '开发模式' : '生产模式'}`);
    console.log(`📊 调试模式: ${isDebugMode ? '开启 (展示详细日志)' : '关闭 (仅展示重要日志)'}`);
    console.log(`📁 项目地址: https://github.com/WittF/bilibili-qr-login`);
    console.log('-'.repeat(50));

    if (!hasStaticFiles) {
      console.log('💡 完整启动步骤:');
      console.log('   1. npm install        # 安装依赖');
      console.log('   2. npm run build      # 构建项目');
      console.log('   3. npm run preview    # 启动服务');
      console.log('');
      console.log('💡 开发模式: npm run dev (前端热重载)');
    } else {
      if (!isDebugMode) {
        console.log('💡 提示: 设置环境变量 DEBUG=1 可开启详细日志');
      } else {
        console.log('💡 详细日志已开启，包含所有请求和响应信息');
      }
    }

    console.log('💡 按 Ctrl+C 停止服务');
    console.log('='.repeat(50) + '\n');
  },
);
