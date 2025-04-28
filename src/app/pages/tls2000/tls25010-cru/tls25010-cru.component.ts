import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// 權限相關
import {
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
// 共用服務
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { ViolationCategoryService } from '../../../service/basic/violation-category.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';


const now = new Date();
//商場違規類別維護作業
@Component({
  selector: 'app-tls25010-cru',
  templateUrl: './tls25010-cru.component.html',
  styleUrl: './tls25010-cru.component.scss'
})
export class TLS25010CRUComponent extends BasicCrupageComponent implements OnInit {

  // ProgNo: string = '220032';

  // // 權限變數
  // funInfo: FunsrightInfo = {};
  // addPermission: HasPermissionsValue = {
  //   progNo: this.ProgNo,
  //   permission: PermissionsInfo.add,
  // };
  // queryPermission: HasPermissionsValue = {
  //   progNo: this.ProgNo,
  //   permission: PermissionsInfo.query,
  // };
  // editPermission: HasPermissionsValue = {
  //   progNo: this.ProgNo,
  //   permission: PermissionsInfo.edit,
  // };

  // 查詢表單
  loading: boolean = false;
  // submitted: boolean = false;
  dataForm = this.formBuilder.group({
    violationCategory: [1, Validators.required],  // 違規類別編號
    violationCategoryName: [, Validators.required],  // 違規類別名稱
  });

  // 下拉選單選項
  violationCategoryOptions: any[] = [];



  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private violationCategoryService: ViolationCategoryService,  // 違規類別編號 service
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '220032';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.violationCategoryService.getViolationCategories().subscribe((data) => {
      this.violationCategoryOptions = data;
    });
    // ----------------------------------------------------------------
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.crudstatus = CRUDStatus.Edit;
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      // 讀檔
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }
  }
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  canQuery(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.query) as boolean;
  }

  // canAdd(): boolean {
  //   return this.funInfo.permissions?.includes(PermissionsInfo.add) as boolean;
  // }

  // canEdit(): boolean {
  //   return this.funInfo.permissions?.includes(PermissionsInfo.edit) as boolean;
  // }

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
    this.dataForm.reset();  // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: 'Create',
          queryform: this.dataForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS25010'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: 'Edit',
          rowdata: data,
          queryform: this.dataForm,
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
        queryform: this.dataForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
    this.router.navigate(['TLS2000/TLS25010']);
  }

  onCancel() {
    this.router.navigate(['TLS2000/TLS25010']);
  }
}
