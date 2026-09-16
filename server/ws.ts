import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export interface WsEvent {
  type: string;
  payload: any;
  timestamp: string;
}

class WebSocketHub {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  public init(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      console.log(`[WebSocket] Client connected. Total active: ${this.clients.size}`);

      // Send initial welcome & ping
      ws.send(
        JSON.stringify({
          type: 'CONNECTED',
          payload: { message: 'RestoFlow Real-Time KDS & Floor Sync Connected' },
          timestamp: new Date().toISOString(),
        })
      );

      ws.on('message', (message: string) => {
        try {
          const parsed = JSON.parse(message.toString());
          if (parsed.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
          }
        } catch {
          // ignore non-JSON messages
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`[WebSocket] Client disconnected. Total active: ${this.clients.size}`);
      });

      ws.on('error', (err) => {
        console.error('[WebSocket] Socket error:', err);
        this.clients.delete(ws);
      });
    });
  }

  public broadcast(type: string, payload: any) {
    const event: WsEvent = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };
    const message = JSON.stringify(event);

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

export const wsHub = new WebSocketHub();
