import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  // 使用 Signal 效能最好且代碼最簡潔
  isLoading = signal<boolean>(false);

  show() {
    this.isLoading.set(true);
    console.log('🚀 載入中...');
  }

  hide() {
    this.isLoading.set(false);
    console.log('🚀 載入完成');
  }
}
