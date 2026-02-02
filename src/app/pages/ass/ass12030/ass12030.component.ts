import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS12030QueryRow, QueryASS12030Request } from '@pages/ass/ass12030/ass12030.model';
import { ASS12030Service } from '@service/api/ass/ass12030.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AddButton, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { Actions } from '@shared/service/permission-guard.service';

/** 3.1.2.3 採購申請作業 */
@UntilDestroy()
@Component({
  selector: 'app-ass12030',
  templateUrl: './ass12030.component.html',
  styleUrl: './ass12030.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputNumberRangeComponent,
    CalendarRangeQuickComponent,
    InputTextComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class ASS12030Component extends BasicQueryPageComponent<ASS12030QueryRow> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    poNo: [null as string | null],
    goodsId: [null as string | null],
    empId: [null as string | null],
    orgId: [null as string | null],
    applyDateFrom: [null as Date | null],
    applyDateTo: [null as Date | null],
    supplierId: [null as string | null],
    taxAmtFrom: [null as number | null],
    taxAmtTo: [null as number | null],
    noTaxAmtFrom: [null as number | null],
    noTaxAmtTo: [null as number | null],
    totalTaxAmtFrom: [null as number | null],
    totalTaxAmtTo: [null as number | null],
    poStatus: [null as string | null],
    reviewerId: [null as string | null],
    reviewDateFrom: [null as Date | null],
    reviewDateTo: [null as Date | null],
    checkoutDateFrom: [null as Date | null],
    checkoutDateTo: [null as Date | null],
    whId: [null as string | null],
    PageSize: [30],
    PageIndex: [1],
  });

  /** 申請人、審核人：queryTBLUSER_DropDownList */
  empIdOptions: { value: string; label: string }[] = [];
  reviewerIdOptions: { value: string; label: string }[] = [];
  /** 部門：queryPOS2013_DropDownList */
  orgIdOptions: { value: string; label: string }[] = [];
  /** 未實作下拉 */
  goodsIdOptions: { value: string; label: string }[] = [];
  supplierIdOptions: { value: string; label: string }[] = [];
  poStatusOptions: { value: string; label: string }[] = [];
  whIdOptions: { value: string; label: string }[] = [];

  data: ASS12030QueryRow[] = [];
  selectedRows: ASS12030QueryRow[] = [];
  totalRecords = 0;
  lastQueryBody: QueryASS12030Request | null = null;
  columns: ReportColumn[] = [
    { field: 'PO_NO', header: '採購單號', visible: true },
    { field: 'EMP_ID', header: '申請人編號', visible: true },
    { field: 'ORG_ID', header: '部門代號', visible: true },
    { field: 'APPLY_DATE', header: '申請日期', visible: true },
    { field: 'SUPPLIER_ID', header: '供應商編號', visible: true },
    { field: 'TAX_AMT', header: '稅額', visible: true },
    { field: 'NO_TAX_AMT', header: '未稅總金額', visible: true },
    { field: 'TOTAL_TAX_AMT', header: '含稅總金額', visible: true },
    { field: 'PO_STATUS', header: '採購單狀態', visible: true },
    { field: 'REVIEWER_ID', header: '審核人編號', visible: true },
    { field: 'REVIEW_DATE', header: '審核日期', visible: true },
    { field: 'CHECKOUT_DATE', header: '結帳日期', visible: true },
    { field: 'NOTES', header: '說明', visible: true },
  ];

  addButton: AddButton[] = [
    {
      label: '作廢',
      icon: 'pi pi-ban text-red-500',
      action: (rowData: ASS12030QueryRow) => this.onVoid(rowData),
      disabled: () => !this.hasPermission(Actions.Delete),
    },
    {
      label: '刪除',
      icon: 'pi pi-trash',
      action: (rowData: ASS12030QueryRow) => this.onDeleteRow(rowData),
      disabled: () => !this.hasPermission(Actions.Delete),
    },
    {
      label: '下載報表',
      icon: 'pi pi-download',
      action: (rowData: ASS12030QueryRow) => this.onDownloadReport(rowData),
      disabled: () => !this.hasPermission(Actions.Report),
    },
  ];

  constructor(
    public readonly ass12030Service: ASS12030Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS12030', 'ass/ass12030cru', this.queryForm, () =>
      this.onSubmit(this.queryForm),
    );
    this.loadDropdownOptions();
  }

  /** 新增(已詢價)：進入 CRU 後顯示「套用請購清單」 */
  onCreateQuoted(): void {
    if (!this.hasPermission(Actions.Create)) return;
    this.router.navigate(['account/ass/ass12030cru'], {
      state: {
        crudstatus: CRUDStatus.Create,
        rowdata: null,
        fromRoute: this.router.url,
        createMode: 'quoted',
      },
    });
  }

  /** 新增(未詢價)：進入 CRU 後顯示「套用詢價清單」 */
  onCreateUnquoted(): void {
    if (!this.hasPermission(Actions.Create)) return;
    this.router.navigate(['account/ass/ass12030cru'], {
      state: {
        crudstatus: CRUDStatus.Create,
        rowdata: null,
        fromRoute: this.router.url,
        createMode: 'unquoted',
      },
    });
  }

  /** 載入申請人、審核人、部門下拉 */
  loadDropdownOptions(): void {
    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = res.Data ?? [];
        const options = list.map((item: { No?: string; Name?: string }) => ({
          value: item.No ?? '',
          label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        }));
        this.empIdOptions = options;
        this.reviewerIdOptions = options;
      });
    this.dropDownListService
      .queryPOS2013_DropDownList({})
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = res.Data ?? [];
        this.orgIdOptions = list.map((item: { No?: string; Name?: string }) => ({
          value: item.No ?? '',
          label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        }));
      });
  }

  private formatDate(d: Date | null): string {
    if (!d) return '';
    const x = new Date(d);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, '0');
    const day = String(x.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  queryFunction = (body: unknown): ReturnType<ASS12030Service['queryASS12030']> => {
    const raw = this.queryForm.getRawValue();
    const payload: QueryASS12030Request = {
      PO_NO: raw.poNo ?? undefined,
      GOODS_ID: raw.goodsId ?? undefined,
      EMP_ID: raw.empId ?? undefined,
      ORG_ID: raw.orgId ?? undefined,
      APPLY_DATE_FROM: raw.applyDateFrom ? this.formatDate(raw.applyDateFrom) : undefined,
      APPLY_DATE_TO: raw.applyDateTo ? this.formatDate(raw.applyDateTo) : undefined,
      SUPPLIER_ID: raw.supplierId ?? undefined,
      TAX_AMT_FROM: raw.taxAmtFrom ?? undefined,
      TAX_AMT_TO: raw.taxAmtTo ?? undefined,
      NO_TAX_AMT_FROM: raw.noTaxAmtFrom ?? undefined,
      NO_TAX_AMT_TO: raw.noTaxAmtTo ?? undefined,
      TOTAL_TAX_AMT_FROM: raw.totalTaxAmtFrom ?? undefined,
      TOTAL_TAX_AMT_TO: raw.totalTaxAmtTo ?? undefined,
      PO_STATUS: raw.poStatus ?? undefined,
      REVIEWER_ID: raw.reviewerId ?? undefined,
      REVIEW_DATE_FROM: raw.reviewDateFrom ? this.formatDate(raw.reviewDateFrom) : undefined,
      REVIEW_DATE_TO: raw.reviewDateTo ? this.formatDate(raw.reviewDateTo) : undefined,
      CHECKOUT_DATE_FROM: raw.checkoutDateFrom ? this.formatDate(raw.checkoutDateFrom) : undefined,
      CHECKOUT_DATE_TO: raw.checkoutDateTo ? this.formatDate(raw.checkoutDateTo) : undefined,
      WH_ID: raw.whId ?? undefined,
      ...(body as object),
    };
    return this.ass12030Service.queryASS12030(payload);
  };

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      this.lastQueryBody = {
        ...raw,
        PageSize: 30,
        PageIndex: 1,
      };
      this.loading = true;
      this.queryFunction(this.lastQueryBody)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.data = res.Data ?? [];
            this.totalRecords = res.TotalCount ?? 0;
            this.queryStateService.setQueryState(this.ProgNo, raw);
          },
        });
    });
  }

  onDeleteRow(row: ASS12030QueryRow): void {
    const id = row.id;
    if (id == null) {
      this.messageService.warnBubble('無可刪除的資料');
      return;
    }
    this.messageService.confirm({
      header: '確認刪除',
      message: '是否確認刪除此筆資料？',
      accept: () => {
        this.loading = true;
        this.ass12030Service
          .deleteASS12030([typeof id === 'number' ? id : Number(id)])
          .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble('操作失敗：' + (res.Message ?? ''));
                return;
              }
              this.messageService.successBubble('刪除成功');
              this.onSubmit(this.queryForm);
            },
          });
      },
    });
  }

  onVoid(row: ASS12030QueryRow): void {
    const id = row.id;
    if (id == null) {
      this.messageService.warnBubble('無可作廢的資料');
      return;
    }
    this.messageService.confirm({
      header: '確認作廢',
      message: '是否確認作廢此筆資料？',
      accept: () => {
        this.loading = true;
        this.ass12030Service
          .voidASS12030([typeof id === 'number' ? id : Number(id)])
          .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble('操作失敗：' + (res.Message ?? ''));
                return;
              }
              this.messageService.successBubble('作廢成功');
              this.onSubmit(this.queryForm);
            },
          });
      },
    });
  }

  onDownloadReport(row: ASS12030QueryRow): void {
    const id = row.id;
    if (id == null) return;
    this.loading = true;
    this.ass12030Service
      .reportASS12030({ id })
      .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') {
            this.messageService.errorBubble('報表下載失敗：' + (res.Message ?? ''));
            return;
          }
          this.messageService.successBubble('報表下載成功');
          // TODO: 實際下載 blob 若後端回傳檔案
        },
      });
  }
}
