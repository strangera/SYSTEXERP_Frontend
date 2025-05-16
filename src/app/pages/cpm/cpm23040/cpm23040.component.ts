
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { UserCodeService } from '../../../service/basic/user-code.service';


@Component({
  selector: 'app-cpm23040',
  templateUrl: './cpm23040.component.html',
  styleUrls: ['./cpm23040.component.scss'],
})
export class CPM23040Component extends BasicQpageComponent implements OnInit {
  // 表單定義
  queryForm = this.formBuilder.group({
    activityStartDate: [],
    activityEndDate: [],
    returnDate: [],
    marketingCampaignCode: [],
    campaignName: [],
    returnNumber: [],
    remarks: [],
    returnPersonnel: [],
  });

  // 下拉選單選項
  marketingCampaignOptions: any[] = [
    { value: 1, label: 'DM發送活動' },
    { value: 2, label: '紅利積點活動' },
    { value: 3, label: '聯名超強卡友日' },
    { value: 4, label: '贈品兌換活動' },
  ];
  returnPersonnelOptions: any[] = [];

  // 資料與欄位定義
  data: any[] = [];
  columns: any[] = [
    { field: 'documentNumber', header: '單號', visible: true },
    { field: 'marketingPhaseCode', header: '行銷檔期代號', visible: true },
    { field: 'phaseName', header: '檔期名稱', visible: true },
    { field: 'returnDate', header: '繳回日期', visible: true },
    { field: 'returnPerson', header: '繳回人員', visible: true },
    { field: 'remark', header: '備註', visible: true },
  ];

  // 狀態管理


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private userCodeService: UserCodeService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '520015';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 初始化下拉選單資料
    this.userCodeService.getUserCode().subscribe((data) => {
      this.returnPersonnelOptions = data;
    });

  }

  onSubmit(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 查詢邏輯實作
      console.log('Form Submitted', frm.value);
    }

    this.loading = false;
    this.notificationService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['CPM2000/CPM23040CRU'], extras);
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
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

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

  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }
}
