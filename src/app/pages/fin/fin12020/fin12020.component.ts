import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ECRNoService } from '@service/basic/queryPOS1002.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { FIN12020Data, FIN12020QueryRequest, FIN12020Service } from '../../../service/api/fin/fin12020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatDate } from '../../../shared/componentkit/table-report/table-report.model';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { removeEmptyValues } from '../../../shared/utils/object-utils';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';

@Component({
  selector: 'app-fin12020',
  templateUrl: './fin12020.component.html',
  styleUrl: './fin12020.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputTextRangeComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    MultiSelectComponent,
    YearMonthComponent
  ],
})
export class FIN12020Component extends BasicQueryPageComponent<FIN12020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    GUI_YYMM_start: ['', Validators.required], // 發票年月(起)
    GUI_YYMM_end: ['', Validators.required], // 發票年月(迄)
    GUI_TRACK: ['', [Validators.maxLength(2)]], // 字軌
    GUINo_start: ['', [Validators.maxLength(8)]], // 發票起始號碼
    GUINo_end: ['', [Validators.maxLength(8)]], // 發票結束號碼
    GUIPaperList: [[]], // 發票類別清單 (多選)
    ECR_NOList: [[]], // 收銀機號清單 (多選)
    GUI_StatusList: [[]], // 發票狀態清單 (多選)
    SAL_TypeList: [[]], // 使用別清單 (多選)
    ...createPaginationConfig([]) // 分頁和排序參數
  });

  readonly tableData = signal<FIN12020Data[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableLoading = signal<boolean>(false);
  lastQueryBody?: FIN12020QueryRequest;

  selectedItems: FIN12020Data[] = [];

  readonly columns: ReportColumn[] = [
    { field: 'GUI_YYMM', header: '發票年月', visible: true },
    { field: 'ECR_NO', header: '收銀機號', visible: true },
    { field: 'GUI_TRACK', header: '字軌', visible: true },
    { field: 'GUI_SNOS', header: '發票起始號碼', visible: true },
    { field: 'GUI_ENOS', header: '發票結束號碼', visible: true },
    { field: 'NEXT_SNOS', header: '下一個發票號碼', visible: true },
    { field: 'TOT_NOS', header: '全部張數', visible: true },
    { field: 'USED_NOS', header: '已用張數', visible: true },
    { field: 'FREE_NOS', header: '未用張數', visible: true },
    {
      field: 'GUIPaper', header: '發票類別', visible: true, format: (value: number) => this.invoiceTypeOptions.find(item => Number(item.value) === value)?.label || value
    },
    {
      field: 'GUI_Status', header: '發票狀態', visible: true, format: (value: number) => this.invoiceStatusOptions.find(item => item.value === value)?.label || value
    },
    { field: 'SAL_Type', header: '使用別', visible: true, format: (value: string) => this.usageTypeOptions.find(item => item.value === value)?.label || value },
    { field: 'CRT_Date', header: '建檔日期', visible: true, format: formatDate },
    { field: 'CRT_USR_No', header: '建檔人員', visible: true },
  ];

  // 下拉選單 options
  invoiceTypeOptions: any[] = [];
  cashierNoOptions: any[] = [];
  invoiceStatusOptions: any[] = [];
  usageTypeOptions: any[] = getSYS1000Options('T205');

  constructor(
    private fin12020Service: FIN12020Service,
    private ecrNoService: ECRNoService,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN12020', 'fin/fin12020cru', this.queryForm, () => this.onSubmit());
    this.loadOptions();
    // 設定發票年月預設值
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
    if (currentMonth % 2 === 0) {
      currentDate.setMonth(currentDate.getMonth() - 1);
    }
    this.queryForm.get('GUI_YYMM_start')?.setValue(this.datePipe.transform(currentDate, 'yyyyMM'));
    this.queryForm.get('GUI_YYMM_end')?.setValue(this.datePipe.transform(currentDate, 'yyyyMM'));
  }

  /** 表單多選欄位推論為 never，用 unknown 轉型後再檢查是否有長度 */
  private optionalList(value: unknown): string[] | undefined {
    return Array.isArray(value) && value.length ? value : undefined;
  }

  queryFunction = (body: any) => {
    const raw = this.queryForm.getRawValue();
    const pageSize = body?.pageSize ?? body?.PageSize ?? raw?.pageSize ?? 30;
    const pageIndex = body?.pageIndex ?? body?.PageIndex ?? raw?.pageIndex ?? 1;
    const payload: FIN12020QueryRequest = {
      GUI_YYMM_start: raw.GUI_YYMM_start || undefined,
      GUI_YYMM_end: raw.GUI_YYMM_end || undefined,
      GUI_TRACK: raw.GUI_TRACK || undefined,
      GUINo_start: raw.GUINo_start || undefined,
      GUINo_end: raw.GUINo_end || undefined,
      GUIPaperList: this.optionalList(raw.GUIPaperList),
      ECR_NOList: this.optionalList(raw.ECR_NOList),
      GUI_StatusList: this.optionalList(raw.GUI_StatusList),
      SAL_TypeList: this.optionalList(raw.SAL_TypeList),
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: body?.SortBy ?? raw?.SortBy,
    };
    const clean = removeEmptyValues(payload) as FIN12020QueryRequest;
    return this.fin12020Service.queryFIN12020(clean);
  };

  onSubmit(): void {
    const frm = this.queryForm;
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      this.lastQueryBody = {
        GUI_YYMM_start: raw.GUI_YYMM_start || undefined,
        GUI_YYMM_end: raw.GUI_YYMM_end || undefined,
        GUI_TRACK: raw.GUI_TRACK || undefined,
        GUINo_start: raw.GUINo_start || undefined,
        GUINo_end: raw.GUINo_end || undefined,
        GUIPaperList: this.optionalList(raw.GUIPaperList),
        ECR_NOList: this.optionalList(raw.ECR_NOList),
        GUI_StatusList: this.optionalList(raw.GUI_StatusList),
        SAL_TypeList: this.optionalList(raw.SAL_TypeList),
        PageSize: raw.pageSize ?? 30,
        PageIndex: raw.pageIndex ?? 1,
        SortBy: raw.SortBy,
      } as FIN12020QueryRequest;

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.queryFunction(this.lastQueryBody)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          })
        )
        .subscribe({
          next: response => {
            if (response.Status === '0000') {
              // console.log('API Response:', response);
              this.tableData.set(response.Data ?? []);
              this.totalRecords.set(response.TotalCount ?? 0);
            } else {
              this.messageService.errorBubble(`查詢失敗: ${response.Message}`);
            }
          }
        });
    });
  }

  isRowSelectable = (_rowData: FIN12020Data): boolean => true;

  loadOptions() {
    // 取得發票類別選項
    this.invoiceTypeOptions = [
      { label: '二聯式手開發票', value: '32' },
      { label: '三聯式手開發票', value: '31' },
      { label: '電子發票', value: '35' },
    ];

    // 取得收銀機號選項
    this.ecrNoService.getECRNo().subscribe((res) => {
      this.cashierNoOptions = res;
    });

    // 取得發票狀態選項
    this.invoiceStatusOptions = [
      { label: '未使用', value: '00' },
      { label: '使用中', value: '01' },
      { label: '己用完', value: '02' },
      { label: '停用', value: '03' },
    ];
  }
}
