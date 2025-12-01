import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BreakpointService {
  #breakpointObserver = inject(BreakpointObserver);

  isSmScreen$ = this.#breakpointObserver
    .observe(['(max-width: 991px)'])
    .pipe(map((state: BreakpointState) => state.matches));

  isMdScreen$ = this.#breakpointObserver
    .observe(['(min-width: 768px)'])
    .pipe(map((state: BreakpointState) => state.matches));

  isLgScreen$ = this.#breakpointObserver
    .observe(['(min-width: 992px)'])
    .pipe(map((state: BreakpointState) => state.matches));

  isXlScreen$ = this.#breakpointObserver
    .observe(['(min-width: 1200px)'])
    .pipe(map((state: BreakpointState) => state.matches));

  isSmScreen = toSignal(this.isSmScreen$, { initialValue: false });
  isMdScreen = toSignal(this.isMdScreen$, { initialValue: false });
  isLgScreen = toSignal(this.isLgScreen$, { initialValue: true });
  isXlScreen = toSignal(this.isXlScreen$, { initialValue: true });
}
