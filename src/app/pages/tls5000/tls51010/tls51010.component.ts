import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';
import { TLS5000Service } from '../../../service/API/TLS0000/tls5000.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
interface CategoryItem {
  CAT_LNo: string;
  CAT_LName: string;
  CAT_MRemark: string | null;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
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

@Component({
  selector: 'app-tls51010',
  templateUrl: './tls51010.component.html',
  styleUrl: './tls51010.component.scss'
})
export class TLS51010Component extends BasicQueryPageComponent<CategoryItem> implements OnInit {
  // 移除：ProgNo 移到 initializePage 設置
  // ProgNo: string = '250001';

  // 移除：funInfo 由父類提供
  // funInfo: FunsrightInfo = {};

  // 移除：權限屬性由父類提供
  // addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  // queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  // editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };

  // 移除：loading 和 submitted 由父類提供
  // loading: boolean = false;
  // submitted: boolean = false;

  queryForm = this.formBuilder.group({
    CAT_LNo: ['', [Validators.maxLength(2), this.validationService.numberValidator]],
    CAT_LName: ['', [Validators.maxLength(32)]],
  });

  data: CategoryItem[] = [];
  filteredData: CategoryItem[] = [...this.data];
  //篩選表格的欄位
  columns: any[] = [
    { field: 'CAT_LNo', header: '大分類代碼', visible: true },
    { field: 'CAT_LName', header: '大分類名稱', visible: true },
    { field: 'CAT_LRemark', header: '備註', visible: true },
  ];
  pageSize: number = 10;
  pageIndex: number = 0;
  totalRecords: number = 0;
  lastQueryParams: any = null;
  sortField: string = 'CAT_LNo';
  sortOrder: number = 1;

  constructor(
    // 移除：父類已注入 Router、FormBuilder、NotificationService 和 AuthService
    private validationService: ValidationService,
    private apiService: TLS5000Service
  ) {
    // 新增：調用父類構造函數
    super();
  }

  ngOnInit(): void {
    // 新增：在 ngOnInit 中調用 initializePage 設置 ProgNo 和 cruPage
    this.initializePage('250001', '/TLS5000/TLS51010CRU');

    // 新增：調試權限數據
    console.log('funInfo:', this.funInfo);
    console.log('queryPermission:', this.queryPermission);

    // 移除：funInfo 初始化由父類處理
    // this.funInfo = this.authService.getUserPermissions(this.ProgNo);

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
        CAT_LName: this.lastQueryParams.CAT_MName || '',
      });
      this.onSubmit(this.queryForm);
    }
  }

  // 移除：canQuery、canAdd 和 canEdit 由父類的 canPerformAction 替代
  // canQuery(): boolean {
  //   return this.funInfo.permissions?.includes(PermissionsInfo.query) as boolean;
  // }
  // canAdd(): boolean {
  //   return this.funInfo.permissions?.includes(PermissionsInfo.add) as boolean;
  // }
  // canEdit(): boolean {
  //   return this.funInfo.permissions?.includes(PermissionsInfo.edit) as boolean;
  // }

  onSubmit(frm: FormGroup) {
    console.log('Form value:', frm.value);
    // 修改：使用父類的 handleSubmit 替代原始邏輯（移除 canQuery 檢查）
    this.handleSubmit(frm, () => {
      const queryParams = {
        CAT_LNo: frm.value.CAT_LNo || '',
        CAT_LName: frm.value.CAT_LName || '',
        PageSize: this.pageSize,
        PageIndex: '1',
        OrderBy: this.sortField || 'CAT_LNo',
        SortBy: [{ field: this.sortField || 'CAT_LNo', order: this.sortOrder || 1 }]
      };
      this.lastQueryParams = queryParams;
      console.log('Query params:', queryParams);

      this.apiService.queryPOS2003(queryParams).subscribe({
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
          // 確保 loading 狀態重置
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err: string) => {
          console.error('API error:', err);
          // 確保 loading 狀態重置
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    });
  }

  onSubmitQuery(frm: FormGroup) {
    // 新增：調試日誌
    console.log('onSubmitQuery triggered');
    this.pageIndex = 0;
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();
    this.pageIndex = 0;
    this.data = [];
    this.filteredData = [];
    this.lastQueryParams = null;
    this.totalRecords = 0;
    this.sortField = 'CAT_LNo';
    this.sortOrder = 1;
  }

  onPageChange(event: any) {
    this.pageIndex = event.page;
    this.pageSize = event.rows;
    this.onSubmit(this.queryForm);
  }

  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.onSubmit(this.queryForm);
  }

  // 移除：onCreate、onEdit 和 onDetail 由父類提供
  // onCreate() {
  //   if (this.canAdd()) {
  //     this.navigateWithState(CRUDStatus.Create);
  //   }
  // }
  // onEdit(data: CategoryItem) {
  //   console.log('Edit data:', data);
  //   if (this.canEdit()) {
  //     this.navigateWithState(CRUDStatus.Edit, data);
  //   }
  // }
  // onDetail(data: CategoryItem) {
  //   console.log(data);
  //   this.navigateWithState(CRUDStatus.Read, data);
  // }

  // // 修改：重寫 navigateWithState 以保留分頁狀態
  // navigateWithState(crudstatus: CRUDStatus, rowdata?: CategoryItem) {
  //   let extras: NavigationExtras = {
  //     state: {
  //       crudstatus: crudstatus,
  //       rowdata: rowdata,
  //       queryParams: this.lastQueryParams,
  //       pageIndex: this.pageIndex,
  //       pageSize: this.pageSize,
  //       totalRecords: this.totalRecords,
  //       sortField: this.sortField,
  //       sortOrder: this.sortOrder,
  //     },
  //   };
  //   this.router.navigate([this.cruPage], extras);
  // }
}
