import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccessService {
  menuUpdated = new Subject<any[]>();
  constructor(
  ) { }

  // 取得 sessionStorage 資料
  getSessionData<T>(key: string): T | null {
    const data = sessionStorage.getItem(key);
    if (!data) { return null; }
    return JSON.parse(data) as T;
  }
}

