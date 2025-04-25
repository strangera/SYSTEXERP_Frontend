import { BigCategoryCodeService } from './../../../service/basic/big-category-code.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS5000Service } from '../../../service/API/TLS0000/tls5000.service';

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
    // 其他欄位
  ];
  pageSize: number = 10;
  pageIndex: number = 0;
  totalRecords: number = 0;
  lastQueryParams: any = null;
  sortField: string = 'CAT_MNo';
  sortOrder: number = 1;
  // ----------------------------------------------------------------
  bigCategoryOptions: any[] = [];

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

    //TODO:等API如果確認要用哪支再看要用哪支 先用假資料
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => {
      this.bigCategoryOptions = data;
    });

    const state = history.state as NavigationState;
    console.log('Navigation state:', state); // 調試用
    if (state && state.queryParams) {
      this.lastQueryParams = state.queryParams;
      this.pageIndex = state.pageIndex || 0;
      this.pageSize = state.pageSize || 10;
      this.totalRecords = state.totalRecords || 0;
      this.sortField = state.sortField || 'CAT_LNo';
      this.sortOrder = state.sortOrder || 1;
      this.queryForm.patchValue({
        CAT_LNo: this.lastQueryParams.CAT_LNo || '',
        CAT_MNo: this.lastQueryParams.CAT_MNo || '',
        CAT_MName: this.lastQueryParams.CAT_MName || ''
      });
      this.onSubmit(this.queryForm);
    }
  }

  onSubmit(frm: FormGroup) {
    console.log('Form value:', frm.value); // 調試表單值
    this.handleSubmit(frm, () => {
      const queryParams = {
        CAT_LNo: frm.value.CAT_LNo || '',
        CAT_MNo: frm.value.CAT_MNo || '', // 修正：使用 CAT_MNo
        CAT_MName: frm.value.CAT_MName || '',
        PageSize: this.pageSize,
        PageIndex: 0, // 修正：支援動態分頁
        OrderBy: this.sortField || 'CAT_MNo',
        SortBy: [{ field: this.sortField || 'CAT_MNo', order: this.sortOrder || 1 }]
      };
      this.lastQueryParams = queryParams;
      console.log('Query params:', queryParams); // 調試查詢參數

      this.apiService.queryPOS20031(queryParams).subscribe({
        next: (response: any) => {
          console.log('API response:', response);
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || response.Data.length;
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


  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
  // ----------------------------------------------------------------

}
