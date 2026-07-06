import { DatePipe, NgIf } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin24020Service, IQueryFIN24020Response, IQueryFIN24020ResponseDetail, ISaveFIN24020Request } from '@service/api/fin/fin24020.service';
import { DropDownListService, IAPS3001Item } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
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
    CalendarRangeComponent,
    InputTextComponent,
    TableEditComponent,
    DialogModule,
    TableReportComponent
  ]
})
export class FIN24020CRUComponent extends BasicCruPageComponent<IQueryFIN24020Response> implements OnInit {
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  private readonly datePipe = inject(DatePipe);
  public readonly fin24020Service = inject(Fin24020Service);
  private readonly dropDownListService = inject(DropDownListService);
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
  displaySearchDialog = false;
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
    { field: 'RET_Date', header: '保留退款日期', type: 'date', validate: [validateRequired, validateDateDuplicate] },
    { field: 'RET_Amt', header: '保留退款金額', type: 'inputNumber', validate: [validateRequired] },
    { field: 'Remark', header: '備註', type: 'input', textAlign: 'left' },
    { field: 'STATUS', header: '是否已付款', format: v => v === 'Y' ? '是' : '否' },
  ];
  tableData: IQueryFIN24020ResponseDetail[] = [];
  tableDefaults: Record<string, any> = { acp_termno: 1, RET_Date: new Date(), RET_Amt: 0, Remark: '', STATUS: 'N' };
  initialized = false;
  constructor() { super(); }

  ngOnInit(): void {
    if (this.isFormCreateable) {
      this.editColumns = (this.editColumns || []).filter(c => c.field !== 'STATUS');
    }
    this.dropDownListService.queryAPS3001_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      const data = res.Data ?? [];
      this.apsRawData = data;
      this.apsDialogData = data;
    });
    this.initializeFormFromRowData();
    // 控制編輯與檢視狀態下的主欄位狀態
    if (!this.isFormCreateable) this.dataForm.get('ACP_No')?.disable({ emitEvent: false });
    if (this.isFormCreateable) this.editColumns = (this.editColumns || []).filter(c => c.field !== 'STATUS');
  }

  initializeFormFromRowData(): void {
    this.initialized = false;
    this.initializePage('FIN24020', this.dataForm, { useReadonly: true });
    const row = this.rowdata;
    if (row) {
      this.tableData = row.Details.map(d => ({
        ...d,
        ACP_No: d.ACP_No ?? '',
        ACP_YYYYMM: d.ACP_YYYYMM ?? '',
        acp_termno: Number(d.acp_termno ?? 0),
        RET_Amt: Number(d.RET_Amt ?? 0),
        RET_Date: d.RET_Date ? new Date(d.RET_Date + 'T00:00:00') : null,
        STATUS: d.STATUS ?? 'N',
        Remark: d.Remark ?? '',
      }));
      this.onTableDataChange(this.tableData);// 觸發計算引擎更新 sam
    }
    this.initialized = true;
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) { this.loading = false; return; }
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
      const body: ISaveFIN24020Request = {
        ACP_No: formData.ACP_No ?? '',
        VEN_No: formData.VEN_No ?? '',
        VEN_Name: formData.VEN_Name ?? '',
        ACP_Amt: formData.ACP_Amt ?? 0,
        ACP_Date: this.datePipe.transform(formData.ACP_Date, 'yyyy-MM-dd') ?? null,
        ACP_ReserveAmt: formData.ACP_ReserveAmt ?? 0,
        Items: this.tableData.map((row) => {
          return {
            ACP_No: formData.ACP_No ?? '',
            ACP_YYYYMM: formData.ACP_YYYYMM,
            acp_termno: row.acp_termno ?? 0,
            RET_Date: this.datePipe.transform(row.RET_Date, 'yyyy-MM-dd') ?? null,
            RET_Amt: row.RET_Amt ?? 0,
            STATUS: row.STATUS ?? 'N',
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
    const totalPendingRet = this.tableData.filter(r => r.STATUS === 'N').reduce((sum, r) => sum + (Number(r.RET_Amt) || 0), 0);
    this.dataForm.patchValue({ sam: totalPendingRet }, { emitEvent: false });
  }
  onAcpNoBlur(inputValue: string): void {
    if (!this.isFormCreateable) return;
    const targetId = inputValue.trim();
    if (!targetId) { this.clearAcpRelatedFields(); return; }
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
