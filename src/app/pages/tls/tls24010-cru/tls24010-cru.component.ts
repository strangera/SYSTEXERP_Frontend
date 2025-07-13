import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS24010Data } from '../../../service/api/tls/tls24010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
@Component({
    selector: 'app-tls24010-cru',
    templateUrl: './tls24010-cru.component.html',
    standalone: true,
    imports: [
        MenubarComponent,
        ButtonComponent,
        PanelModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarComponent,
        DropdownComponent,
        InputNumberComponent,
        NgIf,
        TranslateModule,
    ],
})
export class TLS24010CRUComponent extends BasicCruPageComponent<TLS24010Data> implements OnInit {
  dataForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(10)]],
    age: ['', Validators.required],
    email: ['', [Validators.maxLength(50), Validators.required]],
    supplementCategory: ['', Validators.required],
    saleDateStart: ['', Validators.required],
    saleDateEnd: ['', Validators.required],
    cashierCode: ['', Validators.required],
    counterCode: ['', Validators.required],
    transactionSerial: ['', Validators.required]
  });
  supplementCategoryOptions: any[] = [];
  cashierOptions: any[] = [];
  counterCodeOptions: any[] = [];
  constructor(
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS24010', this.dataForm);
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    });
  }
}
