import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ApprovalStatusService } from '../../../service/basic/approval-status.service';
import { SystemTypeService } from '../../../service/basic/system-type.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { SYS1000Response } from '../../../shared/models/SYS/SYS1000';

@Component({
  selector: 'app-sysb200',
  templateUrl: './sysb200.component.html',
  styleUrl: './sysb200.component.scss'
})

// 廠商基本資料維護作業
export class SYSB200Component extends BasicQpageComponent implements OnInit {
  // 查詢
  // ----------------------------------------------------------------
  queryForm = this.formBuilder.group({
    manufacturerID: ['', [Validators.maxLength(14)]], // 廠商編號
    approvalStatus: [[] as number[]], // 審核狀態
    manufacturerUID: ['', [Validators.maxLength(10)]], // 廠商統一編號或個人身份證字號
    manufacturerCName: ['', [Validators.maxLength(60)]], // 廠商名稱(中文)
    manufacturerEName: ['', [Validators.maxLength(60)]], // 廠商名稱(英文)
    manufacturerSName: ['', [Validators.maxLength(10)]], // 廠商簡稱
    mailingAddress: ['', [Validators.maxLength(60)]], // 通訊地址
    contactPerson: ['', [Validators.maxLength(12)]], // 聯絡人
    contactPersonTitle: ['', [Validators.maxLength(16)]], // 聯絡人職稱
    contactPersonUID: ['', [Validators.maxLength(10)]], // 聯絡人身份証字號
    contactPersonPhone: ['', [Validators.maxLength(15)]], // 聯絡人電話
    contactAddress: ['', [Validators.maxLength(100)]], // 聯絡人聯絡地址
    contactEmail: ['', [Validators.maxLength(60)]], // 聯絡人電子郵件
    registeredAddress: ['', [Validators.maxLength(100)]], // 公司登記地址
    registeredPhone: ['', [Validators.maxLength(15)]], // 公司登記電話
    companyFax: ['', [Validators.maxLength(15)]], // 公司傳真
    companyWebsite: ['', [Validators.maxLength(60)]], // 公司網址
    systemtype: [[] as number[]], // 系統別
    remark: ['', [Validators.maxLength(160)]], // 備註
    expirationDay: [, [this.validationService.numberValidator]], // 付款期限(天數)
    remittanceBankCode: [, [this.validationService.numberValidator, Validators.max(9999999)]], // 廠商匯款銀行代號
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    { manufacturerID: '0000001', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址1', contactPerson: 'A先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
    { manufacturerID: '0000002', isdelete: false, approvalStatus: '未審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址2', contactPerson: 'B先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
    { manufacturerID: '0000003', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '停車管理', mailingAddress: '地址3', contactPerson: 'C先生', registeredPhone: '06-000000', companyFax: '06-000000', expirationDay: 0, remittanceBankCode: '0000123' },
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'manufacturerID', header: '廠商編號', visible: true },
    { field: 'approvalStatus', header: '審核狀態', visible: true },
    { field: 'manufacturerUID', header: '統一編號', visible: true },
    { field: 'manufacturerCName', header: '廠商名稱(中文)', visible: true },
    { field: 'manufacturerEName', header: '廠商名稱(英文)', visible: false },
    { field: 'mailingAddress', header: '發票地址', visible: true },
    { field: 'contactPerson', header: '聯絡人', visible: true },
    { field: 'registeredPhone', header: '公司登記電話', visible: true },
    { field: 'companyFax', header: '公司傳真', visible: true },
    { field: 'expirationDay', header: '付款期限(天數)', visible: true },
    { field: 'remittanceBankCode', header: '廠商匯款銀行帳號', visible: true },
    // 其他欄位
    { field: 'VENDOR_NAME_S', header: '廠商簡稱', visible: false },
    { field: 'TAX_ADDR', header: '通訊地址', visible: false },
    { field: 'CHARGE_TITLE', header: '聯絡人職稱', visible: false },
    { field: 'CHARGE_PID', header: '聯絡人身份証字號', visible: false },
    { field: 'CHARGE_TEL', header: '聯絡人電話', visible: false },
    { field: 'CHARGE_ADDR', header: '聯絡人聯絡地址', visible: false },
    { field: 'CHARGE_EMAIL', header: '聯絡人電子郵件', visible: false },
    { field: 'VENDOR_REG_ADDR', header: '公司登記地址', visible: false },
    { field: 'VENDOR_EMAIL', header: '公司電子郵件', visible: false },
    { field: 'SYS_ID', header: '系統別', visible: false },
    { field: 'NOTES', header: '備註', visible: false },
    { field: 'SUPL_BANK_ACCT', header: '廠商銀行帳號', visible: false },
    { field: 'SUPL_ACCT_NAME', header: '廠商帳戶名稱', visible: false }
  ];

  venderOptions = [
    { "id": 1, "code": "000000000-1", "name": "南紡流通服務台" },
    { "id": 2, "code": "000000000-2", "name": "停車管理" },
    { "id": 3, "code": "000000000-3", "name": "南紡流通-特殊交易" },
  ];
  filterFields: any[] = [
    'code',
    'name'
  ];
  vendersearchplaceholder: string = '模糊查詢:廠商代碼, 廠商名稱';
  // ----------------------------------------------------------------
  approvalOptions: any[] = [];
  systemCodeOptions: any[] = [];
  t111Options: SYS1000Response[] = [];

  venderColumns: any[] = [
    { field: 'id', header: 'ID', visible: true },
    { field: 'code', header: '廠商代碼', visible: true },
    { field: 'name', header: '廠商名稱', visible: true },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private systemTypeService: SystemTypeService,
    private approvalStatusService: ApprovalStatusService,
    private validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '410002';
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.authService.user.subscribe(x => this.user = x);
    // ----------------------------------------------------------------
    this.reportHead = {
      reporttitle: this.funInfo.prog_name,
      exportuser: this.user?.user_Name,
      reportname: this.funInfo.prog_name,
      outputvisible: false,
    };
    // ----------------------------------------------------------------
    this.systemTypeService.getSystemTypes().subscribe(data => {
      this.systemCodeOptions = data;

      // let systemCodeValues = this.systemCodeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   systemtype: systemCodeValues
      // });
    });
    //
    this.approvalStatusService.getSystemTypes().subscribe(data => {
      this.approvalOptions = data;

      // let approvalValues = this.approvalOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   approvalStatus: approvalValues
      // });
    });
    // ----------------------------------------------------------------
    // 從 sessionStorage 抓取資料
    const systemSettingString = sessionStorage.getItem('SYSTEMSetting');

    if (systemSettingString) {
      // 將 JSON 字串解析成 JavaScript 物件
      const systemSetting = JSON.parse(systemSettingString) as SYS1000Response[];
      // 篩選出 SYS_Type 為 'T111' 的項目
      this.t111Options = systemSetting.filter(option => option.SYS_Type === 'T111');
    } else {
      this.t111Options = []; // 或者設定為空陣列
    }
  }
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    this.data = [
      { manufacturerID: '0000001', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址1', contactPerson: 'A先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000002', isdelete: false, approvalStatus: '未審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址2', contactPerson: 'B先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000003', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '停車管理', mailingAddress: '地址3', contactPerson: 'C先生', registeredPhone: '06-000000', companyFax: '06-000000', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000001', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址1', contactPerson: 'A先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000002', isdelete: false, approvalStatus: '未審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址2', contactPerson: 'B先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000003', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '停車管理', mailingAddress: '地址3', contactPerson: 'C先生', registeredPhone: '06-000000', companyFax: '06-000000', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000001', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址1', contactPerson: 'A先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000002', isdelete: false, approvalStatus: '未審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址2', contactPerson: 'B先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000003', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '停車管理', mailingAddress: '地址3', contactPerson: 'C先生', registeredPhone: '06-000000', companyFax: '06-000000', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000001', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址1', contactPerson: 'A先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000002', isdelete: false, approvalStatus: '未審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址2', contactPerson: 'B先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000003', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '停車管理', mailingAddress: '地址3', contactPerson: 'C先生', registeredPhone: '06-000000', companyFax: '06-000000', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000001', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址1', contactPerson: 'A先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000002', isdelete: false, approvalStatus: '未審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址2', contactPerson: 'B先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000003', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '停車管理', mailingAddress: '地址3', contactPerson: 'C先生', registeredPhone: '06-000000', companyFax: '06-000000', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000001', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址1', contactPerson: 'A先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000002', isdelete: false, approvalStatus: '未審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址2', contactPerson: 'B先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000003', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '停車管理', mailingAddress: '地址3', contactPerson: 'C先生', registeredPhone: '06-000000', companyFax: '06-000000', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000001', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址1', contactPerson: 'A先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000002', isdelete: false, approvalStatus: '未審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址2', contactPerson: 'B先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000003', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '停車管理', mailingAddress: '地址3', contactPerson: 'C先生', registeredPhone: '06-000000', companyFax: '06-000000', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000001', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址1', contactPerson: 'A先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000002', isdelete: false, approvalStatus: '未審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址2', contactPerson: 'B先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000003', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '停車管理', mailingAddress: '地址3', contactPerson: 'C先生', registeredPhone: '06-000000', companyFax: '06-000000', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000001', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址1', contactPerson: 'A先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000002', isdelete: false, approvalStatus: '未審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址2', contactPerson: 'B先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000003', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '停車管理', mailingAddress: '地址3', contactPerson: 'C先生', registeredPhone: '06-000000', companyFax: '06-000000', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000001', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址1', contactPerson: 'A先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000002', isdelete: false, approvalStatus: '未審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址2', contactPerson: 'B先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000003', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '停車管理', mailingAddress: '地址3', contactPerson: 'C先生', registeredPhone: '06-000000', companyFax: '06-000000', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000001', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址1', contactPerson: 'A先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000002', isdelete: false, approvalStatus: '未審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址2', contactPerson: 'B先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000003', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '停車管理', mailingAddress: '地址3', contactPerson: 'C先生', registeredPhone: '06-000000', companyFax: '06-000000', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000001', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址1', contactPerson: 'A先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000002', isdelete: false, approvalStatus: '未審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址2', contactPerson: 'B先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000003', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '停車管理', mailingAddress: '地址3', contactPerson: 'C先生', registeredPhone: '06-000000', companyFax: '06-000000', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000001', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址1', contactPerson: 'A先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000002', isdelete: false, approvalStatus: '未審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址2', contactPerson: 'B先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000003', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '停車管理', mailingAddress: '地址3', contactPerson: 'C先生', registeredPhone: '06-000000', companyFax: '06-000000', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000001', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址1', contactPerson: 'A先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000002', isdelete: false, approvalStatus: '未審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址2', contactPerson: 'B先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000003', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '停車管理', mailingAddress: '地址3', contactPerson: 'C先生', registeredPhone: '06-000000', companyFax: '06-000000', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000001', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址1', contactPerson: 'A先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000002', isdelete: false, approvalStatus: '未審核', manufacturerUID: '00000000', manufacturerCName: '南紡流通服務台', mailingAddress: '地址2', contactPerson: 'B先生', registeredPhone: '06-000000', companyFax: '123', expirationDay: 0, remittanceBankCode: '0000123' },
      { manufacturerID: '0000003', isdelete: true, approvalStatus: '已審核', manufacturerUID: '00000000', manufacturerCName: '停車管理', mailingAddress: '地址3', contactPerson: 'C先生', registeredPhone: '06-000000', companyFax: '06-000000', expirationDay: 0, remittanceBankCode: '0000123' },
      // 其他資料
    ];

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
      this.router.navigate(['/SYSB000/SYSB200CRU'], extras);
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

      this.router.navigate(['/SYSB000/SYSB200CRU'], extras);
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

    this.router.navigate(['/SYSB000/SYSB200CRU'], extras);
  }
  onDelete() {

  }
}
