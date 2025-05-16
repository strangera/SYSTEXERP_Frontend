import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { LocationCodeService } from './../../../service/basic/locationcode.service';
import { FloorService } from './../../../service/basic/floor.service';

@Component({
  selector: 'app-cpm21060',
  templateUrl: './cpm21060.component.html',
  styleUrl: './cpm21060.component.scss',
})
export class CPM21060Component extends BasicQpageComponent implements OnInit {
  // 表單控制項
  queryForm = this.formBuilder.group({
    marketingCategoryCode: [], // 行銷活動類別代號
    marketingCategoryName: [], // 行銷活動類別名稱
    taskName: [], // 任務名稱
  });

  // 下拉選單選項
  marketingCategoryOptions: any[] = [
    { value: 1, label: '000001' },
    { value: 2, label: '000002' },
    { value: 3, label: '000003' },
  ];
  floor: any[] = [];
  location: any[] = [];

  // 資料表格欄位與資料
  columns: any[] = [
    { field: 'activityTypeCode', header: '行銷活動類別代號', visible: true },
    { field: 'activityTypeName', header: '行銷活動類別名稱', visible: true },
    { field: 'taskName', header: '任務名稱', visible: true },
    { field: 'isSystemPreSet', header: '是否為系統預設', visible: true },
  ];
  data: any[] = []; // 表格資料

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private organizationNumberService: OrganizationNumberService,
    private floorService: FloorService,
    private locationCodeService: LocationCodeService
  ) {
    super(); // 呼叫父類別建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '520006';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.initializeDropdowns();
  }

  // 初始化下拉選單資料
  private initializeDropdowns(): void {

    this.floorService.getFloors().subscribe((data) => {
      this.floor = data;
    });
    this.locationCodeService.getSystemTypes().subscribe((data) => {
      this.location = data;
    });
  }

  // 表單提交事件
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 查詢邏輯
    }

    this.loading = false;
    this.notificationService.unblockUi();
  }

  // 查詢提交事件
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
      this.router.navigate(['CPM2000/CPM21060CRU'], extras);
    }
  }

  // 編輯項目
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
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  // 查看詳情
  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}
