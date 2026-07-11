import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

// Service imports
import { formatAmount, formatDate, formatYYYYMM } from '@shared/componentkit/table/table.model';
import { FIN13030Data, FIN13030GetZeroTaxGUIRequest, FIN13030QueryRequest, FIN13030Service } from '../../../service/api/fin/fin13030.service';
import { FIN13050Service } from '../../../service/api/fin/fin13050.service';
import { ValidationService } from '../../../shared/service/validation.service';

// Component imports
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

// PrimeNG imports
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';

// Model imports
import { untilDestroyed } from '@ngneat/until-destroy';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

// 本期發票月
const today = new Date();
let invoiceYear = today.getFullYear();
let invoiceMonth = today.getMonth() + 1; // JS 月份 0~11

// 如果不是偶數月，就加 1 個月
if (invoiceMonth % 2 !== 0) {
  invoiceMonth += 1;
  if (invoiceMonth > 12) {
    invoiceMonth = 1;
    invoiceYear += 1;
  }
}
// 將年月轉成 YYYYMM 字串
export const invoiceDate = invoiceYear.toString() + invoiceMonth.toString().padStart(2, '0');

@Component({
  selector: 'app-fin13030',
  templateUrl: './fin13030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextRangeComponent,
    CalendarRangeComponent,
    InputTextComponent,
    InputNumberRangeComponent,
    TableComponent,
    TranslateModule,
    MultiSelectComponent,
    YearMonthComponent,
    ButtonModule
  ]
})
export class FIN13030Component extends BasicQueryPageComponent<FIN13030Data> implements OnInit {
  queryForm = this.formBuilder.group({
    INV_GUINo_B: ['', [Validators.maxLength(10)]], // 發票號碼_起
    INV_GUINo_E: ['', [Validators.maxLength(10)]], // 發票號碼_迄
    INV_GUIDate_B: [null], // 發票日期_起
    INV_GUIDate_E: [null], // 發票日期_迄
    INV_YM_B: [new Date()], // 資料所屬年月_起
    INV_YM_E: [new Date()], // 資料所屬年月_迄
    INV_DeclareYM_B: [invoiceDate, [Validators.required]], // 申報年月_起
    INV_DeclareYM_E: [invoiceDate, [Validators.required]], // 申報年月_迄
    INV_Uniform: ['', [Validators.maxLength(10)]], // 買受人統一編號
    GoodsOrServicesName: ['', [Validators.maxLength(20)]], // 貨物或勞務名稱
    GoodsQtyStart: [null, [this.validationService.numberValidator]], // 貨物或勞務數量_起
    GoodsQtyEnd: [null, [this.validationService.numberValidator]], // 貨物或勞務數量_迄
    ExportMethod: [null], // 外銷方式 (多選)
    INV_DocName: ['', [Validators.maxLength(20)]], // 證明文件名稱
    INV_DocNo: ['', [Validators.maxLength(10)]], // 證明文件號碼
    NonCustomsExportAmt_B: [null, [this.validationService.numberValidator]], // 非經海關出口金額_起
    NonCustomsExportAmt_E: [null, [this.validationService.numberValidator]], // 非經海關出口金額_迄
    INV_ExportType: [null], // 出口報單類別 (多選)
    INV_ExportNo: ['', [Validators.maxLength(10)]], // 出口報單號碼
    CustomsExportAmt_B: [null, [this.validationService.numberValidator]], // 經海關出口金額_起
    CustomsExportAmt_E: [null, [this.validationService.numberValidator]], // 經海關出口金額_迄
    ExportDate_B: [null], // 輸出或結匯日期_起
    ExportDate_E: [null], // 輸出或結匯日期_迄
    INV_Remark: ['', [Validators.maxLength(100)]], // 備註
    ...createPaginationConfig([{ field: 'ID', order: -1 }])
  });

  totalRecords = 0;
  data: FIN13030Data[] = [];
  editDisabledFn = (row: any) => !row?.CanEdit;
  isRowSelectable = (row: any): boolean => !!row?.CanDel;
  exportExcelLoading = false;
  exportPdfLoading = false;
  selectedItems: FIN13030Data[] = [];
  columns: Column[] = [
    { field: 'ID', header: '資料識別碼', visible: false },
    { field: 'INV_GUINo', header: '發票號碼', visible: true, format: (_v: unknown, _i?: number, row?: FIN13030Data) => `${row?.INV_GUITrack ?? ''}${row?.INV_GUINo ?? ''}` },
    { field: 'INV_GUITrack', header: '發票字軌', visible: false },
    { field: 'INV_GUIDate', header: '發票日期', visible: true, format: formatDate },
    { field: 'INV_YM', header: '資料所屬年月', visible: true, format: formatYYYYMM },
    { field: 'INV_DeclareYM', header: '申報年月', visible: true, format: formatYYYYMM },
    { field: 'INV_SAL_Uniform', header: '客戶編號(統一編號)', visible: true },
    { field: 'INV_Name', header: '買受人名稱', visible: false },
    { field: 'INV_Uniform', header: '買受人統一編號', visible: true },
    { field: 'GoodsOrServicesName', header: '貨物或勞務名稱', visible: true },
    { field: 'GoodsQty', header: '貨物或勞務數量', visible: true },
    { field: 'INV_PassType', header: '通關方式註記', visible: false },
    { field: 'ExportMethod', header: '外銷方式', visible: true, format: (value: unknown) => { const opt = this.exportMethodOptions.find(o => o.value === String(value ?? '')); return opt ? opt.label : String(value ?? ''); } },
    { field: 'INV_DocName', header: '證明文件名稱', visible: true },
    { field: 'INV_DocNo', header: '證明文件號碼', visible: true },
    { field: 'NonCustomsExportAmt', header: '非經海關出口金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'INV_ExportType', header: '出口報單類別', visible: true, format: (value: unknown) => { const opt = this.exportTypeOptions.find(o => o.value === String(value ?? '')); return opt ? opt.label : String(value ?? ''); } },
    { field: 'INV_ExportNo', header: '出口報單號碼', visible: true },
    { field: 'CustomsExportAmt', header: '經海關出口金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'ExportDate', header: '輸出或結匯日期', visible: true, format: formatDate },
    { field: 'INV_Remark', header: '備註', visible: true },

    // 預設 hidden
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '更新日期', visible: false, format: formatDate },
    { field: 'UPD_USR_No', header: '更新人員編號', visible: false },
    { field: 'UPD_USR_Name', header: '更新人員姓名', visible: false },
  ];


  // 外銷方式選項（由 SYS1000 API 載入）
  exportMethodOptions: { value: string; label: string }[] = [];
  // 出口報單類別選項（由 SYS1000 API 載入）
  exportTypeOptions: { value: string; label: string }[] = [];

  constructor(
    private fin13030Service: FIN13030Service,
    private fin13050Service: FIN13050Service,
    private validationService: ValidationService,
    private datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13030', 'fin/fin13030cru', this.queryForm, (form) => this.onSubmit(form));

    // 外銷方式選項（SYS1000 API）
    this.fin13050Service.querySYS1000DropDownList('ExportMethod').subscribe((res) => {
      const list: { No: string; Name: string }[] = res?.Data ?? [];
      list.sort((a, b) => Number(a.No) - Number(b.No));
      this.exportMethodOptions = list.map((x) => ({ value: String(x.No), label: `${x.No}-${x.Name}` }));
    });

    // 出口報單類別選項（SYS1000 API）
    this.fin13050Service.querySYS1000DropDownList('INV_ExportType').subscribe((res) => {
      const list: { No: string; Name: string }[] = res?.Data ?? [];
      list.sort((a, b) => Number(a.No) - Number(b.No));
      this.exportTypeOptions = list.map((x) => ({ value: String(x.No), label: `${x.No}-${x.Name}` }));
    });
  }

  onSubmit(frm: FormGroup) {
    const fIN13030QueryRequest: FIN13030QueryRequest = {
      ...frm.value,
      // 年月格式轉換
      INV_YM_B: this.datePipe.transform(frm.get('INV_YM_B')?.value, 'yyyyMM') ?? null,
      INV_YM_E: this.datePipe.transform(frm.get('INV_YM_E')?.value, 'yyyyMM') ?? null,
    }

    this.handleSubmit(frm, () => {
      this.fin13030Service.queryFIN13030(fIN13030QueryRequest)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  deleteRow(rowData: FIN13030Data[]) {
    if (rowData.some(r => !(r as any)?.CanDel)) {
      this.messageService.warnBubble('已審核之申報年月資料不可刪除');
      return;
    }
    this.messageService.confirm({
      header: '是否確認刪除',
      accept: () => {
        this.fin13030Service.deleteFIN13030({
          idList: rowData.map(item => item.ID)
        }).subscribe((res) => {
          if (res.Status === '0000') {
            // 如果刪除成功，清除選擇的項目
            this.messageService.successBubble('刪除成功');
            this.onSubmit(this.queryForm);
          } else {
            this.messageService.errorBubble(res.Message);
          }
        });
      }
    });
  }

  private buildExportPayload(): FIN13030QueryRequest {
    const frm = this.queryForm;
    return {
      ...frm.value,
      INV_YM_B: this.datePipe.transform(frm.get('INV_YM_B')?.value, 'yyyyMM') ?? undefined,
      INV_YM_E: this.datePipe.transform(frm.get('INV_YM_E')?.value, 'yyyyMM') ?? undefined,
    } as FIN13030QueryRequest;
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(blobUrl);
  }

  private getTimestamp(): string {
    const now = new Date();
    return now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') + '_' +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0');
  }

  onExportExcel(): void {
    const payload = this.buildExportPayload();
    this.exportExcelLoading = true;
    this.fin13030Service.exportExcelFIN13030(payload)
      .pipe(finalize(() => this.exportExcelLoading = false), untilDestroyed(this))
      .subscribe(blob => {
        if (blob) {
          this.downloadBlob(blob, `零稅率清單維護_${this.getTimestamp()}.xlsx`);
        }
      });
  }

  onExportPdf(): void {
    const payload = this.buildExportPayload();
    this.exportPdfLoading = true;
    this.fin13030Service.exportPDFFIN13030(payload)
      .pipe(finalize(() => this.exportPdfLoading = false), untilDestroyed(this))
      .subscribe(blob => {
        if (blob) {
          this.downloadBlob(blob, `零稅率清單維護_${this.getTimestamp()}.pdf`);
        }
      });
  }

  // 移動路由
  override onCreate(frm: FormGroup) {
    // 檢查必填欄位
    const requiredFields = [
      { field: 'INV_GUINo_B', message: '請輸入發票號碼_起' },
      { field: 'INV_GUINo_E', message: '請輸入發票號碼_迄' },
      { field: 'INV_GUIDate_B', message: '請輸入發票日期_起' },
      { field: 'INV_GUIDate_E', message: '請輸入發票日期_迄' },
      { field: 'INV_DeclareYM_B', message: '請輸入申報年月_起' },
      { field: 'INV_DeclareYM_E', message: '請輸入申報年月_迄' }
    ];

    // 檢查每個欄位是否有值
    const errorMessages: string[] = [];
    for (const requiredField of requiredFields) {
      const value = frm.get(requiredField.field)?.value;
      if (!value || value === '' || value === null) {
        errorMessages.push(requiredField.message);
      }
    }
    if (errorMessages.length > 0) {
      this.messageService.errorBubble(errorMessages.join('<br>'));
      return; // 停止執行
    }

    if (this.hasPermission('20')) { // '新增' 的 function_code 是 "20"
      // 取得零稅率發票
      const rb: FIN13030GetZeroTaxGUIRequest = {
        INV_GUINo_B: frm.get('INV_GUINo_B')?.value,
        INV_GUINo_E: frm.get('INV_GUINo_E')?.value,
        INV_GUIDate_B: frm.get('INV_GUIDate_B')?.value,
        INV_GUIDate_E: frm.get('INV_GUIDate_E')?.value,
        INV_YM_B: this.datePipe.transform(frm.get('INV_YM_B')?.value, 'yyyyMM') ?? "",
        INV_YM_E: this.datePipe.transform(frm.get('INV_YM_E')?.value, 'yyyyMM') ?? "",
        INV_DeclareYM_B: this.queryForm.get('INV_DeclareYM_B')?.value ?? "",
        INV_DeclareYM_E: this.queryForm.get('INV_DeclareYM_E')?.value ?? "",
      };

      this.fin13030Service.queryFIN13030_GetZeroTaxGUI(rb).subscribe(r => {
        if (r.Data.length > 0) {
          this.navigateWithState(CRUDStatus.Create, r.Data[0]);
        } else {
          this.messageService.errorBubble('查無符合條件的零稅率發票');
        }
      });
    }
  }
}
