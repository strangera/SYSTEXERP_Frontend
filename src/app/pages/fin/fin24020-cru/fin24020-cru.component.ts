import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin24020Service, IQueryFIN24020Response, IQueryFIN24020ResponseDetail, ISaveFIN24020Request } from '@service/api/fin/fin24020.service';
import { DropDownListService, IAPS3001Item } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateDateDuplicate, validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Column, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { DialogModule } from 'primeng/dialog';
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
    CalendarRangeQuickComponent,
    InputTextComponent,
    TableEditComponent,
    DialogModule,
    TableReportComponent
  ]
})
export class FIN24020CRUComponent extends BasicCruPageComponent<IQueryFIN24020Response> implements OnInit {
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;

  dataForm = this.formBuilder.group({
    ACP_No: ['', Validators.required],         // string
    VEN_No: [{ value: '', disabled: true }],        // string
    VEN_Name: [{ value: '', disabled: true }],      // string
    ACP_Amt: [{ value: 0, disabled: true }],        // number
    ACP_Date: [{ value: null as Date | null, disabled: true }], // Date | null
    ACP_ReserveAmt: [0, Validators.required],
    ACP_YYYYMM: [''],
    acp_termno: [0, Validators.required],
    RET_Date: [null as Date | null],
    RET_Amt: [{ value: 0, disabled: true }],
    ACP_BalanceAmt: [{ value: 0, disabled: true }],
    sam: [{ value: 0, disabled: true }],
  }, { validators: [reserveAmtLessThanAcpAmtValidator] });

  displaySearchDialog = false; // 控制 Dialog 顯示隱私

  // APS3001 應付ID 下拉查詢相關
  dialogQueryForm = this.formBuilder.group({
    VEN_No: [null, [Validators.maxLength(16)]],
    VEN_Name: [null, [Validators.maxLength(100)]],
    ACP_Date_From: [null],
    ACP_Date_To: [null],
  });

  apsRawData: IAPS3001Item[] = [];
  apsDialogData: IAPS3001Item[] = [];

  apsDialogColumns: Column[] = [
    { field: 'ACP_No', header: '應付帳款編號' },
    { field: 'ACP_Date', header: '立帳日期', format: formatDate },
    { field: 'VEN_No', header: '廠客代號' },
    { field: 'VEN_Name', header: '廠客名稱' },
    { field: 'ACP_Amt', header: '應付金額', format: formatAmount },
    { field: 'ACP_BalanceAmt', header: '應付帳款餘額', format: formatAmount },
  ];

  editColumns: EditColumn[] = [
    { field: 'acp_termno', header: '帳次', type: 'inputNumber', textAlign: 'left' },
    { field: 'RET_Date', header: '保留退款日期', type: 'date', validate: [validateRequired, validateDateDuplicate], width: '10rem' },
    { field: 'RET_Amt', header: '保留退款金額', type: 'inputNumber', validate: [validateRequired], width: '10rem' },
    { field: 'Remark', header: '備註', type: 'input', textAlign: 'left' },
    {
      field: 'STATUS',
      header: '是否已付款',
      type: 'dropdown',
      options: [{ label: '是', value: 'Y' }, { label: '否', value: 'N' },],
      optionLabel: 'label',
      optionValue: 'value',
      width: '8rem',
      hidden: () => this.isFormCreateable,
      disabled: () => !this.isFormCreateable,
    },
  ];

  tableData: IQueryFIN24020ResponseDetail[] = [];
  tableDefaults: Record<string, any> = {
    acp_termno: 1,
    RET_Date: new Date(),
    RET_Amt: 0,
    Remark: '',
    STATUS: 'N'
  };

  constructor(
    private readonly datePipe: DatePipe,
    public readonly fin24020Service: Fin24020Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  // 暫存上一次送出的明細 key 順序（用於在後端未儲存序號時還原順序）
  private readonly lastSentDetailKeyOrder: string[] = [];
  // 讀取時的原始明細快照（用於 local cancel 還原）
  private originalTableDataSnapshot: IQueryFIN24020ResponseDetail[] = [];

  ngOnInit(): void {
    this.initializePage('FIN24020', this.dataForm, { useReadonly: true });
    if (this.isFormCreateable) {
      this.editColumns = (this.editColumns || []).filter(c => c.field !== 'STATUS');
    }
    this.loadAPS3001List();
    this.initializeFormFromRowData();

    // 控制編輯與檢視狀態下的主欄位狀態
    if (!this.isFormCreateable) {
      this.dataForm.get('ACP_No')?.disable({ emitEvent: false });
    }
  }

  private initializeFormFromRowData(): void {
    const row = this.rowdata;
    if (row) {
      const retDate = row.RET_Date ? new Date(row.RET_Date + 'T00:00:00') : null;

      // 初始進來先給預設值
      this.dataForm.patchValue({
        ACP_No: row.ACP_No ?? '',
        VEN_No: row.VEN_No ?? '',
        VEN_Name: row.VEN_Name ?? '',
        ACP_ReserveAmt: row.ACP_ReserveAmt ?? 0,
        ACP_YYYYMM: row.ACP_YYYYMM ?? '',
        acp_termno: row.acp_termno ?? 0,
        RET_Date: retDate,
        sam: 0 // 初始給 0，等待下面 API 精準加總
      });

      if (row.ACP_Amt != null) {
        this.dataForm.patchValue({ ACP_Amt: row.ACP_Amt });
      }
      if (row.ACP_Date) {
        this.dataForm.patchValue({ ACP_Date: new Date(row.ACP_Date + 'T00:00:00') });
      } else if (row.ACP_YYYYMM) {
        const yyyymm = String(row.ACP_YYYYMM);
        if (yyyymm.length === 6) {
          const year = Number(yyyymm.substring(0, 4));
          const month = Number(yyyymm.substring(4, 6));
          if (!Number.isNaN(year) && !Number.isNaN(month) && month >= 1 && month <= 12) {
            this.dataForm.patchValue({ ACP_Date: new Date(year, month - 1, 1), });
          }
        }
      }
      if (row.ACP_BalanceAmt != null) {
        this.dataForm.patchValue({ ACP_BalanceAmt: row.ACP_BalanceAmt });
      }
      this.fin24020Service.queryFIN24020({ ACP_No: row.ACP_No ?? '' })
        .pipe(untilDestroyed(this))
        .subscribe((res) => {
          const items = res.Data; // 強型態為 IQueryFIN24020Response[]

          if (items?.length) {
            const first = items[0]; // 取得打平後的第一筆主檔物件

            // 1. 處理明細表格資料 (Details)
            let details = first.Details || [];
            if (details.length) {
              if (details.some(d => d.SeqNo !== undefined && d.SeqNo !== null)) {
                details = details.slice().sort((a: any, b: any) => (Number(a.SeqNo) || 0) - (Number(b.SeqNo) || 0));
              }
            }

            // 補齊明細強型態屬性
            this.tableData = details.map(d => ({
              SeqNo: Number(d.SeqNo ?? 0),
              ACP_No: d.ACP_No ?? first.ACP_No ?? '',
              ACP_YYYYMM: d.ACP_YYYYMM ?? first.ACP_YYYYMM ?? '',
              acp_termno: Number(d.acp_termno ?? 0),
              VEN_No: d.VEN_No ?? first.VEN_No ?? '',
              VEN_Name: d.VEN_Name ?? first.VEN_Name ?? '',
              ACP_Amt: Number(d.ACP_Amt ?? 0),
              ACP_BalanceAmt: Number(d.ACP_BalanceAmt ?? 0),
              ACP_ReserveAmt: Number(d.ACP_ReserveAmt ?? 0),
              RET_Amt: Number(d.RET_Amt ?? 0),
              RET_Date: d.RET_Date ? new Date(d.RET_Date.toString().split('T')[0] + 'T00:00:00') : null as any,
              STATUS: this.toStatusCode(d.STATUS),
              Remark: d.Remark ?? '',
              CRT_Date: d.CRT_Date ?? '',
              CRT_USR_No: d.CRT_USR_No ?? '',
              CRT_USR_Name: d.CRT_USR_Name ?? '',
              RET_CRT_Date: d.RET_CRT_Date ?? '',
              RET_CRT_USR_No: d.RET_CRT_USR_No ?? '',
              RET_CRT_USR_Name: d.RET_CRT_USR_Name ?? '',
              TotalCount: Number(d.TotalCount ?? 0)
            }));

            this.originalTableDataSnapshot = structuredClone(this.tableData || []);

            // 觸發計算引擎更新 sam
            this.onTableDataChange(this.tableData);

            // 2. ✨【核心修正】主檔金額直接從最外層的 first 讀取！再也不去 Details[0] 踩雷了
            // 歷史已退金額總計如果沒有明細，代表從未沖款過，直接給 0
            const paidRetAmt = details.length ? Number(details[0]?.RET_Amt ?? 0) : 0;

            this.dataForm.patchValue({
              ACP_Amt: Number(first.ACP_Amt ?? this.dataForm.value.ACP_Amt),
              ACP_ReserveAmt: Number(first.ACP_ReserveAmt ?? this.dataForm.value.ACP_ReserveAmt),
              ACP_BalanceAmt: Number(first.ACP_BalanceAmt ?? this.dataForm.value.ACP_BalanceAmt),
              RET_Amt: paidRetAmt
            }, { emitEvent: false });

          } else {
            // 查無資料時的防呆
            this.tableData = [];
            this.originalTableDataSnapshot = [];
            this.dataForm.patchValue({ sam: 0 });
          }
        });
    } else {
      this.tableData = [];
      this.dataForm.patchValue({ sam: 0 });
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) {
        this.loading = false;
        return;
      }

      const formData = frm.getRawValue();
      const acpAmt = Number(formData.ACP_Amt) || 0;
      const reserveAmt = Number(formData.ACP_ReserveAmt) || 0; // 這是主檔設定的保留款總額
      const totalRetAmt = this.tableData.reduce((sum, r) => sum + (Number(r.RET_Amt) || 0), 0);

      const anyRowTooLarge = this.tableData.some(r => (Number(r.RET_Amt) || 0) > reserveAmt);
      if (anyRowTooLarge) {
        this.loading = false;
        this.messageService.errorBubble('保留退款金額不可大於保留款金額');
        return;
      }
      if (totalRetAmt > reserveAmt) {
        this.loading = false;
        this.messageService.errorBubble(`保留退款金額合計 (${totalRetAmt}) 不可大於保留款金額 (${reserveAmt})`);
        return;
      }
      const acpBalance = Number(formData.ACP_BalanceAmt) || 0;
      if ((reserveAmt - totalRetAmt) > acpBalance) {
        this.loading = false;
        this.messageService.errorBubble('保留款金額減退保留款金額不可大於應付帳款餘額');
        return;
      }

      if (totalRetAmt > acpAmt) {
        this.loading = false;
        this.messageService.errorBubble('保留款退款金額不可大於應付金額');
        return;
      }

      const rawAcpDate = formData.ACP_Date;
      let acpDate: string | null = null;
      let acpYyyymm = '';

      if (rawAcpDate) {
        const d = new Date(rawAcpDate);
        if (Number.isNaN(d.getTime())) {
          acpDate = this.datePipe.transform(rawAcpDate, 'yyyy-MM-dd');
          acpYyyymm = this.datePipe.transform(rawAcpDate, 'yyyyMM') ?? '';
        } else {
          acpDate = this.datePipe.transform(d, 'yyyy-MM-dd');
          acpYyyymm = this.datePipe.transform(d, 'yyyyMM') ?? '';
        }
      }

      if (!acpYyyymm && formData.ACP_YYYYMM) {
        const cleanYm = String(formData.ACP_YYYYMM).trim();
        if (cleanYm.length === 6 && !Number.isNaN(Number(cleanYm))) {
          acpYyyymm = cleanYm;
        }
      }

      if (!acpYyyymm) {
        this.loading = false;
        this.messageService.unblockUi();
        this.submitted = false; // 確保重置狀態
        this.messageService.errorBubble('帳款年月不可空白');
        return;
      }

      // 組裝送出後端 Body
      const body: ISaveFIN24020Request = {
        ACP_No: formData.ACP_No ?? '',
        VEN_No: formData.VEN_No ?? '',
        VEN_Name: formData.VEN_Name ?? '',
        ACP_Amt: formData.ACP_Amt ?? 0,
        ACP_Date: acpDate,
        ACP_ReserveAmt: formData.ACP_ReserveAmt ?? 0,
        Items: this.tableData.map((row) => {
          const rawRetDate = row.RET_Date;
          let retDate: string | null = null;
          if (rawRetDate) {
            const d = new Date(rawRetDate);
            retDate = Number.isNaN(d.getTime()) ? this.datePipe.transform(rawRetDate, 'yyyy-MM-dd') ?? null : this.datePipe.transform(d, 'yyyy-MM-dd') ?? null;
          }
          return {
            ACP_No: formData.ACP_No ?? '',
            ACP_YYYYMM: acpYyyymm,
            acp_termno: row.acp_termno ?? 0,
            RET_Date: retDate,
            RET_Amt: row.RET_Amt ?? 0,
            STATUS: this.toStatusCode(row.STATUS) ?? 'N',
            Remark: row.Remark ?? ''
          };
        })
      };

      const request$ = this.isFormCreateable ? this.fin24020Service.createFIN24020(body) : this.fin24020Service.updateFIN24020(body);
      request$.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.messageService.successBubble(res.Message);
        this.onCancel();
      });
    });
  }

  onTableDataChange(data: IQueryFIN24020ResponseDetail[]): void {
    this.tableData = data || [];

    const totalPendingRet = this.tableData
      .filter(r => this.toStatusCode(r.STATUS) === 'N')
      .reduce((sum, r) => sum + (Number(r.RET_Amt) || 0), 0);

    this.dataForm.patchValue({ sam: totalPendingRet }, { emitEvent: false });
  }

  onLocalCancel(): void {
    this.tableData = structuredClone(this.originalTableDataSnapshot || []);
    this.onTableDataChange(this.tableData);
    if (this.rowdata) {
      this.initializeFormFromRowData();
    }
  }

  private loadAPS3001List(): void {
    this.dropDownListService.queryAPS3001_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      const data = res.Data ?? [];
      this.apsRawData = data;
      this.apsDialogData = data;
    });
  }

  onApsInputChange(event: Record<string, string>): void {
    const keyword = (event?.['ACP_No'] || '').trim().toLowerCase();
    if (!keyword) {
      this.apsDialogData = [...this.apsRawData];
      return;
    }
    const filtered = this.apsRawData.filter(item => (item.ACP_No ?? '').toLowerCase().includes(keyword));
    this.apsDialogData = filtered;
  }

  private toStatusCode(status: string | null | undefined): string {
    const s = (status ?? '').toString();
    if (s === '是') { return 'Y'; }
    if (s === '否') { return 'N'; }
    return s;
  }

  onAcpNoBlur(inputValue: string): void {
    if (!this.isFormCreateable) return;
    const targetId = inputValue.trim();
    if (!targetId) {
      this.clearAcpRelatedFields();
      return;
    }
    const matchedItem = this.apsRawData.find(item => item.ACP_No === targetId);
    if (matchedItem) {
      this.fillFormFromApsItem(matchedItem);
    } else {
      this.messageService.errorBubble('輸入的應付ID不存在，請重新輸入或使用查詢功能');
    }
  }

  private fillFormFromApsItem(item: IAPS3001Item): void {
    this.dataForm.patchValue({
      ACP_No: item.ACP_No ?? '',
      VEN_No: item.VEN_No ?? '',
      VEN_Name: item.VEN_Name ?? '',
      ACP_Amt: item.ACP_Amt ?? 0,
      ACP_Date: item.ACP_Date ? new Date(item.ACP_Date + 'T00:00:00') : null,
      ACP_BalanceAmt: Number(item.ACP_BalanceAmt ?? 0),
      ACP_ReserveAmt: 0,
      sam: 0
    });

    this.tableDefaults = {
      acp_termno: 1,
      RET_Date: new Date(),
      RET_Amt: 0,
      Remark: '',
      STATUS: 'N'
    };

    this.tableData = [];
  }

  private clearAcpRelatedFields(): void {
    this.dataForm.patchValue({
      ACP_No: '',
      VEN_No: '',
      VEN_Name: '',
      ACP_Amt: 0,
      ACP_Date: null,
      ACP_BalanceAmt: 0,
      ACP_ReserveAmt: 0,
      sam: 0
    }, { emitEvent: false });
    this.tableData = [];
    this.tableDefaults = {};
  }

  onApsRowClick(rowData: IAPS3001Item): void {
    if (!rowData) return;
    this.fillFormFromApsItem(rowData);
    this.displaySearchDialog = false;
  }

  onApsDialogSearch(): void {
    const { VEN_No, VEN_Name, ACP_Date_From, ACP_Date_To } = this.dialogQueryForm.value;
    const sVenNo = (VEN_No ?? '').trim().toLowerCase();
    const sVenName = (VEN_Name ?? '').trim().toLowerCase();
    const fromTime = ACP_Date_From ? new Date(ACP_Date_From).setHours(0, 0, 0, 0) : null;
    const toTime = ACP_Date_To ? new Date(ACP_Date_To).setHours(23, 59, 59, 999) : null;

    this.apsDialogData = this.apsRawData.filter(item => {
      const matchVenNo = !sVenNo || (item.VEN_No ?? '').toLowerCase().includes(sVenNo);
      const matchVenName = !sVenName || (item.VEN_Name ?? '').toLowerCase().includes(sVenName);
      let matchDate = true;
      if (fromTime || toTime) {
        if (item.ACP_Date) {
          const itemTime = new Date(item.ACP_Date).getTime();
          matchDate = (!fromTime || itemTime >= fromTime) && (!toTime || itemTime <= toTime);
        } else {
          matchDate = false;
        }
      }
      return matchVenNo && matchVenName && matchDate;
    });
  }
}

export const reserveAmtLessThanAcpAmtValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const acpAmt = control.get('ACP_Amt')?.value;
  const reserveAmt = control.get('ACP_ReserveAmt')?.value;
  if (acpAmt !== null && reserveAmt !== null && Number(reserveAmt) > Number(acpAmt)) {
    control.get('ACP_ReserveAmt')?.setErrors({ reserveAmtTooLarge: true });
    return { reserveAmtTooLarge: true };
  }
  const errors = control.get('ACP_ReserveAmt')?.errors;
  if (errors?.['reserveAmtTooLarge']) {
    delete errors['reserveAmtTooLarge'];
    control.get('ACP_ReserveAmt')?.setErrors(Object.keys(errors).length ? errors : null);
  }
  return null;
};
