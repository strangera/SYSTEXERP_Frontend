import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { QueryPLUResponse, QueryTLS57040Request, QueryTLS57040Response, Tls57040Service } from '@service/api/tls/tls57040.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextareaComponent } from "@shared/componentkit/input-textarea/input-textarea.component";
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatAmount } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { debounceTime, finalize } from 'rxjs';

@Component({
  selector: 'app-tls57040',
  templateUrl: './tls57040.component.html',
  standalone: true,
  imports: [
    MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    DropdownTableComponent, DropdownComponent,
    TooltipModule, TranslateModule,
    ButtonComponent, CheckboxModule,
    InputTextareaComponent, TableReportComponent
  ]
})
export class TLS57040Component extends BasicQueryPageComponent<QueryTLS57040Response> implements OnInit {
  queryForm = this.formBuilder.group({
    LOGO_No: [null], // 品牌代碼 (下拉式選單)
    PLU_MagNo: [null, [Validators.maxLength(20)]], // 商品管理編號 (下拉式表格選單)
    PLU_No: [null, [Validators.maxLength(20)]], // 國際條碼 (文字輸入)
    PLU_OrgPLUNo: [null, [Validators.maxLength(30)]], // 廠商貨號 (文字輸入)
    CAT_LNo: [null], // 大分類代碼 (下拉式選單)
    CAT_MNo: [null], // 中分類代碼 (下拉式選單)
    CAT_SNo: [null], // 小分類代碼 (下拉式選單)
    PLU_Reserve3: ['', [Validators.maxLength(400)]], // 系列 (文字輸入，SQL中是模糊查詢)
    ShowCurrentQty: [false], // 顯示庫存為零 (核取方塊)
    ShowOrderPrc: [false], // 顯示標準進價
    ShowImage: [false], // 顯示圖片
  });
  totalRecords = 0;
  historyRequestBody?: QueryTLS57040Request;
  data: QueryTLS57040Response[] = [];
  columns: ReportColumn[] = [
    { field: 'PLU_Image', header: '圖片', visible: false, type: 'image' },
    { field: 'LOGO_No', header: '品牌代碼', visible: true },
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true }, // 新增品牌名稱欄位
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'PLU_Reserve2', header: '規格說明', visible: true },
    { field: 'STK_CurrentQty', header: '庫存數量', visible: true, format: formatAmount },
    { field: 'PLU_SalePrc', header: '售價', visible: true, format: formatAmount },
    { field: 'TotSaleAmt', header: '售價小計', visible: true, format: formatAmount },// 售價小計欄位
    { field: 'PLU_OrderPrc', header: '標準進價', visible: false, format: formatAmount },// 標準進價欄位
  ];

  // 下拉選單資料
  brandCodeOptions: { label: string, value: string }[] = []; // 品牌
  CAT_LNoOptions: IDropdownItem[] = [];
  CAT_MNoOptions: IDropdownItem[] = [];
  CAT_SNoOptions: IDropdownItem[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService,
    public readonly tls57040Service: Tls57040Service
  ) {
    super();
  }

  ngOnInit(): void {
    // 初始化共用方法
    this.initializePage('TLS57040', '', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdowns();
  }

  // 載入下拉選單資料的方法
  loadDropdowns() {
    // 品牌代碼 (LOGO_No)
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.brandCodeOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    // 獲取大分類下拉選項
    this.dropDownListService.queryPOS2003_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.CAT_LNoOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
    });
    // 監聽大分類變化
    this.queryForm.controls.CAT_LNo.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((value) => {
      if (value) {
        this.dropDownListService.queryPOS20031_DropDownList({ CAT_LNo: [value] }).pipe(untilDestroyed(this)).subscribe(response => {
          this.CAT_MNoOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
        });
      }
      this.queryForm.controls.CAT_MNo.setValue(null); // 清空中分類選擇
      this.queryForm.controls.CAT_SNo.setValue(null); // 清空中分類選擇
    });
    // 監聽中分類變化
    this.queryForm.controls.CAT_MNo.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((value) => {
      if (value && this.queryForm.controls.CAT_LNo.value) {
        this.dropDownListService.queryPOS20032_DropDownList({
          CATList: [
            {
              CAT_LNo: this.queryForm.controls.CAT_LNo.value,
              CAT_MNo: value
            }
          ]
        }).pipe(untilDestroyed(this)).subscribe(response => {
          this.CAT_SNoOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
        });
      }
      this.queryForm.controls.CAT_SNo.setValue(null); // 清空中分類選擇
    });
  }

  // 表單提交處理方法
  onSubmit(frm: FormGroup) {
    const obj: any = null;
    obj.hello();
    this.handleSubmit(frm, () => {
      // 檢查是否勾選了「顯示標準進價」
      const showStandardCost = frm.controls['ShowOrderPrc'].value;
      this.columns = this.columns.map(col => {
        if (col.field === 'PLU_OrderPrc') {
          return { ...col, visible: showStandardCost };
        }
        return col;
      });
      // 檢查是否勾選了「顯示圖片」
      const showImage = frm.controls['ShowImage'].value;
      this.columns = this.columns.map(col => {
        if (col.field === 'PLU_Image') {
          return { ...col, visible: showImage };
        }
        return col;
      });
      const body = {
        ...frm.value,
        pageIndex: 1,
        pageSize: 30,
        SortBy: [{ field: 'LOGO_No', order: 1 }, { field: 'PLU_MagNo', order: 1 }],
      }
      this.tls57040Service.queryTLS57040(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.historyRequestBody = body;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  // 商品管理編號 (dropdown-table)
  suggestions: QueryPLUResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_No', header: '國際條碼/商品管理編號/廠商貨號', mainDataField: true },
  ];
  // 商品管理編號 (dropdown-table) 的自動完成輸入事件
  onAutoCompleteInputChange(event: Record<'label', string>) {
    const body = {
      queryNo: event.label || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'plu_no', order: 1 }],
    }
    this.tls57040Service.queryPLUForDropdown(body).pipe(untilDestroyed(this), debounceTime(300)).subscribe((results) => {
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: item.PLU_No + '/' + item.PLU_MagNo + '/' + item.PLU_OrgPLUNo + ' - ' + item.PLU_Name
      }))];
    });
  }
}
