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
import { PanelModule } from 'primeng/panel';
import { ASS2100ENGMeterType, ASS21010Payload } from '../ass21010/ass21010.model';

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
export class ASS21010CRUComponent extends BasicCruPageComponent<ASS2100ENGMeterType> implements OnInit {

  public readonly dataForm = this.formBuilder.nonNullable.group({
    ENG_Type: new FormControl<string | undefined>(void 0, [Validators.required]),
    ENG_MeterNo: new FormControl<string | undefined>(void 0, [Validators.required, Validators.minLength(5), Validators.maxLength(5)]),
    Location_No: new FormControl<string | undefined>(void 0, [Validators.required]),
    ENG_Remark: new FormControl<string>('', [Validators.maxLength(500)]),
  });
  public readonly df = computed(() => this.dataForm.controls);

  /** 表單變化追蹤 */
  public readonly dfEffect = effect(() => {
    console.log(`dfEffect:`, [this.dfSignal()]);
  });

  // 變化追蹤
  private readonly dfSignal = toSignal(this.dataForm.valueChanges);
  private readonly engTypeSignal = toSignal(this.df().ENG_Type.valueChanges);
  private readonly locationSignal = toSignal(this.df().Location_No.valueChanges);

  /** 能源類型變更處理 */
  public readonly engTypeEffect = effect(() => {
    const types = this.engTypeSignal();
    if (!types?.length) return;
    this.service.loadEngMeterNo(EngType[types as keyof typeof EngType]);
    console.log(`Eng type changes:`, [types]);
  }, { allowSignalWrites: !0 });

  public readonly locEffect = effect(() => {
    const locations = this.locationSignal();
    if (!locations?.length) return;
    console.log(`Location changes:`, [locations]);
  });

  public readonly columns: Column[] = [
    { field: 'ENG_Type', header: '能源類型' },
    { field: 'ENG_MeterNo', header: '錶號' },
    { field: 'Location_No', header: '能源位置編號' },
    { field: 'ENG_Remark', header: '備註' },
  ];

  constructor(
    public readonly service: ASS21010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS21010', this.dataForm);

    this.service.loadEngType();
    this.service.loadLocationNo();

    if (this.crudstatus !== CRUDStatus.Create && !!this.rowdata) {
      this.df().Location_No.setValue(this.rowdata.Location_No ?? '');
    }
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const d = this.dataForm.value;
      const payload: ASS21010Payload = {
        ENG_Type: this.service.engTypeSignal().find(t => t.Name === d.ENG_Type)?.No ?? '',
        ENG_MeterNo: d.ENG_MeterNo ?? '',
        Location_No: d.Location_No ?? '',
        ENG_Remark: d.ENG_Remark ?? '',
        ID: this.rowdata?.Id ?? 0,
        SYS_StoreNo: '',
        Mid: 0,
      };

      this.service.updateASS21010(payload);
      console.log(`onSubmit:`, [d, payload]);
      this.loading = !1;
    });
  }

  public onClear(): void {
    this.dataForm.reset();
  };
}
