import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';
import { TLS5000Service } from '../../../service/API/TLS0000/tls5000.service';

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
export class TLS51010Component implements OnInit {
  ProgNo: string = '250001';
  funInfo: FunsrightInfo = {};
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    CAT_LNo: ['', [Validators.maxLength(2), this.validationService.numberValidator]],
    CAT_LName: ['', [Validators.maxLength(32)]],
  });
  data: CategoryItem[] = [];
  filteredData: CategoryItem[] = [...this.data];
  columns: any[] = [
    { field: 'CAT_LNo', header: '大分類代碼', visible: true },
    { field: 'CAT_LName', header: '大分類名稱', visible: true },
    { field: 'CAT_MRemark', header: '備註', visible: true },
    { field: 'CRT_Date', header: '創建日期', visible: false },
    { field: 'CRT_USR_No', header: '創建用戶編號', visible: false },
    { field: 'CRT_USR_Name', header: '創建用戶名稱', visible: false },
    { field: 'UPD_Date', header: '更新日期', visible: false },
    { field: 'UPD_USR_No', header: '更新用戶編號', visible: false },
    { field: 'UPD_USR_Name', header: '更新用戶名稱', visible: false }
  ];
  pageSize: number = 10;
  pageIndex: number = 0;
  totalRecords: number = 0;
  lastQueryParams: any = null;
  sortField: string = 'CAT_LNo';
  sortOrder: number = 1;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private apiService: TLS5000Service
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
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

  canQuery(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.query) as boolean;
  }
  canAdd(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.add) as boolean;
  }
  canEdit(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.edit) as boolean;
  }

  onSubmit(frm: FormGroup) {
    console.log('Form value:', frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      const queryParams = {
        CAT_LNo: frm.value.CAT_LNo || '',
        CAT_MName: frm.value.CAT_LName || '',
        PageSize: this.pageSize,
        PageIndex: this.pageIndex,
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
            this.loading = false;
            this.messageService.unblockUi();
          } else {
            console.error('API error:', response.Status, response.Message);

            this.loading = false;
            this.messageService.unblockUi();
          }
        },
        error: (err: string) => {
          console.error('API error:', err);

          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    } else {
      console.log('Form invalid or no query permission');
      this.loading = false;
      this.messageService.unblockUi();
    }
  }

  onSubmitQuery(frm: FormGroup) {
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

  onCreate() {
    if (this.canAdd()) {
      this.navigateWithState(CRUDStatus.Create);
    }
  }

  onEdit(data: CategoryItem) {
    console.log('Edit data:', data);
    if (this.canEdit()) {
      this.navigateWithState(CRUDStatus.Edit, data);
    }
  }

  onDetail(data: CategoryItem) {
    console.log(data);
    this.navigateWithState(CRUDStatus.Read, data);
  }

  navigateWithState(crudstatus: CRUDStatus, rowdata?: CategoryItem) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: crudstatus,
        rowdata: rowdata,
        queryParams: this.lastQueryParams,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        totalRecords: this.totalRecords,
        sortField: this.sortField,
        sortOrder: this.sortOrder,
      },
    };
    this.router.navigate(['/TLS5000/TLS51010CRU'], extras);
  }
}
