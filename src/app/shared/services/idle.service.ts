import { inject, Injectable, signal } from '@angular/core';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';

@Injectable({
  providedIn: 'root',
})
export class IdleService {
  idle = inject(Idle);

  status = signal<'online' | 'away'>('online');

  constructor() {
    this.initializeIdleDetection();
  }

  initializeIdleDetection() {
    this.idle.setIdle(5);
    this.idle.setTimeout(1);
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.idle.onInterrupt.subscribe(() => {
      if (this.status() === 'away') {
        this.status.set('online');
      }
    });

    this.idle.onTimeout.subscribe(() => {
      this.status.set('away');

      setTimeout(() => {
        this.idle.watch();
      }, 100);
    });

    this.idle.watch();
  }
}
