import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { formatDate } from '@others/component/table/table.model';
import { finalize, map } from 'rxjs/operators';

import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';

import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { SortMeta } from 'primeng/api';
import { FIN73040Service } from '../../../service/api/fin/fin73040.service';
import { Option } from '../../../service/utility/dropdown-api.model';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownTableComponent, FieldsConfig } from '../../../shared/components/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { formatAmountWithDecimals, ReportColumn } from '../../../shared/components/table-report/table-report.model';
import { Column } from '../../../others/component/table/table.model';
import { FileExportService } from '../../../shared/service/file-export.service';
import { FIN73040Data, FIN73040Option, FIN73040Query } from './fin73040.model';

@Component({
  selector: 'app-fin73040',
  templateUrl: './fin73040.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    CalendarRangeComponent,
    DropdownComponent,
    DropdownTableComponent,
    InputTextComponent,
    TableReportComponent,
    ButtonModule,
  ],
  providers: [DatePipe],
})
export class FIN73040Component extends BasicQueryPageComponent<FIN73040Data> implements OnInit {
  public readonly queryForm = this.formBuilder.group({
    PCS_RqstNo: [null as string | null],
    Keep_UsrNo: [null as string | null],
    Keep_OrgID: [null as string | null],
    PCS_Date_S: [null as Date | string | null],
    PCS_Date_E: [null as Date | string | null],
    PCS_RqstDate_S: [null as Date | string | null],
    PCS_RqstDate_E: [null as Date | string | null],
    PCS_PayDate_S: [null as Date | string | null],
    PCS_PayDate_E: [null as Date | string | null],

    pageSize: [30, [Validators.required]],
    pageIndex: [1, [Validators.required]],
  });

  paymentRequestNoOptions: FIN73040Option[] = [];
  custodianSuggestions: Option[] = [];
  custodianDeptSuggestions: Option[] = [];
  custodianDialogData: Option[] = [];
  custodianDeptDialogData: Option[] = [];
  allCustodianOptions: Option[] = [];
  allCustodianDeptOptions: Option[] = [];

  custodianDialogColumns: Column[] = [
    { field: 'No', header: '使用者代碼' },
    { field: 'Name', header: '使用者名稱' },
    { field: 'OrgNo', header: '組織代碼' },
    { field: 'OrgName', header: '組織名稱' },
  ];
  custodianDeptDialogColumns: Column[] = [
    { field: 'No', header: '組織代碼' },
    { field: 'Name', header: '組織名稱' },
  ];
  custodianFieldsConfig: FieldsConfig[] = [
    { field: 'Keep_UsrNo', header: '零用金保管人', mainDataField: true },
  ];
  custodianDeptFieldsConfig: FieldsConfig[] = [
    { field: 'Keep_OrgID', header: '保管單位', mainDataField: true },
  ];

  custodianDialogForm = this.formBuilder.group({
    userNo: [null as string | null],
    userName: [null as string | null],
    orgNo: [null as string | null],
    orgName: [null as string | null],
  });
  custodianDeptDialogForm = this.formBuilder.group({
    orgNo: [null as string | null],
    orgName: [null as string | null],
  });

  data: FIN73040Data[] = [];
  totalRecords = 0;
  lastQueryBody: FIN73040Query | null = null;

  /** 後端小計列（RowType === 1），供 table-report subTotalData */
  fin73040SubTotalData: FIN73040Data[] = [];
  /** 後端總計列（RowType === 2），供 table-report footerData */
  fin73040FooterData: FIN73040Data | null = null;

  columns: ReportColumn[] = [
    { field: 'Keep_OrgID', header: '保管人組織代號' },
    { field: 'Org_Name', header: '保管人組織名稱' },
    { field: 'Keep_UsrNo', header: '零用金保管人代碼' },
    { field: 'Keep_UsrName', header: '零用金保管人名稱' },
    { field: 'PCS_Date', header: '申請日期', format: formatDate },
    { field: 'PCS_RqstNo', header: '支出請款單號' },
    { field: 'PCS_RqstDate', header: '請款日期', format: formatDate },
    { field: 'PCS_PayDate', header: '撥補日期', format: formatDate },
    { field: 'PayAmt', header: '撥補金額', format: (v) => formatAmountWithDecimals(v, 2), isSubTotal: true },
    { field: 'UnpaidAmt', header: '應付未付金額', format: (v) => formatAmountWithDecimals(v, 2), isSubTotal: true },
  ];

  constructor(
    public readonly service: FIN73040Service,
    private readonly datePipe: DatePipe,
    private readonly dropdownApi: DropdownApiService,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN73040', '', this.queryForm, this.onSubmit.bind(this));
    this.loadOptions();
  }

  private loadOptions(): void {
    this.service.getPaymentRequestNoOptions().subscribe((res) => {
      this.paymentRequestNoOptions = res;
    });
    this.dropdownApi.queryTblUserOrgid().subscribe((res) => {
      this.allCustodianOptions = (res ?? []).map((item) => this.normalizeCustodianOption(item));
      this.custodianDialogData = [...this.allCustodianOptions];
      this.custodianSuggestions = [...this.allCustodianOptions];
    });
    this.dropdownApi.querySys3100().subscribe((res) => {
      this.allCustodianDeptOptions = (res ?? []).map((item) => this.normalizeOrgOption(item));
      this.custodianDeptDialogData = [...this.allCustodianDeptOptions];
      this.custodianDeptSuggestions = [...this.allCustodianDeptOptions];
    });
  }

  private formatDate(value: Date | string | null): string | undefined {
    if (!value) {
      return undefined;
    }
    const formatted = this.datePipe.transform(value, 'yyyy-MM-dd');
    return formatted ?? undefined;
  }

  private buildQueryPayload(raw: Record<string, unknown>): FIN73040Query {
    return {
      SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo ?? undefined,
      PCS_RqstNo: (raw['PCS_RqstNo'] as string | null) ?? undefined,
      Keep_UsrNo: (raw['Keep_UsrNo'] as string | null) ?? undefined,
      Keep_OrgID: (raw['Keep_OrgID'] as string | null) ?? undefined,
      PCS_Date_S: this.formatDate(raw['PCS_Date_S'] as Date | string | null),
      PCS_Date_E: this.formatDate(raw['PCS_Date_E'] as Date | string | null),
      PCS_RqstDate_S: this.formatDate(raw['PCS_RqstDate_S'] as Date | string | null),
      PCS_RqstDate_E: this.formatDate(raw['PCS_RqstDate_E'] as Date | string | null),
      PCS_PayDate_S: this.formatDate(raw['PCS_PayDate_S'] as Date | string | null),
      PCS_PayDate_E: this.formatDate(raw['PCS_PayDate_E'] as Date | string | null),
      PageSize: (raw['pageSize'] as number | null) ?? 30,
      PageIndex: (raw['pageIndex'] as number | null) ?? 1,
      SortBy: (raw['SortBy'] as SortMeta[] | null) ?? undefined,
    };
  }

  /** RowType：0 明細、1 小計、2 總計；缺省視為明細 */
  private partitionFin73040Rows(rows: FIN73040Data[]): {
    details: FIN73040Data[];
    subTotals: FIN73040Data[];
    grandTotal: FIN73040Data | null;
  } {
    const details: FIN73040Data[] = [];
    const subTotals: FIN73040Data[] = [];
    let grandTotal: FIN73040Data | null = null;
    for (const row of rows) {
      const rt = row.RowType;
      if (rt === 1) {
        subTotals.push(row);
      } else if (rt === 2) {
        grandTotal = row;
      } else {
        details.push(row);
      }
    }
    return { details, subTotals, grandTotal };
  }

  /** 捲動載入多頁時依請款單號合併小計列（新頁同鍵則覆寫） */
  private mergeFin73040SubTotals(existing: FIN73040Data[], incoming: FIN73040Data[]): FIN73040Data[] {
    const map = new Map<string, FIN73040Data>();
    for (const r of existing) {
      const k = String(r.PCS_RqstNo ?? '').trim();
      if (k) {
        map.set(k, r);
      }
    }
    for (const r of incoming) {
      const k = String(r.PCS_RqstNo ?? '').trim();
      if (k) {
        map.set(k, r);
      }
    }
    return [...map.values()];
  }

  private syncFin73040SummaryFromPage(
    part: { details: FIN73040Data[]; subTotals: FIN73040Data[]; grandTotal: FIN73040Data | null },
    pageIndex: number,
  ): void {
    if (pageIndex <= 1) {
      this.fin73040SubTotalData = [...part.subTotals];
      this.fin73040FooterData = part.grandTotal;
    } else {
      this.fin73040SubTotalData = this.mergeFin73040SubTotals(this.fin73040SubTotalData, part.subTotals);
      if (part.grandTotal) {
        this.fin73040FooterData = part.grandTotal;
      }
    }
  }

  private mapDetailsWithDataKey(details: FIN73040Data[]): FIN73040Data[] {
    return details.map((item, idx) => ({
      ...item,
      dataKey: item.dataKey ?? `${item.PCS_RqstNo ?? 'row'}-${item.SeqNo ?? idx}`,
    }));
  }

  queryFIN73040ForReport = (query: FIN73040Query) => {
    const q = query as FIN73040Query & { pageIndex?: number; pageSize?: number };
    const pageIndex = q.PageIndex ?? q.pageIndex ?? 1;
    const pageSize = q.PageSize ?? q.pageSize ?? 30;
    const payload: FIN73040Query = {
      ...query,
      PageIndex: pageIndex,
      PageSize: pageSize,
    };
    return this.service.queryFIN73040(payload).pipe(
      map((res: ApiResponse<FIN73040Data[]>) => {
        const part = this.partitionFin73040Rows(res.Data ?? []);
        this.syncFin73040SummaryFromPage(part, pageIndex);
        return {
          ...res,
          Data: this.mapDetailsWithDataKey(part.details),
        };
      }),
    );
  };

  onCustodianAutoCompleteInputChange(event: Record<string, string>): void {
    const keyword = String(event['label'] ?? '').trim().toLowerCase();
    this.custodianSuggestions = this.allCustodianOptions.filter((item) =>
      this.includesText(`${item['No']} ${item['Name']} ${item['OrgNo']} ${item['OrgName']}`, keyword),
    ).slice(0, 50);
  }

  onCustodianDialogFormValueChanged(value: Record<string, string>): void {
    this.custodianDialogData = this.allCustodianOptions.filter((item) =>
      this.includesText(String(item['No']), value['userNo'])
      && this.includesText(String(item['Name']), value['userName'])
      && this.includesText(String(item['OrgNo']), value['orgNo'])
      && this.includesText(String(item['OrgName']), value['orgName']),
    );
  }

  onCustodianSelected(row: Option): void {
    this.queryForm.controls.Keep_UsrNo.setValue(this.extractText(row, ['value', 'No']) || null);
  }

  onCustodianDeptAutoCompleteInputChange(event: Record<string, string>): void {
    const keyword = String(event['label'] ?? '').trim().toLowerCase();
    this.custodianDeptSuggestions = this.allCustodianDeptOptions.filter((item) =>
      this.includesText(`${item['No']} ${item['Name']}`, keyword),
    ).slice(0, 50);
  }

  onCustodianDeptDialogFormValueChanged(value: Record<string, string>): void {
    this.custodianDeptDialogData = this.allCustodianDeptOptions.filter((item) =>
      this.includesText(String(item['No']), value['orgNo'])
      && this.includesText(String(item['Name']), value['orgName']),
    );
  }

  onCustodianDeptSelected(row: Option): void {
    this.queryForm.controls.Keep_OrgID.setValue(this.extractText(row, ['value', 'No']) || null);
  }

  private normalizeCustodianOption(item: Option): Option {
    const no = this.extractText(item, ['No', 'value', 'user_No']);
    const name = this.extractText(item, ['Name', 'user_Name', 'label']);
    const orgNo = this.extractText(item, ['OrgNo', 'Org_ID', 'ORG_ID', 'OrgId']);
    const orgName = this.extractText(item, ['OrgName', 'Org_Name', 'ORG_NAME']);
    return {
      ...item,
      No: no,
      Name: name,
      OrgNo: orgNo,
      OrgName: orgName,
      value: no,
      label: `${no} - ${name}`,
      templateLabel: `${no} - ${name}${orgNo ? ` (${orgNo}${orgName ? ` ${orgName}` : ''})` : ''}`,
    };
  }

  private normalizeOrgOption(item: Option): Option {
    const no = this.extractText(item, ['No', 'value', 'Org_ID', 'ORG_ID']);
    const name = this.extractText(item, ['Name', 'label', 'Org_Name', 'ORG_NAME']);
    return {
      ...item,
      No: no,
      Name: name,
      value: no,
      label: `${no} - ${name}`,
      templateLabel: `${no} - ${name}`,
    };
  }

  private includesText(source: string, keyword?: string): boolean {
    if (!keyword) {
      return true;
    }
    return source.toLowerCase().includes(keyword.trim().toLowerCase());
  }

  private extractText(option: Option, keys: string[]): string {
    for (const key of keys) {
      const value = option[key];
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        return String(value);
      }
    }
    return '';
  }

  onExportPDF(): void {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先查詢資料後再匯出。');
      return;
    }
    this.fileExportService
      .executeFileExport(this.service.exportPDFFIN73040(this.lastQueryBody), '.pdf')
      .subscribe();
  }

  onExportExcel(): void {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先查詢資料後再匯出。');
      return;
    }
    this.fileExportService
      .executeFileExport(this.service.exportExcelFIN73040(this.lastQueryBody), '.xlsx')
      .subscribe();
  }

  public onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      const body = this.buildQueryPayload(raw);

      this.service.queryFIN73040(body)
        .pipe(finalize(() => this.loading = false))
        .subscribe(res => {
          const part = this.partitionFin73040Rows(res.Data ?? []);
          this.syncFin73040SummaryFromPage(part, 1);
          this.data = this.mapDetailsWithDataKey(part.details);
          this.totalRecords = res.TotalCount ?? 0;
          this.lastQueryBody = body;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }
}
