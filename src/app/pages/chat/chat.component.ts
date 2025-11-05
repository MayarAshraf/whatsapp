import { DatePipe, NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  model,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import Pusher from 'pusher-js';
import { finalize, map, tap } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { ApiService } from 'src/app/shared/services/global-services/api.service';
import { SoundsService } from 'src/app/shared/services/sounds.service';

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
  from?: string;
  type?: string;
}
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    BadgeModule,
    DatePipe,
    NgStyle,
    SkeletonModule,
    ButtonModule,
    TextareaModule,
    PickerComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChatComponent implements OnInit, OnDestroy {
  #api = inject(ApiService);
  #authService = inject(AuthService);
  #destroyRef = inject(DestroyRef);
  #sounds = inject(SoundsService);
  #ws = new WebSocket('wss://8xrespond.com:8443/app/8xmeb');

  currentUser = this.#authService.currentUser;

  messageInput = viewChild<ElementRef>('messageInput');

  selectedUser = model<any>(null);
  combinedMessages = computed(() => this.messages());
  allUsers = signal<any>([]);
  messages = signal<Message[]>([]);
  newMessage = signal('');
  channelName = signal('');
  searchTerm = signal('');
  usersLoading = signal(true);
  messagesLoading = model(false);
  typingUsers = signal<{ [userId: number]: boolean }>({});
  conversationId = signal(2);
  showEmojiPicker = signal(false);

  messagesContainer = viewChild<ElementRef>('messagesContainer');

  hostname = window.location.hostname;
  #rawSubdomain = this.hostname.split('.8xrespond.com')[0];
  subdomain = this.hostname === 'localhost' ? '8x-test' : this.#rawSubdomain;

  pusher: any;
  channel: any;

  filteredUsers = computed(() =>
    this.allUsers().filter((user: any) =>
      user.sender_name.toLowerCase().includes(this.searchTerm().toLowerCase())
    )
  );

  scrollToBottom(): void {
    setTimeout(() => {
      const container = this.messagesContainer()?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  ngOnInit() {
    // Pusher.logToConsole = true;

    this.pusher = new Pusher('8xmeb', {
      cluster: 'mt1',
      wsHost: '8xrespond.com',
      wsPort: 8443,
      wssPort: 8443,
      forceTLS: true,
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
      authEndpoint: `https://${this.subdomain}.8xrespond.com/respond-websocket-backend/public/api/v1/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${this.#authService.accessToken()}`,
          Accept: 'application/json',
        },
      },
    });

    this.channelName.set(
      `private-tenant.${this.subdomain}.phone.${
        this.currentUser()?.whatsapp_number
      }`
    );
    this.channel = this.pusher.subscribe(this.channelName());
    this.bindChannelEvents();
  }

  ngOnDestroy() {
    if (this.channel) {
      this.pusher.unsubscribe(this.channelName());
    }
  }

  users$ = this.#api.request('post', 'conversations/conversations').pipe(
    finalize(() => this.usersLoading.set(false)),
    map(({ data }) => data),
    tap((data) => this.allUsers.set(data))
  );

  users = toSignal(this.users$, { initialValue: [] });

  selectUser(user: any) {
    this.messages.set([]);
    this.newMessage.set('');
    this.selectedUser.set(user);
    this.messagesLoading.set(true);
    this.getConversationHistory();

    setTimeout(() => {
      this.messageInput()?.nativeElement?.focus();
    }, 200);

    if (this.channel) {
      this.channel.unbind('MessageEvent');
      this.pusher.unsubscribe(this.channelName());
    }

    // this.markMessagesAsRead(user.id);
    this.channel = this.pusher.subscribe(this.channelName());
    this.bindChannelEvents();
  }

  getConversationHistory() {
    this.#api
      .request('post', 'conversations/conversation-history', {
        id: this.selectedUser().id,
      })
      .pipe(
        finalize(() => this.messagesLoading.set(false)),
        map(({ data }) => data.data.map((data: any) => ({ ...data.record }))),
        tap((data) => {
          this.messages.set(data);
          this.selectedUser().unread_count = 0;
          this.scrollToBottom();
        })
      )
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe();
  }

  onScroll() {
    const container = this.messagesContainer()?.nativeElement;
    if (container && container.scrollTop === 0 && !this.messagesLoading()) {
      this.getConversationHistory();
    }
  }
  markMessagesAsRead(conversation: any) {
    if (!conversation) return;
    this.channel?.trigger('message-seen', {
      conversation_id: conversation.id,
      user_id: this.currentUser()?.id,
    });
  }

  onEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendTypingEvent() {
    const el = this.messageInput()?.nativeElement;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  bindChannelEvents() {
    if (!this.channel) return;

    this.channel.bind('conversation-updated', (event: any) => {
      const conversationId = event.id;
      const usersCopy = [...this.allUsers()];
      const existingIndex = usersCopy.findIndex((u) => u.id === conversationId);

      if (existingIndex !== -1) {
        const updatedUser = { ...usersCopy[existingIndex], ...event };
        usersCopy.splice(existingIndex, 1);
        this.allUsers.set([updatedUser, ...usersCopy]);
      } else {
        this.allUsers.set([event, ...usersCopy]);
      }

      this.#sounds.playSound('messageReceived');
    });

    this.channel.bind('message-seen', (event: any) => {
      const readerId = event.reader_id;
      const readMessageIds = event.read_message_ids;

      if (this.selectedUser()?.id === readerId) {
        const updatedMessages = this.messages().map((message) => {
          if (readMessageIds.includes(message.id)) {
            return { ...message, read_at: new Date().toISOString() };
          }
          return message;
        });
        this.messages.set(updatedMessages);
      }
    });

    this.channel.bind('user-typing', (event: any) => {
      this.scrollToBottom();
      const senderId = event.sender_id;

      this.typingUsers.set({ ...this.typingUsers(), [senderId]: true });
      setTimeout(() => {
        const updated = { ...this.typingUsers() };
        delete updated[senderId];
        this.typingUsers.set(updated);
      }, 1000);
    });

    this.channel.bind('client-message', (event: any) => {
      const selected = this.selectedUser();
      if (!selected) return;

      if (event.conversation_id !== selected.id) return;

      this.messages.update((messages) =>
        messages.filter(
          (msg) => !msg.isOptimistic || msg.message !== event.message
        )
      );
      this.messages.update((messages) => [...messages, event]);
      this.scrollToBottom();
    });
  }

  sendMessage() {
    const content = this.newMessage().trim();
    if (!content) return;

    const selectedUser = this.selectedUser();
    if (!selectedUser) return;

    const optimisticMessage: Message = {
      message_id: Date.now(),
      sender_id: this.conversationId(),
      receiver_id: selectedUser.id,
      message: content,
      created_at: new Date().toISOString(),
      isOptimistic: true,
      from: this.currentUser()?.whatsapp_number,
      direction: 'outbound',
      type: 'text',
    };

    this.messages.update((messages) => [...messages, optimisticMessage]);
    this.scrollToBottom();
    this.newMessage.set('');

    this.#sounds.playSound('messageSent');
    this.updateConversation();

    this.channel?.trigger('client-message', {
      conversation_id: selectedUser.id,
      user_id: this.currentUser()?.id,
      message: content,
      type: 'text',
      created_at: new Date().toISOString(),
    });
  }
  updateConversation() {
    const usersCopy = [...this.allUsers()];
    const selectedUser = this.selectedUser();
    const lastMessage = this.messages().at(-1);

    if (!selectedUser || !lastMessage) return;

    const index = usersCopy.findIndex((u) => u.id === selectedUser.id);
    if (index > -1) {
      const [user] = usersCopy.splice(index, 1);

      const updatedUser = {
        ...user,
        last_message: {
          message: lastMessage.message,
          created_at: lastMessage.created_at,
        },
        last_message_at: lastMessage.created_at,
      };

      usersCopy.unshift(updatedUser);
      this.allUsers.set(usersCopy);
      this.selectedUser.set(updatedUser);
    }
  }

  toggleEmojiPicker() {
    this.showEmojiPicker.set(!this.showEmojiPicker());
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native;
    this.newMessage.set(this.newMessage() + emoji);
    this.showEmojiPicker.set(false);
  }
}
