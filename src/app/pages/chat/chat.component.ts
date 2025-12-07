import {
  DatePipe,
  NgStyle,
  NgTemplateOutlet,
  SlicePipe,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import GroupsComponent from '@pages/groups/groups.component';
import { SettingsModel } from '@pages/settings/services/service-type';
import { SettingCuComponent } from '@pages/settings/setting-cu.component';
import UsersComponent from '@pages/users/users.component';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip';
import Pusher from 'pusher-js';
import { finalize, map, switchMap, tap } from 'rxjs';
import { LinkifyPipe } from 'src/app/shared/pipes/linkify.pipe';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { GlobalListService } from 'src/app/shared/services/global-list.service';
import { AlertService } from 'src/app/shared/services/global-services/alert.service';
import { ApiService } from 'src/app/shared/services/global-services/api.service';
import { BreakpointService } from 'src/app/shared/services/global-services/breakpoint.service';
import { ConfirmService } from 'src/app/shared/services/global-services/confirm.service';
import { IdleService } from 'src/app/shared/services/idle.service';
import { LangService } from 'src/app/shared/services/lang.service';
import { SoundsService } from 'src/app/shared/services/sounds.service';
import { VoiceRecorderComponent } from './voice-recorder.component';

interface Message {
  id?: number;
  message_id?: number;
  sender_id?: number;
  receiver_id?: number;
  message?: any;
  created_at?: string;
  read_at?: string;
  is_optimistic?: boolean;
  direction?: string;
  from?: string;
  type?: string;
  media_data?: {
    url: string;
    caption: string | undefined;
    fileName?: string;
    fileSize?: string;
  };
  expanded?: boolean;
  status?: string;
}
@Component({
  selector: 'app-chat',
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
    MenuModule,
    FileUploadModule,
    DialogModule,
    NgTemplateOutlet,
    ImageModule,
    SlicePipe,
    VoiceRecorderComponent,
    Tooltip,
    TranslatePipe,
    LinkifyPipe,
    UsersComponent,
    GroupsComponent,
    SettingCuComponent,
    RouterLink,
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
  #sanitizer = inject(DomSanitizer);
  #alertService = inject(AlertService);
  #confirmService = inject(ConfirmService);
  #translate = inject(TranslateService);
  #currentLang = inject(LangService).currentLanguage;
  #globalList = inject(GlobalListService);
  isSmScreen = inject(BreakpointService).isSmScreen;
  idleService = inject(IdleService);

  settingsList$ = this.#globalList.getGlobalList('user-settings');
  currentUser = this.#authService.currentUser;

  messageInput = viewChild<ElementRef>('messageInput');
  messagesContainer = viewChild<ElementRef>('messagesContainer');
  fileUploader = viewChild<FileUpload>('fileUploader');
  audioPlayers = viewChildren<ElementRef<HTMLAudioElement>>('audioPlayer');
  selectedUser = signal<any>(null);
  messagesLoading = signal(false);
  allUsers = signal<any>([]);
  messages = signal<Message[]>([]);
  newMessage = signal('');
  channelName = signal('');
  searchTerm = signal('');
  usersLoading = signal(true);
  typingUsers = signal<{ [userId: number]: boolean }>({});
  showEmojiPicker = signal(false);
  mediaType = signal('image/*,video/*');
  fileUploaderVisible = signal(false);
  previewFiles = signal<{ file: File; url: string; caption?: string }[]>([]);
  showPreviewModal = signal(false);
  selectedPreviewIndex = signal(0);
  showPdfViewer = signal(false);
  currentPdfUrl = signal<SafeResourceUrl | null>(null);
  currentPdfFileName = signal<string>('');
  currentPdfData = signal<string>('');
  messagesPage = signal(0);
  messagesLength = signal(20);
  hasMoreMessages = signal(true);
  isLoadingMore = signal(false);
  activeVoiceRecording = signal<number | null>(null);
  showScrollButton = signal(false);
  conversationsStatue = signal('all');
  activeIndex = signal<number | null>(null);
  settings = signal<SettingsModel | undefined>(undefined);

  hostname = window.location.hostname;
  #rawSubdomain = this.hostname.split('.8xrespond.com')[0];
  subdomain = this.hostname === 'localhost' ? '8x-test' : this.#rawSubdomain;

  pusher: any;
  channel: any;

  page = input('');

  pageData = computed(() => {
    return this.page();
  });

  combinedMessages = computed(() => {
    const msgs = this.messages();
    if (!msgs.length) return [];

    const result: any[] = [];

    let prevDate = '';

    for (const m of msgs) {
      if (!m.created_at) return;
      const currDate = this.formatDateSeparator(m.created_at);
      if (currDate !== prevDate) {
        result.push({
          type: 'separator',
          date: currDate,
        });
        prevDate = currDate;
      }

      result.push({
        type: 'message',
        msg: m,
      });
    }

    return result;
  });

  formatDateSeparator(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  userStatusEffect = effect(() => {
    this.channel?.trigger('client-user-status', {
      user_id: this.currentUser()?.id,
      status: this.idleService.status(),
    });
  });

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
    }, 1);
  }

  onAudioPlay(currentAudio: HTMLAudioElement) {
    this.audioPlayers().forEach((audioRef) => {
      const audioEl = audioRef.nativeElement;

      if (audioEl !== currentAudio) {
        audioEl.pause();
      }
    });
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
      enableStats: false,
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

  getConversationsStatue(statue: string) {
    this.conversationsStatue.set(statue);
  }

  addProtocol(url: string) {
    return url.startsWith('http') ? url : 'https://' + url;
  }

  users$ = toObservable(this.conversationsStatue).pipe(
    switchMap((statue) =>
      this.#api
        .request('post', 'conversations/conversations', {
          filters: statue,
        })
        .pipe(
          finalize(() => this.usersLoading.set(false)),
          map(({ data }) => data),
          tap((data) => {
            this.allUsers.set(data);
          })
        )
    )
  );

  users = toSignal(this.users$, { initialValue: [] });

  selectUser(user: any) {
    this.messages.set([]);
    this.newMessage.set('');
    this.selectedUser.set(user);
    this.messagesLoading.set(true);
    this.activeVoiceRecording.set(user.id);
    this.messagesPage.set(0);
    this.hasMoreMessages.set(true);
    this.isLoadingMore.set(false);

    const container = this.messagesContainer()?.nativeElement;
    if (container) {
      container.scrollTop = 0;
    }

    this.getConversationHistory(true);

    setTimeout(() => {
      this.messageInput()?.nativeElement?.focus();
    }, 200);

    if (this.channel) {
      this.pusher.unsubscribe(this.channelName());
    }

    this.channel = this.pusher.subscribe(this.channelName());
    this.bindChannelEvents();
  }

  getConversationHistory(initial = true) {
    if (initial) {
      this.messagesPage.set(0);
      this.hasMoreMessages.set(true);
    }

    if (!this.hasMoreMessages()) return;

    const start = this.messagesPage() * this.messagesLength();

    this.#api
      .request('post', 'conversations/conversation-history', {
        id: this.selectedUser().id,
        length: this.messagesLength(),
        start: start,
      })
      .pipe(
        finalize(() => {
          this.messagesLoading.set(false);
          this.isLoadingMore.set(false);
        }),
        map(({ data }) =>
          data.data
            .map((data: any) => ({
              ...data.record,
              expanded: false,
            }))
            .reverse()
        ),
        tap((newMessages) => {
          if (newMessages.length < this.messagesLength()) {
            this.hasMoreMessages.set(false);
          }

          if (initial) {
            this.scrollToBottom();
            this.messages.set(newMessages);
            this.markMessagesAsRead();
          } else {
            this.messages.update((old) => [...newMessages, ...old]);
          }

          this.messagesPage.update((p) => p + 1);

          if (!initial) {
            setTimeout(() => {
              const container = this.messagesContainer()?.nativeElement;
              container.scrollTop = 50;
            }, 50);
          }
        })
      )
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe();
  }

  toggleExpand(msg: any) {
    msg.expanded = !msg.expanded;
  }

  isChatExpired = computed(() => {
    if (!this.selectedUser()?.last_client_message_at) return false;

    const lastMessageTime = new Date(
      this.selectedUser().last_client_message_at
    ).getTime();
    const currentTime = new Date().getTime();
    const hoursDiff = (currentTime - lastMessageTime) / (1000 * 60 * 60);

    return hoursDiff > 24;
  });

  onScroll() {
    const container = this.messagesContainer()?.nativeElement;

    if (!container) return;

    const scrolledFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    this.showScrollButton.set(scrolledFromBottom > 200);

    if (
      container.scrollTop < 50 &&
      !this.isLoadingMore() &&
      this.hasMoreMessages() &&
      !this.messagesLoading()
    ) {
      this.isLoadingMore.set(true);
      this.getConversationHistory(false);
    }
  }

  resetCount() {
    this.allUsers.update((users) =>
      users.map((u: any) =>
        u.id === this.selectedUser().id ? { ...u, unread_count: 0 } : u
      )
    );
  }

  markMessagesAsRead() {
    this.resetCount();
    const unreadMessages = this.messages().filter(
      (msg) => msg.direction === 'inbound' && msg.status !== 'read'
    );

    if (!unreadMessages.length) return;
    unreadMessages.forEach((msg) => {
      this.channel?.trigger('client-message-status', {
        user_id: this.currentUser()?.id,
        conversation_id: this.selectedUser()?.id,
        message_id: msg.message_id,
        status: 'read',
      });
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
      if (event.user_id && event.user_id !== this.currentUser()?.id) {
        return;
      }

      const conversationId = event.id;
      const usersCopy = [...this.allUsers()];
      const existingIndex = usersCopy.findIndex((u) => u.id === conversationId);

      let updatedUser;

      if (existingIndex !== -1) {
        updatedUser = { ...usersCopy[existingIndex], ...event };
        usersCopy.splice(existingIndex, 1);
      } else {
        updatedUser = event;
      }

      this.allUsers.set([updatedUser, ...usersCopy]);

      if (this.selectedUser()?.id === updatedUser.id) {
        this.selectedUser.set(updatedUser);
      }

      if (this.selectedUser() && this.selectedUser().from === event.from) {
        this.markMessagesAsRead();
      } else {
        this.#sounds.playSound('messageReceived');
      }
    });

    this.channel.bind('client-message-status', (event: any) => {
      const { temp_id, message_id, status } = event;
      const messageId = temp_id ?? message_id;
      const updatedMessages = this.messages().map((msg) => {
        if (msg.message_id == messageId) {
          return {
            ...msg,
            status,
          };
        }
        return msg;
      });

      this.messages.set(updatedMessages);
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
      const messageId = event.message_id;
      const isDuplicate = this.messages().some((msg) => {
        const existingMsgId = msg.message_id;
        return existingMsgId === messageId;
      });
      if (isDuplicate) return;

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
      sender_id: this.currentUser()?.id,
      receiver_id: selectedUser.id,
      message: content,
      created_at: new Date().toISOString(),
      is_optimistic: true,
      from: this.currentUser()?.whatsapp_number,
      direction: 'outbound',
      type: 'text',
      status: 'pending',
    };

    const el = this.messageInput()?.nativeElement;
    if (el) el.style.height = 'auto';

    this.messages.update((messages) => [...messages, optimisticMessage]);
    this.scrollToBottom();
    this.newMessage.set('');

    this.#sounds.playSound('messageSent');
    this.updateConversation();

    this.channel?.trigger('client-message', {
      conversation_id: selectedUser.id,
      user_id: this.currentUser()?.id,
      message: content,
      temp_id: optimisticMessage.message_id,
      type: 'text',
    });
  }
  getLastMessage(msg: any): string {
    switch (msg.type) {
      case 'document':
        return 'Document message';
      case 'image':
        return 'Image message';
      case 'video':
        return 'Video message';
      case 'audio':
        return 'Audio message';
      default:
        return msg.message ?? '';
    }
  }

  updateConversation() {
    const usersCopy = [...this.allUsers()];
    const selectedUser = this.selectedUser();
    const lastMessage = this.messages().at(-1);

    if (!selectedUser || !lastMessage) return;

    const index = usersCopy.findIndex((u) => u.id === selectedUser.id);
    if (index > -1) {
      const [user] = usersCopy.splice(index, 1);

      const displayedMessage = this.getLastMessage(lastMessage);

      const updatedUser = {
        ...user,
        last_message: {
          message: displayedMessage,
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

  attachmentItems = signal<MenuItem[]>([
    {
      label: 'documents',
      icon: 'fa-solid fa-file-invoice text-xl text-blue-700	',
      command: () => this.triggerFileUpload('.pdf,.doc,.docx'),
    },
    {
      label: 'images and videos',
      icon: 'fa-solid fa-images text-xl text-blue-500',
      command: () => this.triggerFileUpload('image/*,video/*'),
    },
  ]);

  triggerFileUpload(mediaType: string) {
    this.fileUploaderVisible.set(true);
    this.mediaType.set(mediaType);

    setTimeout(() => {
      const uploader = this.fileUploader?.();
      if (uploader) {
        uploader.choose();
      }
    }, 0);
  }

  setActivePreview(index: number): void {
    this.selectedPreviewIndex.set(index);
  }

  onUploadFiles(event: any): void {
    this.fileUploader()?.clear();
    const files: File[] = event.files;
    if (!files?.length) return;

    const validFiles: File[] = [];

    files.forEach((file) => {
      let maxSize = 5 * 1024 * 1024;

      if (file.type.startsWith('image/')) {
        maxSize = 5 * 1024 * 1024;
      } else if (file.type.startsWith('video/')) {
        maxSize = 16 * 1024 * 1024;
      } else if (
        file.type.includes('pdf') ||
        file.type.includes('doc') ||
        file.type.includes('.doc') ||
        file.type.includes('.pdf')
      ) {
        maxSize = 100 * 1024 * 1024;
      }

      if (file.size <= maxSize) {
        validFiles.push(file);
      } else {
        this.#alertService.setMessage({
          severity: 'warn',
          summary: 'File too large',
          detail: `${file.name} exceeds max size of ${maxSize / 1024 / 1024}MB`,
        });
      }
    });

    if (!validFiles.length) return;

    const newPreviews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      caption: '',
    }));

    this.previewFiles.update((currentPreviews) => [
      ...currentPreviews,
      ...newPreviews,
    ]);

    this.selectedPreviewIndex.set(
      this.previewFiles().length - newPreviews.length
    );
    this.showPreviewModal.set(true);
  }

  sendPreviewFiles() {
    this.previewFiles().forEach((item) => {
      const isDocument =
        !item.file.type.startsWith('image/') &&
        !item.file.type.startsWith('video/');
      const reader = new FileReader();

      reader.onload = () => {
        const base64 = reader.result as string;
        const createdAt = new Date().toISOString();
        const fileSizeFormatted = this.formatFileSize(item.file.size);

        const optimisticMessage: Message = {
          message_id: Date.now(),
          sender_id: this.currentUser()?.id,
          receiver_id: this.selectedUser()?.id,
          media_data: {
            url: base64,
            caption: item.caption,
            fileName: item.file.name,
            fileSize: fileSizeFormatted,
          },
          created_at: createdAt,
          is_optimistic: true,
          from: this.currentUser()?.whatsapp_number,
          direction: 'outbound',
          type: isDocument
            ? 'document'
            : item.file.type.startsWith('video/')
            ? 'video'
            : 'image',
          message: item.caption || '',
          status: 'pending',
        };

        this.messages.update((msgs) => [...msgs, optimisticMessage]);
        this.scrollToBottom();
        this.updateConversation();

        this.channel?.trigger('client-message', {
          user_id: this.currentUser()?.id,
          conversation_id: this.selectedUser()?.id,
          file: base64,
          type: optimisticMessage.type,
          media_caption: item.caption || '',
          filename: item.file.name,
          temp_id: optimisticMessage.message_id,
        });
      };

      reader.readAsDataURL(item.file);
    });

    this.previewFiles.set([]);
    this.showPreviewModal.set(false);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
  getFileNameFromUrl(url: string, fallback: string = 'Document.pdf'): string {
    if (!url) return fallback;

    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      return decodeURIComponent(fileName) || fallback;
    } catch (error) {
      return fallback;
    }
  }

  openPdfViewer(message: Message): void {
    if (message.media_data?.url) {
      const url = message.media_data.url;
      this.currentPdfData.set(url);

      let fileName = message.media_data.fileName || 'Document.pdf';

      if (!message.media_data.fileName && url.startsWith('http')) {
        const urlParts = url.split('/');
        fileName = urlParts[urlParts.length - 1] || 'Document.pdf';
      }

      this.currentPdfFileName.set(fileName);

      const safeUrl = this.#sanitizer.bypassSecurityTrustResourceUrl(url);
      this.currentPdfUrl.set(safeUrl);
      this.showPdfViewer.set(true);
      this.downloadPdf();
    }
  }

  downloadPdf(): void {
    const pdfUrl = this.currentPdfData();
    const fileName = this.currentPdfFileName();

    if (!pdfUrl) return;

    if (pdfUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    try {
      fetch(pdfUrl, { mode: 'cors' })
        .then((response) => {
          if (!response.ok) throw new Error('Network response not ok');
          return response.blob();
        })
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        })
        .catch(() => {
          window.open(pdfUrl, '_blank');
        });
    } catch (err) {
      console.error('Download failed:', err);
      window.open(pdfUrl, '_blank');
    }
  }

  toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  removePreviewFile(event: Event, index: number): void {
    event.stopPropagation();
    const updated = [...this.previewFiles()];
    updated.splice(index, 1);
    this.previewFiles.set(updated);

    if (this.selectedPreviewIndex() >= updated.length) {
      this.selectedPreviewIndex.set(Math.max(updated.length - 1, 0));
    }
  }
  onVoiceRecordingComplete(audioBlob: Blob) {
    const selectedUser = this.selectedUser();
    if (!selectedUser) return;

    const createdAt = new Date().toISOString();

    const optimisticMessage: Message = {
      message_id: Date.now(),
      sender_id: this.currentUser()?.id,
      receiver_id: selectedUser.id,
      media_data: {
        url: '',
        caption: 'Voice message',
        fileName: `voice_message_${Date.now()}.wav`,
        fileSize: this.formatFileSize(audioBlob.size),
      },
      created_at: createdAt,
      is_optimistic: true,
      from: this.currentUser()?.whatsapp_number,
      direction: 'outbound',
      type: 'audio',
      message: 'Voice message',
      status: 'pending',
    };

    const reader = new FileReader();
    reader.onload = () => {
      optimisticMessage.media_data!.url = reader.result as string;

      this.messages.update((messages) => [...messages, optimisticMessage]);
      this.scrollToBottom();
      this.updateConversation();

      this.channel?.trigger('client-message', {
        user_id: this.currentUser()?.id,
        conversation_id: selectedUser.id,
        file: optimisticMessage.media_data!.url,
        type: 'audio',
        media_caption: 'Voice message',
        filename: optimisticMessage.media_data!.fileName,
        temp_id: optimisticMessage.message_id,
      });

      this.#sounds.playSound('messageSent');
    };
    reader.readAsDataURL(audioBlob);
  }

  closeChat() {
    this.#confirmService.confirmDelete({
      message: this.#translate.instant(_('please_confirm_to_end_conversation')),
      acceptCallback: () => {
        this.channel?.trigger('client-conversation-closed', {
          user_id: this.currentUser()?.id,
          conversation_id: this.selectedUser()?.id,
        });

        this.selectedUser.set(null);
      },
    });
  }

  settings$ = this.#api
    .request('get', 'whatsapp-account/whatsapp-account')
    .pipe(
      map(({ data }) => data),
      tap((data) => {
        this.settings.set(data);
      }),
      takeUntilDestroyed(this.#destroyRef)
    )
    .subscribe();
}
