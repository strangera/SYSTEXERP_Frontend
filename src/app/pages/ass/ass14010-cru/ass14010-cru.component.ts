import { NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { apiOption } from '@shared/models/sys/sysb000.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';

export interface Label {
  id: number,
  ODM_No: string, // 驗收單號
  NTAX_AMT: string,// 未稅(含免稅)金額
  TAX_AMT: number // 稅額
  TOT_AMT: number // 總金額
}

//ass14010sample
export interface ass14010sample {
  'id': string;
  'STO_No': string; // 公司編號/店號
  'HOS_No': string; // 倉庫代碼 STO_NO+HOS_NO唯一值 STO_NO+HOS_NO唯一值
  'HOS_NAME': string; // 倉庫名稱
  'org_id': string; // 組織代碼/組織名稱
  'org_name': string; // 部門名稱
  'building_no': string; // 館別代碼
  'HOS_Remark'?: string; // 備註說明

  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;

  'CanDel': boolean; //能否刪除(僅顯示)
}

//3.1.4.1  進貨發票建檔作業 CRU
@Component({
  selector: 'app-ass14010-cru',
  templateUrl: './ass14010-cru.component.html',
  styleUrl: './ass14010-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberComponent,
    DropdownComponent,
    NgIf,
    TableEditComponent,
    TranslateModule]

})
export class ASS14010CRUComponent extends BasicCruPageComponent<ass14010sample> implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // ass14010sample
    supplierId: ['', [Validators.maxLength(50)]], // 供應商編號
    payDays: [null, [Validators.max(10), this.validationService.numberValidator]], // 付款天數
    totalAmount: [null, [Validators.max(999999999), this.validationService.numberValidator]], // 總金額
    NTAX_AMT: [null, [Validators.max(999999999), this.validationService.numberValidator]], // 未稅金額
    TAX_AMT: [null, [Validators.max(999999999), this.validationService.numberValidator]], // 稅額
  });
  //
  supplierId_Options: apiOption[] = []; // 供應商編號 下拉選項 (ass12020)
  invoice_type_Options: { value: string; label: string }[] = getSYS1000Options('invoice_type'); // 請款單據種類 下拉選項 (tls2e050)
  ODM_No_Options: apiOption[] = [ // 驗收單號 下拉選項
    { No: 'ODM001', Name: '驗收單號A', Label: 'ODM001 - 驗收單號A' },
    { No: 'ODM002', Name: '驗收單號B', Label: 'ODM002 - 驗收單號B' },
    { No: 'ODM003', Name: '驗收單號C', Label: 'ODM003 - 驗收單號C' }
  ];
  INV_GUIType_Options: { value: number; label: string }[] = [ // 發票格式 下拉選項 (fin23040)
    { value: 1, label: '21-進項三聯式、電子計算機統一發票' },
    { value: 2, label: '22-進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    { value: 3, label: '25-進向三連式收銀機統一發票及一般稅額計算之電子發票' },
    { value: 4, label: '26-彙總登陸每張稅額五百元以下之盡項三聯式、電子計算機之統一發票' },
    { value: 5, label: '27-彙總登陸每張稅額五百元以下之盡項二聯式收銀雞統一發票、載有稅額之其他憑證' },
    { value: 6, label: '28-進項海關代徵營業稅繳納證' },
  ];
  PUR_TaxType_Options = getSYS1000Options('PUR_TaxType'); // 課稅別 下拉選項 (fin13040)
  PUR_DedType_Options: apiOption[] = [ // 扣抵別 下拉選項 (無api，範例資料)
    { No: 'DED001', Name: '扣抵別A', Label: 'DED001 - 扣抵別A' },
    { No: 'DED002', Name: '扣抵別B', Label: 'DED002 - 扣抵別B' },
    { No: 'DED003', Name: '扣抵別C', Label: 'DED003 - 扣抵別C' }
  ];
  // ---------單據serialData (參考tls51070) 編輯表格 至少要一筆-------------------------------------------------------
  serialData: Label[] = [];
  serialColumn: EditColumn[] = [
    { field: 'ODM_No', header: '驗收單號', type: 'input' },
    { field: 'NTAX_AMT', header: '未稅(含免稅)金額', type: 'inputNumber' },
    { field: 'PLU_Name', header: '商品名稱', type: 'input' },
    { field: 'TAX_AMT', header: '稅額', type: 'inputNumber' },
    { field: 'TOT_AMT', header: '總金額', type: 'inputNumber' },
  ];
  // ---------發票serialData (參考tls51070) 編輯表格 至少要一筆-------------------------------------------------------
  invoiceData: Label[] = [];
  invoiceColumn: EditColumn[] = [
    { field: 'invoice_type', header: '請款單據種類', type: 'input' },
    { field: 'INV_GUINo', header: '發票/收據號碼', type: 'inputNumber' },
    { field: 'INV_GUIDate', header: '發票/收據日期', type: 'input' },
    { field: 'Pay_Date', header: '付款日期', type: 'date' },
    { field: 'REP_GUIYM', header: '申報年月', type: 'input' },
    { field: 'INV_GUIType', header: '發票格式', type: 'input' }
  ];
  // ----------------------------------------------------------------
  constructor(
    private validationService: ValidationService,
    private readonly dropDownListService: DropDownListService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('ASS14010', this.dataForm);
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // const formValue = frm.getRawValue();
            // this.tls51080Service.insertTLS51080(formValue).subscribe(() => {
            //   this.messageService.successBubble('新增成功');
            //   this.dataForm.reset();
            // });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // const formValue = frm.getRawValue();
            // this.tls51080Service.updateTLS51080(formValue).subscribe(() => {
            //   this.onCancel();
            // });
          }
          break;
      }
    });
  }

  // 讀取dopropdown選項
  loadOptions() {
    // 供應商編號 下拉 (ass12020)
    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = res.Data ?? [];
        this.supplierId_Options = list.map((item: { No?: string; Name?: string }) => ({
          No: item.No ?? '',
          Name: item.Name ?? '',
          Label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        }));
      });
  }

  //清除明細內容
  clearSubForm() {
    this.serialData = []; // 清空表格資料
  }
}
