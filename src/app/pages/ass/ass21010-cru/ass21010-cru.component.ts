import { NgIf } from '@angular/common';
import { Component, OnInit, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21010Service, EngType } from '@service/api/ass/ass21010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { ASS21010Data, ASS21010Payload } from '../ass21010/ass21010.model';

@Component({
  selector: 'app-ass21010-cru',
  templateUrl: './ass21010-cru.component.html',
  styleUrl: './ass21010-cru.component.scss',
  standalone: !0,
  imports: [
    NgIf,
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    InputTextareaComponent,
    MenubarComponent,
  ]
})
export class ASS21010CRUComponent extends BasicCruPageComponent<ASS21010Data> implements OnInit {

  public readonly dataForm = this.formBuilder.nonNullable.group({
    ENG_Type: new FormControl<EngType | undefined>(void 0, [Validators.required]),
    ENG_MeterNo: new FormControl<string | undefined>(void 0, [Validators.required, Validators.minLength(5), Validators.maxLength(5)]),
    Location_No: new FormControl<string | undefined>(void 0, [Validators.required]),
    ENG_Remark: new FormControl<string>('', [Validators.maxLength(500)]),
  });
  public readonly df = computed(() => this.dataForm.controls);

  // 變化追蹤
  private readonly engTypeSignal = toSignal(this.df().ENG_Type.valueChanges);
  private readonly locationSignal = toSignal(this.df().Location_No.valueChanges);

  public readonly totalRecords = computed(() => this.service.ASS21010Data().length);

  /** 能源類型變更處理 */
  public readonly engTypeEffect = effect(() => {
    const types = this.engTypeSignal();
    if (!types?.length) return;
    this.service.loadEngMeterNo(types);
    this.logger.debug(`Eng type changes:`, [types]);
  }, { allowSignalWrites: !0 });

  public readonly locEffect = effect(() => {
    const locations = this.locationSignal();
    if (!locations?.length) return;
    this.logger.debug(`Location changes:`, [locations]);
  });

  constructor(
    public readonly service: ASS21010Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS21010', this.dataForm);

    this.service.loadEngType();
    this.service.loadLocationNo();

    this.logger.debug(`init:`, [this.user, this.rowdata, this.crudstatus]);

    if (this.crudstatus !== CRUDStatus.Create && this.rowdata) {
      Reflect.has(this.rowdata, 'Location_No') && this.df().Location_No.setValue(this.rowdata.Location_No);
    }
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const d = this.dataForm.getRawValue();
      const payload: ASS21010Payload = {
        ENG_Type: d.ENG_Type! ?? void 0,
        ENG_MeterNo: d.ENG_MeterNo ?? void 0,
        Location_No: d.Location_No ?? void 0,
        ENG_Remark: d.ENG_Remark ?? void 0,
        ID: (this.rowdata?.ID) ?? 0,
        SYS_StoreNo: this.user.SYS_StoreNo,
        Mid: Number(this.user.mid),
      };

      this.service.updateASS21010(payload)
        .pipe(finalize(() => {
          this.loading = !1;
          this.logger.debug(`onSubmit:`, [d, payload]);
        })).subscribe(res => {
          if (!res.IsUpdateSuccess) return this.messageService.errorBubble(res.ErrorMsg, this.isFormCreateable ? '新增失敗' : '更新失敗');
          this.isFormCreateable ? this.dataForm.reset() : this.onCancel();
          this.messageService.successBubble(this.isFormCreateable ? '新增成功' : '更新成功');
        });
    });
  }
}
