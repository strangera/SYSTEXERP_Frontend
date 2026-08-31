import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownRangeComponent } from '@shared/components/dropdown-range/dropdown-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, map } from 'rxjs';
import { ExportFIN55060Payload, FIN55060Service, QueryFIN55060Payload, } from 'src/app/service/api/fin/fin55060.service';
import { TableSubheaderComponent } from './table-subheader/table-subheader.component';

interface ApiGroup {
  AccNo4: string;
  AccNo4Name: string;
  _Details: ApiDetail[];
}

interface ApiDetail {
  AccNo: string;
  AccCName: string;
  DetailNo: string | null;
  ORG_ID: string | null;
  Org_Name: string | null;
  ProjectNo: string | null;
  NoteDesc: string | null;
  Debit_Amt: number | null;
  Credit_Amt: number | null;
  Balance: number | null;
}

type TableRow = ApiDetail & {
  AccNo4: string;
  AccNo4Name: string;
};

@Component({
  selector: 'app-fin55060',
  templateUrl: './fin55060.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    DropdownRangeComponent,
    ButtonComponent,
    TranslateModule,
    TableSubheaderComponent,
    AsyncPipe,
    ButtonModule
  ],
})
export class FIN55060Component extends BasicQueryPageComponent<TableRow> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_BDATE: [null, [Validators.required]],
    TXN_EDATE: [null, [Validators.required]],
    OrgId: [null],
    PTAFrom: [null],
    PTATo: [null],
    AccNoFrom: [null, [Validators.required]],
    AccNoTo: [null, [Validators.required]],
    VendorFrom: [null],
    VendorTo: [null],
  });
  data: TableRow[] = [];
  totalRecords = 0;
  PDFBtnLoading = false;
  XLSXBtnLoading = false;
  lastQueryBody: QueryFIN55060Payload | null = null;

  org_idListOptions = this.dropdown.querySys3100();
  ProjectNoListOptions = this.dropdown.queryTALPORDERM_DropDownListShare({ mid: 0, str_no: '10', pod_type: ['1', '2', '8'], pod_status: '1' });
  AccNoListOptions = this.dropdown.queryGls1005().pipe(
    map(options => {
      if (!options) return null;
      return options.filter(opt => opt.value?.toString().length === 4);
    })
  );
  DetailNoListOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });

  constructor(
    private readonly fin55060Service: FIN55060Service,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }

  override ngOnInit(): void {
    this.initializePage('FIN55060', 'fin/fin55060cru', this.queryForm, (form) => this.onSubmit(form));
  }

  private flattenGroupsToRows(groups: ApiGroup[] | null | undefined): TableRow[] {
    if (!Array.isArray(groups)) return [];
    const rows: TableRow[] = [];

    // 遍歷每一個會計科目群組
    for (const g of groups) {
      const details = Array.isArray(g?._Details) ? g._Details : [];

      /**
       * 關鍵邏輯：過濾沒有交易的群組
       * 如果 details 只有 2 筆（期初與總計），代表中間沒有任何交易明細。
       * 如果你希望「即使沒交易也要顯示期初」則不需此判斷；
       * 但若要「完全隱藏沒資料的群組」，請加上這個 if。
       */
      if (details.length <= 2) {
        // 這裡判斷：如果只有兩筆，且這兩筆分別是期初與總計，則跳過此群組
        // 或是更嚴謹一點：判斷中間是否有真正的交易
        continue;
      }

      details.forEach((d, index) => {
        const isFirst = index === 0;
        const isLast = index === details.length - 1;

        rows.push({
          ...d,
          AccNo4: g.AccNo4,
          AccNo4Name: g.AccNo4Name,

          // 期初字眼
          AccNo: isFirst ? '【期初餘額】' : (isLast ? '' : d.AccNo),
          // 總計字眼（科目代號/名稱清空）
          AccCName: isLast ? '' : d.AccCName,
          // 總計顯示在活動代碼
          ProjectNo: isLast ? '【總計】' : d.ProjectNo,

          // 其他欄位在總計時清空
          DetailNo: isLast ? '' : d.DetailNo,
          ORG_ID: isLast ? '' : d.ORG_ID,
          Org_Name: isLast ? '' : d.Org_Name,

          NoteDesc: isFirst ? '【期初餘額】' : (isLast ? '【總計】' : ''),
        });
      });
    }

    return rows;
  }

  // ========= 組查詢 payload =========
  private buildQueryBody(input?: any): QueryFIN55060Payload | null {
    const raw = input ?? this.queryForm.getRawValue();

    const from = this.datePipe.transform(raw?.TXN_BDATE, 'yyyy-MM-dd')
    const to = this.datePipe.transform(raw?.TXN_EDATE, 'yyyy-MM-dd');
    if (!from || !to) return null;

    const body: QueryFIN55060Payload = {
      AccNoFrom: raw?.AccNoFrom || '',
      AccNoTo: raw?.AccNoTo || '',
      DateFrom: from,
      DateTo: to,
      OrgId: raw?.OrgId || '',
      Notes: '',
      VendorFrom: raw?.VendorFrom || '',
      VendorTo: raw?.VendorTo || '',
      PTAFrom: raw?.PTAFrom || '',
      PTATo: raw?.PTATo || '',
      VouType: '',
      VouStatus: '',
      TargetNo: '',
    };

    return body;
  }

  // ========= 查詢 =========
  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const payload = this.buildQueryBody();
      if (!payload) {
        this.loading = false;
        return;
      }
      this.fin55060Service.queryFIN55060(payload).pipe(untilDestroyed(this), finalize(() => (this.loading = false))).subscribe((res: any) => {
        const groups: ApiGroup[] = res?.Data ?? [];
        const flat = this.flattenGroupsToRows(groups);
        const total: number = res?.TotalCount ?? flat.length;
        this.data = flat;
        this.totalRecords = total;
        this.lastQueryBody = { ...payload };
      });
    });
  }
  // ========= 匯出（不含分頁/排序） =========
  private buildExportBody(): ExportFIN55060Payload | null {
    const rawForm = this.queryForm.getRawValue();
    const from = this.datePipe.transform(rawForm?.TXN_BDATE, 'yyyy-MM-dd');
    const to = this.datePipe.transform(rawForm?.TXN_EDATE, 'yyyy-MM-dd');
    if (!from || !to) return null;
    const payload: ExportFIN55060Payload = {
      AccNoFrom: rawForm?.AccNoFrom || '',
      AccNoTo: rawForm?.AccNoTo || '',
      DateFrom: from,
      DateTo: to,
      OrgId: rawForm?.OrgId || '',
      Notes: '',
      VendorFrom: rawForm?.VendorFrom || '',
      VendorTo: rawForm?.VendorTo || '',
      PTAFrom: rawForm?.PTAFrom || '',
      PTATo: rawForm?.PTATo || '',
      VouType: '',
      VouStatus: '',
      TargetNo: '',
    };
    return payload;
  }

  onExportPDF() {
    if ((this.data?.length ?? 0) === 0) return;
    const payload = this.buildExportBody();
    if (!payload) return;
    const export$ = this.fin55060Service.exportFIN55060PDF(payload);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.PDFBtnLoading = isLoading).subscribe();
  }
  override onDetail(row: TableRow) {
    if (!row?.AccNo4) return;
    this.navigateWithState(CRUDStatus.Read, row, this.queryForm.getRawValue());
  }
  XLSXSingleSheetBtnLoading = false; // <-- 新增此行

  // 2. 修改/新增 Excel 匯出方法
  onExportXLSX() {
    if ((this.data?.length ?? 0) === 0) return;
    const payload = this.buildExportBody();
    if (!payload) return;

    // 傳送 IsExportSingle: 'N'
    const fullPayload: ExportFIN55060Payload = { ...payload, IsExportSingle: 'N' };
    const export$ = this.fin55060Service.exportFIN55060Excel(fullPayload);
    this.fileExportService
      .executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => (this.XLSXBtnLoading = isLoading))
      .subscribe();
  }

  /** 匯出 Excel（不分頁，所有會科往下排列在同一頁） */
  onExportXLSXSingleSheet() {
    if ((this.data?.length ?? 0) === 0) return;
    const payload = this.buildExportBody();
    if (!payload) return;

    // 傳送 IsExportSingle: 'Y'
    const fullPayload: ExportFIN55060Payload = { ...payload, IsExportSingle: 'Y' };
    const export$ = this.fin55060Service.exportFIN55060Excel(fullPayload);
    this.fileExportService
      .executeFileExport(
        export$.pipe(untilDestroyed(this)),
        '.xlsx',
        (isLoading) => (this.XLSXSingleSheetBtnLoading = isLoading)
      )
      .subscribe();
  }
}
