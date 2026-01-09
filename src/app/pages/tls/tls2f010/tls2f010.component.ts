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
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model'; // 引入 ReportColumn
import { formatDate, formatYYYYMM } from '@shared/componentkit/table/table.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { FileSelectEvent } from 'primeng/fileupload';
import { SelectButtonModule } from 'primeng/selectbutton';
import { finalize } from 'rxjs';
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
  imports: [InputNumberRangeComponent, CalendarComponent, InputTextComponent, SelectButtonModule, TableReportComponent, InputNumberComponent, AsyncPipe, RadiobuttonYNComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, MultiSelectComponent, CheckboxModule, TranslateModule]
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

  columns: ReportColumn[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'GUIType', header: '單據種類', visible: true },
    { field: 'PUR_GUINO', header: '發票/收據號碼', visible: true },
    { field: 'PUR_GUIDate', header: '單據日期', visible: true, format: formatDate },
    { field: 'COMM_YM', header: '請款付款年月', visible: true, format: formatYYYYMM },
    { field: 'sam_yyymm', header: '帳款年月', visible: true, format: formatYYYYMM },
    { field: 'COMM_MONEY_TYPE', header: '結帳方式', visible: true, format: (v: any) => this.formatMoneyType(v) },
    // { field: 'col9', header: '帳次', visible: true },
    { field: 'DEC_YM', header: '申報年月', visible: true, format: formatYYYYMM },
    { field: 'ven_uniform', header: '廠商統一編號', visible: true },
    { field: 'TAX_TYPE', header: '課稅別', visible: true },
  ];
  invoiceFormatOptions: any[] = [
    { value: 1, label: '21/進項三聯式、電子計算機統一發票' },
    { value: 5, label: '27/彙總登陸每張稅額五百元以下之盡項二聯式收銀雞統一發票、載有稅額之其他憑證' },
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
  ven_noOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  tlt_noOptions = this.dropdown.queryTltTalent();
  tlt_floorOptions = this.dropdown.querySys3900();
  invoiceTypeOptions = getSYS1000Options('invoice_type');

  private formatMoneyType(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    const code = String(value);

    const option = this.money_typeOptions?.find(o => String(o.value) === code);
    if (option) {
      return option.label;
    }
    switch (code) {
      case '10':
        return '十日結';
      case '15':
        return '半月結';
      case '30':
        return '月結';
      default:
        return code;
    }
  }

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
    this.initializePage('TLS2F010', '/tls/tls2f010cru', this.queryForm, (form) => this.onSubmit(form));
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
      payload.floor_no = Array.isArray(raw.floor_no) ? raw.floor_no.join(',') : (raw.floor_no || '');

      this.loading = true;
      this.tls2f010Service.queryTLS2F010(payload)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe(res => {
          this.data = res?.Data || [];
          this.totalRecords = res?.TotalCount ?? this.data.length;
          this.lastQueryBody = payload;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }
  downloadTemplate() {
    // const export$ = this.tls2d010Service.downloadTLS2D010Template();
    // this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.btnLoading = isLoading);
  }
  onImportExcel(event: FileSelectEvent) {
    const file = event.files[0];
    const formData = new FormData();
    formData.append('file', file);

    // this.tls2d010Service.uploadExcel(formData).pipe(untilDestroyed(this)).subscribe({
    //   next: (res) => {
    //     const data = res?.Data;

    //     if (data) {
    //       if (data.ErrorFilePath) {
    //         // 有錯誤檔：顯示錯誤提示
    //         this.messageService.errorBubble(`部分資料匯入失敗，請下載錯誤檔檢查`);
    //         // 自動下載錯誤檔
    //         this.downloadErrorFile(data.ErrorFilePath);
    //       } else {
    //         // 沒有錯誤檔：顯示成功筆數
    //         this.messageService.infoBubble(`匯入成功，筆數：${data.SuccessCount}`);
    //       }
    //     }
    //   },
    // });
  }

  /** 自動下載錯誤檔 */
  downloadErrorFile(filePath: string) {
    window.open(`${environment.ApiUrl}/${filePath}`, '_blank');
  }
}
