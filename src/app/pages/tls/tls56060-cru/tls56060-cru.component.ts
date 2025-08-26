import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Column, RowEditSaveEvent } from '@shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ITLS56060Detail, ITLS56060Request, ITLS56060Response, Tls56060Service } from '@service/api/tls/tls56060.service';

@Component({
  selector: 'app-tls56060-cru',
  templateUrl: './tls56060-cru.component.html',
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
    TableComponent,
    InputTextareaComponent,
  ]
})
export class TLS56060CRUComponent extends BasicCruPageComponent<ITLS56060Response> implements OnInit {
  // 主檔表單定義
  dataForm = this.formBuilder.nonNullable.group({
    MVM_No: [{ value: '', disabled: true }], // 調撥單編號，readonly
    LOGO_No: [{ value: '', disabled: true }], // 品牌代碼，readonly
    OUT_HOS_No: [{ value: '', disabled: true }], // 調出倉別，readonly
    IN_HOS_No: [{ value: '', disabled: true }], // 調入倉別，readonly
    Confirm_TotQty: [{ value: 0, disabled: true }], // 驗收數量合計，readonly
    Confirm_TotBuyNet: [{ value: 0, disabled: true }], // 驗收未稅進價合計，readonly
    Confirm_TotBuyTax: [{ value: 0, disabled: true }], // 驗收進價稅額合計，readonly
    Confirm_TotBuyAmt: [{ value: 0, disabled: true }], // 驗收含稅進價合計，readonly
    Confirm_TotSaleAmt: [{ value: 0, disabled: true }], // 驗收含稅進價合計，readonly
    APPLY_Date: [{ value: null as Date | null, disabled: true }], // 申請日期，readonly
    APPLY_USR_No: [{ value: '', disabled: true }], // 申請人編號，readonly
    APRV_Date: [{ value: null as Date | null, disabled: true }], // 審核日期，readonly
    APRV_USR_No: [{ value: '', disabled: true }], // 審核人編號，readonly
    OUTGODS_DATE: [{ value: null as Date | null, disabled: true }], // 發貨日期，readonly
    OUTGODS_USR_No: [{ value: '', disabled: true }], // 發貨人編號，readonly
    Confirm_DATE: [{ value: null as Date | null, disabled: true }], // 驗收日期，預設為系統日期
    Confirm_USR_No: [{ value: '', disabled: true }], // 驗收人編號，預設為登入人員
    MVM_Remark: ['', [Validators.maxLength(200)]], // 倉別調撥單說明，可編輯
  });

  data: ITLS56060Detail[] = []; // 用於表格顯示明細數據
  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'MVD_BuyPrc', header: '商品進價', visible: true },
    { field: 'NowHaveQty', header: '目前庫存', visible: true },
    { field: 'APPLY_Qty', header: '調撥申請量', visible: true },
    { field: 'OUTGODS_QTY', header: '發貨量', visible: true },
    { field: 'Confirm_QTY', header: '驗收量', visible: true, type: 'inputNumber' },
    { field: 'Confirm_BuyNet', header: '進價小計', visible: true },
    { field: 'MVD_Remark', header: '單項說明', visible: true, type: 'input' },
  ];

  brandOptions: { label: string; value: string }[] = [];
  warehouseOptions: { label: string; value: string }[] = [];
  userOptions: { label: string; value: string }[] = [];

  constructor(
    private readonly tls56060Service: Tls56060Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    // 獲取路由參數中的調撥單號，並初始化頁面
    this.initializePage('TLS56060', this.dataForm);
    this.loadDropdownOptions();
    this.loadData();
  }

  loadData(): void {
    const MVM_No = this.dataForm.get('MVM_No')?.value;
    if (!MVM_No) {
      console.error('調撥單編號不存在，無法載入資料');
      return;
    }
    if (this.dataForm.get('Confirm_DATE')?.value === null) {
      this.dataForm.get('Confirm_DATE')?.setValue(new Date());
      this.dataForm.get('Confirm_USR_No')?.setValue(this.authService.currentUserValue?.user_No || '');
    }
    this.tls56060Service.getTLS56060Info(MVM_No).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
      const masterData = response.Data.TLS56060Data;
      const detailsData = response.Data.detail_TLS56060;
      this.dataForm.patchValue({
        MVM_No: masterData.MVM_No,
        LOGO_No: masterData.LOGO_No ?? '',
        OUT_HOS_No: masterData.OUT_HOS_No,
        IN_HOS_No: masterData.IN_HOS_No,
        APPLY_Date: masterData.APPLY_Date ? new Date(masterData.APPLY_Date) : null,
        APPLY_USR_No: masterData.APPLY_USR_No,
        APRV_Date: masterData.APRV_Date ? new Date(masterData.APRV_Date) : null,
        APRV_USR_No: masterData.APRV_USR_No,
        OUTGODS_DATE: masterData.OUTGODS_Date ? new Date(masterData.OUTGODS_Date) : null,
        OUTGODS_USR_No: masterData.OUTGODS_USR_No,
        MVM_Remark: masterData.MVM_Remark,
        // 這些欄位是後端回傳的總計，直接 patch
        Confirm_TotQty: masterData.Confirm_TotQty,
        Confirm_TotBuyNet: masterData.Confirm_TotBuyNet,
      });

      this.data = detailsData.map(item => ({
        ...item,
        Confirm_QTY: item.Confirm_QTY !== null && item.Confirm_QTY !== undefined && item.Confirm_QTY !== 0 ?
          item.Confirm_QTY : item.OUTGODS_QTY,
        Confirm_BuyNet: item.Confirm_BuyNet !== null && item.Confirm_BuyNet !== undefined && item.Confirm_BuyNet !== 0 ?
          item.Confirm_BuyNet : item.OUTGODS_BuyNet,
      }));
    });
  }

  loadDropdownOptions(): void {
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(options => {
      this.warehouseOptions = options.Data.map(item => ({ label: item.Name, value: item.No }));
    });
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.brandOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.userOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
  }
  dataChanged = false; // 標記資料是否有變更
  onRowEditSave(event: RowEditSaveEvent): void {
    this.dataChanged = true;
    // 取得被編輯的那一列資料的參考，以便直接修改它
    // 使用 MVD_SeqNo 作為唯一識別碼來找到對應的物件
    const editedItem = this.data.find(item => item.MVD_SeqNo === event.newData.MVD_SeqNo);

    // 檢查是否成功找到該筆資料
    if (editedItem) {
      // 從 newData 取得使用者輸入的發貨數量
      const confirmQty = event.newData.Confirm_QTY || 0;

      // 使用原始資料 (oldData 或 editedItem) 中的單價來計算小計
      const buyPrice = editedItem.MVD_BuyPrc;
      const salePrice = editedItem.MVD_SalePrc;

      // 計算發貨相關小計
      const buyNet = buyPrice * confirmQty;
      editedItem.Confirm_QTY = confirmQty; // 更新發貨數量
      editedItem.Confirm_BuyNet = buyNet; // 更新發貨未稅進價小計

      // 根據商品稅別重新計算稅額
      if (editedItem.PLU_StockTaxType === '1') { // 應稅
        editedItem.Confirm_BuyTax = Math.floor(buyNet * 0.05);
      } else { // 免稅
        editedItem.Confirm_BuyTax = 0;
      }

      // 計算總金額
      editedItem.Confirm_BuyAmt = editedItem.Confirm_BuyNet + editedItem.Confirm_BuyTax;
      editedItem.Confirm_SaleAmt = salePrice * confirmQty;
    }

    // 重新計算所有列的總計
    this.calculateTotals();

    // 觸發 Angular 變更偵測，讓表格重新渲染
    this.data = [...this.data];
  }

  calculateTotals(): void {
    const totalQty = this.data.reduce((sum, item) => sum + (item.Confirm_QTY || 0), 0);
    const totalBuyNet = this.data.reduce((sum, item) => sum + (item.Confirm_BuyNet || 0), 0);
    const totalBuyTax = this.data.reduce((sum, item) => sum + (item.Confirm_BuyTax || 0), 0);
    const totalBuyAmt = this.data.reduce((sum, item) => sum + (item.Confirm_BuyAmt || 0), 0);
    const totalSaleAmt = this.data.reduce((sum, item) => sum + (item.Confirm_SaleAmt || 0), 0);

    this.dataForm.patchValue({
      Confirm_TotQty: totalQty,
      Confirm_TotBuyNet: totalBuyNet,
      Confirm_TotBuyTax: totalBuyTax,
      Confirm_TotBuyAmt: totalBuyAmt,
      Confirm_TotSaleAmt: totalSaleAmt,
    });
  }

  isComponentReady = true; // 預設為 true，讓元件一開始就顯示
  // 重新初始化元件的方法
  reinitializeComponent(): void {
    this.isComponentReady = false; // 隱藏元件，觸發銷毀
    // 使用 setTimeout 確保 Angular 完成銷毀操作，然後再重建
    setTimeout(() => {
      this.isComponentReady = true; // 顯示元件，觸發重建和 ngOnInit
    }, 0);
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const rawFormValue = frm.getRawValue();
      const payload: ITLS56060Request = {
        id: this.rowdata?.id,
        MVM_No: rawFormValue.MVM_No,
        Confirm_Date: rawFormValue.Confirm_Date,
        Confirm_USR_No: rawFormValue.Confirm_USR_No,
        Confirm_USR_Name: this.userOptions.find(u => u.value === rawFormValue.Confirm_USR_No)?.label?.split(' - ')[1] || '',
        Confirm_TotQty: rawFormValue.Confirm_TotQty,
        Confirm_TotBuyNet: rawFormValue.Confirm_TotBuyNet,
        Confirm_TotBuyTax: rawFormValue.Confirm_TotBuyTax,
        Confirm_TotBuyAmt: rawFormValue.Confirm_TotBuyAmt,
        Confirm_TotSaleAmt: rawFormValue.Confirm_TotSaleAmt,
        MVM_Remark: rawFormValue.MVM_Remark,
        Details: this.data.map(item => ({
          ...item,
          id: item.id,
          MVM_No: item.MVM_No,
          Confirm_Qty: item.Confirm_QTY,
          Confirm_BuyNet: item.Confirm_BuyNet ?? item.Confirm_QTY * item.MVD_BuyPrc,
          Confirm_BuyTax: item.Confirm_BuyTax ?? item.PLU_TaxType === '1' ? item.Confirm_QTY * item.MVD_BuyPrc * 0.05 : 0,
          Confirm_BuyAmt: item.Confirm_BuyAmt ?? item.Confirm_BuyNet + item.Confirm_BuyTax,
          Confirm_SaleAmt: item.Confirm_SaleAmt ?? item.Confirm_QTY * item.MVD_SalePrc,
          MVD_Remark: item.MVD_Remark,
        }))
      };
      this.tls56060Service.updateTLS56060(payload).pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this)
      ).subscribe(response => {
        this.messageService.successBubble(response.Message);
        this.reinitializeComponent();
        this.dataChanged = false;
      });
    });
  }
  onConfirm(frm: FormGroup): void {
    const isQtyValid = this.data.every(item => item.OUTGODS_QTY === item.APPLY_Qty);
    if (!isQtyValid) {
      this.messageService.errorBubble('所有商品的發貨量必須與調撥申請量一致！');
      return;
    }
    const body = {
      DetailList: [
        {
          MVM_No: frm.getRawValue().MVM_No,
          MVM_Status: '4',
        }
      ]
    }
    this.loading = true;
    this.tls56060Service.updateStatusTLS56060(body).pipe(
      finalize(() => this.loading = false),
      untilDestroyed(this)
    ).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onCancel();
    });
  }
}
