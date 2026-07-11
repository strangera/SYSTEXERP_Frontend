import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FIN71020Service } from '@service/api/fin/fin71020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { FIN71020Data, FIN71020Insert, FIN71020Update } from '../fin71020/fin71020.model';

@Component({
  selector: 'app-fin71020-cru',
  templateUrl: './fin71020-cru.component.html',
  standalone: !0,
  imports: [
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputNumberComponent,
    InputTextareaComponent,
    MenubarComponent,
  ]
})
export class FIN71020CRUComponent extends BasicCruPageComponent<FIN71020Data> implements OnInit {

  public readonly dataForm = this.formBuilder.nonNullable.group({
    Keep_UsrNo: new FormControl<string | null>(null, [Validators.required]),
    Keep_Orgid: new FormControl<string | null>(null, [Validators.required]),
    Keep_QuotaAmt: new FormControl<number | null>(null, [Validators.required]),
    Keep_Remark: new FormControl<string | null>(null),
  });
  public readonly df = computed(() => this.dataForm.controls);

  public readonly saveLoading = signal<boolean>(!1);

  public readonly usrNoDisplayOptions = computed(() =>
    this.service.usrNoOptions().map(opt => ({
      ...opt,
      displayLabel: `${opt.Keep_UsrNo} - ${opt.Keep_UsrName}`,
    }))
  );

  public readonly orgIdDisplayOptions = computed(() =>
    this.service.orgIdOptions().map(opt => ({
      ...opt,
      displayLabel: `${opt.Org_No} - ${opt.Org_Name}`,
    }))
  );

  public readonly loadingEffect = effect(() => {
    this.loading = this.saveLoading()
      || this.service.orgLoading()
      || this.service.usrLoading();
  });

  constructor(
    public readonly service: FIN71020Service,
    public readonly translate: TranslateService,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN71020', this.dataForm);

    if (this.service.usrNoOptions().length === 0) this.service.getKeepUsrNo();
    if (this.service.orgIdOptions().length === 0) this.service.getKeepOrgId();

    if (this.rowdata && !this.isFormCreateable) {
      this.dataForm.patchValue({
        Keep_UsrNo: this.rowdata.Keep_UsrNo ?? null,
        Keep_Orgid: this.rowdata.Keep_Orgid ?? null,
        Keep_QuotaAmt: this.rowdata.Keep_QuotaAmt ?? null,
        Keep_Remark: this.rowdata.Keep_Remark ?? null,
      });
    }

    this.logger.debug(`init:`, [this.rowdata]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const raw = this.dataForm.getRawValue();

      this.saveLoading.set(!0);
      if (this.isFormCreateable) {
        const payload: FIN71020Insert = {
          Keep_UsrNo: raw.Keep_UsrNo!,
          Keep_QuotaAmt: raw.Keep_QuotaAmt!,
          Keep_Orgid: raw.Keep_Orgid!,
          Keep_Remark: raw.Keep_Remark ?? undefined,
        };
        this.logger.debug(`insert:`, [payload]);
        this.service.insertFIN71020(payload).pipe(
          finalize(() => this.saveLoading.set(!1)),
        ).subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.messageService.successBubble('新增成功');
            this.onCancel();
          },
        });
      } else {
        const payload: FIN71020Update = {
          ID: this.rowdata!.ID,
          Keep_UsrNo: raw.Keep_UsrNo!,
          Keep_QuotaAmt: raw.Keep_QuotaAmt!,
          Keep_Orgid: raw.Keep_Orgid!,
          Keep_Remark: raw.Keep_Remark ?? undefined,
        };
        this.logger.debug(`update:`, [payload]);
        this.service.updateFIN71020(payload).pipe(
          finalize(() => this.saveLoading.set(!1)),
        ).subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.messageService.successBubble('更新成功');
            this.onCancel();
          },
        });
      }
    });
  }
}
