import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { ErroreventCodeService } from '../../../service/basic/errorevent-code.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';

interface AbnormalCode {
  name: string;
  code: string;
}

@Component({
  selector: 'app-sys0760',
  templateUrl: './sys0760.component.html',
  styleUrls: ['./sys0760.component.scss'],
})
// 使用者異常登入報表
export class SYS0760Component extends BasicQpageComponent implements OnInit {
  situation!: AbnormalCode[];
  selectedsituation!: AbnormalCode;
  // 查詢
  queryForm = this.formBuilder.group({
    erroreventCode: [1, [Validators.required]], // DropDown
    systemTypeDetail: [], // DropDown
    startdate: [], // 日期限制 (start-end datetime yyyy/mm/dd)
    enddate: [], // 日期限制 (start-end datetime yyyy/mm/dd)
    userCode: [], // Input Text
  });
  // 表格
  data: any[] = [
    {
      "eventCode": "密碼輸入錯誤",
      "userName": "6666666611",
      "userCode": "6666666611",
      "loginAddress": "10.3.35.148",
      "loginTime": "2024/10/27 下午 02:02:23"
    },
    {
      "eventCode": "密碼輸入錯誤",
      "userName": "6666666601",
      "userCode": "6666666601",
      "loginAddress": "10.3.35.24",
      "loginTime": "2024/10/24 下午 01:27:26"
    },
    {
      "eventCode": "密碼輸入錯誤",
      "userName": "6666666691",
      "userCode": "6666666691",
      "loginAddress": "10.3.41.26",
      "loginTime": "2024/10/22 下午 01:04:59"
    },
    {
      "eventCode": "密碼輸入錯誤",
      "userName": "6666666102",
      "userCode": "6666666102",
      "loginAddress": "10.3.35.159",
      "loginTime": "2024/10/18 下午 05:36:38"
    }
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'eventCode', header: '事件代碼', visible: true },
    { field: 'userName', header: '使用者名稱', visible: true },
    { field: 'userCode', header: '使用者代碼', visible: true },
    { field: 'loginAddress', header: '登入者位址', visible: true },
    { field: 'loginTime', header: '登入時間', visible: true },
  ];

  // Options

  erroreventCodeOptions: any[] = [];
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private erroreventCodeService: ErroreventCodeService
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '420009';
    // 初始化權限資訊
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.erroreventCodeService.getErroreventCode().subscribe((data) => {
      this.erroreventCodeOptions = data;
    });
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
  }
}
