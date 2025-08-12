import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { NgIf } from '@angular/common';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column } from '@shared/componentkit/table/table.model';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from "primeng/table";
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls56040-cru',
  templateUrl: './tls56040-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    NgIf,
    TranslateModule,
    TableModule,
    InputTextareaComponent,
    TableComponent
  ]
})
export class TLS56040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  // 主檔表單定義
  dataForm = this.formBuilder.group({
    MVM_No: [{ value: '系統自動取號', disabled: true }], // 調撥單編號，readonly, 系統自動取號
    LOGO_No: [null, Validators.required], // 品牌編號，下拉選項，必填
    OUT_HOS_No: [null, Validators.required], // 調出倉別，下拉選項，必填
    IN_HOS_No: [null, Validators.required], // 調入倉別，下拉選項，必填
    APPLY_TotBuyNet: [{ value: 0, disabled: true }], // 金額，readonly，明細加總
    APPLY_TotQty: [{ value: 0, disabled: true }], // 數量，readonly，明細加總
    APPLY_Date: [{ value: new Date(), disabled: true }], // 申請日期，預帶系統日期
    APPLY_USR_No: [{ value: '預帶登入人員', disabled: true }], // 申請人編號，預帶登入人員
    MVM_Remark: [null, [Validators.maxLength(200)]], // 倉別調撥單說明
  });

  data: any = []; // 用於表格顯示明細數據
  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true, type: 'autoComplete' },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'MVD_BuyPrc', header: '進單價', visible: true },
    { field: 'STK_CurrentQty', header: '目前庫存', visible: true }, // 需要SP讀取
    { field: 'APPLY_Qty', header: '調撥申請數量', visible: true, type: 'inputNumber' },
    { field: 'APPLY_BuyNet', header: '調撥申請進價未稅小計', visible: true },
    { field: 'MVD_Remark', header: '單項說明', visible: true, type: 'input' },
  ];
  defaultInsertData: any = {
    PLU_MagNo: null,
    PLU_No: null,
    PLU_Name: null,
    MVD_BuyPrc: 0,
    CurrentStock: 0,
    APPLY_Qty: 0,
    APPLY_BuyNet: 0,
    MVD_Remark: null,
  }

  // 下拉選單選項 (需從API獲取)
  brandOptions: { label: string; value: string }[] = [];// 品牌
  warehouseOptions: { label: string; value: string }[] = []; // 倉別
  userOptions: { label: string; value: string }[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56040', this.dataForm);
    // 倉別 (HOS_No)
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(options => {
      this.warehouseOptions = options.Data.map(item => ({ label: item.Name, value: item.No }));
    });
    // 品牌代碼 (LOGO_No)
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.brandOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    // 申請人員、審核人員、結案人員 (共用人員下拉選單)
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.userOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    this.dataForm.patchValue({ APPLY_USR_No: this.authService.currentUserValue?.user_No });

    // 調出倉別與調入倉別必需不同 的驗證
    this.dataForm.controls['OUT_HOS_No'].valueChanges.subscribe(value => {
      if (value && this.dataForm.controls['IN_HOS_No'].value === value) {
        this.dataForm.controls['IN_HOS_No'].setErrors({ 'warehouseMismatch': true });
      } else {
        this.dataForm.controls['IN_HOS_No'].setErrors(null);
      }
    });

    this.dataForm.controls['IN_HOS_No'].valueChanges.subscribe(value => {
      if (value && this.dataForm.controls['OUT_HOS_No'].value === value) {
        this.dataForm.controls['IN_HOS_No'].setErrors({ 'warehouseMismatch': true });
      } else {
        this.dataForm.controls['IN_HOS_No'].setErrors(null);
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 提交邏輯
      console.log('Form Submitted!', frm.value);
    });
  }
}
