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
import { Tls56060Service } from '@service/api/tls/tls56060.service';

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
    DecimalPipe
  ]
})
export class TLS56060CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  // 主檔表單定義
  dataForm = this.formBuilder.group({
    MVM_No: [{ value: '', disabled: true }], // 調撥單編號，readonly
    LOGO_No: [{ value: null, disabled: true }], // 品牌編號，readonly
    OUT_HOS_No: [{ value: null, disabled: true }], // 調出倉別，readonly
    IN_HOS_No: [{ value: null, disabled: true }], // 調入倉別，readonly
    Confirm_TotQty: [{ value: 0, disabled: true }], // 驗收數量合計，readonly
    Confirm_TotBuyNet: [{ value: 0, disabled: true }], // 驗收未稅進價合計，readonly
    APPLY_Date: [{ value: null, disabled: true }], // 申請日期，readonly
    APPLY_USR_No: [{ value: null, disabled: true }], // 申請人編號，readonly
    APRV_Date: [{ value: null, disabled: true }], // 審核日期，readonly
    APRV_USR_No: [{ value: null, disabled: true }], // 審核人編號，readonly
    OUTGODS_DATE: [{ value: null, disabled: true }], // 發貨日期，readonly
    OUTGODS_USR_No: [{ value: null, disabled: true }], // 發貨人編號，readonly
    Confirm_DATE: [{ value: new Date(), disabled: true }], // 驗收日期，預設為系統日期
    Confirm_USR_No: [{ value: '', disabled: true }], // 驗收人編號，預設為登入人員
    MVM_Remark: [null, [Validators.maxLength(200)]], // 倉別調撥單說明，可編輯
  });

  data: any[] = []; // 用於表格顯示明細數據
  columns: Column[] = [
    { field: 'MVD_SeqNo', header: '項次', visible: true },
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'MVD_BuyPrc', header: '進單價', visible: true },
    { field: 'STK_CurrentQty', header: '目前庫存', visible: true },
    { field: 'APPLY_Qty', header: '調撥申請數量', visible: true },
    { field: 'OUTGODS_QTY', header: '發貨量', visible: true },
    { field: 'Confirm_QTY', header: '驗收量', visible: true, type: 'inputNumber' },
    { field: 'Confirm_BuyNet', header: '驗收未稅進價小計', visible: true },
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
    this.loadData();
    // 載入下拉選單資料
    this.loadDropdownOptions();
    // 預設驗收人編號
    this.dataForm.patchValue({ Confirm_USR_No: this.authService.currentUserValue?.user_No });
  }

  loadData(): void {
    // 模擬從後端API載入資料
    // this.tls56060Service.queryMvmData(mvmNo).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
    //   if (response.MVM_Status !== '3') { // 檢查狀態是否為 '已發貨'
    //     console.error('調撥單狀態不正確，無法驗收');
    //     return;
    //   }
    //   this.dataForm.patchValue(response); // 載入主檔資料
    //   this.data = response.details.map(item => ({
    //     ...item,
    //     Confirm_QTY: item.OUTGODS_QTY // 驗收量預設等於發貨量
    //   }));
    //   this.calculateTotals(); // 載入後計算總計
    // });

    // 模擬資料載入
    this.dataForm.patchValue({
      MVM_No: 'WH202508130001',
      // LOGO_No: 'A001',
      // OUT_HOS_No: 'WH01',
      // IN_HOS_No: 'WH02',
      // APPLY_Date: new Date('2025-08-10'),
      // APPLY_USR_No: 'USER01',
      // APRV_Date: new Date('2025-08-11'),
      // APRV_USR_No: 'ADMIN01',
      // OUTGODS_DATE: new Date('2025-08-12'),
      // OUTGODS_USR_No: 'USER02',
      // MVM_Remark: '備註資訊'
    });
    this.data = [
      { MVD_SeqNo: 1, PLU_MagNo: 'P001', PLU_No: '12345', PLU_Name: '商品A', MVD_BuyPrc: 100, STK_CurrentQty: 50, APPLY_Qty: 10, OUTGODS_QTY: 10, Confirm_QTY: 10, Confirm_BuyNet: 1000, MVD_Remark: '' },
      { MVD_SeqNo: 2, PLU_MagNo: 'P002', PLU_No: '67890', PLU_Name: '商品B', MVD_BuyPrc: 50, STK_CurrentQty: 30, APPLY_Qty: 5, OUTGODS_QTY: 5, Confirm_QTY: 5, Confirm_BuyNet: 250, MVD_Remark: '' },
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
    // 驗證驗收量不能大於或小於發貨量
    if (editedItem.Confirm_QTY !== editedItem.OUTGODS_QTY) {
      console.error('驗收量必須與調撥發貨量一致！');
      // 這裡可以加入ToastService或Dialog來提示使用者
      return;
    }

    // 重新計算驗收相關小計
    if (editedItem.Confirm_QTY) {
      const buyNet = editedItem.MVD_BuyPrc * editedItem.Confirm_QTY;
      editedItem.Confirm_BuyNet = buyNet;

      // 稅額計算
      if (editedItem.PLU_StockTaxType === '1') { // 應稅
        editedItem.Confirm_BuyTax = Math.floor(buyNet * 0.05);
      } else { // 免稅
        editedItem.Confirm_BuyTax = 0;
      }
      editedItem.Confirm_BuyAmt = editedItem.Confirm_BuyNet + editedItem.Confirm_BuyTax;
      editedItem.Confirm_SaleAmt = editedItem.MVD_SalePrc * editedItem.Confirm_QTY;
    }

    this.calculateTotals(); // 更新總計
  }

  calculateTotals(): void {
    const totalQty = this.data.reduce((sum, item) => sum + (item.Confirm_QTY || 0), 0);
    const totalBuyNet = this.data.reduce((sum, item) => sum + (item.Confirm_BuyNet || 0), 0);

    this.dataForm.patchValue({
      Confirm_TotQty: totalQty,
      Confirm_TotBuyNet: totalBuyNet
    });
  }

  onSubmit(frm: FormGroup): void {
    // 驗收前再次檢查所有明細的驗收量是否與發貨量一致
    const isQtyValid = this.data.every(item => item.Confirm_QTY === item.OUTGODS_QTY);
    if (!isQtyValid) {
      alert('所有商品的驗收量必須與調撥發貨量一致！');
      return;
    }

    this.handleSubmit(frm, () => {
      this.loading = true;
      const body = {
        master: frm.getRawValue(),
        details: this.data
      };

      // 模擬API呼叫
      console.log('驗收提交資料：', body);
      // this.tls56060Service.updateMvmData(body).pipe(
      //   finalize(() => this.loading = false),
      //   untilDestroyed(this)
      // ).subscribe(response => {
      //   if (response.success) {
      //     alert('驗收成功！');
      //     this.onCancel(); // 返回清單頁
      //   } else {
      //     alert('驗收失敗：' + response.message);
      //   }
      // });

      this.loading = false;
      alert('驗收成功！');
      this.router.navigate(['../']); // 模擬導回列表
    });
  }

}
