import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { RoleCodeService } from '../../../service/basic/role-code.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
// 4-2-2-2角色之使用者設定維護
@Component({
  selector: 'app-sys0230',
  templateUrl: './sys0230.component.html',
  styleUrls: ['./sys0230.component.scss'],
})

export class SYS0230Component extends BasicQpageComponent implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    roleCode: [, [Validators.required]], // DropDown
  });

  // 選項
  roleCodeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private roleCodeService: RoleCodeService
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '420003';
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
    this.roleCodeService.getRoleCodes().subscribe((data) => {
      this.roleCodeOptions = data;
    });
  }

  onNext(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: frm.value,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      // 提交邏輯
      this.router.navigate(['/SYS0000/SYS0230CRU'], extras);
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitNext(frm: FormGroup) {
    // 查詢邏輯
    this.onNext(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
}
