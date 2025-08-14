import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { NgIf } from '@angular/common';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column, createPaginationConfig, RowEditSaveEvent } from '@shared/componentkit/table/table.model';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from "primeng/table";
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { finalize } from 'rxjs';
import { IPOS56040DetailData, IQueryPOS56040DetailRequest, IQueryPOS56040DetailResponse, Tls56040Service } from '@service/api/tls/tls56040.service';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';

@Component({
  selector: 'app-tls56040-cru',
  templateUrl: './tls56040-cru.component.html',
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
    TableModule,
    InputTextareaComponent,
    TableComponent,
    DialogComponent,
    DropdownTableComponent
  ]
})
export class TLS56040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  // 主檔表單定義
  dataForm = this.formBuilder.group({
    MVM_No: [{ value: '系統自動取號', disabled: true }], // 調撥單編號，readonly, 系統自動取號
    LOGO_No: [null, Validators.required], // 品牌編號，下拉選項，必填
    OUT_HOS_No: [null, Validators.required], // 調出倉別，下拉選項，必填
    IN_HOS_No: [null, Validators.required], // 調入倉別，下拉選項，必填
    APPLY_TotBuyNet: [{ value: 0, disabled: true }], // 金額，readonly，明細加總
    APPLY_TotQty: [{ value: 0, disabled: true }], // 數量，readonly，明細加總
    APPLY_Date: [{ value: new Date(), disabled: true }], // 申請日期，預帶系統日期
    APPLY_USR_No: [{ value: '', disabled: true }], // 申請人編號，預帶登入人員
    MVM_Remark: [null, [Validators.maxLength(200)]], // 倉別調撥單說明
  });

  data: any[] = []; // 用於表格顯示明細數據
  selectedItems: any[] = []; // 用於表格選擇項目
  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'MVD_BuyPrc', header: '進單價', visible: true },
    { field: 'STK_CurrentQty', header: '目前庫存', visible: true }, // 需要SP讀取
    { field: 'APPLY_Qty', header: '調撥申請數量', visible: true, type: 'inputNumber' },
    { field: 'APPLY_BuyNet', header: '調撥申請進價未稅小計', visible: true },
    { field: 'MVD_Remark', header: '單項說明', visible: true, type: 'input' },
  ];

  // 下拉選單選項
  brandOptions: { label: string; value: string }[] = [];
  warehouseOptions: { label: string; value: string }[] = [];
  userOptions: { label: string; value: string }[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls56040Service: Tls56040Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56040', this.dataForm);

    // 載入下拉選單資料
    this.loadDropdownOptions();

    // 預設帶入登入人員編號
    this.dataForm.patchValue({ APPLY_USR_No: this.authService.currentUserValue?.user_No });

    // 調出倉別與調入倉別必需不同 的驗證
    this.dataForm.controls['OUT_HOS_No'].valueChanges.subscribe(value => {
      if (value && this.dataForm.controls['IN_HOS_No'].value === value) {
        this.dataForm.controls['IN_HOS_No'].setErrors({ 'warehouseMismatch': true });
      } else {
        this.dataForm.controls['IN_HOS_No'].setErrors(null);
      }
    });

    this.dataForm.controls['IN_HOS_No'].valueChanges.subscribe(value => {
      if (value && this.dataForm.controls['OUT_HOS_No'].value === value) {
        this.dataForm.controls['IN_HOS_No'].setErrors({ 'warehouseMismatch': true });
      } else {
        this.dataForm.controls['IN_HOS_No'].setErrors(null);
      }
    });

    // 監聽品牌和調出倉別的變動，清空明細資料
    this.dataForm.controls['LOGO_No'].valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.data = [];
      this.calculateTotals();
    });
    this.dataForm.controls['OUT_HOS_No'].valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.data = [];
      this.calculateTotals();
    });
  }

  loadDropdownOptions(): void {
    // 倉別 (HOS_No)
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(options => {
      this.warehouseOptions = options.Data.map(item => ({ label: item.Name, value: item.No }));
    });
    // 品牌代碼 (LOGO_No)
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.brandOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    // 申請人員、審核人員、結案人員 (共用人員下拉選單)
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.userOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('Form Submitted!', frm.value);
      // TODO: 提交主檔與明細資料到後端
      // this.tls56040Service.addMvmData(frm.value, this.data).pipe(
      //   finalize(() => this.loading = false),
      //   untilDestroyed(this)
      // ).subscribe(response => {
      //   // 處理成功回應
      // });
    });
  }
  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    PLU_MagNo: ['', [Validators.maxLength(20)]], // 商品管理編號
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  dialogData: IPOS56040DetailData[] = [];
  selectedItemsDialog: IPOS56040DetailData[] = [];
  dialogColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_Unit', header: '單位編號' },
    { field: 'UNIT_NAME', header: '單位名稱' },
    { field: 'MVD_BuyPrc', header: '進單價' },
    { field: 'STK_CurrentQty', header: '目前庫存' },
  ]
  dialogLoading = false;

  onQuery(frm: FormGroup) {
    // 檢查品牌和調出倉別是否已選
    if (!this.dataForm.controls.LOGO_No.value || !this.dataForm.controls.OUT_HOS_No.value) {
      return;
    }
    this.dialogLoading = true;
    const body: IQueryPOS56040DetailRequest = {
      ...frm.getRawValue(),
      SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      OUT_HOS_No: this.dataForm.controls.OUT_HOS_No.value,
      // 篩選條件：庫存量 > 0
      STK_CurrentQty: 1 // 假定後端API會根據此參數篩選庫存量>0的商品
    }
    // this.tls56040Service.queryPOS2004Detail(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
    //  this.dialogData = response.Data;
    //  this.totalRecords = response.TotalCount;
    // })
    this.dialogLoading = false; // 模擬API回傳
  }

  saveDialog() {
    this.dialogVisible = false;
    const newItems = this.selectedItemsDialog.map((item, index) => ({
      ...item,
      MVD_SeqNo: this.data.length + index + 1, // 根據目前明細數量給予項次
      APPLY_Qty: 0,
      APPLY_BuyNet: 0,
      MVD_Remark: '',
    }));
    this.data = [...this.data, ...newItems];
    this.selectedItemsDialog = [];
    this.selectedItems = [];
    this.calculateTotals();
  }

  onRowEditSave(event: RowEditSaveEvent) {
    const editedItem = event.data;
    if (editedItem.APPLY_Qty) {
      // 計算未稅小計
      const buyNet = editedItem.MVD_BuyPrc * editedItem.APPLY_Qty;
      editedItem.APPLY_BuyNet = buyNet;

      // 計算稅額
      if (editedItem.PLU_StockTaxType === 1) { // 應稅
        editedItem.APPLY_BuyTax = Math.floor(buyNet * 0.05);
      } else { // 免稅
        editedItem.APPLY_BuyTax = 0;
      }

      // 計算進價合計
      editedItem.APPLY_BuyAmt = editedItem.APPLY_BuyNet + editedItem.APPLY_BuyTax;

      // 計算售價小計
      editedItem.APPLY_SaleAmt = editedItem.MVD_SalePrc * editedItem.APPLY_Qty;
    }

    this.calculateTotals(); // 更新單行後重新計算總計
  }

  // 總計計算邏輯
  calculateTotals(): void {
    const totalQty = this.data.reduce((sum, item) => sum + (item.APPLY_Qty || 0), 0);
    const totalBuyNet = this.data.reduce((sum, item) => sum + (item.APPLY_BuyNet || 0), 0);

    this.dataForm.patchValue({
      APPLY_TotQty: totalQty,
      APPLY_TotBuyNet: totalBuyNet
    });
  }

  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 商品管理編號/國際條碼/廠商貨號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  suggestions: IQueryPOS56040DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '商品管理編號/國際條碼/廠商貨號', mainDataField: true },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  opData: IQueryPOS56040DetailResponse[] = [];// overlayPanel 裡面的table
  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  opTotalRecords = 0;

  onAutoCompleteInputChange(event: any) {
    // 檢查品牌和調出倉別是否已選
    if (!this.dataForm.controls.LOGO_No.value || !this.dataForm.controls.OUT_HOS_No.value) {
      this.suggestions = [];
      return;
    }
    const body: IQueryPOS56040DetailRequest = {
      ...event,
      SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo,
      OUT_HOS_No: this.dataForm.controls.OUT_HOS_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      queryNo: event.queryNo || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
      // 篩選條件：庫存量 > 0
      STK_CurrentQty: 1
    }
    // this.Tls56040Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
    //   this.suggestions = [...results.Data];
    // });
  }

  onformValueChanged(event: IQueryPOS56040DetailRequest) {
    // 檢查品牌和調出倉別是否已選
    if (!this.dataForm.controls.LOGO_No.value || !this.dataForm.controls.OUT_HOS_No.value) {
      this.opData = [];
      this.opTotalRecords = 0;
      return;
    }
    this.opLoading = true;
    const body: IQueryPOS56040DetailRequest = {
      ...event,
      OUT_HOS_No: this.dataForm.controls.OUT_HOS_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      // 篩選條件：庫存量 > 0
      STK_CurrentQty: 1
    };
    // this.Tls56040Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
    //  this.opData = [...results.Data]; // 更新data資料
    //  this.opTotalRecords = results.TotalCount;
    //  this.opLoading = false;
    // });
    this.opLoading = false; // 模擬API回傳
  }
}
