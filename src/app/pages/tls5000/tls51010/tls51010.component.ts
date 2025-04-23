import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';
import { TLS5000Service } from '../../../service/API/TLS0000/tls5000.service';

@Component({
  selector: 'app-tls51010',
  templateUrl: './tls51010.component.html',
  styleUrl: './tls51010.component.scss'
})
export class TLS51010Component {
  ProgNo: string = '250001';
  funInfo: FunsrightInfo = {};
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    CAT_LNo: ['', [Validators.maxLength(2), this.validationService.numberValidator]], // 大分類代碼
    CAT_LName: ['', [Validators.maxLength(32)]], // 大分類名稱
  });
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'CAT_LNo', header: '大分類代碼', visible: true },
    { field: 'CAT_LName', header: '大分類名稱', visible: true },
    { field: 'CAT_MRemark', header: '備註', visible: true },
    { field: 'CRT_Date', header: 'test', visible: false },
    { field: 'CRT_USR_No', header: 'test', visible: false },
    { field: 'CRT_USR_Name', header: 'test', visible: false },
    { field: 'UPD_Date', header: 'test', visible: false },
    { field: 'UPD_USR_No', header: 'test', visible: false },
    { field: 'UPD_USR_Name', header: 'test', visible: false }
  ];
  // 分頁參數
  pageSize: number = 10; // 每頁顯示條數
  pageIndex: number = 0; // 當前頁碼（從 0 開始）

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
        CAT_LName: frm.value.CAT_LName || '',
        PageSize: this.pageSize,
        PageIndex: this.pageIndex,
        // 可選：如果後端需要排序
        OrderBy: 'CAT_LNo',
        SortBy: [{ field: 'CAT_LNo', order: 1 }]
      };

      console.log('Query params:', queryParams);

      this.apiService.queryPOS2003(queryParams).subscribe({
        next: (response: any) => {
          console.log('API response:', response);
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.filteredData = [...this.data];
            this.loading = false;
            this.messageService.unblockUi();
          } else {
            console.error('API error:', response.Status);
            this.loading = false;
            this.messageService.unblockUi();
          }
        },
        error: (err) => {
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
    this.pageIndex = 0; // 查詢時重置到第一頁
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();
    this.pageIndex = 0;
    this.data = [];
    this.filteredData = [];
  }

  // 分頁事件處理（如果使用分頁組件）
  onPageChange(event: any) {
    this.pageIndex = event.page; // PrimeNG 分頁事件，page 從 0 開始
    this.pageSize = event.rows; // 每頁顯示條數
    this.onSubmit(this.queryForm); // 重新查詢
  }

  onCreate() {
    if (this.canAdd()) {
      this.navigateWithState(CRUDStatus.Create);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(CRUDStatus.Edit, data);
    }
  }

  onDetail(data: any) {
    console.log(data);
    this.navigateWithState(CRUDStatus.Read, data);
  }

  navigateWithState(crudstatus: CRUDStatus, rowdata?: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: crudstatus,
        rowdata: rowdata,
      },
    };
    console.log(crudstatus);
    this.router.navigate(['/TLS5000/TLS51010CRU'], extras);
  }
}
