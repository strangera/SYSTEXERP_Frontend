import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DropDownListService, IDropdownItem } from 'src/app/service/utility/dropDownList.service';
import { getSYS1000Options } from 'src/app/service/system/sys1000.service';
import { TableReportComponent } from 'src/app/shared/components/table-report/table-report.component';
import { AddButton, Column } from '../../../others/component/table/table.model';
import { QuerySYSB200Request, Sysb200Service } from '../../../service/api/sys/sysb200.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { Sysbc00Service } from './../../../service/api/sys/sysbc00.service';

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
    TableReportComponent,
    AsyncPipe,
    TranslateModule,
  ],
})
export class SYSB200Component extends BasicQueryPageComponent<any> implements OnInit {
 queryForm = this.formBuilder.group({
  VEN_NoList: [[]],
  VEN_Status: [''],
  VEN_Uniform: ['', [Validators.maxLength(10)]],
  VEN_Flag: [null],

  VEN_Name: ['', [Validators.maxLength(100)]],
  VEN_EngName: ['', [Validators.maxLength(100)]],
  VEN_ShortName: ['', [Validators.maxLength(100)]],

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

  pageSize: [30],
  pageIndex: [1],
  SortBy: [[{ field: 'VEN_No', order: 1 }]],
});
  approvalOptions: { label: string; value: string }[] = [
    { label: '未審核', value: '0' },
    { label: '已審核', value: '1' },
  ];
  flagOptions: { label: string; value: string }[] = [];
  columns: Column[] = [
    { field: 'VEN_No', header: '廠商編號', visible: true },
    { field: 'VEN_Status', header: '審核狀態', visible: true, format: (v) => v === '0' ? '未審核' : '已審核' },
    { field: 'VEN_Uniform', header: '統一編號', visible: true },
    { field: 'VEN_Flag', header: '系統別', visible: true, format: (v) => this.flagOptions.find(o => o.value === v)?.label ?? v },
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
    { field: 'VEN_GUIEmail', header: '公司發票電子郵件', visible: true },
    { field: 'VEN_PayConditionDay', header: '付款期限(天數)', visible: true },
    { field: 'VEN_PayType', header: '付款方式', visible: true },
    { field: 'VEN_BNK_No', header: '銀行代號', visible: false },
    { field: 'VEN_BNK_BranchNo', header: '分行代號', visible: false },
    { field: 'VEN_BankAccountNo', header: '銀行帳號', visible: false },
    { field: 'VEN_AccountName', header: '戶名', visible: false },
    { field: 'VEN_Remark', header: '備註', visible: true },
  ];
  data: VendorData[] = [];
  totalRecords = 0;
  lastQueryBody: any;
  selectedRows: VendorData[] = [];
  selectedItems: VendorData[] = [];
  VEN_NoList: IDropdownItem[] = [];
  venderOptions: any[] = [];
  t111Options: any[] = [];
  bankOptions$!: Observable<any[]>;
  contacts: any[] = [];
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
      disabled: (row: VendorData) => {
        return row.VEN_Status === '1'
      }
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
      disabled: (row: VendorData) => {
        return row.VEN_Status === '0'
      }
    },
    {
      label: '複製',
      icon: 'pi pi-copy text-blue-500',
      action: (row: VendorData) => {
        if (this.actionLoadingId) return;
        if (!this.hasPermission(this.Actions.Create)) return;
        this.messageService.confirm({
          message: `確定要複製廠商編號 ${row.VEN_No} 的資料嗎？將依原資料產生一筆未審核的新廠商資料（含聯絡人明細）。`,
          header: '複製確認',
          icon: 'pi pi-question-circle',
          accept: () => this.copyRow(row),
        });
      },
      disabled: () => !this.hasPermission(this.Actions.Create),
    },
  ];

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly validationService: ValidationService,
    private readonly sysbc00Service: Sysbc00Service,
    public readonly sysb200Service: Sysb200Service
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
    this.flagOptions = getSYS1000Options('VEN_Flag');
    this.dropDownListService.queryPOS2013_DropDownList({}).subscribe(res => {
      this.venderOptions = (res.Data ?? []).map((item: any) => ({
        label: `${item.VEN_No} - ${item.ShortName}`,
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
        label: `${item.BNK_No} - ${item.BNK_Name}`,
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
        VEN_Flag: raw.VEN_Flag,
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
      };
      this.sysb200Service.querySYSB200(queryData).pipe(finalize(() => (this.loading = false))).subscribe((res) => {
        this.data = res.Data ?? [];
        this.lastQueryBody = queryData;
        this.totalRecords = res.TotalCount ?? this.data.length;
        this.queryStateService.setQueryState('SYSB200', form.value);
        this.loading = false;
      });
    });
    localStorage.setItem('SYSB200_queryForm', JSON.stringify(this.queryForm.getRawValue()));
  }
  isRowSelectable(row: any): boolean {
    return row.VEN_Status !== '1';
  }
  // ====== Table Actions ======
  onDelete(rows: VendorData[]): void {
    if (!rows || rows.length === 0) {
      this.messageService.warnBubble('請先選擇要刪除的廠商資料');
      return;
    }

    // 1. 前端先行卡控：檢查是否有非「未審核」的單據
    const illegalRows = rows.filter(row => row.VEN_Status !== '0');
    if (illegalRows.length > 0) {
      const illegalNos = illegalRows.map(r => r.VEN_No).join(', ');
      this.messageService.errorBubble(
        `選取的廠商中包含已審核資料（廠商編號: ${illegalNos}），必須為「未審核」狀態才可刪除！`,
        '刪除失敗'
      );
      return;
    }

    // 2. 彈出確認視窗防呆 (利用專案既有的 messageService.confirm)
    this.messageService.confirm({
      message: `確定要刪除這 ${rows.length} 筆廠商資料嗎？刪除後將連同聯絡人明細一併移除。`,
      header: '刪除確認',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        const idList = rows
          .map(row => row.id)
          .filter((id): id is number => id !== undefined);

        if (idList.length === 0) {
          this.messageService.errorBubble('找不到有效的資料 ID');
          this.loading = false;
          return;
        }
        this.sysb200Service.deleteSYSB200({ idList }).pipe(
          finalize(() => this.loading = false)
        ).subscribe((res) => {
          this.messageService.successBubble(res.Message || '資料刪除成功！');
          this.selectedItems = [];
          this.onSubmit(this.queryForm);
        });
      }
    });
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

  copyRow(row: VendorData) {
    const id = row.pos2013_id ?? row.id;
    if (id == null || Number.isNaN(Number(id))) {
      this.messageService.errorBubble('找不到有效的 id，請確認查詢結果是否有回主鍵欄位（pos2013_id / id）');
      return;
    }

    this.actionLoadingId = id;
    this.sysb200Service.copySYSB200({ id: Number(id) }).pipe(
      finalize(() => (this.actionLoadingId = null))
    ).subscribe({
      next: (res) => {
        this.messageService.successBubble(`複製成功，廠商編號${res.Data}請確認`);
        this.onSubmit(this.queryForm);
      },
    });
  }
}
