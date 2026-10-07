/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { finalize } from 'rxjs';

import { untilDestroyed } from '@ngneat/until-destroy';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { formatAmount } from '@others/component/table/table.model';
import { FIN55050Service } from '../../../service/api/fin/fin55050.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

interface DetailRow {
  VouDate?: string | null;
  VouNo?: string | null;
  VouType_Name?: string | null;
  VouStatus?: string | null;
  ACCNO?: string | null;
  AccCName?: string | null;
  Org_Name?: string | null;
  NoteDesc?: string | null;
  AccAmt_D?: number | null;
  AccAmt_C?: number | null;
  Ven_Name?: string | null;
  Remark?: string | null;
}

interface VoucherMeta {
  vouDate: string;
  vouType: string;
  vouNo: string;
  vouStatus: string;
}

@Component({
  selector: 'app-fin55050-cru',
  standalone: true,
  imports: [
    MenubarComponent,
    TableReportComponent,
    TranslateModule,
    NgIf,
    ButtonComponent
  ],
  templateUrl: './fin55050-cru.component.html'
})
export class FIN55050CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  override ProgNo = 'FIN55050';
  crumbs: MenuItem[] = [
    { label: '人資財會模組' },
    { label: '總帳管理系統' },
    { label: '報表查詢' },
    { label: '分類帳', disabled: true }
  ];
  vouNo = '';
  initialized = false;
  meta: VoucherMeta | null = null;
  rows: (DetailRow & { __rowid: number; AccSubject: string })[] = [];
  // 後端提供的總計（對應欄位名稱）
  footerData: Record<string, number>[] = [];

  columns: ReportColumn[] = [
    { field: 'AccSubject', header: '會計科目', align: 'left' },
    { field: 'Ven_Name', header: '廠商編號/簡稱', align: 'left' },
    { field: 'Org_Name', header: '部門名稱', align: 'left' },
    { field: 'NoteDesc', header: '摘要', align: 'left' },
    { field: 'AccAmt_D', header: '借方金額', format: formatAmount, isTotal: true, align: 'right' },
    { field: 'AccAmt_C', header: '貸方金額', format: formatAmount, isTotal: true, align: 'right' },
    { field: 'Remark', header: '備註', align: 'left' },
  ];

  constructor(private fin55050Service: FIN55050Service) {
    super();
  }

  ngOnInit(): void {
    try {
      const savedProg = localStorage.getItem('FIN55050_CRU_PROGNO');
      this.ProgNo = savedProg && savedProg.trim() ? savedProg : 'FIN55050';
      if (!savedProg) localStorage.setItem('FIN55050_CRU_PROGNO', this.ProgNo);
    } catch {
      this.ProgNo = 'FIN55050';
      try { localStorage.setItem('FIN55050_CRU_PROGNO', this.ProgNo); } catch { }
    }
    try {
      this.initializePage(this.ProgNo);
    } catch (err) {
      this.messageService?.warnBubble?.('頁面初始化失敗。');
    }
    this.initialized = true;

    // 3) 讀取交接資料（vouNo）
    const handoff = this.readHandoffLocal();
    const vouNo = handoff?.vouNo ?? '';
    if (handoff?.fromRoute) (this as any).fromRoute = handoff.fromRoute;

    if (vouNo) {
      this.vouNo = vouNo;
      this.loadDetailAndClearOnSuccess(vouNo);
    } else {
      this.messageService?.warnBubble?.('缺少傳票號碼（vouNo）。');
    }
  }

  private readHandoffLocal(): { vouNo?: string; fromRoute?: string } | null {
    try {
      const raw = localStorage.getItem('FIN55050_CRU_HANDOFF');
      if (!raw) return null;
      const obj = JSON.parse(raw);
      return { vouNo: obj?.vouNo, fromRoute: obj?.fromRoute };
    } catch {
      return null;
    }
  }

  private loadDetailAndClearOnSuccess(vouNo: string): void {
    this.loading = true;
    this.fin55050Service
      .queryFIN55050Detail({ VouNo: vouNo })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (resp: any) => {
          const list: DetailRow[] = resp?.Data._VoucherDetails ?? [];
          if (!list.length) {
            this.rows = [];
            this.meta = null;
            this.footerData = [];
            this.messageService?.warnBubble?.('查無資料或傳票號碼不正確。');
            return;
          }
          const head = list[0];
          this.meta = {
            vouDate: head.VouDate ?? '',
            vouType: head.VouType_Name ?? '',
            vouNo: head.VouNo ?? vouNo,
            vouStatus: head.VouStatus ?? '',
          };
          this.rows = list.map((r, i) => ({
            ...r,
            __rowid: i + 1,
            AccSubject: [r.ACCNO ?? '', r.AccCName ?? ''].filter(Boolean).join(' ')
          }));
          // 後端總計欄位 -> 放到 footerData，table-report 顯示總計列
          this.footerData = [{
            AccAmt_D: Number(resp?.Data?.SUM_AccAmt_D) || 0,
            AccAmt_C: Number(resp?.Data?.SUM_AccAmt_C) || 0
          }];
          // 清除 handoff（避免舊資料干擾）
          localStorage.removeItem('FIN55050_CRU_HANDOFF');
        },
        error: () => {
          this.footerData = [];
          this.messageService?.errorBubble?.('載入傳票明細失敗。');
        },
      });
  }

  back(): void {
    this.router.navigate(['/account/fin/fin55050']);
    // 或：this.router.navigateByUrl('/account/fin/fin55050');
  }

  // 匯出
  PDFBtnLoading = false;
  onExportPDF(): void {
    if ((this.rows?.length ?? 0) === 0) return this.messageService?.warnBubble?.('目前沒有資料可匯出。');

    this.PDFBtnLoading = true;
    this.fin55050Service.exportFIN55050DetailPDF({
      VouNo: this.vouNo,
      SignatureDataType: 'FIN55050',
    })
      .pipe(untilDestroyed(this), finalize(() => (this.PDFBtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.pdf', '分類帳'),
        error: () => this.messageService?.warnBubble?.('匯出 PDF 失敗。'),
      });
  }

  private handleFileExport(resp: any, ext: '.pdf' | '.xlsx', baseName: string) {
    const blob = resp?.body instanceof Blob ? resp.body : resp;
    const fileName = `${baseName}_${new Date().getTime()}${ext}`;
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    globalThis.URL.revokeObjectURL(url);
  }
}
