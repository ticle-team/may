import { appRouter } from './routers';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';
import { createContext } from '@/server/context';
import { loadEnvConfig } from '@next/env';

const projectDir = process.cwd();
process.env = { ...loadEnvConfig(projectDir).combinedEnv, ...process.env };

const wss = new WebSocketServer({
  host: '0.0.0.0',
  port: parseInt(process.env.PORT || '3001'),
});
const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext: createContext,
  onError: (opts) => {
    console.error('Error', opts.error);
  },
});

wss.on('connection', (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once('close', () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});
console.log('✅ WebSocket Server listening on ws://0.0.0.0:3001');

process.on('SIGTERM', () => {
  console.log('SIGTERM');
  handler.broadcastReconnectNotification();
  wss.close();
});
