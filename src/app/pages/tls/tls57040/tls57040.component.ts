import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { InputTextareaComponent } from "@shared/componentkit/input-textarea/input-textarea.component";
import { IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse } from '@service/api/tls/tls52010.service';

// 假設的資料介面
interface ITLS57040Data {
  brand: string;
  managementID: string;
  barcode: string;
  vendorCode: string;
  productName: string;
  specificationDescription: string;
  inventoryQuantity: number;
  sellingPrice: number;
}
@Component({
  selector: 'app-tls57040',
  templateUrl: './tls57040.component.html',
  standalone: true,
  imports: [
    MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    InputTextComponent, DropdownTableComponent, DropdownComponent,
    TableComponent, Button, TooltipModule, TranslateModule,
    ButtonComponent, CheckboxModule,
    InputTextareaComponent
  ]
})
export class TLS57040Component extends BasicQueryPageComponent<ITLS57040Data> implements OnInit {
  queryForm = this.formBuilder.group({
    brandCode: [null], // 品牌代碼 (下拉式選單)
    brandName: [null], // 品牌名稱 (下拉式選單)
    managementID: [null], // 管理編號 (下拉式選單)
    PLU_No: [''], // 國際條碼 (文字輸入)
    vendorItemNumber: [''], // 廠商貨號 (文字輸入)
    bigCategoryCode: [null], // 大分類代碼 (下拉式選單)
    midCategoryCode: [null], // 中分類代碼 (下拉式選單)
    smallCategoryCode: [null], // 小分類代碼 (下拉式選單)
    series: [''], // 系列 (文字輸入，這裡用 input text 代替 editor text)
    displayEmptyStock: [false], // 顯示庫存為零 (核取方塊)
    displayStandardCost: [false], // 顯示標準進價 (核取方塊)
    displayImage: [false], // 顯示圖片 (核取方塊)
    rows: [8], // 顯示行數 (文字輸入)
    ...createPaginationConfig([{ field: 'someField', order: 1 }]), // 根據你的排序需求修改
  });

  // 查詢結果表格相關
  totalRecords = 0;
  data: ITLS57040Data[] = [];
  selectedItems: ITLS57040Data[] = [];

  columns: Column[] = [
    { field: 'brand', header: '品牌', visible: true },
    { field: 'managementID', header: '管理編號', visible: true },
    { field: 'barcode', header: '國際條碼', visible: true },
    { field: 'vendorCode', header: '廠商代號', visible: true },
    { field: 'productName', header: '品名', visible: true },
    { field: 'specificationDescription', header: '規格說明', visible: true },
    { field: 'inventoryQuantity', header: '庫存數', visible: true },
    { field: 'sellingPrice', header: '售價', visible: true },
  ];

  // 下拉選單資料
  brandCodeOptions: any[] = [];
  managementIDOptions: any[] = [];
  bigCategoryOptions: any[] = [];
  midCategoryOptions: any[] = [];
  smallCategoryOptions: any[] = [];

  // 商品管理編號 (dropdown-table)
  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]),
  });
  suggestions: IQueryPOS2004DetailResponse[] = [];
  opData: IQueryPOS2004DetailResponse[] = [];
  opTotalRecords = 0;
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '商品管理編號', mainDataField: true },
  ];
  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];

  constructor(
  ) {
    super();
  }

  ngOnInit(): void {
    // 初始化共用方法
    this.initializePage('TLS57040', '', this.queryForm, (form) => this.onSubmit(form));

    // 載入所有下拉選單資料
    this.loadDropdowns();
  }

  // 載入下拉選單資料的方法
  loadDropdowns() {
    // 註解：使用服務載入下拉選單資料
    /*
    this.brandCodeService.getSystemTypes().pipe(untilDestroyed(this)).subscribe((data) => {
      this.brandCodeOptions = data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    this.managementIDService.getSystemTypes().pipe(untilDestroyed(this)).subscribe((data) => {
      this.managementIDOptions = data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    this.bigCategoryService.getCategories().pipe(untilDestroyed(this)).subscribe((data) => {
      this.bigCategoryOptions = data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    this.midCategoryService.getSubCategories().pipe(untilDestroyed(this)).subscribe((data) => {
      this.midCategoryOptions = data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    this.smallCategoryService.getSmallCategories().pipe(untilDestroyed(this)).subscribe((data) => {
      this.smallCategoryOptions = data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    */
    // 這裡可以放模擬的靜態資料來測試
  }

  // 表單提交處理方法
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 註解：呼叫 TLS57040 的查詢 API，並傳入表單值
      /*
      this.tls57040Service.queryTLS57040(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
      */
      // 模擬 API 呼叫結果
      console.log('執行 TLS57040 查詢', frm.value);
      this.data = [
        { brand: '品牌A', managementID: 'MG001', barcode: 'BC001', vendorCode: 'VEN001', productName: '商品A', specificationDescription: '規格A', inventoryQuantity: 10, sellingPrice: 100 },
        { brand: '品牌B', managementID: 'MG002', barcode: 'BC002', vendorCode: 'VEN002', productName: '商品B', specificationDescription: '規格B', inventoryQuantity: 5, sellingPrice: 200 },
      ];
      this.totalRecords = 2;
      this.loading = false;
    });
  }

  // 商品管理編號 (dropdown-table) 的自動完成輸入事件
  onAutoCompleteInputChange(event: any) {
    const body: any = {
      queryNo: event.PLU_MagNo || '',
      // ... 其他欄位
    };
    // 註解：呼叫查詢商品資料的 API
    /*
    this.tls57040Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data];
    });
    */
  }

  // 商品管理編號 (dropdown-table) 的表單值改變事件
  onformValueChanged(event: IQueryPOS2004DetailRequest) {
    this.opLoading = true;
    const body = {
      queryNo: event.queryNo || '',
      PLU_Name: event.PLU_Name || '',
      // ... 其他欄位
    };
    // 註解：呼叫查詢商品資料的 API
    /*
    this.tls57040Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.opData = [...results.Data];
      this.opTotalRecords = results.TotalCount;
      this.opLoading = false;
    });
    */
  }
}
