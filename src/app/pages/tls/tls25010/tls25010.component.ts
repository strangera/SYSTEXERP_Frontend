import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// 權限相關
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
// 共用服務
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ViolationCategoryService } from '../../../service/basic/violation-category.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

const now = new Date();
//商場違規類別維護作業
@Component({
  selector: 'app-tls25010',
  templateUrl: './tls25010.component.html',
  styleUrls: ['./tls25010.component.scss']
})
export class TLS25010Component {

  ProgNo: string = '220032';

  // 權限變數
  funInfo?: FunsrightInfo;
  addPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.add,
  };
  queryPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.query,
  };
  editPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.edit,
  };

  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    violationCategory: [, [Validators.required, Validators.maxLength(20)]],  // 違規類別編號
    violationCategoryName: [, [Validators.required, Validators.maxLength(20)]],  // 違規類別名稱
  });

  // 下拉選單選項
  violationCategoryOptions: any[] = [];

  // 表格資料
  data: any[] = [{ 'violationCategoryCode': '1', 'violationCategoryName': '發票使用規範', 'isdelete': true }

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'violationCategoryCode', header: '違規類別編號', visible: true },
    { field: 'violationCategoryName', header: '違規類別名稱', visible: true },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private violationCategoryService: ViolationCategoryService,  // 違規類別編號 service
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.violationCategoryService.getViolationCategories().subscribe((data) => {
      this.violationCategoryOptions = data;
    });
  }

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: 'Create',
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS25010CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      // 將違規類別資料存入 sessionStorage
      sessionStorage.setItem('violationCategoryData', JSON.stringify(data));

      const extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS25010MOD'], extras);
    }
  }

  onRowClick(data: any): void {
    const extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        violationCategoryName: data.violationCategoryName,  // 傳遞 violationCategoryName
      },
      skipLocationChange: true,
    };
    this.router.navigate(['TLS2000/TLS25010MOD'], extras);
  }
  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: 'Read',
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}
