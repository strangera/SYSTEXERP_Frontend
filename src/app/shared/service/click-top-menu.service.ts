import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClickTopMenuService {
  private menuValueSubject = new BehaviorSubject<any>(null); // 初始值可設定為 null 或預設值
  menuValue$ = this.menuValueSubject.asObservable();

  setMenuValue(value: any) {
    this.menuValueSubject.next(value);
  }

  getCurrentMenuValue() {
    return this.menuValueSubject.getValue(); // 如果你只想同步拿到最新值
  }
}
