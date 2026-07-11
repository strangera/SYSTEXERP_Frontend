import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11010Service } from '@service/api/ass/ass11010.service';
import { ASS11020Service } from '@service/api/ass/ass11020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';
import { ASS11020Data, ASS11020QueryRequest } from './ass11020.model';

// 3.1.1.2 資產列管品及耗材分類管理作業-中分類維護作業
@Component({
  selector: 'app-ass11020',
  templateUrl: './ass11020.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputTextareaComponent,
    MenubarComponent,
    TableReportComponent,
  ],
})
export class ASS11020Component extends BasicQueryPageComponent<ASS11020Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    /** 中分類代碼*/
    M_CLASS_ID: new FormControl<string | null>(null),
    /** 大分類代碼*/
    B_CLASS_ID: new FormControl<string | null>(null),
    /** 說明*/
    NOTES_KEYWORD: new FormControl<string | null>(null),
    pageSize: new FormControl<number>(30),            // 每頁筆數
    pageIndex: new FormControl<number>(1),            // 頁碼
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<ASS11020Data[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public lastQueryBody?: ASS11020QueryRequest;

  public readonly columns: ReportColumn[] = [
    { field: 'M_CLASS_ID', header: '中分類代碼' },
    { field: 'M_CLASS_NAME', header: '中分類名稱' },
    { field: 'B_CLASS_ID', header: '大分類代碼' },
  ];

  // 大分類代碼/名稱下拉選項
  public readonly bigClassOptions = signal<{ label: string; value: string }[]>([]);
  // 中分類代碼/名稱下拉選項
  public readonly midClassOptions = signal<{ label: string; value: string }[]>([]);

  constructor(
    public readonly service: ASS11020Service,
    private readonly ass11010Service: ASS11010Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11020', '/ASS/ASS11020CRU', this.queryForm, this.onSubmit.bind(this));
    this.logger.debug(`ASS11020 init:`, [this.queryForm]);
    this.loadBigClassOptions();
    this.loadMidClassOptions();
  }

  /**
   * 載入大分類下拉選項
   */
  private loadBigClassOptions(): void {
    this.ass11010Service.queryASS11010({}).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.CLASS_ID} - ${item.CLASS_NAME}`,
          value: item.CLASS_ID,
        }));
        this.bigClassOptions.set(options);
      },
    });
  }

  /**
   * 載入中分類下拉選項
   */
  private loadMidClassOptions(): void {
    this.service.queryASS11020({}).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.M_CLASS_ID} - ${item.M_CLASS_NAME}`,
          value: item.M_CLASS_ID,
        }));
        this.midClassOptions.set(options);
      },
    });
  }

  /**
   * 查詢函數（供 table-report 分頁查詢使用）
   */
  public queryFunction = (body: ASS11020QueryRequest): Observable<ApiResponse<ASS11020Data[]>> => {
    const rawFormValue = this.queryForm.getRawValue();
    // table-report lazy load 只 patch camelCase pageIndex/pageSize（PascalCase 會殘留舊值），故 camelCase 優先
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const pageSize: number = (body as any).pageSize ?? body.PageSize ?? 30;
    const pageIndex: number = (body as any).pageIndex ?? body.PageIndex ?? 1;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    const payload: ASS11020QueryRequest = {
      M_CLASS_ID: rawFormValue.M_CLASS_ID || undefined,
      B_CLASS_ID: rawFormValue.B_CLASS_ID || undefined,
      NOTES_KEYWORD: rawFormValue.NOTES_KEYWORD || undefined,
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: body.SortBy,
    };
    // 移除空值
    const cleanPayload = removeEmptyValues(payload) as ASS11020QueryRequest;
    return this.service.queryASS11020(cleanPayload);
  };

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const rawFormValue = this.queryForm.getRawValue();
      this.lastQueryBody = {
        M_CLASS_ID: rawFormValue.M_CLASS_ID || undefined,
        B_CLASS_ID: rawFormValue.B_CLASS_ID || undefined,
        NOTES_KEYWORD: rawFormValue.NOTES_KEYWORD || undefined,
        PageSize: rawFormValue.pageSize || 30,
        PageIndex: rawFormValue.pageIndex || 1,
      } as ASS11020QueryRequest;

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, rawFormValue);
      this.logger.debug(`onSubmit:`, [this.lastQueryBody]);
      this.queryFunction(this.lastQueryBody).pipe(
        finalize(() => {
          this.tableLoading.set(false);
          this.loading = false;
        }),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.tableData.set(res.Data);
          this.totalRecords.set(res.TotalCount || 0);
        },
      });
    });
  }
}
