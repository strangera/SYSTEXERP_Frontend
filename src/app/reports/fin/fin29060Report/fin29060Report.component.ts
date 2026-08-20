import { NgIf } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '@shared/components/notification-message/notification.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { formatAmount } from '@others/component/table/table.model';
import { filter, finalize, map, switchMap, tap } from 'rxjs';
import { FIN55050Service } from '../../../service/api/fin/fin55050.service';
import { environment } from 'src/environments/environment';

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

@UntilDestroy()
@Component({
  selector: 'app-fin29050-report',
  standalone: true,
  imports: [TableReportComponent, TranslateModule, NgIf, ButtonComponent],
  templateUrl: './fin29060Report.component.html'
})
export class FIN29060ReportComponent implements OnInit {
  readonly brand = environment.brand;
  vouNo = '';
  initialized = false;
  meta: VoucherMeta | null = null;
  rows: (DetailRow & { __rowid: number; AccSubject: string })[] = [];
  footerData: Record<string, number>[] = [];

  columns: ReportColumn[] = [
    { field: 'AccSubject', header: '會計科目', visible: true },
    { field: 'Ven_Name', header: '廠商編號/簡稱', visible: true },
    { field: 'Org_Name', header: '部門名稱', visible: true },
    { field: 'NoteDesc', header: '摘要', visible: true },
    { field: 'AccAmt_D', header: '借方金額', visible: true, format: formatAmount, isTotal: true },
    { field: 'AccAmt_C', header: '貸方金額', visible: true, format: formatAmount, isTotal: true },
    { field: 'Remark', header: '備註', visible: true },
  ];

  private readonly route = inject(ActivatedRoute);
  private readonly fin55050Service = inject(FIN55050Service);
  private readonly messageService = inject(NotificationService);

  readonly isLoading = signal(false);
  PDFBtnLoading = false;

  ngOnInit(): void {
    this.route.queryParams.pipe(
      untilDestroyed(this),
      map(params => params['vouno']),
      filter(vouno => !!vouno), // 只有網址有 vouno 參數時才繼續
      tap(vouno => {
        this.vouNo = vouno;
        this.isLoading.set(true);
        this.initialized = false;
      }),
      // 切換至 API 請求
      switchMap(vouno => this.fin55050Service.queryFIN55050Detail({ VouNo: vouno }).pipe(
        finalize(() => this.isLoading.set(false))
      ))
    ).subscribe({
      next: (response) => {
        const list: DetailRow[] = response?.Data?._VoucherDetails ?? [];
        if (list.length > 0) {
          const head = list[0];
          this.meta = {
            vouDate: head.VouDate ?? '',
            vouType: head.VouType_Name ?? '',
            vouNo: head.VouNo ?? '',
            vouStatus: head.VouStatus ?? '',
          };

          this.rows = list.map((r, i) => ({
            ...r,
            __rowid: i + 1,
            AccSubject: [r.ACCNO ?? '', r.AccCName ?? ''].filter(Boolean).join(' ')
          }));

          this.footerData = [{
            AccAmt_D: Number(response?.Data?.SUM_AccAmt_D) || 0,
            AccAmt_C: Number(response?.Data?.SUM_AccAmt_C) || 0
          }];
        } else {
          this.rows = [];
          this.meta = null;
          this.footerData = [];
        }
        this.initialized = true; // 這裡一定要設為 true，HTML 抬頭才會出現
      },
      error: (err) => {
        console.error('API Error:', err);
        this.messageService.warnBubble('載入傳票明細發生錯誤');
        this.footerData = [];
        this.initialized = true;
        this.isLoading.set(false);
      }
    });
  }

  onExportPDF(): void {
    const targetVouNo = this.vouNo || this.meta?.vouNo;
    if (!targetVouNo) return;
    this.PDFBtnLoading = true;
    this.fin55050Service.exportFIN55050DetailPDF({ VouNo: targetVouNo })
      .pipe(untilDestroyed(this), finalize(() => (this.PDFBtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.pdf', `轉帳傳票_${targetVouNo}`),
        error: () => this.messageService.warnBubble('列印失敗'),
      });
  }

  private handleFileExport(resp: any, ext: string, baseName: string) {
    const blob = resp instanceof Blob ? resp : resp?.body instanceof Blob ? resp.body : new Blob([resp]);
    const fileName = `${baseName}_${new Date().getTime()}${ext}`;
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click();
    globalThis.URL.revokeObjectURL(url);
  }
}
