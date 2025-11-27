import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin62010Service, QueryFIN62010Response } from '@service/api/fin/fin62010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextareaComponent } from "@shared/componentkit/input-textarea/input-textarea.component";
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-fin62010-cru',
  templateUrl: './fin62010-cru.component.html',
  standalone: true,
  imports: [InputNumberComponent, AsyncPipe, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, CalendarComponent, ButtonComponent, NgIf, TranslateModule, InputTextareaComponent]
})
export class FIN62010CRUComponent extends BasicCruPageComponent<QueryFIN62010Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ID: [null],
    Tran_No: [{ value: '系統自動給號', disabled: true }],
    CRT_USR_No: [{ value: this.authService.currentUserValue?.user_No, disabled: true }],
    CRT_USR_Name: [{ value: this.authService.currentUserValue?.user_Name, disabled: true }],
    CRT_Date: [{ value: new Date(), disabled: true }],
    Tran_Date: [new Date(), [Validators.required]],
    BNK_No_In: [null, [Validators.required]],
    BNK_No_Out: [null, [Validators.required]],
    Tran_Amt: [0, [Validators.required, Validators.min(0)]],
    Fee_Amt: [0],
    Remark: [null],
  });
  BNK_NoOptions = this.dropdown.queryGls1005_BNK_DepositAcc();
  ngOnInit(): void {
    this.initializePage('FIN62010', this.dataForm);
  }

  constructor(
    private readonly dropdown: DropdownApiService,
    public readonly fin62010Service: Fin62010Service
  ) { super(); }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const $result = this.isFormCreateable ? this.fin62010Service.insertFIN62010(frm.getRawValue()) : this.fin62010Service.updateFIN62010(frm.getRawValue());
      $result.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.messageService.successBubble(res.Message);
        if (this.isFormCreateable) {
          this.dataForm.reset();
        } else if (this.isFormEditable) {
          this.onCancel();
        }
      });
    });
  }

  onTran_AmtBlur() {
    this.fin62010Service.getRemitFee({
      BNK_No: this.dataForm.get('BNK_No_In')?.value || '',
      Remit_Amount: this.dataForm.get('Tran_Amt')?.value || 0
    }).pipe(untilDestroyed(this)).subscribe(res => {
      this.dataForm.get('Fee_Amt')?.setValue(res.Data.Remit_Fee, { emitEvent: false });
    })
  }
}
