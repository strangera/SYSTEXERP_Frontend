import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { FIN13020Service } from '../../../service/api/fin/fin13020.service';
import { FIN13010Service } from '../../../service/api/fin/fin13010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { QueryYearMonthComponent } from '../../../shared/componentkit/query-year-month/query-year-month.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { NgIf } from '@angular/common';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-fin13020-cru',
    templateUrl: './fin13020-cru.component.html',
    styleUrls: ['./fin13020-cru.component.scss'],
    standalone: true,
    imports: [
        MenubarComponent,
        ButtonComponent,
        PanelModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextComponent,
        DropdownComponent,
        CalendarComponent,
        QueryYearMonthComponent,
        InputNumberComponent,
        NgIf,
        TableComponent,
        TranslateModule,
    ],
})
export class FIN13020CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit
{
  guiNumberOptions: { label: string; value: string }[] = [];
  voucherTypeOptions = [
    { label: '23 - 三聯式/電子計算機/三聯收銀', value: '23' },
    { label: '24 - 二聯收銀/載有稅額之憑證', value: '24' },
  ];

  taxTypeOptions = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' },
    { label: '零稅', value: '2' },
  ];

  creditTypeOptions = [
    { label: '折讓', value: 'C' },
    { label: '退出', value: 'R' },
  ];

  dataForm = this.formBuilder.nonNullable.group({
    GUI_Track: [null as string | null], // 字軌
    PUR_GUINo: [''], // 發票號碼
    InvoiceNumber_Correspond: [''], // 發票號碼
    PUR_GUIDate: ['', Validators.required], // 領用日期
    PUR_VoucherType: [''], // 發票格式
    PUR_RepYYYYMM: [''], // 發票年月
    Credit_Type: [''], // 區別（折讓/退出）
    PUR_TaxType: ['', Validators.required], // 稅別
    PUR_Net: [undefined as any],
    PUR_Tax: [undefined as any],
    PUR_Amt: [undefined as any], // 退回/折讓總金額
    Inv_Date: [undefined as any], // 發票日期
    Total_hitory_PUR_Amt: [undefined as any], // 已退出/折讓歷史總金額
    Total_Amt: [undefined as any], // 剩餘總金額
    TXN_Ret_No: ['系統自動帶入', Validators.required], // 退出/折讓單號
    Inv_Net: [undefined as any], // 銷售額
    Inv_Tax: [undefined as any], // 稅額
    Source_Doc_No: [''], // 憑證單號
    Voucher_No: [''], // 傳票編號
  });

  constructor(
    private apiService: FIN13010Service,
    private fin13020Service: FIN13020Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13020', this.dataForm);
    this.updateDisabledState();
    this.setupAutoAmountCalculation(); // ⬅️ 新增這行
    this.setupRemainAmountCalculation();
    this.dataForm.get('TXN_Ret_No')?.disable();
    this.dataForm.get('PUR_VoucherType')?.disable();
    this.dataForm.get('PUR_TaxType')?.disable();
    this.dataForm.get('Inv_Tax')?.disable();

    this.dataForm.get('Inv_Net')?.disable();
    this.dataForm.get('Inv_Date')?.disable();

    this.dataForm.get('Total_hitory_PUR_Amt')?.disable();
    this.dataForm.get('Total_Amt')?.disable();
    this.setupTrackNoWatcher(); // ← 加這行：監聽字軌

    this.setupGuiNoAndCorrespondWatcher(); // ← 加這行：監聽發票號碼和對應欄位
  }
  private setupTrackNoWatcher(): void {
    const trackControl = this.dataForm.get('GUI_Track');

    if (trackControl) {
      trackControl.valueChanges.subscribe((trackNo) => {
        if (typeof trackNo === 'string' && trackNo.trim().length >= 2) {
          this.fin13020Service
            .queryINV1000List({ GUI_Track: trackNo.trim() })
            .subscribe((res) => {
              this.guiNumberOptions = res.Data.map((item: any) => ({
                label: item.PUR_GUINo,
                value: item.PUR_GUINo,
              }));
              //
            });
        } else {
          this.guiNumberOptions = [];
        }
      });
    }
  }
  private setupGuiNoAndCorrespondWatcher(): void {
  const trackControl = this.dataForm.get('GUI_Track');
  const noControl = this.dataForm.get('PUR_GUINo');

  if (trackControl && noControl) {
    const trigger = () => {
      const track = trackControl.value?.trim();
      const guiNo = noControl.value?.trim();

      if (track && guiNo) {
        const full = `${track}${guiNo}`;

        this.dataForm.patchValue(
          { InvoiceNumber_Correspond: full },
          { emitEvent: false },
        );

        this.fin13020Service
          .queryCorrespondByGUINoCorrespond({ InvoiceNumber_Correspond: full })
          .subscribe((res) => {
            const detail = res?.Data?.[0];
            if (detail) {
              let voucherType: number | string = '';
              if (detail.PUR_VoucherType === '31' || detail.PUR_VoucherType === '35') {
                voucherType = 33;
              } else if (detail.PUR_VoucherType === '32') {
                voucherType = 34;
              } else {
                voucherType = 'OK'; // 👉 若無符合，就填 OK（測試用）
              }

              this.dataForm.get('PUR_VoucherType')?.enable(); // 👈先打開

              this.dataForm.patchValue(
                {
                  Inv_Date: detail.PUR_GUIDate,
                  PUR_VoucherType: voucherType ? String(voucherType) : '',
                  PUR_TaxType: detail.PUR_TaxType,
                  Inv_Net: detail.PUR_Net,
                  Inv_Tax: detail.PUR_Tax,
                  Total_hitory_PUR_Amt: detail.Total_hitory_PUR_Amt,
                  Total_Amt: detail.Total_Amt,
                },
                { emitEvent: false },
              );

              this.dataForm.get('PUR_VoucherType')?.disable(); // 👈再關掉
            } else {
              this.dataForm.patchValue(
                {
                  Inv_Date: null,
                  PUR_VoucherType: '',
                  PUR_TaxType: '',
                  Inv_Net: null,
                  Inv_Tax: null,
                  PUR_Amt: null,
                  Total_hitory_PUR_Amt: null,
                  Total_Amt: null,
                },
                { emitEvent: false },
              );
            }
          });
      }
    };

    trackControl.valueChanges.subscribe(trigger);
    noControl.valueChanges.subscribe(trigger);
  }
}


  // ✅ 僅允許特定欄位可編輯
  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Edit) {
      const editableFields = [
        'PUR_GUIDate',
        'PUR_RepYYYYMM',
        'PUR_Tax',
        'Source_Doc_No',
        'Credit_Type',
        'PUR_Net',
        'PUR_Amt',
        'Voucher_No',
      ];
      Object.keys(this.dataForm.controls).forEach((key) => {
        const control = this.dataForm.get(key);
        if (editableFields.includes(key)) {
          control?.enable();
        } else {
          control?.disable();
        }
      });
    } else if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable();
    } else {
      this.dataForm.enable(); // Create 模式
    }
  }
detailRows: any[] = [];
  onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    const formValue = form.getRawValue();

    const payload =
      this.crudstatus === CRUDStatus.Edit
        ? {
            id: formValue.id,
            TXN_Ret_No: formValue.TXN_Ret_No,
            GUI_Track: formValue.GUI_Track,
            InvoiceNumber: formValue.PUR_GUINo,
            InvoiceDate: formValue.PUR_GUIDate,
            INV_DeclareYM: formValue.PUR_RepYYYYMM,
            Credit_Type: formValue.Credit_Type,
            PUR_Net: formValue.PUR_Net,
            PUR_Tax: formValue.PUR_Tax,
            PUR_Amt: formValue.PUR_Amt,
            Source_Doc_No: formValue.Source_Doc_No,
            APS40235List: this.detailRows.map(row => ({
              PLU_Name: row.PLU_Name,
              TXN_Qty: row.TXN_Qty,
              PLU_SalePrc: row.PLU_SalePrc,
              TXN_SaleAmt: row.TXN_SaleAmt,
            })),
          }
        : {
            GUI_Track: formValue.GUI_Track,
            PUR_GUINo: formValue.PUR_GUINo,
            PUR_GUIDate: formValue.PUR_GUIDate,
            PUR_VoucherType: formValue.PUR_VoucherType,
            PUR_RepYYYYMM: formValue.PUR_RepYYYYMM,
            Credit_Type: formValue.Credit_Type,
            PUR_TaxType: formValue.PUR_TaxType,
            PUR_Net: formValue.PUR_Net,
            PUR_Tax: formValue.PUR_Tax,
            PUR_Amt: formValue.PUR_Amt,
            Source_Doc_No: formValue.Source_Doc_No,
            Voucher_No: formValue.Voucher_No,
            APS40235List: this.detailRows.map(row => ({
              PLU_Name: row.PLU_Name,
              TXN_Qty: row.TXN_Qty,
              PLU_SalePrc: row.PLU_SalePrc,
              TXN_SaleAmt: row.TXN_SaleAmt,
            })),
          };

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          this.fin13020Service.insertFIN13020(payload).subscribe(() => {
            this.messageService.successBubble('新增成功');
            this.dataForm.reset();
          });
        }
        break;

      case CRUDStatus.Edit:
        if (this.canEdit()) {
          this.fin13020Service.updateFIN13020(payload).subscribe(() => {
            this.messageService.successBubble('更新成功');
            this.onCancel();
          });
        }
        break;
    }
  });
}
  private setupAutoAmountCalculation(): void {
    const netControl = this.dataForm.get('PUR_Net');
    const taxControl = this.dataForm.get('PUR_Tax');
    const amtControl = this.dataForm.get('PUR_Amt');

    if (netControl && taxControl && amtControl) {
      netControl.valueChanges.subscribe(() => this.calculateTXN_SaleAmt());
      taxControl.valueChanges.subscribe(() => this.calculateTXN_SaleAmt());
    }
  }

  private calculateTXN_SaleAmt(): void {
    const net = this.dataForm.get('PUR_Net')?.value || 0;
    const tax = this.dataForm.get('PUR_Tax')?.value || 0;
    this.dataForm.get('PUR_Amt')?.setValue(net + tax, { emitEvent: false });
  }
  private setupRemainAmountCalculation(): void {
    const amtControl = this.dataForm.get('PUR_Amt');
    const historyControl = this.dataForm.get('History_RetAmt');
    const remainControl = this.dataForm.get('Remain_Amt');

    if (amtControl && historyControl && remainControl) {
      amtControl.valueChanges.subscribe(() => this.calculateRemainAmount());
      historyControl.valueChanges.subscribe(() => this.calculateRemainAmount());
    }
  }

  private calculateRemainAmount(): void {
    const amt = this.dataForm.get('PUR_Amt')?.value || 0;
    const history = this.dataForm.get('Total_hitory_PUR_Amt')?.value || 0;
    this.dataForm
      .get('Total_hitory_PUR_Amt')
      ?.setValue(amt - history, { emitEvent: false });
  }
  clearFormExcept(): void {
    const keepValues = ['PUR_GUINo'];
    const patch: any = {};
    keepValues.forEach((key) => {
      patch[key] = this.dataForm.get(key)?.value;
    });

    this.dataForm.reset(); // 先清除
    this.dataForm.patchValue(patch); // 再補回保留的值
    this.updateDisabledState(); // 最後重新套用 disabled 狀態 ✅
  }
@Output() fieldChange = new EventEmitter<any>();

columns: any[] = [
  { field: 'PLU_Name', header: '品名', type: 'input', editable: true },
  { field: 'TXN_Qty', header: '數量', type: 'inputNumber', editable: true },
  { field: 'PLU_SalePrc', header: '單價', type: 'inputNumber', editable: true,
      format: (value: any) => this.moneyFormat(value),style: 'text-right' },
  { field: 'TXN_SaleAmt', header: '金額',
      format: (value: any) => this.moneyFormat(value),style: 'text-right'},
];
onFieldChange(event: { rowData: any; field: string; value: any }) {
  const { rowData, field, value } = event;
  rowData[field] = value;

  // 自動計算金額
  if (field === 'TXN_Qty' || field === 'PLU_SalePrc') {
    const TXN_Qty = parseFloat(rowData.TXN_Qty) || 0;
    const PLU_SalePrc = parseFloat(rowData.PLU_SalePrc) || 0;
    rowData.TXN_SaleAmt = TXN_Qty * PLU_SalePrc;
  }
}

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

}
