import { Client } from '@stomp/stompjs';

class StompService {
  constructor() {
    this.client = null;
    this.subscription = null;
    this.onMessageCallback = null;
    this.isConnected = false;
  }

  connect(token, onMessageReceived, onError) {
    if (this.client && this.client.active) {
      return;
    }

    // Compute ws/wss protocol relative to current host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    this.client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        // Uncomment for STOMP debugging if needed
        // console.log('[STOMP]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('Connected to WebSocket STOMP broker');
      this.isConnected = true;

      // Subscribe to user queue messages
      this.subscription = this.client.subscribe(
        '/user/queue/messages',
        (message) => {
          try {
            const body = JSON.parse(message.body);
            if (this.onMessageCallback) {
              this.onMessageCallback(body);
            }
          } catch (e) {
            console.error('Failed to parse STOMP message:', e);
          }
        }
      );
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP error:', frame.headers['message'], frame.body);
      this.isConnected = false;
      if (onError) {
        onError(frame.headers['message'] || 'WebSocket connection error');
      }
    };

    this.client.onWebSocketClose = () => {
      this.isConnected = false;
    };

    this.onMessageCallback = onMessageReceived;
    this.client.activate();
  }

  sendMessage(receiverId, content) {
    if (!this.client || !this.client.active) {
      throw new Error('WebSocket is not connected');
    }

    this.client.publish({
      destination: '/app/chat',
      body: JSON.stringify({
        receiverId: Number(receiverId),
        content,
      }),
    });
  }

  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.isConnected = false;
  }
}

export const stompService = new StompService();
