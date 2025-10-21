import { Tls2e060DropDownListData, Tls2e060Service } from './../../../service/api/tls/tls2e060.service';
import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2e060Data } from '@service/api/tls/tls2e060.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { convertDateToYYYYMM } from '@shared/componentkit/table/table.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls2e060-cru',
  templateUrl: './tls2e060-cru.component.html',
  standalone: true,
  imports: [
    ButtonComponent,
    PanelModule,
    MenubarComponent,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgIf,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    InputNumberComponent
  ],
})
export class TLS2E060CRUComponent extends BasicCruPageComponent<Tls2e060Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    adj_no: [{ value: '系統自動產生', disabled: true }],
    adj_date: [{ value: new Date(), disabled: true }],
    sam_yyymm: [null, [Validators.required]],
    tlt_no: [null, [Validators.required]],
    talent_id: [0],
    sam_termno: [0],
    contract_no: [{ value: '', disabled: true }],
    contract_subno: [{ value: 0, disabled: true }],
    adj_taxtype: [null, [Validators.required]],
    adj_amount: [null, [Validators.required, Validators.min(1)]],
  });
  tlt_noOptions: Tls2e060DropDownListData[] = [];
  adj_taxtypeOptions = getSYS1000Options('PLU_TaxType');
  constructor(
    private readonly tls2e060Service: Tls2e060Service
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS2E060', this.dataForm);
    this.tls2e060Service.queryTltTalentDropdownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.tlt_noOptions = res.Data.map(item => ({
        ...item,
        label: `${item.tlt_no} - ${item.tlt_name}`
      }))
    })

  }
  onTltNoChange(event: Tls2e060DropDownListData | null) {
    if (event) {
      const frm = this.dataForm.controls;
      frm.contract_no.setValue(event.contract_no);
      frm.contract_subno.setValue(event.contract_subno);
      frm.sam_termno.setValue(event.sam_termno);
      frm.talent_id.setValue(event.talent_id);
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.getRawValue(),
        sam_yyymm: convertDateToYYYYMM(frm.value.sam_yyymm),
        tlt_no: frm.value.tlt_no.tlt_no,
      }
      this.tls2e060Service.createTls2e060(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.messageService.successBubble(res.Message);
        this.onCancel();
      })
    });
  }
}
