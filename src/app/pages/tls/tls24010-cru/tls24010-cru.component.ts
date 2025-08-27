import { InputTextComponent } from './../../../shared/componentkit/input-text/input-text.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { POS5007Data, POS5008Data, TLS24010Data, Tls24010Service } from '../../../service/api/tls/tls24010.service';
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
import { DropDownListService, IDropdownItem, POS2004Item } from '../../../service/utility/dropDownList.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { STORE_WAY, TLS24010_EDIT_TYPE, TXN_GUI_CarrTypeOptions, txnStatusOptions } from './tls24010-cru.model';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { Tls24010Pos5008Component } from './tls24010-pos5008/tls24010-pos5008.component';
import { Tls24010Pos5007Component } from './tls24010-pos5007/tls24010-pos5007.component';
import { finalize, tap } from 'rxjs';
import { formatTimeToHHMMSS } from '@shared/componentkit/table/table.model';
import { Tls24010PaynoComponent } from './tls24010-payno/tls24010-payno.component';
import { Tls24010TltidComponent } from './tls24010-tltid/tls24010-tltid.component';
import { Tls24010TltnoComponent } from './tls24010-tltno/tls24010-tltno.component';
import { FIX_TYPE, FIX_TYPE_LABEL } from '../tls24010/tls24010.model';
import { Tls24010DiscodeComponent } from './tls24010-discode/tls24010-discode.component';
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
    Tls24010DiscodeComponent
  ],
})
export class TLS24010CRUComponent extends BasicCruPageComponent<TLS24010Data | unknown> implements OnInit {
  @ViewChild(Tls24010Pos5007Component) pos5007Comp?: Tls24010Pos5007Component;
  @ViewChild(Tls24010Pos5008Component) pos5008Comp?: Tls24010Pos5008Component;
  type?: string;
  TXN_GUIPaper?: string; // 補登類別 補原機台='E' 手開二聯式發票='2'
  TLT_Name?: string; //專櫃名稱
  store_way?: string // 1為專櫃 2=自營
  talent_id?: number; //專櫃編號
  TLT_No?: string; //專櫃編號
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
    GUI_Track: ['', [Validators.required, Validators.maxLength(2), Validators.minLength(2), this.validationService.alphanumericValidator]], //發票字軌
    TXN_GUIBegNo: ['', [Validators.required, Validators.maxLength(8), Validators.minLength(8), this.validationService.numberValidator]], //起始發票號碼
    TXN_GUIEndNo: ['', [Validators.maxLength(8), Validators.minLength(8)]], //結束發票號碼
    TXN_CustCnt: [1, [Validators.required, Validators.min(1), Validators.max(9999)]], //來客數
    TXN_MemCard: ['', [Validators.maxLength(30)]], //會員編號，若有資料需要串接環友
    TXN_Uniform: ['', [Validators.maxLength(8)]], //客戶統一編號 可以為空
    TXN_Time: [null, [Validators.required]], //銷售時段
    TXN_GUI_CarrType: [''], //電子載具種類=電子發票載具類別 悠遊載具卡=1K0001、手機條碼=3J0002、自然人憑證=CQ0001、一卡通載具=1H0001、信用卡載具=EK0002、#=取消載具
    TXN_GUIVehicle: [{ value: null, disabled: true }, [Validators.maxLength(20)]], //電子發票載具卡號 若有值則 TXN_GUI_CarrType 固定為3J0002，TXN_GUI_CarrId與TXN_GUI_CarrIdEx內容與此欄位相同
    TXN_GUI_CarrIdEx: [{ value: null, disabled: true }, [Validators.maxLength(64)]], //電子發票載具ID顯碼
    TXN_GUI_CarrId: [{ value: null, disabled: true }, [Validators.maxLength(64)]], //電子發票載具ID隱碼
    TXN_GUIRemark: [{ value: '系統自動產生', disabled: true }], //電子發票防偽隨機碼 由系統依據自訂公式計算取得
    TXN_PrintTimes: [null], //紙本發票列印狀態(若列印電子發票紙本證明連則為1，其他則為0) 顯示 是/否
    TXN_GUI_Donate: ['N'], //發票捐贈狀態，Y=是、N=否
    TXN_GUILoveCode: [{ value: null, disabled: true }], //捐贈社福團體代碼，若TXN_GUI_Donate為Y，則必須輸入此欄位
  });
  USR_NoOptions: IDropdownItem[] = []; //下拉選單 收銀員編號
  txnStatusOptions = txnStatusOptions //下拉選單 交易型態
  TXN_GUI_CarrTypeOptions = TXN_GUI_CarrTypeOptions;//下拉選單 電子載具種類
  TLT_NoOptions: IDropdownItem[] = [];
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly validationService: ValidationService,
    private readonly tls24010Service: Tls24010Service,
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS24010', this.dataForm);
    const rowDataTyped = this.rowdata as TLS24010Data;
    this.TXN_GUIPaper = rowDataTyped.TXN_GUIPaper
    this.TLT_Name = rowDataTyped.TLT_Name;
    this.store_way = rowDataTyped.store_way;
    this.talent_id = rowDataTyped.talent_id;
    const TXN_Date = this.dataForm.get('TXN_Date')?.value;
    if (TXN_Date) {
      this.dropDownListService.queryTLTTALENT_ByContractDate_DropDownList(TXN_Date).pipe(untilDestroyed(this)).subscribe(options => {
        this.TLT_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
      });
    }
    if (this.isFormCreateable) {
      this.dataForm.patchValue({
        TXN_Date: rowDataTyped.TXN_Date,
        ECR_No: rowDataTyped.ECR_No,
        TLT_No: rowDataTyped.TLT_No,
      });
    }
    if (this.isFormEditable) {
      this.type = rowDataTyped?.type;
      this.dataForm.get('TXN_Remark')?.enable();
    }
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
    // 查詢收銀員設定檔(POS2001)
    this.dropDownListService.queryPOS2001_DropDownList().pipe(untilDestroyed(this)).subscribe((data) => {
      this.USR_NoOptions = data.Data.map((item) => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
    this.listenForChanges();
    if (this.type === FIX_TYPE.專櫃編號修正) {
      if (this.store_way === STORE_WAY.專櫃) {
        this.dataForm.get('TLT_No')?.enable();
      }
    } else if (this.type === FIX_TYPE.預售交易修正) {
      this.dataForm.get('TXN_PreOrder')?.enable();
    }
  }
  listenForChanges() {
    const txnVipControl = this.dataForm.get('TXN_VIP');
    const taxFreeCertNoControl = this.dataForm.get('TXN_TaxFreeCertNo');
    const txnGuiCarrTypeControl = this.dataForm.get('TXN_GUI_CarrType');
    const txnGuiVehicleControl = this.dataForm.get('TXN_GUIVehicle');
    const txnGuiCarrIdExControl = this.dataForm.get('TXN_GUI_CarrIdEx');
    const txnGuiCarrIdControl = this.dataForm.get('TXN_GUI_CarrId');
    const txnGuiDonateControl = this.dataForm.get('TXN_GUI_Donate');
    const txnGuiLoveCodeControl = this.dataForm.get('TXN_GUILoveCode');
    const guiTrackControl = this.dataForm.get('GUI_Track');
    // 監聽 零稅 的變化
    txnVipControl?.valueChanges.pipe(untilDestroyed(this)).subscribe(begNoValue => {
      if (begNoValue === 'Y') {
        taxFreeCertNoControl?.setValidators([Validators.required, Validators.maxLength(10)]);
        taxFreeCertNoControl?.enable();
      } else {
        taxFreeCertNoControl?.clearValidators();
        taxFreeCertNoControl?.disable();
        taxFreeCertNoControl?.setValue(null);
      }
      taxFreeCertNoControl?.updateValueAndValidity();
    })
    // 監聽 電子載具種類 的變化
    txnGuiCarrTypeControl?.valueChanges.pipe(untilDestroyed(this), tap(() => { // 使用 tap 進行副作用操作
      txnGuiCarrIdExControl?.disable();
      txnGuiCarrIdControl?.setValue(null, { emitEvent: false });
      txnGuiCarrIdExControl?.setValue(null, { emitEvent: false });
      txnGuiVehicleControl?.disable();
      txnGuiVehicleControl?.setValue(null, { emitEvent: false });
    })).subscribe(carrType => {
      if (carrType && carrType.trim() !== '') {
        txnGuiCarrIdExControl?.enable();
      }
      if (carrType === '3J0002') {
        txnGuiVehicleControl?.enable();
      }
    });
    // 監聽 載具編號顯碼 的變化
    txnGuiCarrIdExControl?.valueChanges.pipe(untilDestroyed(this)).subscribe(val => {
      txnGuiCarrIdControl?.setValue(val, { emitEvent: false });
    });
    // 監聽 發票捐贈狀態 的變化
    txnGuiDonateControl?.valueChanges.pipe(untilDestroyed(this)).subscribe(donateValue => {
      txnGuiLoveCodeControl?.setValue(null, { emitEvent: false });
      if (donateValue === 'Y') {
        txnGuiLoveCodeControl?.setValidators([Validators.required, Validators.maxLength(20)]);
        txnGuiLoveCodeControl?.enable();
      } else {
        txnGuiLoveCodeControl?.clearValidators();
        txnGuiLoveCodeControl?.disable();
        txnGuiLoveCodeControl?.setValue(null); // 清除值
      }
      txnGuiLoveCodeControl?.updateValueAndValidity(); // 更新驗證狀態
    });
    guiTrackControl?.valueChanges.pipe(untilDestroyed(this)).subscribe(trackValue => {
      if (trackValue && typeof trackValue === 'string') {
        const upperCaseValue = trackValue.toUpperCase();
        guiTrackControl.setValue(upperCaseValue, { emitEvent: false });
      }
    });
  }
  onSubmit(frm: FormGroup) {
    if (this.isFormEditable) {
      this.updateTLS24010();
      return;
    }
    this.handleSubmit(frm, () => {
      this.pos5007Comp?.POS5007Data.forEach(item => {
        if (item.TXN_Qty === null || item.TXN_Qty === undefined || item.TXN_Qty <= 0) {
          this.messageService.errorBubble('請輸入正確的銷售數量', '銷售數量必須大於1');
          this.loading = false;
          return
        }
      });
      if (this.pos5008Comp?.POS5008SelectedItems.length === 0) {
        this.messageService.errorBubble('請至少選擇一筆支付工具', '支付工具必須選擇');
        this.loading = false;
        return
      }
      const childValid = this.pos5008Comp?.validate();
      if (!childValid) {
        this.messageService.errorBubble('支付工具資料不完整', '請檢查支付工具資料');
        this.loading = false;
        return;
      }
      // 計算TXN_SaleAmt總計
      const pos5007total = this.pos5007Comp?.POS5007Data.reduce((total, item) => total + (item.TXN_SaleAmt ? item.TXN_SaleAmt : 0), 0);
      const pos5007Data = this.pos5007Comp?.POS5007Data ?? [];
      const pos5008Data = this.pos5008Comp?.POS5008Data.map((item, i) => {
        const formGroup = this.pos5008Comp?.posFormArrayControls[i];
        return {
          ...item,
          ...formGroup?.getRawValue()
        };
      }).filter(item => item.selected) ?? [];
      const pos5008total = pos5008Data.reduce((total, item) => total + (item.TXN_PayAmt ? item.TXN_PayAmt : 0), 0);
      if (pos5008total !== pos5007total) {
        this.messageService.errorBubble('支付工具資料與商品總金額不符', '請檢查支付工具資料');
        this.loading = false;
        return
      }
      this.messageService.confirm({
        header: '確認',
        message: `確定要新增嗎?`,
        accept: () => {
          const body = {
            Store_way: this.store_way,
            TXN_GUIPaper: this.TXN_GUIPaper,
            ...frm.getRawValue(),
            TXN_GUIRemark: undefined,
            TXN_No: this.isFormCreateable ? undefined : frm.getRawValue().TXN_No,
            TXN_Time: formatTimeToHHMMSS(frm.getRawValue().TXN_Time),
            POS5007_INFO: pos5007Data.map((item) => {
              if (typeof item.PLU_MagNo === 'object' && item.PLU_MagNo !== null) {
                return {
                  PLU_MagNo: item.PLU_MagNo.PLU_MagNo,
                  PLU_No: item.PLU_MagNo.PLU_No,
                  TXN_Qty: item.TXN_Qty,
                  PLU_SalePrc: item.PLU_SalePrc,
                  TXN_Disc: item.TXN_Disc,
                  TXN_SaleAmt: item.TXN_SaleAmt,
                  tlt_id: item.tlt_id,
                  PLU_TaxType: item.PLU_TaxType,
                  TXN_DiscCode: item.TXN_DiscCode
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
          this.tls24010Service.insertTLS24010(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
            this.messageService.successBubble(res.Message);
            this.onCancel();
          });
        }
      });
    });
  }
  @ViewChild(Tls24010TltnoComponent) tltnoComp?: Tls24010TltnoComponent;
  @ViewChild(Tls24010TltidComponent) tltidComp?: Tls24010TltidComponent;
  @ViewChild(Tls24010DiscodeComponent) discodeComp?: Tls24010DiscodeComponent;
  @ViewChild(Tls24010PaynoComponent) paynoComp?: Tls24010PaynoComponent;
  updateTLS24010() {
    this.messageService.confirm({
      header: FIX_TYPE_LABEL[this.type as FIX_TYPE],
      message: `確定要修正嗎?`,
      accept: () => {
        this.loading = true;
        const rowData = this.rowdata as TLS24010Data;
        const body = {
          Store_way: this.store_way || '',
          SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
          // 把TXN_Date轉成字串YYYY-MM-DD
          TXN_Date: this.dataForm.getRawValue().TXN_Date,
          ECR_No: this.dataForm.getRawValue().ECR_No,
          TXN_No: Number(this.dataForm.getRawValue().TXN_No),
          POS5006_ID: rowData.ID,
          TXN_Remark: this.dataForm.getRawValue().TXN_Remark,
        }
        if (this.type === FIX_TYPE.專櫃編號修正) {
          const data = {
            ...body,
            EditType: TLS24010_EDIT_TYPE.專櫃編號修正,
            TLTNoEdit: {
              TLT_No: this.dataForm.getRawValue().TLT_No,
              Talent_ID: this.TLT_NoOptions.find(item => item.No === this.dataForm.getRawValue().TLT_No)?.talent_id || this.talent_id || 0,
              Contract_No: this.tltnoComp?.tltIdData[0].Contract_No || '',
              Contract_SubNo: this.tltnoComp?.tltIdData[0].Contract_SubNo || '',
              updatePOS5007List: this.tltnoComp?.tltIdData.map(item => {
                return {
                  POS5007_ID: item.ID,
                  TLT_No: this.dataForm.getRawValue().TLT_No,
                  PLU_MagNo: this.store_way === STORE_WAY.專櫃 ? (item.PLU_MagNo as POS2004Item).TLT_No as string : item.PLU_MagNo as string || '',
                  PLU_No: this.store_way === STORE_WAY.專櫃 ? (item.PLU_MagNo as POS2004Item).TLT_No as string : item.PLU_No as string || '',
                  Talent_ID: item.Talent_ID || this.talent_id || 0,
                  tlt_id: this.store_way === STORE_WAY.專櫃 ? (item.PLU_MagNo as POS2004Item).tlt_id as string : item.tlt_id as string || '',
                  PLU_TaxType: this.store_way === STORE_WAY.專櫃 ? item.PLU_TaxType : undefined,
                  TXN_DiscCode: this.store_way === STORE_WAY.專櫃 ? (item.PLU_MagNo as POS2004Item).cag_barcode as string : item.TXN_DiscCode as string || '',
                  Contract_No: this.store_way === STORE_WAY.專櫃 ? (item.PLU_MagNo as POS2004Item).Contract_No as string : item.Contract_No as string || '',
                  Contract_SubNo: this.store_way === STORE_WAY.專櫃 ? (item.PLU_MagNo as POS2004Item).Contract_SubNo as string : item.Contract_SubNo as string || ''
                }
              }) || []
            }
          }
          this.tls24010Service.updateTLS24010(data).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
            this.messageService.successBubble(res.Message);
          });
        } else if (this.type === FIX_TYPE.抽成類別修正) {
          const data = {
            ...body,
            EditType: TLS24010_EDIT_TYPE.抽成類別修正,
            TLTIdEditList: this.tltidComp?.tltIdData.map(item => {
              return {
                POS5007_ID: item.ID,
                Talent_ID: item.Talent_ID || this.talent_id || 0,
                tlt_id: item.tlt_id || '',
              }
            })
          }
          this.tls24010Service.updateTLS24010(data).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
            this.messageService.successBubble(res.Message);
          });
        } else if (this.type === FIX_TYPE.折扣別修正) {
          const data = {
            ...body,
            EditType: TLS24010_EDIT_TYPE.折數修正,
            DiscCodeEditList: this.discodeComp?.discodeData.map(item => {
              return {
                POS5007_ID: item.ID,
                Talent_ID: item.Talent_ID || this.talent_id || 0,
                TXN_DiscCode: item.TXN_DiscCode || '',
              }
            })
          }
          this.tls24010Service.updateTLS24010(data).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
            this.messageService.successBubble(res.Message);
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
                CRD_No: item.PAY_Type === '0' ? item.CRD_NoTXN_CouponNoTXN_PayDesc || '' : '',
                TXN_CouponNo: item.PAY_Type !== '0' && item.PAY_Type !== 'A' ? item.CRD_NoTXN_CouponNoTXN_PayDesc || '' : '',
                TXN_PayDesc: item.PAY_Type === 'A' ? item.CRD_NoTXN_CouponNoTXN_PayDesc || '' : '',
                TERM_No: item.PAY_Type === '0' ? Number(item.TERM_No) : 0,
              }
            })
          }
          this.tls24010Service.updateTLS24010(data).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
            this.messageService.successBubble(res.Message);
          });
        } else if (this.type === FIX_TYPE.交易資料作廢) {
          const data = {
            ...body,
            EditType: TLS24010_EDIT_TYPE.交易資料作廢,
          }
          this.tls24010Service.updateTLS24010(data).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
            this.messageService.successBubble(res.Message);
          });
        }
      }
    });
  }
}


