import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS13060Service } from '@service/api/ass/ass13060.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { finalize, forkJoin, Observable } from 'rxjs';
import { ASS13060QueryRequest, ASS13060QueryRow } from './ass13060.model';

/** 3.1.3.6 固定資產重估作業 */
@Component({
  selector: 'app-ass13060',
  templateUrl: './ass13060.component.html',
  styleUrl: './ass13060.component.scss',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    CalendarRangeQuickComponent,
    MenubarComponent,
    TableReportComponent,
  ],
})
export class ASS13060Component extends BasicQueryPageComponent<ASS13060QueryRow> implements OnInit {
  public readonly queryForm = this.formBuilder.group({
    /** 申請編號 */
    RequestCode: new FormControl<string | null>(null),
    /** 商品管理編號 */
    ManagementCode: new FormControl<string | null>(null),
    /** 申請人員編號 */
    UserCode: new FormControl<string | null>(null),
    /** 部門代號 */
    OrganizationNumber: new FormControl<string | null>(null),
    /** 申請日期(起) */
    ApplicationDateFrom: new FormControl<Date | null>(null),
    /** 申請日期(迄) */
    ApplicationDateTo: new FormControl<Date | null>(null),
    /** 申請單狀態 */
    RequestStatus: new FormControl<string | null>(null),
    pageSize: new FormControl<number>(30),
    pageIndex: new FormControl<number>(1),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<ASS13060QueryRow[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public lastQueryBody?: ASS13060QueryRequest;
  public selectedItems: ASS13060QueryRow[] = [];

  public readonly columns: ReportColumn[] = [
    { field: 'RevaluationNo', header: '固資重估單編號' },
    { field: 'UserCode', header: '申請人員編號' },
    { field: 'UserName', header: '申請人員名稱' },
    { field: 'OrganizationNumber', header: '部門代號' },
    { field: 'OrganizationName', header: '部門名稱' },
    { field: 'StatusName', header: '狀態' },
    { field: 'ApplicationDate', header: '申請日期', format: formatDate },
    { field: 'Remark', header: '說明' },
  ];

  public readonly userCodeOptions = signal<{ label: string; value: string }[]>([]);
  public readonly organizationNumberOptions = signal<{ label: string; value: string }[]>([]);
  public readonly requestStatusOptions = signal<{ label: string; value: string }[]>([]);

  constructor(
    public readonly service: ASS13060Service,
    private readonly dropDownListService: DropDownListService
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
        this.userCodeOptions.set(options);
      },
    });

    this.dropDownListService.querySYS3100_DropDownList().subscribe({
      next: (res: { Status: string; Data: { No: string; Name: string }[] }) => {
        if (res.Status !== '0000') return;
        const options = res.Data.map((item: { No: string; Name: string }) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.organizationNumberOptions.set(options);
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
          this.requestStatusOptions.set(options);
        },
      });
  }

  public queryFunction = (
    body: ASS13060QueryRequest & { pageSize?: number; pageIndex?: number }
  ): Observable<ApiResponse<ASS13060QueryRow[]>> => {
    const rawFormValue = this.queryForm.getRawValue();
    const payload: ASS13060QueryRequest = {
      RequestCode: rawFormValue.RequestCode || undefined,
      ManagementCode: rawFormValue.ManagementCode || undefined,
      UserCode: rawFormValue.UserCode || undefined,
      OrganizationNumber: rawFormValue.OrganizationNumber || undefined,
      ApplicationDateFrom: rawFormValue.ApplicationDateFrom || undefined,
      ApplicationDateTo: rawFormValue.ApplicationDateTo || undefined,
      RequestStatus: rawFormValue.RequestStatus || undefined,
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
        RequestCode: rawFormValue.RequestCode || undefined,
        ManagementCode: rawFormValue.ManagementCode || undefined,
        UserCode: rawFormValue.UserCode || undefined,
        OrganizationNumber: rawFormValue.OrganizationNumber || undefined,
        ApplicationDateFrom: rawFormValue.ApplicationDateFrom || undefined,
        ApplicationDateTo: rawFormValue.ApplicationDateTo || undefined,
        RequestStatus: rawFormValue.RequestStatus || undefined,
        PageSize: rawFormValue.pageSize || 30,
        PageIndex: rawFormValue.pageIndex || 1,
      } as ASS13060QueryRequest;

      this.tableLoading.set(true);
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
    const status = rowData.StatusCode ?? rowData.Status;
    return status === '2' || status === '3';
  };

  public deleteDisabledFn = (rowData: ASS13060QueryRow): boolean => {
    return false;
    const status = rowData.StatusCode ?? rowData.Status;
    return status === '2' || status === '3';
  };

  public onBatchDelete(selectedItems: ASS13060QueryRow[]): void {
    if (!selectedItems || selectedItems.length === 0) return;

    if (selectedItems.some(item => item.Status === '2' || item.Status === '3')) {
      this.messageService.warnBubble('已審核的資料不可刪除');
      return;
    }

    const rows = selectedItems.filter(
      row => row.RevaluationNo != null && row.RevaluationNo !== ''
    );
    if (rows.length === 0) {
      this.messageService.warnBubble('無可刪除的資料');
      return;
    }

    this.messageService.confirm({
      header: '確認刪除',
      message: `是否確認刪除 ${rows.length} 筆資料？`,
      accept: () => {
        this.loading = true;
        const deletes = rows.map(row =>
          this.service.deleteASS13060({ RevaluationNo: row.RevaluationNo! })
        );
        forkJoin(deletes)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: results => {
              const failed = results.filter(r => r.Status !== '0000');
              if (failed.length > 0) {
                this.messageService.errorBubble(
                  '操作失敗：' + (failed[0].Message ?? '部分刪除失敗')
                );
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
}
