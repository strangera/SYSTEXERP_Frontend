import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { YearMonthComponent } from '@pages/fin/fin11020/query-year-month.component';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn, formatAmount } from '@shared/components/table-report/table-report.model'; // 引入 ReportColumn
import { formatDate, formatYYYYMM } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FileSelectEvent } from 'primeng/fileupload';
import { SelectButtonModule } from 'primeng/selectbutton';
import { finalize, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Tls2f010Service } from '../../../service/api/tls/tls2f010.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';

@Component({
  selector: 'app-tls2f010',
  templateUrl: './tls2f010.component.html',
  standalone: true,
  imports: [NgIf, ButtonModule, InputNumberRangeComponent, CalendarComponent, InputTextComponent, SelectButtonModule, TableReportComponent, AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, MultiSelectComponent, CheckboxModule, TranslateModule, YearMonthComponent]
})
export class TLS2F010Component extends BasicQueryPageComponent<any> implements OnInit {
  // 完整的期別選項映射（參考 tls2e020 的寫法）
  private readonly SAM_TERMNO_MAP = {
    '10': [1, 2, 3],
    '15': [1, 2],
    '30': [1]
  };
  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm: [null], // 結帳年月
    tlt_no: [null],
    PUR_GUIType: [null],
    PUR_GUINO: [null],
    PUR_GUIDate_Start: [null],
    PUR_GUIDate_End: [null],
    COMM_MONEY_TYPE: [null],
    COMM_YM: [null],
    sam_termno: [null],
    DEC_YM: [null],
    ven_uniform: [null],
    PUR_TaxType: [[]],
    CRT_USR_No: [null],
    PUR_GUIPaper: [null],
    CRT_Date_Start: [null],
    CRT_Date_End: [null],
    PUR_GUIDate_From: [null],
    PUR_GUIDate_To: [null],
    ACP_GUIAmt_From: [null],
    ACP_GUIAmt_To: [null],
    ACP_GUINet_From: [null],
    ACP_GUINet_To: [null],
    floor_no: [[]],
    PUR_PRType: [null],
    INV_Type: [null],
    ACP_GUITax_From: [null],
    ACP_GUITax_To: [null],
    Status: [[]],
    CRT_Date_To: [null],
    CRT_Date_From: [null],
    // 分頁欄位
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'tlt_no', order: 1 }]],

  });
  excelLoading = false;
  btnLoading = false; // PDF
  btnLoading2 = false; // Excel
  columns: ReportColumn[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'GUIType', header: '單據種類', visible: true },
    { field: 'PUR_GUINO', header: '發票/收據號碼', visible: true },
    { field: 'PUR_GUIDate', header: '單據日期', visible: true, format: formatDate },
    { field: 'COMM_YM', header: '請款付款年月', visible: true, format: formatYYYYMM },
    { field: 'sam_yyymm', header: '帳款年月', visible: true },
    { field: 'MONEY_TYPE_DESC', header: '結帳方式', visible: true },
    { field: 'sam_termno', header: '帳次', visible: true },
    { field: 'DEC_YM', header: '申報年月', visible: true, format: formatYYYYMM },
    { field: 'ven_uniform', header: '廠商統一編號', visible: true },
    { field: 'TAX_TYPE', header: '課稅別', visible: true },
    { field: 'ACP_GUIAmt', header: '發票總額', visible: true, format: formatAmount, align: 'right' },
    { field: 'ACP_GUINet', header: '未稅金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'ACP_GUITax', header: '稅額', visible: true, format: formatAmount, align: 'right' },
    { field: 'PUR_GUIPaper', header: '格式', visible: true },
    { field: 'StatusName', header: '狀況', visible: true },
    { field: 'CRT_USR_No', header: '建立者', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate },
  ];
  invoiceFormatOptions = [
    { value: '21', label: '21-進項三聯式、電子計算機統一發票' },
    { value: '22', label: '22-進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    { value: '25', label: '25-進項三聯式收銀機統一發票及一般稅額計算之電子發票' },
  ];

  statusOptions = [
    { label: '未結帳', value: 'N' },
    { label: '已結帳', value: 'Y' },
  ];
  taxTypeOptions = getSYS1000Options('PLU_TaxType');
  money_typeOptions = getSYS1000Options('money_type');
  sam_termnoOptions: { value: number, label: string }[] = []; // 期別選項
  // 統一的 UI 提示文字
  samTermnoHint = '請先選擇「結帳方式」';

  onSamTermnoOverlayClick(evt?: MouseEvent): void {
    if (!this.sam_termnoOptions || this.sam_termnoOptions.length === 0) {
      this.messageService.warnBubble(this.samTermnoHint);
    }
    try { evt?.stopPropagation(); evt?.preventDefault(); } catch (e) { /* ignore */ }
  }
  totalRecords = 0;
  data: any[] = [];
  selectedItems: any[] = [];
  lastQueryBody: any = null;
  footerData: any = null;
  // 已結帳(Status = 'Y')資料不可勾選/刪除/編輯
  isRowSelectable(row: any): boolean { return row?.Status !== 'Y' };
  deleteDisabled = (row: any): boolean => row?.Status === 'Y';
  editDisabled = (row: any): boolean => row?.Status === 'Y';
  venUniformOptions = this.dropdown.queryPos2013VenUniformDistinct();

  tlt_noOptions = this.dropdown.queryTltTalent();
  tlt_floorOptions = this.dropdown.querySys3900();
  invoiceTypeOptions = getSYS1000Options('invoice_type');

  private formatYearMonth(value: any): string {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) {
      const s = String(value);
      if (s.length === 6 && !isNaN(+s)) return s;
      return '';
    }
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${yyyy}${mm}`;
  }

  private formatDateOnly(value: any): string {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Robust normalizer for YYYYMM payloads: accept Date, YYYYMM, or YYYYMMDD (trim to first 6 digits)
  private normalizeYearMonth(value: any): string {
    let ym = this.formatYearMonth(value);
    if (!ym && value !== undefined && value !== null) {
      const s = String(value).trim();
      const m = s.match(/^(\d{6})/);
      ym = m ? m[1] : '';
    }
    return ym;
  }

  // Normalize payload: convert empty strings and empty arrays to null recursively
  private normalizePayload<T = any>(obj: T): T {
    const _norm = (v: any): any => {
      if (v === '') return null;
      if (v === undefined) return null;
      if (v === null) return null;
      if (Array.isArray(v)) {
        if (v.length === 0) return null;
        return v.map(_norm);
      }
      if (typeof v === 'object') {
        const out: any = Array.isArray(v) ? [] : {};
        for (const k of Object.keys(v)) {
          out[k] = _norm((v as any)[k]);
        }
        return out;
      }
      return v;
    };

    return _norm(obj) as T;
  }


  constructor(
    private readonly dropdown: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
    public readonly tls2f010Service: Tls2f010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2F010', 'tls/tls2f010cru', this.queryForm, (form) => this.onSubmit(form));
    // 根據 COMM_MONEY_TYPE (多選) 的第一個值，自動產生 sam_termnoOptions
    const moneyCtrl = this.queryForm.controls.COMM_MONEY_TYPE as any;
    moneyCtrl.valueChanges.pipe(untilDestroyed(this)).subscribe((val: any) => {
      let moneyType: string | null = null;
      if (Array.isArray(val) && val.length) moneyType = String(val[0]);
      else if (val != null && val !== '') moneyType = String(val);
      this.updateSamTermnoOptions(moneyType);
      this.queryForm.controls.sam_termno.setValue(null);
    });
    // 初始載入時也更新一次，支援單選字串或多選陣列
    const initialVal = moneyCtrl.value as any;
    let initialMoney: string | null = null;
    if (Array.isArray(initialVal) && initialVal.length) initialMoney = String(initialVal[0]);
    else if (initialVal != null && initialVal !== '') initialMoney = String(initialVal);
    if (initialMoney) this.updateSamTermnoOptions(initialMoney);
  }

  private updateSamTermnoOptions(moneyType: string | null): void {
    if (moneyType && this.SAM_TERMNO_MAP[moneyType as keyof typeof this.SAM_TERMNO_MAP]) {
      const termNumbers = this.SAM_TERMNO_MAP[moneyType as keyof typeof this.SAM_TERMNO_MAP];
      this.sam_termnoOptions = termNumbers.map(num => ({ label: `${num}`, value: num }));
    } else {
      this.sam_termnoOptions = [];
    }
  }

  getCurrentQueryFunction() {
    // 返回一個 wrapper，將後端回應標準化為 TableReport 預期的 { Data: rows[], TotalCount } 結構
    return (body: any) => this.tls2f010Service.queryTLS2F010(body).pipe(map((res: any) => {
      const respData = res?.Data ?? [];
      let rows: any[] = [];
      let totalCount: number | null = res?.TotalCount ?? null;

      if (Array.isArray(respData) && respData.length && respData[0] && respData[0].Details) {
        rows = respData[0].Details || [];
        // 嘗試從內層 Total 擷取總筆數（若後端提供）
        totalCount = totalCount ?? (respData[0].Total?.TotalCount ?? null);
      } else if (Array.isArray(respData)) {
        rows = respData;
        totalCount = totalCount ?? (res?.Total?.TotalCount ?? res?.TotalCount ?? rows.length);
      } else {
        rows = [];
        totalCount = totalCount ?? 0;
      }
      const transformedRows = this.transformResponseData(rows);
      return { Data: transformedRows, TotalCount: totalCount };
    }));
  }
  private transformResponseData(rows: any[]): any[] {
    return rows.map(item => {
      if (item.sam_yyymm) {
        const s = String(item.sam_yyymm).trim();
        if (s.length === 6 && !isNaN(Number(s))) {
          item.sam_yyymm = `${s.substring(0, 4)}/${s.substring(4, 6)}`;
        }
      }
      return item;
    });
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue() as any;
      // Page-local normalization: compute normalized DEC_YM (YYYYMM) for payload and query-state
      const decYm = this.normalizeYearMonth(raw?.DEC_YM);
      const payload: any = {
        pageIndex: 1,
        pageSize: 1000,
        SortBy: Array.isArray(raw.SortBy) && raw.SortBy.length ? raw.SortBy : [{ field: 'tlt_no', order: 1 }],
      };

      payload.sam_yyymm = this.formatYearMonth(raw.sam_yyymm);
      payload.tlt_no = raw.tlt_no || '';
      payload.PUR_GUIType = raw.PUR_GUIType || '';
      payload.PUR_GUINO = raw.PUR_GUINO || '';
      const purFrom = raw.PUR_GUIDate_From || raw.PUR_GUIDate_Start || '';
      const purTo = raw.PUR_GUIDate_To || raw.PUR_GUIDate_End || '';
      payload.PUR_GUIDate_From = this.formatDateOnly(purFrom);
      payload.PUR_GUIDate_To = this.formatDateOnly(purTo);
      payload.COMM_MONEY_TYPE = Array.isArray(raw.COMM_MONEY_TYPE) ? raw.COMM_MONEY_TYPE.join(',') : (raw.COMM_MONEY_TYPE || '');
      payload.sam_termno = raw.sam_termno ?? null;
      payload.COMM_YM = this.formatYearMonth(raw.COMM_YM);
      // Ensure DEC_YM is normalized to YYYYMM for payload.
      payload.DEC_YM = decYm;
      payload.ven_uniform = raw.ven_uniform || '';
      payload.PUR_TaxType = raw.PUR_TaxType || [];
      payload.ACP_GUIAmt_From = raw.ACP_GUIAmt_From ?? null;
      payload.ACP_GUIAmt_To = raw.ACP_GUIAmt_To ?? null;
      payload.ACP_GUINet_From = raw.ACP_GUINet_From ?? null;
      payload.ACP_GUINet_To = raw.ACP_GUINet_To ?? null;
      payload.ACP_GUITax_From = raw.ACP_GUITax_From ?? null;
      payload.ACP_GUITax_To = raw.ACP_GUITax_To ?? null;
      payload.PUR_GUIPaper = raw.PUR_GUIPaper || '';
      payload.CRT_USR_No = raw.CRT_USR_No || '';
      payload.CRT_Date_From = this.formatDateOnly(raw.CRT_Date_From);
      payload.CRT_Date_To = this.formatDateOnly(raw.CRT_Date_To);
      payload.floor_no = Array.isArray(raw.floor_no)
        ? raw.floor_no
        : (raw.floor_no ? [raw.floor_no] : []);
      payload.Status = raw.Status || [];


      this.loading = true;
      const body = this.normalizePayload(payload);
      this.tls2f010Service.queryTLS2F010(body)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe(res => {
          const respData = res?.Data ?? [];
          let rawRows: any[] = []; // 改名避免混淆
          // 支援後端回傳 Data[0].Details + Data[0].Total 的格式
          let rawTotal: any = null;
          if (Array.isArray(respData) && respData.length && respData[0] && respData[0].Details) {
            rawRows = respData[0].Details || [];
            rawTotal = respData[0].Total ?? null;
          } else if (Array.isArray(respData)) {
            rawRows = respData;
            rawTotal = res?.Total ?? null;
          }

          this.data = this.transformResponseData(rawRows);

          // 3. 處理 Total 邏輯 (保持不變)
          if (rawTotal) {
            const mapped: any = { ...rawTotal };
            if (rawTotal.Total_ACP_GUIAmt !== undefined) mapped.ACP_GUIAmt = rawTotal.Total_ACP_GUIAmt;
            if (rawTotal.Total_ACP_GUINet !== undefined) mapped.ACP_GUINet = rawTotal.Total_ACP_GUINet;
            if (rawTotal.Total_ACP_GUITax !== undefined) mapped.ACP_GUITax = rawTotal.Total_ACP_GUITax;

            mapped.ACP_GUIAmt = mapped.ACP_GUIAmt ?? rawTotal.ACP_GUIAmt ?? 0;
            mapped.ACP_GUINet = mapped.ACP_GUINet ?? rawTotal.ACP_GUINet ?? 0;
            mapped.ACP_GUITax = mapped.ACP_GUITax ?? rawTotal.ACP_GUITax ?? 0;
            this.footerData = mapped;
          } else {
            this.footerData = null;
          }

          this.totalRecords = res?.TotalCount ?? this.data.length;
          this.lastQueryBody = body;
          // 儲存給 queryState 時，使用已正規化的 DEC_YM（6位），避免下次還原時出現 8 位
          try {
            const rawForState = { ...frm.getRawValue(), DEC_YM: decYm || null };
            this.queryStateService.setQueryState(this.ProgNo, rawForState);
          } catch (e) {
            this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
          }
        });
    });
  }

  override onEdit(row: any): void {
    super.onEdit(row, this.queryForm.getRawValue());
  }

  override onDetail(row: any): void {
    super.onDetail(row, this.queryForm.getRawValue());
  }

  onDelete(selectedItems: any[]): void {
    if (!selectedItems || selectedItems.length === 0) {
      this.messageService.errorBubble('請先選擇要刪除的資料');
      return;
    }

    const idList = selectedItems
      .map(item => item.id)
      .filter(id => id != null);

    if (idList.length === 0) {
      this.messageService.errorBubble('找不到可刪除的資料');
      return;
    }

    this.messageService.confirm({
      message: `確定要刪除選取的 ${idList.length} 筆資料嗎？`,
      accept: () => {
        this.loading = true;

        this.tls2f010Service
          .deleteTLS2F010({ idList })
          .pipe(finalize(() => (this.loading = false)))
          .subscribe(() => {
            this.messageService.successBubble('刪除成功');
            this.onSubmit(this.queryForm);
          });
      }
    });
  }
  onImportExcel(event: FileSelectEvent): void {
    if (this.excelLoading) {
      return;
    }

    const file = event.files?.[0];
    if (!file) return;

    this.excelLoading = true;

    const formData = new FormData();
    formData.append('file', file);

    this.tls2f010Service
      .uploadTLS2F010(formData)
      .pipe(finalize(() => (this.excelLoading = false)))
      .subscribe({
        next: (res) => {
          const data = res?.Data;

          if (!data) {
            this.messageService.errorBubble('匯入失敗，未取得回傳資料');
            return;
          }

          if (data.ErrorFilePath) {
            this.messageService.errorBubble('部分資料匯入失敗，請下載錯誤檔檢查');
            this.downloadErrorFile(data.ErrorFilePath);
            return;
          }

          if (data.Success === false) {
            const backendMessage = res?.Message || '';
            const errorDetail =
              Array.isArray(data.Errors) && data.Errors.length
                ? data.Errors.join('\n')
                : '';
            const finalMessage =
              backendMessage || errorDetail || '匯入失敗，請聯絡系統管理員';

            this.messageService.errorBubble(finalMessage);
            return;
          }

          this.messageService.infoBubble(`匯入成功，筆數：${data.SuccessCount ?? 0}`);
          this.onSubmit(this.queryForm);
        },
      });
  }

  downloadTemplate(): void {
    this.excelLoading = true;

    this.tls2f010Service
      .downloadTLS2F010Template()
      .pipe(finalize(() => (this.excelLoading = false)))
      .subscribe(res => {
        const blob = res.body;
        if (!blob) return;

        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'TLS2F010_匯入範本.xlsx';
        a.click();

        globalThis.URL.revokeObjectURL(url);
      });
  }
  downloadErrorFile(filePath: string): void {
    globalThis.open(`${environment.ApiUrl}/${filePath}`, '_blank');
  }

  private buildExportPayloadFromForm(): any {
    const raw = this.queryForm.getRawValue() as any;
    const pageSize = Number(raw.pageSize ?? 0);
    const pageIndex = Number(raw.pageIndex ?? 1);

    const payload: any = {
      PageSize: pageSize,
      PageIndex: pageIndex,
      Offset: (pageIndex - 1) * pageSize,
      SortBy: Array.isArray(raw.SortBy) && raw.SortBy.length ? raw.SortBy : [{ field: 'tlt_no', order: 1 }],
    };

    if (!payload.OrderBy && payload.SortBy[0]?.field) {
      payload.OrderBy = payload.SortBy[0].field;
    }

    payload.sam_yyymm = this.formatYearMonth(raw.sam_yyymm);
    payload.tlt_no = raw.tlt_no || '';
    payload.PUR_GUIType = raw.PUR_GUIType || '';
    payload.PUR_GUINO = raw.PUR_GUINO || '';
    const purFrom = raw.PUR_GUIDate_From || raw.PUR_GUIDate_Start || '';
    const purTo = raw.PUR_GUIDate_To || raw.PUR_GUIDate_End || '';
    payload.PUR_GUIDate_From = this.formatDateOnly(purFrom);
    payload.PUR_GUIDate_To = this.formatDateOnly(purTo);
    payload.COMM_MONEY_TYPE = Array.isArray(raw.COMM_MONEY_TYPE) ? raw.COMM_MONEY_TYPE.join(',') : (raw.COMM_MONEY_TYPE || '');
    payload.sam_termno = raw.sam_termno ?? null;
    payload.COMM_YM = this.formatYearMonth(raw.COMM_YM);
    payload.DEC_YM = this.normalizeYearMonth(raw.DEC_YM);
    payload.ven_uniform = raw.ven_uniform || '';
    payload.PUR_TaxType = raw.PUR_TaxType || [];
    payload.ACP_GUIAmt_From = raw.ACP_GUIAmt_From ?? null;
    payload.ACP_GUIAmt_To = raw.ACP_GUIAmt_To ?? null;
    payload.ACP_GUINet_From = raw.ACP_GUINet_From ?? null;
    payload.ACP_GUINet_To = raw.ACP_GUINet_To ?? null;
    payload.ACP_GUITax_From = raw.ACP_GUITax_From ?? null;
    payload.ACP_GUITax_To = raw.ACP_GUITax_To ?? null;
    payload.PUR_GUIPaper = raw.PUR_GUIPaper || '';
    payload.CRT_USR_No = raw.CRT_USR_No || '';
    payload.CRT_Date_From = this.formatDateOnly(raw.CRT_Date_From);
    payload.CRT_Date_To = this.formatDateOnly(raw.CRT_Date_To);
    payload.floor_no = Array.isArray(raw.floor_no)
      ? raw.floor_no
      : (raw.floor_no ? [raw.floor_no] : []);
    payload.Status = raw.Status || [];

    return payload;
  }

  onExportExcel(): void {
    if (this.btnLoading2) return;
    const params = this.normalizePayload(this.lastQueryBody ?? this.buildExportPayloadFromForm());
    this.btnLoading2 = true;

    this.tls2f010Service.exportTLS2F010(params)
      .pipe(finalize(() => (this.btnLoading2 = false)))
      .subscribe({
        next: (res) => {
          const blob = res?.body;
          if (!blob) {
            this.messageService.errorBubble('檔案產生失敗');
            return;
          }
          const cd = res.headers?.get?.('content-disposition') ?? '';
          let filename = 'TLS2F010.xlsx';
          const m = /filename\*=UTF-8''(.+)$/.exec(cd) || /filename="?([^";]+)"?/.exec(cd);
          if (m && m[1]) filename = decodeURIComponent(m[1]);

          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          globalThis.URL.revokeObjectURL(url);
        },

      });
  }

  onExportPDF(): void {
    if (this.btnLoading) return;
    const params = this.normalizePayload(this.lastQueryBody ?? this.buildExportPayloadFromForm());
    this.btnLoading = true;

    this.tls2f010Service.exportTLS2F010PDF(params)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (res) => {
          const blob = res?.body;
          if (!blob) {
            this.messageService.errorBubble('檔案產生失敗');
            return;
          }
          const cd = res.headers?.get?.('content-disposition') ?? '';
          let filename = 'TLS2F010.pdf';
          const m = /filename\*=UTF-8''(.+)$/.exec(cd) || /filename="?([^";]+)"?/.exec(cd);
          if (m && m[1]) filename = decodeURIComponent(m[1]);

          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          globalThis.URL.revokeObjectURL(url);
        },

      });
  }

}
