import { InputTextComponent } from './../../../shared/componentkit/input-text/input-text.component';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS24010Data } from '../../../service/api/tls/tls24010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextareaComponent } from "../../../shared/componentkit/input-textarea/input-textarea.component";
import { RadiobuttonYNComponent } from '../../../shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { untilDestroyed } from '@ngneat/until-destroy';
@Component({
  selector: 'app-tls24010-cru',
  templateUrl: './tls24010-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputNumberComponent, NgIf, TranslateModule, InputTextComponent, InputTextareaComponent, RadiobuttonYNComponent, DropdownComponent, InputTextRangeComponent],
})
export class TLS24010CRUComponent extends BasicCruPageComponent<TLS24010Data | unknown> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    // 發票資訊
    TXN_Date: [{ value: '', disabled: true }],         //disabled 銷售日期
    ECR_No: [{ value: '', disabled: true }],   //disabled 收銀機號pos1002.ecr_no
    TLT_No: [{ value: '', disabled: true }],           //disabled 專櫃編號
    TXN_No: [{ value: '系統自動產生', disabled: true }],//disabled 交易序號
    TXN_Desc: ['', [Validators.maxLength(20)]], //備註
    USR_No: ['8888888', [Validators.required, Validators.maxLength(16)]], //收銀員編號POS2001.USR_No
    TXN_Status: ['N'], //交易狀態 (一般交易=N, 退貨交易=E, 作廢交易=D)
    TXN_VIP: ['N'], //零稅 是/否, 若是, Y, 若否, N。若為y，TXN_TaxType變成2
    TXN_TaxType: ['1'], //交易稅別，0=免稅、1=應稅、2=零稅 ("若 TXN_TotSaleTax 不等於零時，為應稅1
    // 若 TXN_TotSaleTax 等於零且 TXN_TotSaleNoTax 不等於零時，為免稅0 若為零稅交易(TXN_VIP等於Y)則為2")
    TXN_PreOrder: ['N', [Validators.required]], //預售 是/否
    TXN_Mode: [{ value: 'P', disabled: true }], //交易模式 固定為P=事後登錄 (隱藏)
    TXN_Uniform: ['', [Validators.maxLength(8)]], //客戶統一編號 可以為空
    GUI_Track: ['', [Validators.required, Validators.maxLength(2), Validators.minLength(2), this.validationService.guiTrackValidator]], //發票字軌
    TXN_GUIBegNo: ['', [Validators.required, Validators.maxLength(8), Validators.minLength(8), this.validationService.guiBegNoValidator]], //起始發票號碼
    TXN_GUIEndNo: ['', [Validators.maxLength(8), Validators.minLength(8), this.validationService.guiEndNoValidator]], //結束發票號碼
    TXN_GUICnt: [{ value: 0, disabled: true }], //發票號碼張數
    TXN_MemCard: ['', [Validators.maxLength(30)]], //會員編號，若有資料需要串接環友
    TXN_TaxFreeCertNo: [{ value: '', disabled: true }], // 免稅卡零稅卡號= 免稅證證號 欄位

    TXN_DtlCnt: [1, [Validators.required, Validators.min(1), Validators.max(9999)]], //交易筆數
    TXN_Time: [null], //銷售時段 新增時, 依POS5007筆數寫入
    TXN_GUI_CarrType: [''], //電子載具種類=電子發票載具類別 悠遊載具卡=1K0001、手機條碼=3J0002、自然人憑證=CQ0001、一卡通載具=1H0001、信用卡載具=EK0002、#=取消載具
    TXN_GUIVehicle: [''], //電子發票載具卡號 若有值則TXN_GUI_CarrType固定為3J0002，TXN_GUI_CarrId與TXN_GUI_CarrIdEx內容與此欄位相同
    TXN_GUI_CarrId: [''], //電子發票載具ID隱碼，CarrierId2載具隱碼id 信用卡=信用卡加密卡號50碼
    TXN_GUI_CarrIdEx: [''], //電子發票載具ID顯碼，CarrierId1載具顯碼id 信用卡=刷卡日期(民國年月日7碼)刷卡金額(右靠左補0共10碼)TXN_GUI_CarrTyp 有選擇時，皆需要輸入此欄位
    TXN_GUIRemark: [''], //電子發票防偽隨機碼 由系統依據自訂公式計算取得
    TXN_PrintTimes: [0], //紙本發票列印狀態(若列印電子發票紙本證明連則為1，其他則為0) 紙本發票列印狀態=判斷列印次數欄位，顯示 是/否
    TXN_GUI_Donate: ['N'], //發票捐贈狀態，Y=是、N=否
    TXN_GUILoveCode: [''], //捐贈社福團體代碼，若TXN_GUI_Donate為Y，則必須輸入此欄位
  }, { validators: this.validationService.guiNumberRangeValidator('TXN_GUIBegNo', 'TXN_GUIEndNo') });
  USR_NoOptions: IDropdownItem[] = [];
  txnStatusOptions = [
    { label: '一般交易', value: 'N' },
    { label: '退貨交易', value: 'E' },
    { label: '作廢交易', value: 'D' },
  ];
  txnTaxTypeOptions = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' },
    { label: '零稅', value: '2' },
  ];
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly validationService: ValidationService,
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS24010', this.dataForm);
    // 新增的話帶入 銷售日期、收銀機編號、專櫃編號
    if (this.isFormCreateable && this.rowdata) {
      const rowDataTyped = this.rowdata as TLS24010Data;
      this.dataForm.patchValue({
        TXN_Date: rowDataTyped.TXN_Date,
        ECR_No: rowDataTyped.ECR_No,
        TLT_No: rowDataTyped.TLT_No,
      });
    }
    this.initializeOptions();
    this.listenForChanges();
  }
  initializeOptions() {
    // 查詢收銀員設定檔(POS2001)
    this.dropDownListService.queryPOS2001_DropDownList().subscribe((data) => {
      this.USR_NoOptions = data.Data.map((item) => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
  }
  listenForChanges() {
    this.dataForm.get('TXN_GUIEndNo')?.valueChanges.pipe(untilDestroyed(this)).subscribe(endNoValue => {
      const begNoValue = this.dataForm.get('TXN_GUIBegNo')?.value;
      if (begNoValue !== null && begNoValue !== '' && endNoValue !== null && endNoValue !== '') {
        const beg = Number(begNoValue);
        const end = Number(endNoValue);
        if (!isNaN(beg) && !isNaN(end)) {
          if (end >= beg && (beg % 100 === 0 || beg % 100 === 50) && (end % 100 === 49 || end % 100 === 99)) {
            const totalQty = end - beg + 1;
            if (totalQty % 50 === 0) {
              const qty = totalQty / 50;
              this.dataForm.get('TXN_GUICnt')?.setValue(qty, { emitEvent: false });
            } else {
              this.dataForm.get('TXN_GUICnt')?.setValue(0, { emitEvent: false });
              console.warn('總張數無法被 50 整除，資料格式可能有誤');
            }
          }
        }
      }
    });
    this.dataForm.get('TXN_GUIBegNo')?.valueChanges.pipe(untilDestroyed(this)).subscribe(begNoValue => {
      if (begNoValue !== null && begNoValue !== '') {
        const beg = Number(begNoValue);
        if (!isNaN(beg) && (beg % 100 === 0 || beg % 100 === 50)) {
          this.dataForm.get('TXN_GUICnt')?.setValue(1, { emitEvent: false });
        } else {
          this.dataForm.get('TXN_GUICnt')?.setValue(0, { emitEvent: false });
        }
      }
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    });
  }
}
