import { Component, OnInit, computed } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN71010Service } from '@service/api/fin/fin71010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';
import { FIN71010Data } from '../fin71010/fin71010.model';

@Component({
  selector: 'app-fin71010-cru',
  templateUrl: './fin71010-cru.component.html',
  styleUrls: ['./fin71010-cru.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    InputTextComponent,
    MenubarComponent,
  ]
})
export class FIN71010CRUComponent extends BasicCruPageComponent<FIN71010Data> implements OnInit {

  public readonly dataForm = this.formBuilder.nonNullable.group({
    MID: new FormControl<number | void>(void 0),
    SYS_StoreNo: new FormControl<string | void>(void 0),
    ECR_No: new FormControl<string | void>(void 0),
    APEXP_LID: new FormControl<string | void>(void 0),
    APEXP_LID_COMMON: new FormControl<string | void>(void 0),
    PTAX_LID: new FormControl<string | void>(void 0),
    PTAX_LID_COMMON: new FormControl<string | void>(void 0),
  });
  public readonly df = computed(() => this.dataForm.controls);

  constructor(
    private readonly service: FIN71010Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN71010', this.dataForm);

    // 分店代號與收銀機號為唯讀識別欄位，不可修改
    this.dataForm.controls.MID.disable();
    this.dataForm.controls.SYS_StoreNo.disable();
    this.dataForm.controls.ECR_No.disable();

    this.logger.debug('init:', [this.rowdata]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const raw = this.dataForm.getRawValue();
      this.logger.debug('onSubmit:', [raw]);

      this.service.updateFIN71010({
        MID: raw.MID as number,
        SYS_StoreNo: raw.SYS_StoreNo as string,
        ECR_No: raw.ECR_No as string,
        APEXP_LID: raw.APEXP_LID ?? null,
        APEXP_LID_COMMON: raw.APEXP_LID_COMMON ?? null,
        PTAX_LID: raw.PTAX_LID ?? null,
        PTAX_LID_COMMON: raw.PTAX_LID_COMMON ?? null,
      }).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.messageService.successBubble('更新成功');
          this.onCancel();
        },
      });
    });
  }
}
