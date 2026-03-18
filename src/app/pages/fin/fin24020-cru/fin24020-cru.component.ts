import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin24020Service } from '@service/api/fin/fin24020.service';
import { DropDownListService, IAPS3001Item } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownTableComponent } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { Column, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { QueryStateService } from '@shared/service/query-state.service';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-fin24020-cru',
  templateUrl: './fin24020-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    InputNumberComponent,
    CalendarComponent,
    DropdownTableComponent,
    InputTextComponent,
    TableEditComponent,
  ]
})
export class FIN24020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.group({
    ACP_No: ['', Validators.required],        // string
    VEN_No: ['', Validators.required],        // string
    VEN_Name: ['', Validators.required],      // string
    ACP_Amt: [0, Validators.required],        // number
    ACP_Date: [null as Date | null, Validators.required], // Date | null
    ACP_ReserveAmt: [0, Validators.required],
    ACP_YYYYMM: [''],
    acp_termno: [0, Validators.required],
    RET_Date: [null as Date | null],
    RET_Amt: [0, Validators.required],
    STATUS: ['', Validators.required],
    Remark: [''],
    ACP_BalanceAmt: [0, Validators.required],
    sam: [0, Validators.required],
  });

  // APS3001 應付ID 下拉查詢相關
  dialogQueryForm = this.formBuilder.group({
    ACP_No: [''],
    VEN_No: [''],    // 新增
    VEN_Name: [''],  // 新增
    ACP_Date: [''],  // 新增
  });
  apsDialogLoading = false;
  apsRawData: IAPS3001Item[] = [];
  apsDialogData: IAPS3001Item[] = [];
  apsSuggestions: IAPS3001Item[] = [];
  apsFieldsConfig = [
    { field: 'ACP_No', header: '應付ID', mainDataField: true },
  ];
  apsDialogColumns: Column[] = [
    { field: 'ACP_No', header: '應付帳款編號' },
    { field: 'VEN_No', header: '廠客代號' },
    { field: 'VEN_Name', header: '廠客名稱' },
    { field: 'ACP_Amt', header: '應付金額', format: formatAmount },
    { field: 'ACP_Date', header: '立帳日期', format: formatDate },
  ];

  statusOptions = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' },
  ];
  editColumns: EditColumn[] = [
    { field: 'acp_termno', header: '帳次', type: 'inputNumber', textAlign: 'left' },
    {
      field: 'RET_Date',
      header: '保留退款日期',
      type: 'date',
      validate: [validateRequired],
      width: '10rem'
    },
    {
      field: 'RET_Amt',
      header: '保留退款金額',
      type: 'inputNumber',
      validate: [validateRequired],
      width: '10rem'
    },
    { field: 'Remark', header: '備註', type: 'input', textAlign: 'left' },
    {
      field: 'STATUS',
      header: '是否已付款',
      type: 'dropdown',
      options: this.statusOptions,
      optionLabel: 'label',
      optionValue: 'value',
      width: '8rem',
      hidden: () => this.isFormCreateable,
      validate: [validateRequired],
      disabled: () => !this.isFormCreateable,
    },

  ];
  tableData: any[] = [];
  constructor(
    private readonly datePipe: DatePipe,
    public readonly fin24020Service: Fin24020Service,
    private readonly dropDownListService: DropDownListService,
    private readonly queryStateService: QueryStateService,
  ) {
    super();
  }
  private lastAcpSelectTime = 0;
  private lastAcpNo = '';
  // 暫存上一次送出的明細 key 順序（用於在後端未儲存 SortIndex 時還原順序）
  private lastSentDetailKeyOrder: string[] = [];
  // 讀取時的原始明細快照（用於 local cancel 還原）
  private originalTableDataSnapshot: any[] = [];

  ngOnInit(): void {
    this.initializePage('FIN24020', this.dataForm, { useReadonly: true });

    try {
      if (this.isFormCreateable) {
        this.editColumns = (this.editColumns || []).filter(c => c.field !== 'STATUS');
      }
    } catch (e) { /* ignore */ }
    this.loadAPS3001List();
    this.initializeFormFromRowData();

    // 若 dropdown-table 在選取後觸發 parent form reset()，當 ACP_No 被清空時在短時間內自動恢復
    this.dialogQueryForm.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
      try {
        console.log('⭐Dialog query form value changed:', value);
        const now = Date.now();
        if ((value?.ACP_No === null || value?.ACP_No === undefined || String(value?.ACP_No).trim() === '')
          && this.lastAcpNo && (now - this.lastAcpSelectTime) < 1000) {
          this.dialogQueryForm.patchValue({ ACP_No: this.lastAcpNo }, { emitEvent: false });
        }
      } catch (e) { /* ignore */ }
    });

    // 當使用者修改關鍵金額欄位或明細時，若先前因驗證失敗導致 submitted/loading/block，則清除狀態讓使用者可以重送
    this.dataForm.get('ACP_Amt')?.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      if (this.submitted || this.loading) {
        this.submitted = false;
        this.loading = false;
        try { this.messageService.unblockUi(); } catch (e) { /* ignore */ }
      }
    });
    this.dataForm.get('ACP_ReserveAmt')?.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      if (this.submitted || this.loading) {
        this.submitted = false;
        this.loading = false;
        try { this.messageService.unblockUi(); } catch (e) { /* ignore */ }
      }
    });

    // 當不是新增模式（例如 Edit / Read），不可手動修改應付ID；編輯/檢視時也不可修改「是否已付款」
    if (!this.isFormCreateable) {
      this.dataForm.get('ACP_No')?.disable({ emitEvent: false });
      this.dataForm.get('STATUS')?.disable({ emitEvent: false });
    } else {
      this.dataForm.get('ACP_No')?.enable({ emitEvent: false });
      this.dataForm.get('STATUS')?.enable({ emitEvent: false });
    }

    if (this.isFormReadable) {
      this.dialogQueryForm.disable({ emitEvent: false });
    }
  }

  private initializeFormFromRowData(): void {
    const row: any = this.rowdata;
    if (row) {
      const retDate = row.RET_Date ? new Date(row.RET_Date + 'T00:00:00') : null;
      const retAmt = Number(row.RET_Amt ?? row.ACP_ReserveAmt ?? 0);
      const statusCode = row.STATUS === '是'
        ? 'Y'
        : row.STATUS === '否'
          ? 'N'
          : (row.STATUS ?? 'N');

      this.dataForm.patchValue({
        ACP_No: row.ACP_No ?? '',
        VEN_No: row.VEN_No ?? '',
        VEN_Name: row.VEN_Name ?? '',
        ACP_ReserveAmt: row.ACP_ReserveAmt ?? 0,
        ACP_YYYYMM: row.ACP_YYYYMM ?? '',
        acp_termno: row.acp_termno ?? 0,
        RET_Date: retDate,
        STATUS: statusCode,
        Remark: row.NoteDesc ?? '',
        sam: retAmt,
      });
      if (row.ACP_Amt != null) {
        this.dataForm.patchValue({ ACP_Amt: row.ACP_Amt });
      }
      if (row.ACP_Date) {
        this.dataForm.patchValue({
          ACP_Date: new Date(row.ACP_Date + 'T00:00:00'),
        });
      } else if (row.ACP_YYYYMM) {
        const yyyymm = String(row.ACP_YYYYMM);
        if (yyyymm.length === 6) {
          const year = Number(yyyymm.substring(0, 4));
          const month = Number(yyyymm.substring(4, 6));
          if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
            this.dataForm.patchValue({
              ACP_Date: new Date(year, month - 1, 1),
            });
          }
        }
      }
      if (row.ACP_BalanceAmt != null) {
        this.dataForm.patchValue({ ACP_BalanceAmt: row.ACP_BalanceAmt });
      }
      this.dialogQueryForm.patchValue({
        ACP_No: row.ACP_No ?? '',
      });

      const queryBody: any = {
        PageSize: 9999,
        PageIndex: 1,
        pageSize: 9999,
        pageIndex: 1,
        Offset: 0,
        OrderBy: '',
        SortBy: [],
        ACP_No: row.ACP_No ?? ''
      };
      this.fin24020Service.queryFIN24020(queryBody)
        .pipe(untilDestroyed(this), finalize(() => {
          // no-op
        }))
        .subscribe(res => {

          //查詢結果
          console.log('☀️Query result:', res.Data);


          let items = (res?.Data ?? []) as any[];
          // 支援兩種回傳：1) 直接明細陣列 2) wrapper 格式 { Data:{...}, Details:[...] }
          if (items && items.length) {
            const first = items[0];
            // wrapper 格式
            if (first && first.Data && Array.isArray(first.Details)) {
              const header = first.Data || {};
              // 從 header 填入主檔欄位（若尚未填）
              try {
                this.dataForm.patchValue({
                  ACP_Amt: header.ACP_Amt ?? this.dataForm.value.ACP_Amt,
                  ACP_ReserveAmt: header.ACP_ReserveAmt ?? this.dataForm.value.ACP_ReserveAmt,
                  ACP_BalanceAmt: header.ACP_BalanceAmt ?? this.dataForm.value.ACP_BalanceAmt,
                  ACP_Date: header.ACP_Date ? new Date(header.ACP_Date + 'T00:00:00') : this.dataForm.value.ACP_Date,
                }, { emitEvent: false });
              } catch (e) { /* ignore */ }
              // 將 Details 展成 tableData
              let details = (first.Details || []);
              // 排序優先順序：1) SortIndex 2) SeqNo（後端常回傳）3) 不變（維持回傳順序）
              try {
                if (details && details.length) {
                  if (details.some((d: any) => d.SortIndex !== undefined && d.SortIndex !== null)) {
                    details = details.slice().sort((a: any, b: any) => (Number(a.SortIndex) || 0) - (Number(b.SortIndex) || 0));
                  } else if (details.some((d: any) => d.SeqNo !== undefined && d.SeqNo !== null)) {
                    details = details.slice().sort((a: any, b: any) => (Number(a.SeqNo) || 0) - (Number(b.SeqNo) || 0));
                  }
                }
              } catch (e) { /* ignore */ }
              // 若後端未回傳 SortIndex，嘗試以最近一次送出的明細 key 還原原本順序（best-effort）
              try {
                if ((!details.some((d: any) => d.SortIndex !== undefined && d.SortIndex !== null))
                  && this.lastSentDetailKeyOrder && this.lastSentDetailKeyOrder.length) {
                  const keyed = details.map((d: any) => ({
                    d,
                    key: `${d.RET_Date ? new Date(d.RET_Date + 'T00:00:00').toISOString().split('T')[0] : ''}|${Number(d.RET_Amt) || 0}|${(d.STATUS || '').toString().trim()}|${(d.NoteDesc || '').toString().trim()}`
                  }));
                  keyed.sort((a: any, b: any) => {
                    const ai = this.lastSentDetailKeyOrder.indexOf(a.key);
                    const bi = this.lastSentDetailKeyOrder.indexOf(b.key);
                    if (ai === -1 && bi === -1) return 0;
                    if (ai === -1) return 1;
                    if (bi === -1) return -1;
                    return ai - bi;
                  });
                  details = keyed.map((k: any) => k.d);
                }
              } catch (e) { /* ignore */ }

              this.tableData = details.map((d: any) => ({
                acp_termno: d.acp_termno, // 帳次
                RET_Date: d.RET_Date ? new Date(d.RET_Date + 'T00:00:00') : null, // 退保留款日期
                RET_Amt: Number(d.RET_Amt ?? d.ACP_ReserveAmt ?? 0), // 退保留款金額
                Remark: d.Remark ?? '', // 應付主檔摘要
                STATUS: this.toStatusCode(d.STATUS), // 是否已付款(Y/N)
                ACP_Amt: d.ACP_Amt, // 應付金額
                ACP_BalanceAmt: d.ACP_BalanceAmt // 應付帳款餘額
                , _sortIndex: d.SortIndex
              }));

              console.log('✨Processed tableData:', this.tableData);
              // 儲存原始快照以便 local cancel 還原
              try { this.originalTableDataSnapshot = JSON.parse(JSON.stringify(this.tableData || [])); } catch (e) { this.originalTableDataSnapshot = [...(this.tableData || [])]; }
              // 如果 header 沒有金額，嘗試從第一筆明細帶入
              const firstDetail = details[0];
              const totalRet = details.reduce((s: number, it: any) => s + (Number(it.RET_Amt) || 0), 0);
              try {
                this.dataForm.patchValue({
                  ACP_Amt: header.ACP_Amt ?? firstDetail?.ACP_Amt ?? this.dataForm.value.ACP_Amt,
                  ACP_BalanceAmt: header.ACP_BalanceAmt ?? firstDetail?.ACP_BalanceAmt ?? this.dataForm.value.ACP_BalanceAmt,
                  RET_Amt: totalRet ?? this.dataForm.value.RET_Amt,
                  sam: totalRet ?? this.dataForm.value.sam
                }, { emitEvent: false });
              } catch (e) { /* ignore */ }
            } else {
              // 非 wrapper，items 為明細列
              // 如果回傳的明細包含 SortIndex，依 SortIndex 排序
              try {
                if (items && items.length) {
                  if (items.some((it: any) => it.SortIndex !== undefined && it.SortIndex !== null)) {
                    items = items.slice().sort((a: any, b: any) => (Number(a.SortIndex) || 0) - (Number(b.SortIndex) || 0));
                  } else if (items.some((it: any) => it.SeqNo !== undefined && it.SeqNo !== null)) {
                    items = items.slice().sort((a: any, b: any) => (Number(a.SeqNo) || 0) - (Number(b.SeqNo) || 0));
                  }
                }
              } catch (e) { /* ignore */ }

              // 嘗試以 lastSentDetailKeyOrder 還原順序（若沒有 SortIndex）
              try {
                if ((!items.some((it: any) => it.SortIndex !== undefined && it.SortIndex !== null))
                  && this.lastSentDetailKeyOrder && this.lastSentDetailKeyOrder.length) {
                  const keyed = items.map((it: any) => ({
                    it,
                    key: `${it.RET_Date ? new Date(it.RET_Date + 'T00:00:00').toISOString().split('T')[0] : ''}|${Number(it.RET_Amt) || 0}|${(it.STATUS || '').toString().trim()}|${(it.NoteDesc || '').toString().trim()}`
                  }));
                  keyed.sort((a: any, b: any) => {
                    const ai = this.lastSentDetailKeyOrder.indexOf(a.key);
                    const bi = this.lastSentDetailKeyOrder.indexOf(b.key);
                    if (ai === -1 && bi === -1) return 0;
                    if (ai === -1) return 1;
                    if (bi === -1) return -1;
                    return ai - bi;
                  });
                  items = keyed.map((k: any) => k.it);
                }
              } catch (e) { /* ignore */ }

              this.tableData = items.map(it => ({
                acp_termno: it.acp_termno,
                RET_Date: it.RET_Date ? new Date(it.RET_Date + 'T00:00:00') : null,
                RET_Amt: Number(it.RET_Amt ?? it.ACP_ReserveAmt ?? 0),
                Remark: it.Remark ?? '',
                STATUS: this.toStatusCode(it.STATUS)
                , _sortIndex: it.SortIndex
              }));
              try { this.originalTableDataSnapshot = JSON.parse(JSON.stringify(this.tableData || [])); } catch (e) { this.originalTableDataSnapshot = [...(this.tableData || [])]; }
            }
          } else {
            this.tableData = [{
              acp_termno: row.acp_termno,
              RET_Date: retDate,
              RET_Amt: retAmt,
              Remark: row.Remark ?? '',
              STATUS: statusCode,
            }];
            try { this.originalTableDataSnapshot = JSON.parse(JSON.stringify(this.tableData || [])); } catch (e) { this.originalTableDataSnapshot = [...(this.tableData || [])]; }
          }
        }, () => {
          this.tableData = [{
            acp_termno: row.acp_termno,
            RET_Date: retDate,
            RET_Amt: retAmt,
            Remark: row.Remark ?? '',
            STATUS: statusCode,
          }];
        });
    } else {
      this.dataForm.patchValue({ STATUS: 'N' });
      this.tableData = [{
        acp_termno: this.dataForm.value.acp_termno,
        RET_Date: this.dataForm.value.RET_Date,
        RET_Amt: this.dataForm.value.RET_Amt,
        Remark: this.dataForm.value.Remark,
        STATUS: this.dataForm.value.STATUS || 'N',
      }];
    }
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const detailRows = (this.tableData || []).filter(r => !r._isAutoInsertCandidate);
      // 建立本次送出的明細 key 順序，用以在回傳中嘗試還原使用者順序（best-effort）
      try {
        this.lastSentDetailKeyOrder = detailRows.map(r => {
          const d = r.RET_Date ? new Date(r.RET_Date) : null;
          const dateKey = d && !isNaN(d.getTime()) ? this.datePipe.transform(d, 'yyyy-MM-dd') : '';
          return `${dateKey}|${Number(r.RET_Amt) || 0}|${(r.STATUS || '').toString().trim()}|${(r.Remark || '').toString().trim()}`;
        });
      } catch (e) { this.lastSentDetailKeyOrder = []; }
      if (!detailRows.length) {
        this.loading = false;
        try { this.messageService.unblockUi(); } catch (e) { }
        this.submitted = false;
        this.messageService.errorBubble('請至少輸入一筆保留退款明細');
        return;
      }
      const acpAmt = Number(frm.value.ACP_Amt) || 0;
      const reserveAmt = Number(frm.value.ACP_ReserveAmt) || 0;
      const totalRetAmt = detailRows.reduce((sum, r) => sum + (Number(r.RET_Amt) || 0), 0);

      if (this.isFormCreateable) {
        const anyRowTooLarge = detailRows.some(r => (Number(r.RET_Amt) || 0) > reserveAmt);
        if (anyRowTooLarge) {
          this.loading = false;
          try { this.messageService.unblockUi(); } catch (e) { }
          this.submitted = false;
          this.messageService.errorBubble('保留退款金額不可大於保留款金額');
          return;
        }
        if (totalRetAmt > reserveAmt) {
          this.loading = false;
          try { this.messageService.unblockUi(); } catch (e) { }
          this.submitted = false;
          this.messageService.errorBubble('保留款退款金額合計不可大於保留款金額');
          return;
        }
        // 新增檢查：保留款金額減退保留款金額不得大於應付帳款餘額
        const acpBalance = Number(frm.value.ACP_BalanceAmt) || 0;
        if ((reserveAmt - totalRetAmt) > acpBalance) {
          this.loading = false;
          try { this.messageService.unblockUi(); } catch (e) { }
          this.submitted = false;
          this.messageService.errorBubble('保留款金額減退保留款金額不可大於應付帳款餘額');
          return;
        }
      }

      if (reserveAmt > acpAmt) {
        this.loading = false;
        try { this.messageService.unblockUi(); } catch (e) { }
        this.submitted = false;
        this.messageService.errorBubble('保留款金額不可大於應付金額');
        return;
      }
      if (totalRetAmt > acpAmt) {
        this.loading = false;
        try { this.messageService.unblockUi(); } catch (e) { }
        this.submitted = false;
        this.messageService.errorBubble('保留款退款金額不可大於應付金額');
        return;
      }
      const rawAcpDate = frm.get('ACP_Date')?.value;
      let acpDate: string | null = null;
      if (rawAcpDate) {
        const d = new Date(rawAcpDate);
        acpDate = !isNaN(d.getTime())
          ? this.datePipe.transform(d, 'yyyy-MM-dd') ?? null
          : this.datePipe.transform(rawAcpDate, 'yyyy-MM-dd') ?? null;
      }
      let acpYyyymm = '';
      const rawAcpYyyymm = frm.value.ACP_YYYYMM || rawAcpDate;
      if (rawAcpYyyymm) {
        const formatted = this.datePipe.transform(rawAcpYyyymm, 'yyyyMM');
        acpYyyymm = formatted ?? '';
      }

      if (!acpYyyymm) {
        this.loading = false;
        try { this.messageService.unblockUi(); } catch (e) { }
        this.submitted = false;
        this.messageService.errorBubble('帳款年月不可空白');
        return;
      }
      const acpNo = (frm.value.ACP_No
        || this.dialogQueryForm.value.ACP_No
        || (this.rowdata as any)?.ACP_No
        || '') as string;

      if (!frm.value.ACP_No && acpNo) {
        this.dataForm.patchValue({ ACP_No: acpNo }, { emitEvent: false });
      }

      const body: any = {
        ACP_No: acpNo,
        VEN_No: frm.value.VEN_No ?? '',
        VEN_Name: frm.value.VEN_Name ?? '',
        ACP_Amt: frm.value.ACP_Amt ?? 0,
        ACP_Date: acpDate,
        ACP_ReserveAmt: frm.value.ACP_ReserveAmt ?? 0,
        Items: detailRows.map((row, idx) => {
          const rawRetDate = row.RET_Date;
          let retDate: string | null = null;
          if (rawRetDate) {
            const d = new Date(rawRetDate);
            retDate = !isNaN(d.getTime())
              ? this.datePipe.transform(d, 'yyyy-MM-dd') ?? null
              : this.datePipe.transform(rawRetDate, 'yyyy-MM-dd') ?? null;
          }
          return {
            ACP_No: acpNo,
            ACP_YYYYMM: acpYyyymm,
            // acp_termno: frm.value.acp_termno ?? 0,
            acp_termno: row.acp_termno ?? 0,
            RET_Date: retDate,
            RET_Amt: row.RET_Amt ?? 0,
            STATUS: this.toStatusCode(row.STATUS),
            Remark: row.Remark ?? '',
            // 附加 SortIndex 以便後端儲存並在讀取時回傳保持順序（若後端支援）
            SortIndex: idx
          };
        })
      };
      console.log('🚀Submitting body:', body);
      const request$ = this.isFormCreateable
        ? this.fin24020Service.createFIN24020(body)
        : this.fin24020Service.updateFIN24020(body);

      this.loading = true;
      request$
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(res => {
          this.messageService.successBubble(res.Message);
          const header: any = (res as any)?.Data;
          if (header) {
            const headerAcpDate = header.ACP_Date
              ? new Date(header.ACP_Date + 'T00:00:00')
              : frm.get('ACP_Date')?.value;

            this.dataForm.patchValue({
              ACP_No: header.ACP_No ?? acpNo,
              VEN_No: header.VEN_No ?? frm.value.VEN_No,
              VEN_Name: header.VEN_Name ?? frm.value.VEN_Name,
              ACP_Amt: header.ACP_Amt ?? frm.value.ACP_Amt,
              ACP_Date: headerAcpDate,
            }, { emitEvent: false });

            this.dialogQueryForm.patchValue({
              ACP_No: header.ACP_No ?? acpNo,
            }, { emitEvent: false });
          }
          this.onCancel();
        });
    });
  }

  // 保留退款明細異動時，更新 tableData 並即時計算「已產生保留款」
  onTableDataChange(data: any[]): void {
    this.tableData = data || [];
    const effectiveRows = this.tableData.filter(r => !r._isAutoInsertCandidate);
    const totalRetAmt = effectiveRows.reduce((sum, r) => sum + (Number(r.RET_Amt) || 0), 0);
    this.dataForm.patchValue({ sam: totalRetAmt }, { emitEvent: false });
    if (this.submitted || this.loading) {
      this.submitted = false;
      this.loading = false;
      try { this.messageService.unblockUi(); } catch (e) { /* ignore */ }
    }
  }

  // 當使用者按下 local Cancel 時，恢復成讀取時的原始明細與計算值
  onLocalCancel(): void {
    try {
      // 恢復 tableData
      this.tableData = JSON.parse(JSON.stringify(this.originalTableDataSnapshot || []));
    } catch (e) {
      this.tableData = [...(this.originalTableDataSnapshot || [])];
    }
    // 觸發 table change 處理（更新 sam 等值）
    this.onTableDataChange(this.tableData);
    // 恢復 form 欄位（若有初始 rowdata，可重置部分欄位）
    try {
      if (this.rowdata) {
        this.initializeFormFromRowData();
      }
    } catch (e) { /* ignore */ }
  }

  override onCancel(returnValue?: any) {
    try { this.queryStateService.setQueryState(this.ProgNo, this.queryData); } catch (e) { /* ignore */ }

    const queryPageRoute = this.previousRoute?.includes('account/')
      ? this.previousRoute
      : `/account/${this.ProgNo.toLowerCase().slice(0, 3)}/${this.ProgNo.toLowerCase()}`;

    const extras: NavigationExtras = {
      state: {
        fromRoute: this.router.url,
        data: returnValue,
      },
    };

    this.router.navigate([queryPageRoute], extras);
  }

  // APS3001 應付ID 下拉資料
  private loadAPS3001List(): void {
    this.apsDialogLoading = true;
    this.dropDownListService
      .queryAPS3001_DropDownList()
      .pipe(untilDestroyed(this), finalize(() => (this.apsDialogLoading = false)))
      .subscribe(res => {
        const data = res.Data ?? [];
        this.apsRawData = data;
        this.apsDialogData = data;
        this.apsSuggestions = data;
      });
  }
  onApsInputChange(event: Record<string, string>): void {
    const keyword = (event?.['ACP_No'] || '').trim();
    if (!keyword) {
      this.apsDialogData = this.apsRawData;
      this.apsSuggestions = this.apsRawData;
      return;
    }
    const filtered = this.apsRawData.filter(item => item.ACP_No?.includes(keyword));
    this.apsDialogData = filtered;
    this.apsSuggestions = filtered;
  }
  onDialogQueryFormValueChanged(value: Record<string, string>): void {
    // const keyword = (value?.['ACP_No'] || '').trim();
    // if (!keyword) {
    //   this.apsDialogData = this.apsRawData;
    //   this.apsSuggestions = this.apsRawData;
    //   return;
    // }
    // const filtered = this.apsRawData.filter(item => item.ACP_No?.includes(keyword));
    // this.apsDialogData = filtered;
    // this.apsSuggestions = filtered;

    // 當對話框內的查詢條件改變時，直接觸發搜尋(過濾)
    this.onApsDialogSearch();
  }

  private toStatusCode(status: any): string {
    const s = (status ?? '').toString();
    if (s === '是') { return 'Y'; }
    if (s === '否') { return 'N'; }
    return s;
  }
  private fillFormFromApsItem(item: IAPS3001Item): void {
    const patch: any = {};
    if (item.ACP_No !== undefined && item.ACP_No !== null && String(item.ACP_No).trim() !== '') {
      patch.ACP_No = item.ACP_No;
    }
    if (item.VEN_No !== undefined && item.VEN_No !== null && String(item.VEN_No).trim() !== '') {
      patch.VEN_No = item.VEN_No;
    }
    if (item.VEN_Name !== undefined && item.VEN_Name !== null && String(item.VEN_Name).trim() !== '') {
      patch.VEN_Name = item.VEN_Name;
    }
    if (item.ACP_Amt !== undefined && item.ACP_Amt !== null) {
      patch.ACP_Amt = item.ACP_Amt;
    }
    if (item.ACP_Date) {
      patch.ACP_Date = new Date(item.ACP_Date + 'T00:00:00');
    }

    if (Object.keys(patch).length) {
      this.dataForm.patchValue(patch);
    }
  }
  onApsSelect(item: IAPS3001Item): void {
    const now = Date.now();
    const id = item?.ACP_No ?? '';
    if (id === this.lastAcpNo && (now - this.lastAcpSelectTime) < 500) {
      return;
    }
    this.lastAcpNo = id;
    this.lastAcpSelectTime = now;

    this.fillFormFromApsItem(item);
    try {
      setTimeout(() => {
        this.dialogQueryForm.patchValue({ ACP_No: item?.ACP_No ?? '' }, { emitEvent: false });
      }, 0);
    } catch (e) {
      // ignore
    }
  }

  onApsDialogSearch(): void {
    // 取得表單目前的輸入值
    const { ACP_No, VEN_No, VEN_Name, ACP_Date } = this.dialogQueryForm.value;

    // 如果原始快取沒資料就跳出
    if (!this.apsRawData || this.apsRawData.length === 0) {
      return;
    }

    // 執行 filter：只要符合「包含」關係即顯示 (部分符合)
    this.apsDialogData = this.apsRawData.filter(item => {
      // 轉小寫以進行不分大小寫的比對
      const searchAcpNo = (ACP_No || '').toLowerCase();
      const searchVenNo = (VEN_No || '').toLowerCase();
      const searchVenName = (VEN_Name || '').toLowerCase();
      const searchDate = (ACP_Date || '');

      const matchAcpNo = !searchAcpNo || item.ACP_No?.toLowerCase().includes(searchAcpNo);
      const matchVenNo = !searchVenNo || item.VEN_No?.toLowerCase().includes(searchVenNo);
      const matchVenName = !searchVenName || item.VEN_Name?.toLowerCase().includes(searchVenName);
      const matchDate = !searchDate || item.ACP_Date?.includes(searchDate);

      // 必須同時滿足所有「已輸入」的條件
      return matchAcpNo && matchVenNo && matchVenName && matchDate;
    });
  }
}
