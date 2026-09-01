import { AsyncPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS13050Service } from '@service/api/ass/ass13050.service';
import { TblUserOrgidItem } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ColumnGroup, formatAmount, ReportColumn } from '@shared/components/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { combineLatest, distinctUntilChanged, finalize, map, Observable, startWith } from 'rxjs';
import { ASS13050QueryRow, DownloadASS13050Request, QueryASS13050Request } from './ass13050.model';

// 3.1.3.5 移轉交接表
@UntilDestroy()
@Component({
  selector: 'app-ass13050',
  templateUrl: './ass13050.component.html',
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
    RadiobuttonComponent,
    MenubarComponent,
    TableReportComponent,
  ],
})
export class ASS13050Component extends BasicQueryPageComponent<ASS13050QueryRow> implements OnInit {

  readonly queryForm = this.formBuilder.nonNullable.group({
    TRANSFER_DATE: new FormControl<Date | null>(null),
    NEW_HOLD_ORG_ID: new FormControl<string | null>(null),
    NEW_HOLD_EMP_ID: new FormControl<string | null>(null),
    NEW_USE_ORG_ID: new FormControl<string | null>(null),
    NEW_USE_EMP_ID: new FormControl<string | null>(null),
    DEPRE_YN: new FormControl<string | null>(null),
    B_CLASS_ID: new FormControl<string | null>(null),
    M_CLASS_ID: new FormControl<string | null>(null),
    S_CLASS_ID: new FormControl<string | null>(null),
    ASSET_ID: new FormControl<string | null>(null),
    HEADLINE: new FormControl<string | null>(null),
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
  readonly userOrgidOptions$ = this.dropdownApi.queryTblUserOrgid();

  readonly newHoldEmpOptions$ = combineLatest([
    this.queryForm.controls.NEW_HOLD_ORG_ID.valueChanges.pipe(
      startWith(this.queryForm.controls.NEW_HOLD_ORG_ID.value),
    ),
    this.userOrgidOptions$,
  ]).pipe(
    map(([orgId, options]) =>
      !orgId
        ? []
        : (options ?? []).filter(o => (o as unknown as TblUserOrgidItem).Org_ID === orgId),
    ),
  );

  readonly newUseEmpOptions$ = combineLatest([
    this.queryForm.controls.NEW_USE_ORG_ID.valueChanges.pipe(
      startWith(this.queryForm.controls.NEW_USE_ORG_ID.value),
    ),
    this.userOrgidOptions$,
  ]).pipe(
    map(([orgId, options]) =>
      !orgId
        ? []
        : (options ?? []).filter(o => (o as unknown as TblUserOrgidItem).Org_ID === orgId),
    ),
  );

  readonly oldHoldEmpOptions$ = combineLatest([
    this.queryForm.controls.HOLD_ORG_ID.valueChanges.pipe(
      startWith(this.queryForm.controls.HOLD_ORG_ID.value),
    ),
    this.userOrgidOptions$,
  ]).pipe(
    map(([orgId, options]) =>
      !orgId
        ? []
        : (options ?? []).filter(o => (o as unknown as TblUserOrgidItem).Org_ID === orgId),
    ),
  );

  readonly oldUseEmpOptions$ = combineLatest([
    this.queryForm.controls.USE_ORG_ID.valueChanges.pipe(
      startWith(this.queryForm.controls.USE_ORG_ID.value),
    ),
    this.userOrgidOptions$,
  ]).pipe(
    map(([orgId, options]) =>
      !orgId
        ? []
        : (options ?? []).filter(o => (o as unknown as TblUserOrgidItem).Org_ID === orgId),
    ),
  );

  readonly bigClassOptions = signal<{ label: string; value: string }[]>([]);
  readonly midClassOptions = signal<{ label: string; value: string }[]>([]);
  readonly smallClassOptions = signal<{ label: string; value: string }[]>([]);
  // 進貨類型（DEPRE_YN 財產類型）
  readonly purchaseTypeOptions: { label: string; value: string }[] = [
    { value: '1', label: '資產' },
    { value: '2', label: '列管品' },
  ];
  /** 財產編號下拉選項 */
  readonly assetOptions$ = this.dropdownApi.queryFAASSETChooseList_DropDownList();
  readonly titleOptions = [
    { value: '交接', label: '交接' },
    { value: '移轉', label: '移轉' },
  ];

  readonly columnGroup: ColumnGroup[] = [
    { field: 'item', header: '項目' },
    { field: 'oldKeeper', header: '原保管' },
    { field: 'newKeeper', header: '新保管' },
  ];

  readonly columns: ReportColumn[] = [
    { field: 'ASSET_ID', header: '資產編號', groupField: 'item' },
    { field: 'GOODS_ID', header: '品項代碼', groupField: 'item' },
    { field: 'GOODS_NAME', header: '品項名稱', groupField: 'item' },
    { field: 'QTY', header: '數量', groupField: 'item' },
    { field: 'UNIT', header: '單位', groupField: 'item' },
    { field: 'CONFIRM_TRANSFER', header: '確定交接' },
    { field: 'ORI_HOLD_ORG_NAME', header: '保管單位', groupField: 'oldKeeper' },
    { field: 'ORI_HOLD_EMP_NAME', header: '保管人', groupField: 'oldKeeper' },
    { field: 'ORI_USE_ORG_NAME', header: '使用單位', groupField: 'oldKeeper' },
    { field: 'ORI_USE_EMP_NAME', header: '使用者', groupField: 'oldKeeper' },
    { field: 'HOLD_ORG_NAME', header: '保管單位', groupField: 'newKeeper' },
    { field: 'HOLD_EMP_NAME', header: '保管人', groupField: 'newKeeper' },
    { field: 'USE_ORG_NAME', header: '使用單位', groupField: 'newKeeper' },
    { field: 'USE_EMP_NAME', header: '使用者', groupField: 'newKeeper' },
    { field: 'ASSET_STATUS_NAME', header: '資產狀態' },
    { field: 'FIR_GET_COST', header: '原始取得金額', format: formatAmount },
    { field: 'NOTES', header: '備註' },
  ];

  constructor(
    private readonly ass13050Service: ASS13050Service,
    private readonly dropdownApi: DropdownApiService,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13050', '', this.queryForm, () => this.onSubmit());
    this.loadBigClassOptions();
    this.setupClassCascades();
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
          console.log("Data: ", res.Data);
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
      HEADLINE: rawValue.HEADLINE || undefined,
      PageSize: rawValue.PageSize || 30,
      PageIndex: 1,
    }) as DownloadASS13050Request;

    const download$ = this.ass13050Service.downloadReportASS13050(payload);
    this.fileExportService.executeFileExport(
      download$,
      '.pdf',
      (isLoading) => this.loading = isLoading
    ).subscribe();
  }

  private buildQueryPayload(rawValue: ReturnType<typeof this.queryForm.getRawValue>): QueryASS13050Request {
    return {
      TRANSFER_DATE: rawValue.TRANSFER_DATE ? this.formatDateToString(rawValue.TRANSFER_DATE) : undefined,
      NEW_HOLD_ORG_ID: rawValue.NEW_HOLD_ORG_ID || undefined,
      NEW_HOLD_EMP_ID: rawValue.NEW_HOLD_EMP_ID || undefined,
      NEW_USE_ORG_ID: rawValue.NEW_USE_ORG_ID || undefined,
      NEW_USE_EMP_ID: rawValue.NEW_USE_EMP_ID || undefined,
      DEPRE_YN: rawValue.DEPRE_YN || undefined,
      B_CLASS_ID: rawValue.B_CLASS_ID || undefined,
      M_CLASS_ID: rawValue.M_CLASS_ID || undefined,
      S_CLASS_ID: rawValue.S_CLASS_ID || undefined,
      ASSET_ID: rawValue.ASSET_ID || undefined,
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
    return `${year}-${month}-${day}`;
  }

  private loadBigClassOptions(): void {
    this.dropdownApi.queryFaClassM({}).subscribe((opts) => {
      const options = (opts ?? []).map((item) => ({
        label: item.label,
        value: String(item.value),
      }));
      this.bigClassOptions.set(options);
    });
  }

  private loadMidClassOptions(): void {
    const bClassId = this.queryForm.controls.B_CLASS_ID.value;
    if (!bClassId) {
      this.midClassOptions.set([]);
      return;
    }
    this.dropdownApi.queryFaClass1({ B_CLASS_ID: bClassId }).subscribe((opts) => {
      this.midClassOptions.set(opts ?? []);
    });
  }

  private loadSmallClassOptions(): void {
    const bClassId = this.queryForm.controls.B_CLASS_ID.value;
    const mClassId = this.queryForm.controls.M_CLASS_ID.value;
    if (!mClassId) {
      this.smallClassOptions.set([]);
      return;
    }
    this.dropdownApi
      .queryFaClass2({ B_CLASS_ID: bClassId ?? undefined, M_CLASS_ID: mClassId })
      .subscribe((opts) => {
        this.smallClassOptions.set(opts ?? []);
      });
  }

  private setupClassCascades(): void {
    this.queryForm.controls.B_CLASS_ID.valueChanges.pipe(
      distinctUntilChanged(),
      untilDestroyed(this),
    ).subscribe((bClassId) => {
      this.queryForm.patchValue(
        { M_CLASS_ID: null, S_CLASS_ID: null },
        { emitEvent: false },
      );
      this.midClassOptions.set([]);
      this.smallClassOptions.set([]);
      if (!bClassId) {
        return;
      }
      this.loadMidClassOptions();
    });

    this.queryForm.controls.M_CLASS_ID.valueChanges.pipe(
      distinctUntilChanged(),
      untilDestroyed(this),
    ).subscribe((mClassId) => {
      this.queryForm.patchValue({ S_CLASS_ID: null }, { emitEvent: false });
      this.smallClassOptions.set([]);
      if (!mClassId) {
        return;
      }
      this.loadSmallClassOptions();
    });

    const initialBClassId = this.queryForm.controls.B_CLASS_ID.value;
    const initialMClassId = this.queryForm.controls.M_CLASS_ID.value;
    if (initialBClassId) {
      this.loadMidClassOptions();
    }
    if (initialMClassId) {
      this.loadSmallClassOptions();
    }
  }
}
