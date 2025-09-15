import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';

// Service imports
import { FIN13030Data, FIN13030GetZeroTaxGUIRequest, FIN13030QueryRequest, FIN13030Service } from '../../../service/api/fin/fin13030.service';
import { ValidationService } from '../../../shared/service/validation.service';

// Component imports
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

// PrimeNG imports
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';

// Model imports
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { DropdownOption } from '../../../shared/models/api/base-api.interface';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { untilDestroyed } from '@ngneat/until-destroy';
import { getSYS1000Options } from '@service/system/sys1000.service';


@Component({
  selector: 'app-fin13030',
  templateUrl: './fin13030.component.html',
  styleUrl: './fin13030.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextRangeComponent, CalendarRangeComponent, InputTextComponent, InputNumberRangeComponent, TableComponent, TranslateModule, MultiSelectComponent]
})
export class FIN13030Component extends BasicQueryPageComponent<FIN13030Data> implements OnInit {
  queryForm = this.formBuilder.group({
    INV_GUINo_B: ['', [Validators.maxLength(10)]], // 發票號碼_起
    INV_GUINo_E: ['', [Validators.maxLength(10)]], // 發票號碼_迄
    INV_GUIDate_B: [null], // 發票日期_起
    INV_GUIDate_E: [null], // 發票日期_迄
    INV_YM_B: [null, Validators.required], // 資料所屬年月_起
    INV_YM_E: [null, Validators.required], // 資料所屬年月_迄
    INV_DeclareYM_B: [null, [this.validationService.oddMonthValidator, Validators.required]], // 申報年月_起
    INV_DeclareYM_E: [null, [this.validationService.oddMonthValidator, Validators.required]], // 申報年月_迄
    INV_Uniform: ['', [Validators.maxLength(10)]], // 買受人統一編號
    GoodsOrServicesName: ['', [Validators.maxLength(20)]], // 貨物或勞務名稱
    GoodsQtyStart: [0, [this.validationService.numberValidator]], // 貨物或勞務數量_起
    GoodsQtyEnd: [0, [this.validationService.numberValidator]], // 貨物或勞務數量_迄
    ExportMethod: [null], // 外銷方式 (多選)
    INV_DocName: ['', [Validators.maxLength(20)]], // 證明文件名稱
    INV_DocNo: ['', [Validators.maxLength(10)]], // 證明文件號碼
    NonCustomsExportAmt_B: [0, [this.validationService.numberValidator]], // 非經海關出口金額_起
    NonCustomsExportAmt_E: [0, [this.validationService.numberValidator]], // 非經海關出口金額_迄
    INV_ExportType: [null], // 出口報單類別 (多選)
    INV_ExportNo: ['', [Validators.maxLength(10)]], // 出口報單號碼
    CustomsExportAmt_B: [0, [this.validationService.numberValidator]], // 經海關出口金額_起
    CustomsExportAmt_E: [0, [this.validationService.numberValidator]], // 經海關出口金額_迄
    ExportDate_B: [null], // 輸出或結匯日期_起
    ExportDate_E: [null], // 輸出或結匯日期_迄
    INV_Remark: ['', [Validators.maxLength(100)]], // 備註
    ...createPaginationConfig([{ field: 'ID', order: -1 }])
  });

  totalRecords = 0;
  data: FIN13030Data[] = [];
  selectedItems: FIN13030Data[] = [];
  columns: Column[] = [
    { field: 'ID', header: '資料識別碼', visible: false },
    { field: 'INV_GUINo', header: '發票號碼', visible: true },
    { field: 'INV_GUIDate', header: '發票日期', visible: true },
    { field: 'INV_YM', header: '資料所屬年月', visible: true },
    { field: 'INV_DeclareYM', header: '申報年月', visible: true },
    { field: 'INV_SAL_Uniform', header: '客戶編號(統一編號)', visible: true },
    { field: 'INV_Name', header: '買受人名稱', visible: false },
    { field: 'INV_Uniform', header: '買受人統一編號', visible: true },
    { field: 'GoodsOrServicesName', header: '貨物或勞務名稱', visible: true },
    { field: 'GoodsQty', header: '貨物或勞務數量', visible: true },
    { field: 'INV_PassType', header: '通關方式註記', visible: false },
    { field: 'ExportMethod', header: '外銷方式', visible: true },
    { field: 'INV_DocName', header: '證明文件名稱', visible: true },
    { field: 'INV_DocNo', header: '證明文件號碼', visible: true },
    { field: 'NonCustomsExportAmt', header: '非經海關出口金額', visible: true },
    { field: 'INV_ExportType', header: '出口報單類別', visible: true },
    { field: 'INV_ExportNo', header: '出口報單號碼', visible: true },
    { field: 'CustomsExportAmt', header: '經海關出口金額', visible: true },
    { field: 'ExportDate', header: '輸出或結匯日期', visible: true },
    { field: 'INV_Remark', header: '備註', visible: true },

    // 預設 hidden
    { field: 'CRT_Date', header: '建立日期', visible: false },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '更新日期', visible: false },
    { field: 'UPD_USR_No', header: '更新人員編號', visible: false },
    { field: 'UPD_USR_Name', header: '更新人員姓名', visible: false },
  ];


  // 外銷方式選項
  exportMethodOptions = getSYS1000Options('ExportMethod');
  // 出口報單類別選項
  exportTypeOptions = getSYS1000Options('INV_ExportType');

  constructor(
    private fin13030Service: FIN13030Service,
    private validationService: ValidationService,
    private datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13030', 'fin/fin13030cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    const fIN13030QueryRequest: FIN13030QueryRequest = {
      ...frm.value,
      // 年月格式轉換
      INV_YM_B: this.datePipe.transform(frm.get('INV_YM_B')?.value, 'yyyyMM') ?? null,
      INV_YM_E: this.datePipe.transform(frm.get('INV_YM_E')?.value, 'yyyyMM') ?? null,
      INV_DeclareYM_B: this.datePipe.transform(frm.get('INV_DeclareYM_B')?.value, 'yyyyMM') ?? null,
      INV_DeclareYM_E: this.datePipe.transform(frm.get('INV_DeclareYM_E')?.value, 'yyyyMM') ?? null,
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

  // 移動路由
  override onCreate(frm: FormGroup) {
    // 檢查必填欄位
    const requiredFields = [
      { field: 'INV_GUINo_B', message: '請輸入發票號碼_起' },
      { field: 'INV_GUINo_E', message: '請輸入發票號碼_迄' },
      { field: 'INV_GUIDate_B', message: '請輸入發票日期_起' },
      { field: 'INV_GUIDate_E', message: '請輸入發票日期_迄' },
      { field: 'INV_YM_B', message: '請輸入資料所屬年月_起' },
      { field: 'INV_YM_E', message: '請輸入資料所屬年月_迄' },
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

    if (this.canPerformAction('20')) { // '新增' 的 function_code 是 "20"
      // 取得零稅率發票
      const rb: FIN13030GetZeroTaxGUIRequest = {
        INV_GUINo_B: frm.get('INV_GUINo_B')?.value,
        INV_GUINo_E: frm.get('INV_GUINo_E')?.value,
        INV_GUIDate_B: frm.get('INV_GUIDate_B')?.value,
        INV_GUIDate_E: frm.get('INV_GUIDate_E')?.value,
        INV_YM_B: this.datePipe.transform(frm.get('INV_YM_B')?.value, 'yyyyMM') ?? "",
        INV_YM_E: this.datePipe.transform(frm.get('INV_YM_E')?.value, 'yyyyMM') ?? "",
        INV_DeclareYM_B: this.datePipe.transform(frm.get('INV_DeclareYM_B')?.value, 'yyyyMM') ?? "",
        INV_DeclareYM_E: this.datePipe.transform(frm.get('INV_DeclareYM_E')?.value, 'yyyyMM') ?? "",
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