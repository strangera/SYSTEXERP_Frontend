import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';

@Component({
  selector: 'app-sysb100',
  templateUrl: './sysb100.component.html',
  styleUrl: './sysb100.component.scss'
})
// 公司基本資料維護作業
export class SYSB100Component extends BasicQpageComponent implements OnInit {
  // 查詢
  // ----------------------------------------------------------------
  queryForm = this.formBuilder.group({
    unifiedNumber: [, [Validators.maxLength(8)]], // 公司代號(統一編號)
    companyCName: ['', [Validators.maxLength(60)]], // 公司名稱(中文)
    mallName: ['', Validators.maxLength(40)], // 商場名稱
    companyEName: ['', [Validators.maxLength(60)]], // 公司名稱(英文)
    taxNumber: [, [Validators.maxLength(9)]], // 稅籍編號
    principal: ['', [Validators.maxLength(12)]], // 負責人
    contactPerson: ['', [Validators.maxLength(12)]], // 聯絡人
    contactPersonPhone: ['', [Validators.maxLength(15)]], // 聯絡人電話
    contactPersonFax: ['', [Validators.maxLength(15)]], // 聯絡人傳真
    postalCode: [, [Validators.maxLength(5)]], // 郵遞區號
    BusinessCertificateNumber: [, [Validators.maxLength(10)]], // 營業登記證號
    companyPhone: ['', [Validators.maxLength(15)]], // 公司電話
    companyCAddress: ['', [Validators.maxLength(100)]], // 公司(營業處)地址(中文)
    companyEAddress: ['', [Validators.maxLength(100)]], // 公司(營業處)地址(英文)
    registeredCAddress: ['', [Validators.maxLength(100)]], // 公司登記地址(中文)
    registeredEAddress: ['', [Validators.maxLength(100)]], // 公司登記地址(英文)
    invoiceAddress: ['', [Validators.maxLength(60)]], // 發票地址
    mailingPhone: ['', [Validators.maxLength(15)]], // 郵寄電話
    mailingFex: ['', [Validators.maxLength(15)]], // 郵寄傳真
    mailingAddress: ['', [Validators.maxLength(60)]], // 郵寄地址
    email: ['', [Validators.maxLength(60)]], // 電子郵件信箱
    companyWebsite: ['', [Validators.maxLength(60)]], // 公司網址
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    { isdelete: true, unifiedNumber: '53472035', companyCName: '南紡流通事業股份有限公司', taxNumber: '703902223', companyEName: 'TSRD Co.,Ltd.', principal: '侯先生', contactPerson: '張先生', contactPersonPhone: '06-00000000' },
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'unifiedNumber', header: '公司代號(統一編號)', visible: true },
    { field: 'companyCName', header: '公司名稱(中文)', visible: true },
    { field: 'taxNumber', header: '稅籍編號', visible: true },
    { field: 'companyEName', header: '公司名稱(英文)', visible: true },
    { field: 'contactPerson', header: '負責人', visible: true },
    { field: 'companyEName', header: '聯絡人', visible: true },
    { field: 'contactPersonPhone', header: '聯絡人電話', visible: true },
    // 其他欄位
    { field: 'CONTACT_FAX', header: '聯絡人傳真', visible: false },
    { field: 'POST_ID', header: '郵遞區號', visible: false },
    { field: 'REG_ID', header: '營業登記證號', visible: false },
    { field: 'CENTER_TEL', header: '公司電話', visible: false },
    { field: 'CENTER_ADDR', header: '公司(營業處)地址(中文)', visible: false },
    { field: 'CENTER_ADDR_E', header: '公司(營業處)地址(英文)', visible: false },
    { field: 'CENTER_REG_ADDR', header: '公司登記地址(中文)', visible: false },
    { field: 'CENTER_REG_ADDR_E', header: '公司登記地址(英文)', visible: false },
    { field: 'TAX_ADDR', header: '發票地址', visible: false },
    { field: 'POST_TEL', header: '郵寄電話', visible: false },
    { field: 'POST_FAX', header: '郵寄傳真', visible: false },
    { field: 'POST_ADDR', header: '郵寄地址', visible: false },
    { field: 'EMAIL', header: '電子郵件信箱', visible: false },
    { field: 'CENTER_URL', header: '公司網址', visible: false }
  ];

  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '410001';
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
      this.router.navigate(['/SYSB000/SYSB100CRU'], extras);
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

      this.router.navigate(['/SYSB000/SYSB100CRU'], extras);
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

    this.router.navigate(['/SYSB000/SYSB100CRU'], extras);
  }
}
