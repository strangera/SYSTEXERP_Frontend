/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

import { FIN13100Service } from '../../../service/api/fin/fin13100.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { FIN32020TableEditComponent } from '../fin32020-cru/fin32020table-edit/fin32020table-edit.component';
import {
  EditColumn,
  FieldChangeEvent,
} from '../fin32020-cru/fin32020table-edit/fin32020table-edit.model';
import { DropDownListService } from '@service/utility/dropDownList.service';

@Component({
  selector: 'app-fin13100-cru',
  templateUrl: './fin13100-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberComponent,
    CalendarComponent,
    FIN32020TableEditComponent,
    NgIf,
    TranslateModule,
  ],
})
export class FIN13100CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  readonly CRUD = CRUDStatus;

  @ViewChild(FIN32020TableEditComponent)
  detailTableEdit!: FIN32020TableEditComponent;

  dataForm = this.formBuilder.nonNullable.group({
    VouNo: [''],
    VouDate: [null as any],
    PostFlag: [''],
    TotalTaxAmt: [0 as any],
  });

  detailRows: any[] = [];
  detailLoading = false;

  invoiceTypeOptions = [

  ];
Buyer_Uniform_Options: any[] = [];
  taxTypeOptions = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' },
    { label: '零稅', value: '2' },
  ];

  assetTypeOptions = [
    { label: '', value: '' },
    { label: '資產', value: 'Y' },
    { label: '非資產', value: 'N' },
  ];

  defaultDetailRow: any = {
    RowId: null,
    id: 0,
    INV_GUIType: '31',
    InvoiceNo: '',
    InvoiceDate: null,
    INV_YM: null,
    INV_DeclareYM: null,
    TXN_Uniform: '',
    SaleAmt: null,
    TaxType: '1',
    Net: null,
    Tax: null,
    Source_Doc_No: '',
    AssetType: '',
  };

detailColumns: EditColumn[] = [
  {
    field: 'INV_GUIType',
    header: '發票格式',
    type: 'dropdown',
    width: '150px',
    options: this.invoiceTypeOptions,
    optionLabel: 'label',
    optionValue: 'value',
  },
{
  field: 'InvoiceNo',
  header: '發票號碼',
  type: 'input',
  width: '150px',
},
  {
    field: 'InvoiceDate',
    header: '發票日期',
    type: 'date',
    width: '150px',
    format: (v: any) => this.formatDate(v),
  },
    {
    field: 'INV_YM',
    header: '資料所屬年月',
    type: 'input',
    width: '130px',
  },
{
  field: 'INV_DeclareYM',
  header: '申報年月',
  type: 'input',
  width: '130px',
  disabled: () => true,
},

 {
  field: 'TXN_Uniform',
  header: '買受人統一編號',
  type: 'dropdown',
  width: '220px',
  options: this.Buyer_Uniform_Options,
  optionLabel: 'label',
  optionValue: 'value',
},
  {
    field: 'SaleAmt',
    header: '發票總金額',
    type: 'inputNumber',
    width: '130px',
    textAlign: 'right',
    format: (v: any) => this.money(v),
  },
  {
    field: 'TaxType',
    header: '課稅別',
    type: 'dropdown',
    width: '120px',
    options: this.taxTypeOptions,
    optionLabel: 'label',
    optionValue: 'value',
  },
  {
    field: 'Net',
    header: '發票未稅金額',
    type: 'inputNumber',
    width: '140px',
    textAlign: 'right',
    format: (v: any) => this.money(v),
  },
  {
    field: 'Tax',
    header: '發票稅額',
    type: 'inputNumber',
    width: '120px',
    textAlign: 'right',
    format: (v: any) => this.money(v),
  },
  {
    field: 'Source_Doc_No',
    header: '憑證單號',
    type: 'input',
    width: '150px',
  },
  {
    field: 'AssetType',
    header: '資產註記',
    type: 'dropdown',
    width: '120px',
    options: this.assetTypeOptions,
    optionLabel: 'label',
    optionValue: 'value',
  },
];
  get isRead(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  constructor(private fin13100Service: FIN13100Service,  private dropDownListService: DropDownListService,) {
    super();
  }
private calcDeclareYM(yyyymm: any): string | null {
  const value = this.normalizeYYYYMM(yyyymm);
  if (!value) return null;

  const year = Number(value.substring(0, 4));
  let month = Number(value.substring(4, 6));

  if (isNaN(year) || isNaN(month)) return null;

  // 奇數月 → +1
  if (month % 2 === 1) {
    month += 1;
  }

  // 保底
  if (month > 12) {
    month = 12;
  }

  return `${year}${String(month).padStart(2, '0')}`;
}
  ngOnInit(): void {
    this.initializePage('FIN13100', this.dataForm);
this.loadInvoiceTypeOptions();
this.loadBuyerUniformOptions();
    const row: any = (this as any).rowdata;
    if (row) {
      this.dataForm.patchValue(
        {
          VouNo: row.VouNo ?? '',
          VouDate: row.VouDate ?? null,
          PostFlag: row.PostFlagName ?? this.formatPostFlag(row.PostFlag),
          TotalTaxAmt: row.TaxTotal ?? 0,
        },
        { emitEvent: false }
      );

      this.loadDetail(String(row.VouNo ?? '').trim());
    }

    this.dataForm.disable();
  }
private loadInvoiceTypeOptions(): void {
  this.fin13100Service.queryFIN13060_TDS1007DropDownList().subscribe({
    next: (res: any) => {
      const allow = new Set(['31', '32', '35']);
      const list = Array.isArray(res?.Data) ? res.Data : [];

      this.invoiceTypeOptions = list
        .filter((x: any) => allow.has(String(x.No ?? '').trim()))
        .map((x: any) => ({
          value: String(x.No ?? '').trim(),
          label: `${x.No}-${x.Name}`,
        }));

      const col = this.detailColumns.find((x) => x.field === 'INV_GUIType');
      if (col) {
        col.options = this.invoiceTypeOptions;
      }
    },
    error: (err) => {
      console.error('queryFIN13060_TDS1007DropDownList error:', err);
      this.invoiceTypeOptions = [];
    },
  });
}
/** 載入買受人統一編號下拉清單 */
loadBuyerUniformOptions(): void {
  this.dropDownListService
    .queryPOS2013_DropDownList({})
    .subscribe((res: any) => {
      const data = res?.Data ?? [];

      const uniqueDataMap = new Map();

      data.forEach((item: any) => {
        if (item.No) {
          uniqueDataMap.set(item.No, item);
        }
      });

      this.Buyer_Uniform_Options = Array.from(uniqueDataMap.values()).map(
        (item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
          VEN_No: item.VEN_No,
          VEN_Name: item.Name,
        })
      );

      // 動態更新欄位 options
      const col = this.detailColumns.find(
        (x) => x.field === 'TXN_Uniform'
      );

      if (col) {
        col.type = 'dropdown';
        col.options = this.Buyer_Uniform_Options;
        col.optionLabel = 'label';
        col.optionValue = 'value';
      }
    });
}
  private loadDetail(vouNo: string): void {
    if (!vouNo) return;

    this.detailLoading = true;
    this.messageService.blockUi();

    this.fin13100Service.queryFIN13100Detail({ VouNo: vouNo }).subscribe({
      next: (res: any) => {
        const data = res?.Data;
        const list = Array.isArray(data?.Details) ? data.Details : [];

        this.detailRows = list.map((x: any, index: number) =>
          this.normalizeDetailRow(x, vouNo, index)
        );

        if (!this.isRead && this.detailRows.length === 0) {
          this.detailRows = [{ ...this.defaultDetailRow, RowId: this.createRowId() }];
        }

        this.recalcTotal();
      },
      error: () => {
        this.detailLoading = false;
        this.messageService.unblockUi();
      },
      complete: () => {
        this.detailLoading = false;
        this.messageService.unblockUi();
      },
    });
  }

  onDetailRowsChange(rows: any[]): void {
    this.detailRows = (rows ?? [])
      .filter((x) => !x?._isAutoInsertCandidate)
      .map((row) => ({
        ...row,
        RowId: row.RowId ?? this.createRowId(),
      }));

    this.recalcTotal();
  }

onDetailFieldChange(event: FieldChangeEvent): void {
  const row = event.rowData;
  const field = event.field;

if (field === 'InvoiceNo') {
  const fixed = this.formatInvoiceNo(row.InvoiceNo);

  if (row.InvoiceNo !== fixed) {
    row.InvoiceNo = fixed;

    const index = event.index ?? this.detailRows.findIndex((x) => x.RowId === row.RowId);

    if (index >= 0) {
      this.detailTableEdit?.applyDialogValue(row, index, {
        InvoiceNo: fixed,
      });
    }
  }
}

  if (field === 'InvoiceDate') {
    const ym = this.toYYYYMM(row.InvoiceDate);

    if (ym) {
      row.INV_YM = ym;
      row.INV_DeclareYM = this.calcDeclareYM(ym);
    }
  }

  if (field === 'INV_YM') {
    row.INV_DeclareYM = this.calcDeclareYM(row.INV_YM);
  }

  if (field === 'SaleAmt' || field === 'Net' || field === 'Tax' || field === 'TaxType') {
    this.applyTaxRule(row, field);
  }

  this.syncDetailDataFromTableEdit();
  this.recalcTotal();
}
private formatInvoiceNo(value: any): string {
  if (!value) return '';

  let text = String(value).replace(/[^a-zA-Z0-9]/g, '');

  let prefix = text.substring(0, 2).replace(/[^a-zA-Z]/g, '');
  let numberPart = text.substring(2).replace(/\D/g, '');

  prefix = prefix.toUpperCase().substring(0, 2);
  numberPart = numberPart.substring(0, 8);

  return prefix + numberPart;
}
  onDetailDelete(_: any): void {
    this.syncDetailDataFromTableEdit();
    this.recalcTotal();
  }

  private syncDetailDataFromTableEdit(): void {
    if (!this.detailTableEdit) return;

    this.detailRows = this.detailTableEdit._tableData
      .filter((item: any) => !item._isAutoInsertCandidate)
      .map((item: any) => ({
        ...item,
        RowId: item.RowId ?? this.createRowId(),
      }));
  }

  private applyTaxRule(row: any, changedField: string): void {
    const taxType = String(row?.TaxType ?? '');
    const saleAmt = this.toNumber(row?.SaleAmt);
    const net = this.toNumber(row?.Net);

    if (taxType === '0' || taxType === '2') {
      row.Tax = 0;

      if (changedField === 'SaleAmt') {
        row.Net = saleAmt;
      }

      if (changedField === 'Net') {
        row.SaleAmt = net;
      }

      return;
    }

    if (taxType === '1') {
      if (changedField === 'SaleAmt') {
        const calcNet = Math.round(saleAmt / 1.05);
        row.Net = calcNet;
        row.Tax = saleAmt - calcNet;
      }

      if (changedField === 'Net') {
        row.Tax = Math.round(net * 0.05);
        row.SaleAmt = net + row.Tax;
      }

      if (changedField === 'Tax') {
        row.SaleAmt = net + this.toNumber(row.Tax);
      }
    }
  }

  private recalcTotal(): void {
    const total = (this.detailRows ?? []).reduce((sum, row) => {
      return sum + this.toNumber(row?.Tax);
    }, 0);

    this.dataForm.get('TotalTaxAmt')?.enable({ emitEvent: false });
    this.dataForm.get('TotalTaxAmt')?.setValue(total, { emitEvent: false });
    this.dataForm.get('TotalTaxAmt')?.disable({ emitEvent: false });
  }

  onSubmit(form: FormGroup): void {
    if (this.isRead) return;

    this.syncDetailDataFromTableEdit();

    const vouNo = String(form.getRawValue().VouNo ?? '').trim();
    if (!vouNo) {
      this.messageService.warnBubble('缺少傳票編號，無法儲存');
      return;
    }

    const rows = (this.detailRows ?? []).filter((x) => !x?._isAutoInsertCandidate);

    if (!rows.length) {
      this.messageService.warnBubble('請至少輸入一筆明細');
      return;
    }

    const invalid = rows.some((x) =>
  !String(x.INV_GUIType ?? '').trim() ||
  !/^[A-Z]{2}\d{8}$/.test(String(x.InvoiceNo ?? '').trim()) ||
  !x.InvoiceDate ||
  !String(x.INV_YM ?? '').trim() ||
  !String(x.INV_DeclareYM ?? '').trim() ||
  !String(x.TaxType ?? '').trim()
);

    if (invalid) {
      this.messageService.warnBubble(
        '請確認必填欄位：發票格式、發票號碼10碼、發票日期、資料所屬年月、申報年月、課稅別'
      );
      return;
    }

    const payload = {
      VouNo: vouNo,
      Details: rows.map((row) => ({
        id: row.id ?? 0,
        INV_GUIType: row.INV_GUIType,
        InvoiceNo: String(row.InvoiceNo ?? '').trim(),
        InvoiceDate: this.toDateString(row.InvoiceDate),
        INV_YM: this.normalizeYYYYMM(row.INV_YM),
        INV_DeclareYM: this.normalizeYYYYMM(row.INV_DeclareYM),
        TXN_Uniform: row.TXN_Uniform,
        SaleAmt: this.toNumber(row.SaleAmt),
        TaxType: row.TaxType,
        Net: this.toNumber(row.Net),
        Tax: this.toNumber(row.Tax),
        Source_Doc_No: row.Source_Doc_No,
        AssetType: row.AssetType,
      })),
    };

    this.loading = true;
    this.messageService.blockUi();

    this.fin13100Service
      .saveFIN13100(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.messageService.unblockUi();
        })
      )
      .subscribe({
        next: () => {
          this.messageService.successBubble('儲存成功');
          this.onCancel();
        },
        error: (err) => {
          this.messageService.errorBubble(
            err?.error?.ResponseBase?.ReturnMessage ||
              err?.error?.ReturnMessage ||
              err?.error?.Message ||
              err?.message ||
              '儲存失敗，請聯絡系統管理員'
          );
        },
      });
  }

  override onCancel(): void {
    this.router.navigate(['/account/fin', 'fin13100'], {
      state: { fromCru: true },
    });
  }

  private normalizeDetailRow(x: any, vouNo: string, index: number): any {
    return {
      RowId: x.RowId ?? x.id ?? `${Date.now()}_${index}`,
      id: x.id ?? 0,
      VouNo: x.VouNo ?? vouNo,
      INV_GUIType: x.INV_GUIType ?? '',
      InvoiceNo: x.InvoiceNo ?? '',
      InvoiceDate: x.InvoiceDate ?? null,
      INV_YM: this.normalizeYYYYMM(x.INV_YM),
      INV_DeclareYM:
  this.normalizeYYYYMM(x.INV_DeclareYM) ??
  this.calcDeclareYM(x.INV_YM),
      TXN_Uniform: x.TXN_Uniform ?? '',
      SaleAmt: this.toNullableNumber(x.SaleAmt),
      TaxType: x.TaxType ?? '1',
      Net: this.toNullableNumber(x.Net),
      Tax: this.toNullableNumber(x.Tax),
      Source_Doc_No: x.Source_Doc_No ?? '',
      AssetType: x.AssetType ?? '',
    };
  }

  private createRowId(): string {
    return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  private toNumber(v: any): number {
    if (v === null || v === undefined || v === '') return 0;
    const n = Number(v);
    return isNaN(n) ? 0 : Math.round(n);
  }

  private toNullableNumber(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return isNaN(n) ? null : Math.round(n);
  }

  money(v: any): string {
    if (v === null || v === undefined || v === '') return '';
    const n = Number(v);
    if (isNaN(n)) return '';
    return n.toLocaleString('en-US');
  }

  private normalizeYYYYMM(v: any): string | null {
    if (!v) return null;

    if (v instanceof Date) {
      return `${v.getFullYear()}${String(v.getMonth() + 1).padStart(2, '0')}`;
    }

    const only = String(v).replace(/\D/g, '');
    return only.length >= 6 ? only.slice(0, 6) : null;
  }

  private toYYYYMM(v: any): string | null {
    return this.normalizeYYYYMM(v);
  }

  private toDateString(v: any): string | null {
    if (!v) return null;

    const d = new Date(v);
    if (isNaN(d.getTime())) return null;

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  }

  formatDate(v: any): string {
    const date = this.toDateString(v);
    return date ? date.replace(/-/g, '/') : '';
  }

  private formatPostFlag(v: any): string {
    const value = String(v ?? '').trim();

    switch (value) {
      case '0':
        return '0-作廢';
      case '1':
        return '1-建立';
      case '2':
        return '2-確認';
      case '3':
        return '3-過帳';
      default:
        return value;
    }
  }
}