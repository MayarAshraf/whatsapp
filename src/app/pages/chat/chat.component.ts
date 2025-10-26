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
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import Pusher from 'pusher-js';
import { finalize, map, tap } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { ApiService } from 'src/app/shared/services/global-services/api.service';

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
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChatComponent implements OnInit, OnDestroy {
  #api = inject(ApiService);
  #authService = inject(AuthService);
  #destroyRef = inject(DestroyRef);
  #ws = new WebSocket('wss://8xrespond.com:8443/app/8xmeb');

  // currentUser = this.#authService.currentUser;
  currentUserId = 1;

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

  messagesContainer = viewChild<ElementRef>('messagesContainer');

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
    Pusher.logToConsole = true;

    this.pusher = new Pusher('8xmeb', {
      cluster: 'mt1',
      wsHost: '8xrespond.com',
      wsPort: 8443,
      wssPort: 8443,
      forceTLS: true,
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
      authEndpoint: 'https://8x-test.8xrespond.com/api/v1/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer 1|7Db4hKovsNdgzh5RpdXzvEGvuJkYkQpilvu7Uigt8d900808`,
          Accept: 'application/json',
        },
      },
    });
    this.#ws.onopen = () => {
      console.log('🔌 WebSocket connected');
    };

    this.#ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📩 Incoming WebSocket message:', data);

      if (data.event === 'server-confirm') {
        console.log('✅ Server confirmed message delivery', data.data);
      }

      if (data.event === 'new-message') {
        console.log('💬 New message from other client:', data.data);
      }
    };

    // this.#ws.connect();
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
    this.channelName.set(`private-conversation.${user.id}`);
    this.channel = this.pusher.subscribe(this.channelName());
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

  // getConversationHistory() {
  //   this.#api
  //     .request('post', 'conversations/conversation-history', {
  //       id: this.selectedUser().id,
  //     })
  //     .pipe(
  //       finalize(() => this.messagesLoading.set(false)),
  //       map(({ data }) => data.data.map((data: any) => ({ ...data.record }))),
  //       tap((data) => {
  //         this.messages.set(data);
  //         this.selectedUser().unread_count = 0;
  //         this.scrollToBottom();
  //       })
  //     )
  //     .pipe(takeUntilDestroyed(this.#destroyRef))
  //     .subscribe();
  // }
  pageSize = 20; // Number of messages per request
  currentStart = 0; // Offset for pagination
  hasMoreMessages = true; // Track if more messages are available

  getConversationHistory(reset: boolean = true) {
    if (reset) {
      this.currentStart = 0;
      this.hasMoreMessages = true;
      this.messages.set([]);
    }
    if (!this.hasMoreMessages) return;

    this.messagesLoading.set(true);
    this.#api
      .request('post', 'conversations/conversation-history', {
        id: this.selectedUser().id,
        // start: this.currentStart,
        // length: this.pageSize,
      })
      .pipe(
        finalize(() => this.messagesLoading.set(false)),
        map(({ data }) => data.data.map((data: any) => ({ ...data.record }))),
        tap((data) => {
          if (data.length < this.pageSize) this.hasMoreMessages = false;
          if (reset) {
            this.messages.set(data);
            this.scrollToBottom();
          } else {
            this.messages.set([...data, ...this.messages()]);
          }
          this.selectedUser().unread_count = 0;
          this.currentStart += data.length;
        })
      )
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe();
  }
  onScroll() {
    const container = this.messagesContainer()?.nativeElement;
    if (
      container &&
      container.scrollTop === 0 &&
      this.hasMoreMessages &&
      !this.messagesLoading()
    ) {
      this.getConversationHistory(false);
    }
  }
  // markMessagesAsRead(senderId: number | undefined) {
  //   this.#api
  //     .request('post', 'mark-as-read', {
  //       sender_id: senderId,
  //     })
  //     .pipe(
  //       tap(() => {
  //         this.allUsers.update((users) =>
  //           users.map((user: any) =>
  //             user.id === this.selectedUser().id
  //               ? { ...user, unread_message_count: 0 }
  //               : user
  //           )
  //         );
  //       }),
  //       takeUntilDestroyed(this.#destroyRef)
  //     )
  //     .subscribe();
  // }

  sendTypingEvent() {
    // this.#api
    //   .request('post', 'chat/typing', {
    //     receiver_id: this.selectedUser()?.id,
    //   })
    //   .pipe(takeUntilDestroyed(this.#destroyRef))
    //   .subscribe();
    const el = this.messageInput()?.nativeElement;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  bindChannelEvents() {
    if (!this.channel) return;

    this.channel.bind('ConversationUpdated', (event: any) => {
      const conversationId = event.id;
      const usersCopy = [...this.allUsers()];
      const existingIndex = usersCopy.findIndex((u) => u.id === conversationId);

      if (existingIndex !== -1) {
        const updatedUser = {
          ...event,
        };
        usersCopy.splice(existingIndex, 1);
        this.allUsers.set([updatedUser, ...usersCopy]);
      }
    });

    this.channel.bind('MessageEvent', (data: any) => {
      console.log('Incoming message:', data);

      const selected = this.selectedUser();
      if (!selected) return;

      if (data.conversation_id !== selected.id) return;

      this.messages.update((messages) =>
        messages.filter(
          (msg) => !msg.isOptimistic || msg.message !== data.message
        )
      );

      this.messages.update((messages) => [...messages, data]);
      this.scrollToBottom();
    });

    this.channel.bind('message-read', (event: any) => {
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
      console.log('Server broadcasted message', event);
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
      direction: 'outbound',
    };

    this.messages.update((messages) => [...messages, optimisticMessage]);
    this.scrollToBottom();
    this.newMessage.set('');

    const payload = {
      event: 'client-message',
      channel: 'private-conversation.4',
      subdomain: '8x-test.8xrespond.com',
      data: {
        conversation_id: selectedUser.id,
        user_id: this.currentUserId,
        message: content,
        type: 'text',
        created_at: new Date().toISOString(),
      },
    };

    if (this.#ws?.readyState === WebSocket.OPEN) {
      this.#ws.send(JSON.stringify(payload));
    }
  }
}
