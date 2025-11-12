import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client | null = null;
  private connected$ = new BehaviorSubject<boolean>(false);
  private subscriptions: Map<string, StompSubscription> = new Map();

  get isConnected$(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  /**
   * Connect to WebSocket server
   */
  connect(userId: string): void {
    if (this.client?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const token = localStorage.getItem(environment.jwt.tokenKey);
    const tenantId = localStorage.getItem(environment.tenant.storageKey);

    this.client = new Client({
      webSocketFactory: () => new SockJS(environment.webSocket.url),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-ID': tenantId || '',
        'userId': userId
      },
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket Connected');
        this.connected$.next(true);
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected');
        this.connected$.next(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      }
    });

    this.client.activate();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.connected$.next(false);
    }
  }

  /**
   * Subscribe to a topic
   */
  subscribe(destination: string, callback: (message: any) => void): void {
    if (!this.client?.connected) {
      console.warn('WebSocket not connected. Cannot subscribe to:', destination);
      return;
    }

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const payload = JSON.parse(message.body);
        callback(payload);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
  }

  /**
   * Unsubscribe from a topic
   */
  unsubscribe(destination: string): void {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  /**
   * Send message to server
   */
  send(destination: string, body: any): void {
    if (!this.client?.connected) {
      console.warn('WebSocket not connected. Cannot send message to:', destination);
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body)
    });
  }

  /**
   * Subscribe to user-specific queue
   */
  subscribeToUserQueue(userId: string, callback: (message: any) => void): void {
    this.subscribe(`${environment.webSocket.topics.userQueue}/messages`, callback);
  }

  /**
   * Subscribe to presence updates
   */
  subscribeToPresence(callback: (presence: any) => void): void {
    this.subscribe(environment.webSocket.topics.presence, callback);
  }
}
