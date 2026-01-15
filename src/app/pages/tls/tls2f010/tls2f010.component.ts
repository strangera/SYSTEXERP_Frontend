import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatAmount } from '@shared/componentkit/table-report/table-report.model'; // 引入 ReportColumn
import { formatDate, formatYYYYMM } from '@shared/componentkit/table/table.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FileSelectEvent } from 'primeng/fileupload';
import { SelectButtonModule } from 'primeng/selectbutton';
import { finalize, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Tls2f010Service } from '../../../service/api/tls/tls2f010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

@Component({
  selector: 'app-tls2f010',
  templateUrl: './tls2f010.component.html',
  standalone: true,
  imports: [ButtonModule, InputNumberRangeComponent, CalendarComponent, InputTextComponent, SelectButtonModule, TableReportComponent, InputNumberComponent, AsyncPipe, RadiobuttonYNComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, MultiSelectComponent, CheckboxModule, TranslateModule]
})
export class TLS2F010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm: [''], // 結帳年月
    tlt_no: [''],
    PUR_GUIType: [''],
    PUR_GUINO: ['', [Validators.maxLength(10)]],
    PUR_GUIDate_Start: [null],
    PUR_GUIDate_End: [null],
    COMM_MONEY_TYPE: [[]],
    COMM_YM: [null],
    sam_termno: [''],
    DEC_YM: [null],
    ven_uniform: [''],
    PUR_TaxType: [[]],
    CRT_USR_No: [''],
    PUR_GUIPaper: [''],
    CRT_Date_Start: [''],
    CRT_Date_End: [''],
    PUR_GUIDate_From: [yesterday, [Validators.required]],
    PUR_GUIDate_To: [yesterday, [Validators.required]],
    ACP_GUIAmt_From: [0, [Validators.required]],
    ACP_GUIAmt_To: [null, [Validators.required]],
    ACP_GUINet_From: [0, [Validators.required]],
    ACP_GUINet_To: [null, [Validators.required]],
    floor_no: [[]],
    PUR_PRType: [''],
    INV_Type: [''],
    ACP_GUITax_From: [0, [Validators.required]],
    ACP_GUITax_To: [null, [Validators.required]],
    CRT_Date_To: [null, [Validators.required]],
    CRT_Date_From: [yesterday, [Validators.required]],
    COMM_NUM_Start: [yesterday, [Validators.required]],
    COMM_NUM_End: [yesterday, [Validators.required]],
    // 分頁欄位
    pageSize: [30],
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
    { field: 'sam_yyymm', header: '帳款年月', visible: true, format: formatYYYYMM },
    { field: 'MONEY_TYPE_DESC', header: '結帳方式', visible: true },
    // { field: 'col9', header: '帳次', visible: true },
    { field: 'DEC_YM', header: '申報年月', visible: true, format: formatYYYYMM },
    { field: 'ven_uniform', header: '廠商統一編號', visible: true },
    { field: 'TAX_TYPE', header: '課稅別', visible: true },
    { field: 'ACP_GUIAmt', header: '發票總額', visible: true, format: formatAmount, align: 'right' },
    { field: 'ACP_GUINet', header: '未稅金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'ACP_GUITax', header: '稅額', visible: true, format: formatAmount, align: 'right' },
    // { field: 'PUR_GUIPaper', header: '格式', visible: true },
    { field: 'CRT_USR_No', header: '建立者', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate },
  ];
  invoiceFormatOptions = [
    { value: '21', label: '21/進項三聯式、電子計算機統一發票' },
    { value: '27', label: '27/彙總登陸每張稅額五百元以下之進項二聯式收銀機統一發票、載有稅額之其他憑證' },
  ];

  statusOptions = [
    { label: '未拋轉', value: '2' },
    { label: '已拋轉', value: '3' },
    { label: '已退回', value: '4' },
  ];
  taxTypeOptions = getSYS1000Options('PLU_TaxType');
  money_typeOptions = getSYS1000Options('money_type');
  sam_termnoOptions: { value: number, label: string }[] = []; // 期別選項
  totalRecords = 0;
  data: any[] = [];
  lastQueryBody: any = null;
  footerData: any = null;
  ven_noOptions = this.dropdown.queryPos2013({ VEN_Flag: '' }).pipe(
    map(list =>
      (list ?? []).map(item => ({
        label: `${item['No']} - ${item['Name']}`,
        value: item['No']
      }))
    )
  );

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


  constructor(
    private readonly dropdown: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
    private readonly tls2f010Service: Tls2f010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2F010', 'tls/tls2f010cru', this.queryForm, (form) => this.onSubmit(form));
  }


  getCurrentQueryFunction() {
    return this.tls2f010Service.queryTLS2F010.bind(this.tls2f010Service);
  }


  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue() as any;

      const pageSize = Number(raw.pageSize ?? 30);
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
      payload.COMM_YM = this.formatYearMonth(raw.COMM_YM);
      payload.DEC_YM = this.formatYearMonth(raw.DEC_YM);
      payload.ven_uniform = raw.ven_uniform || '';
      payload.PUR_TaxType = Array.isArray(raw.PUR_TaxType) ? raw.PUR_TaxType.join(',') : (raw.PUR_TaxType || '');
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

      this.loading = true;
      this.tls2f010Service.queryTLS2F010(payload)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe(res => {
          const respData = res?.Data ?? [];

          // 支援後端回傳 Data[0].Details + Data[0].Total 的格式
          let rawTotal: any = null;
          if (Array.isArray(respData) && respData.length && respData[0] && respData[0].Details) {
            this.data = respData[0].Details || [];
            rawTotal = respData[0].Total ?? null;
          } else if (Array.isArray(respData)) {
            // 傳統平面陣列
            this.data = respData;
            rawTotal = res?.Total ?? null;
          } else {
            this.data = [];
            rawTotal = res?.Total ?? null;
          }

          // 將後端回傳的總計欄位轉換成 table footer 預期的欄位名稱
          if (rawTotal) {
            const mapped: any = { ...rawTotal };
            // 若後端回傳的 key 為 Total_ACP_GUIAmt 等，轉成 ACP_GUIAmt
            if (rawTotal.Total_ACP_GUIAmt !== undefined) mapped.ACP_GUIAmt = rawTotal.Total_ACP_GUIAmt;
            if (rawTotal.Total_ACP_GUINet !== undefined) mapped.ACP_GUINet = rawTotal.Total_ACP_GUINet;
            if (rawTotal.Total_ACP_GUITax !== undefined) mapped.ACP_GUITax = rawTotal.Total_ACP_GUITax;

            // 保障 fallback（若後端直接回傳 ACP_GUIAmt 等）
            mapped.ACP_GUIAmt = mapped.ACP_GUIAmt ?? rawTotal.ACP_GUIAmt ?? rawTotal.ACP_GUIAmtSum ?? 0;
            mapped.ACP_GUINet = mapped.ACP_GUINet ?? rawTotal.ACP_GUINet ?? rawTotal.ACP_GUINetSum ?? 0;
            mapped.ACP_GUITax = mapped.ACP_GUITax ?? rawTotal.ACP_GUITax ?? rawTotal.ACP_GUITaxSum ?? 0;

            this.footerData = mapped;
          } else {
            this.footerData = null;
          }

          this.totalRecords = res?.TotalCount ?? this.data.length;
          this.lastQueryBody = payload;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
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

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'TLS2F010_匯入範本.xlsx';
        a.click();

        window.URL.revokeObjectURL(url);
      });
  }
  downloadErrorFile(filePath: string): void {
    window.open(`${environment.ApiUrl}/${filePath}`, '_blank');
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
    payload.COMM_YM = this.formatYearMonth(raw.COMM_YM);
    payload.DEC_YM = this.formatYearMonth(raw.DEC_YM);
    payload.ven_uniform = raw.ven_uniform || '';
    payload.PUR_TaxType = Array.isArray(raw.PUR_TaxType) ? raw.PUR_TaxType.join(',') : (raw.PUR_TaxType || '');
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

    return payload;
  }

  onExportExcel(): void {
    if (this.btnLoading2) return;
    const params = this.lastQueryBody ?? this.buildExportPayloadFromForm();
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

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err: any) => {
          const msg = err?.message ?? '匯出失敗';
          this.messageService.errorBubble(msg);
        }
      });
  }

  onExportPDF(): void {
    if (this.btnLoading) return;
    const params = this.lastQueryBody ?? this.buildExportPayloadFromForm();
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

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err: any) => {
          const msg = err?.message ?? '匯出失敗';
          this.messageService.errorBubble(msg);
        }
      });
  }

}
