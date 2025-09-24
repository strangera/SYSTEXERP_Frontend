import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, OnInit, signal, viewChild } from '@angular/core';
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
import { Column, FieldChangeEvent, RowEditSaveEvent } from '@shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';
import { finalize, tap } from 'rxjs';
import { ASS2100ENGMeterType } from '../ass21010/ass21010.model';
import { ASS21020CRUTable, ASS21020Data, ASS21020Detail, ASS21020Query, ASS21020Update, TLTByFlag } from '../ass21020/ass21020.model';

@Component({
  selector: 'app-ass21020-cru',
  templateUrl: './ass21020-cru.component.html',
  styleUrl: './ass21020-cru.component.scss',
  standalone: !0,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class ASS21020CRUComponent extends BasicCruPageComponent<ASS21020Data> implements OnInit {
  public tb = viewChild<TableComponent>('tb');
  public readonly CRUDStatus = CRUDStatus;
  private readonly ratePtn = /^(100|[1-9]?[0-9])(\.[0-9]{1,2})?$/;

  public readonly dataForm = this.formBuilder.nonNullable.group({
    ENG_Type: new FormControl<EngType | void>(void 0, [Validators.required]),
    ENG_MeterNo: new FormControl<string | void>(void 0, [Validators.required]),
    Location_No: new FormControl<string | void>(void 0),
    floor_no: new FormControl<string | void>(void 0),
    floor_name: new FormControl<string | void>(void 0),
    Building_No: new FormControl<string | void>(void 0),
    Building_Name: new FormControl<string | void>(void 0),
    x_coord: new FormControl<string | void>(void 0),
    y_coord: new FormControl<string | void>(void 0),
  });
  public readonly df = computed(() => this.dataForm.controls);

  private readonly tltByFlagMap = computed(() => this.service.tltByFlagMap);

  private readonly payload = computed((): ASS21020Query | null => {
    const type = this.engTypeSignal() as string;
    const mtrNo = this.meterNoSignal();
    this.logger.debug(`payload:`, [type, mtrNo]);
    return {
      EngTypes: this.service.engTypeMap.get(type) ?? void 0,
      ENG_MeterNo: mtrNo ?? void 0,
      Mid: Number(this.user.mid),
      SYS_StoreNo: this.user.SYS_StoreNo,
    };
  });

  /** 根據工程類型篩選的電錶編號清單 */
  public readonly filteredMeterNo = computed<ASS2100ENGMeterType[]>(() => {
    const selected = this.engTypeSignal();
    const engTypes = this.service.engTypeSignal();
    const allMeterNo = this.service.engMeterNoSignal();

    if (!selected || !engTypes.length || !allMeterNo.length) return allMeterNo;

    const selectedTypeName = engTypes.find(t => t.No === selected)?.Name;
    if (!selectedTypeName) return allMeterNo;

    const filtered = allMeterNo.filter(m => m.ENG_Type === selectedTypeName);

    // filtered.forEach(m => m.ENG_MeterNo !== this.meterNoSignal() && this.df().ENG_MeterNo.setValue(void 0));

    return filtered;
  });

  public readonly filteredData = computed<ASS21020Detail[]>(() => {
    const rows = this.tableDataSignal().length > 0
      ? this.tableDataSignal()
      : this.rowdata?.Details || [];
    if (!rows.length) return [];

    this.logger.debug(`filteredData:`, [rows, this.tltByFlagMap()]);
    return rows.map(d => {
      const mapData = this.tltByFlagMap().get(d.TLT_No);
      return {
        ...d,
        Location_No: mapData?.Location_No ?? d.Location_No ?? '',
        NET_SPACE: mapData?.NET_SPACE ?? d.NET_SPACE ?? 0,
      };
    });
  });

  public readonly totalRecords = computed(() => this.filteredData().length);

  private readonly engTypeSignal = toSignal(this.df().ENG_Type.valueChanges, { initialValue: void 0 });
  private readonly meterNoSignal = toSignal(this.df().ENG_MeterNo.valueChanges, { initialValue: void 0 });
  private readonly tableDataSignal = signal<ASS21020Detail[]>([]);
  private readonly currentEditingSignal = signal<{ event: FieldChangeEvent<ASS21020Detail> | null; currentData: ASS21020Detail[]; }>({ event: null, currentData: [] });
  public readonly rowEditValidSignal = signal(!0);

  private editingRow: TLTByFlag | undefined;
  private lastQueriedMeterNo: string | undefined;

  /* 驗證 ENG_Rate 跟 TLT_No */
  public readonly validationEffect = effect(() => {
    const { event, currentData } = this.currentEditingSignal();
    if (!event || !currentData.length) return void this.rowEditValidSignal.set(!0);

    const tltNoToCheck = <string | undefined>(event.field === 'TLT_No' ? event.value : event.rowData.TLT_No);
    const rateToCheck = <number | undefined>(event.field === 'ENG_Rate' ? event.value : event.rowData.ENG_Rate);

    //  TLT_No 不重複
    const isDuplicateTltNo = tltNoToCheck && currentData.some(item =>
      item.TLT_No === tltNoToCheck && item !== event.rowData
    );

    // 所有 ENG_Rate 欄位都已填入
    const hasEmptyRates = currentData.some(item => {
      const rate = item === event.rowData
        ? (event.field === 'ENG_Rate' ? event.value : item.ENG_Rate)
        : item.ENG_Rate;
      return rate === null || rate === void 0 || rate === '';
    });

    // ENG_Rate 格式正確（0-100之間或空值）
    const isInvalidRate = typeof rateToCheck === 'number'
      ? (rateToCheck < 0 || rateToCheck > 100)
      : (rateToCheck !== null && rateToCheck !== void 0 && rateToCheck !== '');

    // 總比率不超過100%
    const totalRate = currentData.reduce((sum, item) => {
      const rate = item === event.rowData
        ? (event.field === 'ENG_Rate' ? (event.value ?? 0) : (item.ENG_Rate ?? 0))
        : (item.ENG_Rate ?? 0);
      const numericRate = Number(rate);
      return sum + (isNaN(numericRate) ? 0 : numericRate);
    }, 0);

    const isValid = !isDuplicateTltNo && !hasEmptyRates && !isInvalidRate && totalRate <= 100;
    this.rowEditValidSignal.set(isValid);
  }, { allowSignalWrites: !0 });

  /* 根據表單載入相關資料 */
  public readonly dataFormEffect = effect(() => {
    const payload = this.payload();
    const types = this.service.engTypeSignal();
    const meters = this.service.engMeterNoSignal();
    const dtVal = this.tb()!.dt.value ?? [];
    this.tb()!.rowEditing = !1;
    this.logger.debug(`dataForm:`, [payload, types, meters, dtVal]);

    if (dtVal.length) this.tableDataSignal.set(dtVal.filter(i => !i.Apply_No?.startsWith('temp')));
    if (!payload?.EngTypes) this.df().ENG_Type.patchValue(types.find(t =>
      meters.find(m => m.ENG_Type === t.Name))?.No as EngType);
    if (!payload?.ENG_MeterNo) return;

    const meterData = meters.find(item => item.ENG_MeterNo === payload.ENG_MeterNo);

    if (payload.ENG_MeterNo && this.lastQueriedMeterNo !== payload.ENG_MeterNo) {
      this.lastQueriedMeterNo = payload.ENG_MeterNo;
      this.service.queryTltByFlag(payload.ENG_MeterNo);
    }

    if (payload.EngTypes && meterData) queueMicrotask(() => {
      if (this.crudstatus !== CRUDStatus.Create) this.service.loadASS21020(payload);

      this.dataForm.patchValue({
        Location_No: meterData.Location_No,
        floor_no: meterData.Floor_No,
        floor_name: meterData.Floor_Desc,
        Building_No: meterData.building_No,
        Building_Name: meterData.building_DESC,
        x_coord: meterData.Draw_X,
        y_coord: meterData.Draw_Y,
      }, { emitEvent: !1 });
    });
    if (this.isFormReadable) return void this.dataFormEffect.destroy();
  }, { allowSignalWrites: !0 });

  /* 初始化 */
  public readonly initEffect = effect(() => {
    if (this.isFormCreateable) return void this.initEffect.destroy();

    const rowData = this.rowdata;
    const data = this.service.ASS21020Data();
    const engTypes = this.service.engTypeSignal();
    const meterNos = this.service.engMeterNoSignal();
    if (!engTypes?.length || !meterNos?.length || !rowData) return;

    const fixedType = engTypes.find(t => t.Name === rowData.ENG_Type);
    const meterData = meterNos.find(item => item.ENG_MeterNo === rowData.ENG_MeterNo);
    const target = data.find(v => v.ENG_MeterNo === rowData.ENG_MeterNo);

    if (meterData && fixedType) this.dataForm.patchValue({
      ENG_Type: fixedType.No as EngType || void 0,
      ENG_MeterNo: rowData.ENG_MeterNo ?? void 0,
      Location_No: meterData.Location_No ?? void 0,
      floor_no: meterData.Floor_No ?? void 0,
      floor_name: meterData.Floor_Desc ?? void 0,
      Building_No: meterData.building_No ?? void 0,
      Building_Name: meterData.building_DESC ?? void 0,
      x_coord: meterData.Draw_X ?? void 0,
      y_coord: meterData.Draw_Y ?? void 0,
    }, { emitEvent: !1 });

    if (rowData.ENG_MeterNo && this.lastQueriedMeterNo !== rowData.ENG_MeterNo) {
      this.lastQueriedMeterNo = rowData.ENG_MeterNo;
      this.service.queryTltByFlag(rowData.ENG_MeterNo);
    }

    this.logger.debug(`initEffect 1:`, [rowData, data, engTypes, meterNos, fixedType, meterData, target]);
    if (!target) return;
    this.tableDataSignal.set(target.Details ?? []);
    this.logger.debug(`initEffect 2:`, [meterData, target]);
    this.initEffect.destroy();
  }, { allowSignalWrites: !0 });

  public readonly columns: (Omit<Column, 'field'> & { field: keyof ASS21020CRUTable; })[] = [
    {
      field: 'TLT_No',
      header: '專櫃編號/名稱',
      type: 'dropdown',
      options: () => this.service.tltNoSignal().map(({ TLT_No, TLT_Name }) => ({ No: TLT_No, Name: `${TLT_No}-${TLT_Name}` })),
      optionLabel: 'Name',
      optionValue: 'No',
      disabled: () => this.isFormReadable,
      required: !0
    },
    {
      field: 'Location_No',
      header: '位置編號',
      format: (v: string) => v ?? this.editingRow?.Location_No ?? '',
    },
    {
      field: 'NET_SPACE',
      header: '營業面積',
      format: (v: number) => v ?? this.editingRow?.NET_SPACE ?? 0,
      disabled: () => this.isFormReadable,
    },
    {
      field: 'ENG_Rate',
      header: '比率',
      type: 'inputNumber',
      format: (v: number) => (v ?? this.editingRow?.ENG_Rate ?? 0) + '%',
      disabled: () => this.isFormReadable,
      validate: [this.validateEngRate.bind(this)],
      required: !0
    },
    { field: 'ENG_Remark', header: '備註', type: 'input', disabled: () => this.isFormReadable, },
  ];

  constructor(
    public readonly service: ASS21020Service,
    private readonly logger: NGXLogger,
  ) {
    super();
    this.user = this.authService.currentUserValue!;
  }

  public ngOnInit(): void {
    this.initializePage('ASS21020', this.dataForm);

    this.service.loadEngType();
    this.service.loadEngMeterNo();
    this.logger.debug(`init:`, [this.rowdata, this.dataForm.value]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const tableValue = this.tb()!.dt.value;
      const cleanedData = tableValue.filter((i: any) => !i.Apply_No?.startsWith('temp'));
      const filteredData = this.filteredData();
      const total = filteredData.reduce((sum: number, item: ASS21020Detail) => sum + (item.ENG_Rate ?? 0), 0);
      const payload = filteredData.map((item: ASS21020Detail): ASS21020Update => ({
        ENG_Type: this.df().ENG_Type.value!,
        ENG_MeterNo: this.df().ENG_MeterNo.value!,
        TLT_No: item.TLT_No,
        ENG_Rate: item.ENG_Rate,
        ENG_Remark: item.ENG_Remark,
      }));

      this.tb()!.dt.value = cleanedData;

      if (total > 100) return void (this.loading = !1);

      this.service.updateASS21020(payload).pipe(
        tap(() => {
          this.onCancel();
          this.service.loadASS21020({ ENG_MeterNo: this.df().ENG_MeterNo.value! });
        }),
        finalize(() => this.loading = !1),
      ).subscribe();
    });
  }

  public onClear(): void {
    this.dataForm.reset();
    this.tableDataSignal.set([]);
    this.tb() && (this.tb()!.rowEditing = !1);
  }

  public onKancel(): void {
    this.tb()!.dt.value = this.tb()!.dt.value.filter(i => !i.Apply_No?.startsWith('temp'));
    this.tableDataSignal.set(this.tb()!.dt.value);
  }

  public onRowInit(event: any): void {
    this.editingRow = void 0;
    this.currentEditingSignal.set({ event: null, currentData: [] });
    this.rowEditValidSignal.set(!1);
    this.logger.debug(`onRowInit:`, [event, this.tableDataSignal(), this.filteredData(), this.tb()!.dt.value]);
  }

  public onRowEdit(event: RowEditSaveEvent): void {
    this.tableDataSignal.set([...event.data.map((d: ASS21020Detail) => ({
      ...d,
      Location_No: this.editingRow?.Location_No,
      NET_SPACE: this.editingRow?.NET_SPACE,
    }))]);
    [this.loading, this.editingRow] = [!1, void 0];
    this.currentEditingSignal.set({ event: null, currentData: [] });
    this.rowEditValidSignal.set(!0);
    this.logger.debug(`onRowEdit:`, [event, this.tableDataSignal()]);
  };

  public onFieldChange(event: FieldChangeEvent): void {
    const current = this.tltByFlagMap().get(event.rowData.TLT_No);
    const currentData = this.tb()!.dt.value;
    this.currentEditingSignal.set({ event, currentData });
    this.logger.debug(`onFieldChange:`, [event, current, currentData, this.currentEditingSignal()]);

    if (event.field !== 'TLT_No' || !current) return;
    this.editingRow = current;

    if (!event.rowData.Apply_No || event.rowData.Apply_No.startsWith('temp')) return;
    const updatedData = this.tableDataSignal().map(item =>
      item === event.rowData ? {
        ...item,
        ...current,
        TLT_No: event.rowData.TLT_No,
        ENG_Rate: item.ENG_Rate ?? current?.ENG_Rate ?? 0,
        Location_No: current?.Location_No ?? item.Location_No,
        NET_SPACE: current?.NET_SPACE ?? item.NET_SPACE,
      } as ASS21020Detail : item
    );
    this.tableDataSignal.set(updatedData);
  }

  public onAutoCalculate(): void {
    const current = this.tableDataSignal();
    this.logger.debug(`onAutoCalculate1:`, [current]);
    if (!current?.length) return;

    const totalSize = current.reduce((sum: number, item: ASS21020Detail) => {
      const space = this.tltByFlagMap().get(item.TLT_No)?.NET_SPACE ?? 0;
      return sum + space;
    }, 0);
    this.logger.debug(`onAutoCalculate2:`, [totalSize]);
    if (!totalSize) return;

    const updated = current.map((d: ASS21020Detail): ASS21020Detail => {
      const itemSpace = this.tltByFlagMap().get(d.TLT_No)?.NET_SPACE ?? 0;
      return {
        ...d,
        ENG_Rate: Math.round((itemSpace / totalSize) * 1e4) / 100
      };
    });

    this.logger.debug(`onAutoCalculate3:`, [updated]);
    queueMicrotask(() => this.tableDataSignal.set(updated));
  }

  public onDelete(event: ASS21020Detail | ASS21020Detail[]): void {
    const itemsToDelete = Array.isArray(event) ? event : [event];
    if (!itemsToDelete.length) return;

    const deleteSet = new Set(itemsToDelete);
    const currentData = this.tb()!.dt.value;
    const filteredData = currentData.filter(item => !deleteSet.has(item));

    this.tb()!.dt.value = filteredData;
    queueMicrotask(() => this.tableDataSignal.set(filteredData));
  }

  private validateEngRate(v: string): { isValid: boolean; errorMessage: string[]; } {
    return { isValid: !v || this.ratePtn.test(v), errorMessage: ['比率格式不正確'] };
  }
}
