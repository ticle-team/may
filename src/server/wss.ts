import { appRouter } from './routers';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({
  host: '0.0.0.0',
  port: parseInt(process.env.PORT || "3001"),
});
const handler = applyWSSHandler({
  wss,
  router: appRouter,
  onError: (opts) => {
    console.error('Error', opts.error);
  }
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