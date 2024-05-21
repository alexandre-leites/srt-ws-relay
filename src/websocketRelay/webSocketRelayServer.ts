import WebSocket from 'ws';
import http from 'http';
import config from '../../config';
import logger from '../utils/logger';

class WebSocketRelayServer {
  private server: http.Server;
  private wss: WebSocket.Server;
  private lastData: string | null;
  private lastSentTime: number;

  constructor() {
    this.server = http.createServer();
    this.wss = new WebSocket.Server({ server: this.server, path: config.websocketRelay.path });
    this.lastData = null;
    this.lastSentTime = 0;

    this.setupWebSocketConnection();
    this.startServer();
  }

  private setupWebSocketConnection(): void {
    this.wss.on('connection', (ws, req) => {
      const clientIp = req.socket.remoteAddress;
      const clientPort = req.socket.remotePort;
      logger.info(`WebSocket client connected from ${clientIp}:${clientPort}`);

      if (this.lastData) {
        ws.send(this.lastData);
      }
    });
  }

  private startServer(): void {
    this.server.listen(config.websocketRelay.port, () => {
      logger.info(`WebSocket server listening on port ${config.websocketRelay.port}`);
    });
  }

  public sendToClients(data: any): void {
    const formattedData = JSON.stringify(data);

    if (formattedData !== this.lastData || (Date.now() - this.lastSentTime) > 60000) {
      this.lastData = formattedData;
      this.lastSentTime = Date.now();
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(formattedData);
        }
      });
    }
  }
}

const webSocketRelayServer = new WebSocketRelayServer();
export default webSocketRelayServer;
