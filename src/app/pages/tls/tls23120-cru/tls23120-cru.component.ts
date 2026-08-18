/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DatePipe,
  DecimalPipe,
  Location,
  NgClass,
  NgFor,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import * as XLSX from 'xlsx-js-style';

import { ButtonComponent } from '@shared/components/button/button.component';
import { TLS23120Service } from '../../../service/api/tls/tls23120.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

interface SubTable {
  tltId: string;
  rows: any[];
  subtotal: Record<string, number>;
}

interface TltGroup {
  tltNo: string;
  header: {
    tltNo: string;
    tltName: string;
    busType?: string;
    busTypeName?: string;
    floor?: string;
    area?: string;
    txnDate?: string;
    day_lock?: string;
  };
  subTables: SubTable[];
  grandAll: Record<string, number>;
}

@Component({
  selector: 'app-tls23120-cru',
  templateUrl: './tls23120-cru.component.html',
  styleUrls: ['./tls23120-cru.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    DialogModule,
    FormsModule,
    ButtonDirective,
    NgFor,
    NgIf,
    TableModule,
    PrimeTemplate,
    NgClass,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    DatePipe,
    DecimalPipe,
    ButtonComponent,
  ],
})
export class TLS23120CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  data: any[] = [];
  dataForm = this.formBuilder.nonNullable.group({ showBusType: true });

  printedAt = '';
  queryFormValue: any;

  /** ✅ 後端匯出用 body（由查詢頁帶進來） */
  exportBody: any | null = null;

  subtotalFields: string[] = [
    'sad_sale_qty',
    'sad_sale_namt',
    'sad_sale_tax',
    'sad_sale_amt',
    'sad_preorder_qty',
    'sad_preorder_amt',
    'sad_settle_qty',
    'sad_settle_amt',
    'return_qty',
    'return_amt',
    'total_count',
  ];

  selectedColumns: any[] = [];
  availableColumns: any[] = [];
  tltGroups: TltGroup[] = [];

  constructor(
    private location: Location,
    private tls23120Service: TLS23120Service,
  ) { super(); }

  columns = [
    { field: 'SYS_Name', header: '區分', visible: true },
    { field: 'sad_sale_qty', header: '銷貨筆數', visible: true },
    { field: 'sad_sale_namt', header: '淨銷貨', visible: true, style: 'text-right', format: (v: any) => this.moneyFormat(v) },
    { field: 'sad_sale_tax', header: '營業稅', visible: true, style: 'text-right', format: (v: any) => this.moneyFormat(v) },
    { field: 'sad_sale_amt', header: '銷貨金額', visible: true, style: 'text-right', format: (v: any) => this.moneyFormat(v) },
    { field: 'sad_preorder_qty', header: '預售筆數', visible: true },
    { field: 'sad_preorder_amt', header: '預售金額', visible: true, style: 'text-right', format: (v: any) => this.moneyFormat(v) },
    { field: 'sad_settle_qty', header: '結帳筆數', visible: true },
    { field: 'sad_settle_amt', header: '結帳金額', visible: true, style: 'text-right', format: (v: any) => this.moneyFormat(v) },
  ];

  private compareNullable(a?: string | number | null, b?: string | number | null) {
    const aa = (a ?? '').toString();
    const bb = (b ?? '').toString();
    return aa.localeCompare(bb, undefined, { numeric: true, sensitivity: 'base' });
  }

  private rowComparator = (x: any, y: any) => {
    const byBusType = this.compareNullable(x?.bus_type, y?.bus_type);
    if (byBusType !== 0) return byBusType;
    const byTltNo = this.compareNullable(x?.TLT_NO, y?.TLT_NO);
    if (byTltNo !== 0) return byTltNo;
    return this.compareNullable(x?.TLT_ID, y?.TLT_ID);
  };

  async ngOnInit(): Promise<void> {
    const state = history.state;

    const showBusTypeValue = state?.queryFormValue?.ShowBusType ?? true;
    this.dataForm.get('showBusType')?.setValue(showBusTypeValue);

    this.availableColumns = this.columns;

    this.exportBody = state?.exportBody ?? null;
    this.queryFormValue = state?.queryFormValue ?? null;

    if (state?.data && Array.isArray(state.data)) {
      this.data = [...state.data].sort(this.rowComparator);
      this.printedAt = new Date().toLocaleString('zh-TW');
    } else {
      this.messageService.warnBubble('⚠️ 無資料可顯示，請重新查詢。');
    }

    this.buildSelectedColumns();
    this.buildTltGroups();
    this.initializePage('TLS23120', this.dataForm);
  }

  buildSelectedColumns(): void {
    const withIndex = [{ header: '序號', field: '__index' }];
    this.selectedColumns = withIndex.concat(this.columns);
  }

  private calcSum(rows: any[], fields: string[]): Record<string, number> {
    const out: Record<string, number> = {};
    for (const f of fields) out[f] = 0;
    for (const r of rows) {
      for (const f of fields) {
        const v = Number(String(r?.[f] ?? 0).toString().replace(/,/g, ''));
        if (Number.isFinite(v)) out[f] += v;
      }
    }
    return out;
  }

  private buildTltGroups(): void {
    const map = new Map<string, any[]>();
    this.data.forEach(row => {
      const key = row?.TLT_NO ?? '未分類';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    });

    const groups: TltGroup[] = [];

    Array.from(map.entries())
      .sort((a, b) => this.compareNullable(a[0], b[0]))
      .forEach(([tltNo, rowsOfThisTlt]) => {
        const subMap = new Map<string, any[]>();
        rowsOfThisTlt.forEach(r => {
          const id = (r?.TLT_ID ?? '').toString();
          if (!subMap.has(id)) subMap.set(id, []);
          subMap.get(id)!.push(r);
        });

        const first = rowsOfThisTlt[0] ?? {};
        const header = {
          tltNo,
          tltName: first?.tlt_name ?? '',
          busType: first?.bus_type ?? '',
          busTypeName: first?.bus_type_name ?? '',
          floor: first?.floor_desc ?? first?.FLOOR_NO ?? '－',
          area: first?.AREA_NO ?? first?.area_no ?? '－',
          txnDate: first?.TXN_DATE ?? first?.sad_date ?? '',
          day_lock: first?.day_lock ?? 'N',
        };

        const grandAll = this.calcSum(rowsOfThisTlt, this.subtotalFields);

        const subTables: SubTable[] = Array.from(subMap.entries())
          .sort((a, b) => this.compareNullable(a[0], b[0]))
          .map(([tltId, rows]) => ({
            tltId,
            rows,
            subtotal: this.calcSum(rows, this.subtotalFields),
          }));

        groups.push({ tltNo, header, subTables, grandAll });
      });

    this.tltGroups = groups;
  }

  // --- UI helpers ---
  get showBusType(): boolean {
    return !!this.dataForm.get('showBusType')?.value;
  }

  moneyFormat(value: any): string {
    const n = Number(String(value ?? 0).replace(/,/g, ''));
    return isFinite(n) ? n.toLocaleString('en-US') : '0';
  }


  private ensureArray(v: any): string[] | null {
    if (v == null || v === '') return null;
    if (Array.isArray(v)) return v.filter(x => x != null && x !== '');
    return [v];
  }

  // =========================
  //        匯出 PDF（改後端）
  // =========================
  exportPDF(): void {
    if (!this.exportBody) {
      this.messageService.warnBubble('⚠️ 匯出參數遺失，請回查詢頁重新查詢後再進入。');
      return;
    }

    // 依 swagger：bus_type / tlt_building / area_no / tlt_floor / org_id 是陣列
    const payload = {
      ...this.exportBody,
      bus_type: this.ensureArray(this.exportBody?.bus_type),
      tlt_building: this.ensureArray(this.exportBody?.tlt_building),
      area_no: this.ensureArray(this.exportBody?.area_no),
      tlt_floor: this.ensureArray(this.exportBody?.tlt_floor),
      org_id: this.ensureArray(this.exportBody?.org_id),
      ShowBusType: this.showBusType,
    };

    // 清空值
    Object.keys(payload).forEach((k) => {
      const v: any = (payload as any)[k];
      if (v === '' || v === null || v === undefined) delete (payload as any)[k];
      if (Array.isArray(v) && v.length === 0) delete (payload as any)[k];
    });

    const fallbackName = `專櫃日對帳單_${payload?.TXN_Date ?? new Date().toISOString().slice(0, 10)}.pdf`;

    this.messageService?.blockUi();
    this.tls23120Service.exportTLS23120PDF(payload).pipe(
      finalize(() => this.messageService?.unblockUi())
    ).subscribe({
      next: (resp) => this.downloadBlob(resp, fallbackName),
      error: () => this.messageService.errorBubble?.('PDF 匯出失敗'),
    });
  }

  private downloadBlob(resp: any, fileName: string) {
    const blob = resp?.body as Blob | undefined;
    if (!blob) return;

    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    globalThis.URL.revokeObjectURL(url);
  }

  // =========================
  //        匯出 Excel（你原本 그대로）
  // =========================
  exportExcel(): void {
    const wb = XLSX.utils.book_new();

    const chunk3 = (arr: string[]) => {
      const out: any[] = [];
      for (let i = 0; i < arr.length; i += 3) {
        out.push([arr[i] ?? '', arr[i + 1] ?? '', arr[i + 2] ?? '']);
      }
      return out;
    };

    this.tltGroups.forEach((group: any) => {
      const aoa: any[][] = [];
      let maxTableCols = 3;

      group.subTables.forEach((sub: any, si: number) => {
        const firstRow = sub?.rows?.[0] ?? {};
        const totalCount = Number(firstRow?.total_count ?? 0);
        const returnQty = Number(firstRow?.return_qty ?? 0);
        const returnAmt = Number(firstRow?.return_amt ?? 0);

        if (si === 0) {
          aoa.push(['精誠資訊', '專櫃日對帳單', '']);

          const infoItems: string[] = [
            this.showBusType
              ? `大分類：${`${group.header.busType ?? ''}/${group.header.busTypeName ?? ''}`.replace(/\/$/, '')}`
              : '大分類：',
            `銷售日期：${this.formatDate(group.header.txnDate || '')}`,
            `製表日期：${this.printedAt}`,

            `專櫃：${group.header.tltNo} / ${group.header.tltName}`,
            `樓層：${group.header.floor || '－'}  抽成類別：${sub.tltId || '無'}`,
            `交易總件數／退貨件數：${totalCount} / ${returnQty}`,

            `區域：${group.header.area || '－'}`,
            '',
            `退貨金額：${this.moneyFormat(returnAmt)}`,
          ];
          aoa.push(...chunk3(infoItems));
          aoa.push(['']);
        } else {
          aoa.push([`抽成類別：${sub.tltId || '無'}`, '', '']);
        }

        const headers = ['序號', ...this.selectedColumns.filter((c: any) => c.field !== '__index').map((c: any) => c.header)];
        aoa.push(headers);
        maxTableCols = Math.max(maxTableCols, headers.length);

        sub.rows.forEach((r: any, idx: number) => {
          const row = [
            idx + 1,
            ...this.selectedColumns
              .filter((c: any) => c.field !== '__index')
              .map((c: any) => (typeof c.format === 'function' ? c.format(r[c.field]) : r[c.field]) ?? ''),
          ];
          aoa.push(row);
        });

        aoa.push([
          '小計',
          ...this.selectedColumns
            .filter((c: any) => c.field !== '__index')
            .map((c: any) => (this.subtotalFields.includes(c.field) ? this.moneyFormat(sub.subtotal[c.field] ?? 0) : '')),
        ]);

        if (si === group.subTables.length - 1) {
          aoa.push([
            '總計',
            ...this.selectedColumns
              .filter((c: any) => c.field !== '__index')
              .map((c: any) => (this.subtotalFields.includes(c.field) ? this.moneyFormat(group.grandAll[c.field] ?? 0) : '')),
          ]);
        }

        aoa.push(['']);
      });

      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws['!cols'] = Array(Math.max(maxTableCols, 3)).fill({ wch: 20 });

      const safeName = `${group.header.tltNo}`.substring(0, 31).replace(/[\\/?*\[\]]/g, '_');
      XLSX.utils.book_append_sheet(wb, ws, safeName || '報表');
    });

    const fileName = `專櫃日對帳單_${new Date().toISOString()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
  }

  override onCancel(): void {
    this.router.navigate(['/account/tls/tls23120'], {
      state: {
        fromCru: true,
        fromRoute: this.router.url
      }
    });
  }
}
