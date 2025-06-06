import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
//

//5.1.1.7 全館店櫃資訊查詢
@Component({
  selector: 'app-cpm11070',
  templateUrl: './cpm11070.component.html',
  styleUrl: './cpm11070.component.scss'
})
export class CPM11070Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    counterBrand: [], // 專櫃品牌
    operatingStatus: [[] as number[]], // 營運狀態
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
    {
      'counterNumber': '000001', 'counterBrand': '小騎士', 'vendorName': '騎士堡公司',
      'industryType': '娛樂', 'floor': 'B1',
      'area': 'A區', 'location': 'B1A01',
      'graph': '觀看平面圖', 'operatingStatus': '營運中'
    },
    {
      'counterNumber': '000002', 'counterBrand': '霹靂布袋戲', 'vendorName': '大霹靂公司',
      'industryType': '物販', 'floor': 'B1',
      'area': 'A區', 'location': 'B1A02A0',
      'graph': '觀看平面圖', 'operatingStatus': '營運中'
    },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'counterNumber', header: '專櫃編號', visible: true },
    { field: 'counterBrand', header: '品牌 (櫃位名稱)', visible: true },
    { field: 'vendorName', header: '廠商名稱', visible: true },

    // { field: 'phone', header: '專櫃電話號碼', visible: false },  // 需求文件要求移除
    { field: 'industryType', header: '大分類', visible: true }, //名稱: 大分類 -> 大分類
    { field: 'floor', header: '樓層', visible: true },

    { field: 'area', header: '區域', visible: true },
    { field: 'location', header: '位置', visible: true },

    { field: 'graph', header: '平面圖', visible: true },
    { field: 'operatingStatus', header: '營運狀態', visible: true },

    // { field: 'col11', header: '廠商帳戶名稱', visible: true },
    // { field: 'col12', header: '付款期限', visible: true },
    // { field: 'col13', header: '票據抬頭', visible: true },
    // { field: 'col14', header: '審核狀態', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  systemTypeOptions: any[] = [
    { value: 1, label: '營運中' },
    { value: 2, label: '已撤櫃' },
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
    this.ProgNo = '510007';
    this.cruPage = '/CPM1000/CPM11070CRU';
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
