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
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import Pusher from 'pusher-js';
import { catchError, finalize, map, of, tap } from 'rxjs';
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
  selector: 'app-web-chat',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    BadgeModule,
    DatePipe,
    NgStyle,
    SkeletonModule,
  ],
  templateUrl: './web-chat.component.html',
  styleUrl: './web-chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WebChatComponent implements OnInit, OnDestroy {
  #api = inject(ApiService);
  #authService = inject(AuthService);
  #destroyRef = inject(DestroyRef);

  // currentUser = this.#authService.currentUser;
  currentUserId = 1;

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
    this.pusher = new Pusher('6b7c7c9491ca172ce5d7', {
      cluster: 'mt1',
      authEndpoint: 'https://8x-test.8xrespond.com/api/v1/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer 1|WAFsyLOOWL44b6c6QxMoV5CUysFuYLT2PpqD2MP259458e0c`,
          Accept: 'application/json',
        },
      },
    });

    // this.channelName.set(`private-conversation.3`);
    // this.channel = this.pusher.subscribe(this.channelName());
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
    this.channelName.set(`private-conversation.${user.id}`);
    this.channel = this.pusher.subscribe(this.channelName());
    this.messagesLoading.set(true);
    this.getConversationHistory();

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
        start: this.currentStart,
        length: this.pageSize,
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
  }

  bindChannelEvents() {
    if (!this.channel) return;

    this.channel.bind('ConversationUpdated', (event: any) => {
      console.log('Incoming message:', event);

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
  }

  sendMessage() {
    const content = this.newMessage().trim();
    if (!content) return;

    const selectedUser = this.selectedUser();
    if (!selectedUser) return;

    const optimisticMessage: Message = {
      message_id: Date.now(),
      // sender_id: this.conversationId()!,
      receiver_id: selectedUser.id,
      message: content,
      created_at: new Date().toISOString(),
      isOptimistic: true,
      direction: 'outbound',
    };

    this.messages.update((messages) => [...messages, optimisticMessage]);
    this.scrollToBottom();
    this.newMessage.set('');

    this.#api
      .request('post', 'conversations/reply', {
        message: content,
        type: 'text',
        conversation_id: selectedUser.id,
      })
      .pipe(
        catchError((error) => {
          this.messages.update((messages) =>
            messages.filter(
              (msg) => !msg.isOptimistic || msg.message !== content
            )
          );
          return of(error);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }
}
