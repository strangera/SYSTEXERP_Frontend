import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TXN_GUI_CarrTypeOptions, txnStatusOptions } from '@pages/tls/tls24010-cru/tls24010-cru.model';
import { PaymentDetailsList, ProductDetailList, TLS24030DetailRequest, TLS24030Item, Tls24030Service } from '@service/api/tls/tls24030.service';
import { getSYS1000 } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
import { RadiobuttonYNComponent } from '@shared/components/radiobutton-yn/radiobutton-yn.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { BlockUIModule } from 'primeng/blockui';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-tls24030-cru',
  templateUrl: './tls24030-cru.component.html',
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
    TableModule,
    InputNumberModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    BlockUIModule,
    ProgressSpinnerModule,
    CheckboxModule,
    AsyncPipe,
    TableReportComponent
  ],
})
export class TLS24030CRUComponent extends BasicCruPageComponent<TLS24030Item> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    TXN_Date: [{ value: '', disabled: true }],           //disabled 銷售日期
    ECR_No: [{ value: '', disabled: true }],             //disabled 收銀機號 pos1002.ecr_no
    TLT_No: [{ value: '', disabled: true }],             //disabled 專櫃編號
    TXN_No: [{ value: null, disabled: true }],  //disabled 交易序號
    TXN_Remark: [{ value: null, disabled: true }],                           //備註
    USR_No: [{ value: null, disabled: true }], //收銀員編號POS2001.USR_No
    TXN_PreOrder: [{ value: null, disabled: true }], //預售 是/否
    TXN_VIP: [{ value: null, disabled: true }], //零稅 是/否,YN。若為y，TXN_TaxType變成2
    TXN_TaxFreeCertNo: [{ value: null, disabled: true }], // 免稅卡零稅卡號= 免稅證證號 欄位
    TXN_Status: [{ value: null, disabled: true }],                                                    //交易狀態 (一般交易=N, 退貨交易=E, 作廢交易=D)
    GUI_Track: [{ value: null, disabled: true }], //發票字軌
    TXN_GUIBegNo: [{ value: null, disabled: true }], //起始發票號碼
    TXN_GUIEndNo: [{ value: null, disabled: true }], //結束發票號碼
    TXN_CustCnt: [{ value: null, disabled: true }], //來客數
    TXN_MemCard: [{ value: null, disabled: true }], //會員編號，若有資料需要串接環友
    TXN_Uniform: [{ value: null, disabled: true }], //客戶統一編號 可以為空
    TXN_Time: [{ value: null, disabled: true }], //銷售時段今日的時間
    isNegativeTXN: [{ value: null as boolean | null, disabled: true }],
    ORG_TXN_Date: [{ value: null as Date | null, disabled: true }], //原交易日期
    ORG_ECR_No: [{ value: null as string | null, disabled: true }], //原收銀機台
    TXN_GUI_CarrType: [{ value: null, disabled: true }], //電子載具種類=電子發票載具類別 悠遊載具卡=1K0001、手機條碼=3J0002、自然人憑證=CQ0001、一卡通載具=1H0001、信用卡載具=EK0002、#=取消載具
    TXN_GUIVehicle: [{ value: null, disabled: true }], //電子發票載具卡號 若有值則 TXN_GUI_CarrType 固定為3J0002，TXN_GUI_CarrId與TXN_GUI_CarrIdEx內容與此欄位相同
    TXN_GUI_CarrIdEx: [{ value: null, disabled: true }, [Validators.maxLength(64)]], //電子發票載具ID顯碼
    TXN_GUI_CarrId: [{ value: null, disabled: true }, [Validators.maxLength(64)]], //電子發票載具ID隱碼
    TXN_GUIRemark: [{ value: null, disabled: true }], //電子發票防偽隨機碼 由系統依據自訂公式計算取得
    TXN_PrintTimes: [{ value: null, disabled: true }], //紙本發票列印狀態(若列印電子發票紙本證明連則為1，其他則為0) 顯示 是/否
    IsHaveGUILoveCode: [{ value: null, disabled: true }], //發票捐贈狀態，Y=是、N=否
    TXN_GUILoveCode: [{ value: null, disabled: true }], //捐贈社福團體代碼，若TXN_GUI_Donate為Y，則必須輸入此欄位
  });
  productDetailList: ProductDetailList[] = [];
  productColumns: ReportColumn[] = [
    { field: 'TXN_item', header: '項次' },
    { field: 'PLU_MagNo', header: '商品編號/專櫃編號' },
    { field: 'PLU_Name', header: '商品名稱/櫃位名稱' },
    { field: 'TXN_Qty', header: '數量' },
    { field: 'PLU_SalePrc', header: '單價金額', align: 'right', format: v => '$ ' + v },
    { field: 'Unitprice', header: '單價小計金額', align: 'right', format: v => '$ ' + v },
    { field: 'TXN_Disc', header: '單價折扣讓金額(負數)', align: 'right', format: v => '$ ' + v },
    { field: 'TXN_SaleAmt', header: '單價銷售金額', align: 'right', format: v => '$ ' + v },
    { field: 'tlt_id_desc', header: '類別' },
    { field: 'PLU_TaxType', header: '稅別', format: v => getSYS1000('PLU_TaxType', v) },
    { field: 'TXN_DiscName', header: '折扣別' },
  ];
  paymentDetailsList: PaymentDetailsList[] = [];
  paymentColumns: ReportColumn[] = [
    { field: 'TXN_item', header: '項次' },
    { field: 'PAY_No', header: '付款別編號' },
    { field: 'PAY_Name', header: '付款別' },
    { field: 'TXN_PayAmt', header: '金額', align: 'right', format: v => '$ ' + v },
    { field: 'CRD_Name', header: '信用卡別' },
    { field: 'CRD_NoTXN_CouponNoTXN_PayDesc', header: '信用卡卡號/券號/應收付款對象' },
    { field: 'TERM_Name', header: '分期數' },
  ];
  ECR_NoOptions = this.dropDown.queryPos1002();     //dropdown 下拉選單 收銀機號
  USR_NoOptions = this.dropDown.queryPos2001();     //dropdown 下拉選單 收銀員
  TLT_NoOptions = this.dropDown.queryTltTalent();        //dropdown 下拉選單 專櫃編號
  txnStatusOptions = txnStatusOptions               //dropdown 下拉選單 交易型態
  TXN_GUI_CarrTypeOptions = TXN_GUI_CarrTypeOptions;//dropdown 下拉選單 電子載具種類
  constructor(
    private readonly dropDown: DropdownApiService,
    private readonly tls24030Service: Tls24030Service,
    private readonly datePipe: DatePipe
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS24030', this.dataForm);
    this.fetchDetailData();
  }
  /** 取得詳細資料並填充表單 */
  fetchDetailData(): void {
    // 從 BasicCruPageComponent 的 editData 或 dataForm 取得鍵值
    const formVal = this.dataForm.getRawValue();

    const body: TLS24030DetailRequest = {
      SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
      TXN_Date: this.datePipe.transform(formVal.TXN_Date, 'yyyy-MM-dd') || '',
      ECR_No: formVal.ECR_No || '',
      TXN_No: Number(formVal.TXN_No) || 0,
    };

    this.tls24030Service.queryTLS24030Detail(body).subscribe(res => {
      if (res.Data && res.Data.length > 0) {
        const detail = res.Data[0];
        // 1. 填充主表單資料（TXN_No 補零至6碼顯示，不影響原始資料）
        this.dataForm.patchValue({
          ...detail.MainData,
          TXN_No: String(detail.MainData.TXN_No).padStart(6, '0')
        } as any);
        // 2. 處理商品明細 (ProductDetailList) 並組合欄位
        this.productDetailList = (detail.ProductDetailList || []).map((item) => ({
          ...item,
          // 組合 tlt_id 與描述
          tlt_id_desc: item.tlt_id && item.tlt_id_desc
            ? `${item.tlt_id} - ${item.tlt_id_desc}`
            : (item.tlt_id || item.tlt_id_desc || '')
        }));
        // 3. 處理付款明細 (PaymentDetailsList) 並處理特殊的字串組合
        this.paymentDetailsList = (detail.PaymentDetailsList || []).map((item: any) => ({
          ...item,
          // 您原本的組合欄位邏輯 (修正屬性名稱與語法)
          CRD_NoTXN_CouponNoTXN_PayDesc: item.CRD_No || item.TXN_CouponNo || item.TXN_PayDesc || '',
          // tlt_term_type: item.tlt_term_type === '3 ' ? '3' : item.tlt_term_type
        }));

        // 4. 判斷是否為負向交易 (原交易日期有值則勾選)
        if (detail.MainData.ORG_TXN_Date) {
          this.dataForm.get('isNegativeTXN')?.setValue(true);
        }
      }
    });
  }

  /** 計算銷售商品表格的 Footer 資料 */
  get footerData(): Record<string, string> {
    const total = (this.productDetailList || []).reduce((acc, item) => {
      // 確保數值正確，若為空或 undefined 則當作 0
      return acc + (Number(item.TXN_SaleAmt) || 0);
    }, 0);

    return {
      // 這裡的 key 必須對應 columns 中的 field 名稱
      // 並根據您的 columns 定義，加上 '$ ' 符號
      TXN_SaleAmt: total.toLocaleString()
    };
  }
}


