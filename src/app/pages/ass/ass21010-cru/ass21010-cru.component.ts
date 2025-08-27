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
// import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
// import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';
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
    // MultiSelectComponent,
    // TableComponent,
  ]
})
export class ASS21010CRUComponent extends BasicCruPageComponent<ASS21010Data> implements OnInit {

  public readonly dataForm = this.formBuilder.nonNullable.group({
    ENGType: new FormControl<EngType | undefined>(void 0, [Validators.required]),
    ENG_MeterNo: new FormControl<string | undefined>(void 0, [Validators.required, Validators.minLength(5), Validators.maxLength(5)]),
    Location_No: new FormControl<string | undefined>(void 0, [Validators.required]),
    ENG_Remark: new FormControl<string>('', [Validators.maxLength(500)]),
  });
  public readonly df = computed(() => this.dataForm.controls);

  /** 表單變化追蹤 */
  public readonly dfEffect = effect(() => {
    this.logger.debug(`dfEffect:`, [this.dfSignal()]);
  });

  // 變化追蹤
  private readonly dfSignal = toSignal(this.dataForm.valueChanges);
  private readonly engTypeSignal = toSignal(this.df().ENGType.valueChanges);
  private readonly locationSignal = toSignal(this.df().Location_No.valueChanges);

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

  // 靜態資料: 用於表單初始化和重置
  private static staticData: ASS21010Data;

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

    if (this.crudstatus !== CRUDStatus.Create && this.rowdata) {
      Reflect.has(this.rowdata, 'Location_No') && this.df().Location_No.setValue(this.rowdata.Location_No);
      ASS21010CRUComponent.staticData = this.rowdata;
      this.logger.debug(`rowData:`, [this.rowdata]);
    }
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const d = this.dataForm.value;
      const payload: ASS21010Payload = {
        ENG_Type: d.ENGType! ?? '',
        ENG_MeterNo: d.ENG_MeterNo ?? '',
        Location_No: d.Location_No ?? '',
        ENG_Remark: d.ENG_Remark ?? '',
        ID: (this.rowdata?.ID) ?? 0,
        SYS_StoreNo: this.user.SYS_StoreNo,
        Mid: Number(this.user.mid),
      };

      this.service.updateASS21010(payload);
      this.logger.debug(`onSubmit:`, [d, payload]);
      this.loading = !1;
    });
  }

  public onClear(): void {
    this.logger.debug(`onClear:`, [ASS21010CRUComponent.staticData]);
    const d = ASS21010CRUComponent.staticData;
    if (this.crudstatus === CRUDStatus.Create) this.dataForm.reset();
    else this.dataForm.setValue({
      ENGType: d.ENGType,
      ENG_MeterNo: d.ENG_MeterNo,
      Location_No: d.Location_No,
      ENG_Remark: d.ENG_Remark,
    }, { emitEvent: !1 });
  };
}
