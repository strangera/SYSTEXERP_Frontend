import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN55050Service } from '@service/api/fin/fin55050.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { formatAmount } from '@others/component/table/table.model';
import { MenuItem } from 'primeng/api';
import { finalize } from 'rxjs';

interface DetailRow {
  VouDate?: string | null;
  VouNo?: string | null;
  VouType_Name?: string | null;
  VouStatus?: string | null;
  VoucherType?: string | null;
  VoucherType_Name?: string | null;
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
  VoucherType: string;
  VoucherType_Name: string;
  vouNo: string;
  vouStatus: string;
}

@Component({
  selector: 'app-fin55010-cru',
  standalone: true,
  imports: [TableReportComponent, TranslateModule, NgIf, ButtonComponent],
  templateUrl: './fin55010-cru.component.html'
})
export class FIN55010CRUComponent extends BasicCruPageComponent<any> implements OnInit, OnDestroy {
  override ProgNo = 'FIN55010';
  crumbs: MenuItem[] = [
    { label: '人資財會模組' },
    { label: '總帳管理系統' },
    { label: '報表查詢' },
    { label: '傳票列印', disabled: true }
  ];
  vouNo = '';
  initialized = false;
  meta: VoucherMeta | null = null;
  rows: (DetailRow & { __rowid: number; AccSubject: string })[] = [];
  footerData: { AccAmt_C?: number; AccAmt_D?: number }[] = [];
  columns: ReportColumn[] = [
    { field: 'AccSubject', header: '會計科目', visible: true, align: 'left' },
    { field: 'Ven_Name', header: '廠商編號/簡稱', visible: true, align: 'left' },
    { field: 'Org_Name', header: '部門名稱', visible: true, align: 'left' },
    { field: 'NoteDesc', header: '摘要', visible: true, align: 'left' },
    { field: 'AccAmt_D', header: '借方金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'AccAmt_C', header: '貸方金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'Remark', header: '備註', visible: true, align: 'left' },
  ];

  constructor(private fin55050Service: FIN55050Service) {
    super();
  }
  ngOnInit(): void {
    // 1) ProgNo：優先讀 localStorage；沒有就回寫預設值
    try {
      const savedProg = localStorage.getItem('FIN55010_CRU_PROGNO');
      this.ProgNo = savedProg && savedProg.trim() ? savedProg : 'FIN55010';
      if (!savedProg) localStorage.setItem('FIN55010_CRU_PROGNO', this.ProgNo);
    } catch {
      this.ProgNo = 'FIN55010';
      try { localStorage.setItem('FIN55010_CRU_PROGNO', this.ProgNo); } catch { }
    }

    // 2) 初始化頁面（註冊 Menubar 權限路徑）
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
      const raw = localStorage.getItem('FIN55010_CRU_HANDOFF');
      if (!raw) return null;
      const obj = JSON.parse(raw);
      return { vouNo: obj?.vouNo, fromRoute: obj?.fromRoute };
    } catch {
      return null;
    }
  }

  private loadDetailAndClearOnSuccess(vouNo: string): void {
    this.loading = true;
    this.fin55050Service.queryFIN55050Detail({ VouNo: vouNo }).pipe(finalize(() => (this.loading = false))).subscribe((resp: any) => {
      const list: DetailRow[] = resp?.Data._VoucherDetails ?? [];
      if (!list.length) {
        this.rows = [];
        this.meta = null;
        this.messageService?.warnBubble?.('查無資料或傳票號碼不正確。');
        return;
      }
      const head = list[0];
      this.meta = {
        vouDate: head.VouDate ?? '',
        vouType: head.VouType_Name ?? '',
        vouNo: head.VouNo ?? vouNo,
        vouStatus: head.VouStatus ?? '',
        VoucherType: head.VoucherType ?? '',
        VoucherType_Name: head.VoucherType_Name ?? ''
      };
      this.rows = list.map((r, i) => ({
        ...r,
        __rowid: i + 1,
        AccSubject: [r.ACCNO ?? '', r.AccCName ?? ''].filter(Boolean).join(' ')
      }));
      this.footerData = [{
        AccAmt_C: resp?.Data?.SUM_AccAmt_C,
        AccAmt_D: resp?.Data?.SUM_AccAmt_D,
      }]
      // 清除 handoff（避免舊資料干擾）
      // localStorage.removeItem('FIN55010_CRU_HANDOFF');
    });
  }

  back(): void {
    this.router.navigate(['/account/fin/fin55010']);
    // 或：this.router.navigateByUrl('/account/fin/fin55010');
  }

  // 匯出
  PDFBtnLoading = false;
  onExportPDF(): void {
    if ((this.rows?.length ?? 0) === 0) return this.messageService?.warnBubble?.('目前沒有資料可匯出。');

    this.PDFBtnLoading = true;
    this.fin55050Service.exportFIN55050DetailPDF({
      VouNo: this.vouNo,
      SignatureDataType: 'FIN55010',
    })
      .pipe(untilDestroyed(this), finalize(() => (this.PDFBtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.pdf', '分類帳'),
        error: () => this.messageService?.warnBubble?.('匯出 PDF 失敗。'),
      });
  }

  private handleFileExport(resp: any, ext: '.pdf' | '.xlsx', baseName: string) {
    const blob = resp?.body instanceof Blob ? resp.body : resp;
    const cd = resp?.headers?.get?.('Content-Disposition') ?? resp?.headers?.get?.('content-disposition');
    const fileName = this.getFilenameFromHeader(cd, ext) ?? `${baseName}_${new Date().getTime()}${ext}`;
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    globalThis.URL.revokeObjectURL(url);
  }

  private getFilenameFromHeader(contentDisposition: string | null | undefined, ext: string): string | null {
    if (!contentDisposition) return null;

    const filenameStarMatch = /filename\*=([^;]+)/i.exec(contentDisposition);
    if (filenameStarMatch?.[1]) {
      const raw = filenameStarMatch[1].trim();
      const encoded = raw.replace(/^UTF-8''/i, '').replace(/^"(.*)"$/, '$1');
      try {
        const decoded = decodeURIComponent(encoded);
        return this.ensureExtension(this.sanitizeFilename(decoded), ext);
      } catch {
        return this.ensureExtension(this.sanitizeFilename(encoded), ext);
      }
    }

    const filenameMatch = /filename="([^"]+)"/i.exec(contentDisposition);
    if (filenameMatch?.[1]) {
      const raw = filenameMatch[1].trim();
      try {
        return this.ensureExtension(this.sanitizeFilename(decodeURIComponent(raw.replace(/\+/g, ' '))), ext);
      } catch {
        return this.ensureExtension(this.sanitizeFilename(raw), ext);
      }
    }

    return null;
  }

  private sanitizeFilename(name: string): string {
    return name.replace(/[\u0000-\u001F\\/:*?"<>|]+/g, '_').trim();
  }

  private ensureExtension(name: string, ext: string): string {
    if (!name) return name;
    if (name.toLowerCase().endsWith(ext.toLowerCase())) return name;
    return `${name}${ext}`;
  }
  ngOnDestroy(): void {
    localStorage.removeItem('FIN55010_CRU_HANDOFF');
    localStorage.removeItem('FIN55010_CRU_PROGNO');
  }
}
