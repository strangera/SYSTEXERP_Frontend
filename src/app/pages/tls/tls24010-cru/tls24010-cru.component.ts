import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { formatTimeToHHMMSS } from '@others/component/table/table.model';
import { BlockUIModule } from 'primeng/blockui';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { finalize } from 'rxjs';
import { POS5007Data, POS5008Data, TLS24010Data, Tls24010Service } from '../../../service/api/tls/tls24010.service';
import { DropDownListService, IDropdownItem, POS2004Item } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextareaComponent } from "../../../shared/components/input-textarea/input-textarea.component";
import { RadiobuttonYNComponent } from '../../../shared/components/radiobutton-yn/radiobutton-yn.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { FIX_TYPE, FIX_TYPE_LABEL } from '../tls24010/tls24010.model';
import { InputTextComponent } from './../../../shared/components/input-text/input-text.component';
import { guiVehicleValidator, STORE_WAY, TLS24010_EDIT_TYPE, TXN_GUI_CarrTypeOptions, txnStatusOptions } from './tls24010-cru.model';
import { Tls24010DiscodeComponent } from './tls24010-discode/tls24010-discode.component';
import { Tls24010PaynoComponent } from './tls24010-payno/tls24010-payno.component';
import { Tls24010Pos5007Component } from './tls24010-pos5007/tls24010-pos5007.component';
import { Tls24010Pos5008Component } from './tls24010-pos5008/tls24010-pos5008.component';
import { Tls24010TltidComponent } from './tls24010-tltid/tls24010-tltid.component';
import { Tls24010TltnoComponent } from './tls24010-tltno/tls24010-tltno.component';

@Component({
  selector: 'app-tls24010-cru',
  templateUrl: './tls24010-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    InputNumberComponent,
    AsyncPipe,
    TranslateModule,
    InputTextComponent,
    InputTextareaComponent,
    RadiobuttonYNComponent,
    DropdownComponent,
    DividerModule,
    Tls24010Pos5008Component,
    Tls24010Pos5007Component,
    Tls24010PaynoComponent,
    Tls24010TltidComponent,
    Tls24010TltnoComponent,
    Tls24010DiscodeComponent,
    CalendarModule,
    BlockUIModule,
    ProgressSpinnerModule,
    CheckboxModule,
  ],
})
export class TLS24010CRUComponent extends BasicCruPageComponent<TLS24010Data | unknown> implements OnInit {
  @ViewChild(Tls24010Pos5007Component) pos5007Comp?: Tls24010Pos5007Component;
  @ViewChild(Tls24010Pos5008Component) pos5008Comp?: Tls24010Pos5008Component;
  @ViewChild(Tls24010TltnoComponent) tltnoComp?: Tls24010TltnoComponent;
  @ViewChild(Tls24010TltidComponent) tltidComp?: Tls24010TltidComponent;
  @ViewChild(Tls24010DiscodeComponent) discodeComp?: Tls24010DiscodeComponent;
  @ViewChild(Tls24010PaynoComponent) paynoComp?: Tls24010PaynoComponent;
  @ViewChild('customTimeTemp') customTimeTemp!: TemplateRef<any>;
  private readonly dropDownListService = inject(DropDownListService);
  private readonly validationService = inject(ValidationService);
  private readonly tls24010Service = inject(Tls24010Service);
  private readonly dropDown = inject(DropdownApiService);
  private readonly datePipe = inject(DatePipe);
  readonly EDIT_TYPES = {
    TLT_NO: '01',   // 專櫃編號修正
    DISC_CODE: '02',// 折扣別修正
    TLT_ID: '03',   // 類別修正
    PAY_NO: '04'    // 付款別修正
  };
  type?: FIX_TYPE; // 修正類別
  TXN_GUIPaper?: string; // 補登類別 (補原機台='E' 手開發票='2')
  TLT_Name?: string; //專櫃名稱
  store_way?: string // 1為專櫃 2=自營
  talent_id?: number; //專櫃編號
  TLT_No?: string; //專櫃編號
  rece_yn?: string; // 是否開立業主發票
  PaymentDetailsList: POS5008Data[] = [];
  ProductDetailList: POS5007Data[] = [];
  dataForm = this.formBuilder.nonNullable.group({
    TXN_Date: [{ value: '', disabled: true }],           //disabled 銷售日期
    ECR_No: [{ value: '', disabled: true }],             //disabled 收銀機號 pos1002.ecr_no
    TLT_No: [{ value: '', disabled: true }],             //disabled 專櫃編號
    TXN_No: [{ value: '系統自動產生', disabled: true }],  //disabled 交易序號
    TXN_Remark: ['', [Validators.maxLength(60)]],                           //備註
    USR_No: ['8888888', [Validators.required, Validators.maxLength(16)]], //收銀員編號POS2001.USR_No
    TXN_PreOrder: ['N', [Validators.required]], //預售 是/否
    TXN_VIP: ['N', [Validators.required]], //零稅 是/否,YN。若為y，TXN_TaxType變成2
    TXN_TaxFreeCertNo: [{ value: null, disabled: true }], // 免稅卡零稅卡號= 免稅證證號 欄位
    TXN_Status: ['N'],                                                    //交易狀態 (一般交易=N, 退貨交易=E, 作廢交易=D)
    GUI_Track: ['', [Validators.maxLength(2), Validators.minLength(2), this.validationService.alphanumericValidator]], //發票字軌
    TXN_GUIBegNo: ['', [Validators.maxLength(8), Validators.minLength(8), this.validationService.numberValidator]], //起始發票號碼
    TXN_GUIEndNo: [''], //結束發票號碼
    TXN_TotGUI: [{ value: 0, disabled: true }],
    TXN_CustCnt: [1, [Validators.required, Validators.min(-99999999), Validators.max(99999999)]], //來客數
    TXN_SaleCnt: [1, [Validators.required, Validators.min(0), Validators.max(99999999)]], //交易筆數
    TXN_MemCard: ['', [Validators.maxLength(30), this.validationService.alphanumericValidator]], //會員編號，若有資料需要串接環友
    TXN_Uniform: ['', [Validators.maxLength(8)]], //客戶統一編號 可以為空
    TXN_Time: [null as Date | null], //銷售時段今日的時間
    isNegativeTXN: [false],
    ORG_TXN_Date: [{ value: null as Date | null, disabled: true }], //原交易日期
    ORG_ECR_No: [{ value: null as string | null, disabled: true }], //原收銀機台
    TXN_GUI_CarrType: [null as string | null], //電子載具種類=電子發票載具類別 悠遊載具卡=1K0001、手機條碼=3J0002、自然人憑證=CQ0001、一卡通載具=1H0001、信用卡載具=EK0002、#=取消載具
    TXN_GUIVehicle: [{ value: null, disabled: true }, [Validators.maxLength(20), guiVehicleValidator]], //電子發票載具卡號 若有值則 TXN_GUI_CarrType 固定為3J0002，TXN_GUI_CarrId與TXN_GUI_CarrIdEx內容與此欄位相同
    TXN_GUI_CarrIdEx: [{ value: null, disabled: true }, [Validators.maxLength(64)]], //電子發票載具ID顯碼
    TXN_GUI_CarrId: [{ value: null, disabled: true }, [Validators.maxLength(64)]], //電子發票載具ID隱碼
    TXN_GUIRemark: ['', [Validators.maxLength(4), this.validationService.alphanumericValidator]], //電子發票防偽隨機碼 由系統依據自訂公式計算取得
    TXN_PrintTimes: [0], //紙本發票列印狀態(若列印電子發票紙本證明連則為1，其他則為0) 顯示 是/否
    IsHaveGUILoveCode: ['N'], //發票捐贈狀態，Y=是、N=否
    TXN_GUILoveCode: [{ value: null, disabled: true }], //捐贈社福團體代碼，若IsHaveGUILoveCode為Y，則必須輸入此欄位
    CRT_USR_Name: [{ value: '', disabled: true }], // 補登者
    CRT_Date: [{ value: null as Date | null, disabled: true }], // 補登日期
  });
  ECR_NoOptions = this.dropDown.queryPos1002();     //dropdown 下拉選單 收銀機號
  USR_NoOptions = this.dropDown.queryPos2001();     //dropdown 下拉選單 收銀員
  txnStatusOptions = txnStatusOptions               //dropdown 下拉選單 交易型態
  TXN_GUI_CarrTypeOptions = TXN_GUI_CarrTypeOptions;//dropdown 下拉選單 電子載具種類
  TLT_NoOptions: IDropdownItem[] = [];              //dropdown 下拉選單 專櫃編號
  ngOnInit(): void {
    this.loadInitialData();
  }
  loadInitialData() {
    this.renderComponent = false;
    this.initializePage('TLS24010', this.dataForm);
    const rowDataTyped = this.rowdata as TLS24010Data;
    this.TXN_GUIPaper = rowDataTyped.TXN_GUIPaper ?? this.queryData.TXN_GUIPaper;
    this.TLT_Name = rowDataTyped.TLT_Name;
    this.store_way = rowDataTyped.store_way;
    this.talent_id = rowDataTyped.talent_id;
    this.rece_yn = rowDataTyped.rece_yn;
    const TXN_Date = this.datePipe.transform(rowDataTyped.TXN_Date, 'yyyy-MM-dd');
    if (TXN_Date) {
      this.dropDownListService.queryTLTTALENT_ByContractDate_DropDownList(TXN_Date).pipe(untilDestroyed(this)).subscribe(options => {
        this.TLT_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
      });
    }
    // 新增時候
    if (this.isFormCreateable && this.queryData) {
      this.dataForm.patchValue({
        TXN_Date: this.queryData.TXN_Date,
        ECR_No: this.queryData.ECR_No,
        TLT_No: this.queryData.TLT_No,
      });
    }
    this.type = rowDataTyped?.type as FIX_TYPE;
    const titleName = this.isFormCreateable ? '新增補登資訊' : FIX_TYPE_LABEL[this.type!] || '顯示補登資訊';
    this.formTitle = (this.store_way === STORE_WAY.專櫃 ? '(專櫃)' : '(自營)') + titleName;
    // 不是新增時候
    if (!this.isFormCreateable) {
      this.dataForm.disable();
      const body = {
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo ?? '',
        TXN_Date: rowDataTyped.TXN_Date,
        ECR_No: rowDataTyped.ECR_No,
        TXN_No: Number(rowDataTyped.TXN_No),
      }
      this.tls24010Service.queryTLS24010_Detail(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((data) => {
        this.ProductDetailList = [...data.Data[0].ProductDetailList];
        this.PaymentDetailsList = [...data.Data[0].PaymentDetailsList];
        if (this.isFormEditable) {
          this.dataForm.get('TXN_Remark')?.enable();
          if (this.type === FIX_TYPE.預售交易修正) {
            this.dataForm.get('TXN_PreOrder')?.enable();
          }
        }
      })
    }
    if (rowDataTyped.ORG_TXN_Date) {
      this.dataForm.get('isNegativeTXN')?.setValue(true);
    }
    // 檢查是否開立業主發票 (rece_yn)
    if (this.rece_yn !== 'Y') {
      this.dataForm.get('TXN_TaxFreeCertNo')?.disable();
      this.dataForm.get('TXN_GUIRemark')?.disable();
    }
    this.listenForChanges();
    setTimeout(() => {
      this.renderComponent = true;
    });
  }
  listenForChanges() {
    const controls = this.dataForm.controls;
    // 封裝：切換必填驗證與啟用狀態
    const toggleRequired = (control: any, isRequired: boolean, maxLength: number) => {
      if (isRequired) {
        control.setValidators([Validators.required, Validators.maxLength(maxLength)]);
        control.enable();
      } else {
        control.clearValidators();
        control.disable();
        control.setValue(null);
      }
      control.updateValueAndValidity();
    };
    // 1. 監聽 零稅 (TXN_VIP)
    controls.TXN_VIP.valueChanges.pipe(untilDestroyed(this)).subscribe(val => {
      // 判斷條件：零稅為 'Y' 且 業主發票為 'Y' 才能輸入
      const canEnable = (val === 'Y' && this.rece_yn === 'Y');
      // 如果不符合條件，強制清空並禁用
      toggleRequired(controls.TXN_TaxFreeCertNo, canEnable, 10);
      // 額外保險：如果是因為 rece_yn 而不能輸入，彈出提醒 (可選)
      if (val === 'Y' && this.rece_yn !== 'Y') {
        // this.messageService.infoBubble('此專櫃不開立業主發票，無法輸入免稅卡號', '提醒');
      }
    });
    // 2. 監聽 電子載具種類 (TXN_GUI_CarrType)
    controls.TXN_GUI_CarrType.valueChanges.pipe(untilDestroyed(this)).subscribe(carrType => {
      // 先重置相關欄位
      const isMobile = carrType === '3J0002';
      const hasType = !!(carrType && carrType.trim());
      ['TXN_GUI_CarrId', 'TXN_GUI_CarrIdEx', 'TXN_GUIVehicle'].forEach(key =>
        (controls as any)[key].setValue(null, { emitEvent: false })
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      hasType ? controls.TXN_GUI_CarrIdEx.enable() : controls.TXN_GUI_CarrIdEx.disable();
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      isMobile ? controls.TXN_GUIVehicle.enable() : controls.TXN_GUIVehicle.disable();
    });
    // 3. 監聽 載具編號顯碼 (TXN_GUI_CarrIdEx) -> 連動隱碼與手機條碼
    controls.TXN_GUI_CarrIdEx.valueChanges.pipe(untilDestroyed(this)).subscribe(val => {
      controls.TXN_GUI_CarrId.setValue(val, { emitEvent: false });
      if (controls.TXN_GUI_CarrType.value === '3J0002') {
        controls.TXN_GUIVehicle.setValue(val, { emitEvent: false });
      }
    });
    // 4. 監聽 發票捐贈狀態 (IsHaveGUILoveCode)
    controls.IsHaveGUILoveCode.valueChanges.pipe(untilDestroyed(this)).subscribe(val => {
      toggleRequired(controls.TXN_GUILoveCode, val === 'Y', 20);
    });
    // 5. 監聽 發票字軌 (GUI_Track) -> 自動轉大寫
    controls.GUI_Track.valueChanges.pipe(untilDestroyed(this)).subscribe(val => {
      if (typeof val === 'string' && val !== val.toUpperCase()) {
        controls.GUI_Track.setValue(val.toUpperCase(), { emitEvent: false });
      }
    });
    // 6. 處理 TXN_GUIPaper = '2' (手開發票) 必填發票字軌、號碼
    if (this.isFormCreateable && this.TXN_GUIPaper === '2') {
      // 設定 GUI_Track (發票字軌) 必填
      controls.GUI_Track.setValidators([
        Validators.required,
        Validators.maxLength(2),
        Validators.minLength(2),
        this.validationService.alphanumericValidator
      ]);

      // 設定 TXN_GUIBegNo (起始發票號碼) 必填
      controls.TXN_GUIBegNo.setValidators([
        Validators.required,
        Validators.maxLength(8),
        Validators.minLength(8),
        this.validationService.numberValidator
      ]);

      // 立即觸發驗證狀態更新 (加上 emitEvent: false 避免觸發不必要的 valueChanges 迴圈)
      controls.GUI_Track.updateValueAndValidity({ emitEvent: false });
      controls.TXN_GUIBegNo.updateValueAndValidity({ emitEvent: false });
    }
    // 發票號碼變動，觸發計算發票金額
    if (this.isFormCreateable || this.type === FIX_TYPE.付款別修正) {
      controls.TXN_GUIBegNo.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
        this.updateTxnTotGUI();
      });
    }
    // 監聽是否為負項交易
    controls.isNegativeTXN.valueChanges.pipe(untilDestroyed(this)).subscribe(isNeg => {
      if (isNeg) {
        // 勾選：自動帶入當前銷售日期與機台
        controls.ORG_TXN_Date.setValue(controls.TXN_Date.value ? new Date(controls.TXN_Date.value) : null);
        controls.ORG_ECR_No.setValue(controls.ECR_No.value);
        controls.ORG_TXN_Date.enable();
        controls.ORG_ECR_No.enable();
        controls.ORG_TXN_Date.setValidators([Validators.required]);
        controls.ORG_ECR_No.setValidators([Validators.required]);
      } else {
        // 未勾選：清空
        controls.ORG_TXN_Date.setValue(null);
        controls.ORG_ECR_No.setValue(null);
        controls.ORG_TXN_Date.disable();
        controls.ORG_ECR_No.disable();
        controls.ORG_TXN_Date.clearValidators();
        controls.ORG_ECR_No.clearValidators();
      }
      controls.ORG_TXN_Date.updateValueAndValidity();
      controls.ORG_ECR_No.updateValueAndValidity();
    });
  }
  onSubmit(frm: FormGroup) {
    if (this.isFormEditable) {
      this.updateTLS24010();
      return;
    }
    this.handleSubmit(frm, () => {
      this.loading = false;
      const isNeg = this.dataForm.controls.isNegativeTXN.value;
      const pos5007Data = this.pos5007Comp?.POS5007Data ?? [];
      const pos5008Data = this.pos5008Comp?.POS5008Data.map((item, i) => {
        const formGroup = this.pos5008Comp?.posFormArrayControls[i];
        return { ...item, ...formGroup?.getRawValue() };
      }).filter(item => item.selected) ?? [];
      // --- 1. POS5007 明細檢查 (改用 for...of 以便 return) ---
      for (const item of pos5007Data) {
        if (item.TXN_Qty == null || item.TXN_SaleAmt == null || item.TXN_Qty === 0 || item.TXN_SaleAmt === 0) {
          return this.messageService.errorBubble('銷售數量或金額必須有值', '資料未填寫');
        }
        // 負項卡控
        if (isNeg && Number(item.TXN_SaleAmt) >= 0) {
          return this.messageService.errorBubble(`負項交易中，商品金額 (${item.TXN_SaleAmt}) 必須為負數`, '資料格式錯誤');
        }
      }
      // --- 2. POS5008 支付工具檢查 ---
      if (pos5008Data.length === 0) {
        return this.messageService.errorBubble('請至少選擇一筆支付工具', '支付工具必須選擇');
      }
      const childValid = this.pos5008Comp?.validate();
      if (!childValid) return; // 內部已有報錯訊息
      // 負項卡控 (改用 for...of)
      if (isNeg) {
        for (const pay of pos5008Data) {
          if (Number(pay.TXN_PayAmt) >= 0) {
            this.loading = false;
            return this.messageService.errorBubble(`負項交易中，支付金額 (${pay.TXN_PayAmt}) 必須為負數`, '資料格式錯誤');
          }
        }
      }
      // --- 3. 金額總計與平衡檢查 ---
      const totalSaleAmt = pos5007Data.reduce((sum, item) => sum + (Number(item.TXN_SaleAmt) || 0), 0);
      const totalPayAmt = pos5008Data.reduce((sum, item) => sum + (Number(item.TXN_PayAmt) || 0), 0);
      const MAX_DIGITS = 10;
      if (Math.floor(Math.abs(totalSaleAmt)).toString().length > MAX_DIGITS) {
        return this.messageService.errorBubble(`銷售總金額 (${totalSaleAmt}) 超過系統允許的最大值`, '金額超出限制');
      }
      // --- 4. 金額少於檢核 ---
      const diff = totalPayAmt - totalSaleAmt;
      if (totalSaleAmt > 0) {
        if (diff < -0.001) {
          return this.messageService.errorBubble(`支付總額不足，尚差 ${Math.abs(diff).toFixed(2)} 元。`, '金額檢核失敗');
        }
        else if (diff > 0.001) {
          // 溢收檢核 (總金額超過銷售額時)
          const hasOverPay = pos5008Data.some(item => item.PAY_OverPay === 'Y');
          if (!hasOverPay) {
            this.loading = false;
            return this.messageService.errorBubble('未包含可溢收的付款方式，不可溢收', '付款別檢核失敗');
          }
        }
      } else {
        // 負項交易必須平帳
        if (Math.abs(diff) > 0.001) {
          return this.messageService.errorBubble(`負項交易支付總額 (${totalPayAmt}) 必須等於 銷售總額 (${totalSaleAmt})。`, '金額檢核失敗');
        }
      }
      // --- 5. 發票金額與支付工具(未開支付 = 稅別0)檢核 ---
      const guiBegNo = this.dataForm.getRawValue().TXN_GUIBegNo;

      // 只有在「有填發票號碼」且「不為 00000000」的情況下才檢核
      if (guiBegNo && guiBegNo !== '00000000') {
        const taxType0Sum = pos5008Data
          .filter(item => item.PAY_TaxType === '0')
          .reduce((sum, item) => sum + (Number(item.TXN_PayAmt) || 0), 0);

        const txnTotGUI = Number(this.dataForm.getRawValue().TXN_TotGUI) || 0;

        if (Math.abs(taxType0Sum - txnTotGUI) > 0.001) {
          this.loading = false;
          return this.messageService.errorBubble(
            `未開支付總額 (${taxType0Sum})不等於發票金額 (${txnTotGUI})`,
            '金額檢核失敗'
          );
        }
      }
      // --- 6. 準備送出 ---
      const txnDate = this.datePipe.transform(this.dataForm.getRawValue().TXN_Date, 'yyyy-MM-dd');
      const orgTxnDate = this.datePipe.transform(this.dataForm.getRawValue().ORG_TXN_Date, 'yyyy-MM-dd');
      // === 支付邏輯卡控結束，如果成功則繼續執行 confirm ===
      this.messageService.confirm({
        header: '確認',
        message: `確定要新增嗎?`,
        accept: () => {
          const body = {
            Store_way: this.store_way,
            TXN_GUIPaper: this.TXN_GUIPaper,
            ...frm.getRawValue(),
            TXN_GUIRemark: this.rece_yn === 'Y' ? frm.getRawValue().TXN_GUIRemark : '',
            TXN_Date: txnDate,
            ORG_TXN_Date: isNeg ? orgTxnDate || null : null,
            ORG_ECR_No: isNeg ? frm.getRawValue().ORG_ECR_No ? frm.getRawValue().ORG_ECR_No : null : null,
            GUI_Track: frm.getRawValue().GUI_Track || '00',
            TXN_GUIBegNo: frm.getRawValue().TXN_GUIBegNo || '00000000',
            TXN_GUIEndNo: frm.getRawValue().TXN_GUIEndNo || '00000000',
            TXN_No: this.isFormCreateable ? undefined : frm.getRawValue().TXN_No,
            TXN_Time: frm.getRawValue().TXN_Time ? formatTimeToHHMMSS(frm.getRawValue().TXN_Time) : '00:00:00',
            TXN_Status: 'N',
            POS5007_INFO: pos5007Data
              .filter(item => {
                const price = (typeof item.PLU_MagNo === 'object' && item.PLU_MagNo !== null)
                  ? item.PLU_SalePrc
                  : item.PLU_SalePrc;
                return Number(price) !== 0;
              })
              .map((item) => {
                if (typeof item.PLU_MagNo === 'object' && item.PLU_MagNo !== null) {
                  return {
                    PLU_MagNo: item.PLU_MagNo.PLU_MagNo || '',
                    PLU_No: item.PLU_MagNo.PLU_No || '',
                    TXN_Qty: item.TXN_Qty || 0,
                    PLU_SalePrc: item.PLU_SalePrc || 0,
                    TXN_Disc: item.TXN_Disc || 0,
                    TXN_SaleAmt: item.TXN_SaleAmt || 0,
                    tlt_id: item.tlt_id || '0',
                    PLU_TaxType: item.PLU_TaxType || '1',
                    TXN_DiscCode: item.TXN_DiscCode || '000'
                  };
                }
                return item;
              }),
            POS5008_INFO: pos5008Data.map((item) => {
              return {
                PAY_No: item.PAY_No || '',
                TXN_PayAmt: item.TXN_PayAmt || 0,
                CRD_Type: item.CRD_Type !== '' ? item.CRD_Type : undefined,
                CRD_No: item.CRD_Type !== '' ? item.CRD_No : undefined,
                TXN_CouponNo: item.TXN_CouponNo != '' ? item.TXN_CouponNo : undefined,
                TXN_PayDesc: item.TXN_PayDesc != '' ? item.TXN_PayDesc : undefined,
                TERM_No: item.TERM_No !== '' ? Number(item.TERM_No) : undefined
              };
            }),
          }
          this.loading = true;
          this.tls24010Service.insertTLS24010(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
            // 判斷如果res.Message有失敗字眼就顯示
            if (res.Message && res.Message.indexOf('失敗') > -1) {
              this.messageService.confirm({
                message: res.Data,
                showRejectButton: false,
                accept: () => this.onCancel()
              })
              return this.messageService.successBubble(res.Message)
            };
            this.messageService.successBubble(res.Message);
            this.onCancel();
          });
        }
      });
    });
  }
  /** 輔助：驗證作廢日期 */
  private isValidVoidDate(selected: Date, txnDateStr: string): boolean {
    if (!selected) {
      this.messageService.errorBubble('請選擇作廢日期');
      return false;
    }
    const s = new Date(selected).setHours(0, 0, 0, 0);
    const t = new Date(txnDateStr).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    if (s < t) {
      this.messageService.errorBubble('作廢日期不可早於交易日期');
      return false;
    }
    if (s > today) {
      this.messageService.errorBubble('作廢日期不可晚於今日');
      return false;
    }
    return true;
  }
  updateTLS24010() {
    const rowData = this.rowdata as TLS24010Data;
    const isCross = this.isCrossPeriod(rowData.TXN_Date) && rowData.TXN_GUIBegNo !== '00000000';
    // --- 預設時間為 23:00 的 Date 物件 ---
    const defaultVoidDate = new Date();
    defaultVoidDate.setHours(23, 0, 0, 0);
    this.messageService.confirm({
      header: this.type === FIX_TYPE.交易資料作廢 ? (isCross ? '開立折讓單' : '作廢交易資料') : FIX_TYPE_LABEL[this.type!],
      message: this.type === FIX_TYPE.交易資料作廢 ? (isCross ? '此筆交易已跨期，確定作廢後會開立折讓單，確定作廢嗎?' : '此筆交易未跨期，確定要作廢交易資料嗎?') : `確定要${FIX_TYPE_LABEL[this.type!]}嗎?`,
      contentTemplate: this.type === FIX_TYPE.交易資料作廢 ? this.customTimeTemp : undefined, // 丟入 HTML 樣板
      templateContext: this.type === FIX_TYPE.交易資料作廢 ? { data: { selectedDate: defaultVoidDate } } : undefined,
      accept: (result) => {
        this.loading = true;
        const body = {
          Store_way: this.store_way || '',
          SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
          TXN_Date: this.datePipe.transform(this.dataForm.getRawValue().TXN_Date, 'yyyy-MM-dd'),
          ECR_No: this.dataForm.getRawValue().ECR_No,
          TXN_No: Number(this.dataForm.getRawValue().TXN_No),
          POS5006_ID: rowData.ID,
          TXN_Remark: this.dataForm.getRawValue().TXN_Remark,
        }
        if (this.type === FIX_TYPE.專櫃編號修正) {
          const rawDataList = this.tltnoComp?.tltIdData || [];
          // --- 檢查 1：是否至少有一筆資料 ---
          if (rawDataList.length === 0) {
            this.messageService.errorBubble('無「專櫃編號修正」資料，無法修正', '專櫃編號修正失敗');
            this.loading = false;
            return;
          }
          // --- 檢查 2 & 3：檢查每一筆資料是否完整且有效 ---
          for (const item of rawDataList) {
            const pluMagNoObj = item.PLU_MagNo as POS2004Item;
            // 檢查 2：是否有輸入（判斷 pluMagNoObj 是否存在且內部關鍵欄位有值）
            const hasValue = pluMagNoObj;
            if (!hasValue) {
              this.messageService.errorBubble('「商品編號/專櫃編號」必填', '儲存失敗');
              this.loading = false;
              return;
            }
            // 檢查 3：是否為有效資料（判斷 PLU_Name 是否有值）
            // 注意：在你的邏輯中，選中後應該會連動帶出 PLU_Name
            if (!(pluMagNoObj.PLU_MagNo || pluMagNoObj.TLT_No)) {
              this.messageService.errorBubble('無對應「商品編號/專櫃編號」，請重新輸入', '儲存失敗');
              this.loading = false;
              return;
            }
          }
          const updatePOS5007List = this.tltnoComp?.tltIdData.map(item => {
            const pluMagNo = item.PLU_MagNo as POS2004Item;
            return {
              POS5007_ID: item.ID,
              TLT_No: item.TLT_No || this.dataForm.getRawValue().TLT_No || '',
              PLU_MagNo: this.store_way === STORE_WAY.專櫃 ? pluMagNo.TLT_No as string : pluMagNo.PLU_MagNo as string || '',
              PLU_No: this.store_way === STORE_WAY.專櫃 ? pluMagNo.TLT_No as string : item.PLU_No as string || '',
              Talent_ID: item.Talent_ID || this.talent_id || 0,
              tlt_id: this.store_way === STORE_WAY.專櫃 ? pluMagNo.tlt_id as string || '0' : item.tlt_id as string || '0',
              PLU_TaxType: this.store_way === STORE_WAY.專櫃 ? item.PLU_TaxType || '1' : '1',
              TXN_DiscCode: this.store_way === STORE_WAY.專櫃 ? pluMagNo.cag_barcode as string || '000' : item.TXN_DiscCode as string || '000',
              Contract_No: this.store_way === STORE_WAY.專櫃 ? pluMagNo.Contract_No as string : item.Contract_No as string || '',
              Contract_SubNo: this.store_way === STORE_WAY.專櫃 ? pluMagNo.Contract_SubNo as string : item.Contract_SubNo as string || ''
            }
          }) || [];
          // 如果沒資料的話就條出錯誤訊息
          if (!updatePOS5007List.length) {
            this.messageService.errorBubble('無「專櫃編號修正」資料，無法修正', '專櫃編號修正失敗');
            this.loading = false; // 確保 loading 狀態被關閉
            return; // 阻止執行後續的 API 呼叫
          }
          const data = {
            ...body,
            EditType: TLS24010_EDIT_TYPE.專櫃編號修正,
            TLTNoEdit: {
              TLT_No: this.dataForm.getRawValue().TLT_No,
              Talent_ID: this.TLT_NoOptions.find(item => item.No === this.dataForm.getRawValue().TLT_No)?.talent_id || this.talent_id || 0,
              Contract_No: this.tltnoComp?.tltIdData[0].Contract_No || '',
              Contract_SubNo: this.tltnoComp?.tltIdData[0].Contract_SubNo || '',
              updatePOS5007List: updatePOS5007List // 使用已檢查通過的列表
            }
          }
          this.tls24010Service.updateTLS24010(data).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
            this.messageService.successBubble(res.Message);
            this.onCancel();
          });
        } else if (this.type === FIX_TYPE.抽成類別修正) {
          const data = {
            ...body,
            EditType: TLS24010_EDIT_TYPE.抽成類別修正,
            TLTIdEditList: this.tltidComp?.tltIdData.map(item => {
              return {
                POS5007_ID: item.ID,
                Talent_ID: item.Talent_ID || this.talent_id || 0,
                tlt_id: item.tlt_id || '0',
              }
            })
          }
          this.tls24010Service.updateTLS24010(data).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
            this.messageService.successBubble(res.Message);
            this.onCancel();
          });
        } else if (this.type === FIX_TYPE.折扣別修正) {
          const data = {
            ...body,
            EditType: TLS24010_EDIT_TYPE.折數修正,
            DiscCodeEditList: this.discodeComp?.discodeData.map(item => {
              return {
                POS5007_ID: item.ID,
                Talent_ID: item.Talent_ID || this.talent_id || 0,
                TXN_DiscCode: item.TXN_DiscCode || '000',
              }
            })
          }
          this.tls24010Service.updateTLS24010(data).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
            this.messageService.successBubble(res.Message);
            this.onCancel();
          });
        } else if (this.type === FIX_TYPE.預售交易修正) {
          const data = {
            ...body,
            EditType: TLS24010_EDIT_TYPE.是否為預售交易修正,
            PreOrderEdit: {
              Talent_ID: this.TLT_NoOptions.find(item => item.No === this.dataForm.getRawValue().TLT_No)?.talent_id || this.talent_id || 0,
              TXN_PreOrder: this.dataForm.getRawValue().TXN_PreOrder
            }
          }
          this.tls24010Service.updateTLS24010(data).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
            this.messageService.successBubble(res.Message);
            this.onCancel();
          });
        } else if (this.type === FIX_TYPE.付款別修正) {
          const payNoData = this.paynoComp?.payNoData || [];

          // 1. 檢查是否至少有一筆支付工具
          if (payNoData.length === 0) {
            this.loading = false;
            return this.messageService.errorBubble('請至少填入一筆支付工具', '支付工具驗證失敗');
          }

          // 2. 計算銷售總額 (POS5007) 與 支付總額 (POS5008)
          const totalSaleAmt = this.ProductDetailList.reduce((sum, item) => sum + (Number(item.TXN_SaleAmt) || 0), 0);
          const totalPayAmt = payNoData.reduce((sum, item) => sum + (Number(item.TXN_PayAmt) || 0), 0);

          // 3. 金額少於檢核
          const diff = totalPayAmt - totalSaleAmt;
          if (totalSaleAmt > 0) {
            if (diff < -0.001) {
              this.loading = false;
              return this.messageService.errorBubble(`支付總額不足，尚差 ${Math.abs(diff).toFixed(2)} 元。`, '金額檢核失敗');
            }
            else if (diff > 0.001) {
              // 溢收檢核 (總金額超過銷售額時)
              const hasOverPay = payNoData.some(item => item.PAY_OverPay === 'Y');
              if (!hasOverPay) {
                this.loading = false;
                return this.messageService.errorBubble('未包含可溢收的付款方式，不可溢收', '付款別檢核失敗');
              }
            }
          }
          // 銷售額 <= 0 (例如負項交易) 時，必須完全平帳，不可溢收
          else if (Math.abs(diff) > 0.001) {
            this.loading = false;
            return this.messageService.errorBubble(`負項交易支付總額 (${totalPayAmt}) 必須等於 銷售總額 (${totalSaleAmt})。`, '金額檢核失敗');
          }
          // 4. 發票金額與支付工具(未開=稅別0)檢核
          const guiBegNo = this.dataForm.getRawValue().TXN_GUIBegNo;

          // 只有在「有填發票號碼」且「不為 00000000」的情況下才檢核
          if (guiBegNo && guiBegNo !== '00000000') {
            const taxType0Sum = payNoData
              .filter(item => item.PAY_TaxType === '0')
              .reduce((sum, item) => sum + (Number(item.TXN_PayAmt) || 0), 0);

            const txnTotGUI = Number(this.dataForm.getRawValue().TXN_TotGUI) || 0;

            if (Math.abs(taxType0Sum - txnTotGUI) > 0.001) {
              this.loading = false;
              return this.messageService.errorBubble(
                `未開支付總額 (${taxType0Sum})不等於發票金額 (${txnTotGUI})`,
                '金額檢核失敗'
              );
            }
          }
          const data = {
            ...body,
            EditType: TLS24010_EDIT_TYPE.付款別修正,
            PayNoEditList: this.paynoComp?.payNoData.map(item => {
              return {
                POS5008_ID: item.ID || 0,
                PAY_No: item.PAY_No || '',
                TXN_PayAmt: item.TXN_PayAmt || 0,
                CRD_Type: item.PAY_Type === '0' ? item.CRD_Type || '' : '',
                CRD_No: item.CRD_No || '',
                TXN_CouponNo: item.TXN_CouponNo || '',
                TXN_PayDesc: item.TXN_PayDesc || '',
                TERM_No: item.PAY_Type === '0' ? Number(item.TERM_No) : 0,
                PAY_OverPay: item.PAY_OverPay ?? null,
              }
            })
          }
          this.tls24010Service.updateTLS24010(data).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
            this.messageService.successBubble(res.Message);
            this.onCancel();
          });
        } else if (this.type === FIX_TYPE.交易資料作廢) {
          let finalSelectedDate = new Date(); // 預設為現在時間
          const selectedDate = result?.data?.selectedDate;
          if (!this.isValidVoidDate(selectedDate, rowData.TXN_Date)) { this.loading = false; return }
          finalSelectedDate = new Date(selectedDate);
          const data = {
            ...body,
            EditType: TLS24010_EDIT_TYPE.交易資料作廢,
            VoidEdit: {
              Void_Date: this.datePipe.transform(finalSelectedDate, 'yyyy-MM-dd') || '',
              Void_Time: this.datePipe.transform(finalSelectedDate, 'HH:mm:ss') || '',
            }
          };
          this.tls24010Service.updateTLS24010(data).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
            this.messageService.successBubble(res.Message);
            this.onCancel();
          });
        }
      }
    });
  }

  /**
 * 判斷作廢是否跨期 (模擬後端邏輯)
 * 根據台灣發票每兩個月一期的規則判斷。
 * @param orgDateString 原始日期的字串 (例如 'YYYY-MM-DD')
 * @returns boolean 是否跨期
 */
  private isCrossPeriod(orgDateString: string): boolean {
    // 原始日期
    const orgDate = new Date(orgDateString);
    const orgYear = orgDate.getFullYear();
    // Month 是 0-11，所以不用減 1
    // (Month / 2) + 1 即可得到期數 (1月-2月是第1期, 3月-4月是第2期, ...)
    const orgPeriod = Math.floor(orgDate.getMonth() / 2) + 1;

    // 作廢日期 (現在時間)
    const voidDate = new Date();
    const voidYear = voidDate.getFullYear();
    const voidPeriod = Math.floor(voidDate.getMonth() / 2) + 1;

    // 年度或期數不同即為跨期
    return orgYear !== voidYear || orgPeriod !== voidPeriod;
  }
  onProductTotalChange(total: number) {
    const controls = this.dataForm.controls;
    const isNegative = total < 0;

    if (isNegative) {
      controls.ORG_TXN_Date.setValidators([Validators.required]);
      controls.ORG_ECR_No.setValidators([Validators.required]);
    } else {
      controls.ORG_TXN_Date.clearValidators();
      controls.ORG_ECR_No.clearValidators();
    }
    controls.ORG_TXN_Date.updateValueAndValidity();
    controls.ORG_ECR_No.updateValueAndValidity();
    if (this.isFormCreateable || this.type === FIX_TYPE.付款別修正) {
      this.updateTxnTotGUI(); // 更新(未開)發票金額
    }
  }

  get currentTotalSaleAmt(): number {
    return this.pos5007Comp?.POS5007Data.reduce((sum, item) => sum + (Number(item.TXN_SaleAmt) || 0), 0) || 0;
  }
  renderComponent = true;
  onClear() {
    this.loadInitialData();
  }

  /** 自動計算(未開)發票金額 */
  updateTxnTotGUI() {
    const guiBegNo = this.dataForm.controls.TXN_GUIBegNo.value;

    // 如果發票號碼沒填或是填 '00000000'，發票金額直接給 0
    if (!guiBegNo || guiBegNo === '00000000') {
      this.dataForm.controls.TXN_TotGUI.setValue(0, { emitEvent: false });
      return;
    }

    let txnTotSaleAmt = 0;
    let txnTotHaveTax = 0;

    if (this.isFormCreateable) {
      // --- 情境 1：新增 ---
      // 取得銷售總額
      txnTotSaleAmt = this.currentTotalSaleAmt;

      // 取得稅別為 '1' 的支付總額 (從 pos5008Comp)
      const pos5008DataList = this.pos5008Comp?.POS5008Data || [];

      txnTotHaveTax = pos5008DataList.reduce((sum, item, index) => {
        // 只有被勾選且稅別為 '1' 的才加總
        if (item.selected && item.PAY_TaxType === '1') {
          const formGroup = this.pos5008Comp?.posFormArrayControls[index];
          const payAmt = Number(formGroup?.get('TXN_PayAmt')?.value) || 0;
          return sum + payAmt;
        }
        return sum;
      }, 0);

    } else if (this.type === this.EDIT_TYPES.PAY_NO) {
      // --- 情境 2：付款別修正 ---
      // 取得銷售總額 (編輯狀態下商品不變，直接從 ProductDetailList 加總)
      txnTotSaleAmt = this.ProductDetailList.reduce((sum, item) => sum + (Number(item.TXN_SaleAmt) || 0), 0);
      // 取得稅別為 '1' 的支付總額 (從 paynoComp)
      const payNoData = this.paynoComp?.payNoData || [];
      txnTotHaveTax = payNoData
        .filter(item => item.PAY_TaxType === '1')
        .reduce((sum, item) => sum + (Number(item.TXN_PayAmt) || 0), 0);
    }
    // 套用公式： 總銷售額-已開總金額
    const totGUI = Math.max(0, txnTotSaleAmt - txnTotHaveTax);
    // 更新 FormControl
    this.dataForm.controls.TXN_TotGUI.setValue(totGUI, { emitEvent: false });
  }
}


