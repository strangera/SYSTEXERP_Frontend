/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs';

import { FIN13100Service } from '../../../service/api/fin/fin13100.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '../../../shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '../../../shared/componentkit/table-edit/table-edit.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { getSYS1000Options } from '@service/system/sys1000.service';
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
    TableEditComponent,
    NgIf,
    TranslateModule,
  ],
})
export class FIN13100CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  readonly CRUD = CRUDStatus;

  dataForm = this.formBuilder.nonNullable.group({
    VouNo: [''],
    TotalTaxAmt: [0 as any],
  });

  detailRows: any[] = [];
  detailLoading = false;
  assetTypeOptions = getSYS1000Options('AssetType');
  invoiceTypeOptions: { value: string; label: string }[] = [];
  Buyer_Uniform_Options: any[] = [];
  taxTypeOptions = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' },
    { label: '零稅', value: '2' },
  ];

  defaultDetailRow: any = {
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
    IsLocked: false,
  };

  detailColumns: EditColumn[] = [];
  readonly rowSelectableFn = (row: any) => !row?.IsLocked;

  private originalFormValue: any = null;
  private originalDetailRows: any[] = [];

  get isRead(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  constructor(private fin13100Service: FIN13100Service, private dropDownListService: DropDownListService) {
    super();
  }

  private calcDeclareYM(yyyymm: any): string | null {
    const value = this.normalizeYYYYMM(yyyymm);
    if (!value) return null;
    const year = Number(value.substring(0, 4));
    let month = Number(value.substring(4, 6));
    if (isNaN(year) || isNaN(month)) return null;
    if (month % 2 === 1) month += 1;
    if (month > 12) month = 12;
    return `${year}${String(month).padStart(2, '0')}`;
  }

  ngOnInit(): void {
    this.initializePage('FIN13100', this.dataForm);

    const row: any = (this as any).rowdata;
    if (row) {
      this.dataForm.patchValue({
        VouNo: row.VouNo ?? '',
        TotalTaxAmt: row.TaxTotal ?? 0,
      }, { emitEvent: false });
    }

    this.dataForm.disable();

    forkJoin({
      guiType: this.fin13100Service.getFIN13100GUITypeDropdown(),
      uniform: this.dropDownListService.queryPOS2013_DropDownList({ VEN_Flag: '1' }),
    }).subscribe({
      next: ({ guiType, uniform }) => {
        const guiList = Array.isArray(guiType?.Data) ? guiType.Data : [];
        this.invoiceTypeOptions = guiList.map((x: any) => ({
          value: String(x.INV_GUIType ?? '').trim(),
          label: `${x.INV_GUIType}-${x.INV_GUIName}`,
        }));

        const uniformData: any[] = (uniform as any)?.Data ?? uniform ?? [];
        const uniqueMap = new Map<string, any>();
        uniformData.forEach((item: any) => {
          if (item.No) uniqueMap.set(item.No, item);
        });
        this.Buyer_Uniform_Options = Array.from(uniqueMap.values()).map((item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));

        this.initColumns();
      },
      complete: () => {
        const row: any = (this as any).rowdata;
        if (row) {
          this.loadDetail(String(row.VouNo ?? '').trim());
        }
      },
    });
  }

  private initColumns(): void {
    const locked = (_v: any, _i: any, row: any) => !!row?.IsLocked;

    this.detailColumns = [
      {
        field: 'INV_GUIType',
        header: '發票格式',
        type: 'dropdown',
        width: '220px',
        options: this.invoiceTypeOptions,
        optionLabel: 'label',
        optionValue: 'value',
        disabled: locked,
      },
      {
        field: 'InvoiceNo',
        header: '發票號碼',
        type: 'input',
        width: '150px',
        maxLength: 10,
        disabled: locked,
        onChange: (_rowData: any, value: any) => {
          const fixed = String(value ?? '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 10);
          _rowData.InvoiceNo = fixed;
        },
      },
      {
        field: 'InvoiceDate',
        header: '發票日期',
        type: 'date',
        width: '150px',
        disabled: locked,
        calculate: (_rowData: any, value: any) => {
          const ym = this.normalizeYYYYMM(value);
          return {
            INV_YM: ym,
            INV_DeclareYM: this.calcDeclareYM(ym),
          };
        },
      },
      {
        field: 'INV_YM',
        header: '資料所屬年月',
        type: 'input',
        width: '130px',
        disabled: () => true,
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
        disabled: locked,
      },
      {
        field: 'SaleAmt',
        header: '發票總金額',
        type: 'inputNumber',
        width: '130px',
        textAlign: 'right',
        disabled: locked,
        calculate: (rowData: any, value: any) => {
          const amt = this.toNumber(value);
          const taxType = String(rowData?.TaxType ?? '');
          if (taxType === '1') {
            const net = Math.round(amt / 1.05);
            return { Net: net, Tax: amt - net };
          }
          return { Net: amt, Tax: 0 };
        },
      },
      {
        field: 'TaxType',
        header: '課稅別',
        type: 'dropdown',
        width: '120px',
        options: this.taxTypeOptions,
        optionLabel: 'label',
        optionValue: 'value',
        disabled: locked,
        calculate: (rowData: any, value: any) => {
          const amt = this.toNumber(rowData?.SaleAmt);
          if (String(value) === '1') {
            const net = Math.round(amt / 1.05);
            return { Net: net, Tax: amt - net };
          }
          return { Net: amt, Tax: 0 };
        },
      },
      {
        field: 'Net',
        header: '發票未稅金額',
        type: 'inputNumber',
        width: '140px',
        textAlign: 'right',
        disabled: locked,
        calculate: (_rowData: any, value: any) => {
          const net = this.toNumber(value);
          const tax = Math.round(net * 0.05);
          return { Tax: tax, SaleAmt: net + tax };
        },
      },
      {
        field: 'Tax',
        header: '發票稅額',
        type: 'inputNumber',
        width: '120px',
        textAlign: 'right',
        disabled: locked,
        calculate: (rowData: any, value: any) => {
          const tax = this.toNumber(value);
          const net = this.toNumber(rowData?.Net);
          return { SaleAmt: net + tax };
        },
      },
      {
        field: 'Source_Doc_No',
        header: '憑證單號',
        type: 'input',
        width: '150px',
        disabled: locked,
      },
      {
        field: 'AssetType',
        header: '資產註記',
        type: 'dropdown',
        width: '120px',
        options: this.assetTypeOptions,
        optionLabel: 'label',
        optionValue: 'value',
        disabled: locked,
      },
    ];
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

        this.dataForm.get('TotalTaxAmt')?.enable({ emitEvent: false });
        this.dataForm.get('TotalTaxAmt')?.setValue(data?.TaxTotal ?? 0, { emitEvent: false });
        this.dataForm.get('TotalTaxAmt')?.disable({ emitEvent: false });
      },
      error: () => {
        this.detailLoading = false;
        this.messageService.unblockUi();
      },
      complete: () => {
        this.detailLoading = false;
        this.messageService.unblockUi();
        this.originalFormValue = this.dataForm.getRawValue();
        this.originalDetailRows = JSON.parse(JSON.stringify(this.detailRows));
      },
    });
  }

  onDetailChange(newData: any[]): void {
    this.detailRows = newData ?? [];
  }

  override onCancel(): void {
    if (this.originalFormValue) {
      this.dataForm.reset(this.originalFormValue, { emitEvent: false });
    }
    this.detailRows = this.originalDetailRows.length
      ? JSON.parse(JSON.stringify(this.originalDetailRows))
      : [];
    this.submitted = false;
    this.dataForm.disable({ emitEvent: false });
  }

  onSubmit(form: FormGroup): void {
    if (this.isRead) return;

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

    const missingFields: string[] = [];
    rows.forEach((x, i) => {
      const rowLabel = `第 ${i + 1} 筆`;
      if (!String(x.INV_GUIType ?? '').trim()) missingFields.push(`${rowLabel}：發票格式`);
      if (!/^[A-Z]{2}\d{8}$/.test(String(x.InvoiceNo ?? '').trim())) missingFields.push(`${rowLabel}：發票號碼（需 2 大寫字母 + 8 數字）`);
      if (!x.InvoiceDate) missingFields.push(`${rowLabel}：發票日期`);
      if (!String(x.INV_YM ?? '').trim()) missingFields.push(`${rowLabel}：資料所屬年月`);
      if (!String(x.INV_DeclareYM ?? '').trim()) missingFields.push(`${rowLabel}：申報年月`);
      if (!String(x.TaxType ?? '').trim()) missingFields.push(`${rowLabel}：課稅別`);
      if (x.SaleAmt === null || x.SaleAmt === undefined || x.SaleAmt === '') missingFields.push(`${rowLabel}：發票金額`);
    });

    if (missingFields.length > 0) {
      this.messageService.warnBubble('請確認以下必填欄位：\n' + missingFields.join('、'));
      return;
    }

    const taxSum = rows.reduce((sum, x) => sum + this.toNumber(x.Tax), 0);
    const taxTotal = this.toNumber(this.dataForm.getRawValue().TotalTaxAmt);
    if (taxSum !== taxTotal) {
      this.messageService.warnBubble(`發票稅額加總（${taxSum.toLocaleString('en-US')}）須等於銷項稅額貸方（${taxTotal.toLocaleString('en-US')}）`);
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
          this.goBack();
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

  private normalizeDetailRow(x: any, vouNo: string, index: number): any {
    return {
      id: x.id ?? 0,
      VouNo: x.VouNo ?? vouNo,
      INV_GUIType: x.INV_GUIType ?? '',
      InvoiceNo: x.InvoiceNo ?? '',
      InvoiceDate: x.InvoiceDate ? new Date(x.InvoiceDate) : null,
      INV_YM: this.normalizeYYYYMM(x.INV_YM),
      INV_DeclareYM: this.normalizeYYYYMM(x.INV_DeclareYM) ?? this.calcDeclareYM(x.INV_YM),
      TXN_Uniform: x.TXN_Uniform ?? '',
      SaleAmt: this.toNullableNumber(x.SaleAmt),
      TaxType: x.TaxType ?? '1',
      Net: this.toNullableNumber(x.Net),
      Tax: this.toNullableNumber(x.Tax),
      Source_Doc_No: x.Source_Doc_No ?? '',
      AssetType: x.AssetType ?? '',
      IsLocked: x.IsLocked ?? false,
      _rowIndex: index,
    };
  }

  goBack(): void {
    this.router.navigate(['/account/fin', 'fin13100'], {
      state: { fromRoute: this.router.url },
    });
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

  private toDateString(v: any): string | null {
    if (!v) return null;
    const d = new Date(v);
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  formatDate(v: any): string {
    const date = this.toDateString(v);
    return date ? date.replace(/-/g, '/') : '';
  }
}
