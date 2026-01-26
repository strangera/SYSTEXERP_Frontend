import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS12010Service } from '@service/api/ass/ass12010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';
import { ASS12010Data, ASS12010QueryRequest } from './ass12010.model';

// 請購申請作業
@Component({
  selector: 'app-ass12010',
  templateUrl: './ass12010.component.html',
  styleUrl: './ass12010.component.scss',
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
export class ASS12010Component extends BasicQueryPageComponent<ASS12010Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    /** 倉別 */
    WH_ID: new FormControl<string | null>(null),
    /** 需求單號 */
    NEED_ID: new FormControl<string | null>(null),
    /** 品項代號 */
    GOODS_ID: new FormControl<string | null>(null),
    /** 申請人代號 */
    EMP_ID: new FormControl<string | null>(null),
    /** 部門代號 */
    ORG_ID: new FormControl<string | null>(null),
    /** 需求日期(起) */
    APPLY_DATE_FROM: new FormControl<Date | null>(null),
    /** 需求日期(迄) */
    APPLY_DATE_TO: new FormControl<Date | null>(null),
    /** 請購申請狀態 */
    NEEDS_STATUS: new FormControl<string | null>(null),
    pageSize: new FormControl<number>(30),
    pageIndex: new FormControl<number>(1),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<ASS12010Data[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public lastQueryBody?: ASS12010QueryRequest;

  public readonly columns: ReportColumn[] = [
    { field: 'NEED_ID', header: '需求單號' },
    { field: 'EMP_ID', header: '申請人編號' },
    { field: 'EMP_NAME', header: '申請人名稱' },
    { field: 'WH_ID', header: '倉別' },
    { field: 'ORG_ID', header: '部門代號' },
    { field: 'ORG_NAME', header: '部門名稱' },
    { field: 'APPLY_DATE', header: '需求日期' },
    { field: 'NEEDS_STATUS_NAME', header: '請購申請狀態' },
  ];

  // 下拉選單選項
  public readonly whIdOptions = signal<{ label: string; value: string }[]>([]);
  public readonly needIdOptions = signal<{ label: string; value: string }[]>([]);
  public readonly goodsIdOptions = signal<{ label: string; value: string }[]>([]);
  public readonly empIdOptions = signal<{ label: string; value: string }[]>([]);
  public readonly orgIdOptions = signal<{ label: string; value: string }[]>([]);
  public readonly needsStatusOptions = signal<{ label: string; value: string }[]>([]);

  constructor(
    public readonly service: ASS12010Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS12010', '/ASS/ASS12010CRU', this.queryForm, this.onSubmit.bind(this));
    this.logger.debug(`ASS12010 init:`, [this.queryForm]);
    this.loadDropdownOptions();
  }

  /**
   * 載入下拉選單選項
   */
  private loadDropdownOptions(): void {
    // 申請人代號
    this.dropDownListService.queryTBLUSER_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.empIdOptions.set(options);
      },
    });

    // 部門代號
    this.dropDownListService.queryPOS2013_DropDownList({}).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.orgIdOptions.set(options);
      },
    });

    // 請購申請狀態
    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'NEEDS_STATUS' }).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.needsStatusOptions.set(options);
      },
    });

    // TODO: 等 API 規格確認後，載入以下下拉選單
    // - 倉別 (WH_ID)
    // - 需求單號 (NEED_ID)
    // - 品項代碼 (GOODS_ID)
  }

  /**
   * 查詢函數（供 table-report 分頁查詢使用）
   */
  public queryFunction = (body: ASS12010QueryRequest): Observable<ApiResponse<ASS12010Data[]>> => {
    const rawFormValue = this.queryForm.getRawValue();
    const payload: ASS12010QueryRequest = {
      WH_ID: rawFormValue.WH_ID || undefined,
      NEED_ID: rawFormValue.NEED_ID || undefined,
      GOODS_ID: rawFormValue.GOODS_ID || undefined,
      EMP_ID: rawFormValue.EMP_ID || undefined,
      ORG_ID: rawFormValue.ORG_ID || undefined,
      APPLY_DATE_FROM: rawFormValue.APPLY_DATE_FROM || undefined,
      APPLY_DATE_TO: rawFormValue.APPLY_DATE_TO || undefined,
      NEEDS_STATUS: rawFormValue.NEEDS_STATUS || undefined,
      PageSize: body.PageSize,
      PageIndex: body.PageIndex,
      SortBy: body.SortBy,
    };
    // 移除空值
    const cleanPayload = removeEmptyValues(payload) as ASS12010QueryRequest;
    return this.service.queryASS12010(cleanPayload);
  };

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const rawFormValue = this.queryForm.getRawValue();
      this.lastQueryBody = {
        WH_ID: rawFormValue.WH_ID || undefined,
        NEED_ID: rawFormValue.NEED_ID || undefined,
        GOODS_ID: rawFormValue.GOODS_ID || undefined,
        EMP_ID: rawFormValue.EMP_ID || undefined,
        ORG_ID: rawFormValue.ORG_ID || undefined,
        APPLY_DATE_FROM: rawFormValue.APPLY_DATE_FROM || undefined,
        APPLY_DATE_TO: rawFormValue.APPLY_DATE_TO || undefined,
        NEEDS_STATUS: rawFormValue.NEEDS_STATUS || undefined,
        PageSize: rawFormValue.pageSize || 30,
        PageIndex: rawFormValue.pageIndex || 1,
      } as ASS12010QueryRequest;

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

  /**
   * 編輯按鈕禁用邏輯
   * TODO: 等 API 規格確認「已申請」狀態值後，更新此邏輯
   */
  public editDisabled = (rowData: ASS12010Data): boolean => {
    // 只有狀態為「已申請」時才可編輯
    // 目前先寫死，等 API 規格確認後再更新
    const appliedStatus = '已申請'; // TODO: 更新為實際的狀態值
    return rowData.NEEDS_STATUS_NAME !== appliedStatus;
  };
}
