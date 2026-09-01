import { SortMeta } from 'primeng/api';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
  ASS15080QueryRequest,
  ASS15080QueryRow,
} from '@pages/ass/ass15080/ass15080.model';
import { ASS15080Service } from '@service/api/ass/ass15080.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn, formatDate } from '@shared/components/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { distinctUntilChanged, finalize } from 'rxjs';
import { map } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';

/** 資產重估查詢 */
@UntilDestroy()
@Component({
  selector: 'app-ass15080',
  templateUrl: './ass15080.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarRangeComponent,
    CalendarComponent,
    ButtonComponent,
    ButtonModule,
    TableReportComponent,
    TranslateModule,
  ],
})
export class ASS15080Component
  extends BasicQueryPageComponent<ASS15080QueryRow>
  implements OnInit
{
  queryForm = this.formBuilder.nonNullable.group({
    accNo: [null as string | null],
    orgId: [null as string | null],
    appDateFrom: [null as string | null],
    appDateTo: [null as string | null],
    chkDateFrom: [null as string | null],
    chkDateTo: [null as string | null],
    bClassId: [null as string | null],
    mClassId: [null as string | null],
    sClassId: [null as string | null],
    goodsId: [null as string | null],
    baseDate: [null as Date | string | null],
  });

  accNoOptions: { value: string; label: string }[] = [];
  orgIdOptions: { value: string; label: string }[] = [];
  bClassOptions: { value: string; label: string }[] = [];
  mClassOptions: { value: string; label: string }[] = [];
  sClassOptions: { value: string; label: string }[] = [];
  goodsIdOptions: { value: string; label: string }[] = [];

  readonly tableData = signal<ASS15080QueryRow[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableLoading = signal<boolean>(false);
  lastQueryBody?: ASS15080QueryRequest;
  private readonly defaultPageSize = 30;
  btnPDFLoading = false;

  columns: ReportColumn[] = [
    { field: 'ASSET_ID', header: '資產編號', visible: true },
    { field: 'GOODS_ID', header: '項目編號', visible: true },
    { field: 'GOODS_NAME', header: '項目名稱', visible: true },
    {
      field: 'CRT_Date',
      header: '異動審核日',
      visible: true,
      format: (v: string) => formatDate(v),
    },
    { field: 'HOLD_ORG_ID', header: '保管單位', visible: true },
    { field: 'Org_Name', header: '保管單位名稱', visible: true },
    { field: 'UPD_GET_COST', header: '異動價格', visible: true },
    { field: 'UPD_EXP_YEAR', header: '異動耐用年限', visible: true },
    { field: 'NOTES', header: '備註', visible: true },
  ];

  constructor(
    private readonly ass15080Service: ASS15080Service,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'ASS15080',
      '',
      this.queryForm,
      (form) => this.onSubmit(form)
    );
    this.loadDropdownOptions();
    this.setupClassCascades();
  }

  private loadDropdownOptions(): void {
    this.loadAccNoOptions();
    this.loadOrgOptions();
    this.loadBigClassOptions();
    this.mClassOptions = [];
    this.sClassOptions = [];
    this.loadGoodsOptions();
  }

  private loadAccNoOptions(): void {
    this.dropdownApiService
      .queryGls1005AccSubCode()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: { value: string | number; label: string }[] | null) => {
          this.accNoOptions = (res ?? []).map((item) => ({
            value: String(item.value),
            label: item.label,
          }));
        },
        error: () => {
          this.accNoOptions = [];
        },
      });
  }

  private loadOrgOptions(): void {
    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<IDropdownItem[]>) => {
          this.orgIdOptions = res.Status === '0000' ? this.mapNoNameOptions(res.Data) : [];
        },
        error: () => {
          this.orgIdOptions = [];
        },
      });
  }

  private loadBigClassOptions(): void {
    this.dropdownApiService
      .queryFaClassM({})
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (opts) => {
          this.bClassOptions = (opts ?? []).map((item) => ({
            label: item.label,
            value: String(item.value),
          }));
        },
        error: () => {
          this.bClassOptions = [];
        },
      });
  }

  private setupClassCascades(): void {
    const bCtrl = this.queryForm.controls.bClassId;
    const mCtrl = this.queryForm.controls.mClassId;
    const sCtrl = this.queryForm.controls.sClassId;

    bCtrl.valueChanges
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe((bClassId) => {
        mCtrl.patchValue(null, { emitEvent: false });
        sCtrl.patchValue(null, { emitEvent: false });
        this.mClassOptions = [];
        this.sClassOptions = [];
        if (!bClassId) return;
        this.dropdownApiService.queryFaClass1({ B_CLASS_ID: bClassId }).pipe(untilDestroyed(this)).subscribe((options) => {
          this.mClassOptions = (options ?? []).map((item) => ({
            value: String(item.value),
            label: item.label,
          }));
        });
      });

    mCtrl.valueChanges
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe((mClassId) => {
        sCtrl.patchValue(null, { emitEvent: false });
        this.sClassOptions = [];
        if (!mClassId) return;
        const bForSmall = bCtrl.value ?? undefined;
        this.dropdownApiService
          .queryFaClass2({ B_CLASS_ID: bForSmall, M_CLASS_ID: mClassId })
          .pipe(untilDestroyed(this))
          .subscribe((options) => {
          this.sClassOptions = (options ?? []).map((item) => ({
            value: String(item.value),
            label: item.label,
          }));
        });
      });

    const initialBClassId = bCtrl.value;
    const initialMClassId = mCtrl.value;
    if (initialBClassId) {
      this.dropdownApiService.queryFaClass1({ B_CLASS_ID: initialBClassId }).pipe(untilDestroyed(this)).subscribe((options) => {
        this.mClassOptions = (options ?? []).map((item) => ({
          value: String(item.value),
          label: item.label,
        }));
      });
    }
    if (initialMClassId && initialBClassId) {
      this.dropdownApiService
        .queryFaClass2({ B_CLASS_ID: initialBClassId, M_CLASS_ID: initialMClassId })
        .pipe(untilDestroyed(this))
        .subscribe((options) => {
        this.sClassOptions = (options ?? []).map((item) => ({
          value: String(item.value),
          label: item.label,
        }));
      });
    }
  }

  private loadGoodsOptions(): void {
    this.dropdownApiService
      .queryAss11040Dropdown()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: { value: string | number; label: string }[] | null) => {
          this.goodsIdOptions = (res ?? []).map((item) => ({
            value: String(item.value),
            label: item.label,
          }));
        },
        error: () => {
          this.goodsIdOptions = [];
        },
      });
  }

  private mapNoNameOptions(items: IDropdownItem[] | null | undefined): { value: string; label: string }[] {
    return (items ?? []).map((item) => ({
      value: item.No,
      label: `${item.No} - ${item.Name}`,
    }));
  }

  private buildRequest(body?: {
    pageSize?: number;
    PageSize?: number;
    pageIndex?: number;
    PageIndex?: number;
    SortBy?: unknown;
  }): ASS15080QueryRequest {
    const raw = this.queryForm.getRawValue();
    const pageSize = body?.pageSize ?? body?.PageSize ?? this.defaultPageSize;
    const pageIndex = body?.pageIndex ?? body?.PageIndex ?? 1;
    const sortBy = Array.isArray(body?.SortBy)
      ? (body.SortBy as SortMeta[])
      : undefined;

    const payload: ASS15080QueryRequest = {
      ACC_NO: raw.accNo || undefined,
      ORG_ID: raw.orgId || undefined,
      APP_DATE_S: this.toApiDateValue(raw.appDateFrom),
      APP_DATE_E: this.toApiDateValue(raw.appDateTo),
      CHK_DATE_S: this.toApiDateValue(raw.chkDateFrom),
      CHK_DATE_E: this.toApiDateValue(raw.chkDateTo),
      B_CLASS_ID: raw.bClassId || undefined,
      M_CLASS_ID: raw.mClassId || undefined,
      S_CLASS_ID: raw.sClassId || undefined,
      GOODS_ID: raw.goodsId || undefined,
      BASE_DATE: this.toBaseDateYyyyMm(raw.baseDate),
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: sortBy,
    };

    return removeEmptyValues(payload) as ASS15080QueryRequest;
  }

  queryFunction = (body: {
    pageSize?: number;
    PageSize?: number;
    pageIndex?: number;
    PageIndex?: number;
    SortBy?: unknown;
  }) => {
    const request = this.buildRequest(body);
    this.lastQueryBody = request;
    return this.ass15080Service.queryASS15080(request).pipe(
      map((res: ApiResponse<ASS15080QueryRow[]>) => {
        const list = res.Status === '0000' ? (res.Data ?? []) : [];
        const mapped = list.map((row, idx) => ({
          ...row,
          RowNum: row.RowNum ?? idx + 1,
          ID:
            row.ID ??
            `${row.ASSET_ID ?? ''}-${row.GOODS_ID ?? ''}-${idx}`,
        }));
        return {
          Data: mapped,
          TotalCount: res.TotalCount ?? mapped.length,
        };
      })
    );
  };

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.lastQueryBody = this.buildRequest({
        pageSize: this.defaultPageSize,
        pageIndex: 1,
        SortBy: this.lastQueryBody?.SortBy,
      });
      this.tableLoading.set(true);
      this.queryFunction(this.lastQueryBody)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          })
        )
        .subscribe({
          next: (res) => {
            this.tableData.set(res.Data ?? []);
            this.totalRecords.set(res.TotalCount ?? 0);
          },
          error: () => {
            this.tableData.set([]);
            this.totalRecords.set(0);
          },
        });
    });
  }

  private toApiDateValue(value: unknown): string | undefined {
    if (value == null || value === '') return undefined;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    return undefined;
  }

  private toBaseDateYyyyMm(value: unknown): string | undefined {
    if (value == null || value === '') return undefined;
    if (value instanceof Date) {
      const y = value.getFullYear();
      const m = (value.getMonth() + 1).toString().padStart(2, '0');
      return `${y}${m}`;
    }
    if (typeof value === 'string') {
      const nums = value.replace(/\D/g, '');
      if (nums.length >= 6) return nums.substring(0, 6);
    }
    return undefined;
  }

  onClearForm(): void {
    this.queryForm.reset();
  }

  private buildExportPayload(): ASS15080QueryRequest {
    return this.buildRequest({
      PageSize: 0,
      PageIndex: 0,
      SortBy: this.lastQueryBody?.SortBy,
    });
  }

  onExportPDF(): void {
    const payload = this.buildExportPayload();
    this.btnPDFLoading = true;
    this.ass15080Service
      .exportPDFASS15080(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.btnPDFLoading = false))
      )
      .subscribe((blob) => {
        if (blob) {
          const now = new Date();
          const timestamp =
            now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0') +
            now.getSeconds().toString().padStart(2, '0');
          const fileName = `資產重估查詢_${timestamp}.pdf`;
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(blobUrl);
        }
      });
  }
}
