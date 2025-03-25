import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// 權限相關
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../models/system/funsrightInfo';
// 共用服務
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/service/notification.service';
import { ViolationCategoryService } from '../../../service/basic/violation-category.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';

const now = new Date();
//商場違規類別維護作業
@Component({
  selector: 'app-tls25010-mod',

  templateUrl: './tls25010-mod.component.html',
  styleUrl: './tls25010-mod.component.scss',
})
export class TLS25010ModComponent {
  ProgNo: string = '220032';

  // 權限變數
  funInfo: FunsrightInfo = {};
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
    violationCategoryCode: [, [Validators.required, Validators.maxLength(20)]], // 違規類別編號
    violationCategoryName: [, [Validators.required, Validators.maxLength(20)]], // 違規類別名稱
  });

  // 下拉選單選項
  violationCategoryOptions: any[] = [];

  // 表格資料
  data: any[] = [];
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
    private violationCategoryService: ViolationCategoryService // 違規類別編號 service
  ) {}

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
  
    // 從 sessionStorage 獲取資料
    const violationCategoryData = sessionStorage.getItem('violationCategoryData');
    if (violationCategoryData) {
      const data = JSON.parse(violationCategoryData);
      this.queryForm.controls['violationCategoryName'].setValue(data.violationCategoryName);
      this.queryForm.controls['violationCategoryCode'].setValue(data.violationCategoryCode);
    }
  
    // 初始化其他資料
    this.violationCategoryService.getViolationCategories().subscribe((data) => {
      this.violationCategoryOptions = data;
    });
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
    this.queryForm.reset(); // 重置表單
    this.router.navigate(['TLS2000/TLS25010']);
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
      let extras: NavigationExtras = {
        state: {
          crudstatus: 'Edit',
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
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
  onSubmitMOD() {}
}
