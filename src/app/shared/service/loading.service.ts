import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  // 使用 Signal 效能最好且代碼最簡潔
  isLoading = signal<boolean>(false);
  // messageService = inject(NotificationService);

  show() {
    this.isLoading.set(true);
    // this.messageService.infoBubble('載入中...請稍後');
  }

  hide() {
    this.isLoading.set(false);
    // this.messageService.clearBubble();
  }
}
