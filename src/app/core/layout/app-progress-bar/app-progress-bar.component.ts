import { Component, inject, signal, effect } from '@angular/core';
import { NgClass } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-progress-bar',
  template: `
    <!-- 頂部進度條容器 -->
    <div class="top-progress-container" [ngClass]="{'loading-active': isProgressVisible()}">
      <!-- ⚠️ 寬度和過渡時間現在由 [style] 綁定控制 -->
      <div class="top-progress-bar"
           [style.width]="progressWidth()"
           [style.transitionDuration]="transitionDuration()">
      </div>
    </div>
  `,
  styles: [`
    .top-progress-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px; /* 載入條高度 */
      z-index: 9999; /* 確保它在所有其他元素之上 */
      overflow: hidden;
      pointer-events: none; /* 讓點擊穿透 */
      opacity: 0;
      /* 僅控制容器的淡出/淡入 */
      transition: opacity 0.3s ease-out;
    }

    .loading-active {
      opacity: 1;
      /* 載入開始時立即顯示，沒有淡入延遲 */
      transition: opacity 0s;
    }

    .top-progress-bar {
      height: 100%;
      background-color: var(--primary-color, #10b981); /* 使用主題色或綠色 */
      /* 寬度控制從左側開始 */
      transform-origin: left;
      /* ⚠️ 所有的 width 過渡由 TS 中的 [style.transitionDuration] 控制 */
      transition-property: width;
      transition-timing-function: linear; /* 讓模擬載入更穩定 */
    }
  `],
  standalone: true,
  imports: [NgClass],
})
export class AppProgressBarComponent {
  private readonly loadingService = inject(LoadingService);

  // 控制容器的可見性 (opacity)
  public readonly isProgressVisible = signal(false);
  // 控制進度條的寬度 (0% ~ 100%)
  public progressWidth = signal('0%');
  // 控制 CSS 過渡時間 (20s for fake load, 0.2s for finish)
  public transitionDuration = signal('0s');

  constructor() {
    // ⚠️ Effect: 響應式地管理載入條狀態和動畫
    effect(() => {
      const isLoading = this.loadingService.isLoading();

      if (isLoading) {
        // 1. 啟動：讓進度條可見，並設定為 0% (瞬間)
        this.isProgressVisible.set(true);
        this.progressWidth.set('0%');
        this.transitionDuration.set('0s');

        // 2. 模擬載入：在下一幀開始長時過渡到 95%
        // 使用 requestAnimationFrame 確保 0% 的狀態已經被渲染
        requestAnimationFrame(() => {
          // 慢速過渡 (模擬載入中)
          this.transitionDuration.set('20s');
          this.progressWidth.set('95%');
        });

      } else {
        // 3. 載入完成：快速過渡到 100% (結束動畫)
        // 覆蓋長時過渡，開始短時過渡到 100%
        this.transitionDuration.set('0.2s');
        this.progressWidth.set('100%');

        // 4. 隱藏：等待 100% 過渡完成 (0.2s)，然後隱藏容器
        setTimeout(() => {
          this.isProgressVisible.set(false);
          // 重設寬度，準備下次載入
          this.progressWidth.set('0%');
          this.transitionDuration.set('0s');
        }, 200);
      }
    }, { allowSignalWrites: true });
  }
}
