import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import {
  
  PermissionsInfo,
} from '../../../models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
// 4-2-2-1角色基本資料維護
@Component({
  selector: 'app-sys0210-cru',
  templateUrl: './sys0210.cru.component.html',
  styleUrls: ['./sys0210.cru.component.scss'],
})
export class SYS0210CRUComponent
  extends BasicCrupageComponent
  implements OnInit
{

  // 表單及狀態控制
  dataForm = this.formBuilder.group({
    roleCode: ['', Validators.required], // 角色代碼
    roleName: ['', Validators.required], // 角色名稱
    roleDescription: [''], // 角色敘述
  });


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
  ) 
  
  {super();}

  ngOnInit(): void {
    this.ProgNo = '420002';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    };

    switch (state.crudstatus) {
      case CRUDStatus.Create:
        this.formTitle = '新增資料';
        this.showConfirm = this.canAdd();
        break;
      case CRUDStatus.Edit:
        this.formTitle = '編輯資料';
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      case CRUDStatus.Read:
        this.formTitle = '顯示資料';
        this.Read(state.rowdata);
        break;
    }
  }

  // 權限檢查
  canQuery(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.query) ?? false;
  }


  // 表單控制
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }



  // 提交表單
  onSubmit(form: FormGroup): void {
    this.messageService.blockUi();
    this.submitted = true;

    if (form.invalid) {
      this.messageService.errorBubble(
        this.translate.instant('form_error_message')
      );
      this.messageService.unblockUi();
      return;
    }

    if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
      this.messageService.successBubble(
        this.translate.instant('success_message')
      );
    } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
      this.messageService.successBubble(
        this.translate.instant('updated-successfully')
      );
    }

    this.messageService.unblockUi();
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onCancel() {
    this.router.navigate(['SYS0000/SYS0210']);
  }

  // 導航操作
  onCreate() {
    if (this.canAdd()) {
      const extras: NavigationExtras = {
        state: { crudstatus: CRUDStatus.Create, dataForm: this.dataForm },
        skipLocationChange: true,
      };
      this.router.navigate(['SYS0000/SYS0210'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      const extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          dataForm: this.dataForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  onDetail(data: any) {
    const extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        dataForm: this.dataForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }

  onClearForm() {
    this.dataForm.reset();
  }
}
