import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11010Service } from '@service/api/ass/ass11010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';
import { ASS11010Data, ASS11010QueryRequest } from './ass11010.model';

// 3.1.1.1 資產列管品及耗材分類管理作業-大分類維護作業
@Component({
  selector: 'app-ass11010',
  templateUrl: './ass11010.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    MenubarComponent,
    TableReportComponent,
  ],
})
export class ASS11010Component extends BasicQueryPageComponent<ASS11010Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    CLASS_ID: new FormControl<string | null>(null),   // 大分類代碼
    pageSize: new FormControl<number>(30),            // 每頁筆數
    pageIndex: new FormControl<number>(1),            // 頁碼
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<ASS11010Data[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public lastQueryBody?: ASS11010QueryRequest;

  // 大分類代碼/名稱下拉選項
  public readonly bigClassOptions = signal<{ label: string; value: string }[]>([]);

  public readonly columns: ReportColumn[] = [
    { field: 'CLASS_ID', header: '大分類代碼' },
    { field: 'CLASS_NAME', header: '大分類名稱' },
  ];

  constructor(
    public readonly service: ASS11010Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11010', '/ASS/ASS11010CRU', this.queryForm, this.onSubmit.bind(this));
    this.logger.debug(`ASS11010 init:`, [this.queryForm]);
    this.loadBigClassOptions();
  }

  /**
   * 載入大分類下拉選項
   */
  private loadBigClassOptions(): void {
    this.service.queryASS11010({}).subscribe({
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
   * 查詢函數（供 table-report 分頁查詢使用）
   */
  public queryFunction = (body: ASS11010QueryRequest): Observable<ApiResponse<ASS11010Data[]>> => {
    const rawFormValue = this.queryForm.getRawValue();
    const payload: ASS11010QueryRequest = {
      CLASS_ID: rawFormValue.CLASS_ID || undefined,
      Keyword: undefined,
      PageSize: body.PageSize,
      PageIndex: body.PageIndex,
      SortBy: body.SortBy,
    };
    // 移除空值
    const cleanPayload = removeEmptyValues(payload) as ASS11010QueryRequest;
    return this.service.queryASS11010(cleanPayload);
  };

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const rawFormValue = this.queryForm.getRawValue();
      this.lastQueryBody = {
        CLASS_ID: rawFormValue.CLASS_ID || undefined,
        PageSize: rawFormValue.pageSize || 30,
        PageIndex: rawFormValue.pageIndex || 1,
      } as ASS11010QueryRequest;

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
