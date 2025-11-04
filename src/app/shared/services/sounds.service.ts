import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SoundsService {
  playSound(soundType: string) {
    const soundMap: { [key: string]: string } = {
      messageReceived: '/assets/media/audio/message-received.mp3',
      messageSent: '/assets/media/audio/message-sent.mp3',
    };

    const audio = new Audio();
    audio.src = soundMap[soundType];
    audio.load();
    audio.play();
  }
}
