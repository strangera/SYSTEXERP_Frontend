import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { interval, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-topbar-time',
  template: `
    <div class="flex flex-row align-items-center font-bold text-primary justify-content-center col-flex gap-2 m-1 text-sm">
      <i class="pi pi-clock text-sm"></i>
      {{ now() | date: 'yyyy/MM/dd HH:mm:ss' }}
    </div>
  `,
  standalone: true,
  imports: [DatePipe]
})
export class AppTopbarTimeComponent {
  // 使用 toSignal 完美處理時間更新和清理
  public readonly now = toSignal(interval(1000).pipe(map(() => new Date())), { initialValue: new Date() });
}