import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ASS12050MasterRow } from '@pages/ass/ass12050/ass12050.model';
import { ASS12050Service } from '@service/api/ass/ass12050.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { TableComponent } from '@others/component/table/table.component';
import { Column, formatDate } from '@others/component/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { FileExportService } from '@shared/service/file-export.service';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { CurrentPageService } from '../../../core/layout/app.menulist/current-page.service';

/** 3.1.2.5 採購單驗收作業 - 編輯主檔（唯讀主檔 + 驗收單列表） */
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

  /** 採購單號（從導航 state 取得） */
  subpoenaId: string | null = null;

  /** 主檔表格資料（getMaster 回傳的驗收單清單） */
  masterTableData: ASS12050MasterRow[] = [];

  /** 主檔表格已選列 */
  selectedMasterRows: ASS12050MasterRow[] = [];

  /** 主檔表格欄位 */
  masterColumns: Column[] = [
    { field: 'SUBCHECK_ID', header: '驗收單號' },
    { field: 'APPLYName', header: '申請人' },
    { field: 'CLOSEName', header: '結案人員' },
    { field: 'Org_Name', header: '部門' },
    { field: 'APPLY_DATE', header: '申請日期', format: formatDate },
    { field: 'VEN_Name', header: '供應商' },
    { field: 'STATUS', header: '狀態' },
    { field: 'DETAIL_COUNT', header: '明細筆數' },
  ];

  loading = false;

  constructor(
    private readonly router: Router,
    private readonly ass12050Service: ASS12050Service,
    private readonly currentPageService: CurrentPageService,
    private readonly messageService: NotificationService,
    private readonly fileExportService: FileExportService,
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { rowdata?: { SUBPOENA_ID?: string } } | undefined;
    const rowdata = state?.rowdata;
    this.subpoenaId = rowdata?.SUBPOENA_ID ?? null;
  }

  ngOnInit(): void {
    this.currentPageService.setCurrentProgNo(this.ProgNo);

    if (!this.subpoenaId) {
      this.router.navigate(['account/ass/ass12050']);
      return;
    }

    this.loadMaster();
  }

  private loadMaster(): void {
    if (!this.subpoenaId) return;
    this.loading = true;
    this.ass12050Service
      .getMasterASS12050({ SUBPOENA_ID: this.subpoenaId })
      .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.masterTableData = res.Data ?? [];
        },
      });
  }

  /** 取得已選取的驗收單號 */
  private get selectedSubcheckId(): string | null {
    return this.selectedMasterRows?.[0]?.SUBCHECK_ID ?? null;
  }

  /** 列印採購驗收單 */
  onPrint(): void {
    if (!this.subpoenaId) {
      this.messageService.warnBubble('無法取得採購單號');
      return;
    }
    this.fileExportService
      .executeFileExport(
        this.ass12050Service
          .exportASS12050({ SUBPOENA_ID: this.subpoenaId })
          .pipe(untilDestroyed(this)),
        '.xlsx',
        isLoading => (this.loading = isLoading),
        `ASS12050_${this.subpoenaId}`,
      )
      .subscribe();
  }

  /** 強制結案 */
  onForceClose(): void {
    const subcheckId = this.selectedSubcheckId;
    if (!subcheckId) {
      this.messageService.warnBubble('請先選擇一筆驗收單');
      return;
    }
    this.messageService.confirm({
      header: '確認強制結案',
      message: '是否確認強制結案此驗收單？',
      accept: () => {
        this.loading = true;
        this.ass12050Service
          .forceCloseASS12050({
            Items: [
              {
                DETAIL_ID: subcheckId,
              },
            ],
          })
          .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble('操作失敗：' + (res.Message ?? ''));
                return;
              }
              this.messageService.successBubble('強制結案成功');
              this.loadMaster();
            },
          });
      },
    });
  }

  /** 返回查詢頁 */
  onBack(): void {
    this.router.navigate(['account/ass/ass12050'], {
      state: { fromRoute: this.router.url },
    });
  }

  /** 明細列點編輯：進入 ass12050cru 編輯明細 */
  onEditDetail(event: { SUBCHECK_ID: string }): void {
    const subcheckId = event.SUBCHECK_ID;
    this.router.navigate(['account/ass/ass12050cru'], {
      state: {
        crudstatus: CRUDStatus.Edit,
        rowdata: { SUBCHECK_ID: subcheckId },
        fromRoute: this.router.url,
        subpoenaId: this.subpoenaId,
      },
    });
  }
}
