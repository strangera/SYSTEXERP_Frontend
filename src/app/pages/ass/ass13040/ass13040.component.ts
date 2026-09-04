import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS13040Service } from '@service/api/ass/ass13040.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import {
  AddButton,
  formatDate as formatDateDisplay,
  ReportColumn,
} from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, forkJoin } from 'rxjs';
import { ASS13040QueryRequest, ASS13040QueryRow } from './ass13040.model';

/** 3.1.3.4 批次報廢作業 */
@UntilDestroy()
@Component({
  selector: 'app-ass13040',
  templateUrl: './ass13040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarRangeComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
  ],
})
export class ASS13040Component extends BasicQueryPageComponent<ASS13040QueryRow> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    scrapCode: [null as string | null, [Validators.maxLength(20)]], // 商品報廢單編號
    manageCode: [null as string | null], // 商品管理編號
    userCode: [null as string | null], // 報廢人員編號
    departmentCode: [null as string | null], // 部門代號
    scrapDateFrom: [null as Date | null], // 報廢申請日起
    scrapDateTo: [null as Date | null], // 報廢申請日訖
    scrapStatus: [null as string | null], // 商品報廢單狀態
    PageSize: [30],
    PageIndex: [1],
  });

  manageCodeOptions: Option[] = [];
  userCodeOptions: Option[] = [];
  departmentCodeOptions: Option[] = [];
  scrapStatusOptions: Option[] = [];

  data: ASS13040QueryRow[] = [];
  selectedRows: ASS13040QueryRow[] = [];
  totalRecords = 0;
  lastQueryBody: ASS13040QueryRequest | null = null;
  dataKey = 'DAMAGEM_ID';

  columns: ReportColumn[] = [
    { field: 'DAMAGEM_ID', header: '商品報廢單編號', visible: true },
    { field: 'ASSET_ID', header: '商品管理編號', visible: true },
    { field: 'GOODS_NAME', header: '資產名稱', visible: true },
    { field: 'EMP_NAME', header: '報廢人員編號', visible: true },
    { field: 'ORG_NAME', header: '部門代號', visible: true },
    {
      field: 'APPLY_DATE',
      header: '報廢申請日期',
      visible: true,
      format: (value: string) => formatDateDisplay(value),
    },
    { field: 'DAMAGEM_STATUS_NAME', header: '商品報廢單狀態', visible: true },
    { field: 'NOTES', header: '說明', visible: true },
  ];

  isRowSelectable = (row: ASS13040QueryRow): boolean =>
    row?.CHECK_STATUS === 'Y';

  /** 報廢單狀態：1 待審核、2 已審核、9 作廢 */
  addButton: AddButton[] = [
    {
      label: '審核',
      icon: 'pi pi-check-circle text-green-500',
      action: (rowData: ASS13040QueryRow) => this.onApprove(rowData),
      disabled: (rowData: ASS13040QueryRow) =>
        rowData.DAMAGEM_STATUS !== '1',
    },
  ];

  btnLoading = false;
  btnPDFLoading = false;

  constructor(
    private readonly ass13040Service: ASS13040Service,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13040', 'ass/ass13040cru', this.queryForm, () =>
      this.onSubmit(this.queryForm),
    );
    this.loadDropdowns();
  }

  queryFunction = (body: unknown): ReturnType<ASS13040Service['queryASS13040']> => {
    const raw = this.queryForm.getRawValue();
    const b = body as Record<string, unknown>;
    const payload: ASS13040QueryRequest = {
      DAMAGEM_ID: raw.scrapCode ?? undefined,
      ASSET_ID: raw.manageCode ?? undefined,
      EMP_ID: raw.userCode ?? undefined,
      ORG_ID: raw.departmentCode ?? undefined,
      APPLY_DATE_S: raw.scrapDateFrom ? this.formatDate(raw.scrapDateFrom) : undefined,
      APPLY_DATE_E: raw.scrapDateTo ? this.formatDate(raw.scrapDateTo) : undefined,
      DAMAGEM_STATUS: raw.scrapStatus ?? undefined,
      PageSize: (b['PageSize'] ?? b['pageSize'] ?? 30) as number,
      PageIndex: (b['PageIndex'] ?? b['pageIndex'] ?? 1) as number,
      SortBy: b['SortBy'] as ASS13040QueryRequest['SortBy'],
    };
    return this.ass13040Service.queryASS13040(payload);
  };

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      this.lastQueryBody = {
        DAMAGEM_ID: raw.scrapCode ?? undefined,
        ASSET_ID: raw.manageCode ?? undefined,
        EMP_ID: raw.userCode ?? undefined,
        ORG_ID: raw.departmentCode ?? undefined,
        APPLY_DATE_S: raw.scrapDateFrom ? this.formatDate(raw.scrapDateFrom) : undefined,
        APPLY_DATE_E: raw.scrapDateTo ? this.formatDate(raw.scrapDateTo) : undefined,
        DAMAGEM_STATUS: raw.scrapStatus ?? undefined,
        PageSize: 30,
        PageIndex: 1,
      };
      this.loading = true;
      this.queryFunction(this.lastQueryBody)
        .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.data = res.Data ?? [];
            this.totalRecords = res.TotalCount ?? 0;
            this.selectedRows = [];
            this.queryStateService.setQueryState(this.ProgNo, raw);
          },
        });
    });
  }

  onDelete(selectedItems: ASS13040QueryRow[]): void {
    if (!selectedItems?.length) {
      this.messageService.warnBubble('請先勾選要刪除的資料');
      return;
    }
    const ids = selectedItems
      .map(row => row.FAASSABANM_ID)
      .filter((id): id is number => id != null && typeof id === 'number');
    if (ids.length === 0) {
      this.messageService.warnBubble('無可刪除的資料');
      return;
    }
    this.messageService.confirm({
      header: '確認刪除',
      message: `是否確認刪除 ${ids.length} 筆資料？`,
      accept: () => {
        this.loading = true;
        this.ass13040Service
          .deleteASS13040({ Ids: ids })
          .pipe(
            finalize(() => (this.loading = false)),
            untilDestroyed(this),
          )
          .subscribe({
            next: res => {
              if (res.Status !== '0000') return;
              this.messageService.successBubble(res.Message ?? '刪除成功');
              this.selectedRows = [];
              this.onSubmit(this.queryForm);
            },
          });
      },
    });
  }

  onExportPDF(): void {
    const ids = this.selectedRows
      .map(row => row.FAASSABANM_ID)
      .filter((id): id is number => id != null && typeof id === 'number');
    if (ids.length === 0) {
      this.messageService.warnBubble('請先勾選要匯出的資料');
      return;
    }
    this.btnPDFLoading = true;
    this.ass13040Service
      .exportpdfass13040({ Ids: ids })
      .pipe(
        finalize(() => (this.btnPDFLoading = false)),
        untilDestroyed(this),
      )
      .subscribe({
        next: blob => {
          if (!blob) return;
          const now = new Date();
          const timestamp =
            now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');
          const fileName = `商品報廢單${timestamp}.pdf`;
          const blobUrl = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = blobUrl;
          anchor.download = fileName;
          anchor.click();
          URL.revokeObjectURL(blobUrl);
        },
      });
  }

  onApprove(rowData: ASS13040QueryRow): void {
    const id = rowData.FAASSABANM_ID;
    if (id == null || id === undefined) return;
    this.btnLoading = true;
    this.ass13040Service
      .approveASS13040({ ID: id })
      .pipe(
        finalize(() => (this.btnLoading = false)),
        untilDestroyed(this),
      )
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.messageService.successBubble(res.Message ?? '審核成功');
          this.onSubmit(this.queryForm);
        },
      });
  }

  private loadDropdowns(): void {
    forkJoin({
      manageCodes: this.dropdownApiService.queryAss11040Dropdown(),
      users: this.dropdownApiService.queryTblUser(),
      departments: this.dropdownApiService.querySys3100(),
      statuses: this.dropdownApiService.querySys1000({ SYS_Type: 'AM_DAMAGEM_STATUS' }),
    })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: ({ manageCodes, users, departments, statuses }) => {
          this.manageCodeOptions = manageCodes ?? [];
          this.userCodeOptions = users ?? [];
          this.departmentCodeOptions = departments ?? [];
          this.scrapStatusOptions = this.mapToOptions(statuses ?? []);
        },
      });
  }

  private mapToOptions(items: Array<{ No: string; Name: string }>): Option[] {
    return items.map(item => ({
      value: item.No,
      label: `${item.No} - ${item.Name}`,
    }));
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
