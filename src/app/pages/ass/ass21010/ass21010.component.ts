import { NgIf } from '@angular/common';
import { Component, computed, effect, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21010Service, EngType } from '@service/api/ass/ass21010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { ASS21010Data, ASS21010Delete, ASS21010Payload } from './ass21010.model';

@Component({
  selector: 'app-ass21010',
  templateUrl: './ass21010.component.html',
  styleUrl: './ass21010.component.scss',
  standalone: !0,
  imports: [
    NgIf,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputTextareaComponent,
    MenubarComponent,
    MultiSelectComponent,
    TableComponent,
  ],
})
export class ASS21010Component extends BasicQueryPageComponent<unknown> implements OnInit {

  public queryForm = this.formBuilder.group({
    ENG_Type: new FormControl<EngType[] | undefined>(void 0),
    ENG_MeterNo: new FormControl<string | undefined>(void 0),
    Location_No: new FormControl<string | undefined>(void 0),
    ENG_Remark: new FormControl<string | undefined>(void 0),
    ...createPaginationConfig([{ field: 'ID', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  // 變化追蹤
  private readonly qfSignal = toSignal(this.queryForm.valueChanges);
  private readonly engTypeSignal = toSignal(this.qf().ENG_Type.valueChanges);
  private readonly engMeterSignal = toSignal(this.qf().ENG_MeterNo.valueChanges);
  private readonly locationSignal = toSignal(this.qf().Location_No.valueChanges);
  private readonly engRemarkSignal = toSignal(this.qf().ENG_Remark.valueChanges);

  public readonly qfEffect = effect(() => {
    this.logger.debug(`qfEffect:`, [this.qfSignal()]);
  });

  public readonly tableEffect = effect(() => {
    const types = this.engTypeSignal() || [];
    const meters = this.engMeterSignal() || [];
    const locs = this.locationSignal() || [];
    this.logger.debug(`tableEffect:`, [types, meters, locs]);
  }, { allowSignalWrites: !0 });

  public readonly columns: Column[] = [
    { field: 'ENGType', header: '能源類型', format: v => this.service.engTypeSignal().find(t => t.No === v)?.Name || v },
    { field: 'ENG_MeterNo', header: '錶號' },
    { field: 'Location_No', header: '設備位置編號' },
    { field: 'ENG_Remark', header: '備註', disabled: () => !0 },
  ];

  constructor(
    public readonly service: ASS21010Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS21010', '/ASS/ASS21010CRU', this.queryForm, this.onSubmit.bind(this));

    this.service.loadEngType();
    this.service.loadEngMeterNo();
    this.service.loadLocationNo();

    this.logger.debug(`init:`, [this.queryForm]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const payload = <ASS21010Payload>{
        ...this.queryForm.getRawValue(),
        ENG_Type: this.engTypeSignal(),
        ENG_MeterNo: this.engMeterSignal(),
        ENG_Remark: this.engRemarkSignal(),
        Location_No: this.locationSignal(),
        SYS_StoreNo: this.authService.currentUserValue!.SYS_StoreNo,
        Mid: Number(this.authService.currentUserValue!.mid),
      };
      this.service.loadASS21010(payload);

      this.logger.debug(`onSubmit:`, [payload]);
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.loading = !1;
    });
  }

  public onDelete(event: ASS21010Data): void {
    this.confirmationService.confirm({
      message: '是否確認刪除?',
      accept: () => {
        this.logger.debug(`Deleting ASS21010:`, [event, this.authService.currentUserValue]);
        this.service.deleteASS21010(<ASS21010Delete>{
          ...this.queryForm.value,
          ID: event.ID,
          ENG_MeterNo: event.ENG_MeterNo,
          Location_No: event.Location_No,
          ENG_Type: event.ENG_Type,
          SYS_StoreNo: this.authService.currentUserValue!.SYS_StoreNo,
          Mid: Number(this.authService.currentUserValue!.mid),
        });
        this.service.ASS21010Data.set(this.service.ASS21010Data().filter(v => v.ID !== event.ID));
        this.loading = !1;
      },
    });
  }
}
