import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS16030Service } from '@service/api/ass/ass16030.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Option } from '@service/utility/dropdown-api.model';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import {
  formatDate,
  ReportColumn,
} from '@shared/componentkit/table-report/table-report.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  ASS16030QueryData,
  ASS16030QueryRequest,
} from './ass16030.model';

@UntilDestroy()
@Component({
  selector: 'app-ass16030',
  templateUrl: './ass16030.component.html',
  styleUrl: './ass16030.component.scss',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarRangeQuickComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class ASS16030Component
  extends BasicQueryPageComponent<ASS16030QueryData>
  implements OnInit
{
  queryForm = this.formBuilder.group({
    MTAPPLY_ID: [null as string | null],
    EMP_ID: [null as string | null],
    FASITEM_ID: [null as number | null],
    APPLY_DATE_S: [null as Date | null],
    APPLY_DATE_E: [null as Date | null],
    APRV_DATE_S: [null as Date | null],
    APRV_DATE_E: [null as Date | null],
    ORG_ID: [null as string | null],
    CHECK_DATE: [null as Date | null],
    APRV_EMP_ID: [null as string | null],
    WH_ID: [null as string | null],
    STATUS: [null as string | null],
    PageSize: [30],
    PageIndex: [1],
  });

  data: ASS16030QueryData[] = [];
  totalRecords = 0;
  lastQueryBody?: ASS16030QueryRequest;

  // Dropdown options（皆採用 `<code> - <name>` 格式）
  userOptions: Option[] = [];
  orgOptions: Option[] = [];
  whOptions: Option[] = [];
  statusOptions: Option[] = [];
  fasitemOptions: Option[] = [];

  columns: ReportColumn[] = [
    { field: 'MTAPPLY_ID', header: '領用單號' },
    { field: 'EMP_ID', header: '申請人代碼' },
    {
      field: 'EMP_NAME',
      header: '申請人名稱',
      format: (_v, _i, row) =>
        row?.EMP_NAME ??
        this.userOptions.find(o => o.value === row?.EMP_ID)?.['Name'] ??
        '',
    },
    { field: 'ORG_ID', header: '部門代碼' },
    {
      field: 'ORG_NAME',
      header: '部門名稱',
      format: (_v, _i, row) =>
        row?.ORG_NAME ??
        this.orgOptions.find(o => o.value === row?.ORG_ID)?.['Name'] ??
        '',
    },
    {
      field: 'APPLY_DATE',
      header: '申請日期',
      format: v => formatDate(v),
    },
    {
      field: 'MTAPPLY_STATUS',
      header: '領用單狀態',
      format: (_v, _i, row) =>
        row?.MTAPPLY_STATUS_NAME ??
        this.statusOptions.find(o => o.value === row?.MTAPPLY_STATUS)?.['Name'] ??
        row?.MTAPPLY_STATUS ??
        '',
    },
    { field: 'APRV_EMP_ID', header: '審核者代碼' },
    {
      field: 'APRV_EMP_NAME',
      header: '審核者名稱',
      format: (_v, _i, row) =>
        row?.APRV_EMP_NAME ??
        this.userOptions.find(o => o.value === row?.APRV_EMP_ID)?.['Name'] ??
        '',
    },
    {
      field: 'APRV_DATE',
      header: '審核日期',
      format: v => (v ? formatDate(v) : ''),
    },
    {
      field: 'CHECK_DATE',
      header: '發料日期',
      format: v => (v ? formatDate(v) : ''),
    },
    {
      field: 'LINE_NUM',
      header: '明細筆數',
      align: 'right',
    },
  ];

  // TODO: 確認 MTAPPLY_STATUS code 值；推測 1=領用申請
  readonly APPLY_STATUS_CODE = '1';

  constructor(
    private ass16030Service: ASS16030Service,
    private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'ASS16030',
      'ass/ass16030cru',
      this.queryForm,
      form => this.onSubmit(form),
    );
    this.loadDropdowns();
  }

  private loadDropdowns(): void {
    // 申請人 / 審核者（同一份）
    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.userOptions = (res?.Data ?? []).map(item => ({
          ...item,
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
      });

    // 部門代號
    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.orgOptions = (res?.Data ?? []).map(item => ({
          ...item,
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
      });

    // 倉別
    this.dropDownListService
      .queryFAHOS_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = (res?.Data ?? []) as {
          WH_ID?: string | null;
          WH_NAME?: string | null;
        }[];
        this.whOptions = list.map(item => ({
          ...item,
          No: item.WH_ID ?? '',
          Name: item.WH_NAME ?? '',
          label: `${item.WH_ID ?? ''} - ${item.WH_NAME ?? ''}`,
          value: item.WH_ID ?? '',
        }));
      });

    // 領用單狀態
    this.dropDownListService
      .querySYS1000_DropDownList({ SYS_Type: 'MTAPPLY_STATUS' })
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.statusOptions = (res?.Data ?? []).map(item => ({
          ...item,
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
      });

    // 品項下拉（使用 dropdown-api.service.ts，符合 data-display-conventions skill 規範）
    this.dropdownApiService
      .queryFasItemDropdown()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.fasitemOptions = res ?? [];
      });
  }

  /** queryFunction：提供給 app-table-report lazy loading 使用 */
  queryFunction = (
    body: ASS16030QueryRequest & { pageSize?: number; pageIndex?: number },
  ): Observable<ApiResponse<ASS16030QueryData[]>> => {
    const raw = this.queryForm.getRawValue();
    const payload: ASS16030QueryRequest = {
      MTAPPLY_ID: raw.MTAPPLY_ID,
      EMP_ID: raw.EMP_ID,
      FASITEM_ID: raw.FASITEM_ID,
      APPLY_DATE_S: raw.APPLY_DATE_S
        ? new Date(raw.APPLY_DATE_S).toISOString()
        : null,
      APPLY_DATE_E: raw.APPLY_DATE_E
        ? new Date(raw.APPLY_DATE_E).toISOString()
        : null,
      APRV_DATE_S: raw.APRV_DATE_S
        ? new Date(raw.APRV_DATE_S).toISOString()
        : null,
      APRV_DATE_E: raw.APRV_DATE_E
        ? new Date(raw.APRV_DATE_E).toISOString()
        : null,
      ORG_ID: raw.ORG_ID,
      CHECK_DATE: raw.CHECK_DATE
        ? new Date(raw.CHECK_DATE).toISOString()
        : null,
      APRV_EMP_ID: raw.APRV_EMP_ID,
      WH_ID: raw.WH_ID,
      STATUS: raw.STATUS,
      PageSize: body?.PageSize ?? body?.pageSize ?? 30,
      PageIndex: body?.PageIndex ?? body?.pageIndex ?? 1,
      SortBy: body?.SortBy,
    };
    return this.ass16030Service.queryASS16030(
      removeEmptyValues(payload) as ASS16030QueryRequest,
    );
  };

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      this.lastQueryBody = {
        ...raw,
        PageSize: raw.PageSize ?? 30,
        PageIndex: raw.PageIndex ?? 1,
      } as ASS16030QueryRequest;

      this.queryFunction(this.lastQueryBody)
        .pipe(
          untilDestroyed(this),
          finalize(() => (this.loading = false)),
        )
        .subscribe({
          next: res => {
            this.data = res.Data ?? [];
            this.totalRecords = res.TotalCount ?? 0;
            this.queryStateService.setQueryState(this.ProgNo, raw);
          },
        });
    });
  }

  /** 修改按鈕 disabled 條件：僅「領用申請」狀態可編輯 */
  editDisabled = (row: ASS16030QueryData): boolean => {
    return row.MTAPPLY_STATUS !== this.APPLY_STATUS_CODE;
  };
}
