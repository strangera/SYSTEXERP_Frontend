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
          const items = (res?.Data ?? []) as any[];
          if (items && items.length) {
            this.tableData = items.map(it => ({
              RET_Date: it.RET_Date ? new Date(it.RET_Date + 'T00:00:00') : null,
              RET_Amt: Number(it.RET_Amt ?? it.ACP_ReserveAmt ?? 0),
              Remark: it.NoteDesc ?? '',
              STATUS: this.toStatusCode(it.STATUS)
            }));
          } else {
            this.tableData = [{
              RET_Date: retDate,
              RET_Amt: retAmt,
              Remark: row.NoteDesc ?? '',
              STATUS: statusCode,
            }];
          }
        }, () => {
          this.tableData = [{
            RET_Date: retDate,
            RET_Amt: retAmt,
            Remark: row.NoteDesc ?? '',
            STATUS: statusCode,
          }];
        });
    } else {
      this.dataForm.patchValue({ STATUS: 'N' });
      this.tableData = [{
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
        Items: detailRows.map(row => {
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
            acp_termno: frm.value.acp_termno ?? 0,
            RET_Date: retDate,
            RET_Amt: row.RET_Amt ?? 0,
            STATUS: this.toStatusCode(row.STATUS),
            Remark: row.Remark ?? ''
          };
        })
      };
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
    const keyword = (value?.['ACP_No'] || '').trim();
    if (!keyword) {
      this.apsDialogData = this.apsRawData;
      this.apsSuggestions = this.apsRawData;
      return;
    }
    const filtered = this.apsRawData.filter(item => item.ACP_No?.includes(keyword));
    this.apsDialogData = filtered;
    this.apsSuggestions = filtered;
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
}
