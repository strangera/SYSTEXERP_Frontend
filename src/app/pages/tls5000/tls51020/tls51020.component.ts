import { BigCategoryCodeService } from './../../../service/basic/big-category-code.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS5000Service } from '../../../service/API/TLS0000/tls5000.service';
import { debounceTime } from 'rxjs';

interface CategoryItem {
  id: 0;
  CAT_LNo: string;
  CAT_MNo: string;
  CAT_MName: string;
  CAT_MRemark: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

interface NavigationState {
  crudstatus?: CRUDStatus;
  rowdata?: any;
  queryParams?: any;
  pageIndex?: number;
  pageSize?: number;
  totalRecords?: number;
  sortField?: string;
  sortOrder?: number;
}
// 本地儲存鍵：用於儲存查詢狀態
const storageKey = 'TLS51020';

// 2.5.1.2  中分類維護作業
@Component({
  selector: 'app-tls51020',
  templateUrl: './tls51020.component.html',
  styleUrl: './tls51020.component.scss'
})
export class TLS51020Component extends BasicQueryPageComponent<CategoryItem> implements OnInit {
  // ProgNo: string = '250002';
  queryForm = this.formBuilder.group({
    CAT_MNo: ['', [Validators.maxLength(3), this.validationService.numberValidator]], // 中分類代碼
    CAT_MName: ['', [Validators.maxLength(32)]], // 中分類名稱
    CAT_LNo: [], // 大分類代碼 / 名稱
    // CAT_MRemark: [,], // 說明
  });
  // 表格
  // ----------------------------------------------------------------
  data: CategoryItem[] = [];
  filteredData: CategoryItem[] = [...this.data];
  //篩選表格的欄位
  columns: any[] = [
    { field: 'CAT_MNo', header: '中分類代碼', visible: true },
    { field: 'CAT_MName', header: '中分類名稱', visible: true },
    { field: 'CAT_LNo', header: '大分類代碼 / 名稱', visible: true },
    { field: 'CAT_MRemark', header: '備註', visible: true },
    // 其他欄位CAT_MRemark
  ];
  pageSize: number = 10;
  pageIndex: number = 0;
  totalRecords: number = 0;
  lastQueryParams: any = null;
  sortField: string = 'CAT_MNo';
  sortOrder: number = 1;
  // ----------------------------------------------------------------
  bigCategoryOptions: any[] = [];
  // 多選項目
  selectedItems: CategoryItem[] = [];

  constructor(
    private validationService: ValidationService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private apiService: TLS5000Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('250002', '/TLS5000/TLS51020CRU');

    // 新增：調試權限數據
    console.log('funInfo:', this.funInfo);
    console.log('queryPermission:', this.queryPermission);

    //TODO:下拉等API如果確認要用哪支再看要用哪支 先用假資料
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => {
      this.bigCategoryOptions = data;
    });

    // 恢復查詢狀態並自動查詢
    this.handleQueryRestore(this.queryForm, storageKey, (form) => this.onSubmit(form));

    // 監聽表單變化，延遲儲存有效值
    this.queryForm.valueChanges
      .pipe(debounceTime(500)) // 延遲 500ms 減少頻繁儲存
      .subscribe(value => {
        if (this.queryForm.valid) {
          this.queryStateService.setQueryState(storageKey, value);
        }
      });
  }

  onSubmit(frm: FormGroup): void {
    console.log('Form value:', frm.value); // 調試表單值
    this.handleSubmit(frm, () => {
      const queryParams = {
        CAT_LNo: frm.value.CAT_LNo || '',
        CAT_MNo: frm.value.CAT_MNo || '',
        CAT_MName: frm.value.CAT_MName || '',
        PageSize: this.pageSize,
        PageIndex: 0,
        SortBy: [{ field: this.sortField || 'CAT_MNo', order: this.sortOrder || 1 }]
      };
      this.lastQueryParams = queryParams;
      console.log('Query params:', queryParams); // 調試查詢參數

      this.apiService.queryTLS51020(queryParams).subscribe({
        next: (response: any) => {
          console.log('API response:', response);
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(storageKey, frm.value);
            if (this.data.length === 0) {
              console.log('查詢結果為空');
            }
          } else {
            console.error('API error:', response.Status, response.Message);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    });
  }


  // 查詢按鈕：重置分頁並提交查詢
  onSubmitQuery(frm: FormGroup): void {
    console.log('onSubmitQuery triggered');
    this.pageIndex = 0;
    this.onSubmit(frm);
  }

  onClearForm(): void {
    this.queryForm.reset();
    this.pageIndex = 0;
    this.data = [];
    this.filteredData = [];
    this.lastQueryParams = null;
    this.totalRecords = 0;
    this.sortField = 'CAT_LNo';
    this.sortOrder = 1;
    // 清空儲存的查詢狀態
    this.queryStateService.clearQueryState(storageKey);
  }

  onDelete(data: CategoryItem | CategoryItem[]): void {
    console.log('Delete data:', JSON.stringify(data, null, 2));

    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      console.error('No items to delete');
      this.messageService.errorBubble('無法刪除：沒有選中的項目');
      return;
    }

    items.forEach((item, index) => {
      console.log('Processing item:', JSON.stringify(item, null, 2));
      if (!item || item.id == null || item.id === undefined) {
        console.error('ID is missing or invalid for item:', item);
        this.messageService.errorBubble(`無法刪除項目 ${item?.CAT_LNo || '未知'}：缺少 ID`);
        return;
      }

      const requestBody = {
        id: item.id // 保持 number 型別
      };
      console.log('Request body:', JSON.stringify(requestBody));
      this.apiService.deleteTLS51020(requestBody).subscribe({
        next: (response: any) => {
          console.log('API response:', response);
          if (response.Status === '0000') {
            this.messageService.successBubble(`項目 ${item.CAT_LNo} 刪除成功`);
          } else {
            console.error('API error:', response.Status, response.Message);
            this.messageService.errorBubble(`項目 ${item.CAT_LNo} 刪除失敗: ${response.Message}`);
          }
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.messageService.errorBubble(`項目 ${item.CAT_LNo} 刪除失敗`);
        },
        complete: () => {
          if (index === items.length - 1) {
            this.onSubmit(this.queryForm);
          }
        }
      });
    });

    this.selectedItems = [];
  }
  // ----------------------------------------------------------------

}
