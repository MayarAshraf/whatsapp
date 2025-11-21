import { Component, inject, output, signal } from '@angular/core';
import { AudioRecorderService, RecordingResult } from 'angular-voice';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-voice-recorder',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <div>
      @if(!isRecording()){
      <button
        pButton
        type="button"
        icon="fa-solid fa-microphone"
        class="p-button-text"
        (click)="startRecording()"
      ></button>
      } @else {
      <div
        class="flex align-items-center gap-3 p-2 border-round-3xl bg-white border-1 border-300"
      >
        <button
          pButton
          type="button"
          icon="fa-solid fa-trash"
          [rounded]="true"
          size="small"
          class="p-button-danger"
          (click)="cancelRecording()"
        ></button>
        <span class="font-semibold text-900">
          {{ formatDuration(duration()) }}
        </span>

        <button
          pButton
          type="button"
          [rounded]="true"
          size="small"
          (click)="togglePause()"
          [icon]="isPaused() ? 'fa-solid fa-play' : 'fa-solid fa-pause'"
        ></button>

        <button
          pButton
          type="button"
          icon="fa-solid fa-paper-plane"
          [rounded]="true"
          size="small"
          class="p-button-success"
          (click)="stopRecording()"
        ></button>
      </div>

      }
    </div>
  `,
})
export class VoiceRecorderComponent {
  recorder = inject(AudioRecorderService);

  audioBlob = output<Blob>();

  isRecording = signal(false);
  isPaused = signal(false);
  duration = signal(0);
  previewUrl = signal<string | null>(null);

  timer?: any;

  async startRecording() {
    await this.recorder.prepare();
    await this.recorder.start();

    this.isRecording.set(true);
    this.isPaused.set(false);
    this.previewUrl.set(null);
    this.duration.set(0);

    this.startTimer();
  }

  async togglePause() {
    if (!this.isPaused()) {
      await this.recorder.pause();
      this.stopTimer();
      this.isPaused.set(true);
    } else {
      await this.recorder.resume();
      this.startTimer();
      this.isPaused.set(false);
    }
  }

  async stopRecording() {
    this.stopTimer();

    const result: RecordingResult = await this.recorder.stop();
    const blob = result.blob;

    const preview = URL.createObjectURL(blob);
    this.previewUrl.set(preview);
    this.audioBlob.emit(blob);

    this.isRecording.set(false);
    this.isPaused.set(false);
  }

  cancelRecording() {
    this.stopTimer();

    if (this.previewUrl()) {
      URL.revokeObjectURL(this.previewUrl()!);
    }

    this.previewUrl.set(null);
    this.isRecording.set(false);
    this.isPaused.set(false);
    this.duration.set(0);
  }

  startTimer() {
    this.stopTimer();

    this.timer = setInterval(() => {
      if (!this.isPaused()) {
        this.duration.set(this.duration() + 1);
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }
}
