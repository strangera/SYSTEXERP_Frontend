import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/service/notification.service';
import { RoleCodeServiceService } from '../../../service/basic/role-code-service.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
// 4-2-3-1角色系統權限設定
@Component({
  selector: 'app-sys0310',
  templateUrl: './sys0310.component.html',
  styleUrls: ['./sys0310.component.scss'],
})

export class SYS0310Component extends BasicQpageComponent implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    roleCode: ['', [Validators.required]], // 角色代碼 DropDown
  });
  // 表格

  userCodeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private roleCodeServiceService: RoleCodeServiceService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '420006';
    // 初始化權限資訊
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // 加載使用者代碼選項
    this.roleCodeServiceService.getSystemTypes().subscribe((data) => {
      this.userCodeOptions = data;
    });
  }

  onSubmitNext(frm: FormGroup) {
    this.onNext(frm);
  }

  onNext(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      this.router.navigate(['/SYS0000/SYS0310CRU']);
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交查詢邏輯
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }
}
