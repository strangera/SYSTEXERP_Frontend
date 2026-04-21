import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11010Service } from '@service/api/ass/ass11010.service';
import { ASS11020Service } from '@service/api/ass/ass11020.service';
import { ASS11030Service } from '@service/api/ass/ass11030.service';
import { ASS15010Service } from '@service/api/ass/ass15010.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ASS11010Data } from '@pages/ass/ass11010/ass11010.model';
import { ASS11020Data } from '@pages/ass/ass11020/ass11020.model';
import { ASS11030Data } from '@pages/ass/ass11030/ass11030.model';
import {
  QueryASS15010ApiRequest,
  QueryASS15010Response,
} from '@pages/ass/ass15010/ass15010.model';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatDate } from '@shared/componentkit/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';

/** 3.1.5.1 財產標籤列印作業 */
@UntilDestroy()
@Component({
  selector: 'app-ass15010',
  templateUrl: './ass15010.component.html',
  styleUrl: './ass15010.component.scss',
  standalone: true,
  providers: [DatePipe],
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextRangeComponent,
    CalendarRangeQuickComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
  ],
})
export class ASS15010Component
  extends BasicQueryPageComponent<QueryASS15010Response>
  implements OnInit
{
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
    private readonly ass11010Service: ASS11010Service,
    private readonly ass11020Service: ASS11020Service,
    private readonly ass11030Service: ASS11030Service,
    private readonly datePipe: DatePipe,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS15010', '', this.queryForm, (frm) => this.onSubmit(frm));
    this.loadDropdowns();
  }

  private loadDropdowns(): void {
    this.dropdownApi
      .queryASS11040DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.goodsIdOptions = opts ?? [];
      });

    this.ass11010Service.queryASS11010({}).pipe(untilDestroyed(this)).subscribe((res) => {
      if (res.Status !== '0000' || !res.Data) return;
      this.bigClassOptions = res.Data.map((item: ASS11010Data) => ({
        label: `${item.CLASS_ID} - ${item.CLASS_NAME}`,
        value: item.CLASS_ID,
      }));
    });

    this.ass11020Service.queryASS11020({}).pipe(untilDestroyed(this)).subscribe((res) => {
      if (res.Status !== '0000' || !res.Data) return;
      this.midClassOptions = res.Data.map((item: ASS11020Data) => ({
        label: `${item.M_CLASS_ID} - ${item.M_CLASS_NAME}`,
        value: item.M_CLASS_ID,
      }));
    });

    this.ass11030Service.queryASS11030({}).pipe(untilDestroyed(this)).subscribe((res) => {
      if (res.Status !== '0000' || !res.Data) return;
      this.smallClassOptions = res.Data.map((item: ASS11030Data) => ({
        label: `${item.S_CLASS_ID} - ${item.S_CLASS_NAME}`,
        value: item.S_CLASS_ID,
      }));
    });

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
              if (res.Status && res.Status !== '0000') {
                this.messageService.warnBubble(res.Message || '查詢失敗');
              }
            }
          },
          error: () => {
            this.data = [];
            this.totalRecords = 0;
            this.lastExportBody = null;
          },
        });
    });
  }

  onExportLabelTablePdf(): void {
    if (!this.lastExportBody) {
      this.messageService.warnBubble('請先執行查詢');
      return;
    }
    if (this.data.length === 0) {
      this.messageService.warnBubble('無資料可匯出');
      return;
    }
    this.fileExportService
      .executeFileExport(
        this.ass15010Service.exportLabelTablePDFASS15010(this.lastExportBody).pipe(untilDestroyed(this)),
        '.pdf',
        (v) => (this.exportTablePdfLoading = v),
      )
      .subscribe();
  }

  onExportLabelPdf(): void {
    if (!this.lastExportBody) {
      this.messageService.warnBubble('請先執行查詢');
      return;
    }
    if (this.data.length === 0) {
      this.messageService.warnBubble('無資料可匯出');
      return;
    }
    this.fileExportService
      .executeFileExport(
        this.ass15010Service.exportLabelPDFASS15010(this.lastExportBody).pipe(untilDestroyed(this)),
        '.pdf',
        (v) => (this.exportLabelPdfLoading = v),
      )
      .subscribe();
  }
}
