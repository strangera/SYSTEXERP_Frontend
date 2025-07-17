//!!! 交易稅別 選應稅 商品明細一定要有一筆為應稅 卡控
//!!! 零稅的話 商品明細全部的稅別顯示免稅
import { InputTextComponent } from './../../../shared/componentkit/input-text/input-text.component';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
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
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { CRD_TypeOptions, POS5007Columns, POS5007Columns2, POS5008Columns, TXN_GUI_CarrTypeOptions, txnStatusOptions, txnTaxTypeOptions, txnTaxTypeOptions2 } from './tls24010-cru.model';
import { Column } from '../../../shared/componentkit/table/table.model';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { SystemOptionsService } from '../../../service/system/sys1000.service';
import { SystemOption } from '../../../shared/models/sys/sys1000.model';
@Component({
  selector: 'app-tls24010-cru',
  templateUrl: './tls24010-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputNumberComponent, NgIf, TranslateModule, InputTextComponent, InputTextareaComponent, RadiobuttonYNComponent, DropdownComponent, TableComponent, DividerModule, TableModule, InputNumberModule, InputTextModule, DropdownModule],
})
export class TLS24010CRUComponent extends BasicCruPageComponent<TLS24010Data | unknown> implements OnInit, AfterViewInit {
  // 定義tableComponent
  @ViewChild('POS5007Table') POS5007Table!: TableComponent;
  store_way?: string // 1為專櫃 2=自營
  TXN_GUIPaper?: string; // 補登類別 補原機台='E' 手開二聯式發票='2'
  dataForm = this.formBuilder.nonNullable.group({
    TXN_Date: [{ value: '', disabled: true }],           //disabled 銷售日期
    ECR_No: [{ value: '', disabled: true }],             //disabled 收銀機號 pos1002.ecr_no
    TLT_No: [{ value: '', disabled: true }],             //disabled 專櫃編號
    TXN_No: [{ value: '系統自動產生', disabled: true }],  //disabled 交易序號
    TXN_Desc: ['', [Validators.maxLength(20)]],                           //備註
    USR_No: ['8888888', [Validators.required, Validators.maxLength(16)]], //收銀員編號POS2001.USR_No
    TXN_Status: ['N'],                                                    //交易狀態 (一般交易=N, 退貨交易=E, 作廢交易=D)
    TXN_VIP: ['N'], //零稅 是/否,YN。若為y，TXN_TaxType變成2
    TXN_PreOrder: ['N', [Validators.required]], //預售 是/否
    TXN_Mode: [{ value: 'P', disabled: true }], //交易模式 固定為P=事後登錄 (隱藏)
    TXN_Uniform: ['', [Validators.maxLength(8)]], //客戶統一編號 可以為空
    GUI_Track: ['', [Validators.required, Validators.maxLength(2), Validators.minLength(2), this.validationService.guiTrackValidator]], //發票字軌
    TXN_GUIBegNo: ['', [Validators.required, Validators.maxLength(8), Validators.minLength(8)]], //起始發票號碼
    TXN_GUIEndNo: ['', [Validators.maxLength(8), Validators.minLength(8)]], //結束發票號碼
    TXN_GUICnt: [{ value: 1, disabled: true }], //發票號碼張數
    TXN_MemCard: ['', [Validators.maxLength(30)]], //會員編號，若有資料需要串接環友
    TXN_TaxFreeCertNo: [{ value: null, disabled: true }], // 免稅卡零稅卡號= 免稅證證號 欄位
    TXN_Time: [null], //銷售時段
    TXN_GUI_CarrType: [''], //電子載具種類=電子發票載具類別 悠遊載具卡=1K0001、手機條碼=3J0002、自然人憑證=CQ0001、一卡通載具=1H0001、信用卡載具=EK0002、#=取消載具
    TXN_GUIVehicle: [{ value: null, disabled: true }, [Validators.maxLength(20)]], //電子發票載具卡號 若有值則 TXN_GUI_CarrType 固定為3J0002，TXN_GUI_CarrId與TXN_GUI_CarrIdEx內容與此欄位相同
    TXN_GUI_CarrIdEx: [{ value: null, disabled: true }, [Validators.maxLength(64)]], //電子發票載具ID顯碼
    TXN_GUI_CarrId: [{ value: null, disabled: true }, [Validators.maxLength(64)]], //電子發票載具ID隱碼
    TXN_GUIRemark: [{ value: null, disabled: true }], //電子發票防偽隨機碼 由系統依據自訂公式計算取得
    TXN_PrintTimes: [null], //紙本發票列印狀態(若列印電子發票紙本證明連則為1，其他則為0) 顯示 是/否
    TXN_GUI_Donate: ['N'], //發票捐贈狀態，Y=是、N=否
    TXN_GUILoveCode: [{ value: null, disabled: true }], //捐贈社福團體代碼，若TXN_GUI_Donate為Y，則必須輸入此欄位
  });
  USR_NoOptions: IDropdownItem[] = []; //下拉選單 收銀員編號
  txnStatusOptions = txnStatusOptions //下拉選單 交易型態
  txnTaxTypeOptions = txnTaxTypeOptions2 //下拉選單 交易稅別
  TXN_GUI_CarrTypeOptions = TXN_GUI_CarrTypeOptions;//下拉選單 電子載具種類
  CRD_TypeOptions = CRD_TypeOptions; //下拉選單 信用卡別
  PAY_TypeOptions: IDropdownItem[] = []; //下拉選單 付款別
  sys_typeOptions: SystemOption[] = []; // 下拉選單 分期數
  POS5007Data: POS5007Data[] = [];
  POS5007SelectedItems: POS5007Data[] = [];
  POS5007Columns: Column[] = POS5007Columns;
  POS5008Data: POS5008Data[] = [];
  POS5008SelectedItems: POS5008Data[] = [];
  POS5008Columns: Column[] = POS5008Columns;
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly validationService: ValidationService,
    private readonly tls24010Service: Tls24010Service,
    private readonly cdr: ChangeDetectorRef,
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
      this.store_way = rowDataTyped.store_way;
      this.TXN_GUIPaper = rowDataTyped.TXN_GUIPaper
    }
    this.initializeOptions();
    this.listenForChanges();
  }
  ngAfterViewInit(): void {
    if (this.POS5007Table && this.isFormCreateable) {
      this.POS5007Table.insertRow(); // 自動開啟一行商品明細
      this.cdr.detectChanges(); // 確保在初始化後檢測變更
    }
  }
  initializeOptions() {
    // 查詢收銀員設定檔(POS2001)
    this.dropDownListService.queryPOS2001_DropDownList().pipe(untilDestroyed(this)).subscribe((data) => {
      this.USR_NoOptions = data.Data.map((item) => ({ ...item, label: `${item.No} - ${item.Name}` }));
      switch (this.store_way) {
        case '1': this.POS5007Columns = POS5007Columns; break;// 自營櫃位
        case '2': this.POS5007Columns = POS5007Columns2; break;// 專櫃櫃位
        default: break;
      }
      //TODO: 3. 若為自營櫃位時, 讀取POS2004.PLU_MAGNO
      //TODO: 3. 若為專櫃櫃位時, 用TLT_No去拿商品
      //TODO: 4. TLT_ID 類別的部分，應該是用TLT_NO去打API取得TLT_ID的下拉選單
      //TODO: 5. 再去取 TLTTALENT_CHARGEM.CAG_TAXTYPE 專櫃抽成主檔
      //TODO: 6. 再去取 讀取TLTTALENT_CHARGED.CAG_BARCODE 專櫃抽成主檔
      //--付款明細------------------------------------------------------
      this.dropDownListService.queryPOS1006_DropDownList().pipe(untilDestroyed(this)).subscribe((res) => {
        this.PAY_TypeOptions = res.Data.map((item) => ({ ...item, label: item.Name }));
        this.POS5008Data = res.Data.map((item, index) => {
          return { ID: index, PAY_Type: item.No }
        });
        this.sys_typeOptions = SystemOptionsService.getOptions('T111');
        //!!! 欄位所以都是用PAY_Type欄位判斷，後續前端處理
      });
    });
  }
  listenForChanges() {
    // 監聽 零稅 的變化
    this.dataForm.get('TXN_VIP')?.valueChanges.pipe(untilDestroyed(this)).subscribe(begNoValue => {
      if (!begNoValue) { return; }
      if (begNoValue === 'Y') {
        this.dataForm.get('TXN_TaxFreeCertNo')?.setValidators([Validators.required, Validators.maxLength(10)]);
        this.dataForm.get('TXN_TaxFreeCertNo')?.enable();
        this.txnTaxTypeOptions = txnTaxTypeOptions;
      } else {
        this.dataForm.get('TXN_TaxFreeCertNo')?.clearValidators();
        this.dataForm.get('TXN_TaxFreeCertNo')?.disable();
        this.txnTaxTypeOptions = txnTaxTypeOptions2;
      }
    })
    // 監聽 電子載具種類 的變化
    this.dataForm.get('TXN_GUI_CarrType')?.valueChanges.pipe(untilDestroyed(this)).subscribe(carrType => {
      if (carrType && carrType.trim() !== '') {
        this.dataForm.get('TXN_GUI_CarrIdEx')?.enable();
      } else {
        this.dataForm.get('TXN_GUI_CarrIdEx')?.disable();
        this.dataForm.get('TXN_GUI_CarrId')?.setValue(null, { emitEvent: false });
        this.dataForm.get('TXN_GUI_CarrIdEx')?.setValue(null, { emitEvent: false });
      }
      if (carrType === '3J0002') {
        this.dataForm.get('TXN_GUIVehicle')?.enable();
      } else {
        this.dataForm.get('TXN_GUIVehicle')?.disable();
      }
      this.dataForm.get('TXN_GUIVehicle')?.setValue(null, { emitEvent: false });
    });
    // 監聽 載具編號顯碼 的變化
    this.dataForm.get('TXN_GUI_CarrIdEx')?.valueChanges.pipe(untilDestroyed(this)).subscribe(val => {
      this.dataForm.get('TXN_GUI_CarrId')?.setValue(val, { emitEvent: false });
    });
    // 監聽 發票捐贈狀態 的變化
    this.dataForm.get('TXN_GUI_Donate')?.valueChanges.pipe(untilDestroyed(this)).subscribe(vip => {
      this.dataForm.get('TXN_GUILoveCode')?.setValue(null, { emitEvent: false });
      if (!vip) { return; }
      if (vip === 'Y') {
        this.dataForm.get('TXN_GUILoveCode')?.setValidators([Validators.required, Validators.maxLength(20)]);
        this.dataForm.get('TXN_GUILoveCode')?.enable();
      } else {
        this.dataForm.get('TXN_GUILoveCode')?.clearValidators();
        this.dataForm.get('TXN_GUILoveCode')?.disable();
      }
    });
  }
  // 計算 單價小計金額 與 單價銷售金額
  onPOS5007DataChange(event: POS5007Data[]) {
    this.POS5007Data = event.map((item) => {
      return {
        ...item,
        TXN_Amt: item.TXN_Qty * item.PLU_FixPrc,
        TXN_SaleAmt: item.TXN_Qty * item.PLU_FixPrc - item.TXN_Disc,
      };
    });
  }
  trackByRow = (index: number, item: any) => { return item?.['id'] || index; }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);

    this.handleSubmit(frm, () => {

    });
  }
}
