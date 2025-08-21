import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import {
  QueryTLS57090Request, // 統一的請求介面
  QueryTLS57090DetailResponse,
  QueryTLS57090SummaryResponse,
  Tls57090Service
} from '@service/api/tls/tls57090.service'; // 更新引入的介面
import { finalize } from 'rxjs';
import { DatePipe } from '@angular/common'; // 引入 DatePipe
import { ButtonModule } from 'primeng/button';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-tls57090',
  templateUrl: './tls57090.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    MultiSelectComponent,
    CalendarRangeQuickComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    ButtonModule
  ],
  providers: [DatePipe] // 提供 DatePipe
})
export class TLS57090Component extends BasicQueryPageComponent<QueryTLS57090DetailResponse | QueryTLS57090SummaryResponse> implements OnInit { // 調整 data 類型
  queryForm = this.formBuilder.group({
    HOS_No: [null], // 倉別 multi-select
    LOGO_No: [null], // 品牌 multi-select
    VEN_No: [''], // 廠商編號 dropdown
    // 將 APPLY_Date_Start/End 更改為 ODM_Date_Start/End 以與後端 Request 匹配
    ODM_Date_Start: [null], // 申請日期 起 calendar-range
    ODM_Date_End: [null], // 申請日期 迄
    APRV_Date_Start: [null], // 審核日期 起 calendar-range
    APRV_Date_End: [null], // 審核日期 迄
    ODM_Type: [null], // 單據類型 multi-select，之前是 TypeOrder
    Status: [null], // 單據狀態 multi-select，之前是 priceChangeStatusOptions
    DisplayMode: [1, [Validators.required]], // 顯示方式 (1: 彙總, 2: 明細)
    ...createPaginationConfig([{ field: 'HOS_NAME', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  // 將 documentTypeOptions 的 value 調整為 number 型別，以符合後端要求 (1: 進貨單, 2: 退貨單)
  documentTypeOptions = [
    { value: 1, label: '進貨單' },
    { value: 2, label: '退貨單' }
  ];
  // 修正 priceChangeStatusOptions 為單據狀態，並將 value 調整為 string 型別，以符合後端SQL ('1', '2', '9')
  documentStatusOptions = [ // 將名稱改為 documentStatusOptions 更具描述性
    { value: '1', label: '已申請' },
    { value: '2', label: '已審核' },
    { value: '9', label: '已作廢' },
  ];
  displayModeOptions = [
    { value: 1, label: '彙總' },
    { value: 2, label: '明細' },
  ];
  warehouseOptions: IDropdownItem[] = [];
  brandCodeOptions: IDropdownItem[] = [];
  vendorOptions: IDropdownItem[] = [];
  // 調整 data 類型為聯合類型，以處理兩種不同的響應結構
  data: (QueryTLS57090DetailResponse | QueryTLS57090SummaryResponse)[] = [];
  columns: Column[] = []; // 初始化為空，等待 DisplayMode 變化設定

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls57090Service: Tls57090Service,
    private datePipe: DatePipe // 注入 DatePipe
  ) { super(); }

  ngOnInit(): void {
    // 初始化 BasicQueryPageComponent，並傳入 queryForm 和 onSubmit 處理函式
    this.initializePage('TLS57090', 'tls/tls57090cru', this.queryForm, (form) => this.onSubmit(form));

    // 監聽 DisplayMode 變化以更新表格欄位
    this.queryForm.controls.DisplayMode.valueChanges.pipe(untilDestroyed(this)).subscribe(mode => {
      this.updateTableColumns(mode);
    });
    // 立即更新一次表格欄位，確保初始狀態正確
    this.updateTableColumns(this.queryForm.controls.DisplayMode.value);

    // 載入下拉選單資料
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(response => {
      this.warehouseOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` })); // 倉別
    });
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.brandCodeOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` })); // 品牌
    });
    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.vendorOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` })); // 廠商
    });
  }

  // 根據 DisplayMode 動態更新表格欄位
  updateTableColumns(displayMode: number | null) {
    if (displayMode === 1) { // 彙總模式
      this.columns = [
        { field: 'HOS_NAME', header: '倉別', visible: true, showSort: true },
        { field: 'LOGO_CH_NAME', header: '品牌', visible: true, showSort: true },
        { field: 'ODM_Date', header: '申請日期', visible: true, showSort: true, format: formatDate },
        { field: 'APRV_Date', header: '審核日期', visible: true, showSort: true, format: formatDate },
        { field: 'ODM_No', header: '單號', visible: true, showSort: true },
        { field: 'ODM_Type', header: '單據類型', visible: true, showSort: true },
        { field: 'ODM_Status', header: '單據狀態', visible: true, showSort: true },
        { field: 'ODD_ConfirmQty', header: '數量', visible: true, showSort: true, format: formatAmount },
        { field: 'ODM_TotalBuyNet', header: '未稅金額', visible: true, showSort: true, format: formatAmount },
        { field: 'ODM_TotalBuyTax', header: '稅額', visible: true, showSort: true, format: formatAmount },
        { field: 'ODM_TotalBuyAmt', header: '應稅金額', visible: true, showSort: true, format: formatAmount },
      ];
      this.data = [];
    } else if (displayMode === 2) { // 明細模式
      this.columns = [
        { field: 'HOS_NAME', header: '倉別', visible: true, showSort: true },
        { field: 'LOGO_CH_NAME', header: '品牌', visible: true, showSort: true },
        { field: 'ODM_Date', header: '申請日期', visible: true, showSort: true, format: formatDate },
        { field: 'APRV_Date', header: '審核日期', visible: true, showSort: true, format: formatDate },
        { field: 'ODM_No', header: '單號', visible: true, showSort: true },
        { field: 'ODM_Type', header: '單據類型', visible: true, showSort: true },
        { field: 'ODM_Status', header: '單據狀態', visible: true, showSort: true },
        { field: 'PLU_MagNo', header: '商品管理編號', visible: true, showSort: true }, // 明細特有
        { field: 'PLU_Name', header: '品名', visible: true, showSort: true }, // 明細特有
        { field: 'ODD_ConfirmQty', header: '數量', visible: true, showSort: true, format: formatAmount },
        { field: 'ODD_BuyNet', header: '未稅金額', visible: true, showSort: true, format: formatAmount }, // 明細特有
        { field: 'ODD_BuyTax', header: '稅額', visible: true, showSort: true, format: formatAmount }, // 明細特有
        { field: 'ODD_BuyAmt', header: '應稅金額', visible: true, showSort: true, format: formatAmount }, // 明細特有
        { field: 'ODD_SalePrc', header: '售價', visible: true, showSort: true, format: formatAmount }, // 明細特有
        { field: 'ODD_SaleAmt', header: '售價小計', visible: true, showSort: true, format: formatAmount }, // 明細特有
      ];
      this.data = [];
    } else {
      this.columns = []; // 預設或未知模式時清空欄位
      this.data = [];
    }
  }

  // 提交查詢表單
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      const displayMode = formValue.DisplayMode; // 獲取顯示模式

      // 構建統一的請求物件 QueryTLS57090Request
      const requestBody: QueryTLS57090Request = {
        ReportType: displayMode === 1 ? '彙總' : '明細', // 根據 DisplayMode 動態設定 ReportType
        HOS_No: formValue.HOS_No,
        LOGO_No: formValue.LOGO_No,
        VEN_No: formValue.VEN_No,
        // 日期物件轉換為 YYYY-MM-DD 字串，使用 DatePipe 處理日期格式
        ODM_Date_Start: formValue.ODM_Date_Start ? this.datePipe.transform(formValue.ODM_Date_Start, 'yyyy-MM-dd') ?? undefined : undefined,
        ODM_Date_End: formValue.ODM_Date_End ? this.datePipe.transform(formValue.ODM_Date_End, 'yyyy-MM-dd') ?? undefined : undefined,
        APRV_Date_Start: formValue.APRV_Date_Start ? this.datePipe.transform(formValue.APRV_Date_Start, 'yyyy-MM-dd') ?? undefined : undefined,
        APRV_Date_End: formValue.APRV_Date_End ? this.datePipe.transform(formValue.APRV_Date_End, 'yyyy-MM-dd') ?? undefined : undefined,
        ODM_Type: formValue.ODM_Type, // 單據類型
        Status: formValue.Status, // 單據狀態
        pageIndex: frm.value.pageIndex,
        pageSize: frm.value.pageSize,
        SortBy: frm.value.SortBy,
      };

      this.tls57090Service.queryTLS57090(requestBody).pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          if (response.Data) { // 檢查是否成功且有 queryData
            this.totalRecords = response.TotalCount || 0; // 直接從 totalCount 獲取總筆數
            this.historyRequestBody = requestBody;
            // 根據 ReportType 決定填充明細或彙總資料
            if (requestBody.ReportType === '明細') {
              this.data = response.Data.DetailData || [];
            } else { // '彙總'
              this.data = response.Data.SummaryData || [];
            }
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          } else {
            this.data = [];
            this.totalRecords = 0;
            this.messageService.warnBubble(response.Message || '沒有找到符合條件的資料。'); // 使用 errorMessage
          }
        });
    });
  }
  btnLoading = false;
  historyRequestBody: QueryTLS57090Request | null = null;
  onExport() {
    if (!this.historyRequestBody) {
      return;
    }
    this.tls57090Service.exportTLS57090(this.historyRequestBody)
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          const contentDisposition = response.headers.get('Content-Disposition');
          // 從 header 讀取檔案名稱
          const filename = this.getFilenameFromHeader(contentDisposition);
          const blob = response.body;

          if (blob && blob.size > 0) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename; // 使用解析出的檔名
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          } else {
            this.messageService.warnBubble('沒有找到符合條件的資料，無法生成報表。');
          }
        },
      });
  }
  getFilenameFromHeader(contentDisposition: string | null): string {
    if (!contentDisposition) {
      return 'download.pdf'; // 如果 header 不存在，給一個預設檔名
    }
    const filenameMatch = contentDisposition.match(/filename\*?=['"]?([^'"]*)['"]?/);
    if (filenameMatch && filenameMatch.length > 1) {
      try {
        // 解碼 URL-encoded 的檔名，例如 UTF-8''...
        const decoded = decodeURIComponent(filenameMatch[1]);
        return decoded.startsWith("UTF-8''") ? decoded.substring(7) : decoded;
      } catch (error) {
        return filenameMatch[1];
      }
    }
    return 'download.pdf';
  }
}
