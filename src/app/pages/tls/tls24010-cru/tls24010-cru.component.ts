import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { formatTimeToHHMMSS } from '@shared/componentkit/table/table.model';
import { BlockUIModule } from 'primeng/blockui';
import { CalendarModule } from 'primeng/calendar';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { POS5007Data, POS5008Data, TLS24010Data, Tls24010Service } from '../../../service/api/tls/tls24010.service';
import { DropDownListService, IDropdownItem, POS2004Item } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextareaComponent } from "../../../shared/componentkit/input-textarea/input-textarea.component";
import { RadiobuttonYNComponent } from '../../../shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { FIX_TYPE, FIX_TYPE_LABEL } from '../tls24010/tls24010.model';
import { InputTextComponent } from './../../../shared/componentkit/input-text/input-text.component';
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
    NgIf,
    AsyncPipe,
    TranslateModule,
    InputTextComponent,
    InputTextareaComponent,
    RadiobuttonYNComponent,
    DropdownComponent,
    DividerModule,
    TableModule,
    InputNumberModule,
    InputTextModule,
    DropdownModule,
    Tls24010Pos5008Component,
    Tls24010Pos5007Component,
    Tls24010PaynoComponent,
    Tls24010TltidComponent,
    Tls24010TltnoComponent,
    Tls24010DiscodeComponent,
    CalendarModule,
    BlockUIModule,
    ProgressSpinnerModule
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
    TXN_Remark: ['', [Validators.maxLength(20)]],                           //備註
    USR_No: ['8888888', [Validators.required, Validators.maxLength(16)]], //收銀員編號POS2001.USR_No
    TXN_PreOrder: ['N', [Validators.required]], //預售 是/否
    TXN_VIP: ['N', [Validators.required]], //零稅 是/否,YN。若為y，TXN_TaxType變成2
    TXN_TaxFreeCertNo: [{ value: null, disabled: true }], // 免稅卡零稅卡號= 免稅證證號 欄位
    TXN_Status: ['N'],                                                    //交易狀態 (一般交易=N, 退貨交易=E, 作廢交易=D)
    GUI_Track: ['', [Validators.maxLength(2), Validators.minLength(2), this.validationService.alphanumericValidator]], //發票字軌
    TXN_GUIBegNo: ['', [Validators.maxLength(8), Validators.minLength(8), this.validationService.numberValidator]], //起始發票號碼
    TXN_GUIEndNo: [''], //結束發票號碼
    TXN_CustCnt: [1, [Validators.required, Validators.min(1), Validators.max(9999)]], //來客數
    TXN_MemCard: ['', [Validators.maxLength(30), this.validationService.alphanumericValidator]], //會員編號，若有資料需要串接環友
    TXN_Uniform: ['', [Validators.maxLength(8)]], //客戶統一編號 可以為空
    TXN_Time: [null as Date | null], //銷售時段今日的時間
    ORG_TXN_Date: [null as Date | null], //原交易日期
    ORG_ECR_No: [null as string | null], //原收銀機台
    TXN_GUI_CarrType: [null as string | null], //電子載具種類=電子發票載具類別 悠遊載具卡=1K0001、手機條碼=3J0002、自然人憑證=CQ0001、一卡通載具=1H0001、信用卡載具=EK0002、#=取消載具
    TXN_GUIVehicle: [{ value: null, disabled: true }, [Validators.maxLength(20), guiVehicleValidator]], //電子發票載具卡號 若有值則 TXN_GUI_CarrType 固定為3J0002，TXN_GUI_CarrId與TXN_GUI_CarrIdEx內容與此欄位相同
    TXN_GUI_CarrIdEx: [{ value: null, disabled: true }, [Validators.maxLength(64)]], //電子發票載具ID顯碼
    TXN_GUI_CarrId: [{ value: null, disabled: true }, [Validators.maxLength(64)]], //電子發票載具ID隱碼
    TXN_GUIRemark: ['', [Validators.maxLength(4), this.validationService.alphanumericValidator]], //電子發票防偽隨機碼 由系統依據自訂公式計算取得
    TXN_PrintTimes: [0], //紙本發票列印狀態(若列印電子發票紙本證明連則為1，其他則為0) 顯示 是/否
    TXN_GUI_Donate: ['N'], //發票捐贈狀態，Y=是、N=否
    TXN_GUILoveCode: [{ value: null, disabled: true }], //捐贈社福團體代碼，若TXN_GUI_Donate為Y，則必須輸入此欄位
  });
  ECR_NoOptions = this.dropDown.queryPos1002();     //dropdown 下拉選單 收銀機號
  USR_NoOptions = this.dropDown.queryPos2001();     //dropdown 下拉選單 收銀員
  txnStatusOptions = txnStatusOptions               //dropdown 下拉選單 交易型態
  TXN_GUI_CarrTypeOptions = TXN_GUI_CarrTypeOptions;//dropdown 下拉選單 電子載具種類
  TLT_NoOptions: IDropdownItem[] = [];              //dropdown 下拉選單 專櫃編號
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly validationService: ValidationService,
    private readonly tls24010Service: Tls24010Service,
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS24010', this.dataForm);
    const rowDataTyped = this.rowdata as TLS24010Data;
    this.TXN_GUIPaper = rowDataTyped.TXN_GUIPaper ?? this.queryData.TXN_GUIPaper;
    this.TLT_Name = rowDataTyped.TLT_Name;
    this.store_way = rowDataTyped.store_way;
    const titleName = this.isFormCreateable ? '新增補登資訊' : FIX_TYPE_LABEL[this.type!];
    this.formTitle = (this.store_way === STORE_WAY.專櫃 ? '(專櫃)' : '(自營)') + titleName;
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
    // 編輯時候
    if (this.isFormEditable) {
      this.type = rowDataTyped?.type as FIX_TYPE;
      this.dataForm.get('TXN_Remark')?.enable();
    }
    // 不是新增時候
    if (!this.isFormCreateable) {
      this.dataForm.disable();
      const body = {
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo ?? '',
        TXN_Date: rowDataTyped.TXN_Date,
        ECR_No: rowDataTyped.ECR_No,
        TXN_No: Number(rowDataTyped.TXN_No),
      }
      this.tls24010Service.queryTLS24010_Detail(body).pipe(untilDestroyed(this)).subscribe((data) => {
        this.ProductDetailList = data.Data[0].ProductDetailList;
        this.PaymentDetailsList = data.Data[0].PaymentDetailsList;
      })
    }
    // 檢查是否開立業主發票 (rece_yn)
    if (this.rece_yn !== 'Y') {
      this.dataForm.get('TXN_TaxFreeCertNo')?.disable();
      this.dataForm.get('TXN_GUIRemark')?.disable();
    }
    this.listenForChanges();
    if (this.type === FIX_TYPE.預售交易修正) {
      this.dataForm.get('TXN_PreOrder')?.enable();
    }
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
    // 4. 監聽 發票捐贈狀態 (TXN_GUI_Donate)
    controls.TXN_GUI_Donate.valueChanges.pipe(untilDestroyed(this)).subscribe(val => {
      toggleRequired(controls.TXN_GUILoveCode, val === 'Y', 20);
    });
    // 5. 監聽 發票字軌 (GUI_Track) -> 自動轉大寫
    controls.GUI_Track.valueChanges.pipe(untilDestroyed(this)).subscribe(val => {
      if (typeof val === 'string' && val !== val.toUpperCase()) {
        controls.GUI_Track.setValue(val.toUpperCase(), { emitEvent: false });
      }
    });
  }
  onSubmit(frm: FormGroup) {
    if (this.isFormEditable) {
      this.updateTLS24010();
      return;
    }
    this.handleSubmit(frm, () => {
      this.loading = false;
      this.pos5007Comp?.POS5007Data.forEach(item => {
        if (item.TXN_Qty === null || item.TXN_Qty === undefined) {
          this.messageService.errorBubble('請輸入正確的銷售數量', '銷售數量必須有值');
          return
        }
        if (item.TXN_SaleAmt === null || item.TXN_SaleAmt === undefined) {
          this.messageService.errorBubble('請輸入正確的單價金額', '銷售數量必須有值');
          return
        }
      });
      if (this.pos5008Comp?.POS5008SelectedItems.length === 0) {
        this.messageService.errorBubble('請至少選擇一筆支付工具', '支付工具必須選擇');
        return
      }
      const childValid = this.pos5008Comp?.validate();
      if (!childValid) {
        this.messageService.errorBubble('支付工具資料不完整', '請檢查支付工具資料');
        return;
      }
      // 計算TXN_SaleAmt總計
      const pos5007Data = this.pos5007Comp?.POS5007Data ?? [];
      const pos5008Data = this.pos5008Comp?.POS5008Data.map((item, i) => {
        const formGroup = this.pos5008Comp?.posFormArrayControls[i];
        return { ...item, ...formGroup?.getRawValue() };
      }).filter(item => item.selected) ?? [];
      // === 開始支付邏輯卡控 ===
      // 1. 計算銷售總金額 (TXN_SaleAmt 總計)
      const totalSaleAmt = pos5007Data.reduce((sum, item) => sum + (Number(item.TXN_SaleAmt) || 0), 0);
      // ==========================================================
      // 【新增邏輯：檢查銷售總金額是否超過最大位數限制 (10 位)】
      // ==========================================================
      const MAX_SALE_AMT_INTEGER_DIGITS = 10;
      // 步驟 A: 取得總金額的絕對值
      const absoluteTotalSaleAmt = Math.abs(totalSaleAmt);
      // 步驟 B: 檢查整數部分的長度
      // 1. 取整數部分 Math.floor(absoluteTotalSaleAmt)
      // 2. 轉換為字串 .toString()
      // 3. 取得長度 .length
      const integerLength = Math.floor(absoluteTotalSaleAmt).toString().length;
      if (integerLength > MAX_SALE_AMT_INTEGER_DIGITS) {
        this.loading = false;
        return this.messageService.errorBubble(
          `銷售總金額 ( ${totalSaleAmt} ) 超過系統允許的最大值 (${MAX_SALE_AMT_INTEGER_DIGITS} 位數)。`,
          '金額超出限制'
        );
      }
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
            TXN_Date: this.datePipe.transform(this.dataForm.getRawValue().TXN_Date, 'yyyy-MM-dd'),
            GUI_Track: frm.getRawValue().GUI_Track || '00',
            TXN_GUIBegNo: frm.getRawValue().TXN_GUIBegNo || '00000000',
            TXN_GUIEndNo: frm.getRawValue().TXN_GUIEndNo || '00000000',
            TXN_No: this.isFormCreateable ? undefined : frm.getRawValue().TXN_No,
            TXN_Time: frm.getRawValue().TXN_Time ? formatTimeToHHMMSS(frm.getRawValue().TXN_Time) : '00:00:00',
            POS5007_INFO: pos5007Data.map((item) => {
              if (typeof item.PLU_MagNo === 'object' && item.PLU_MagNo !== null) {
                return {
                  PLU_MagNo: item.PLU_MagNo.PLU_MagNo,
                  PLU_No: item.PLU_MagNo.PLU_No,
                  TXN_Qty: item.TXN_Qty,
                  PLU_SalePrc: item.PLU_SalePrc,
                  TXN_Disc: item.TXN_Disc || 0,
                  TXN_SaleAmt: item.TXN_SaleAmt,
                  tlt_id: item.tlt_id || '0',
                  PLU_TaxType: item.PLU_TaxType || '1',
                  TXN_DiscCode: item.TXN_DiscCode || '000'
                };
              }
              return item;
            }),
            POS5008_INFO: pos5008Data.map((item) => {
              return {
                PAY_No: item.PAY_No,
                TXN_PayAmt: item.TXN_PayAmt,
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
                accept: () => {
                  this.onCancel();
                }
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
      message: this.type === FIX_TYPE.交易資料作廢 ? (isCross ? '此筆交易已跨期，需進行開立折讓單作業。確定要開立折讓單嗎?' : '此筆交易未跨期，確定要作廢交易資料嗎?') : `確定要${FIX_TYPE_LABEL[this.type!]}嗎?`,
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
          const updatePOS5007List = this.tltnoComp?.tltIdData.map(item => {
            const pluMagNo = item.PLU_MagNo as POS2004Item;
            return {
              POS5007_ID: item.ID,
              TLT_No: item.TLT_No || '',
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
          const invalidItem = updatePOS5007List.find(item => {
            return !item.PLU_No || !item.TLT_No || !item.PLU_MagNo || !item.Contract_No || !item.Contract_SubNo;
          });

          if (invalidItem) {
            this.messageService.errorBubble('無效的「商品編號/專過編號」或 資料尚未異動', '無法修正');
            this.loading = false; // 確保 loading 狀態被關閉
            return; // 阻止執行後續的 API 呼叫
          }
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
}


