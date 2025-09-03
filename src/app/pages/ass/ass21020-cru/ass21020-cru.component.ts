import { NgIf } from '@angular/common';
import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { EngType } from '@service/api/ass/ass21010.service';
import { ASS21020Service } from '@service/api/ass/ass21020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig, RowEditSaveEvent } from '@shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { ASS2100ENGMeterType } from '../ass21010/ass21010.model';
import { ASS21020Payload } from '../ass21020/ass21020.model';

@Component({
  selector: 'app-ass21020-cru',
  templateUrl: './ass21020-cru.component.html',
  styleUrl: './ass21020-cru.component.scss',
  standalone: !0,
  imports: [
    NgIf,
    TranslateModule,
    ReactiveFormsModule,
    PanelModule,
    FormsModule,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TableComponent,
  ]
})
export class ASS21020CRUComponent extends BasicCruPageComponent<unknown> implements OnInit {
  public readonly CRUDStatus = CRUDStatus;

  public readonly dataForm = this.formBuilder.nonNullable.group({
    ENG_Type: new FormControl<EngType | undefined>(void 0, [Validators.required]),
    ENG_MeterNo: new FormControl<string | undefined>(void 0, [Validators.required]),
    Location_No: new FormControl<string | undefined>(void 0),
    floor_no: new FormControl<string | undefined>(void 0),
    floor_name: new FormControl<string | undefined>(void 0),
    Building_No: new FormControl<string | undefined>(void 0),
    Building_Name: new FormControl<string | undefined>(void 0),
    x_coord: new FormControl<string | undefined>(void 0),
    y_coord: new FormControl<string | undefined>(void 0),
    ...createPaginationConfig([{ field: 'TLT_No', order: 1 }])
  });
  public readonly df = computed(() => this.dataForm.controls);

  private readonly engTypeSignal = toSignal(this.df().ENG_Type.valueChanges);
  private readonly meterNoSignal = toSignal(this.df().ENG_MeterNo.valueChanges);

  private readonly rateValidate = /^(100|[1-9]?[0-9])(\.[0-9]{1,2})?$/;

  public filteredMeterNo: ASS2100ENGMeterType[] = [];

  public tableEditing = !1;

  public readonly totalRecords = computed(() => this.service.tltNoSignal().length);
  private readonly getTltList = computed(() => this.service.tltNoListSignal());
  private readonly getLocList = computed(() => this.service.locationSignal());

  public readonly engTypeEffect = effect(() => {
    this.filteredMeterNo = this.service.engMeterNoSignal().filter(i => {
      if (!this.engTypeSignal()?.length) return !0;
      return this.service.engTypeSignal()!.some(t => t.Name === i.ENG_Type
        && this.df().ENG_Type.value === t.No);
    });
    this.logger.debug(`engTypeEffect:`, [this.filteredMeterNo]);
  }, { allowSignalWrites: !0 });

  public readonly meterNoEffect = effect(() => {
    const meterNo = this.meterNoSignal();
    if (!meterNo) return;
    const selected = this.service.engMeterNoMap.get(meterNo);
    selected && this.service.loadASS21020(selected);
    selected && this.service.queryTltByFlag(selected.ENG_MeterNo);
    this.dataForm.patchValue({
      Location_No: selected?.Location_No || void 0,
      floor_no: selected?.Floor_No || void 0,
      floor_name: selected?.Floor_Desc || void 0,
      Building_No: selected?.building_No || void 0,
      Building_Name: selected?.building_DESC || void 0,
      x_coord: selected?.Draw_X || void 0,
      y_coord: selected?.Draw_Y || void 0,
    });

    if (this.df().ENG_Type.value?.length) return;
    const type = this.service.engMeterNoMap.get(meterNo)?.ENG_Type;
    const current = this.service.engTypeSignal().find(t => t.Name === type);
    current && this.df().ENG_Type.patchValue(current.No as EngType);
    this.logger.debug(`meterNoEffect:`, [meterNo, selected]);
  }, { allowSignalWrites: !0 });

  public readonly columns: Column[] = [
    { field: 'TLT_No', header: '專櫃編號/名稱', type: 'dropdown', options: () => this.getTltList(), optionLabel: 'Name', optionValue: 'No', required: !0 },
    { field: 'Location_No', header: '位置編號', type: 'dropdown', options: () => this.getLocList(), optionLabel: 'Name', optionValue: 'No', required: !0 },
    { field: 'NET_SPACE', header: '營業面積', type: 'inputNumber', required: !0 },
    { field: 'ENG_Rate', header: '比率', type: 'inputNumber', format: v => v + '%', validate: [(v) => ({ isValid: !v || this.rateValidate.test(v), errorMessage: ['比率格式不正確'] })] },
    { field: 'ENG_Remark', header: '備註', type: 'input' },
  ];

  constructor(
    public readonly service: ASS21020Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('ASS21020', this.dataForm);

    this.logger.debug(`init:`, [this.rowdata]);

    if (!this.isFormCreateable && (this.rowdata as any)?.ENG_Type) {
      const fixedEngType = EngType[(this.rowdata as any).ENG_Type as keyof typeof EngType];
      this.df().ENG_Type.setValue(fixedEngType);
    }

    this.service.loadEngType();
    this.service.loadEngMeterNo();
  }

  public onRowEditInit(event: any): void {
    this.logger.debug(`onRowEditInit:`, [event]);
    this.tableEditing = !0;
    if (!this.df().ENG_MeterNo.value) return;
    this.service.loadLocationNo(this.df().ENG_MeterNo.value!);
  }

  public onRowEdit(event: RowEditSaveEvent): void {
    if (Object.is(event.newData, event.oldData)) return;

    const filterNonDates = (obj: any) => Object.fromEntries(
      Object.entries(obj).filter(([, value]) => !(value instanceof Date))
    );

    if (JSON.stringify(filterNonDates(event.newData)) === JSON.stringify(filterNonDates(event.oldData))) return;

    this.loading = !0;
    const m = this.service.engMeterNoMap.get(this.meterNoSignal()!);
    const l = event.newData?.Location_No;
    const t = event.newData;
    const isNewRow = !this.service.ASS21020Data().some(item => item.TLT_No === t.TLT_No);
    this.logger.debug(`onRowEdit:`, [event, m, t, 'isNewRow:', isNewRow]);

    if (!m) return this.messageService.errorBubble('請選擇錶號', '更新失敗');
    if (!l?.length) return this.messageService.errorBubble('請選擇位置編號', '更新失敗');
    const payload: ASS21020Payload = {
      ID: String(m.Id),
      ENG_Type: this.service.engTypeSignal().find(f => m.ENG_MeterNo === m.ENG_MeterNo)!.No,
      ENG_MeterNo: m.ENG_MeterNo,
      TLT_No: t.TLT_No,
      ENG_Rate: t.ENG_Rate,
      ENG_Remark: t.ENG_Remark,
    };
    this.service.updateASS21020(payload).pipe(finalize(() => {
      this.loading = !1;
      this.logger.debug(`onSubmit:`, [this.dataForm, payload]);
    })).subscribe(res => {
      const stat = CRUDStatus.Create === this.crudstatus ? '新增' : '更新';
      if (!res.IsUpdateSuccess) return this.messageService.errorBubble(res.ErrorMsg, `${stat}失敗`);
      this.onCancel();
      this.tableEditing = !1;
      this.messageService.successBubble(`${stat}成功`);
      this.service.loadASS21020({ ENG_MeterNo: m.ENG_MeterNo });
    });
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      this.loading = !1;
    });
  }

  public onClear(): void {
    this.service.tltNoSignal.set([]);
  }

  public onDataChange(event: any): void {
    this.service.tltNoSignal.set(event);
    this.loading = !1;
    this.logger.debug(`onDataChange:`, [event]);
  }

  public onDelete(event: any): void {
    for (const e of event) {
      this.service.updateASS21020({ TLT_No: e.TLT_No, ENG_Type: this.df().ENG_Type.value as EngType }).subscribe(res => {
        if (res.IsUpdateSuccess) this.messageService.successBubble('刪除成功');
        else this.messageService.errorBubble(res.ErrorMsg, '刪除失敗');
      });
    }
    this.loading = !1;
    this.logger.debug(`onDelete:`, [event]);
  }

  public onAutoCalculate(): void {
    const data = this.service.tltNoSignal();
    const totalSize = data.map(v => v.NET_SPACE).reduce((a, b) => a + (b ?? 0), 0);
    this.service.tltNoSignal.update(v => {
      for (const item of v) {
        Reflect.set(item, 'ENG_Rate', totalSize ? Math.round((item.NET_SPACE ?? 0) / totalSize * 10000) / 100 : 0);
      }
      return v;
    });

    this.logger.debug(`onAutoCalculate:`, [data, totalSize]);
  }
}
