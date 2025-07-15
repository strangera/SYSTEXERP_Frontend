import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { FIN13060Service } from '../../../service/api/fin/fin13060.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { QueryYearMonthComponent } from '../../../shared/componentkit/query-year-month/query-year-month.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CounterNameService } from '../../../service/basic/counter-name.service';

@Component({
  selector: 'app-fin13060-cru',
  standalone: true,
  templateUrl: './fin13060-cru.component.html',
  styleUrls: ['./fin13060-cru.component.scss'],
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
export class FIN13060CRUComponent
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
  { value: '31', label: '銷項三聯式、電子計算機統一發票' },
  { value: '32', label: '銷項二聯式、二聯式收銀機統一發票' },
  { value: '35', label: '銷項三聯式收銀機統一發票及一般稅額計算之電子發票' },
  { value: '36', label: '銷項免用統一發票' },
  { value: '37', label: '特種稅額之銷項憑證' },
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
   CounterOptions: any[] = [];

   BuyerUniCodeOptions = [
  { value: '00000000', label: '南紡流通服務台' },
  { value: '00000000-2', label: '南紡流通服務台' },
  { value: '00000000-3', label: '南紡流通' },
  { value: '00000000-4', label: '停管管理' },
  { value: '00000000-5', label: '南紡流通停管管理' },
  { value: '00000000-7', label: '停管管理' },
  { value: '00000000-8', label: '測試' },
  { value: '00852492-1', label: '佳達旅運行' },
  { value: '01052878-1', label: '財團法人臺業文教基金會' },
  { value: '01508949-1', label: '財團法人聯合信用卡處理中心' },
];
  AssetNoteOptions = [
    { label: '固定資產', value: '0' },
    { label: '土地', value: '1' },
  ];


  constructor(private fin13060Service: FIN13060Service, private counterNameService: CounterNameService,) {
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
    VendorCode: [''],
    TLT_No: [''],
    SellerUniCode: [{ value: '', disabled: true }, Validators.required],

    BuyerUniCode: ['', Validators.required],
    AssetNote: [''],

  });

  detailRows: any[] = [];

  ngOnInit(): void {
    this.initializePage('FIN13060', this.dataForm);
    this.updateDisabledState();
     this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
    this.dataForm.get('SellerUniCode')?.disable(); // ← 補這行
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
        this.fin13060Service.insertFIN13060(payload).subscribe(() => {
          this.messageService.successBubble('新增成功');
          this.dataForm.reset();
        });
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        this.fin13060Service.updateFIN13060(payload).subscribe(() => {
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
