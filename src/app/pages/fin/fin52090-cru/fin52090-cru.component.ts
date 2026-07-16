import { Component, OnInit, computed, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52090Service } from '@service/api/fin/fin52090.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';
import { finalize, map, tap } from 'rxjs';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { FIN52090Insert, FIN52090UpdateRequest } from '../fin52090/fin52090.model';

@Component({
  selector: 'app-fin52090-cru',
  templateUrl: './fin52090-cru.component.html',
  standalone: true,
  imports: [
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
  ],
})
export class FIN52090CRUComponent extends BasicCruPageComponent<unknown> implements OnInit {

  public readonly dataForm = this.formBuilder.nonNullable.group({
    id: new FormControl<number | void>(void 0),
    AccNo: new FormControl<string | void>(void 0, [Validators.required]),
    NoteDesc: new FormControl<string | void>(void 0, [Validators.required, Validators.maxLength(100)]),
  });
  public readonly df = computed(() => this.dataForm.controls);

  public readonly accNoWithDisplayLabel = computed(() =>
    this.service.accNo().map(item => ({
      ...item,
      displayLabel: `${item.AccNo}-${item.AccCName}`
    }))
  );

  public readonly saving = signal<boolean>(!1);

  public readonly loadingEffect = computed(() => {
    this.loading = this.saving()
      || this.service.accNoLoading();
  });

  constructor(
    public readonly service: FIN52090Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN52090', this.dataForm);

    this.service.getAccNo();

    this.logger.debug(`init:`, [this.rowdata, this.crudstatus, this.service.accNo()]);
  }

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          const raw = <FIN52090Insert>{ ...this.dataForm.getRawValue() };
          const payload = Object.fromEntries(Object.entries(raw).filter(([_, v]) =>
            v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0)
          )) as unknown as FIN52090Insert;

          this.saving.set(!0);
          this.service.saveFIN52090Data(payload).pipe(
            tap(res => this.logger.debug('onSubmit:', [payload, res])),
            map(res => { if (res.Status !== '0000') throw new Error('資料儲存失敗'); return res; }),
            finalize(() => this.saving.set(!1)),
          ).subscribe({
            next: () => {
              this.onCancel();
              this.messageService.successBubble('資料儲存成功');
            },
            error: err => this.messageService.errorBubble(err.message || '資料儲存失敗'),
          });
          break;
        case CRUDStatus.Edit:
          if (!this.canEdit()) return;

          const rawE = this.dataForm.getRawValue();
          
          if (!rawE.id) {
            this.messageService.errorBubble('缺少 id 欄位');
            return;
          }

          const payloadE: FIN52090UpdateRequest = {
            id: rawE.id,
            AccNo: rawE.AccNo ?? undefined,
            NoteDesc: rawE.NoteDesc ?? undefined,
          };

          this.saving.set(true);
          this.service.updateFIN52090(payloadE).pipe(
            map(res => {
              if (res.Status !== '0000') throw new Error('更新失敗');
              return res;
            }),
            finalize(() => this.saving.set(false)),
          ).subscribe({
            next: () => {
              this.messageService.successBubble('更新成功');
              this.onCancel();
            },
            error: err =>
              this.messageService.errorBubble(err.message || '更新失敗'),
          });
          break;
      }
    });
  }
}
