import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common'; // Add this import as requested
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TranslateModule } from '@ngx-translate/core';
import { TLS27040Service } from '@service/api/tls/tls27040.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
@Component({
  selector: 'app-tls27040-cru',
  templateUrl: './tls27040-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, InputNumberComponent, CalendarComponent, TableComponent, ButtonComponent, NgIf, TranslateModule]
})
export class TLS27040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  POS6118dataForm = this.formBuilder.nonNullable.group({
    ECR_No: ['', Validators.required],  // 收銀機號
    TXN_No: ['', Validators.required],  // 交易流水號
    TLT_No: ['', Validators.required],  // 專櫃編號
  });
  POS6119dataForm = this.formBuilder.nonNullable.group({
    ECR_No: ['', Validators.required],  // 收銀機號
    TXN_No: ['', Validators.required],  // 交易流水號
    TLT_No: ['', Validators.required],  // 專櫃編號
  });
  POS6119PdataForm = this.formBuilder.nonNullable.group({
    ECR_No: ['', Validators.required],  // 收銀機號
    TXN_No: ['', Validators.required],  // 交易流水號
    TLT_No: ['', Validators.required],  // 專櫃編號
  });
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls27040Service: TLS27040Service,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27040', this.POS6118dataForm);
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
}
