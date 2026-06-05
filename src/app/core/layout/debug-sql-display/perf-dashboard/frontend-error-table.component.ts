import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-frontend-error-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, TagModule],
  template: `
    <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 mb-3">
      <div class="flex align-items-center gap-2">
        <i class="pi pi-desktop text-pink-600 text-2xl"></i>
        <div>
          <h3 class="text-xl font-bold m-0 text-pink-800">2. 純前端 Runtime 異常紀錄</h3>
          <small class="text-500">天羅地網全域捕捉</small>
        </div>
      </div>

      <span class="p-input-icon-left w-full md:w-20rem">
        <i class="pi pi-search"></i>
        <input pInputText type="text" class="w-full p-inputtext-sm"
               (input)="dt.filterGlobal($any($event.target).value, 'contains')"
               placeholder="搜尋類型/目錄/前端功能..." />
      </span>
    </div>

    <p-table #dt [value]="data" [rows]="5" [paginator]="true"
             styleClass="p-datatable-striped p-datatable-gridlines p-datatable-sm shadow-1"
             [tableStyle]="{ 'min-width': '50rem' }"
             [globalFilterFields]="['MainModule', 'SubTask', 'ActionName']">

      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="MainModule" style="width: 15%">類型 <p-sortIcon field="MainModule"></p-sortIcon></th>
          <th pSortableColumn="SubTask" style="width: 15%">分類目錄 <p-sortIcon field="SubTask"></p-sortIcon></th>
          <th pSortableColumn="ActionName" style="width: 30%">發生錯誤的前端 Page / 功能 <p-sortIcon field="ActionName"></p-sortIcon></th>
          <th pSortableColumn="LogDate" style="width: 15%">偵測日期 <p-sortIcon field="LogDate"></p-sortIcon></th>
          <th pSortableColumn="AlertCount" style="width: 13%" class="text-center">本日爆發次數 <p-sortIcon field="AlertCount"></p-sortIcon></th>
          <th style="width: 12%" class="text-center">操作</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-row>
        <tr>
          <td><span class="p-column-title">類型</span><p-tag severity="danger" [value]="row.MainModule"></p-tag></td>
          <td><span class="p-column-title">分類目錄</span>{{ row.SubTask }}</td>
          <td>
            <span class="p-column-title">功能</span>
            <span class="text-pink-700 font-semibold">{{ row.ActionName.replace('Client_', '') }}</span>
          </td>
          <td><span class="p-column-title">日期</span>{{ row.LogDate }}</td>
          <td class="text-center">
            <span class="p-column-title">次數</span>
            <span class="p-badge p-badge-danger p-badge-lg font-bold">{{ row.AlertCount }}</span>
          </td>
          <td class="text-center">
            <p-button icon="pi pi-code" label="堆疊"
                      styleClass="p-button-sm p-button-danger p-button-text font-bold"
                      (onClick)="onView.emit(row)">
            </p-button>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="6" class="text-center p-5 text-500">
            <i class="pi pi-heart-fill text-pink-500 text-2xl mb-2 block"></i>
            🎉 太棒了！今天前端沒抓到任何 JavaScript 運行崩潰錯誤！
          </td>
        </tr>
      </ng-template>
    </p-table>
  `
})
export class FrontendErrorTableComponent {
  @Input() data: any[] = [];
  @Output() onView = new EventEmitter<any>();
  @ViewChild('dt') table!: Table;
}
