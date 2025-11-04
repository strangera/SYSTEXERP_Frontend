import { DropdownApiService } from './../../../service/utility/dropdown-api.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ColumnGroup, formatAmount, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Tls57160DataItem, Tls57160Request, Tls57160Service } from '@service/api/tls/tls57160.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime, finalize } from 'rxjs';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { QueryPLUResponse, Tls57040Service } from '@service/api/tls/tls57040.service';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { yesterday } from '@shared/models/system/query-form.model';

@Component({
  selector: 'app-tls57160',
  templateUrl: './tls57160.component.html',
  standalone: true,
  imports: [DropdownTableComponent, AsyncPipe, TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, CalendarComponent, CheckboxModule, InputNumberComponent, ButtonComponent, TranslateModule]
})
export class TLS57160Component extends BasicQueryPageComponent<Tls57160DataItem> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    STK_Date: [yesterday, [Validators.required]],
    HOS_NO: [null, [Validators.required]],
    LOGO_No: [null, [Validators.required]],
    PLU_MagNo: [null, [Validators.maxLength(20)]],
    PLU_NO: [null, [Validators.maxLength(20)]],
    PLU_OrgPLUNo: [null, [Validators.maxLength(30)]],
    stockIsZero: [false],
    pageSize: [30, [Validators.required, Validators.min(30)]],
    pageIndex: [1],
  });
  HOS_NOOptions = this.dropdown.queryPos2034();
  LOGO_NoOptions = this.dropdown.queryPluLogo();
  totalRecords = 0;
  footerTotal: Tls57160DataItem | null = null;
  historyRequestBody: Tls57160Request | null = null;
  data: Tls57160DataItem[] = [];
  columns: ReportColumn[] = [
    // { field: 'HOS_No', header: '倉別', visible: true },    // 倉別 (HOS_No)
    { field: 'PLU_MagNo', header: '管理編號', visible: true }, // 商品編號 (PLU_MagNo)
    { field: 'PLU_Name', header: '商品名稱', visible: true }, // 商品名稱 (PLU_Name)
    { field: 'PLU_No', header: '國際條碼', visible: true },   // 國際條碼 (PLU_No)

    // 庫齡 1-6 個月
    { field: 'STK_Qty1_6', header: '數量', visible: true, groupField: '1-6個月' },
    { field: 'STK_Cost1_6', header: '成本', visible: true, groupField: '1-6個月', format: formatAmount },

    // 庫齡 7-12 個月
    { field: 'STK_Qty7_12', header: '數量', visible: true, groupField: '7-12個月' },
    { field: 'STK_Cost7_12', header: '成本', visible: true, groupField: '7-12個月', format: formatAmount }, // 修正：原欄位為 STK_Qty13_18 且標題錯誤

    // 庫齡 13-18 個月
    { field: 'STK_Qty13_18', header: '數量', visible: true, groupField: '13-18個月' }, // 修正：原欄位為 STK_Qty7_12 且標題錯誤
    { field: 'STK_Cost13_18', header: '成本', visible: true, groupField: '13-18個月', format: formatAmount }, // 修正：原欄位為 STK_Qty19_24 且標題錯誤

    // 庫齡 19-24 個月
    { field: 'STK_Qty19_24', header: '數量', visible: true, groupField: '19-24個月' }, // 修正：原欄位為 STK_Qty25_36 且標題錯誤
    { field: 'STK_Cost19_24', header: '成本', visible: true, groupField: '19-24個月', format: formatAmount }, // 修正：原欄位為 STK_Cost1_6 且標題錯誤

    // 庫齡 25-36 個月
    { field: 'STK_Qty25_36', header: '數量', visible: true, groupField: '25-36個月' }, // 修正：原欄位為 STK_Cost7_12 且標題錯誤
    { field: 'STK_Cost25_36', header: '成本', visible: true, groupField: '25-36個月', format: formatAmount }, // 修正：原欄位為 STK_Cost13_18 且標題錯誤

    // 庫齡 36 個月以上
    { field: 'STK_Qty36_UP', header: '數量', visible: true, groupField: '36個月以上' }, // 修正：原欄位為 STK_Cost19_24 且標題錯誤
    { field: 'STK_Cost36_UP', header: '成本', visible: true, groupField: '36個月以上', format: formatAmount }, // 修正：原欄位為 STK_Cost25_36 且標題錯誤

    { field: 'STK_Qty', header: '數量', visible: true, groupField: '合計' }, // 合計數量 (STK_Qty)
    { field: 'STK_Cost', header: '成本', visible: true, groupField: '合計', format: formatAmount },  // 合計成本 (STK_Cost)
    // 總計/單價
    { field: 'STK_UnitCost', header: '平均單價', visible: true, format: formatAmount }, // 平均單價 (STK_UnitCost)
    { field: 'PLU_SalePrc', header: '當期售價', visible: true, format: formatAmount },  // 當期售價 (PLU_SalePrc)
  ];

  columnGroup: ColumnGroup[] = [
    { field: '1-6個月', header: '1-6個月' },
    { field: '7-12個月', header: '7-12個月' },
    { field: '13-18個月', header: '13-18個月' },
    { field: '19-24個月', header: '19-24個月' },
    { field: '25-36個月', header: '25-36個月' },
    { field: '36個月以上', header: '36個月以上' },
    { field: '合計', header: '合計' }
  ];

  // --- 商品管理編號 (Dropdown-Table) 相關屬性 ---
  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 管理編號 (模糊查詢用)
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱 (模糊查詢用)
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]),
  });
  suggestions: QueryPLUResponse[] = [];
  opData: QueryPLUResponse[] = [];
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
  // --- 商品管理編號 (Dropdown-Table) 相關屬性結束 ---

  constructor(
    public readonly tls57160Service: Tls57160Service,
    private readonly dropdown: DropdownApiService,
    private readonly tls57040Service: Tls57040Service,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS57160'); // 更改程式代號
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      const requestBody: Tls57160Request = {
        ...formValue,
        STK_Date: this.datePipe.transform(formValue.STK_Date, 'yyyy-MM-dd'),
      };

      this.tls57160Service.queryTLS57160(requestBody).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        if (response.Data && response.Data.length > 0) {
          this.totalRecords = response.TotalCount;
          console.log(response);

          this.footerTotal = response.footerData?.[0] ?? null; // 根據 ReportType 取得總計
          this.historyRequestBody = requestBody;
          this.data = response.Data;
        } else {
          this.data = [];
          this.totalRecords = 0;
        }
      });
    });
  }

  // --- 商品管理編號 (dropdown-table) 相關方法 ---

  // 商品管理編號 (dropdown-table) 的自動完成輸入事件
  onAutoCompleteInputChange(event: any) {
    // 確保 event.PLU_MagNo 是字串或 null，並將其賦予 queryNo
    const body = {
      queryNo: event.PLU_MagNo || '',
      PLU_MagNo: undefined, // 不需要傳遞給後端，由 queryNo 負責模糊查詢
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
    }
    // 使用 Tls57040Service 進行商品查詢
    this.tls57040Service.queryPLUForDropdown(body).pipe(untilDestroyed(this), debounceTime(300)).subscribe((results) => {
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: `${item.PLU_MagNo} - ${item.PLU_Name}`
      }))];
    });
  }

  // 商品管理編號 (dropdown-table) 的表單值改變事件 (表格查詢)
  onformValueChanged(event: any) {
    this.opLoading = true;
    const body = {
      ...event,
      queryNo: event.queryNo || undefined, // 模糊查詢欄位
      PLU_Name: event.PLU_Name || undefined, // 商品名稱模糊查詢欄位
    };
    // 使用 Tls57040Service 進行商品查詢
    this.tls57040Service.queryPLUForDropdown(body).pipe(untilDestroyed(this), debounceTime(300)).subscribe((results) => {
      this.opData = [...results.Data]; // 更新data資料
      this.opTotalRecords = results.TotalCount;
      this.opLoading = false;
    });
  }
  // --- 商品管理編號 (dropdown-table) 相關方法結束 ---
}
