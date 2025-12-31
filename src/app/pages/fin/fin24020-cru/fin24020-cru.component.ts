import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { Column } from '@shared/componentkit/table/table.model';
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
    sam_termno: [0, Validators.required],
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
    { field: 'ACP_Amt', header: '應付金額' },
    { field: 'ACP_Date', header: '立帳日期' },
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
    },
    {
      field: 'RET_Amt',
      header: '保留退款金額',
      type: 'inputNumber',
      validate: [validateRequired],
    },
    { field: 'Remark', header: '備註', type: 'input', width: '10rem' },
    {
      field: 'STATUS',
      header: '是否已付款',
      type: 'dropdown',
      options: this.statusOptions,
      optionLabel: 'label',
      optionValue: 'value',
      width: '6rem',
      validate: [validateRequired],
    },

  ];
  tableData: any[] = [];
  constructor(
    private readonly datePipe: DatePipe,
    public readonly fin24020Service: Fin24020Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN24020', this.dataForm, { useReadonly: true });
    this.loadAPS3001List();
    this.initializeFormFromRowData();

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
      if (row.sam_termno != null) {
        this.dataForm.patchValue({ sam_termno: row.sam_termno });
      }
      this.dialogQueryForm.patchValue({
        ACP_No: row.ACP_No ?? '',
      });

      this.tableData = [{
        RET_Date: retDate,
        RET_Amt: retAmt,
        Remark: row.NoteDesc ?? '',
        STATUS: statusCode,
      }];
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
        this.messageService.errorBubble('請至少輸入一筆保留退款明細');
        return;
      }
      const acpAmt = Number(frm.value.ACP_Amt) || 0;
      const reserveAmt = Number(frm.value.ACP_ReserveAmt) || 0;
      const totalRetAmt = detailRows.reduce((sum, r) => sum + (Number(r.RET_Amt) || 0), 0);

      if (reserveAmt > acpAmt) {
        this.messageService.errorBubble('保留款金額不可大於應付金額');
        return;
      }
      if (totalRetAmt > acpAmt) {
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
    this.dataForm.patchValue({
      ACP_No: item.ACP_No ?? '',
      VEN_No: item.VEN_No ?? '',
      VEN_Name: item.VEN_Name ?? '',
      ACP_Amt: item.ACP_Amt ?? 0,
      ACP_Date: item.ACP_Date
        ? new Date(item.ACP_Date + 'T00:00:00')
        : null,
    });
  }
  onApsSelect(item: IAPS3001Item): void {
    this.fillFormFromApsItem(item);
  }
}
