import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table/validate-field.model';
import { PanelModule } from 'primeng/panel';

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
    InputTextComponent,
    DropdownComponent,
    InputNumberComponent,
    AsyncPipe,
    CalendarComponent,
    CalendarRangeQuickComponent,
    InputNumberRangeComponent
  ]
})
export class FIN24020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ARS_No: [""],
    CustNo: [""],
    sam_yyymm: [""],
    sam_termno: [""],
    PTA_Date_From: [""],
    ARS_Amt_From: [""],
    PTA_Key: [""],
    NoteDesc: [""],
    ARS_Amt_To: [""],
    PTA_Date_To: [""],
  });
  VEN_No_ParamOptions = this.dropDown.queryPos2013({ VEN_Flag: '' }); // 廠商代號

  editColumns: EditColumn[] = [
    { field: 'dc', header: '保留款退款日期', type: 'input' },
    { field: 'dc', header: '保留款退款金額', type: 'input' },
    { field: 'NoteDesc', header: '備註', type: 'input', validate: [validateRequired], width: '250px' },

  ];
  constructor(
    private readonly dropDown: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN24020', this.dataForm);
  }



  onSubmit(frm: FormGroup) {



  }

}
