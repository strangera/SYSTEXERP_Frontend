/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { PrimeTemplate, SortMeta } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ReportColumn } from '../../table-report.model';
@Component({
  selector: 'app-table-expansion',
  template: `
  <div>
    <p-table class="w-full" [value]="localRowData" [columns]="expansionColumns"
      [multiSortMeta]="expansionMultiSortMeta" [scrollable]="true" [scrollHeight]="scrollHeight" sortMode="multiple"
      [paginator]="showPaginator" [rows]="rows" [totalRecords]="totalRecords" [(first)]="first"
      (onPage)="onPageChange($event)" [rowsPerPageOptions]="rowsPerPageOptions" [showCurrentPageReport]="true"
      currentPageReportTemplate="第{currentPage}頁 / 總共{totalPages}頁 (總筆數:{totalRecords})"
      paginatorStyleClass="p-paginator-sm" styleClass="p-datatable-sm p-datatable-gridlines p-2"
      paginatorDropdownAppendTo="body">

      <!-- 表頭 -->
      <ng-template pTemplate="header" let-columns>
        <tr>
          <th *ngIf="expansionShowReorder" class="w-1rem">序號</th>
          <th *ngFor="let col of expansionColumns" [pSortableColumn]="col.field"
            [pSortableColumnDisabled]="expansionShowSort === false" class="text-center">
            {{ col.header }}
            <p-sortIcon *ngIf="expansionShowSort" [field]="col.field"></p-sortIcon>
          </th>
        </tr>
      </ng-template>

      <!-- 表身 -->
      <ng-template pTemplate="body" let-rowData let-columns="columns" let-rowIndex="rowIndex">
        <tr>
          <td *ngIf="expansionShowReorder" class="text-center serial-cell">{{ first + rowIndex + 1 }}</td>
          <td *ngFor="let col of expansionColumns" class="text-center">
            <span *ngIf="rowData[col.field] !== undefined && rowData[col.field] !== null && !col.type">
              {{ col.format ? col.format(rowData[col.field], rowIndex, rowData) : rowData[col.field] }}
            </span>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="summary">
        <div class="flex align-items-center justify-content-between p-1" [style.background]="'var(--table-header-bg)'">
          <div class="flex align-items-center">
            <span>
              明細總筆數: {{ totalRecords }} 筆
            </span>
          </div>
        </div>
      </ng-template>
      <!-- 空資料訊息 -->
      <ng-template pTemplate="emptymessage">
        <tr>
          <td [attr.colspan]="expansionColumns.length + (expansionShowReorder ? 1 : 0)">
            <div class="flex justify-content-center align-items-center" [style.height]="scrollHeight">
              <p class="text-xl font-bold">查無展開資料</p>
            </div>
          </td>
        </tr>
      </ng-template>
    </p-table>
  </div>
  `,
  styles: [`
    // 序號欄：純數字不需要斷行，避免三位數以上被全域 word-break: break-all 斷成兩行。
    // 用額外的 .serial-cell class 疊加特異度蓋過全域規則，不動全域 styles.scss。
    :host ::ng-deep .p-datatable-tbody > tr > td.serial-cell {
      white-space: nowrap !important;
      word-break: normal !important;
      overflow-wrap: normal !important;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TableModule, PrimeTemplate, NgFor, NgIf, CommonModule]
})
export class TableExpansionComponent implements OnInit {
  @Input() expansionDataKey = 'id';
  @Input() expansionColumns: ReportColumn[] = [];
  @Input() rowData: any;
  @Input() expansionMultiSortMeta: SortMeta[] = [{ field: this.expansionDataKey, order: 1 }];
  @Input() expansionShowSort = true;
  @Input() expansionShowReorder = false;
  // 新增分頁相關參數
  @Input() showPaginator = false;          // 是否顯示分頁器
  @Input() rows = 30;                     // 每頁顯示行數
  @Input() rowsPerPageOptions = [30, 60, 90, 120, 150]; // 分頁選項
  @Input() scrollHeight = '300px';        // 表格高度
  localRowData: any[] = [];
  isExpanded = false;
  // 分頁相關屬性
  totalRecords = 0;                       // 總記錄數
  first = 0;                              // 當前起始索引

  constructor(private readonly cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.localRowData = this.rowData[this.expansionDataKey] || [];
      this.totalRecords = this.localRowData.length;
      this.isExpanded = true;

      // 強制觸發變更偵測
      this.cdr.detectChanges();
    });
  }

  // 分頁變更事件
  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }
}
