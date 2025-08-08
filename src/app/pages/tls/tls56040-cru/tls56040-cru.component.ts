import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { NgIf } from '@angular/common';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column } from '@shared/componentkit/table/table.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-tls56040-cru',
  templateUrl: './tls56040-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, EditorTextComponent, CalendarComponent, NgIf, TranslateModule]
})
export class TLS56040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.group({
    issuanceNoteCode: [{ value: '自動編號', disabled: true }],
    generalCode: [],
    inwarehouseCode: [, Validators.required],
    exwarehouseCode: [, Validators.required],
    brandCode: [, Validators.required],
    issuanceType: [],
    issuanceNoteStatus: [],
    applicantCode: [],
    approverCode: [],
    applicationDateFrom: [, Validators.required],
    applicationDateTo: [],
    approvalDateFrom: [],
    approvalDateTo: [],
    remark: [],
    organizationNumber: [],
    issuanceReturnCode: [{ value: '自動編號', disabled: true }],
    amount: [],
    quantity: [],
  });
  data: any[] = [];
  columns: Column[] = [
    { field: 'sequence', header: '序號', visible: true },
  ];
  constructor(
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS56040', this.dataForm);
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
}
