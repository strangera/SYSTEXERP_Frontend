import { NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';
import { finalize, take } from 'rxjs';
import { InsertTLS51010Request, QueryTLS51010Response, Tls51010Service, UpdateTLS51010Request } from 'src/app/service/api/tls/tls51010.service';

@Component({
  selector: 'app-tls51010-cru',
  templateUrl: './tls51010-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputTextareaComponent,
    NgIf,
    TranslateModule
  ]
})
export class TLS51010CRUComponent extends BasicCruPageComponent<QueryTLS51010Response> implements OnInit {
  private readonly validationService = inject(ValidationService);
  private readonly tls51010Service = inject(Tls51010Service);
  readonly dataForm = this.formBuilder.nonNullable.group({
    id: [0],
    CAT_LNo: ['', [Validators.required, Validators.maxLength(2), this.validationService.numberValidator]],
    CAT_LName: ['', [Validators.required, Validators.maxLength(32)]],
    CAT_LRemark: [''],
    CRT_USR_No: [''],
    CRT_USR_Name: ['']
  });
  constructor() {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS51010', this.dataForm);
    if (this.isFormEditable && this.rowdata?.CanDel === false) {
      this.dataForm.controls.CAT_LNo.disable();
    }
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      const apiCall =
        this.isFormCreateable
          ? { obs: this.tls51010Service.insertTLS51010(formValue as InsertTLS51010Request), msg: '新增成功', after: () => this.dataForm.reset() }
          : this.isFormEditable
            ? { obs: this.tls51010Service.updateTLS51010(formValue as UpdateTLS51010Request), msg: '更新成功', after: () => this.onCancel() }
            : null;
      if (!apiCall) return;
      apiCall.obs.pipe(take(1), finalize(() => this.loading = false)).subscribe(() => {
        this.messageService.successBubble(apiCall.msg);
        apiCall.after();
      });
    });
  }
}
