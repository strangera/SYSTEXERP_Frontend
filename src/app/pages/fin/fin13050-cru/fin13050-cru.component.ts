import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { FIN13050Service } from '../../../service/api/fin/fin13050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { QueryYearMonthComponent } from '../../../shared/componentkit/query-year-month/query-year-month.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';

@Component({
  selector: 'app-fin13050-cru',
  standalone: true,
  templateUrl: './fin13050-cru.component.html',
  styleUrls: ['./fin13050-cru.component.scss'],
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    QueryYearMonthComponent,
    NgIf,
    TranslateModule,
    CalendarComponent,
  ],
})
export class FIN13050CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit
{
  @Output() fieldChange = new EventEmitter<any>();

  // 下拉選單
  invoicePurposeOptions = [
    { label: '營業用', value: '營業用' },
    { label: '共同使用', value: '共同使用' },
  ];
  PUR_VoucherTypeOptions: any[] = [
    { value: '21', label: '進項三聯式、電子計算機統一發票' },
    { value: '22', label: '進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    { value: '25', label: '進項三聯式收銀機統一發票及一般稅額計算之電子發票' },
    {
      value: '26',
      label: '彙總登錄每張稅額伍佰元以下之進項三聯式、電子計算機統一發票',
    },
    {
      value: '27',
      label:
        '彙總登錄每張稅額伍佰元以下之進項二聯式收銀機統一發票、載有稅額之其他憑證',
    },
    { value: '28', label: '進項海關代徵營業稅繳納證' },
  ];

  deductOptions = [
    { label: '代表進項可扣抵之進貨及費用', value: 'A' },
    { label: '代表進項可扣抵之固定資產', value: 'B' },
    { label: '代表進項不可扣抵之進貨及費用', value: 'C' },
    { label: '代表進項不可扣抵之固定資產', value: 'D' },
  ];

  taxRateOptions = [
    { label: '應稅', value: '1' },
    { label: '零稅率', value: '2' },
    { label: '免稅', value: '3' },
  ];

  typeOptions = [
    { label: '進貨及費用', value: 'E' },
    { label: '固定資產', value: 'F' },
  ];
  taxTypeOptions = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' },
    { label: '零稅', value: '2' },
  ];

  constructor(private fin13050Service: FIN13050Service) {
    super();
  }

  dataForm = this.formBuilder.group({
    PUR_VoucherType: ['', Validators.required],
    GUI_Track: [''],
    PUR_GUINo: [''],
    PUR_GUINoEnd: [''],
    GUI_Date: [null, Validators.required],
    Rep_YYYYMM: ['', Validators.required],
    Apply_YYYYMM: ['', Validators.required],
    UniCode: [''],
    Amount: [null, Validators.required],
    TaxExcluded: [null, Validators.required],
    Tax: [null, Validators.required],
    Invoice_Purpose: [''],
    PUR_TaxType: ['', Validators.required],
    Deduct_Flag: [''],
    Category: [''],
    Source_Doc_No: [''],
    Voucher_No: [''],
    Serial: [''],
    Note: [''],
    System_ID: [''],
    remark: [''],
  });

  detailRows: any[] = [];

  ngOnInit(): void {
    this.initializePage('FIN13050', this.dataForm);
    this.updateDisabledState();
  }

  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Edit) {
      const editableFields = ['GUI_Date', 'Rep_YYYYMM', 'Tax', 'Voucher_No'];
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
      this.dataForm.enable(); // 新增模式全開
    }
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const formValue = form.getRawValue();
      const payload = {
        ...formValue,
        APS40235List: this.detailRows.map((row) => ({
          PLU_Name: row.PLU_Name,
          TXN_Qty: row.TXN_Qty,
          PLU_SalePrc: row.PLU_SalePrc,
          TXN_SaleAmt: row.TXN_SaleAmt,
        })),
      };

      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        this.fin13050Service.insertFIN13050(payload).subscribe(() => {
          this.messageService.successBubble('新增成功');
          this.dataForm.reset();
        });
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        this.fin13050Service.updateFIN13050(payload).subscribe(() => {
          this.messageService.successBubble('更新成功');
          this.onCancel();
        });
      }
    });
  }

  onFieldChange(event: { rowData: any; field: string; value: any }) {
    const { rowData, field, value } = event;
    rowData[field] = value;

    if (field === 'TXN_Qty' || field === 'PLU_SalePrc') {
      const qty = parseFloat(rowData.TXN_Qty) || 0;
      const price = parseFloat(rowData.PLU_SalePrc) || 0;
      rowData.TXN_SaleAmt = qty * price;
    }
  }

  clearFormExcept(): void {
    const keepKeys = ['GUI_Track', 'GUI_Number'];
    const keepValues = Object.fromEntries(
      keepKeys.map((key) => [key, this.dataForm.get(key)?.value]),
    );
    this.dataForm.reset();
    this.dataForm.patchValue(keepValues);
    this.updateDisabledState();
  }
}
