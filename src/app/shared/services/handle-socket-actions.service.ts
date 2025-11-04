import { Injectable, signal } from '@angular/core';

enum WS_COMMANDS {
  CACHE_INVALIDATION = 'cache-invalidation',
  BANNER_MESSAGE = 'banner-message',
  NEW_DUPLICATE = 'new-duplicate',
}

interface CacheInvalidationMessage {
  command: WS_COMMANDS.CACHE_INVALIDATION;
  data: {
    listKey: string;
  };
}

interface BannerMessage {
  command: WS_COMMANDS.BANNER_MESSAGE;
  data: {
    action: string;
    message: string;
  };
}

interface NewDuplicateMessage {
  command: WS_COMMANDS.NEW_DUPLICATE;
  data: null;
}

type WSInnerMessage =
  | CacheInvalidationMessage
  | BannerMessage
  | NewDuplicateMessage;

interface WSParsedData {
  message: WSInnerMessage;
  host: string;
  subdomain: string;
}
interface Message {
  id?: number;
  message_id: number;
  sender_id?: number;
  receiver_id: number;
  message: string;
  created_at: string;
  read_at?: string;
  isOptimistic?: boolean;
  direction?: string;
  conversation_id: number;
}
export interface WSMessageEnvelope {
  channel: string;
  event: string;
  data: string | object; // can be JSON string or object
}

@Injectable({ providedIn: 'root' })
export class HandleSocketActionsService {
  message = signal<Message | any>(null);

  dispatch(envelope: WSMessageEnvelope) {
    if (typeof envelope.data !== 'string') return;

    try {
      const parsed: WSParsedData = JSON.parse(envelope.data);
      const message = parsed;
      this.message.set(message);
      if (!message) return;
    } catch (err) {
      console.error('WebSocket: failed to parse data', envelope.data, err);
    }
  }
}
