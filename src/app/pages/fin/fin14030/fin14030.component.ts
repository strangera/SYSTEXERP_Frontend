import { filter } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { CommonModule } from '@angular/common';
import { Fin14030Service } from '@service/api/fin/fin14030.service';
import { createPaginationConfig } from '@shared/componentkit/table2/table2.model';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { getSYS1000Options } from '@service/system/sys1000.service';
//1.1.4.3 形成申報書
@Component({
  selector: 'app-fin14030',
  templateUrl: './fin14030.component.html',
  styleUrl: './fin14030.component.scss',
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
export class FIN14030Component extends BasicQueryPageComponent<any> implements OnInit {
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
    startVoucher_No: [''],
    AssetType: [[]],

    ...createPaginationConfig([{ field: 'REP_GUIYM', order: 1 }]),
  });
  InvoiceType_Options = getSYS1000Options('InvoiceType')
    .filter(opt => ['31', '32', '35'].includes(opt.value));

  constructor(
    private fin14030Service: Fin14030Service,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('FIN14030', '/FIN/FIN14030cru', this.queryForm, (form) => this.onSubmit(form));

  }
  onSubmit(form: FormGroup): void {
this.handleSubmit(form, () => {
      // this.fin14030Service.getFIN14030Data(form.value).subscribe({
      //   next: (res) => {
      //     this.data = res.Data;
      //     this.totalRecords = res.TotalRecords;
      //     this.footerData = res.FooterData;
      //     this.loading = false;
      //   },
      // });
    });
  }
}
