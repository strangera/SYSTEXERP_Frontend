import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11010Service } from '@service/api/ass/ass11010.service';
import { ASS11020Service } from '@service/api/ass/ass11020.service';
import { ASS11030Service } from '@service/api/ass/ass11030.service';
import { ASS13050Service } from '@service/api/ass/ass13050.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ColumnGroup, formatAmount, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, Observable } from 'rxjs';
import { ASS13050QueryRow, QueryASS13050Request } from './ass13050.model';
import { AsyncPipe } from '@angular/common';

// 3.1.3.5 移轉交接表
@UntilDestroy()
@Component({
  selector: 'app-ass13050',
  templateUrl: './ass13050.component.html',
  styleUrl: './ass13050.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    ButtonComponent,
    CalendarComponent,
    DropdownComponent,
    MultiSelectComponent,
    RadiobuttonComponent,
    MenubarComponent,
    TableReportComponent,
  ],
})
export class ASS13050Component extends BasicQueryPageComponent<ASS13050QueryRow> implements OnInit {

  readonly queryForm = this.formBuilder.nonNullable.group({
    TRANSFER_DATE: new FormControl<Date | null>(null, [Validators.required]),
    NEW_HOLD_ORG_ID: new FormControl<string | null>(null, [Validators.required]),
    NEW_HOLD_EMP_ID: new FormControl<string | null>(null),
    NEW_USE_ORG_ID: new FormControl<string | null>(null, [Validators.required]),
    NEW_USE_EMP_ID: new FormControl<string | null>(null),
    PURCHASE_TYPE: new FormControl<string[]>([]),
    B_CLASS_ID: new FormControl<string | null>(null),
    M_CLASS_ID: new FormControl<string | null>(null),
    S_CLASS_ID: new FormControl<string | null>(null),
    ASSET_ID: new FormControl<string | null>(null),
    TITLE: new FormControl<number | null>(null),
    HOLD_ORG_ID: new FormControl<string | null>(null),
    HOLD_EMP_ID: new FormControl<string | null>(null),
    USE_ORG_ID: new FormControl<string | null>(null),
    USE_EMP_ID: new FormControl<string | null>(null),
    PageSize: new FormControl<number>(30),
    PageIndex: new FormControl<number>(1),
  });

  readonly tableData = signal<ASS13050QueryRow[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableLoading = signal<boolean>(false);
  lastQueryBody?: QueryASS13050Request;

  btnReportLoading = false;

  // 下拉選單資料來源
  readonly orgOptions$ = this.dropdownApi.querySys3100();
  readonly userOptions$ = this.dropdownApi.queryTblUser();
  readonly bigClassOptions = signal<{ label: string; value: string }[]>([]);
  readonly midClassOptions = signal<{ label: string; value: string }[]>([]);
  readonly smallClassOptions = signal<{ label: string; value: string }[]>([]);
  readonly purchaseTypeOptions: { label: string; value: string }[] = [];
  readonly assetOptions: { label: string; value: string }[] = [];
  readonly titleOptions = [
    { value: 1, label: '交接' },
    { value: 2, label: '移轉' },
  ];

  readonly columnGroup: ColumnGroup[] = [
    { field: 'item', header: '項目' },
    { field: 'oldKeeper', header: '原保管' },
    { field: 'newKeeper', header: '新保管' },
  ];

  readonly columns: ReportColumn[] = [
    { field: 'ASSET_ID', header: '財產編號', groupField: 'item' },
    { field: 'ITEM_NAME', header: '品項', groupField: 'item' },
    { field: 'QTY', header: '數量', groupField: 'item' },
    { field: 'UNIT', header: '單位', groupField: 'item' },
    { field: 'CONFIRM_TRANSFER', header: '確定交接' },
    { field: 'HOLD_ORG_NAME', header: '保管單位', groupField: 'oldKeeper' },
    { field: 'HOLD_EMP_NAME', header: '保管人', groupField: 'oldKeeper' },
    { field: 'USE_ORG_NAME', header: '使用單位', groupField: 'oldKeeper' },
    { field: 'USE_EMP_NAME', header: '使用者', groupField: 'oldKeeper' },
    { field: 'NEW_HOLD_ORG_NAME', header: '保管單位', groupField: 'newKeeper' },
    { field: 'NEW_HOLD_EMP_NAME', header: '保管人', groupField: 'newKeeper' },
    { field: 'NEW_USE_ORG_NAME', header: '使用單位', groupField: 'newKeeper' },
    { field: 'NEW_USE_EMP_NAME', header: '使用者', groupField: 'newKeeper' },
    { field: 'ASSET_STATUS', header: '資產狀態' },
    { field: 'ORIGINAL_AMOUNT', header: '原始取得金額', format: formatAmount },
    { field: 'REMARK', header: '備註' },
  ];

  constructor(
    private readonly ass13050Service: ASS13050Service,
    private readonly ass11010Service: ASS11010Service,
    private readonly ass11020Service: ASS11020Service,
    private readonly ass11030Service: ASS11030Service,
    private readonly dropdownApi: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13050', '', this.queryForm, () => this.onSubmit());
    this.loadBigClassOptions();
    this.loadMidClassOptions();
    this.loadSmallClassOptions();
  }

  queryFunction = (body: QueryASS13050Request): Observable<ApiResponse<ASS13050QueryRow[]>> => {
    const rawValue = this.queryForm.getRawValue();
    const payload: QueryASS13050Request = {
      ...this.buildQueryPayload(rawValue),
      PageSize: (body as Record<string, unknown>)['PageSize'] as number ?? body.PageSize,
      PageIndex: (body as Record<string, unknown>)['PageIndex'] as number ?? body.PageIndex,
      SortBy: body.SortBy,
    };
    return this.ass13050Service.queryASS13050(removeEmptyValues(payload) as QueryASS13050Request);
  };

  onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const rawValue = this.queryForm.getRawValue();
      const payload: QueryASS13050Request = {
        ...this.buildQueryPayload(rawValue),
        PageSize: rawValue.PageSize || 30,
        PageIndex: 1,
      };
      const cleanPayload = removeEmptyValues(payload) as QueryASS13050Request;

      this.lastQueryBody = cleanPayload;
      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, rawValue);

      this.ass13050Service.queryASS13050(cleanPayload).pipe(
        finalize(() => {
          this.tableLoading.set(false);
          this.loading = false;
        }),
        untilDestroyed(this),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.tableData.set(res.Data);
          this.totalRecords.set(res.TotalCount || 0);
        },
      });
    });
  }

  onDownloadReport(): void {
    const rawValue = this.queryForm.getRawValue();
    const payload = removeEmptyValues({
      ...this.buildQueryPayload(rawValue),
      PageSize: rawValue.PageSize || 30,
      PageIndex: 1,
    }) as QueryASS13050Request;

    this.btnReportLoading = true;
    this.ass13050Service.downloadReportASS13050(payload).pipe(
      finalize(() => this.btnReportLoading = false),
      untilDestroyed(this),
    ).subscribe(blob => {
      if (!blob) return;
      const now = new Date();
      const timestamp = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0');
      const fileName = `移轉交接表${timestamp}.pdf`;

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(blobUrl);
    });
  }

  private buildQueryPayload(rawValue: ReturnType<typeof this.queryForm.getRawValue>): QueryASS13050Request {
    return {
      TRANSFER_DATE: rawValue.TRANSFER_DATE ? this.formatDateToString(rawValue.TRANSFER_DATE) : undefined,
      NEW_HOLD_ORG_ID: rawValue.NEW_HOLD_ORG_ID || undefined,
      NEW_HOLD_EMP_ID: rawValue.NEW_HOLD_EMP_ID || undefined,
      NEW_USE_ORG_ID: rawValue.NEW_USE_ORG_ID || undefined,
      NEW_USE_EMP_ID: rawValue.NEW_USE_EMP_ID || undefined,
      PURCHASE_TYPE: rawValue.PURCHASE_TYPE?.length ? rawValue.PURCHASE_TYPE : undefined,
      B_CLASS_ID: rawValue.B_CLASS_ID || undefined,
      M_CLASS_ID: rawValue.M_CLASS_ID || undefined,
      S_CLASS_ID: rawValue.S_CLASS_ID || undefined,
      ASSET_ID: rawValue.ASSET_ID || undefined,
      TITLE: rawValue.TITLE ?? undefined,
      HOLD_ORG_ID: rawValue.HOLD_ORG_ID || undefined,
      HOLD_EMP_ID: rawValue.HOLD_EMP_ID || undefined,
      USE_ORG_ID: rawValue.USE_ORG_ID || undefined,
      USE_EMP_ID: rawValue.USE_EMP_ID || undefined,
    };
  }

  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

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

  private loadMidClassOptions(): void {
    this.ass11020Service.queryASS11020({}).subscribe({
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

  private loadSmallClassOptions(): void {
    this.ass11030Service.queryASS11030({}).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.S_CLASS_ID} - ${item.S_CLASS_NAME}`,
          value: item.S_CLASS_ID,
        }));
        this.smallClassOptions.set(options);
      },
    });
  }
}
