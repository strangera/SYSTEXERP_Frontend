import { Sysb400Service } from './../../../service/API/sys/sysb400.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormGroup,
  Validators,
} from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { apiOption, option, SYS1000, Sysb400m, tblUser } from '../module/sysb000.module';
import { Sys0110Service } from '../../../service/API/sys/sys0110.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

// 4-2-1-1使用者基本資料維護

@Component({
  selector: 'app-sys0110-cru',
  templateUrl: './sys0110.cru.component.html',
  styleUrls: ['./sys0110.cru.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SYS0110CRUComponent extends BasicCruPageComponent<tblUser>
  implements OnInit {
  // 表單
  dataForm = this.formBuilder.nonNullable.group({
    ID: [], //ID
    user_No: ['', [Validators.required, Validators.maxLength(10)]], // 使用者編號
    user_Name: ['', [Validators.required, Validators.maxLength(20)]], // 使用者名稱
    user_Password: ['', Validators.maxLength(32)], // 使用者密碼-加密
    title: ['', Validators.maxLength(6)], // 職稱代碼-SYS1000
    org_ID: ['', Validators.maxLength(20)], // 組織編號 (SYSB400_SYS3100)

    str_dateStart: [null], // 帳號有效開始日期
    str_dateEnd: [null], // 帳號有效結束日期
    status: ['', [Validators.required, Validators.maxLength(1)]], // 使用者狀態 1=有效 2=停用
    user_type: ['', [Validators.required, Validators.maxLength(1)]], // 使用者型態 1=公司內部人員(default) 2=專櫃人員 3=其他

    user_email: ['', Validators.maxLength(100)], // 使用者email帳號
    TLT_No: ['', Validators.maxLength(12)], // 所屬專櫃編號
    remarks: ['', Validators.maxLength(100)], // 備註
    user_priority: ['', Validators.maxLength(1)], // 使用者等級
    USER_PwdExpireDate: [null], // 密碼到期日 YYYY/MM/DD HH:NN:SS，若使用者登入系統的時間大於此日期，則需強制使用者變更密碼

    last_Login: [null], // 最近一次登入
  });

  // 下拉選單選項
  titleOptions: apiOption[] = [];
  SYS3100_Options: apiOption[] = [];
  userStatusOptions: option[] = [];
  userTypeOptions: option[] = [];

  constructor(
    private sys0110Service: Sys0110Service,
    private sysb400Service: Sysb400Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0110', this.dataForm);
    console.log('取得資料', this.dataForm.value);
    this.loadOptions();
  }

  // ----------------------------------------------------------------

  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.sys0110Service.createUser(frm.value).subscribe(() => {
              this.messageService.successBubble('新增成功');
              this.onCancel(); // 新增成功後返回查詢頁面
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.sys0110Service.updateUser(frm.value).subscribe(() => {
              this.messageService.successBubble('更新成功');
              this.onCancel(); // 更新成功後返回查詢頁面
            });
          }
          break;
      }
    });
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }

  // 加載下拉選項
  loadOptions() {
    // *職稱代碼-SYS1000
    this.sys0110Service.queryAllSystemCode({}).subscribe((response) => {
      console.log('回應', response);
      this.titleOptions = response.Data.map((item: SYS1000) => ({
        No: item.SYS_Code,
        Name: item.SYS_Name,
        Label: item.SYS_Type + '-' + item.SYS_Code + '-' + item.SYS_Name,
      }));
    });

    //建立組織下拉清單(SYS3100) 查詢全部
    const query_org = {
      level_id: '',
      org_id: '',
      org_name: '',

      //分頁查詢
      pageSize: 1000,
      pageIndex: 0,
      SortBy: [{ field: 'org_id', order: 1 }],
    };

    this.sysb400Service.querySYSB400(query_org).subscribe((response) => {
      this.SYS3100_Options = response.Data.map((item: Sysb400m) => ({
        No: item.org_id,
        Name: item.org_name,
        Label: item.org_id + '-' + item.org_name,
      }));
    });

    this.userTypeOptions = [
      // 使用者型態 1=公司內部人員(default) 2=專櫃人員 3=其他
      { value: '1', label: '公司內部人員' },
      { value: '2', label: '專櫃人員' },
      { value: '3', label: '其他' },
    ];

    //確認新增/編輯狀態
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          this.userStatusOptions = [
            // 1=有效 2=停用
            { value: '1', label: '有效' },
          ];
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          this.userStatusOptions = [
            // 1=有效 2=停用
            { value: '1', label: '有效' },
            { value: '2', label: '停用' },
          ];
        }
        break;
    }
  }
}
