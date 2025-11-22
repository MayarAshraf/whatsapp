import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import {
  ApiService,
  RequestHeaders,
  RequestParams,
} from './global-services/api.service';

@Injectable({
  providedIn: 'root',
})
export class CachedListService {
  #api = inject(ApiService);
  cachedLists$: { [key: string]: Observable<any> } = {}; // cachedLists$ is introduced as an object that will store the cached observables. The keys of this object will be the endpoints, and the values will be the corresponding observables.

  getListData(
    endpoint: string,
    requestType: 'GET' | 'POST' = 'POST',
    bodyPayload = {},
    cacheKey?: string,
    headers?: RequestHeaders,
    params?: RequestParams
  ) {
    const key = cacheKey || endpoint;

    if (this.cachedLists$[key]) {
      return this.cachedLists$[key]; // Return cached data if available
    }

    let request$: Observable<any>;

    if (requestType === 'GET') {
      // GET Request
      request$ = this.#api
        .request('get', endpoint, undefined, headers, params)
        .pipe(map(({ data }) => data));
    } else {
      // POST Request
      request$ = this.#api
        .request('post', endpoint, bodyPayload, headers, params)
        .pipe(map(({ data }) => data));
    }

    this.cachedLists$[key] = request$.pipe(shareReplay(1));

    return this.cachedLists$[key];
  }
}
