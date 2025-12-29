import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { FloatLabel } from 'primeng/floatlabel';
import { debounceTime, distinctUntilChanged, filter, map, tap } from 'rxjs';
import { ApiService } from '../../services/global-services/api.service';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'formly-autocomplete-field',
  template: `
    <div class="p-field" attr.data-field-key="{{ field.key }}">
      <p-floatlabel variant="on">
        <p-autocomplete
          class="w-full"
          [formControl]="formControl"
          [formlyAttributes]="field"
          [class.ng-dirty]="showError"
          [forceSelection]="true"
          [delay]="1000"
          [dropdown]="props.dropdown ?? false"
          [placeholder]="props.placeholder ?? ''"
          [multiple]="props.multiple"
          [placeholder]="props.placeholder ?? ''"
          [required]="props.required ?? false"
          [typeahead]="props.typeahead ?? true"
          [showClear]="props.showClear"
          [suggestions]="suggestions()"
          (completeMethod)="onComplete($event)"
          (onClear)="field.form?.get(this.props.fieldKey)?.setValue(null)"
          [invalid]="showError"
        />

        @if (props.label) {
        <label>
          {{ props.label }}
          @if (props.required && props.hideRequiredMarker !== true) {
          <span class="text-red">*</span>
          }
        </label>
        }
      </p-floatlabel>

      @if (props.description) {
      <p class="mt-1 mb-0 font-medium text-xs text-primary capitalize">
        {{ props.description }}
      </p>
      } @if (showError && formControl.errors) {
      <small class="error-msg" role="alert">
        <formly-validation-message [field]="field" />
      </small>
      }
    </div>
  `,
  standalone: true,
  imports: [FloatLabel, AutoCompleteModule, FormlyModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteComponent extends FieldType<FieldTypeConfig> {
  #destroyRef = inject(DestroyRef);
  #currentLang = inject(LangService).currentLanguage;
  #api = inject(ApiService);
  suggestions = signal<{ label: string; value: number }[]>([]);

  onComplete(event: AutoCompleteCompleteEvent) {
    this.#api
      .request('post', this.props.endpoint, { key: event.query })
      .pipe(
        map(({ data }) => data),
        debounceTime(1000),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe((data) => {
        const coptions = data.map((item: any) => ({
          label: this.props.accessLabel ?? item.label,
          value: item,
        }));
        this.suggestions.set(coptions);
      });
  }

  ngOnInit() {
    this.formControl.valueChanges
      .pipe(
        filter((value) => !!value),
        distinctUntilChanged(),
        takeUntilDestroyed(this.#destroyRef),
        tap((value) => {
          const newValue = this.props.multiple
            ? value.map((i: { value: number }) => i.value)
            : value.value;
          this.field.form?.get(this.props.fieldKey)?.setValue(newValue);
        })
      )
      .subscribe();
  }
}
