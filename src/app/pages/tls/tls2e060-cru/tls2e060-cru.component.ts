import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2e060Data } from '@service/api/tls/tls2e060.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-tls2e060-cru',
  templateUrl: './tls2e060-cru.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    ButtonComponent,
    PanelModule,
    MenubarComponent,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgIf,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent
  ],
})
export class TLS2E060CRUComponent extends BasicCruPageComponent<Tls2e060Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    adj_no: [{ value: '系統自動產生', disabled: true }],
    sam_yyymm: [null],
    sam_termno: [null],
    tlt_no: [null],
    contract_no: [null],
    adj_taxtype: [null],
    adj_amount: [null],
  });
  sam_termnoOptions = getSYS1000Options('sam_termno');
  tlt_noOptions = this.dropdown.queryTLTTALENTDropDownList({});
  constructor(
    private readonly dropdown: DropdownApiService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN11040', this.dataForm);
    if (!this.isFormCreateable) {
      this.dataForm.get('INV_ItemNo')?.disable();
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
}
