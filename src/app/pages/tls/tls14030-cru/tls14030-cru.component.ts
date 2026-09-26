import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownTableComponent, FieldsConfig } from '@shared/components/dropdown-table/dropdown-table.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { Column, createPaginationConfig } from '@others/component/table/table.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { apiOption, option } from '../../../shared/models/sys/sysb000.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { Garantee_Ticket, Tls14030Service } from './../../../service/api/tls/tls14030.service';

// 對應後端 queryTalentDropDownResponse
interface TLTTALENT {
  No: string,         // talent_id (string)
  Name: string,       // tlt_name
  Label: string,
  tlt_no: string,
  VEN_No?: string,
  apply_no?: string,
  contract_subno?: string,
  open_fees: number,
  construct_fees: number,
  expiration_fees: number,
  ticket_remarks?: string,
}

@Component({
  selector: 'app-tls14030-cru',
  templateUrl: './tls14030-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    DropdownTableComponent,
    InputTextComponent,
    InputNumberComponent,
    CalendarComponent,
    NgIf,
    TranslateModule,
    DialogModule,
    TableModule,
    InputTextModule,
    ButtonModule,
  ]
})

export class Tls14030CRUComponent extends BasicCruPageComponent<Garantee_Ticket>
  implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [{ value: null, disabled: true }], // read only
    talent_id: [null as number | null, [Validators.required]],
    apply_no: [{ value: null as string | null, disabled: true }], // 專櫃招募編號 自動帶入
    tlt_no: [{ value: null as string | null, disabled: true }], // 專櫃編號 read only          讀取 TLTTALENT 專櫃主檔
    tlt_name: [{ value: null as string | null, disabled: true }], // 專櫃名稱

    VEN_No: [{ value: null as string | null, disabled: true }], // 廠商編號 自動帶入，不可手改

    ticket_type: ['1', [Validators.required, Validators.maxLength(1)]], // 保證票型態 "1=準時開業保證票 2=施工保證票 3=契約屆滿"
    ticket_no: ['', [Validators.required, Validators.maxLength(20)]], // 票據編號 手動輸入
    ticket_kind: [null, [Validators.maxLength(1)]], // 票據種類 非必填但有限制長度 "1=本票 2=支票 3=銀行保證函 9=其他"
    ticket_amount: [null as number | null, [Validators.required, Validators.min(0), Validators.maxLength(10)]], // 保證票金額 整數金額 "讀取 TLTTALENT 專櫃主檔相對的保證金金額"
    expiry_date: [null], // 票據到期日期 手動輸入
    get_ticket_status: [null, [Validators.maxLength(1)]], // 票據收票狀態 "0=未繳票  1=已繳票  2=已退票  9=封存"
    get_date: [null], // 繳票日期 手動輸入
    return_date: [null], // 退票日期 手動輸入
    close_date: [null], // 封存日期 手動輸入
    ticket_remarks: [{ value: null as string | null, disabled: true }], // 保證票摘要-合約主檔 "讀取 TLTTALENT 專櫃主檔ticket_remarks" (不可修改, 本欄位為契約中的保證票備註寫入)
    remark: ['', [Validators.maxLength(200)]], // 備註 手動輸入

    CanDel: [null],  //能否刪除(僅顯示) 卡控
  });

  private lastTalentData: TLTTALENT | null = null; // 快取選取的 TLTTALENT 資料，避免重複打 API

  storageOptions: apiOption[] = [];
  allquery: Garantee_Ticket[] = [];

  TLTTALENT_Option: any[] = [];
  ven_uniformOption: apiOption[] = []; // 統一編號列表
  tlt_noListOption: option[] = []; //專櫃編號列表
  VEN_No_Option: apiOption[] = []; // 廠商編號列表

  ticket_typeOption: option[] = [ //保證票型態
    { value: '1', label: '準時開業保證票' },
    { value: '2', label: '施工保證票' },
    { value: '3', label: '契約屆滿保證票' },
  ];

  ticket_kindOption: option[] = [ //票據種類
    { value: '1', label: '本票' },
    { value: '2', label: '支票' },
    { value: '3', label: '銀行保證函' },
    { value: '9', label: '其他' },
  ];

  get_ticket_statusOption: option[] = [ //票據收票狀態
    { value: '0', label: '未繳票' },
    { value: '1', label: '已繳票' },
    { value: '2', label: '已退票' },
    { value: '9', label: '封存' },
  ];

  // ===================================================
  opLoading = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawTalentData: any[] = []; // 預載所有合約資料，用於 local filter
  opForm = this.formBuilder.group({
    keyword: [''],
    TLT_NO: ['', [Validators.maxLength(12)]], // 專櫃編號
    ven_uniform: ['', [Validators.maxLength(12)]], // 統一編號
    ...createPaginationConfig([{ field: 'No', order: 1 }]), // 分頁和排序參數
  });
  suggestions: any[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'Label', header: '專櫃招募編號', mainDataField: true },
  ];
  opData: any[] = [];// overlayPanel 裡面的table
  opColumns: Column[] = [
    { field: 'contract_no', header: '專櫃招募編號', align: 'left' },
    { field: 'tlt_no', header: '專櫃編號', align: 'left' },
    { field: 'Name', header: '專櫃名稱' },
    { field: 'contract_subno', header: '版次' },
  ];
  opTotalRecords = 0;

  // ── 選取合約 Dialog ──────────────────────────────────────────────
  searchDialogVisible = false;

  openSearchDialog(): void {
    this.searchDialogVisible = true;
    this.opForm.patchValue({ pageIndex: 1 }, { emitEvent: false });
    this.fetchTalentData();
  }

  onDialogSearch(): void {
    this.opForm.patchValue({ pageIndex: 1 }, { emitEvent: false });
    this.fetchTalentData();
  }

  onDialogRowSelect(row: TLTTALENT): void {
    if (!this.suggestions.find(s => s.No === row.No)) {
      this.suggestions = [row, ...this.suggestions];
    }
    this.dataForm.patchValue({ talent_id: Number(row.No) }, { emitEvent: false });
    this.onTalentSelected(row);
    this.searchDialogVisible = false;
  }

  onDialogLazyLoad(event: TableLazyLoadEvent): void {
    const pageSize = event.rows && event.rows > 0 ? event.rows : 30;
    const pageIndex = Math.floor((event.first ?? 0) / pageSize) + 1;
    this.opForm.patchValue({ pageIndex, pageSize }, { emitEvent: false });
    this.fetchTalentData();
  }
  // ────────────────────────────────────────────────────────────────

  // ----------------------------------------------------------------
  constructor(
    private tls14030Service: Tls14030Service,
    private readonly dropDownListService: DropDownListService,) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS14030', this.dataForm);
    this.loadOptions();
    console.log('編輯明細', this.dataForm.value);

    if (this.crudstatus != CRUDStatus.Create) {
      this.dataForm.get('talent_id')?.disable();
      this.dataForm.patchValue({ apply_no: this.rowdata?.apply_no ?? null });
    }

    // ⭐ 監聽 talent_id 變更 重新計算保證票金額
    this.dataForm.get('talent_id')?.valueChanges.subscribe(() => {
      const talentId = this.dataForm.getRawValue().talent_id;
      if (talentId) {
        this.loadTLTTALENTDetail(talentId);
      }
    });

    // ⭐ 監聽 ticket_type 變更 重新計算保證票金額
    this.dataForm.get('ticket_type')?.valueChanges.subscribe(() => {
      if (this.lastTalentData) {
        // 有快取直接用，不打 API
        this.applyTalentData(this.lastTalentData);
      } else {
        // 無快取（編輯模式更換 ticket_type 時才會到這），fallback 打一次 API
        const talentId = this.dataForm.getRawValue().talent_id;
        if (talentId) {
          this.loadTLTTALENTDetail(talentId);
        }
      }
    });
  }

  // ⭐ 從 dropdown-table (select) 接收選取的 rowData，直接填欄位，不打額外 API
  onTalentSelected(rowData: TLTTALENT) {
    // console.log('這是從清單選取的原始資料:', rowData);
    this.lastTalentData = rowData as TLTTALENT;
    this.applyTalentData(this.lastTalentData);
  }

  // 將 TLTTALENT 資料套用到表單
  private applyTalentData(data: TLTTALENT) {
    const ticketType = this.dataForm.get('ticket_type')?.value;
    let ticketAmount: number | null = null;

    switch (ticketType) {
      case '1': ticketAmount = data.open_fees ?? null; break;
      case '2': ticketAmount = data.construct_fees ?? null; break;
      case '3': ticketAmount = data.expiration_fees ?? null; break;
    }

    const patch: Record<string, unknown> = {
      apply_no: data.apply_no || '',
      ticket_remarks: data.ticket_remarks || '',
      tlt_name: data.Name || '',
      tlt_no: data.tlt_no || '',
      ticket_amount: ticketAmount,
    };
    // undefined 表示來源（loadTLTTALENTDetail）根本沒回傳此欄位，不要動現有值
    if (data.VEN_No !== undefined) patch['VEN_No'] = data.VEN_No;

    this.dataForm.patchValue(patch, { emitEvent: false });

    console.log('applyTalentData', data);
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    //--檢查--
    //
    //--------
    const formValue = frm.getRawValue();

    const payload = {
      ...formValue,
      ven_no: formValue.VEN_No, // 加上欄位
    };

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          console.log('insert', payload);
          this.tls14030Service.insertTLS14030(payload).subscribe(() => {
            this.messageService.successBubble('新增成功');
            this.lastTalentData = null;
            this.dataForm.reset(); // 重置表單
          });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update', payload);
          this.tls14030Service.updateTLS14030(payload).subscribe(() => {
            this.messageService.successBubble('更新成功');
            this.onCancel(); // 儲存後，會返回列表
          });
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.lastTalentData = null;
    this.dataForm.reset(); // 重置表單
  }

  // 讀取dropdown選項
  loadOptions() {
    // queryPOS2013_DropDownList 合併成一次呼叫，同時給統一編號篩選與廠商編號主欄位使用
    this.dropDownListService.queryPOS2013_DropDownList({}).subscribe((response) => {
      const items = response.Data as { No: string; VEN_No: string; Name: string }[];
      this.ven_uniformOption = items
        .filter((item, i, self) => i === self.findIndex(t => t.No === item.No))
        .map(item => ({ No: item.No, Name: item.Name, Label: `${item.No}-${item.Name}` }));
      this.VEN_No_Option = items.map(item => ({
        No: item.VEN_No,
        Name: item.Name,
        Label: `${item.VEN_No}-${item.Name}`,
      }));
    });

    this.tls14030Service.queryTLTTALENT_DropDownList({}).subscribe((response) => {
      this.tlt_noListOption = response.Data.map((item: apiOption) => ({
        No: item.No,
        Label: `${item.No}-${item.Name}`,
      }));
    });
    // 注意：fetchTalentData() 不在 init 呼叫。
    // dropdown-table 的 onFocusAndInitialLoad 會在使用者第一次聚焦時自動觸發 formValueChanged → onformValueChanged()
  }

  // Fallback：只有編輯模式改 ticket_type 且無快取時才呼叫
  // getTLTTALENT 回傳欄位名與 TLTTALENT interface 不同，手動轉換
  private loadTLTTALENTDetail(talent_id: number) {
    if (!talent_id) return;
    this.tls14030Service.getTLTTALENT({ talent_id }).subscribe((response) => {
      const raw = response.Data;
      if (!raw) return;
      const data: TLTTALENT = {
        No: String(raw.talent_id),
        Name: raw.tlt_name ?? '',
        Label: raw.tlt_no ?? '',
        tlt_no: raw.tlt_no ?? '',
        apply_no: raw.apply_no ?? '',
        open_fees: raw.open_fees ?? 0,
        construct_fees: raw.construct_fees ?? 0,
        expiration_fees: raw.expiration_fees ?? 0,
        ticket_remarks: raw.ticket_remarks,
        // VEN_No 不帶入：edit 模式下表單已有值，避免 getTLTTALENT 未回傳時誤清
      };
      this.lastTalentData = data;
      this.applyTalentData(data);
    });
  }

  private fetchTalentData() {
    this.opLoading = true;

    const formRaw = this.opForm.getRawValue();
    const params = {
      keyword: formRaw.keyword || '',
      TLT_NO: formRaw.TLT_NO || '',
      ven_uniform: formRaw.ven_uniform || '',
      pageSize: formRaw.pageSize || 30,
      pageIndex: formRaw.pageIndex || 1,
      SortBy: [{ field: 'contract_subno', order: -1 }],
    };

    this.tls14030Service.queryTalentDropDown(params)
      .subscribe({
        next: (results: any) => {
          const data = (results['Data'] ?? []) as TLTTALENT[];
          this.opData = [...data];
          this.suggestions = [...data];
          this.opTotalRecords = results['TotalCount'] || data.length;
          this.opLoading = false;
        },
        error: () => {
          this.opLoading = false;
        }
      });
  }

  onAutoCompleteInputChange(event: any) {
    const keyword = (typeof event === 'string') ? event : (event?.No || '');
    this.opForm.patchValue({ keyword }, { emitEvent: false });
    this.fetchTalentData();
  }

  onformValueChanged(event: any) {
    this.fetchTalentData();
  }

  onLazyLoad(event: { pageIndex: number; pageSize: number }) {
    this.opForm.patchValue({ pageIndex: event.pageIndex, pageSize: event.pageSize }, { emitEvent: false });
    this.fetchTalentData();
  }
}
