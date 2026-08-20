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
import { MenuItem } from 'primeng/api';
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
  imports: [
    TranslateModule,
    NgIf,
    ButtonComponent,
    TableReportComponent
  ],
  templateUrl: './fin29050Report.component.html'
})
export class FIN29050ReportComponent implements OnInit {
  readonly brand = environment.brand;
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
  sumData: Record<string, number> | null = null;

  columns: ReportColumn[] = [
    { field: 'AccSubject', header: '會計科目', align: 'left' },
    { field: 'Ven_Name', header: '廠商編號/簡稱', align: 'left' },
    { field: 'Org_Name', header: '部門名稱', align: 'left' },
    { field: 'NoteDesc', header: '摘要', align: 'left' },
    { field: 'AccAmt_D', header: '借方金額', format: formatAmount, isTotal: true, align: 'right' },
    { field: 'AccAmt_C', header: '貸方金額', format: formatAmount, isTotal: true, align: 'right' },
    { field: 'Remark', header: '備註', align: 'left' },
  ];

  private readonly route = inject(ActivatedRoute);
  readonly isLoading = signal(false);
  PDFBtnLoading = false;

  constructor(
    private fin55050Service: FIN55050Service,
    private readonly messageService: NotificationService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(
      untilDestroyed(this),
      // 1. 確保有參數才動作，並過濾掉 undefined
      map(params => params['vouno']),
      filter(vouno => !!vouno),
      // 2. 側寫邏輯：設定 Loading 與變數
      tap(vouno => {
        console.log('偵測到單號:', vouno); // 除錯用
        this.vouNo = vouno;
        this.isLoading.set(true);
        this.initialized = false; // 重置初始化狀態
      }),

      // 3. 切換到 API 請求
      switchMap(vouno => this.fin55050Service.queryFIN55050Detail({ VouNo: vouno }).pipe(
        // 針對 API 報錯進行處理，避免整個 Stream 死掉
        finalize(() => this.isLoading.set(false))
      ))
    ).subscribe({
      next: (response) => {
        console.log('API 回傳資料:', response); // 除錯用
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

          this.sumData = {
            AccAmt_D: Number(response?.Data?.SUM_AccAmt_D) || 0,
            AccAmt_C: Number(response?.Data?.SUM_AccAmt_C) || 0
          };
        } else {
          this.rows = [];
          this.meta = null;
        }

        this.initialized = true; // 這裡一定要設為 true，HTML 才會渲染
      },
      error: (err) => {
        console.error('API 發生錯誤:', err);
        this.messageService.warnBubble('載入資料發生錯誤');
        this.initialized = true;
        this.isLoading.set(false);
      }
    });
  }

  onExportPDF(): void {
    const targetVouNo = this.vouNo || this.meta?.vouNo;
    if (!targetVouNo) {
      this.messageService?.warnBubble?.('目前沒有單號可匯出。');
      return;
    }

    this.PDFBtnLoading = true;
    this.fin55050Service.exportFIN55050DetailPDF({ VouNo: targetVouNo })
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.PDFBtnLoading = false))
      )
      .subscribe({
        next: (r) => this.handleFileExport(r, '.pdf', `分類帳_${targetVouNo}`),
        error: () => this.messageService?.warnBubble?.('匯出 PDF 失敗。'),
      });
  }

  private handleFileExport(resp: any, ext: '.pdf' | '.xlsx', baseName: string) {
    const blob = resp instanceof Blob ? resp : resp?.body instanceof Blob ? resp.body : new Blob([resp]);
    const fileName = `${baseName}_${new Date().getTime()}${ext}`;
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    globalThis.URL.revokeObjectURL(url);
  }
}
