import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS13060Service } from '@service/api/ass/ass13060.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';
import { ASS13060QueryRequest, ASS13060QueryRow } from './ass13060.model';

/** 3.1.3.6 固定資產重估作業 */
@Component({
  selector: 'app-ass13060',
  templateUrl: './ass13060.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    CalendarRangeComponent,
    MenubarComponent,
    TableReportComponent,
  ],
})
export class ASS13060Component extends BasicQueryPageComponent<ASS13060QueryRow> implements OnInit {
  public readonly queryForm = this.formBuilder.group({
    ASSET_EVAL_ID: new FormControl<string | null>(null),
    ASSET_EVAL_STATUS: new FormControl<string | null>(null),
    APPLY_DATE_S: new FormControl<Date | null>(null),
    APPLY_DATE_E: new FormControl<Date | null>(null),
    EMP_ID: new FormControl<string | null>(null),
    ORG_ID: new FormControl<string | null>(null),
    GOODS_ID: new FormControl<string | null>(null),
    PageSize: new FormControl<number>(30),
    PageIndex: new FormControl<number>(1),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<ASS13060QueryRow[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public lastQueryBody?: ASS13060QueryRequest;
  public selectedItems: ASS13060QueryRow[] = [];

  public readonly columns: ReportColumn[] = [
    { field: 'ASSET_EVAL_ID', header: '固資重估單編號' },
    { field: 'EMP_ID', header: '申請人員代碼' },
    { field: 'EMP_NAME', header: '申請人員名稱' },
    { field: 'ORG_ID', header: '部門代號' },
    { field: 'Org_Name', header: '部門名稱' },
    { field: 'ASSET_EVAL_STATUS_NAME', header: '狀態' },
    { field: 'APPLY_DATE', header: '申請日期', format: formatDate },
  ];

  public readonly empIdOptions = signal<{ label: string; value: string }[]>([]);
  public readonly orgIdOptions = signal<{ label: string; value: string }[]>([]);
  public readonly assetEvalStatusOptions = signal<{ label: string; value: string }[]>([]);

  constructor(
    public readonly service: ASS13060Service,
    private readonly dropDownListService: DropDownListService,
    private readonly fileExportService: FileExportService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13060', 'ass/ass13060cru', this.queryForm, this.onSubmit.bind(this));
    this.loadDropdownOptions();
  }

  private loadDropdownOptions(): void {
    this.dropDownListService.queryTBLUSER_DropDownList().subscribe({
      next: (res: { Status: string; Data: { No: string; Name: string }[] }) => {
        if (res.Status !== '0000') return;
        const options = res.Data.map((item: { No: string; Name: string }) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.empIdOptions.set(options);
      },
    });

    this.dropDownListService.querySYS3100_DropDownList().subscribe({
      next: (res: { Status: string; Data: { No: string; Name: string }[] }) => {
        if (res.Status !== '0000') return;
        const options = res.Data.map((item: { No: string; Name: string }) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.orgIdOptions.set(options);
      },
    });

    this.dropDownListService
      .querySYS1000_DropDownList({ SYS_Type: 'ASSET_EVAL_STATUS' } as { SYS_Type: string })
      .subscribe({
        next: (res: { Status: string; Data: { No: string; Name: string }[] }) => {
          if (res.Status !== '0000') return;
          const options = res.Data.map((item: { No: string; Name: string }) => ({
            label: `${item.No} - ${item.Name}`,
            value: item.No,
          }));
          this.assetEvalStatusOptions.set(options);
        },
      });
  }

  public queryFunction = (
    body: ASS13060QueryRequest & { pageSize?: number; pageIndex?: number }
  ): Observable<ApiResponse<ASS13060QueryRow[]>> => {
    const rawFormValue = this.queryForm.getRawValue();
    const payload: ASS13060QueryRequest = {
      ASSET_EVAL_ID: rawFormValue.ASSET_EVAL_ID || undefined,
      ASSET_EVAL_STATUS: rawFormValue.ASSET_EVAL_STATUS || undefined,
      APPLY_DATE_S: rawFormValue.APPLY_DATE_S || undefined,
      APPLY_DATE_E: rawFormValue.APPLY_DATE_E || undefined,
      EMP_ID: rawFormValue.EMP_ID || undefined,
      ORG_ID: rawFormValue.ORG_ID || undefined,
      GOODS_ID: rawFormValue.GOODS_ID || undefined,
      PageSize: body.PageSize ?? body.pageSize ?? 30,
      PageIndex: body.PageIndex ?? body.pageIndex ?? 1,
      SortBy: body.SortBy,
    };
    const cleanPayload = removeEmptyValues(payload) as ASS13060QueryRequest;
    return this.service.queryASS13060(cleanPayload);
  };

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const rawFormValue = this.queryForm.getRawValue();
      this.lastQueryBody = {
        ASSET_EVAL_ID: rawFormValue.ASSET_EVAL_ID || undefined,
        ASSET_EVAL_STATUS: rawFormValue.ASSET_EVAL_STATUS || undefined,
        APPLY_DATE_S: rawFormValue.APPLY_DATE_S || undefined,
        APPLY_DATE_E: rawFormValue.APPLY_DATE_E || undefined,
        EMP_ID: rawFormValue.EMP_ID || undefined,
        ORG_ID: rawFormValue.ORG_ID || undefined,
        GOODS_ID: rawFormValue.GOODS_ID || undefined,
        PageSize: rawFormValue.PageSize ?? 30,
        PageIndex: rawFormValue.PageIndex ?? 1,
      } as ASS13060QueryRequest;

      this.tableLoading.set(true);
      this.loading = true;
      this.queryStateService.setQueryState(this.ProgNo, rawFormValue);
      this.queryFunction(this.lastQueryBody)
        .pipe(
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          })
        )
        .subscribe({
          next: (res: { Status: string; Data?: ASS13060QueryRow[]; TotalCount?: number }) => {
            if (res.Status !== '0000') return;
            this.tableData.set(res.Data ?? []);
            this.totalRecords.set(res.TotalCount ?? 0);
          },
        });
    });
  }

  public editDisabled = (rowData: ASS13060QueryRow): boolean => {
    const status = rowData.ASSET_EVAL_STATUS ?? rowData.CHECK_STATUS;
    return status === '2' || status === '3';
  };

  public deleteDisabledFn = (rowData: ASS13060QueryRow): boolean => {
    const status = rowData.ASSET_EVAL_STATUS ?? rowData.CHECK_STATUS;
    return status === '2' || status === '3';
  };

  public onBatchDelete(selectedItems: ASS13060QueryRow[]): void {
    if (!selectedItems || selectedItems.length === 0) return;

    if (
      selectedItems.some(
        item => item.ASSET_EVAL_STATUS === '2' || item.ASSET_EVAL_STATUS === '3'
      )
    ) {
      this.messageService.warnBubble('已審核的資料不可刪除');
      return;
    }

    const ids = selectedItems
      .filter(row => row.ID != null)
      .map(row => row.ID as number);
    if (ids.length === 0) {
      this.messageService.warnBubble('無可刪除的資料');
      return;
    }

    this.messageService.confirm({
      header: '確認刪除',
      message: `是否確認刪除 ${ids.length} 筆資料？`,
      accept: () => {
        this.loading = true;
        this.service
          .deleteASS13060({ Ids: ids })
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble(res.Message ?? '刪除失敗');
                return;
              }
              this.messageService.successBubble('刪除成功');
              this.selectedItems = [];
              this.onSubmit();
            },
            error: () => {
              this.messageService.errorBubble('刪除失敗，請重試或聯繫管理員');
            },
          });
      },
    });
  }

  public onExportPDF(): void {
  const ids = this.selectedItems
    .filter(row => row.ID != null)
    .map(row => row.ID as number);

  if (ids.length === 0) {
    this.messageService.warnBubble('請先選擇要列印的資料');
    return;
  }

  const firstItem = this.selectedItems[0];

  const payload = {
    MID: firstItem.MID ?? 0,
    STO_NO: firstItem.STO_NO ?? null,
    Ids: ids
  };

  console.log('exportPDFASS13060 payload:', payload);

  this.loading = true;

  const download$ = this.service.exportPDFASS13060(payload);

  this.fileExportService.executeFileExport(
    download$,
    '.pdf',
    (isLoading) => this.loading = isLoading
  ).subscribe();
}
}
