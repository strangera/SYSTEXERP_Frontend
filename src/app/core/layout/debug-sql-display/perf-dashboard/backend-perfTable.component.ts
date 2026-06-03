import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-backend-perf-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  template: `
    <div class="flex align-items-center gap-2 mb-3">
      <i class="pi pi-server text-amber-600 text-xl"></i>
      <h3 class="text-xl font-semibold m-0 text-amber-800">1. 後端慢速 API 效能追蹤 (觸發門檻 >= 2秒)</h3>
    </div>

    <p-table
      [value]="data"
      [rows]="5"
      [paginator]="true"
      styleClass="p-datatable-striped"
      [tableStyle]="{ 'min-width': '50rem' }">
      <ng-template pTemplate="header">
        <tr>
          <th style="width: 15%">大模組</th>
          <th style="width: 15%">子作業代號</th>
          <th style="width: 25%">後端 Action 方法名稱</th>
          <th style="width: 15%">偵測日期</th>
          <th style="width: 15%" class="text-center">慢速累積次數</th>
          <th style="width: 15%" class="text-center">操作</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-row>
        <tr>
          <td><span class="p-column-title">大模組</span>{{ row.MainModule }}</td>
          <td><span class="p-column-title">子作業</span><strong class="text-primary">{{ row.SubTask }}</strong></td>
          <td><span class="p-column-title">Action</span><code>{{ row.ActionName }}</code></td>
          <td><span class="p-column-title">日期</span>{{ row.LogDate }}</td>
          <td class="text-center">
            <span class="p-column-title">次數</span>
            <span class="px-2 py-1 text-xs font-bold bg-orange-100 text-orange-700 border-round">
              {{ row.AlertCount }} 次警告
            </span>
          </td>
          <td class="text-center">
            <p-button
              icon="pi pi-eye"
              label="檢視效能長條圖"
              styleClass="p-button-sm p-button-warning p-button-outlined"
              (onClick)="onView.emit(row)">
            </p-button>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="6" class="text-center p-4 text-500">🎉 目前正式環境沒有任何慢速 API，後端運作極為流暢！</td>
        </tr>
      </ng-template>
    </p-table>
  `
})
export class BackendPerfTableComponent {
  @Input() data: any[] = [];
  @Output() onView = new EventEmitter<any>();
}
