import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';
import { finalize, take } from 'rxjs';
import { InsertTLS51020Request, QueryTLS51020Response, Tls51020Service, UpdateTLS51020Request } from 'src/app/service/api/tls/tls51020.service';

@Component({
  selector: 'app-tls51020-cru',
  templateUrl: './tls51020-cru.component.html',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    InputTextareaComponent,
    TranslateModule,
    AsyncPipe
  ]
})
export class TLS51020CRUComponent extends BasicCruPageComponent<QueryTLS51020Response> implements OnInit {
  private readonly validationService = inject(ValidationService);
  private readonly tls51020Service = inject(Tls51020Service);
  private readonly dropdownApiService = inject(DropdownApiService);

  readonly dataForm = this.formBuilder.nonNullable.group({
    id: [0],
    CAT_MNo: ['', [Validators.required, Validators.maxLength(6), this.validationService.numberValidator]],
    CAT_MName: ['', [Validators.required, Validators.maxLength(40)]],
    CAT_LNo: ['', [Validators.required]],
    CAT_MRemark: [''],
  });

  bigCategoryOptions = this.dropdownApiService.queryPos2003();

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51020', this.dataForm);
    if (this.isFormEditable && this.rowdata?.CanDel === false) {
      this.dataForm.controls.CAT_MNo.disable();
    }
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      const apiCall =
        this.isFormCreateable
          ? { obs: this.tls51020Service.insertTLS51020(formValue as InsertTLS51020Request), msg: '新增成功', after: () => this.dataForm.reset() }
          : this.isFormEditable
            ? { obs: this.tls51020Service.updateTLS51020(formValue as UpdateTLS51020Request), msg: '更新成功', after: () => this.onCancel() }
            : null;

      if (!apiCall) return;

      apiCall.obs.pipe(take(1), finalize(() => this.loading = false)).subscribe(() => {
        this.messageService.successBubble(apiCall.msg);
        apiCall.after();
      });
    });
  }
}
