import { Sysbc00Service } from './../../../service/api/sys/sysbc00.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { SortMeta } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AddButton, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { QuerySYSB200Request, Sysb200Service } from '../../../service/api/sys/sysb200.service';

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
  VEN_BossEmail: string;
  VEN_BossTel: string;
  VEN_BossID: string;
  VEN_BossAddr: string;
  VEN_Tel: string;
  VEN_Fax: string;
  VEN_Remark: string;
  VEN_PayConditionDay: number;
  VEN_BNK_No: string;
}

@Component({
  selector: 'app-sysb200',
  templateUrl: './sysb200.component.html',
})
export class SYSB200Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    VEN_NoList: [[]],
    VEN_Status: [''], // 預設查詢「未審核」「已審核」
    VEN_Uniform: ['', [Validators.maxLength(10)]],
    VEN_CName: ['', [Validators.maxLength(60)]],
    VEN_EName: ['', [Validators.maxLength(60)]],
    VEN_SName: ['', [Validators.maxLength(10)]],
    VEN_BNK_No: ['', [this.validationService.numberValidator, Validators.maxLength(10)]],
    VEN_Address: ['', [Validators.maxLength(100)]],
    VEN_Boss: ['', [Validators.maxLength(12)]],
    VEN_BossTitle: ['', [Validators.maxLength(16)]],
    VEN_BossEmail: ['', [Validators.maxLength(60)]],
    VEN_BossTel: ['', [Validators.maxLength(15)]],
    VEN_BossID: ['', [Validators.maxLength(10)]],
    VEN_BossAddr: ['', [Validators.maxLength(100)]],
    VEN_Tel: ['', [Validators.maxLength(15)]],
    VEN_Fax: ['', [Validators.maxLength(15)]],
    VEN_Remark: ['', [Validators.maxLength(160)]],
    VEN_PayConditionDay: ['', [this.validationService.numberValidator]],
    ...createPaginationConfig([{ field: 'VEN_No', order: 1 }]),
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
    { field: 'VEN_BossEmail', header: '聯絡人電子郵件', visible: false },
    { field: 'VEN_BossTel', header: '聯絡人電話', visible: false },
    { field: 'VEN_BossID', header: '聯絡人身份證字號', visible: false },
    { field: 'VEN_BossAddr', header: '聯絡人聯絡地址', visible: false },
    { field: 'VEN_Tel', header: '公司登記電話', visible: true },
    { field: 'VEN_Fax', header: '公司傳真', visible: true },
    { field: 'VEN_Remark', header: '備註', visible: false },
    { field: 'VEN_PayConditionDay', header: '付款期限(天數)', visible: true },
    { field: 'VEN_BNK_No', header: '廠商匯款銀行代號', visible: true },
  ];

  contacts: any[] = [];
  totalRecords = 0;
  selectedRows: any[] = [];
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
        this.statusChange(rowData, '1');
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
        this.statusChange(rowData, '0');
      },
    },
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private validationService: ValidationService,
    private sysbc00Service: Sysbc00Service,
    private sysb200Service: Sysb200Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB200', 'sys/sysb200cru');
    this.loadOptions();

    // 處理從 CRU 回到查詢自動刷新
    if (localStorage.getItem('refreshList') === 'true') {
      this.onSubmit(this.queryForm);
      localStorage.removeItem('refreshList');
    }

    // 若有查詢還原功能
    this.handleQueryRestore(this.queryForm, 'SYSB200', (form) => this.onSubmit(form));
  }

  loadOptions() {
    this.sysb200Service.querySYSB200({ request: { PageSize: 9999, PageIndex: 0, SortBy: [] } }).subscribe(res => {
      this.venderOptions = (res.Data ?? []).map((item: { VEN_No: string; VEN_Name: string }) => ({
        label: `${item.VEN_No} - ${item.VEN_Name}`,
        value: item.VEN_No
      }));
    });

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
      const raw = form.getRawValue();

      const queryData: QuerySYSB200Request = {
        VEN_NoList: raw.VEN_NoList,
        VEN_Status: raw.VEN_Status,
        VEN_Uniform: raw.VEN_Uniform,
        VEN_Name: raw.VEN_CName,
        VEN_EngName: raw.VEN_EName,
        VEN_ShortName: raw.VEN_SName,
        VEN_BNK_No: raw.VEN_BNK_No,
        VEN_Address: raw.VEN_Address,
        VEN_Boss: raw.VEN_Boss,
        VEN_BossTitle: raw.VEN_BossTitle,
        VEN_BossEmail: raw.VEN_BossEmail,
        VEN_BossTel: raw.VEN_BossTel,
        VEN_BossID: raw.VEN_BossID,
        VEN_BossAddr: raw.VEN_BossAddr,
        VEN_Tel: raw.VEN_Tel,
        VEN_Fax: raw.VEN_Fax,
        VEN_Remark: raw.VEN_Remark,
        VEN_PayConditionDay: raw.VEN_PayConditionDay === '' ? null : raw.VEN_PayConditionDay,
        PageSize: raw.pageSize,
        PageIndex: raw.pageIndex,
        SortBy: raw.SortBy,
        OrderBy: '',
        Offset: 0,
        VEN_GUIAddr: '',
      };

      this.sysb200Service.querySYSB200(queryData).subscribe({
        next: (res) => {
          this.data = res.Data ?? [];
          this.totalRecords = res.TotalCount ?? this.data.length;
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: () => {
          this.loading = false;
          this.messageService.errorBubble('查詢失敗，請稍後再試');
        },
      });
    });
  }

  onDelete(rows: any[]): void {
    this.contacts = this.contacts.filter(item => !rows.includes(item));
    this.selectedRows = [];
    this.messageService.successBubble('已刪除選取資料');
  }

  statusChange(rowData: VendorData, status: string) {
    this.messageService.successBubble(`狀態更新，ID: ${rowData.VEN_No}，要更新成 ${status}`);
    rowData.VEN_Status = status;
  }
}
