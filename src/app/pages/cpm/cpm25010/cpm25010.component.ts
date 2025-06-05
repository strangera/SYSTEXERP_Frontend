import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';


@Component({
  selector: 'app-cpm25010',
  templateUrl: './cpm25010.component.html',
  styleUrls: ['./cpm25010.component.scss']
})
export class CPM25010Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    marketingCampaignCode: [], // 行銷檔期代號
    campaignName: [], // 檔期名稱
    suppliesCondition: [], // 用品狀況
    returnStatus: [] // 歸還狀況
  });

  // 選項資料
  marketingCampaignOptions = [
    { value: 1, label: '春季促銷' },
    { value: 2, label: '夏季活動' }
  ];

  suppliesConditionOptions = [
    { value: 1, label: '請購' },
    { value: 2, label: '借用' },
    { value: 3, label: '贈送' },
    { value: 4, label: '租賃' }
  ];

  returnStatusOptions = [
    { value: 1, label: '未歸還' },
    { value: 2, label: '部分歸還' },
    { value: 3, label: '全部歸還' }
  ];



  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,

  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '520021';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 初始化其他選項資料

  }

  onSubmit(frm: FormGroup): void {
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

  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  onClearForm(): void {
    this.queryForm.reset(); // 重置表單
  }

  onCreate(): void {
    if (this.canAdd()) {
      const extras: NavigationExtras = {
        state: { crudstatus: CRUDStatus.Create, queryform: this.queryForm },
        skipLocationChange: true
      };
      this.router.navigate(['FIN3000/FIN34030CRU'], extras);
    }
  }

  onEdit(data: any): void {
    if (this.canEdit()) {
      const extras: NavigationExtras = {
        state: { crudstatus: CRUDStatus.Edit, rowdata: data, queryform: this.queryForm },
        skipLocationChange: true
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  onDetail(data: any): void {
    const extras: NavigationExtras = {
      state: { crudstatus: CRUDStatus.Read, rowdata: data, queryform: this.queryForm },
      skipLocationChange: true
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}
