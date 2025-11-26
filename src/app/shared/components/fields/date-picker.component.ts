import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addDays, addHours, addMinutes, addWeeks, format } from 'date-fns';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { distinctUntilChanged, filter, tap } from 'rxjs';
import { RoundMinuteDirective } from '../../directives/round-minute.directive';

@Component({
  selector: 'formly-data-picker-field',
  template: `
    <div class="p-field">
      @if (props.description) {
      <p class="mb-3 text-xs">{{ props.description }}</p>
      } @if (props.withPresets) {
      <div [class]="'date-slider ' + (forceDisplay() ? 'mb-3' : '')">
        <p-tabs [scrollable]="true">
          <p-tablist>
            <p-tab>
              <p-button
                type="button"
                size="small"
                [outlined]="true"
                styleClass="border-round-3xl text-xs"
                severity="primary"
                icon="pi pi-calendar"
                [label]="'set_date_on_calendar' | translate"
                (onClick)="forceDisplay.set(true); activeIndex.set(-1)"
              />
            </p-tab>
            @for (item of presetItems(); track $index) {
            <p-tab>
              <p-button
                type="button"
                size="small"
                styleClass="border-round-3xl text-xs"
                severity="success"
                [outlined]="activeIndex() !== $index"
                [label]="item.label"
                (onClick)="handlePresetClick($index, item.amount, item.unit)"
              />
            </p-tab>
            }
          </p-tablist>
        </p-tabs>
      </div>
      } @if (!props.withPresets || forceDisplay()) {
      <p-floatlabel variant="on">
        <p-datepicker
          roundMinute
          #datePicker
          [formControl]="formControl"
          [formlyAttributes]="field"
          [placeholder]="props.placeholder ?? ''"
          [defaultDate]="props.defaultDate ?? null"
          [dateFormat]="props.dateFormat ?? 'yy-mm-dd'"
          [showClear]="props.showClear"
          [hourFormat]="props.hourFormat ?? '12'"
          [selectionMode]="props.selectionMode ?? 'single'"
          rangeSeparator="/"
          [required]="props.required ?? false"
          [minDate]="props.minDate ?? null"
          [maxDate]="props.maxDate ?? null"
          [disabledDates]="props.disabledDates ?? null"
          [disabledDays]="props.disabledDays ?? null"
          [stepMinute]="5"
          [showIcon]="props.showIcon ?? true"
          [showButtonBar]="false"
          [showTime]="props.showTime ?? false"
          [hideOnDateTimeSelect]="props.showTime ? false : true"
          [showSeconds]="props.showSeconds ?? false"
          [showOtherMonths]="props.showOtherMonths ?? true"
          [selectOtherMonths]="props.selectOtherMonths ?? false"
          [inline]="props.inline"
          [numberOfMonths]="props.numberOfMonths ?? 1"
          dataType="string"
          [appendTo]="props.appendTo ?? 'body'"
          [touchUI]="props.touchUI ?? false"
          [styleClass]="props.styleClass"
          (onClearClick)="onClearClick($event)"
        >
          <ng-template #footer>
            <div class="p-datepicker-buttonbar">
              <p-button
                size="small"
                [text]="true"
                [label]="datePicker.getTranslation('today')"
                (onClick)="datePicker.onTodayButtonClick($event)"
              />
              <p-button
                size="small"
                [text]="true"
                [label]="datePicker.getTranslation('clear')"
                (onClick)="datePicker.onClearButtonClick($event)"
              />
              @if (props.showTime) {
              <p-button
                size="small"
                class="ml-auto"
                [label]="datePicker.getTranslation('apply')"
                (onClick)="datePicker.hideOverlay()"
              />
              }
            </div>
          </ng-template>
        </p-datepicker>

        @if (props.label) {
        <label [ngClass]="props.labelClass">
          {{ props.label }}
          @if (props.required && props.hideRequiredMarker !== true) {
          <span class="text-red">*</span>
          }
        </label>
        }
      </p-floatlabel>
      } @if (showError && formControl.errors) {
      <small role="alert" class="error-msg">
        <formly-validation-message [field]="field" />
      </small>
      }
    </div>
  `,
  imports: [
    TooltipModule,
    RoundMinuteDirective,
    FormlyModule,
    DatePicker,
    NgClass,
    FloatLabel,
    TabsModule,
    ButtonModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerComponent extends FieldType<FieldTypeConfig> {
  #destroyRef = inject(DestroyRef);
  #translate = inject(TranslateService);

  datePicker = viewChild<DatePicker>('datePicker');

  forceDisplay = signal<boolean>(false);
  activeIndex = signal<number | null>(null);

  presetItems = signal<MenuItem[]>([
    {
      label: this.#translate.instant(_('after_15_minutes')),
      amount: 15,
    },
    {
      label: this.#translate.instant(_('after_30_minutes')),
      amount: 30,
    },
    {
      label: this.#translate.instant(_('after_1_hour')),
      amount: 1,
      unit: 'hour',
    },
    {
      label: this.#translate.instant(_('after_2_hours')),
      amount: 2,
      unit: 'hour',
    },
    {
      label: this.#translate.instant(_('after_3_hours')),
      amount: 3,
      unit: 'hour',
    },
    {
      label: this.#translate.instant(_('tomorrow')),
      amount: 1,
      unit: 'day',
    },
    {
      label: this.#translate.instant(_('day_after_tom')),
      amount: 2,
      unit: 'day',
    },
    {
      label: this.#translate.instant(_('after_1_week')),
      amount: 1,
      unit: 'week',
    },
    {
      label: this.#translate.instant(_('after_2_weeks')),
      amount: 2,
      unit: 'week',
    },
  ]);

  effect = effect(() => {
    if (this.props.withPresets && this.forceDisplay() && this.datePicker()) {
      this.datePicker()?.inputfieldViewChild?.nativeElement.focus();
    }
  });

  handlePresetClick(index: number, amount: number, unit = 'minute') {
    this.forceDisplay.set(false);
    this.activeIndex.set(index);
    this.addToNow(amount, unit);
  }

  ngOnInit() {
    if (this.formControl?.value && this.field.model.id) {
      // check if field has a value (if it was edit mode)
      const value = this.formControl.value; // "Oct 25, 2023" or "Oct 25, 2023 | 02:03 PM"
      const dateKey = this.field.key;

      const formatString = this.props.showTime
        ? 'yyyy-MM-dd HH:mm:ss'
        : 'yyyy-MM-dd';

      const formattedDate = format(new Date(value), formatString);
      this.field.model[dateKey as string] = formattedDate;
    }

    this.formControl.valueChanges
      .pipe(
        filter((v) => !!v),
        distinctUntilChanged(),
        tap((value) => {
          const dateKey = this.field.key;
          let formattedDate;

          if (Array.isArray(value) && value.length === 2) {
            // Handle the date range array
            const [startDate, endDate] = value;
            const formatString = this.props.showTime
              ? 'yyyy-MM-dd HH:mm:ss'
              : 'yyyy-MM-dd';
            const formattedStartDate = format(
              new Date(startDate),
              formatString
            );
            const formattedEndDate = format(new Date(endDate), formatString);
            formattedDate = `${formattedStartDate} / ${formattedEndDate}`;
          } else {
            // Handle single date value
            formattedDate = this.props.showTime
              ? format(new Date(value), 'yyyy-MM-dd HH:mm:ss')
              : format(new Date(value), 'yyyy-MM-dd');
          }

          this.field.model[dateKey as string] = formattedDate;
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }

  addToNow(amount: number, unit = 'minute') {
    const currentDate = new Date();
    let presetDate: Date;

    switch (unit) {
      case 'minute':
        presetDate = addMinutes(currentDate, amount);
        break;
      case 'hour':
        presetDate = addHours(currentDate, amount);
        break;
      case 'day':
        presetDate = addDays(currentDate, amount);
        break;
      case 'week':
        presetDate = addWeeks(currentDate, amount);
        break;
      default:
        presetDate = currentDate;
        break;
    }

    this.formControl?.setValue(presetDate);
  }

  onClearClick(e: any) {
    e.stopPropagation();
    this.formControl?.setValue(null);
  }
}
