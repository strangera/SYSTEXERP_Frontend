import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { Fin52020Service } from '../../../service/api/fin/fin52020.service';
import { TDS52020Data } from '../fin52020/fin52020.model';

@Component({
  selector: 'app-fin52020-cru',
  templateUrl: './fin52020-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    NgIf,
    TranslateModule,
  ],
})
export class FIN52020CRUComponent extends BasicCruPageComponent<TDS52020Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    Id: [0],
    VoucherKind: ['', [Validators.required, Validators.maxLength(2), this.validationService.alphanumericValidator]],
    VoucherName: ['', [Validators.required, Validators.maxLength(50)]],
  });

  constructor(
    private fin52020Service: Fin52020Service,
    private validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN52020', this.dataForm);
    if (!this.isFormCreateable) {
      this.dataForm.get('VoucherKind')?.disable(); // Detail/Update 時 disable typecode
    }
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      if (this.isFormCreateable) {
        const payload = this.buildInsertBody(form);
        this.fin52020Service.insertFIN52020(payload)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(res => {
            this.dataForm.reset();
            this.messageService.successBubble(res.Message);
          });
      } else if (this.isFormEditable) {
        const payload = this.buildUpdateBody(form);
        this.fin52020Service.updateFIN52020(payload)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(res => {
            this.onCancel();
            this.messageService.successBubble(res.Message);
          });
      }
    });
  }

  buildInsertBody(frm: FormGroup): any {
    return {
      voucherKind: frm.get('VoucherKind')?.value,
      voucherName: frm.get('VoucherName')?.value
    };
  }
  buildUpdateBody(frm: FormGroup): {
    Id: number;
    VoucherName: string;
  } {
    return {
      Id: frm.get('Id')?.value,
      VoucherName: frm.get('VoucherName')?.value
    };
  }
}

