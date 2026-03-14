import { io, Socket } from 'socket.io-client';

type EventCallback = (data: any) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private callbacks: Map<string, EventCallback[]> = new Map();
  private readonly LIVE_WS_URL = "https://ashwamitra-backend.onrender.com";
  private readonly LOCAL_WS_URL = "http://localhost:5000";
  private readonly wsUrl = (import.meta.env.VITE_WS_URL as string | undefined)?.trim() || "";
  private readonly wsCandidates = Array.from(
    new Set(
      [this.wsUrl, import.meta.env.DEV ? this.LOCAL_WS_URL : this.LIVE_WS_URL, import.meta.env.DEV ? this.LIVE_WS_URL : ""]
        .filter(Boolean)
    )
  );

  async connect(userId: string, userRole: string) {
    if (this.socket?.connected) {
      return;
    }

    let lastError: unknown = null;
    for (const url of this.wsCandidates) {
      try {
        await this._connectToUrl(url, userId, userRole);
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("Unable to connect to websocket server.");
  }

  private async _connectToUrl(url: string, userId: string, userRole: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(url, {
        auth: {
          userId,
          userRole
        },
        timeout: 5000 // 5 second timeout
      });

      this.socket.on('connect', () => {
        // Join rooms after connection
        this.socket?.emit('join-room', { userId, userRole });
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        reject(error);
      });

      this.registerSocketHandlers();
    });
  }

  private registerSocketHandlers() {
    if (!this.socket) return;
    this.socket.off('new-registration');
    this.socket.off('new-order');
    this.socket.off('order-status-update');
    this.socket.off('delivery-status-update');
    this.socket.off('new-product');
    this.socket.off('product-update');
    this.socket.off('payment-status-update');
    this.socket.off('wallet-update');

    this.socket.on('new-registration', (data) => this.emit('new-registration', data));
    this.socket.on('new-order', (data) => this.emit('new-order', data));
    this.socket.on('order-status-update', (data) => this.emit('order-status-update', data));
    this.socket.on('delivery-status-update', (data) => this.emit('delivery-status-update', data));
    this.socket.on('new-product', (data) => this.emit('new-product', data));
    this.socket.on('product-update', (data) => this.emit('product-update', data));
    this.socket.on('payment-status-update', (data) => this.emit('payment-status-update', data));
    this.socket.on('wallet-update', (data) => this.emit('wallet-update', data));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Subscribe to events
  on(event: string, callback: EventCallback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)?.push(callback);
  }

  // Unsubscribe from events
  off(event: string, callback: EventCallback) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit events to local callbacks
  private emit(event: string, data: any) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Send events to server
  send(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
