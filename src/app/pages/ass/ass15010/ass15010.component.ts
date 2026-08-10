import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
  QueryASS15010ApiRequest,
  QueryASS15010Response,
} from '@pages/ass/ass15010/ass15010.model';
import { ASS15010Service } from '@service/api/ass/ass15010.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextRangeComponent } from '@shared/components/input-text-range/input-text-range.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn, formatDate } from '@shared/components/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { distinctUntilChanged, finalize } from 'rxjs';

type ExportAssetLabelRequest = QueryASS15010ApiRequest & {
  /** 勾選的財產編號 */
  ASSET_ID: string[];
};

/** 3.1.5.1 財產標籤列印作業 */
@UntilDestroy()
@Component({
  selector: 'app-ass15010',
  templateUrl: './ass15010.component.html',
  standalone: true,
  providers: [DatePipe],
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextRangeComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
  ],
})
export class ASS15010Component
  extends BasicQueryPageComponent<QueryASS15010Response>
  implements OnInit {
  readonly queryForm = this.formBuilder.nonNullable.group({
    depreYn: [null as string | null],
    goodsId: [null as string | null],
    bClassId: [null as string | null],
    mClassId: [null as string | null],
    sClassId: [null as string | null],
    holdEmpId: [null as string | null],
    holdOrgId: [null as string | null],
    assetIdFrom: [null as string | null],
    assetIdTo: [null as string | null],
    getDateFrom: [null as Date | null],
    getDateTo: [null as Date | null],
  });

  data: QueryASS15010Response[] = [];
  totalRecords = 0;
  /** 供匯出與 table-report 判定已查詢 */
  lastExportBody: QueryASS15010ApiRequest | null = null;
  exportTablePdfLoading = false;
  exportLabelPdfLoading = false;

  /** table-report 勾選的資料 */
  selectedItems: QueryASS15010Response[] = [];

  /** 接收 app-table-report Checkbox 勾選結果 */
  onSelectionChange(items: QueryASS15010Response[]): void {
    this.selectedItems = items ?? [];
  }

  /** 取得目前勾選的財產編號 */
  private getSelectedAssetIds(): string[] {
    return (this.selectedItems ?? [])
      .map((row) => row.ASSET_ID?.trim())
      .filter((assetId): assetId is string => !!assetId);
  }

  /** 建立匯出 Request：保留原查詢條件，再加上勾選的 ASSET_ID */
  private buildExportRequest(): ExportAssetLabelRequest | null {
    if (!this.lastExportBody) {
      this.messageService.warnBubble('請先執行查詢');
      return null;
    }

    const selectedAssetIds = this.getSelectedAssetIds();

    if (selectedAssetIds.length === 0) {
      this.messageService.warnBubble('請至少勾選一筆財產');
      return null;
    }

    return {
      ...this.lastExportBody,
      ASSET_ID: selectedAssetIds,
    };
  }

  readonly propertyTypeOptions: { value: string; label: string }[] = [
    { value: '1', label: '資產' },
    { value: '2', label: '列管品' },
  ];

  goodsIdOptions: Option[] = [];
  bigClassOptions: { label: string; value: string }[] = [];
  midClassOptions: { label: string; value: string }[] = [];
  smallClassOptions: { label: string; value: string }[] = [];
  holdEmpOptions: Option[] = [];
  holdOrgOptions: Option[] = [];

  readonly columns: ReportColumn[] = [
    { field: 'Org_Name', header: '保管單位名稱', visible: true, align: 'left' },
    { field: 'ASSET_ID', header: '財產代號', visible: true, align: 'left' },
    { field: 'GOODS_NAME', header: '財產名稱', visible: true, align: 'left' },
    { field: 'user_Name', header: '保管人', visible: true, align: 'left' },
    { field: 'LOCATION_ID', header: '地點', visible: true, align: 'left' },
    {
      field: 'GET_DATE',
      header: '取得日期',
      visible: true,
      align: 'left',
      format: (v: string | null | undefined) => formatDate(v ?? ''),
    },
  ];

  constructor(
    private readonly ass15010Service: ASS15010Service,
    private readonly dropdownApi: DropdownApiService,
    private readonly datePipe: DatePipe,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS15010', '', this.queryForm, (frm) => this.onSubmit(frm));
    this.loadDropdowns();
    this.setupClassCascades();
  }

  private loadDropdowns(): void {
    this.dropdownApi
      .queryASS11040DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.goodsIdOptions = opts ?? [];
      });

    this.dropdownApi
      .queryFaClassM({})
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.bigClassOptions = (opts ?? []).map((item) => ({
          label: item.label,
          value: String(item.value),
        }));
      });

    this.midClassOptions = [];
    this.smallClassOptions = [];

    this.dropdownApi
      .queryTblUser()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.holdEmpOptions = opts ?? [];
      });

    this.dropdownApi
      .querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.holdOrgOptions = opts ?? [];
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
        this.midClassOptions = [];
        this.smallClassOptions = [];
        if (!bClassId) return;
        this.dropdownApi.queryFaClass1({ B_CLASS_ID: bClassId }).pipe(untilDestroyed(this)).subscribe((options) => {
          this.midClassOptions = (options ?? []).map((item) => ({
            value: String(item.value),
            label: item.label,
          }));
        });
      });

    mCtrl.valueChanges
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe((mClassId) => {
        sCtrl.patchValue(null, { emitEvent: false });
        this.smallClassOptions = [];
        if (!mClassId) return;
        const bForSmall = bCtrl.value ?? undefined;
        this.dropdownApi
          .queryFaClass2({ B_CLASS_ID: bForSmall, M_CLASS_ID: mClassId })
          .pipe(untilDestroyed(this))
          .subscribe((options) => {
            this.smallClassOptions = (options ?? []).map((item) => ({
              value: String(item.value),
              label: item.label,
            }));
          });
      });

    const initialBClassId = bCtrl.value;
    const initialMClassId = mCtrl.value;
    if (initialBClassId) {
      this.dropdownApi.queryFaClass1({ B_CLASS_ID: initialBClassId }).pipe(untilDestroyed(this)).subscribe((options) => {
        this.midClassOptions = (options ?? []).map((item) => ({
          value: String(item.value),
          label: item.label,
        }));
      });
    }
    if (initialMClassId && initialBClassId) {
      this.dropdownApi
        .queryFaClass2({ B_CLASS_ID: initialBClassId, M_CLASS_ID: initialMClassId })
        .pipe(untilDestroyed(this))
        .subscribe((options) => {
          this.smallClassOptions = (options ?? []).map((item) => ({
            value: String(item.value),
            label: item.label,
          }));
        });
    }
  }

  private toOptionalDateStr(d: Date | null): string | undefined {
    if (!d) return undefined;
    return this.datePipe.transform(d, 'yyyy-MM-dd') ?? undefined;
  }

  private buildApiRequest(): QueryASS15010ApiRequest {
    const raw = this.queryForm.getRawValue();
    const assetStart = raw.assetIdFrom?.trim() ? raw.assetIdFrom.trim() : undefined;
    const assetEnd = raw.assetIdTo?.trim() ? raw.assetIdTo.trim() : undefined;
    const payload: QueryASS15010ApiRequest = {
      STO_NO: this.authService.currentUserValue?.SYS_StoreNo ?? undefined,
      DEPRE_YN: raw.depreYn?.trim() ? raw.depreYn.trim() : undefined,
      GOODS_ID: raw.goodsId?.trim() ? raw.goodsId.trim() : undefined,
      B_CLASS_ID: raw.bClassId?.trim() ? raw.bClassId.trim() : undefined,
      M_CLASS_ID: raw.mClassId?.trim() ? raw.mClassId.trim() : undefined,
      S_CLASS_ID: raw.sClassId?.trim() ? raw.sClassId.trim() : undefined,
      HOLD_EMP_ID: raw.holdEmpId?.trim() ? raw.holdEmpId.trim() : undefined,
      HOLD_ORG_ID: raw.holdOrgId?.trim() ? raw.holdOrgId.trim() : undefined,
      ASSET_ID_START: assetStart,
      ASSET_ID_END: assetEnd,
      GET_DATE_START: this.toOptionalDateStr(raw.getDateFrom),
      GET_DATE_END: this.toOptionalDateStr(raw.getDateTo),
    };
    return removeEmptyValues(payload) as QueryASS15010ApiRequest;
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      /** 重新查詢時清除舊勾選 */
      this.selectedItems = [];

      const payload = this.buildApiRequest();
      this.loading = true;
      this.ass15010Service
        .queryASS15010(payload)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
          }),
        )
        .subscribe({
          next: (res) => {
            if (res.Status === '0000') {
              this.lastExportBody = payload;
              const list = res.Data ?? [];
              const rows = list.map((row, i) => ({
                ...row,
                ROW_UID: `${row.ASSET_ID ?? ''}_${i}`,
              }));
              this.data = rows;
              this.totalRecords = res.TotalCount ?? rows.length;
              this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
            } else {
              this.data = [];
              this.totalRecords = 0;
              this.lastExportBody = null;
              this.selectedItems = [];
              if (res.Status && res.Status !== '0000') {
                this.messageService.warnBubble(res.Message || '查詢失敗');
              }
            }
          },
          error: () => {
            this.data = [];
            this.totalRecords = 0;
            this.lastExportBody = null;
            this.selectedItems = [];
          },
        });
    });
  }

  onExportLabelTablePdf(): void {
    const request = this.buildExportRequest();
    if (!request) return;

    this.fileExportService
      .executeFileExport(
        this.ass15010Service
          .exportLabelTablePDFASS15010(request)
          .pipe(untilDestroyed(this)),
        '.pdf',
        (v) => (this.exportTablePdfLoading = v),
      )
      .subscribe();
  }

  onExportLabelPdf(): void {
    const request = this.buildExportRequest();
    if (!request) return;

    this.fileExportService
      .executeFileExport(
        this.ass15010Service
          .exportLabelPDFASS15010(request)
          .pipe(untilDestroyed(this)),
        '.pdf',
        (v) => (this.exportLabelPdfLoading = v),
      )
      .subscribe();
  }
}