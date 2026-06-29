import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-client-api-error-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, TagModule],
  template: `
    <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 mb-3">
      <div class="flex align-items-center gap-2">
        <i class="pi pi-wifi text-orange-600 text-2xl"></i>
        <div>
          <h3 class="text-xl font-bold m-0 text-orange-800">前端遭遇的 API 錯誤</h3>
          <small class="text-500">使用者端視角（4xx / 5xx / timeout / 網路斷線）</small>
        </div>
      </div>

      <span class="p-input-icon-left w-full md:w-20rem">
        <i class="pi pi-search"></i>
        <input pInputText type="text" class="w-full p-inputtext-sm"
               (input)="dt.filterGlobal($any($event.target).value, 'contains')"
               placeholder="搜尋發生錯誤的前端頁面..." />
      </span>
    </div>

    <p-table #dt [value]="data" [rows]="5" [paginator]="true"
             styleClass="p-datatable-striped p-datatable-gridlines p-datatable-sm shadow-1"
             [tableStyle]="{ 'min-width': '50rem' }"
             [globalFilterFields]="['ActionName']">

      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="ActionName" style="width: 45%">發生錯誤的前端頁面 <p-sortIcon field="ActionName"></p-sortIcon></th>
          <th pSortableColumn="LogDate" style="width: 18%">偵測日期 <p-sortIcon field="LogDate"></p-sortIcon></th>
          <th pSortableColumn="AlertCount" style="width: 18%" class="text-center">本日累積 <p-sortIcon field="AlertCount"></p-sortIcon></th>
          <th style="width: 19%" class="text-center">操作</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-row>
        <tr>
          <td>
            <span class="p-column-title">頁面</span>
            <span class="text-orange-700 font-semibold">{{ row.ActionName.replace('Api_', '') }}</span>
          </td>
          <td><span class="p-column-title">日期</span>{{ row.LogDate }}</td>
          <td class="text-center">
            <span class="p-column-title">次數</span>
            <p-tag [severity]="getSeverity(row.AlertCount)" [value]="row.AlertCount + ' 次'"></p-tag>
          </td>
          <td class="text-center">
            <p-button icon="pi pi-list" label="明細"
                      styleClass="p-button-sm p-button-warning p-button-text font-bold"
                      (onClick)="onView.emit(row)">
            </p-button>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="4" class="text-center p-5 text-500">
            <i class="pi pi-check-circle text-green-500 text-2xl mb-2 block"></i>
            🎉 目前沒有任何使用者端回報的 API 錯誤！
          </td>
        </tr>
      </ng-template>
    </p-table>
  `
})
export class ClientApiErrorTableComponent {
  @Input() data: any[] = [];
  @Output() onView = new EventEmitter<any>();
  @ViewChild('dt') table!: Table;

  getSeverity(count: number): 'success' | 'info' | 'warning' | 'danger' | undefined {
    if (count > 20) return 'danger';
    if (count > 5) return 'warning';
    return 'info';
  }
}
