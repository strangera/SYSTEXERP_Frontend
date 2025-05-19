import { UserCodeService } from './../../../service/basic/user-code.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';

@Component({
  selector: 'app-sys0320',
  templateUrl: './sys0320.component.html',
  styleUrls: ['./sys0320.component.scss'],
})
// 4.2.3.2 使用者系統權限設定
export class SYS0320Component extends BasicQpageComponent implements OnInit {
  // 查詢表單設定
  // ----------------------------------------------------------------
  queryForm = this.formBuilder.group({
    userCode: [null, [Validators.required]], // 使用者代碼
  });

  // 下拉選單選項
  userCodeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private userCodeService: UserCodeService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '420007';
    // 初始化權限資訊
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // 加載使用者代碼選項
    this.userCodeService.getUserCode().subscribe((data) => {
      this.userCodeOptions = data;
    });
  }

  // 表單提交邏輯
  onSubmit(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交查詢邏輯
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  // 查詢邏輯
  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }

  // 清除表單
  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }

  // 建立新項目
  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };

      this.router.navigate(['/SYS0000/SYS0320CRU'], extras);
    }
  }

  // 進行下一步的邏輯
  onSubmitNext(frm: FormGroup) {
    this.onNext(frm);
  }

  // 下一步邏輯
  onNext(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 進行下一步的邏輯
      this.router.navigate(['/SYS0000/SYS0320CRU']);
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  // 編輯邏輯
  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };

      this.router.navigate(['/SYS0000/SYS0320CRU'], extras);
    }
  }

  // 詳細資料邏輯
  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };

    this.router.navigate(['/SYS0000/SYS0320CRU'], extras);
  }
}
