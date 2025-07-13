import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
// Permissions
// Shared
import { ValidationService } from '../../../shared/service/validation.service';
import { SortMeta } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Sysb500m } from '../../../shared/models/sys/sysb000.module';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

// 本地儲存鍵：用於儲存查詢狀態
const storageKey = 'TLS41020';

// 2.4.1.2 收銀機EDC資料維護
@Component({
    selector: 'app-tls41020',
    templateUrl: './tls41020.component.html',
    styleUrl: './tls41020.component.scss',
    standalone: true,
    imports: [
        MenubarComponent,
        ButtonComponent,
        AccordionModule,
        FormsModule,
        ReactiveFormsModule,
        InputNumberComponent,
        CalendarRangeComponent,
        MultiSelectComponent,
        TableComponent,
        TranslateModule,
    ],
})
export class TLS41020Component
  extends BasicQueryPageComponent<any>
  implements OnInit {
  // 查詢
  // ----------------------------------------------------------------
  queryForm = this.formBuilder.group({
    // POS1002EDC 收銀機EDC設定檔
    SYS_StoreNo: [, [Validators.maxLength(10)]], // 收銀機所屬門市店號
    ECR_No: [, [Validators.maxLength(6)]], // 收銀機號
    EDC_No: [, [Validators.maxLength(8)]], // 信用卡刷卡機代碼
    // ECR_LocNo: [, [Validators.maxLength(10)]], // 收銀機位置 #JOIN POS1002
    EDC_BegDate_From: [], // 啟用日期
    EDC_BegDate_To: [], // 啟用日期
    EDC_EdnDate_From: [], // 停用日期
    EDC_EdnDate_To: [], // 停用日期
    EDC_Status: [[] as number[], [Validators.maxLength(2)]], // 信用卡刷卡機狀態 A=啟用 C=停用
    ECR_TLT_No: [, [Validators.maxLength(20)]], // 機台所屬專櫃編號
    ECR_TLT_Name: ['', [Validators.maxLength(60)]], // 機台所屬櫃位名稱
    //
    EDC_IP1: [, [Validators.maxLength(20)]], // 第一台信用卡刷卡機IP
    EDC_IP2: [, [Validators.maxLength(20)]], // 第二台信用卡刷卡機IP
    EDC_IP3: [, [Validators.maxLength(20)]], // 第三台信用卡刷卡機IP
    EDC_TmID1: [, [Validators.maxLength(8)]], // 第一台信用卡刷卡機端末機代碼
    EDC_TmID2: [, [Validators.maxLength(8)]], // 第二台信用卡刷卡機端末機代碼
    EDC_TmID3: [, [Validators.maxLength(8)]], // 第三台信用卡刷卡機端末機代碼

    //分頁查詢
    pageSize: [10],
    pageIndex: [0],
    SortBy: [[{ field: 'area_no', order: 1 }] as SortMeta[]],
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    {
      SYS_StoreNo: 'strore123',
      ECR_No: 'register123',
      EDC_No: 'edc123',
      EDC_BegDate: '2024/01/01',
      EDC_EdnDate: '2024/02/02',
      EDC_Status: 'A',
      ECR_TLT_No: 'counter123',
      ECR_TLT_Name: '測試專櫃',
      EDC_IP1: 'EDCcasher123',
    },
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'SYS_StoreNo', header: '收銀機所屬門市店號', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'EDC_No', header: '信用卡刷卡機代碼', visible: true },

    { field: 'EDC_BegDate', header: '啟用日期', visible: true },
    { field: 'EDC_EdnDate', header: '停用日期', visible: true },
    { field: 'EDC_Status', header: '信用卡刷卡機狀態', visible: true },

    { field: 'ECR_TLT_No', header: '機台所屬專櫃編號', visible: true },
    { field: 'ECR_TLT_Name', header: '機台所屬櫃位名稱', visible: true },
    { field: 'EDC_IP1', header: '第一台信用卡刷卡機IP', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------

  // 表格數據和篩選數據
  // // 分頁和排序參數
  // pageSize: number = 10;
  // pageIndex: number = 0;
  totalRecords = 0;
  // lastQueryParams: any = null;
  // sortField: string = 'CAT_LNo';
  // sortOrder: number = 1;

  // 多選項目
  selectedItems: any[] = [];

  EDC_Status_Option: any[] = [
    { value: 'A', label: '啟用' },
    { value: 'C', label: '停用' },
  ];

  constructor(private validationService: ValidationService) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41020', 'TLS/TLS41020CRU');

    // 恢復查詢狀態並自動查詢
    this.handleQueryRestore(this.queryForm, storageKey, (form) =>
      this.onSubmit(form),
    );
  }
  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('queryForm', frm.value);
      // this.sysb500Service.querySYSB500(frm.value).subscribe({
      //   next: (response: any) => {
      //     console.log('API response:', response);
      //     if (response.Status === '0000') {
      //       this.data = response.Data || [];
      //       this.filteredData = [...this.data];
      //       this.totalRecords = response.TotalCount || response.Data.length;
      //       this.queryStateService.setQueryState(storageKey, frm.value);
      //     } else {
      //       console.error('API error:', response.Status, response.Message);
      //     }
      //     this.loading = false;
      //     this.messageService.unblockUi();
      //   },
      //   error: (err: string) => {
      //     console.error('API error:', err);
      //     this.loading = false;
      //     this.messageService.unblockUi();
      //   },
      // });
    });
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  // 刪除項目
  onDelete(data: Sysb500m | Sysb500m[]): void {
    console.log('Delete data:', JSON.stringify(data, null, 2));

    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      console.error('No items to delete');
      this.messageService.errorBubble('無法刪除：沒有選中的項目');
      return;
    }

    // 收集所有有效的 ID
    const idList = items
      .filter((item) => item && item.id != null && item.id !== undefined)
      .map((item) => item.id);

    if (idList.length === 0) {
      console.error('No valid IDs to delete');
      this.messageService.errorBubble('無法刪除：選中的項目缺少有效 ID');
      return;
    }

    const deleteBody = {
      idList: idList, // 符合 API 的 idList 格式
    };

    // this.sysb500Service.deleteSYSB500(deleteBody).subscribe({
    //   next: (response: any) => {
    //     if (response.Status === '0000') {
    //       this.messageService.successBubble('選中項目刪除成功');
    //     } else {
    //       console.error('API error:', response.Status, response.Message);
    //       this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
    //     }
    //   },
    //   error: (err: string) => {
    //     console.error('API error:', err);
    //     this.messageService.errorBubble('刪除失敗');
    //   },
    //   complete: () => {
    //     this.onSubmit(this.queryForm);
    //   },
    // });

    this.selectedItems = [];
  }

  loadData(event: TableLazyLoadEvent) {
    const form = this.queryForm.value;
    if (this.totalRecords === 0) {
      return;
    }
    form.pageSize = event.rows && event.rows > 0 ? event.rows : 10;
    form.pageIndex = (event.first ?? 0) / form.pageSize + 1;
    form.SortBy = event.multiSortMeta ?? [{ field: 'area_no', order: 1 }];
    this.onSubmit(this.queryForm);
  }
}
