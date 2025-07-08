import { Sysbc00Service } from './../../../service/api/sys/sysbc00.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { SortMeta } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AddButton } from '../../../shared/componentkit/table/table.model';
export const enum POStatus {
  已申請 = '0',
  取消 = '1',
  已審核 = '2',
  部分驗收 = '3',
  全部驗收 = '4',
  強制結案 = '6',
  作廢 = '9',
}
export interface VendorData {
  VEN_No: string;
  VEN_Status: string;
  VEN_Uniform: string;
  VEN_CName: string;
  VEN_EName: string;
  VEN_SName: string;
  VEN_Address: string;
  VEN_Boss: string;
  VEN_BossTitle: string;
  VEN_GUEmail: string;
  VEN_BossTel: string;
  VEN_BossID: string;
  VEN_BossAddr: string;
  VEN_Tel: string;
  VEN_Fax: string;
  VEN_WebSite: string;
  VEN_Remark: string;
  VEN_PayConditionDay: number;
  VEN_BankNo: string;
}

@Component({
  selector: 'app-sysb200',
  templateUrl: './sysb200.component.html',
})
export class SYSB200Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    VEN_No: [[]],
    VEN_Status: [['0', '1']],
    VEN_Uniform: ['', [Validators.maxLength(10)]],
    VEN_CName: ['', [Validators.maxLength(60)]],
    VEN_EName: ['', [Validators.maxLength(60)]],
    VEN_SName: ['', [Validators.maxLength(10)]],
    VEN_BankNo: ['', [this.validationService.numberValidator, Validators.maxLength(10)]],
    VEN_Address: ['', [Validators.maxLength(100)]],
    VEN_Boss: ['', [Validators.maxLength(12)]],
    VEN_BossTitle: ['', [Validators.maxLength(16)]],
    VEN_GUEmail: ['', [Validators.maxLength(60)]],
    VEN_BossTel: ['', [Validators.maxLength(15)]],
    VEN_BossID: ['', [Validators.maxLength(10)]],
    VEN_BossAddr: ['', [Validators.maxLength(100)]],
    VEN_Tel: ['', [Validators.maxLength(15)]],
    VEN_Fax: ['', [Validators.maxLength(15)]],
    VEN_Remark: ['', [Validators.maxLength(160)]],
    VEN_PayConditionDay: ['', [this.validationService.numberValidator]],
    pageSize: [10],
    pageIndex: [0],
    SortBy: [[{ field: 'VEN_No', order: 1 }] as SortMeta[]],
  });

  approvalOptions: { label: string; value: string }[] = [
    { label: '未審核', value: '0' },
    { label: '已審核', value: '1' },
  ];

  columns: any[] = [
    { field: 'VEN_No', header: '廠商編號', visible: true },
    {
      field: 'VEN_Status',
      header: '審核狀態',
      visible: true,
      format: (value: string) => {
        const option = this.approvalOptions.find(x => x.value === value);
        return option ? option.label : value;
      }
    },
    { field: 'VEN_Uniform', header: '統一編號', visible: true },
    { field: 'VEN_CName', header: '廠商名稱(中文)', visible: true },
    { field: 'VEN_EName', header: '廠商名稱(英文)', visible: false },
    { field: 'VEN_SName', header: '廠商簡稱', visible: false },
    { field: 'VEN_Address', header: '通訊地址', visible: true },
    { field: 'VEN_Boss', header: '聯絡人', visible: true },
    { field: 'VEN_BossTitle', header: '聯絡人職稱', visible: false },
    { field: 'VEN_GUEmail', header: '聯絡人電子郵件', visible: false },
    { field: 'VEN_BossTel', header: '聯絡人電話', visible: false },
    { field: 'VEN_BossID', header: '聯絡人身份證字號', visible: false },
    { field: 'VEN_BossAddr', header: '聯絡人聯絡地址', visible: false },
    { field: 'VEN_Tel', header: '公司登記電話', visible: true },
    { field: 'VEN_Fax', header: '公司傳真', visible: true },
    { field: 'VEN_Remark', header: '備註', visible: false },
    { field: 'VEN_PayConditionDay', header: '付款期限(天數)', visible: true },
    { field: 'VEN_BankNo', header: '廠商匯款銀行代號', visible: true },
  ];

  totalRecords = 0;
  selectedItems: VendorData[] = [];
  data: VendorData[] = [];
  venderOptions: any[] = [];
  t111Options: any[] = [];
  bankOptions$!: Observable<any[]>;
  addButton: AddButton[] = [
    {
      label: '單據審核',
      icon: 'pi pi-check-circle text-green-500',
      action: (rowData: VendorData) => {
        if (rowData.VEN_Status !== '0') {
          this.messageService.warnBubble('狀態不是「未審核」，無法審核');
          return;
        }
        this.statusChange(rowData, '1'); //更新成「已審核」
      },
    },
    {
      label: '反審核',
      icon: 'pi pi-undo text-orange-500',
      action: (rowData: VendorData) => {
        if (rowData.VEN_Status !== '1') {
          this.messageService.warnBubble('狀態已審核，無法反審核');
          return;
        }
        this.statusChange(rowData, '0'); // 更新成「未審核」
      },
    },
  ];

  statusChange(rowData: VendorData, status: string) {
    this.messageService.successBubble(`你點了狀態更新，ID: ${rowData.VEN_No}，要更新成 ${status}`);
    rowData.VEN_Status = status;
  }


  constructor(
    private activatedRoute: ActivatedRoute,
    private validationService: ValidationService,
    private sysbc00Service: Sysbc00Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB200', 'sys/sysb200cru');
    this.loadOptions();
    this.handleQueryRestore(this.queryForm, 'SYSB200', (form) => this.onSubmit(form));
  }

  loadOptions() {
    this.venderOptions = [
      { label: '廠商A', value: 'A' },
      { label: '廠商B', value: 'B' },
      { label: '廠商C', value: 'C' },
    ];

    this.t111Options = [
      { SYS_Name: '即期', id: 0 },
      { SYS_Name: '15天', id: 15 },
      { SYS_Name: '30天', id: 30 },
      { SYS_Name: '45天', id: 45 },
    ];

    this.bankOptions$ = this.sysbc00Service.querySYSBC00({}).pipe(
      map(res => (res.Data ?? []).map(item => ({
        label: `${item.BNK_No} ${item.BNK_Name}`,
        value: item.BNK_No
      })))
    );
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      this.data = [
        {
          VEN_No: 'A',
          VEN_Status: '0',
          VEN_Uniform: '1234567890',
          VEN_CName: '測試公司',
          VEN_EName: 'Test Co.',
          VEN_SName: 'Test',
          VEN_Address: '台北市中山區',
          VEN_Boss: '王小明',
          VEN_BossTitle: '經理',
          VEN_GUEmail: 'test@example.com',
          VEN_BossTel: '0912345678',
          VEN_BossID: 'A123456789',
          VEN_BossAddr: '新北市板橋區',
          VEN_Tel: '0223456789',
          VEN_Fax: '0223456790',
          VEN_WebSite: 'https://test.com',
          VEN_Remark: '這是備註',
          VEN_PayConditionDay: 30,
          VEN_BankNo: '700001'
        },
      ];
      this.data = [
        {
          VEN_No: 'A',
          VEN_Status: '1', // 已審核
          VEN_Uniform: '1234567890',
          VEN_CName: '測試公司',
          VEN_EName: 'Test Co.',
          VEN_SName: 'Test',
          VEN_Address: '台北市中山區',
          VEN_Boss: '王小明',
          VEN_BossTitle: '經理',
          VEN_GUEmail: 'test@example.com',
          VEN_BossTel: '0912345678',
          VEN_BossID: 'A123456789',
          VEN_BossAddr: '新北市板橋區',
          VEN_Tel: '0223456789',
          VEN_Fax: '0223456790',
          VEN_WebSite: 'https://test.com',
          VEN_Remark: '這是備註',
          VEN_PayConditionDay: 30,
          VEN_BankNo: '700001'
        },
      ];

      this.totalRecords = this.data.length;
      this.loading = false;
      this.messageService.unblockUi();
    });
  }
}
