import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import apiApp from './api/index.ts';

const apiPort = Number(process.env.API_PORT || 3001);
const webPort = Number(process.env.PORT || 5173);
const apiServer = express();
apiServer.use(apiApp);

const apiListener = apiServer.listen(apiPort, '127.0.0.1', async () => {
  try {
    const vite = await createViteServer({
      configFile: './vite.config.ts',
      server: {
        host: '127.0.0.1',
        port: webPort,
        strictPort: true,
        proxy: {
          '/api': { target: `http://127.0.0.1:${apiPort}`, changeOrigin: true },
          '/r': { target: `http://127.0.0.1:${apiPort}`, changeOrigin: true },
        },
      },
    });
    await vite.listen();
    console.log(`LinkPulse frontend: http://127.0.0.1:${webPort}`);
    console.log(`LinkPulse API:      http://127.0.0.1:${apiPort}/api/health`);
  } catch (error) {
    console.error('Failed to start Vite:', error);
    apiListener.close();
    process.exit(1);
  }
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => apiListener.close(() => process.exit(0)));
}
