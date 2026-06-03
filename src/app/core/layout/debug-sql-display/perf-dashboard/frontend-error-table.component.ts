import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-frontend-error-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  template: `
    <div class="flex align-items-center gap-2 mb-3">
      <i class="pi pi-desktop text-pink-600 text-xl"></i>
      <h3 class="text-xl font-semibold m-0 text-pink-800">2. 純前端 Runtime 異常紀錄 (天羅地網全域捕捉)</h3>
    </div>

    <p-table
      [value]="data"
      [rows]="5"
      [paginator]="true"
      styleClass="p-datatable-striped"
      [tableStyle]="{ 'min-width': '50rem' }">
      <ng-template pTemplate="header">
        <tr>
          <th style="width: 15%">類型</th>
          <th style="width: 15%">分類目錄</th>
          <th style="width: 25%">發生錯誤的前端 Page / 功能</th>
          <th style="width: 15%">偵測日期</th>
          <th style="width: 15%" class="text-center">本日爆發次數</th>
          <th style="width: 15%" class="text-center">操作</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-row>
        <tr>
          <td>
            <span class="p-column-title">類型</span>
            <span class="px-2 py-1 text-xs font-bold bg-pink-100 text-pink-700 border-round">
              {{ row.MainModule }}
            </span>
          </td>
          <td><span class="p-column-title">分類目錄</span>{{ row.SubTask }}</td>
          <td>
            <span class="p-column-title">功能</span>
            <span class="text-pink-600 font-medium">
              {{ row.ActionName.replace('Client_', '') }}
            </span>
          </td>
          <td><span class="p-column-title">日期</span>{{ row.LogDate }}</td>
          <td class="text-center">
            <span class="p-column-title">次數</span>
            <span class="p-badge p-badge-danger">{{ row.AlertCount }}</span>
          </td>
          <td class="text-center">
            <p-button
              icon="pi pi-code"
              label="查看 StackTrace 堆疊"
              styleClass="p-button-sm p-button-danger p-button-outlined"
              (onClick)="onView.emit(row)">
            </p-button>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="6" class="text-center p-4 text-500">🎉 太棒了！今天前端沒抓到任何 JavaScript 運行崩潰錯誤！</td>
        </tr>
      </ng-template>
    </p-table>
  `
})
export class FrontendErrorTableComponent {
  @Input() data: any[] = [];
  @Output() onView = new EventEmitter<any>();
}
