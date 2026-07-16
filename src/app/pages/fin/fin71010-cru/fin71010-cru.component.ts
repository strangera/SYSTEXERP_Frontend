import { Component, OnInit, computed, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN71010Service } from '@service/api/fin/fin71010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DropdownComponent } from "@shared/components/dropdown/dropdown.component";
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { NGXLogger } from 'ngx-logger';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { forkJoin } from 'rxjs';
import { FIN71010Data, FIN71010DropdownItem } from '../fin71010/fin71010.model';

@Component({
  selector: 'app-fin71010-cru',
  templateUrl: './fin71010-cru.component.html',
  standalone: true,
  imports: [
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    ButtonModule,
    InputTextModule,
    InputTextComponent,
    MenubarComponent,
    OverlayPanelModule,
    DropdownComponent
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

  public readonly apexpOptions = signal<FIN71010DropdownItem[] | null>(null);
  public readonly apexpCommonOptions = signal<FIN71010DropdownItem[] | null>(null);
  public readonly ptaxOptions = signal<FIN71010DropdownItem[] | null>(null);
  public readonly ptaxCommonOptions = signal<FIN71010DropdownItem[] | null>(null);

  constructor(
    private readonly service: FIN71010Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN71010', this.dataForm);

    this.dataForm.controls.MID.disable();
    this.dataForm.controls.SYS_StoreNo.disable();
    this.dataForm.controls.ECR_No.disable();

    this.logger.debug('init:', [this.rowdata]);
    this.loadDropdowns();
  }

  private loadDropdowns(): void {
    forkJoin({
      apexp: this.service.queryFIN71010Dropdown('APEXP_LID'),
      apexpCommon: this.service.queryFIN71010Dropdown('APEXP_LID_COMMON'),
      ptax: this.service.queryFIN71010Dropdown('PTAX_LID'),
      ptaxCommon: this.service.queryFIN71010Dropdown('PTAX_LID_COMMON'),
    }).subscribe({
      next: ({ apexp, apexpCommon, ptax, ptaxCommon }) => {
        this.apexpOptions.set(apexp.Status === '0000' ? apexp.Data : []);
        this.apexpCommonOptions.set(apexpCommon.Status === '0000' ? apexpCommon.Data : []);
        this.ptaxOptions.set(ptax.Status === '0000' ? ptax.Data : []);
        this.ptaxCommonOptions.set(ptaxCommon.Status === '0000' ? ptaxCommon.Data : []);
      },
    });
  }

  public onSelectOption(field: string, value: string, panel: OverlayPanel): void {
    this.dataForm.patchValue({ [field]: value });
    panel.hide();
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
