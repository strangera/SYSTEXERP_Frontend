import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';

//5.1.1.test 尋人廣播服務
@Component({
  selector: 'app-cpm-lost-person',
  templateUrl: './cpm-lost-person.component.html',
  styleUrl: './cpm-lost-person.component.scss'
})
export class CpmLostPersonComponent extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    //之後提供給 尋人廣播服務
    name: ['', [Validators.maxLength(20)]], // 被尋人姓名
    meetingPoint: ['', [Validators.maxLength(50)]], // 集合地點
    registerDate: [], // 登錄日期
  });
  // 下拉資料多個呈現
  // ----------------------------------------------------------------
  roles: any[] = [
    { id: 1, roleCode: 'ADMIN', roleName: 'Administrator' },
    { id: 2, roleCode: 'USER', roleName: 'User' },
    { id: 3, roleCode: 'GUEST', roleName: 'Guest' },
  ];
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    { 'name': '吳XX', 'meetingPoint': '1F服務台', 'title': '先生', 'registerDate': '2018/07/08'},
    { 'name': '盧XX', 'meetingPoint': '1F服務台', 'title': '小朋友', 'registerDate': '2018/07/08'},
    // 其他資料
  ];
  columns: any[]= [
    { field: 'name', header: '被尋人姓名', visible: true },
    { field: 'meetingPoint', header: '集合地點	', visible: true },
    { field: 'title', header: '被尋人稱謂', visible: true },
    { field: 'registerDate', header: '登錄日期', visible: false },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  titleOptions: any[] = [
    { value: 1, label: '先生' },
    { value: 2, label: '小姐' },
    { value: 3, label: '小朋友' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '510006';
    this.cruPage = '/CPM1000/CpmLostPersonCRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
  }

  // ----------------------------------------------------------------
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
  // ----------------------------------------------------------------
  onCreate() {
    if (this.canAdd()) {
      this.navigateWithState(this.router, CRUDStatus.Create, null, this.cruPage);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(this.router, CRUDStatus.Edit, data, this.cruPage);
    }
  }

  onDetail(data: any) {
    this.navigateWithState(this.router, CRUDStatus.Read, data, this.cruPage);
  }
}
