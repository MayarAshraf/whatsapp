import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth/auth.service';
import {
  HandleSocketActionsService,
  WSMessageEnvelope,
} from './handle-socket-actions.service';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  #handleSocketActions = inject(HandleSocketActionsService);
  currentUser = {
    id: 1,
    first_name: '8x-test Admin',
    last_name: null,
    full_name: '8x-test Admin',
    username: null,
    email: 'info@8x.com',
    phone: null,
    job_title: null,
    email_verified: false,
    phone_verified: false,
    created_at: '2025-10-13 08:43:07',
    updated_at: '2025-10-13 10:33:13',
  };
  #isLoggedIn = signal(true);

  #ws: WebSocket | null = null;
  #pingInterval: number | null = null;
  #reconnectTimeout: number | null = null;

  // Constants
  readonly #RECONNECT_DELAY_MS = 3000; // 3s
  readonly #PING_INTERVAL_MS = 45000; // 45s
  readonly #NORMAL_CLOSURE_CODE = 1000; // 1s

  hostname = window.location.hostname;
  #rawSubdomain = this.hostname.split('.8xcrm.net')[0];
  subdomain = this.hostname === 'localhost' ? 'testing' : this.#rawSubdomain;

  connect(url: string) {
    if (this.#ws) this.disconnect(); // Prevent duplicate connections

    this.#ws = new WebSocket(url);

    this.#ws.onopen = () => {
      console.log('✅ WebSocket connected');

      const user = this.currentUser;

      this.#subscribe(`${this.subdomain}-8xcrm-com-client-messages`);

      if (user) {
        this.#subscribe(
          `${this.subdomain}-8xcrm-com-client-messages-user-${user.id}`
        );
        // this.#subscribe(
        //   `${this.subdomain}-8xcrm-com-client-messages-group-${user.group.id}`
        // );
      }

      this.#startPing();
    };

    this.#ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const msg: WSMessageEnvelope = JSON.parse(event.data);
        if (msg.event === 'pusher:pong') return;
        this.#handleSocketActions.dispatch(msg);
      } catch (err) {
        console.error('Invalid message format:', err);
      }
    };

    this.#ws.onerror = (err: Event) => {
      console.error('❌ WebSocket error', err);
    };

    this.#ws.onclose = (e: CloseEvent) => {
      // A WebSocket close with code 1006 typically indicates an abnormal closure, often due to network issues, server-side timeouts, or configuration problems.
      console.warn(`⚠️ WebSocket closed, code: ${e.code}, reason: ${e.reason}`);
      this.#ws = null;
      this.#stopPing();
      const shouldReconnect =
        this.#isLoggedIn() && e.code !== this.#NORMAL_CLOSURE_CODE;

      // handling reconnection when the socket drops
      if (shouldReconnect) {
        // Reconnect if user is still logged in and not manually closed
        this.#scheduleReconnect(url);
      }
    };
  }

  #subscribe(channel: string) {
    this.#send({ event: 'pusher:subscribe', data: { channel } });
  }

  #send(payload: unknown) {
    if (this.#ws?.readyState === WebSocket.OPEN) {
      this.#ws.send(JSON.stringify(payload));
    } else {
      console.warn('⚠️ WebSocket not open, cannot send', payload);
    }
  }

  #scheduleReconnect(url: string): void {
    this.#clearReconnect();
    this.#reconnectTimeout = window.setTimeout(() => {
      this.connect(url);
    }, this.#RECONNECT_DELAY_MS);
  }

  #clearReconnect(): void {
    if (this.#reconnectTimeout) {
      clearTimeout(this.#reconnectTimeout);
      this.#reconnectTimeout = null;
    }
  }

  #startPing() {
    // ping/pong mechanism to keep it alive.
    this.#stopPing();
    this.#pingInterval = window.setInterval(() => {
      this.#send({ event: 'pusher:ping' });
    }, this.#PING_INTERVAL_MS);
  }

  #stopPing() {
    if (this.#pingInterval) {
      clearInterval(this.#pingInterval);
      this.#pingInterval = null;
    }
  }

  disconnect() {
    this.#stopPing();
    this.#clearReconnect();

    if (this.#ws) {
      this.#ws.close(this.#NORMAL_CLOSURE_CODE, 'Client disconnected'); // Normal closure
      this.#ws = null;
    }
  }
}
