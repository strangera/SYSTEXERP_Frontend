import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Shared
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Sysb200m } from '../module/sysb000.module';
import { SortMeta } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { ValidationService } from '../../../shared/service/validation.service';
import { SystemTypeService } from '../../../service/basic/system-type.service';
import { ApprovalStatusService } from '../../../service/basic/approval-status.service';
import { SYS1000Response } from '../../../shared/models/SYS/SYS1000';

// 本地儲存鍵：用於儲存查詢狀態
const storageKey = 'SYSB200';

@Component({
  selector: 'app-sysb200',
  templateUrl: './sysb200.component.html',
  styleUrl: './sysb200.component.scss',
})

// 廠商基本資料維護作業
export class SYSB200Component
  extends BasicQueryPageComponent<Sysb200m>
  implements OnInit {
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
    remittanceBankCode: [
      ,
      [this.validationService.numberValidator, Validators.max(9999999)],
    ], // 廠商匯款銀行代號
  });
  // 表格
  // ----------------------------------------------------------------
  data: Sysb200m[] = [
    // 其他資料
  ];
  filteredData: Sysb200m[] = [...this.data];
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
    { field: 'SUPL_ACCT_NAME', header: '廠商帳戶名稱', visible: false },
  ];

  venderOptions = [
    { id: 1, code: '000000000-1', name: '南紡流通服務台' },
    { id: 2, code: '000000000-2', name: '停車管理' },
    { id: 3, code: '000000000-3', name: '南紡流通-特殊交易' },
  ];

  // // 分頁和排序參數
  // pageSize: number = 10;
  // pageIndex: number = 0;
  totalRecords = 0;
  // lastQueryParams: any = null;
  // sortField: string = 'CAT_LNo';
  // sortOrder: number = 1;

  // 多選項目
  selectedItems: Sysb200m[] = [];

  // ----------------------------------------------------------------
  t111Options: SYS1000Response[] = [];
  venderColumns: any[] = [
    { field: 'id', header: 'ID', visible: true },
    { field: 'code', header: '廠商代碼', visible: true },
    { field: 'name', header: '廠商名稱', visible: true },
  ];
  approvalOptions: any[] = [];
  systemCodeOptions: any[] = [];
  constructor(
    // private sysb200Service: Sysb200Service,
    private validationService: ValidationService,
    private systemTypeService: SystemTypeService,
    private approvalStatusService: ApprovalStatusService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB200', 'SYS/SYSB200CRU');
    this.loadOptions();

    // 恢復查詢狀態並自動查詢
    this.handleQueryRestore(this.queryForm, storageKey, (form) =>
      this.onSubmit(form),
    );
  }
  loadOptions() {
    // ----------------------------------------------------------------
    this.systemTypeService.getSystemTypes().subscribe((data) => {
      this.systemCodeOptions = data;

      // let systemCodeValues = this.systemCodeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   systemtype: systemCodeValues
      // });
    });
    //
    this.approvalStatusService.getSystemTypes().subscribe((data) => {
      this.approvalOptions = data;

      // let approvalValues = this.approvalOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   approvalStatus: approvalValues
      // });
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // this.sysb200Service.querySYSB200(frm.value).subscribe({
      //   next: (response: any) => {
      //     console.log('API response:', response);
      //     if (response.Status === '0000') {
      //       this.data = response.Data || [];
      //       this.filteredData = [...this.data];
      //       this.totalRecords = response.TotalCount || response.Data.length;
      //       this.queryStateService.setQueryState(storageKey, frm.value);
      //     } else {
      //       console.error('API error:', response.Status, response.Message);
      //     }
      //     this.loading = false;
      //     this.messageService.unblockUi();
      //   },
      //   error: (err: string) => {
      //     console.error('API error:', err);
      //     this.loading = false;
      //     this.messageService.unblockUi();
      //   },
      // });
    });
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  // 刪除項目
  onDelete(data: Sysb200m | Sysb200m[]): void {
    console.log('Delete data:', JSON.stringify(data, null, 2));

    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      console.error('No items to delete');
      this.messageService.errorBubble('無法刪除：沒有選中的項目');
      return;
    }

    // 收集所有有效的 ID
    const idList = items
      .filter(
        (item) =>
          item &&
          item.manufacturerID != null &&
          item.manufacturerID !== undefined,
      )
      .map((item) => item.manufacturerID);

    if (idList.length === 0) {
      console.error('No valid IDs to delete');
      this.messageService.errorBubble('無法刪除：選中的項目缺少有效 ID');
      return;
    }

    // const deleteBody = {
    //   idList: idList, // 符合 API 的 idList 格式
    // };
    // this.sysb100Service.deleteSYSB100(deleteBody).subscribe({
    //   next: (response: any) => {
    //     if (response.Status === '0000') {
    //       this.messageService.successBubble('選中項目刪除成功');
    //     } else {
    //       console.error('API error:', response.Status, response.Message);
    //       this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
    //     }
    //   },
    //   error: (err: string) => {
    //     console.error('API error:', err);
    //     this.messageService.errorBubble('刪除失敗');
    //   },
    //   complete: () => {
    //     this.onSubmit(this.queryForm);
    //   },
    // });

    this.selectedItems = [];
  }
}
