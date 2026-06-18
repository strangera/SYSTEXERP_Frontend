import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { Sysbq00Data, Sysbq00Request, Sysbq00Service } from '../../../service/api/sys/sysbq00.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-sysbq00-cru',
  templateUrl: './sysbq00.cru.component.html',
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
export class SYSBQ00CRUComponent extends BasicCruPageComponent<Sysbq00Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    data_type: ['', [Validators.required, Validators.maxLength(10), this.validationService.alphanumericValidator]],
    line1: ['', [Validators.maxLength(200)]],
    line2: ['', [Validators.maxLength(200)]],
    line3: ['', [Validators.maxLength(200)]],
    line4: ['', [Validators.maxLength(200)]],
    line5: ['', [Validators.maxLength(200)]],
  });

  constructor(
    private readonly sysbq00Service: Sysbq00Service,
    private readonly validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSBQ00', this.dataForm);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const value = frm.value;
      const request: Sysbq00Request = {
        ...value,
        id: this.rowdata?.id, // 只有編輯才需要 id
      };
      this.loading = true;
      const save$ = this.isFormCreateable
        ? this.sysbq00Service.insertSYSBQ00(request)
        : this.sysbq00Service.updateSYSBQ00(request);

      save$.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.messageService.successBubble(res.Message);

        if (this.isFormCreateable) {
          this.dataForm.reset();
          this.submitted = false;
        } else {
          this.onCancel();
        }
      });
    });
  }
}
