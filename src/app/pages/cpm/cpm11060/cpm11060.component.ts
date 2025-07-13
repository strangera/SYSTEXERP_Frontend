import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

//5.1.1.6 總機廣播服務
@Component({
    selector: 'app-cpm11060',
    templateUrl: './cpm11060.component.html',
    styleUrl: './cpm11060.component.scss',
    standalone: true,
    imports: [MenubarComponent, ButtonComponent, TableComponent]
})
export class CPM11060Component extends BasicQpageComponent implements OnInit {
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
    { 'col1': '尋人', 'col2': '尋人', 'col3': '被尋人 鄭XX小朋友 請於1F服務台集合', 'col4': '180708681', 'col5': '2018/07/08', 'col6': '鄭XX', 'col7': '小朋友', 'col8': '1F服務台', 'col9': '', 'col10': '' },
    { 'col1': '拾獲', 'col2': '證件/信用卡', 'col3': '信用卡末碼1234', 'col4': '180708682', 'col5': '2018/07/08', 'col6': '', 'col7': '', 'col8': '', 'col9': '', 'col10': '' },
    { 'col1': '拾獲', 'col2': '衣物', 'col3': '紅色衣物', 'col4': '180708683', 'col5': '2018/07/08', 'col6': '', 'col7': '', 'col8': '', 'col9': '', 'col10': '' },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'col1', header: '失物類別', visible: true },
    { field: 'col2', header: '類別	', visible: true },
    { field: 'col3', header: '敘述', visible: true },

    { field: 'col4', header: '記錄編號', visible: false },
    { field: 'col5', header: '登錄日期', visible: true },

    { field: 'col6', header: '被尋人姓名	', visible: true },
    { field: 'col7', header: '被尋人稱謂', visible: true },

    { field: 'col8', header: '集合地點', visible: true },
    { field: 'col9', header: '遺失者/拾獲者姓名', visible: true },
    { field: 'col10', header: '已廣播', visible: true },
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
    this.cruPage = '/CPM1000/CPM11060CRU';
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
