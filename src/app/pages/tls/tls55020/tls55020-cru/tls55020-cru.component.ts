import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentDetail, ProductDetail, Tls55020MasterData, Tls55020Service, Tls55020UpdateRequest } from '@service/api/tls/tls55020.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { Pos2004WithBrandItem } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { formatAmount } from '@shared/componentkit/table-report/table-report.model';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from "primeng/divider";
import { PanelModule } from 'primeng/panel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { finalize, map } from 'rxjs';

@Component({
  selector: 'app-tls55020-cru',
  templateUrl: './tls55020-cru.component.html',
  standalone: true,
  imports: [
    TableEditComponent, AsyncPipe, TranslateModule, PanelModule,
    PanelModule, FormsModule, ReactiveFormsModule, NgIf, InputNumberComponent, ButtonModule,
    RadioButtonModule, ButtonComponent, InputTextComponent, CalendarComponent, DropdownComponent,
    DividerModule, DividerModule, MenubarComponent, RadiobuttonYNComponent, InputTextareaComponent
  ]
})
export class TLS55020CRUComponent extends BasicCruPageComponent<Tls55020MasterData> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ID: [{ value: null, disabled: true }],                 //disabled 自營交易主檔編號
    TXN_Date: [{ value: null, disabled: true }],           //disabled 銷售日期
    ECR_No: [{ value: null, disabled: true }],             //disabled 收銀機號 pos1002.ecr_no
    TLT_No: [{ value: null, disabled: true }],             //disabled 專櫃編號
    TXN_No: [{ value: null, disabled: true }],  //disabled 交易序號
    TLT_Name: [{ value: null, disabled: true }],           //disabled 專櫃名稱
    TXN_Status: [{ value: null, disabled: true }],                                                    //交易狀態 (一般交易=N, 退貨交易=E, 作廢交易=D)
    TXN_Remark: [{ value: null, disabled: true }],                           //備註
    USR_No: [{ value: null, disabled: true }], //收銀員編號POS2001.USR_No
    TXN_PreOrder: [{ value: null, disabled: true }], //預售 是/否
    TXN_VIP: [{ value: null, disabled: true }], //零稅 是/否,YN。若為y，TXN_TaxType變成2
    TXN_TaxFreeCertNo: [{ value: null, disabled: true }], // 免稅卡零稅卡號= 免稅證證號 欄位
    TXN_TaxType: [{ value: null, disabled: true }], //稅類別 1:應稅,2:免稅,3:不稅,4:應稅與免稅,5:免稅與不稅
    GUI_Track: [{ value: null, disabled: true }], //發票字軌
    TXN_GUIBegNo: [{ value: null, disabled: true }], //起始發票號碼
    TXN_GUIEndNo: [{ value: null, disabled: true }], //結束發票號碼
    TXN_CustCnt: [{ value: null, disabled: true }], //來客數
    TXN_MemCard: [{ value: null, disabled: true }], //會員編號，若有資料需要串接環友
    TXN_Uniform: [{ value: null, disabled: true }], //客戶統一編號 可以為空
    TXN_Time: [{ value: null, disabled: true }], //銷售時段今日的時間
    ORG_TXN_Date: [{ value: null, disabled: true }], //原交易日期
    ORG_ECR_No: [{ value: null, disabled: true }], //原收銀機台
    TXN_GUI_CarrType: [{ value: null, disabled: true }], //電子載具種類=電子發票載具類別 悠遊載具卡=1K0001、手機條碼=3J0002、自然人憑證=CQ0001、一卡通載具=1H0001、信用卡載具=EK0002、#=取消載具
    TXN_GUIVehicle: [{ value: null, disabled: true }], //電子發票載具卡號 若有值則 TXN_GUI_CarrType 固定為3J0002，TXN_GUI_CarrId與TXN_GUI_CarrIdEx內容與此欄位相同
    TXN_GUIRemark: [{ value: null, disabled: true }], //電子發票防偽隨機碼 由系統依據自訂公式計算取得
    TXN_PrintTimes: [{ value: null, disabled: true }], //紙本發票列印狀態(若列印電子發票紙本證明連則為1，其他則為0) 顯示 是/否
    IsHaveGUILoveCode: [{ value: null, disabled: true }], //發票捐贈狀態，Y=是、N=否
    TXN_GUILoveCode: [{ value: null, disabled: true }], //捐贈社福團體代碼，若IsHaveGUILoveCode為Y，則必須輸入此欄位
    TXN_Ret_No: [{ value: null, disabled: true }],
    tlt_term_type: [{ value: null, disabled: true }],
  });
  USR_NoOptions = this.dropdown.queryPos2001();     //dropdown 下拉選單 收銀員
  ECR_NoOptions = this.dropdown.queryPos1002();     //dropdown 下拉選單 收銀機號
  TLT_NoOptions = this.dropdown.queryTltTalent();     //dropdown 下拉選單 專櫃
  allPLUOptions: Pos2004WithBrandItem[] = [];
  TXN_GUI_CarrTypeOptions = getSYS1000Options('TXN_GUI_CarrType');//dropdown 下拉選單 電子載具種類
  data: ProductDetail[] = [];
  columns: EditColumn[] = [
    {
      field: 'PLU_MagNo',
      header: '商品管理編號/國際條碼/廠商貨號',
      disabled: (value: string, index?: number, rowData?: ProductDetail) => !rowData?.isEditable,
      type: 'dropdown',
      optionsAsync: true,
      // 在這裡處理資料轉換
      options: () => this.dropdown.queryPos2004ByTalent({ TLT_NO: this.rowdata?.TLT_No || '' }).pipe(
        map(res => {
          const list = res || [];
          this.allPLUOptions = list; // 暫存資料
          return list.map(item => ({
            ...item,
            combinedLabel: `${item.PLU_MagNo} / ${item.PLU_No} / ${item.PLU_OrgPLUNo}`,
            fullDisplay: `${item.PLU_MagNo} / ${item.PLU_No} / ${item.PLU_OrgPLUNo} - ${item.PLU_Name}`
          }));
        })
      ),
      optionValue: 'PLU_MagNo',    // 存入資料庫的值
      optionLabel: 'combinedLabel', // 下拉選單「收合時」顯示的字串
      templateLabel: 'fullDisplay', // 下拉選單「展開列表」顯示的字串
      width: '450px', // 建議寬度給大一點，因為字串很長
      onChange: (value: string, rowData: ProductDetail) => {
        if (!value) return;
        const selected = this.allPLUOptions.find(p => p.PLU_MagNo === value);
        if (selected) {
          rowData.PLU_Name = selected.PLU_Name;
          this.data = [...this.data];
        }
      },
      showClear: false,
      validate: [validateRequired]
    },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'TXN_Qty', header: '數量', format: formatAmount },
    { field: 'PLU_SalePrc', header: '單價金額', format: formatAmount },
    { field: 'Unitprice', header: '單價小計金額', format: formatAmount },
    { field: 'TXN_Disc', header: '單價折扣讓金額(負數)', format: formatAmount },
    { field: 'TXN_SaleAmt', header: '單價銷售金額', format: formatAmount },
  ];
  // 修改驗證邏輯：僅判斷目前的值是否包含在下拉選單中
  validateEntireRow = (rowData: ProductDetail): { isValid: boolean, errorMessage: string } => {
    // 如果該行本來就不可編輯（不是 1000000000001），則視為有效，不進行檢核
    if (!rowData.isEditable) {
      return { isValid: true, errorMessage: '' };
    }

    if (!rowData.PLU_MagNo) {
      return { isValid: false, errorMessage: '請選擇商品' };
    }

    // 檢查目前的值是否存在於當前專櫃可選的商品清單 (allPLUOptions) 中
    const isValidOption = this.allPLUOptions.some(opt => opt.PLU_MagNo === rowData.PLU_MagNo);

    if (!isValidOption) {
      return { isValid: false, errorMessage: '無效的商品編號，請從下拉選單選擇' };
    }

    return { isValid: true, errorMessage: '' };
  };
  data2: PaymentDetail[] = [];
  columns2: EditColumn[] = [
    { field: 'PAY_Name', header: '付款別' },
    { field: 'TXN_PayAmt', header: '金額', format: formatAmount },
    { field: 'CRD_Name', header: '信用卡別' },
    { field: 'CRD_NoTXN_CouponNoTXN_PayDesc', header: '信用卡卡號/券號/應收付款對象' },
    { field: 'TERM_Name', header: '分期數' },
  ];

  constructor(
    public readonly tls55020Service: Tls55020Service,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS55020', this.dataForm);
    const body = {
      SYS_StoreNo: this.user.SYS_StoreNo || '',
      TXN_Date: this.rowdata?.TXN_Date || '',
      ECR_No: this.rowdata?.ECR_No || '',
      TXN_No: this.rowdata?.TXN_No || 0,
    }
    this.tls55020Service.queryTLS55020Detail(body).subscribe(res => {
      if (res.Data && res.Data.length > 0) {
        const detail = res.Data[0];
        this.data = (detail.ProductDetailList || []).map(item => ({
          ...item,
          isEditable: item.PLU_MagNo === '1000000000001'
        }));
        this.data2 = detail.PaymentDetailsList.map(item => ({
          ...item,
          CRD_NoTXN_CouponNoTXN_PayDesc: item.CRD_No || item.TXN_CouponNo || item.TXN_PayDesc
        }))
      }
    })
  }
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const isTableValid = this.tableEditComponent.validateAndShowErrors();
      if (!isTableValid) {
        this.loading = false;
        return;
      }
      const updatedDetails = this.data.filter(item => item.isEditable).map(item => ({
        ID: item.ID,
        PLU_MagNo: item.PLU_MagNo
      }));

      if (updatedDetails.length === 0) {
        this.messageService.warnBubble('沒有任何可修改的明細資料');
        this.loading = false;
        return;
      }
      const submitData: Tls55020UpdateRequest = {
        SYS_StoreNo: this.user.SYS_StoreNo || '',
        TXN_Date: this.datePipe.transform(frm.getRawValue().TXN_Date, 'yyyy-MM-dd') || '',
        ECR_No: this.rowdata?.ECR_No || '',
        TXN_No: this.rowdata?.TXN_No || 0,
        POS5006_ID: this.rowdata?.ID || 0, // 主檔 ID
        updatePOS5007_Details: updatedDetails
      };
      this.tls55020Service.updateTLS55020Detail(submitData).pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(res => {
          this.messageService.successBubble(res.Message || '更新成功');
          this.onCancel(); // 回到列表頁
        });
    });
  }
}
