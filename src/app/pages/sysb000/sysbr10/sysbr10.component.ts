import { AnnouncementUserService } from './../../../service/basic/announcement-user.service';
import { RoleCodeServiceService } from './../../../service/basic/role-code-service.service';
import { AnnouncementCategoryService } from './../../../service/basic/announcement-category.service';
import { UserStatusService } from './../../../service/basic/user-status.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';

const nowDate = new Date();

@Component({
  selector: 'app-SYSBR10',
  templateUrl: './SYSBR10.component.html',
  styleUrl: './SYSBR10.component.scss'
})
// 佈告欄管理作業
export class SYSBR10Component extends BasicQpageComponent implements OnInit {
  // 權限
  // 查詢
  // ----------------------------------------------------------------
  queryForm = this.formBuilder.group({
    // POS5101_公告檔

    // STO_No: ['', [Validators.required, Validators.maxLength(10)]], // 分店編號
    ANS_Type: [], // 公告類別
    Announcements: [], // 公告事項
    ANS_BegDateTime_From: [], // 有效開始日期時間
    ANS_BegDateTime_To: [], // 有效開始日期時間
    ANS_EndDateTime_From: [], // 有效結束日期時間
    ANS_EndDateTime_To: [], // 有效結束日期時間

    ANS_Role: [[] as number[]], // 公告角色Y/N
    group_no: [[] as number[]], // 階層代碼
    section_no: [[] as number[]], // 組織代碼
    ANS_Desc: [, ], // 公告內容

    Crt_DateTime: [], // 建檔日期時間 //不顯示於主畫面
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    { isdelete:true,ANS_Type: 1, ANS_BegDateTime: '2024/01/01 01:01', ANS_EndDateTime: '2024/01/04 01:01' ,ANS_Role: [1,0],group_no: [1,2], section_no: [1,2], ANS_Desc: 'content1'},
    { isdelete:true,ANS_Type: 1, ANS_BegDateTime: '2024/01/01 01:01', ANS_EndDateTime: '2024/01/04 01:01' ,ANS_Role: [1],group_no: [1], section_no: [1,2], ANS_Desc: 'content2'},
    { isdelete:true,ANS_Type: 1, ANS_BegDateTime: '2024/03/06 01:01', ANS_EndDateTime: '2024/03/09 01:01' ,ANS_Role: [1],group_no: [2], section_no: [1], ANS_Desc: 'content3'},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[]= [
    { field: 'ANS_Type', header: '公告類別', visible: true },
    { field: 'ANS_BegDateTime', header: '有效開始日期時間', visible: true },
    { field: 'ANS_EndDateTime', header: '有效結束日期時間', visible: true },

    { field: 'ANS_Role', header: '公告角色', visible: true },
    { field: 'group_no', header: '階層代碼', visible: true },
    { field: 'section_no', header: '組織代碼', visible: true },
    { field: 'ANS_Desc', header: '公告內容', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  userStatusOptions: any[] = [];
  announcementOptions: any[] = [];
  roleCodeOptions: any[] = [];
  announcementUserOptions: any[] = [];
  YNOptions: any[] = [
    { value: 1, label: '是' },
    { value: 0, label: '否' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private userStatusService: UserStatusService,
    private announcementCategoryService: AnnouncementCategoryService,
    private roleCodeServiceService: RoleCodeServiceService,
    private announcementUserService: AnnouncementUserService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '410014';
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.userStatusService.getUserStatus().subscribe(data => {
      this.userStatusOptions = data;

      // let userStatusValues = this.userStatusOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   usagec: userStatusValues
      // });
    });
    //
    this.announcementCategoryService.getSystemTypes().subscribe(data => {
      this.announcementOptions = data;

      // let announcementValues = this.announcementOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   announceCategory: announcementValues
      // });
    });
    //
    this.roleCodeServiceService.getSystemTypes().subscribe(data => {
      this.roleCodeOptions = data;
    });
    //
    this.announcementUserService.getSystemTypes().subscribe(data => {
      this.announcementUserOptions = data;
    });
  }
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
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
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true
      };

      //console.log("extra", extras);
      this.router.navigate(['/SYSB000/SYSBR10CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true
      };

      this.router.navigate(['/SYSB000/SYSBR10CRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true
    };

    this.router.navigate(['/SYSB000/SYSBR10CRU'], extras);
  }
}
