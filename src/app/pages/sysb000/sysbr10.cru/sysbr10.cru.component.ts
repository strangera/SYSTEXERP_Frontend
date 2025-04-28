import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
//
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { AnnouncementUserService } from './../../../service/basic/announcement-user.service';
import { RoleCodeServiceService } from './../../../service/basic/role-code-service.service';
import { AnnouncementCategoryService } from './../../../service/basic/announcement-category.service';
import { UserStatusService } from './../../../service/basic/user-status.service';

@Component({
  selector: 'app-SYSBR10.cru',
  templateUrl: './SYSBR10.cru.component.html',
  styleUrl: './SYSBR10.cru.component.scss'
})
// 佈告欄管理作業 CRU
export class SYSBR10CRUComponent extends BasicCrupageComponent implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // POS5101_公告檔

    // STO_No: ['', [Validators.required, Validators.maxLength(10)]], // 分店編號
    ANS_Type: [, [Validators.required]], // 公告類別
    Announcements: [], // 公告事項
    ANS_BegDateTime: [, [Validators.required]], // 有效開始日期時間
    ANS_EndDateTime: [, [Validators.required]], // 有效結束日期時間
    ANS_Role: [[] as number[], [Validators.maxLength(1)]], // 公告角色Y/N
    group_no: [[] as number[], [Validators.maxLength(1)]], // 階層代碼
    section_no: [[] as number[], [Validators.maxLength(1)]], // 組織代碼
    ANS_Desc: [,], // 公告內容

    Crt_DateTime: [], // 建檔日期時間 //不顯示於主畫面
  });
  //
  userStatusOptions: any[] = [];
  announcementOptions: any[] = [];
  roleCodeOptions: any[] = [];
  announcementUserOptions: any[] = [];
  YNOptions: any[] = [
    { value: 1, label: '是' },
    { value: 0, label: '否' },
  ];
  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private validationService: ValidationService,
    //
    private userStatusService: UserStatusService,
    private announcementCategoryService: AnnouncementCategoryService,
    private roleCodeServiceService: RoleCodeServiceService,
    private announcementUserService: AnnouncementUserService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '410014';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.userStatusService.getUserStatus().subscribe(data => {
      this.userStatusOptions = data;
    });
    //
    this.announcementCategoryService.getSystemTypes().subscribe(data => {
      this.announcementOptions = data;
    });
    //
    this.roleCodeServiceService.getSystemTypes().subscribe(data => {
      this.roleCodeOptions = data;
    });
    //
    this.announcementUserService.getSystemTypes().subscribe(data => {
      this.announcementUserOptions = data;
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
  // ----------------------------------------------------------------
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }//CRU

  onCancel() {
    this.router.navigate(['/SYSB000/SYSBR10']);
  }
  //------------------------------------------------------------------------------------------------------------
}
