import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-backend-perf-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, TagModule],
  template: `
    <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 mb-3">
      <div class="flex align-items-center gap-2">
        <i class="pi pi-server text-amber-600 text-2xl"></i>
        <div>
          <h3 class="text-xl font-bold m-0 text-amber-800">1. 後端慢速 API 效能追蹤</h3>
          <small class="text-500">觸發門檻 ≥ 2秒</small>
        </div>
      </div>

      <span class="p-input-icon-left w-full md:w-20rem">
        <i class="pi pi-search"></i>
        <input pInputText type="text" class="w-full p-inputtext-sm"
               (input)="dt.filterGlobal($any($event.target).value, 'contains')"
               placeholder="搜尋大模組/子作業/Action..." />
      </span>
    </div>

    <p-table #dt [value]="data" [rows]="5" [paginator]="true"
             styleClass="p-datatable-striped p-datatable-gridlines p-datatable-sm shadow-1"
             [tableStyle]="{ 'min-width': '50rem' }"
             [globalFilterFields]="['MainModule', 'SubTask', 'ActionName']">

      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="MainModule" style="width: 15%">大模組 <p-sortIcon field="MainModule"></p-sortIcon></th>
          <th pSortableColumn="SubTask" style="width: 15%">子作業代號 <p-sortIcon field="SubTask"></p-sortIcon></th>
          <th pSortableColumn="ActionName" style="width: 30%">後端 Action 方法名稱 <p-sortIcon field="ActionName"></p-sortIcon></th>
          <th pSortableColumn="LogDate" style="width: 15%">偵測日期 <p-sortIcon field="LogDate"></p-sortIcon></th>
          <th pSortableColumn="AlertCount" style="width: 13%" class="text-center">慢速累積 <p-sortIcon field="AlertCount"></p-sortIcon></th>
          <th style="width: 12%" class="text-center">操作</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-row>
        <tr>
          <td><span class="p-column-title">大模組</span>{{ row.MainModule }}</td>
          <td><span class="p-column-title">子作業</span><span class="font-semibold text-700">{{ row.SubTask }}</span></td>
          <td>
            <span class="p-column-title">Action</span>
            <div class="p-1 surface-100 border-round font-monospace text-xs text-900 border-1 border-200 block overflow-x-auto">
              {{ row.ActionName }}
            </div>
          </td>
          <td><span class="p-column-title">日期</span>{{ row.LogDate }}</td>
          <td class="text-center">
            <span class="p-column-title">次數</span>
            <p-tag [severity]="getSeverity(row.AlertCount)" [value]="row.AlertCount + ' 次警告'"></p-tag>
          </td>
          <td class="text-center">
            <p-button icon="pi pi-chart-bar" label="分析"
                      styleClass="p-button-sm p-button-warning p-button-text font-bold"
                      (onClick)="onView.emit(row)">
            </p-button>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="6" class="text-center p-5 text-500">
            <i class="pi pi-check-circle text-green-500 text-2xl mb-2 block"></i>
            🎉 目前正式環境沒有任何慢速 API，後端運作極為流暢！
          </td>
        </tr>
      </ng-template>
    </p-table>
  `
})
export class BackendPerfTableComponent {
  @Input() data: any[] = [];
  @Output() onView = new EventEmitter<any>();
  @ViewChild('dt') table!: Table;

  getSeverity(count: number): 'success' | 'info' | 'warning' | 'danger' | undefined {
    if (count > 20) return 'danger';
    if (count > 5) return 'warning';
    return 'info';
  }
}
