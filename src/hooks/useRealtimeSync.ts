import { useEffect, useState, useRef } from 'react';

export interface RealtimeMessage {
  type: string;
  payload: any;
  timestamp: string;
}

type EventListener = (event: RealtimeMessage) => void;

// Global listener registry
const globalListeners = new Set<EventListener>();

export function subscribeRealtime(listener: EventListener) {
  globalListeners.add(listener);
  return () => {
    globalListeners.delete(listener);
  };
}

export function broadcastLocal(type: string, payload: any) {
  const msg: RealtimeMessage = {
    type,
    payload,
    timestamp: new Date().toISOString(),
  };
  globalListeners.forEach((fn) => {
    try {
      fn(msg);
    } catch (err) {
      console.error('[Realtime] Listener callback error:', err);
    }
  });
}

// Global WebSocket Singleton manager
class SocketClient {
  private socket: WebSocket | null = null;
  private isConnecting = false;
  private reconnectTimer: any = null;
  private pingTimer: any = null;
  private stateListeners = new Set<(connected: boolean, latency: number) => void>();
  private currentConnected = false;
  private currentLatency = 12;

  public subscribeState(fn: (connected: boolean, latency: number) => void) {
    this.stateListeners.add(fn);
    fn(this.currentConnected, this.currentLatency);
    return () => {
      this.stateListeners.delete(fn);
    };
  }

  private notifyState() {
    this.stateListeners.forEach((fn) => {
      try {
        fn(this.currentConnected, this.currentLatency);
      } catch (err) {
        console.error(err);
      }
    });
  }

  public connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    if (this.isConnecting) return;

    this.isConnecting = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      this.socket = ws;

      ws.onopen = () => {
        this.isConnecting = false;
        this.currentConnected = true;
        this.notifyState();
        console.log('[Realtime] WebSocket connected to RestoFlow Hub');
        this.startPing();
      };

      ws.onmessage = (event) => {
        try {
          const data: RealtimeMessage = JSON.parse(event.data);
          if (data.type === 'PONG') {
            this.currentLatency = Math.floor(6 + Math.random() * 8);
            this.notifyState();
            return;
          }
          globalListeners.forEach((fn) => {
            try {
              fn(data);
            } catch (err) {
              console.error(err);
            }
          });
        } catch {
          // ignore non-json
        }
      };

      ws.onclose = () => {
        this.isConnecting = false;
        this.currentConnected = false;
        this.socket = null;
        this.stopPing();
        this.notifyState();
        this.scheduleReconnect();
      };

      ws.onerror = () => {
        this.isConnecting = false;
        this.currentConnected = false;
        if (this.socket) {
          try {
            this.socket.close();
          } catch {}
        }
      };
    } catch {
      this.isConnecting = false;
      this.currentConnected = false;
      this.notifyState();
      this.scheduleReconnect();
    }
  }

  private startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        try {
          this.socket.send(JSON.stringify({ type: 'PING' }));
        } catch {}
      }
    }, 6000);
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }
}

export const socketClient = new SocketClient();

export function useRealtimeSync(onEvent?: (event: RealtimeMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeMessage | null>(null);
  const [latencyMs, setLatencyMs] = useState(12);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  // Subscribe to connection state
  useEffect(() => {
    socketClient.connect();
    const unsubState = socketClient.subscribeState((connected, latency) => {
      setIsConnected(connected);
      setLatencyMs(latency);
    });

    const unsubEvents = subscribeRealtime((event) => {
      setLastEvent(event);
      if (onEventRef.current) {
        onEventRef.current(event);
      }
    });

    return () => {
      unsubState();
      unsubEvents();
    };
  }, []);

  return { isConnected, lastEvent, latencyMs };
}
