import { Component, OnInit, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21020Service } from '@service/api/ass/ass21020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-ass21020',
  templateUrl: './ass21020.component.html',
  styleUrl: './ass21020.component.scss',
  standalone: true,
  imports: [
    PanelModule,
    AccordionModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    MultiSelectComponent,
    MenubarComponent,
    ButtonComponent,
    TableComponent,
  ],
})
export class ASS21020Component extends BasicQueryPageComponent<unknown> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    ENG_Type: new FormControl<string | undefined>(void 0),
    ENG_MeterNo: new FormControl<string | undefined>(void 0),
    tlt_no: new FormControl<string | undefined>(void 0),
    Location_No: new FormControl<string | undefined>(void 0),
    eng_rate: new FormControl<number | undefined>(0),
    department_name: new FormControl<string | undefined>(void 0),
    business_area: new FormControl<string | undefined>(void 0),
    business_area_ratio: new FormControl<number | undefined>(void 0),
    ...createPaginationConfig([{ field: '', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);
  public readonly totalRecord = computed(() => this.service.ASS21020Data().length);

  private readonly meterNoSignal = toSignal(this.qf().ENG_MeterNo.valueChanges);

  public readonly meterNoEffect = effect(() => {
    const meterNo = this.meterNoSignal();
    if (!meterNo) return;
    this.service.queryTltByFlag(meterNo);
    const selected = this.service.engMeterNoMap.get(meterNo);
    this.qf().Location_No.patchValue(selected?.Location_No ?? '');
    console.log(`meterNo changes:`, [meterNo, selected]);
  }, { allowSignalWrites: !0 });

  public readonly columns: Column[] = [
    { field: 'ENG_Type', header: '能源類型' },
    { field: 'TLT_No', header: '專櫃編號' },
    { field: 'ENG_Rate', header: '面積比率(%)' },
    { field: 'ENG_Remark', header: '備註' },
    { field: 'CRT_Date', header: '建立日期' },
    { field: 'CRT_USR_Name', header: '建立人員名稱' },
    { field: 'UPD_Date', header: '變更日期' },
    { field: 'UPD_USR_Name', header: '變更人員名稱' },
  ];

  constructor(
    public readonly service: ASS21020Service,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('ASS21020', '/ASS/ASS21020CRU', this.queryForm, this.onSubmit.bind(this));

    this.service.loadEngType();
    this.service.loadEngMeterNo();
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      this.service.loadASS21020({
        EngTypes: this.qf().ENG_Type.value ?? void 0,
        ENG_MeterNo: this.qf().ENG_MeterNo.value ?? void 0,
      });

      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
      this.loading = !1;
    });
  }

  public override onCreate(data?: unknown): void {
    this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
    super.onCreate(data);
  }


  public onClear(): void {
    this.queryForm.reset();
  }
}
