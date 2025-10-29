import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { CommonModule } from '@angular/common';
// import { Fin14030Service } from '@service/api/fin/fin14030.service';
import { createPaginationConfig } from '@shared/componentkit/table2/table2.model';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { Column } from 'src/app/shared/componentkit/table/table.model'; // Ensure this path is correct

//1.1.4.3 形成申報書
@Component({
  selector: 'app-fin13040',
  templateUrl: './fin13040.component.html',
  styleUrl: './fin13040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    CommonModule,
    DropdownComponent,
    TableComponent,
    TranslateModule,
    InputTextComponent,
    CalendarRangeComponent,
    CalendarModule,
    MultiSelectComponent,
    InputNumberRangeComponent,
    InputTextRangeComponent
  ],
})
export class FIN13040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    InvoiceType: [''],
    SAL_Type: [''],
    INV_GUITrack: [''],
    INV_GUINumber: [''],
    convert_Start: [null],
    convert_End: [null],
    InvoiceDate_Start: [null],
    InvoiceDate_End: [null],
    INV_YM: [null],
    INV_DeclareYM_Start: [null],
    INV_DeclareYM_End: [null],
    Buyer_Uniform: [''],
    PUR_TaxType: [''],
    endPUR_Amt: [''],
    endVoucher_No: [''],
    startPUR_Amt: [''],
    startVoucher_No: [''],
    AssetType: [[]],
    endPUR_Tax: [''],
    startPUR_Tax: [''],
    ...createPaginationConfig([{ field: 'REP_GUIYM', order: 1 }]),
  });
  Buyer_Uniform_Options: any[] = [];
  data: any[] = [];
  totalRecords = 0;
  InvoiceType_Options = getSYS1000Options('InvoiceType');
    // .filter(opt => ['31', '32', '35'].includes(opt.value));
  SAL_Type_Options = getSYS1000Options('SAL_Type');
  taxTypeOptions = getSYS1000Options('PUR_TaxType');
  AssetNoteOptions = getSYS1000Options('AssetType');
  columns: Column[] = [
    { field: 'InvoiceType', header: '發票格式', visible: true },
    { field: 'InvoiceNumber', header: '發票號碼', visible: true },
    { field: 'InvoiceDate', header: '發票日期', visible: true },
    { field: 'INV_DeclareYM', header: '申報年月', visible: true },
    { field: 'Buyer_Uniform', header: '買受人統一編號', visible: true },
    { field: 'PUR_TaxType', header: '課稅別', visible: true },
    { field: 'PUR_Net', header: '未稅金額', visible: true },
    { field: 'PUR_Tax', header: '稅額', visible: true },
    { field: 'Voucher_No', header: '傳票編號', visible: true },
    { field: 'AssetType', header: '資產註記', visible: true },
    { field: 'SAL_Type', header: '使用別', visible: true },
  ];
  constructor(
    // private fin14030Service: Fin14030Service,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('FIN13040', '/FIN/FIN13040cru', this.queryForm, (form) => this.onSubmit(form));

  }
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {

    });
  }
}
