import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Column, RowEditSaveEvent } from '@shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { NgIf, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { Tls56050Service } from '@service/api/tls/tls56050.service';

@Component({
  selector: 'app-tls56050-cru',
  templateUrl: './tls56050-cru.component.html',
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
    DecimalPipe
  ]
})
export class TLS56050CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  // 主檔表單定義
  dataForm = this.formBuilder.group({
    MVM_No: [{ value: '', disabled: true }], // 調撥單編號，readonly
    LOGO_No: [{ value: null, disabled: true }], // 品牌代碼，readonly
    OUT_HOS_No: [{ value: null, disabled: true }], // 調出倉別，readonly
    IN_HOS_No: [{ value: null, disabled: true }], // 調入倉別，readonly
    OUTGODS_TotQty: [{ value: 0, disabled: true }], // 發貨數量合計，readonly
    OUTGODS_TotBuyNet: [{ value: 0, disabled: true }], // 發貨未稅進價合計，readonly
    APPLY_Date: [{ value: null, disabled: true }], // 申請日期，readonly
    APPLY_USR_No: [{ value: null, disabled: true }], // 申請人編號，readonly
    APRV_Date: [{ value: null, disabled: true }], // 審核日期，readonly
    APRV_USR_No: [{ value: null, disabled: true }], // 審核人編號，readonly
    OUTGODS_DATE: [{ value: new Date(), disabled: true }], // 發貨日期，預設為系統日期，readonly
    OUTGODS_USR_No: [{ value: '', disabled: true }], // 發貨人編號，預設為登入人員，readonly
    MVM_Remark: [null, [Validators.maxLength(200)]], // 倉別調撥單說明，可編輯
  });

  data: any[] = []; // 用於表格顯示明細數據
  columns: Column[] = [
    { field: 'MVD_SeqNo', header: '項次', visible: true },
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'MVD_BuyPrc', header: '進單價', visible: true },
    { field: 'STK_CurrentQty', header: '目前庫存', visible: true }, // 需讀取
    { field: 'APPLY_Qty', header: '調撥申請數量', visible: true },
    { field: 'OUTGODS_QTY', header: '發貨量', visible: true, type: 'inputNumber' },
    { field: 'OUTGODS_BuyNet', header: '發貨未稅進價小計', visible: true },
    { field: 'MVD_Remark', header: '單項說明', visible: true, type: 'input' },
  ];

  brandOptions: { label: string; value: string }[] = [];
  warehouseOptions: { label: string; value: string }[] = [];
  userOptions: { label: string; value: string }[] = [];

  constructor(
    private readonly tls56050Service: Tls56050Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    // 獲取路由參數中的調撥單號，並初始化頁面
    this.initializePage('TLS56050', this.dataForm);
    this.loadData();

    // 載入下拉選單資料
    this.loadDropdownOptions();
    // 預設發貨人編號
    this.dataForm.patchValue({ OUTGODS_USR_No: this.authService.currentUserValue?.user_No });
  }

  loadData(): void {
    // 模擬從後端API載入資料
    // this.tls56050Service.queryMvmData(mvmNo).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
    //   if (response.MVM_Status !== '2') { // 檢查狀態是否為 '已審核'
    //     // 導向錯誤頁面或顯示提示
    //     console.error('調撥單狀態不正確，無法發貨');
    //     return;
    //   }
    //   this.dataForm.patchValue(response); // 載入主檔資料
    //   this.data = response.details.map(item => ({
    //     ...item,
    //     OUTGODS_QTY: item.APPLY_Qty // 發貨量預設等於申請量
    //   }));
    //   this.calculateTotals(); // 載入後計算總計
    // });
    this.data = [
      { MVD_SeqNo: 1, PLU_MagNo: 'P001', PLU_No: '12345', PLU_Name: '商品A', MVD_BuyPrc: 100, STK_CurrentQty: 50, APPLY_Qty: 10, OUTGODS_QTY: 10, OUTGODS_BuyNet: 1000, MVD_Remark: '' },
      { MVD_SeqNo: 2, PLU_MagNo: 'P002', PLU_No: '67890', PLU_Name: '商品B', MVD_BuyPrc: 50, STK_CurrentQty: 30, APPLY_Qty: 5, OUTGODS_QTY: 5, OUTGODS_BuyNet: 250, MVD_Remark: '' },
    ];
    this.calculateTotals();
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

  onRowEditSave(event: RowEditSaveEvent): void {
    const editedItem = event.data;
    // 驗證發貨量不能大於或小於申請量
    if (editedItem.OUTGODS_QTY !== editedItem.APPLY_Qty) {
      console.error('發貨量必須與調撥申請量一致！');
      // 這裡可以加入ToastService或Dialog來提示使用者
      return;
    }

    // 重新計算發貨相關小計
    if (editedItem.OUTGODS_QTY) {
      const buyNet = editedItem.MVD_BuyPrc * editedItem.OUTGODS_QTY;
      editedItem.OUTGODS_BuyNet = buyNet;

      // 稅額計算
      if (editedItem.PLU_StockTaxType === '1') { // 應稅
        editedItem.OUTGODS_BuyTax = Math.floor(buyNet * 0.05);
      } else { // 免稅
        editedItem.OUTGODS_BuyTax = 0;
      }
      editedItem.OUTGODS_BuyAmt = editedItem.OUTGODS_BuyNet + editedItem.OUTGODS_BuyTax;
      editedItem.OUTGODS_SaleAmt = editedItem.MVD_SalePrc * editedItem.OUTGODS_QTY;
    }

    this.calculateTotals(); // 更新總計
  }

  calculateTotals(): void {
    const totalQty = this.data.reduce((sum, item) => sum + (item.OUTGODS_QTY || 0), 0);
    const totalBuyNet = this.data.reduce((sum, item) => sum + (item.OUTGODS_BuyNet || 0), 0);
    // 規格中沒有提到稅額和售價，這裡可以根據需要添加
    // const totalBuyTax = this.data.reduce((sum, item) => sum + (item.OUTGODS_BuyTax || 0), 0);
    // const totalBuyAmt = this.data.reduce((sum, item) => sum + (item.OUTGODS_BuyAmt || 0), 0);
    // const totalSaleAmt = this.data.reduce((sum, item) => sum + (item.OUTGODS_SaleAmt || 0), 0);

    this.dataForm.patchValue({
      OUTGODS_TotQty: totalQty,
      OUTGODS_TotBuyNet: totalBuyNet
    });
  }

  onSubmit(frm: FormGroup): void {
    // 發貨前再次檢查所有明細的發貨量是否與申請量一致
    const isQtyValid = this.data.every(item => item.OUTGODS_QTY === item.APPLY_Qty);
    if (!isQtyValid) {
      alert('所有商品的發貨量必須與調撥申請量一致！');
      return;
    }

    this.handleSubmit(frm, () => {
      this.loading = true;
      const body = {
        master: frm.getRawValue(),
        details: this.data
      };

      // 模擬API呼叫
      console.log('發貨提交資料：', body);
      // this.tls56050Service.updateMvmData(body).pipe(
      //   finalize(() => this.loading = false),
      //   untilDestroyed(this)
      // ).subscribe(response => {
      //   if (response.success) {
      //     alert('發貨成功！');
      //     this.onCancel(); // 返回清單頁
      //   } else {
      //     alert('發貨失敗：' + response.message);
      //   }
      // });

      this.loading = false;
    });
  }

}
