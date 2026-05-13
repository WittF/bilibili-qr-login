import { serve } from '@hono/node-server';
import { app } from './app';
import { initProxy } from './proxy';

const port = Number(process.env.PORT) || 3000;
const isDebugMode = process.env.DEBUG === '1' || process.env.DEBUG === 'true';

initProxy();

serve(
  {
    fetch: app.fetch,
    port,
  },
  () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 哔哩哔哩QR登录 - API服务器启动成功');
    console.log('='.repeat(50));
    console.log(`🔌 API服务地址: http://localhost:${port}`);
    console.log(`🌐 前端页面地址: http://localhost:5173`);
    console.log(`🔧 运行环境: 开发模式 (热重载)`);
    console.log(`📊 调试模式: ${isDebugMode ? '开启 (展示详细日志)' : '关闭 (仅展示重要日志)'}`);
    console.log(`📁 项目地址: https://github.com/WittF/bilibili-qr-login`);
    console.log('-'.repeat(50));
    if (!isDebugMode) {
      console.log('💡 提示: 设置环境变量 DEBUG=1 可开启详细日志');
    } else {
      console.log('💡 详细日志已开启，包含所有请求和响应信息');
    }
    console.log('💡 请访问前端页面: http://localhost:5173');
    console.log('💡 API测试: http://localhost:5173/api/qr');
    console.log('💡 按 Ctrl+C 停止服务');
    console.log('='.repeat(50) + '\n');
  },
);
