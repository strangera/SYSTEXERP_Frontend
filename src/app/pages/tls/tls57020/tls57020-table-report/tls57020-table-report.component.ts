/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tls57020TableReportData } from '@service/api/tls/tls57020.service';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ReportColumn } from './tls57020-table-report.model';

@Component({
  selector: 'app-table-report',
  standalone: true,
  imports: [SkeletonModule, TableModule, CommonModule, ImageModule, ButtonModule, TooltipModule, MultiSelectModule, FormsModule],
  templateUrl: './tls57020-table-report.component.html',
  styleUrls: ['./tls57020-table-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableReportComponent implements OnChanges {
  @ViewChild('dt') public dt!: Table;
  @Input({ required: true }) data: Tls57020TableReportData | null = null;        // 用來儲存查詢結果
  Header: any[] = [];        // 用來儲存查詢結果
  PaymentDetails: any[] = [];        // 用來儲存查詢結果
  PaymentFooters: any[] = [];        // 用來儲存查詢結果
  InvoiceDetails: any[] = [];        // 用來儲存查詢結果
  @Input() columns: ReportColumn[] = [];        // 用來儲存查詢結果
  @Input() subColumns: ReportColumn[] = [];
  @Input() dataKey: string | undefined;         // 用來儲存查詢結果
  @Input() loading = false;
  // 管理 欄位
  @Input() groupRowsBy?: string;    // (小計)群組欄位
  groupTotals: Record<string, Record<string, number>> = {}; // 用於儲存每個群組的總計
  @Input() subTotalData: any;    // (小計)頁尾資料
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      this.Header = this.data.Header;
      this.PaymentDetails = this.data.PaymentDetails;
      this.PaymentFooters = this.data.PaymentFooters;
      this.InvoiceDetails = this.data.InvoiceDetails;
    }
  }
  trackByFn(index: number, item: any) {
    return item.VEN_No + '_' + (item.PUR_GUINo || index);
  }

  // 判斷是否應該渲染分組標題
  shouldRenderGroupHeader(col: ReportColumn, index: number, columns: ReportColumn[]): boolean {
    if (!col.groupField) {
      return false;
    }
    const currentGroup = col.groupField;
    for (let i = 0; i < index; i++) {
      const prev = columns[i];
      if (prev.groupField === currentGroup) {
        return false;
      }
    }
    return true;
  }

  // 計算分組欄位跨度
  getColumnSpan(columns: ReportColumn[], groupField: string): number {
    return columns.filter(col => col.groupField === groupField).length;
  }
  /**
   * 取得特定廠商的統計資料
   * @param venNo 廠商編號
   */
  getGroupFooterData(venNo: string) {
    if (!this.PaymentFooters) return null;
    return this.PaymentFooters.find(f => f.VEN_No === venNo);
  }
  // 取得廠商名稱
  getVenName(venNo: string): string {
    const header = this.Header.find(h => h.VEN_No === venNo);
    return header ? header.VEN_Name : '';
  }
  getGroupInvoiceDetails(venNo: string): any[] {
    return this.InvoiceDetails.filter(inv => inv.VEN_NO === venNo);
  }
  /**
 * 取得特定廠商的 Header 資訊 (包含付款日)
 */
  getHeaderInfo(venNo: string) {
    if (!this.Header) return null;
    // 找該廠商的第一筆 Header (通常只有一筆，除非 SQL 那邊有多出)
    return this.Header.find(h => h.VEN_No === venNo);
  }
}
