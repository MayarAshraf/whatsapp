import { Injectable } from '@angular/core';

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

export interface WSMessageEnvelope {
  channel: string;
  event: string;
  data: string | object; // can be JSON string or object
}

@Injectable({ providedIn: 'root' })
export class HandleSocketActionsService {
  dispatch(envelope: WSMessageEnvelope) {
    if (typeof envelope.data !== 'string') return;

    try {
      const parsed: WSParsedData = JSON.parse(envelope.data);
      const message = parsed?.message;

      if (!message || !message.command) return;

      // switch (message.command) {
      //   case WS_COMMANDS.CACHE_INVALIDATION:
      //     this.#handleCacheInvalidation(message.data);
      //     break;

      //   case WS_COMMANDS.BANNER_MESSAGE:
      //     this.#handleBannerMessage(message.data);
      //     break;

      //   case WS_COMMANDS.NEW_DUPLICATE:
      //     this.#handleNewDuplicate();
      //     break;
      // }
    } catch (err) {
      console.error('WebSocket: failed to parse data', envelope.data, err);
    }
  }
}
