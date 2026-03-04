import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ASS12050Detail } from '@pages/ass/ass12050/ass12050.model';
import { ASS12050Service } from '@service/api/ass/ass12050.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { formatDate } from '@shared/componentkit/table-report/table-report.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { CurrentPageService } from '../../../core/layout/app.menulist/current-page.service';

/** 主檔表格一筆（用於表格式顯示） */
interface MasterTableRow {
  _masterKey: string;
  SUBCHECK_ID: string | null;
  APPLY_USER_DISPLAY: string;
  ORG_DISPLAY: string;
  EMP_DISPLAY: string;
  APPLY_DATE: string | null;
  SUPPLIER_DISPLAY: string;
  CHECK_STATUS: string | null;
  DETAIL_CNT: number;
}

/** 3.1.2.5 採購單驗收作業 - 編輯主檔（唯讀主檔 + 明細列表） */
@UntilDestroy()
@Component({
  selector: 'app-ass12050-master',
  templateUrl: './ass12050-master.component.html',
  styleUrl: './ass12050-master.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    TableComponent,
  ],
})
export class ASS12050MasterComponent implements OnInit {
  readonly ProgNo = 'ASS12050';

  /** 驗收單號（從導航 state 取得） */
  subcheckId: string | null = null;

  /** 主檔資料（唯讀顯示用） */
  masterData: ASS12050Detail | null = null;

  /** 主檔表格資料（1 筆，表格式顯示） */
  masterTableData: MasterTableRow[] = [];

  /** 主檔表格已選列（用於結案勾選） */
  selectedMasterRows: MasterTableRow[] = [];

  /** 主檔表格欄位 */
  masterColumns: Column[] = [
    { field: 'SUBCHECK_ID', header: '驗收單號' },
    { field: 'APPLY_USER_DISPLAY', header: '驗收人' },
    { field: 'ORG_DISPLAY', header: '部門代號' },
    { field: 'EMP_DISPLAY', header: '申請人代號' },
    { field: 'APPLY_DATE', header: '申請日期' },
    { field: 'SUPPLIER_DISPLAY', header: '供應商代號' },
    { field: 'CHECK_STATUS', header: '驗收單狀態' },
    { field: 'DETAIL_CNT', header: '明細筆數' },
  ];

  loading = false;


  constructor(
    private readonly router: Router,
    private readonly ass12050Service: ASS12050Service,
    private readonly currentPageService: CurrentPageService,
    private readonly messageService: NotificationService,
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { rowdata?: { SUBCHECK_ID?: string } } | undefined;
    const rowdata = state?.rowdata;
    this.subcheckId = rowdata?.SUBCHECK_ID ?? null;
  }

  ngOnInit(): void {
    this.currentPageService.setCurrentProgNo(this.ProgNo);

    if (!this.subcheckId) {
      this.router.navigate(['account/ass/ass12050']);
      return;
    }

    this.loadDetail();
  }

  private loadDetail(): void {
    if (!this.subcheckId) return;
    this.loading = true;
    this.ass12050Service
      .detailASS12050({ SUBCHECK_ID: this.subcheckId })
      .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          const d = res.Data;
          this.masterData = d ?? null;

          if (d) {
            const applyUserDisplay = d.APPLY_USER_ID && d.APPLY_USER_NAME
              ? `${d.APPLY_USER_ID}/${d.APPLY_USER_NAME}`
              : (d.APPLY_USER_ID ?? d.APPLY_USER_NAME ?? '');
            const orgDisplay = d.ORG_ID && d.ORG_NAME
              ? `${d.ORG_ID}/${d.ORG_NAME}`
              : (d.ORG_ID ?? d.ORG_NAME ?? '');
            const empDisplay = d.EMP_ID && d.EMP_NAME
              ? `${d.EMP_ID}/${d.EMP_NAME}`
              : (d.EMP_ID ?? d.EMP_NAME ?? '');
            const supplierDisplay = d.SUPPLIER_ID && d.SUPPLIER_NAME
              ? `${d.SUPPLIER_ID}/${d.SUPPLIER_NAME}`
              : (d.SUPPLIER_ID ?? d.SUPPLIER_NAME ?? '');
            const row: MasterTableRow = {
              _masterKey: this.subcheckId ?? '',
              SUBCHECK_ID: d.SUBCHECK_ID ?? null,
              APPLY_USER_DISPLAY: applyUserDisplay,
              ORG_DISPLAY: orgDisplay,
              EMP_DISPLAY: empDisplay,
              APPLY_DATE: d.APPLY_DATE ? formatDate(d.APPLY_DATE) : null,
              SUPPLIER_DISPLAY: supplierDisplay,
              CHECK_STATUS: d.CHECK_STATUS_NAME ?? d.CHECK_STATUS ?? null,
              DETAIL_CNT: d.Details?.length ?? 0,
            };
            this.masterTableData = [row];
            this.selectedMasterRows = [row];
          }
        },
      });
  }

  /** 列印採購驗收單 */
  onPrint(): void {
    if (!this.subcheckId) return;
    this.loading = true;
    this.ass12050Service
      .exportPDFASS12050({ SUBCHECK_ID: this.subcheckId })
      .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
      .subscribe({
        next: res => {
          const blob = res.body;
          if (!blob) {
            this.messageService.errorBubble('報表下載失敗');
            return;
          }
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ASS12050_${this.subcheckId}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.messageService.successBubble('報表下載成功');
        },
        error: () => {
          this.messageService.errorBubble('報表下載失敗');
        },
      });
  }

  /** 強制結案 */
  onForceClose(): void {
    if (!this.subcheckId) {
      this.messageService.warnBubble('無可結案的資料');
      return;
    }
    this.messageService.confirm({
      header: '確認強制結案',
      message: '是否確認強制結案此驗收單？',
      accept: () => {
        this.loading = true;
        this.ass12050Service
          .forceCloseASS12050({ SUBCHECK_ID: this.subcheckId! })
          .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble('操作失敗：' + (res.Message ?? ''));
                return;
              }
              this.messageService.successBubble('強制結案成功');
              this.onBack();
            },
          });
      },
    });
  }

  /** 返回查詢頁 */
  onBack(): void {
    this.router.navigate(['account/ass/ass12050']);
  }

  /** 明細列點編輯：進入 ass12050cru 編輯明細 */
  onEditDetail(): void {
    if (!this.subcheckId) return;
    this.router.navigate(['account/ass/ass12050cru'], {
      state: {
        crudstatus: CRUDStatus.Edit,
        rowdata: { SUBCHECK_ID: this.subcheckId },
        fromRoute: this.router.url,
      },
    });
  }
}
