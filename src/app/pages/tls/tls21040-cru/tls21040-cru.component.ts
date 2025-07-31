import { ValidationService } from './../../../shared/service/validation.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TLS21040Data, Tls21040Service } from '@service/api/tls/tls21040.service';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { formatDateToYYYYMMDD } from '@shared/componentkit/table/table.model';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';

@Component({
  selector: 'app-tls21040-cru',
  templateUrl: './tls21040-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarRangeQuickComponent,
    NgIf,
    TranslateModule,
  ],
})
export class TLS21040CRUComponent extends BasicCruPageComponent<TLS21040Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    CRD_BinCode: ['', [Validators.required, Validators.maxLength(16), this.validationService.numberValidator]],
    BNK_No: ['', [Validators.required, Validators.maxLength(3), this.validationService.numberValidator]],
    CRD_Type: [null, [Validators.required]],
    CRD_Kind: [null, [Validators.required]],
    Active_Date: [null],
    Disable_Date: [null]
  });

  cardTypeOptions: { value: string, label: string }[] = [
    { value: 'V', label: 'VISA' },
    { value: 'M', label: 'MASTER' },
    { value: 'J', label: 'JCB' },
    { value: 'A', label: 'AE' },
    { value: 'D', label: 'DINERS' },
    { value: 'S', label: '銀聯卡' },
    { value: 'N', label: '聯合簽帳卡' },
    { value: 'O', label: '其他' },
  ];
  cardCategoryOptions: { value: string, label: string }[] = [
    { value: 'B', label: '商務卡' },
    { value: 'C', label: '普卡' },
    { value: 'G', label: '金卡' },
    { value: 'I', label: '無限卡' },
    { value: 'O', label: '其他' },
    { value: 'P', label: '白金卡' },
    { value: 'S', label: '御璽、鈦金、晶緻卡' },
    { value: 'T', label: '鈦金卡' },
  ];
  constructor(
    private readonly tls21040Service: Tls21040Service,
    private readonly validationService: ValidationService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS21040', this.dataForm);
    if (this.isFormEditable) {
      this.dataForm.controls.CRD_BinCode.disable();
    }
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      const body = {
        ...frm.getRawValue(),
        ID: this.rowdata?.id || undefined,
        Active_Date: formatDateToYYYYMMDD(raw.Active_Date),
        Disable_Date: formatDateToYYYYMMDD(raw.Disable_Date)
      }
      const serviceCall = this.isFormCreateable
        ? this.tls21040Service.insertTLS21040(body)
        : this.tls21040Service.updateTLS21040(body);
      serviceCall.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe({
        next: (res) => {
          this.messageService.successBubble(res.Message);
          if (this.isFormCreateable) {
            this.dataForm.reset();
          } else if (this.isFormEditable) {
            this.onCancel();
          }
        },
      });
    });
  }
}
