import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';

@Component({
  selector: 'app-tls27020-cru',
  templateUrl: './tls27020-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class TLS27020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    saleDate: ['', Validators.required], // 銷售日期
    cashRegisterNumber: ['', Validators.required], // 收銀機號
    barcode: ['', Validators.required], // 條碼
    magneticCardNumber: ['', Validators.required], // 磁卡編號
    counterNumber: ['', Validators.required], // 專櫃編號
    counterName: ['', Validators.required], // 櫃位名稱
    amount: ['', Validators.required], // 金額
  });
  constructor(
    private translate: TranslateService,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS27020', this.dataForm);
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
    });
  }
}
