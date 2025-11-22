import { DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChild,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { Table, TableModule, TableService } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { constants } from '../../config/constants';
import { NestedPropertyPipe } from '../../pipes/nested-property.pipe';
import { DataTableColumn } from '../../services/global-services/global';

export function tableFactory(table: TableWrapperComponent): Table {
  return table.primengTable();
}
@Component({
  selector: 'app-table-wrapper',
  templateUrl: './table-wrapper.component.html',
  styleUrl: './table-wrapper.component.scss',
  providers: [
    DecimalPipe,
    TableService,
    {
      provide: Table,
      useFactory: tableFactory,
      deps: [TableWrapperComponent],
    },
  ],
  imports: [
    NgTemplateOutlet,
    Skeleton,
    InputTextModule,
    IconField,
    InputIcon,
    NestedPropertyPipe,
    Divider,
    ButtonModule,
    TooltipModule,
    TranslatePipe,
    TableModule,
    DatePipe,
    Select,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableWrapperComponent {
  #translate = inject(TranslateService);
  #decimalPipe = inject(DecimalPipe);

  additionalContentTemplate = contentChild<TemplateRef<any>>(
    'additionalContentTemplate'
  );
  customFiltersTemplate = contentChild<TemplateRef<any>>(
    'customFiltersTemplate'
  );
  headerTemplate = contentChild<TemplateRef<any>>('headerTemplate');
  actionsTemplate = contentChild<TemplateRef<any>>('actionsTemplate');
  extendDefaultActionsTemplate = contentChild<TemplateRef<any>>(
    'extendDefaultActionsTemplate'
  );
  bodyTemplate = contentChild<TemplateRef<any>>('bodyTemplate');
  loadingBodyTemplate = contentChild<TemplateRef<any>>('loadingBodyTemplate');
  expandedRowTemplate = contentChild<TemplateRef<any>>('expandedRowTemplate');
  primengTable = viewChild.required<Table>('primengTable');

  constants = constants;
  first = signal(0);
  isCardTable = input(false);
  searchQuery = signal('');
  scrollable = input(false);
  scrollHeight = input<string | undefined>(undefined);
  showScrollHint = model(true);
  isListLayout = model(true);
  withMultiLayout = input(false);
  showTableHeader = input(true);
  withScreenHeader = input(true);
  withCustomFilters = input(false);
  withActionsColumn = input(true);
  displayHeaderButton = input(true);
  isSpecialCreateBtn = input(false);
  indexPermissions = input<boolean>(false);
  createBtnPermissions = input<boolean>(false);
  updateBtnPermissions = input<boolean>(false);
  deleteBtnPermissions = input<boolean>(false);
  headerTitle = input<string>();
  headerSubTitle = input<string>();
  titleIcon = input<string>();
  titleClass = input<string>();
  headerBtnLabel = input<string>('');
  withAdditionalContent = input(false);
  dataSource = input<any[]>([]);
  columns = input<DataTableColumn[]>([]);
  reorderableColumns = input(false);
  reorderableRows = input(false);
  breakpoint = input('767px');
  dataKey = input('id');
  stateKey = input<string | undefined>();
  rowExpandMode = input<'single' | 'multiple'>('single');
  totalRecords = input(0);
  recordsFiltered = input<number>();
  editMode = input<'cell' | 'row'>('cell'); // "cell" | "row"
  rowHover = input(false);
  lazy = input(true);
  lazyLoadOnInit = input(true);
  rows = model(constants.TABLE_ROWS_LENGTH);
  loading = input(false);
  showCurrentPageReport = input(true);
  rowsPerPageOptions = input<number[] | undefined>([5, 10, 20, 30, 50]);
  paginator = input(true);
  globalFilterFields = input<string[]>([]);
  withSelection = input(false);
  selectionMode = input<'single' | 'multiple' | null>(null);
  selectionPageOnly = input(true);
  selection = model<any>();
  withTableSearch = input(true);
  showGridlines = input(true);
  stripedRows = input(false);
  styleClass = input<string>();

  onLoadData = output<any>();
  selectionChange = output<any>();
  selectAllChange = output<any>();
  editComplete = output<any>();
  columnSortChange = output();
  onRowReorder = output<any>();
  createBtnClicked = output();
  updateBtnClicked = output<any>();
  deleteBtnClicked = output<any>();
  onStateSave = output<any>();
  stateRestoreChange = output<any>();

  onStateRestore(event: any) {
    this.searchQuery.set(event.filters?.global.value || '');
    this.stateRestoreChange.emit(event);
  }

  removeScrollHint() {
    if (!this.showScrollHint()) return;
    this.showScrollHint.set(false);
  }

  #formatNumber(num: number | undefined): string {
    return this.#decimalPipe.transform(num, '1.0-0') || '';
  }

  currentPageReport = computed(() => {
    const filteredFrom = this.searchQuery()
      ? ` (${this.#translate.instant(
          _('report_table.filtered_from')
        )} ${this.#formatNumber(this.totalRecords())} ${this.#translate.instant(
          _('total_records')
        )})`
      : '';

    const showing = this.#translate.instant(_('report_table.showing'));
    const toRecords = this.#translate.instant(_('report_table.to'));
    const ofRecords = this.#translate.instant(_('report_table.of'));

    const lastValue = Math.min(this.first() + this.rows(), this.totalRecords());
    const first = this.recordsFiltered() === 0 ? 0 : this.first() + 1;
    const last = this.recordsFiltered() === 0 ? 0 : lastValue;

    return !this.loading()
      ? `${showing} ${first} ${toRecords} ${last} ${ofRecords} ${this.#formatNumber(
          this.recordsFiltered()
        )} ${this.#translate.instant(_('records'))} ${filteredFrom}`
      : '';
  });

  getTableClass() {
    return `
      ${this.styleClass()}
      ${this.isListLayout() && this.withMultiLayout() ? 'list-layout' : ''}
      ${!this.isListLayout() && this.withMultiLayout() ? 'grid-layout' : ''}
    `;
  }
}
