import { inject, Injectable } from '@angular/core';
import { CachedListService } from './cached-lists.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalListService {
  #cacheList = inject(CachedListService);

  getGlobalList(slug: string, data?: { [key: string]: any }) {
    const cacheKey = `global-list-${slug}-${JSON.stringify(data)}`;
    return this.#cacheList.getListData(
      `helpers/global-list`,
      'POST',
      {
        module_name: slug,
        ...data,
      },
      cacheKey
    );
  }
}
