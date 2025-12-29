import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin24020Service } from '@service/api/fin/fin24020.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table/validate-field.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

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
    DropdownComponent,
    InputNumberComponent,
    AsyncPipe,
    CalendarComponent,
  ]
})
export class FIN24020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ACP_No: [null, [Validators.required]],
    VEN_No: [null, [Validators.required]],
    VEN_Name: [null, [Validators.required]],
    ACP_Amt: [null, [Validators.required]],
    ACP_Date: [null, [Validators.required]],
    ACP_ReserveAmt: [null, [Validators.required]],
    ACP_YYYYMM: [null, [Validators.required]],
    acp_termno: [null, [Validators.required]],
    RET_Date: [null, [Validators.required]],
    RET_Amt: [null, [Validators.required]],
    STATUS: [null, [Validators.required]],
    Remark: [null, [Validators.required]],
    sam_termno: [null, [Validators.required]],
    sam: [null, [Validators.required]],
  });
  VEN_No_ParamOptions = this.dropDown.queryPos2013({ VEN_Flag: '' }); // 廠商代號

  editColumns: EditColumn[] = [
    { field: 'dc', header: '保留款退款日期', type: 'date' },
    { field: 'dc', header: '保留款退款金額', type: 'input' },
    { field: 'NoteDesc', header: '備註', type: 'input', validate: [validateRequired], width: '250px' },
    { field: 'dc', header: '是否產生付款資料', type: 'input' },
  ];
  constructor(
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe,
    public readonly fin24020Service: Fin24020Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN24020', this.dataForm);
  }



  onSubmit(frm: FormGroup) {

    this.handleSubmit(frm, () => {
      // 轉換日期格式為 yyyy-MM-dd
      const rawAcpDate = frm.get('ACP_Date')?.value;
      let acpDate: string | null = null;
      if (rawAcpDate) {
        const d = new Date(rawAcpDate);
        acpDate = !isNaN(d.getTime())
          ? this.datePipe.transform(d, 'yyyy-MM-dd') ?? null
          : this.datePipe.transform(rawAcpDate, 'yyyy-MM-dd') ?? null;
      }

      const rawRetDate = frm.get('RET_Date')?.value;
      let retDate: string | null = null;
      if (rawRetDate) {
        const d = new Date(rawRetDate);
        retDate = !isNaN(d.getTime())
          ? this.datePipe.transform(d, 'yyyy-MM-dd') ?? null
          : this.datePipe.transform(rawRetDate, 'yyyy-MM-dd') ?? null;
      }

      const body: any = {
        ACP_No: frm.value.ACP_No ?? '',
        VEN_No: frm.value.VEN_No ?? '',
        VEN_Name: frm.value.VEN_Name ?? '',
        ACP_Amt: frm.value.ACP_Amt ?? 0,
        ACP_Date: acpDate,
        ACP_ReserveAmt: frm.value.ACP_ReserveAmt ?? 0,
        Items: [
          {
            ACP_No: frm.value.ACP_No ?? '',
            ACP_YYYYMM: frm.value.ACP_YYYYMM ?? '',
            acp_termno: frm.value.acp_termno ?? 0,
            RET_Date: retDate,
            RET_Amt: frm.value.RET_Amt ?? 0,
            STATUS: frm.value.STATUS ?? '',
            Remark: frm.value.Remark ?? ''
          }
        ]
      };

      const request$ = this.isFormCreateable
        ? this.fin24020Service.createFIN24020(body)
        : this.fin24020Service.updateFIN24020(body);

      this.loading = true;
      request$
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(res => {
          this.messageService.successBubble(res.Message);
          if (this.isFormCreateable) {
            this.dataForm.reset();
          } else {
            this.onCancel();
          }
        });
    });

  }
}
