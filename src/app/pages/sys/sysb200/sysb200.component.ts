import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ValidationService } from '../../../shared/service/validation.service';

import { AddButton, createPaginationConfig, Column } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { DropDownListService, IDropdownItem } from 'src/app/service/utility/dropDownList.service';
import { Sysbc00Service } from './../../../service/api/sys/sysbc00.service';
import { QuerySYSB200Request, Sysb200Service } from '../../../service/api/sys/sysb200.service';

export interface VendorData {
  id?: number;             // 後端若回傳 id
  pos2013_id?: number;     // 或回傳 pos2013_id
  VEN_No: string;
  VEN_Status: string;         // '0' 未審核 / '1' 已審核
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
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    InputTextComponent,
    DropdownComponent,
    TableComponent,
    AsyncPipe,
    TranslateModule,
  ],
})
export class SYSB200Component extends BasicQueryPageComponent<any> implements OnInit {

  // ====== Form ======
  queryForm = this.formBuilder.group({
    VEN_NoList: [[]],
    VEN_Status: [''],
    VEN_Uniform: ['', [Validators.maxLength(10)]],
    VEN_Name: ['', [Validators.maxLength(60)]],
    VEN_EName: ['', [Validators.maxLength(60)]],
    VEN_SName: ['', [Validators.maxLength(10)]],
    VEN_BNK_No: ['', [this.validationService.numberValidator, Validators.maxLength(10)]],
    VEN_GUIAddr: ['', [Validators.maxLength(100)]],
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

  // ====== Table / Options ======
  approvalOptions: { label: string; value: string }[] = [
    { label: '未審核', value: '0' },
    { label: '已審核', value: '1' },
  ];

  columns: Column[] = [
    { field: 'VEN_No', header: '廠商編號', visible: true },
    {
      field: 'VEN_Status',
      header: '審核狀態',
      visible: true,
      format: (value: string) =>
        this.approvalOptions.find(x => x.value === value)?.label ?? value,
    },
    { field: 'VEN_Uniform', header: '統一編號', visible: true },
    { field: 'VEN_Name', header: '廠商名稱(中文)', visible: true },
    { field: 'VEN_EngName', header: '廠商名稱(英文)', visible: true },
    { field: 'VEN_ShortName', header: '廠商簡稱', visible: true },
    { field: 'VEN_Address', header: '通訊地址', visible: true },
    { field: 'VEN_GUIAddr', header: '公司營登地址', visible: true },
    { field: 'VEN_Boss', header: '聯絡人', visible: false },
    { field: 'VEN_BossTitle', header: '聯絡人職稱', visible: false },
    { field: 'VEN_BossEmail', header: '聯絡人電子郵件', visible: false },
    { field: 'VEN_BossTel', header: '聯絡人電話', visible: false },
    { field: 'VEN_Tel', header: '公司登記電話', visible: true },
    { field: 'VEN_Fax', header: '公司傳真', visible: false },
    { field: 'VEN_Email', header: '公司電子郵件', visible: true },
    { field: 'VEN_PayConditionDay', header: '付款期限(天數)', visible: true },
    { field: 'VEN_PayType', header: '付款方式', visible: true },
    { field: 'VEN_BNK_No', header: '銀行代號', visible: false },
    { field: 'VEN_BNK_BranchNo', header: '分行代號', visible: false },
    { field: 'VEN_BankAccountNo', header: '銀行帳號', visible: false },
    { field: 'VEN_AccountName', header: '戶名', visible: false },
    { field: 'VEN_Remark', header: '備註', visible: true },
  ];


  // ====== State ======
  data: VendorData[] = [];
  totalRecords = 0;
  selectedRows: VendorData[] = [];
  selectedItems: VendorData[] = [];
  VEN_NoList: IDropdownItem[] = [];
  venderOptions: any[] = [];
  t111Options: any[] = [];
  bankOptions$!: Observable<any[]>;
  contacts: any[] = [];

  /** 單筆操作中的 row id，避免重複點擊 */
  actionLoadingId: string | number | null = null;

  // ====== Row Buttons ======
  addButton: AddButton[] = [
    {
      label: '單據審核',
      icon: 'pi pi-check-circle text-green-500',
      action: (row: VendorData) => {
        if (this.actionLoadingId) return;
        if (row.VEN_Status !== '0') {
          this.messageService.warnBubble('狀態不是「未審核」，無法審核');
          return;
        }
        this.statusChange(row, '1');
      },
    },
    {
      label: '反審核',
      icon: 'pi pi-undo text-orange-500',
      action: (row: VendorData) => {
        if (this.actionLoadingId) return;
        if (row.VEN_Status !== '1') {
          this.messageService.warnBubble('狀態不是「已審核」，無法反審核');
          return;
        }
        this.statusChange(row, '0');
      },
    },
  ];

  constructor(
    private dropDownListService: DropDownListService,
    private validationService: ValidationService,
    private sysbc00Service: Sysbc00Service,
    private sysb200Service: Sysb200Service
  ) {
    super();
  }

  // ====== Lifecycle ======
  ngOnInit(): void {
    this.initializePage('SYSB200', 'sys/sysb200cru', this.queryForm, form => this.onSubmit(form));
    this.loadOptions();
  }

  // ====== Options ======
  loadOptions() {
    this.dropDownListService.queryPOS2013_DropDownList({}).subscribe(res => {
      this.venderOptions = (res.Data ?? []).map((item: any) => ({
        label: `${item.No} - ${item.Name}`,
        value: item.VEN_No,
      }));
    });

    this.t111Options = [
      { SYS_Name: '即期', id: 0 },
      { SYS_Name: '15天', id: 15 },
      { SYS_Name: '30天', id: 30 },
      { SYS_Name: '45天', id: 45 },
    ];

    this.bankOptions$ = this.sysbc00Service.querySYSBC00({}).pipe(
      map(res => (res.Data ?? []).map((item: any) => ({
        label: `${item.BNK_No} ${item.BNK_Name}`,
        value: item.BNK_No,
      })))
    );
  }

  // ====== Query ======
  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();

      const queryData: QuerySYSB200Request = {
        VEN_NoList: raw.VEN_NoList,
        VEN_Status: raw.VEN_Status,
        VEN_Uniform: raw.VEN_Uniform,
        VEN_Name: raw.VEN_Name,
        VEN_EngName: raw.VEN_EngName,
        VEN_ShortName: raw.VEN_ShortName,
        VEN_Address: raw.VEN_Address,
        VEN_GUIAddr: raw.VEN_GUIAddr,
        VEN_Boss: raw.VEN_Boss,
        VEN_BossTitle: raw.VEN_BossTitle,
        VEN_BossEmail: raw.VEN_BossEmail,
        VEN_BossTel: raw.VEN_BossTel,
        VEN_Tel: raw.VEN_Tel,
        VEN_Fax: raw.VEN_Fax,
        VEN_Email: raw.VEN_Email,
        VEN_PayConditionDay: raw.VEN_PayConditionDay === '' ? null : raw.VEN_PayConditionDay,
        VEN_PayType: raw.VEN_PayType,
        VEN_BNK_No: raw.VEN_BNK_No,
        VEN_BNK_BranchNo: raw.VEN_BNK_BranchNo,
        VEN_BankAccountNo: raw.VEN_BankAccountNo,
        VEN_AccountName: raw.VEN_AccountName,
        VEN_Remark: raw.VEN_Remark,
        PageSize: raw.pageSize,
        PageIndex: raw.pageIndex,
        SortBy: raw.SortBy,
        OrderBy: '',
        Offset: 0,
      };


      this.sysb200Service.querySYSB200(queryData).subscribe({
        next: (res) => {
          this.data = res.Data ?? [];
          this.totalRecords = res.TotalCount ?? this.data.length;
          this.queryStateService.setQueryState('SYSB200', form.value);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.messageService.errorBubble('查詢失敗，請稍後再試');
        },
      });
    });

    // 記錄查詢條件
    localStorage.setItem('SYSB200_queryForm', JSON.stringify(this.queryForm.getRawValue()));
  }

  // ====== Table Actions ======
  onDelete(rows: VendorData[]): void {
    this.contacts = this.contacts.filter(item => !rows.includes(item));
    this.selectedRows = [];
    this.messageService.successBubble('已刪除選取資料');
  }

  statusChange(row: VendorData, status: '0' | '1') {
    const id = row.pos2013_id ?? row.id; // 只接受數字主鍵
    if (id == null || Number.isNaN(Number(id))) {
      this.messageService.errorBubble(`找不到有效的 id，請確認查詢結果是否有回主鍵欄位（pos2013_id / id）`);
      return;
    }

    if (this.actionLoadingId) return;
    this.actionLoadingId = id;

    const prev = row.VEN_Status;
    row.VEN_Status = status; // 樂觀更新

    this.sysb200Service.updateStatusSYSB200({
      id: Number(id),
      VEN_Status: status
    }).subscribe({
      next: () => {
        const msg = status === '1' ? '審核成功' : '反審核成功';
        this.messageService.successBubble(`${msg}（ID: ${id}）`);
        // this.onSubmit(this.queryForm); // 若要重查就打開
      },
      error: (err) => {
        row.VEN_Status = prev; // 回滾
        const apiMsg = err?.error?.Message || err?.message || '';
        this.messageService.errorBubble(`更新失敗（ID: ${id}）：${apiMsg}`);
      },
      complete: () => (this.actionLoadingId = null),
    });

  }
}
