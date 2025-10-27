import { AfterViewInit, Directive, inject } from "@angular/core";
import { DatePicker } from "primeng/datepicker";

@Directive({
  selector: "p-datepicker[roundMinute]",
})
export class RoundMinuteDirective implements AfterViewInit {
  #datePicker = inject(DatePicker);

  ngAfterViewInit(): void {
    if (this.#datePicker.showTime) this.#patchMethods();
  }

  #patchMethods(): void {
    this.#overrideIncrementMinute();
    this.#overrideDecrementMinute();
  }

  #overrideIncrementMinute(): void {
    const originalIncrement = this.#datePicker.incrementMinute.bind(this.#datePicker);
    this.#datePicker.incrementMinute = (event: any) => {
      this.#roundMinute("increment");
      originalIncrement(event);
    };
  }

  #overrideDecrementMinute(): void {
    const originalDecrement = this.#datePicker.decrementMinute.bind(this.#datePicker);
    this.#datePicker.decrementMinute = (event: any) => {
      this.#roundMinute("decrement");
      originalDecrement(event);
    };
  }

  #roundMinute(direction: "increment" | "decrement"): void {
    let currentMinute = this.#datePicker.currentMinute as number;
    if (direction === "increment") {
      currentMinute = Math.ceil(currentMinute / 5) * 5;
    } else {
      currentMinute = Math.floor(currentMinute / 5) * 5;
    }
    this.#datePicker.currentMinute = currentMinute;
  }
}
