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
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from "primeng/table";
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { finalize } from 'rxjs';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { Tls56070Service } from '@service/api/tls/tls56070.service';

@Component({
  selector: 'app-tls56070-cru',
  templateUrl: './tls56070-cru.component.html',
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
    DropdownTableComponent,
  ]
})
export class TLS56070CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  // 主檔表單定義
  dataForm = this.formBuilder.group({
    SCRP_No: [{ value: '系統自動取號', disabled: true }], // 報廢單編號，readonly, 系統自動取號
    LOGO_No: [null, Validators.required], // 品牌代碼，下拉選項，必填
    HOS_No: [null, Validators.required], // 報廢倉別，下拉選項，必填
    SCRP_Reason: [null, [Validators.maxLength(200)]], // 報廢案由說明
    APPLY_Date: [{ value: new Date(), disabled: true }], // 申請日期，預帶系統日期
    APPLY_USR_No: [{ value: '', disabled: true }], // 申請人編號，預帶登入人員
    details: this.formBuilder.array([]), // 明細資料
  });

  data: any[] = []; // 用於表格顯示明細數據
  selectedItems: any[] = []; // 用於表格選擇項目
  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'Stock_Qty', header: '庫存數量', visible: true },
    { field: 'SCRP_Qty', header: '報廢數量', visible: true, type: 'inputNumber' },
    { field: 'PLU_Unit', header: '商品單位', visible: true },
    { field: 'Detail_Remark', header: '單項說明', visible: true, type: 'input' },
  ];

  // 下拉選單選項
  brandOptions: { label: string; value: string }[] = [];
  warehouseOptions: { label: string; value: string }[] = [];
  userOptions: { label: string; value: string }[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls56070Service: Tls56070Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56070', this.dataForm);

    // 載入下拉選單資料
    this.loadDropdownOptions();

    // 預設帶入登入人員編號
    this.dataForm.patchValue({ APPLY_USR_No: this.authService.currentUserValue?.user_No });

    // 監聽品牌和報廢倉別的變動，清空明細資料
    this.dataForm.controls['LOGO_No'].valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.data = [];
    });
    this.dataForm.controls['HOS_No'].valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.data = [];
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
    // 申請人員 (共用人員下拉選單)
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.userOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 檢查報廢數量是否有效
      for (const item of this.data) {
        if (item.SCRP_Qty > item.Stock_Qty) {
          this.messageService.errorBubble(`商品 ${item.PLU_MagNo} 的報廢數量(${item.SCRP_Qty})大於庫存數量(${item.Stock_Qty})，不允許存檔。`);
          return;
        }
      }

      const saveData = {
        ...frm.value,
        details: this.data.map((item, index) => ({
          ...item,
          SCRP_SeqNo: index + 1,
        }))
      };

      // TODO: 提交主檔與明細資料到後端
      // this.tls56070Service.addScrapData(saveData).pipe(
      //   finalize(() => this.loading = false),
      //   untilDestroyed(this)
      // ).subscribe(response => {
      //   this.messageService.success(response.Message);
      //   this.router.navigate(['/TLS/TLS56070']);
      // });
      this.loading = false;
    });
  }

  onBrandChange(): void {
    this.data = [];
  }

  onWarehouseChange(): void {
    this.data = [];
  }
  // ------------------------------------ Dialog 邏輯 ------------------------------------
  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    PLU_MagNo: ['', [Validators.maxLength(20)]], // 商品管理編號
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  dialogData: any[] = [];
  selectedItemsDialog: any[] = [];
  dialogColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_Unit', header: '單位' },
    { field: 'PLU_SalePrice', header: '售價' },
    { field: 'Stock_Qty', header: '庫存量' },
  ]
  dialogLoading = false;

  onQuery(frm: FormGroup) {
    if (!this.dataForm.controls.LOGO_No.value || !this.dataForm.controls.HOS_No.value) {
      return;
    }
    this.dialogLoading = true;
    const body = {
      ...frm.getRawValue(),
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      HOS_No: this.dataForm.controls.HOS_No.value,
      STK_CurrentQty: 1 // 篩選庫存量 > 0
    }
    // this.tls52010Service.queryPOS2004Detail(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
    //  this.dialogData = response.Data;
    //  this.totalRecords = response.TotalCount;
    // })
    // 模擬 API 回傳
    const mockData = [
      { PLU_MagNo: 'P001', PLU_No: '471000000001', PLU_Name: '商品A', PLU_Unit: '個', PLU_SalePrice: 100, Stock_Qty: 50 },
      { PLU_MagNo: 'P002', PLU_No: '471000000002', PLU_Name: '商品B', PLU_Unit: '瓶', PLU_SalePrice: 250, Stock_Qty: 100 },
      { PLU_MagNo: 'P003', PLU_No: '471000000003', PLU_Name: '商品C', PLU_Unit: '箱', PLU_SalePrice: 1500, Stock_Qty: 10 },
    ];
    this.dialogData = mockData;
    this.totalRecords = mockData.length;
    this.dialogLoading = false;
  }

  saveDialog() {
    this.dialogVisible = false;
    const newItems = this.selectedItemsDialog.map((item) => {
      // 檢查是否已存在，避免重複新增
      const existingItem = this.data.find(d => d.PLU_MagNo === item.PLU_MagNo);
      return existingItem || {
        ...item,
        SCRP_Qty: null, // 預設報廢數量為空
        Detail_Remark: '', // 預設單項說明為空
      };
    }).filter(item => item !== undefined); // 過濾掉重複項目

    // 將新選取的項目加入到明細資料中，並排除重複項目
    const uniqueNewItems = newItems.filter(newItem => !this.data.some(existingItem => existingItem.PLU_MagNo === newItem.PLU_MagNo));

    this.data = [...this.data, ...uniqueNewItems];
    this.selectedItemsDialog = [];
    this.selectedItems = [];
  }

  // ------------------------------------ 搜尋框邏輯 ------------------------------------
  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 商品管理編號/國際條碼/廠商貨號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  suggestions: any[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '商品管理編號/國際條碼/廠商貨號', mainDataField: true },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  opData: any[] = [];// overlayPanel 裡面的table
  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  opTotalRecords = 0;

  onAutoCompleteInputChange(event: any) {
    if (!this.dataForm.controls.LOGO_No.value || !this.dataForm.controls.HOS_No.value) {
      this.suggestions = [];
      return;
    }
    const body = {
      ...event,
      HOS_No: this.dataForm.controls.HOS_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      queryNo: event.queryNo || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
      STK_CurrentQty: 1 // 篩選庫存量 > 0
    }
    // this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
    //  this.suggestions = [...results.Data];
    // });
    // 模擬 API 回傳
    const mockData = [
      { PLU_MagNo: 'P001', PLU_No: '471000000001', PLU_Name: '商品A', PLU_Unit: '個', PLU_SalePrice: 100, Stock_Qty: 50 },
      { PLU_MagNo: 'P002', PLU_No: '471000000002', PLU_Name: '商品B', PLU_Unit: '瓶', PLU_SalePrice: 250, Stock_Qty: 100 },
      { PLU_MagNo: 'P003', PLU_No: '471000000003', PLU_Name: '商品C', PLU_Unit: '箱', PLU_SalePrice: 1500, Stock_Qty: 10 },
    ];
    this.suggestions = mockData;
  }

  onformValueChanged(event: any) {
    if (!this.dataForm.controls.LOGO_No.value || !this.dataForm.controls.HOS_No.value) {
      this.opData = [];
      this.opTotalRecords = 0;
      return;
    }
    this.opLoading = true;
    const body = {
      ...event,
      HOS_No: this.dataForm.controls.HOS_No.value,
      LOGO_No: this.dataForm.controls.LOGO_No.value,
      STK_CurrentQty: 1
    };
    // this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
    //  this.opData = [...results.Data]; // 更新data資料
    //  this.opTotalRecords = results.TotalCount;
    //  this.opLoading = false;
    // });
    // 模擬 API 回傳
    const mockData = [
      { PLU_MagNo: 'P001', PLU_No: '471000000001', PLU_Name: '商品A', PLU_Unit: '個', PLU_SalePrice: 100, Stock_Qty: 50 },
      { PLU_MagNo: 'P002', PLU_No: '471000000002', PLU_Name: '商品B', PLU_Unit: '瓶', PLU_SalePrice: 250, Stock_Qty: 100 },
      { PLU_MagNo: 'P003', PLU_No: '471000000003', PLU_Name: '商品C', PLU_Unit: '箱', PLU_SalePrice: 1500, Stock_Qty: 10 },
    ];
    this.opData = mockData;
    this.opTotalRecords = mockData.length;
    this.opLoading = false;
  }
}
