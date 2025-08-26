import { Component, computed, effect, OnInit, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21010Service, EngType } from '@service/api/ass/ass21010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { ASS2100ENGMeterType, ASS21010Delete } from './ass21010.model';

@Component({
  selector: 'app-ass21010',
  templateUrl: './ass21010.component.html',
  styleUrl: './ass21010.component.scss',
  standalone: !0,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    InputTextComponent,
    MultiSelectComponent,
    TableComponent,
  ],
})
export class ASS21010Component extends BasicQueryPageComponent<unknown> implements OnInit {

  public queryForm = this.formBuilder.group({
    ENG_Type: new FormControl<EngType[] | undefined>(void 0),
    ENG_MeterNo: new FormControl<string[] | undefined>(void 0),
    Location_No: new FormControl<string[] | undefined>(void 0),
    ENG_Remark: new FormControl<string | undefined>(void 0),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  // 變化追蹤
  private readonly qfSignal = toSignal(this.queryForm.valueChanges);
  private readonly engTypeSignal = toSignal(this.qf().ENG_Type.valueChanges);
  private readonly engMeterSignal = toSignal(this.qf().ENG_MeterNo.valueChanges);
  private readonly locationSignal = toSignal(this.qf().Location_No.valueChanges);
  private readonly engRemarkSignal = toSignal(this.qf().ENG_Remark.valueChanges);

  public readonly tableData = signal<ASS2100ENGMeterType[]>([]);

  public readonly qfEffect = effect(() => {
    console.log(`qfEffect:`, [this.qfSignal()]);
  });

  public readonly tableEffect = effect(() => {
    const types = this.engTypeSignal() || [];
    const meters = this.engMeterSignal() || [];
    const locs = this.locationSignal() || [];
    console.log(`tableEffect:`, [types, meters, locs]);
    if (!0) return;

    this.tableData.set(this.service.engMeterNoSignal().filter(item => {
      const matchesType = !types?.length || types.includes(item.ENG_Type);
      const matchesMeter = !meters?.length || meters.includes(item.ENG_MeterNo);
      const matchesLocation = !locs?.length || locs.includes(item.Location_No);
      return matchesType && matchesMeter && matchesLocation;
    }));
  }, { allowSignalWrites: !0 });

  public readonly tableInitEffect = effect(() => {
    const data = this.service.engMeterNoSignal();
    if (!data?.length) return;
    this.tableData.set(data);
    this.tableInitEffect.destroy();
  }, { allowSignalWrites: !0 });

  public readonly columns: Column[] = [
    { field: 'ENG_Type', header: '能源類型' },
    { field: 'ENG_MeterNo', header: '錶號' },
    { field: 'Location_No', header: '設備位置編號' },
    { field: 'ENG_Remark', header: '備註' },
  ];

  constructor(
    public readonly service: ASS21010Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS21010', '/ASS/ASS21010CRU', this.queryForm, this.onSubmit.bind(this));
    this.user = this.authService.currentUserValue;

    this.service.loadEngType();
    this.service.loadEngMeterNo();
    this.service.loadLocationNo();

    this.logger.debug(`init:`, [this.user, this.queryForm]);
  }

  public canQuery(): boolean {
    return !0;
  }

  public canAdd(): boolean {
    return !0;
  }

  public canEdit(): boolean {
    return !0;
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const types = this.engTypeSignal() || [];
      const meters = this.engMeterSignal() || [];
      const locs = this.locationSignal() || [];

      this.tableData.set(this.service.engMeterNoSignal().filter(item => {
        const matchesType = !types?.length || types.includes(item.ENG_Type);
        const matchesMeter = !meters?.length || meters.includes(item.ENG_MeterNo);
        const matchesLocation = !locs?.length || locs.includes(item.Location_No);
        return matchesType && matchesMeter && matchesLocation;
      }));

      console.log(`onSubmit:`, [types, meters, locs, this.tableData]);
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
      this.loading = !1;
    });
  }

  public override onCreate(data?: unknown): void {
    this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
    super.onCreate(data);
  };

  public onDelete(event: ASS2100ENGMeterType): void {
    this.logger.debug(`Deleting ASS21010:`, [event, this.user]);

    this.service.deleteASS21010(<ASS21010Delete>{
      ID: event.Id,
      ENG_MeterNo: event.ENG_MeterNo,
      Location_No: event.Location_No,
      ENG_Type: event.ENG_Type,
      SYS_StoreNo: this.user!.SYS_StoreNo,
      Mid: Number(this.user!.mid),
    });
  }

  public onClear(): void {
    this.queryForm.reset();
  }
}
