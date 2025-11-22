import { TemplateRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RequestHeaders, RequestParams } from './api.service';

// Global types (models/entities)
export interface GlobalApiResponse {
  message: string;
  status: boolean;
  data: any;
}

export interface LoginModel {
  email: string;
  password: string;
}

export interface RegisterModel {
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  phone: string;
  whatsapp_number: string;
  country_code: string;
  job_title: string;
  company_name: string;
  password: string;
  password_confirmation: string;
}

export interface ForgetModel {
  email: string;
}

export interface VerifyModel {
  token: string;
  checkExpireResetTokenPage: boolean;
}

export interface ResetModel {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface PhoneModel {
  phone: string;
  country_code: string;
}

export interface DataTableColumn {
  title?: string | null;
  name?: string | null;
  searchable?: boolean | null;
  orderable?: boolean | null;
  trans?: boolean;
  render?: TemplateRef<any> | null;
  expandable?: boolean | null;
  transform?: { [key: string]: any };
}

export interface FiltersData {
  [key: string]: any;
}
export class BaseCrudIndexMeta {
  endpoints: { [key: string]: string };
  columns: DataTableColumn[];
  indexIcon: string;
  indexTitle: string;
  createBtnLabel: string;
  indexTableKey: string | undefined;
  reorderableColumns?: boolean;
  reorderableRows?: boolean;
  reorderEndpoint?: string | null;
  headers?: RequestHeaders;
  params?: RequestParams;
  indexApiVersion?: string;
  deleteApiVersion?: string;

  constructor() {
    this.endpoints = {} as { [key: string]: string };
    this.columns = [];
    this.indexIcon = 'fas fa-circle-info';
    this.indexTitle = 'Index';
    this.createBtnLabel = 'Create New Item';
    this.indexTableKey = undefined;
    this.reorderableColumns = false;
    this.reorderableRows = false;
    this.reorderEndpoint = null;
    this.headers = undefined;
    this.params = undefined;
  }
}

export class BaseCrudDialogMeta {
  endpoints: { [key: string]: string };
  showDialogHeader: boolean;
  dialogData$: Observable<any>;
  isTitleRenderedAsBtn: boolean;
  dialogTitle: string;
  dialogSubtitle: string;
  titleIcon: string;
  dialogTitleClass: string;
  submitButtonLabel: string;
  showResetButton: boolean;
  showFormActions: boolean;
  showSubmitButton: boolean;
  headers?: RequestHeaders;
  params?: RequestParams;
  createApiVersion?: string;
  updateApiVersion?: string;

  constructor() {
    this.endpoints = {} as { [key: string]: string };
    this.showDialogHeader = true;
    this.dialogData$ = of(1);
    this.isTitleRenderedAsBtn = false;
    this.dialogTitle = '';
    this.dialogSubtitle = '';
    this.titleIcon = '';
    this.dialogTitleClass = '';
    this.submitButtonLabel = '';
    this.showResetButton = true;
    this.showFormActions = true;
    this.showSubmitButton = true;
    this.headers = undefined;
    this.params = undefined;
  }
}

export type PartialBaseCrudDialogMeta = Partial<BaseCrudDialogMeta>;
