import { Component, OnInit } from '@angular/core';
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
import { WhetherService } from '../../../service/basic/whether.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';

const now = new Date();

@Component({
  selector: 'app-tls25020-cru',
  templateUrl: './tls25020-cru.component.html',
  styleUrl: './tls25020-cru.component.scss',
})
export class TLS25020CRUComponent
  extends BasicCrupageComponent
  implements OnInit {
  // ProgNo: string = '220033';

  // // 權限變數
  // funInfo?: FunsrightInfo;
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
    violationCategoryId: [1, Validators.required], // 違規類別編號
    violationNumber: [, Validators.required], // 違規編號
    violationContent: [, Validators.required], // 違規內容
    amountStart: [, Validators.required], // 金額起始
    amountEnd: [, Validators.required], // 金額結束
    amountEditable: [], // 金額是否可修改
  });

  // 下拉選單選項
  violationCategoryOptions: any[] = [];
  whetherOptions: any[] = [];



  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private violationCategoryService: ViolationCategoryService, // 違規類別編號 service
    private whetherService: WhetherService // 金額是否可修改 service
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '220033';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.violationCategoryService.getViolationCategories().subscribe((data) => {
      this.violationCategoryOptions = data;
    });

    this.whetherService.getWhetherOptions().subscribe((data) => {
      this.whetherOptions = data;
    });
  }

  canQuery(): boolean {
    return true;
  }

  // canAdd(): boolean {
  //   return true;
  // }

  // canEdit(): boolean {
  //   return true;
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

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: 'Create',
          queryform: this.dataForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS25020'], extras);
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
      this.router.navigate(['/demo/demoinputtableCRU'], extras);
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
    this.router.navigate(['/demo/demoinputtableCRU'], extras);
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset();  // 重置表單
  }

  onCancel() {
    this.router.navigate(['TLS2000/TLS25020']);
  }
}
