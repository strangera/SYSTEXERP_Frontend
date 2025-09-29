import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { DropdownTableComponent } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { AsyncPipe } from '@angular/common';
import { getSYS1000Options } from '@service/system/sys1000.service';

@Component({
  selector: 'app-tls57010',
  templateUrl: './tls57010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    DropdownComponent,
    CheckboxModule,
    RadioButtonModule,
    ButtonComponent,
    TableComponent,
    MultiSelectComponent,
    TranslateModule,
    DropdownTableComponent,
    InputTextComponent,
    AsyncPipe
  ],
})
export class TLS57010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    APPLY_Date_Start: [null],
    APPLY_Date_End: [null],
    LOGO_NoList: [null],
    VEN_No: [''],
    PLU_MagNo: [''],
    PO_StatusList: [null],
    IncludeUnpaid: [false],
    PO_No: [null],
    DisplayMode: [1, [Validators.required]],
  });
  LOGO_NoOptions$ = this.dropDown.queryPluLogo();
  VEN_NoOptions$ = this.dropDown.queryPos2013({ VEN_Flag: '' });
  PO_StatusOptions = getSYS1000Options('po_status');
  displayModeOptions = [
    { value: 1, label: '彙總' },
    { value: 2, label: '明細' },
  ];
  data: any[] = [];
  columns: EditColumn[] = [
    { field: 'purchaseDate', header: '採購日期' },
    { field: 'purchaseOrderNumber', header: '採購單號' },
    { field: 'orderStatus', header: '單據狀態' },
    { field: 'purchaseQuantity', header: '採購量' },
    { field: 'purchaseAmountNet', header: '進價(未稅)' },
    { field: 'purchaseAmountGross', header: '定價(含稅)' },
    { field: 'quantityReceived', header: '已進量' },
  ];


  constructor(
    private readonly dropDown: DropdownApiService
  ) { super(); }

  ngOnInit(): void {
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    })
  }
}
