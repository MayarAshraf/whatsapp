import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { GlobalApiResponse } from './global';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type RequestHeaders =
  | HttpHeaders
  | { [header: string]: string | string[] };
export type RequestParams =
  | HttpParams
  | {
      [param: string]:
        | string
        | number
        | boolean
        | ReadonlyArray<string | number | boolean>;
    };

@Injectable({ providedIn: 'root' })
export class ApiService {
  #http = inject(HttpClient);
  #apiUrl = environment.API_URL;
  #token = '3|8VnXkje3ZXcTSBz1LErCi9dn92iAYEgU5O7JCvmq7af666ee';

  request<T, R = GlobalApiResponse>(
    method: HttpMethod,
    endpoint: string,
    body?: T,
    headers?: RequestHeaders,
    params?: RequestParams,
    context?: HttpContext
  ) {
    const authHeaders: RequestHeaders = {
      ...(headers || {}),
      Authorization: `Bearer ${this.#token}`,
    };

    const options = { body, headers: authHeaders, params, context };

    return this.#http.request<R>(
      method,
      `${this.#apiUrl}/${endpoint}`,
      options
    );
  }
}
