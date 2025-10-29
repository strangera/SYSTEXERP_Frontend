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
  public tb = viewChild.required<TableComponent>('tb');
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
    const type = this.engTypeSignal();
    const mtrNo = this.meterNoSignal();
    this.logger.debug(`payload:`, [type, mtrNo]);

    return type || mtrNo ? {
      EngTypes: type ? this.service.engTypeMap.get(type) : void 0,
      ENG_MeterNo: mtrNo ?? void 0,
      Mid: Number(this.user.mid),
      SYS_StoreNo: this.user.SYS_StoreNo,
    } : null;
  });

  /** 根據能源類型篩選的錶號清單 */
  public readonly filteredMeterNo = computed<ASS2100ENGMeterType[]>(() => {
    const selected = this.df().ENG_Type.value || this.engTypeSignal();
    const engTypes = this.service.engTypeSignal();
    const allMeterNo = this.service.engMeterNoSignal();
    this.logger.debug(`filteredMeterNo:`, [selected, engTypes, allMeterNo]);

    if (!selected || !engTypes.length || !allMeterNo.length) return [];

    const selectedTypeName = engTypes.find(t => t.No === selected)?.Name;
    return selectedTypeName ? allMeterNo.filter(m => m.ENG_Type === selectedTypeName) : [];
  });

  public readonly filteredData = computed<ASS21020Detail[]>(() => {
    const rows = this.tableDataSignal();
    if (!rows.length) {
      const fallback = this.rowdata?.Details;
      return fallback?.length ? fallback : [];
    }

    this.logger.debug(`filteredData:`, [rows, this.tltByFlagMap()]);

    const tltMap = this.tltByFlagMap();
    return rows.map(d => {
      const mapData = tltMap.get(d.TLT_No);
      return mapData ? {
        ...d,
        Location_No: mapData.Location_No || d.Location_No || '',
        NET_SPACE: mapData.NET_SPACE || d.NET_SPACE || 0,
      } : d;
    });
  });

  public readonly totalRecords = computed(() => this.filteredData().length);

  private readonly engTypeSignal = toSignal(this.df().ENG_Type.valueChanges, { initialValue: this.df().ENG_Type.value });
  private readonly meterNoSignal = toSignal(this.df().ENG_MeterNo.valueChanges, { initialValue: this.df().ENG_MeterNo.value });
  private readonly tableDataSignal = signal<ASS21020Detail[]>([]);
  public readonly isRowEditing = signal(!1);

  /** 驗證和存檔控制 */
  public readonly canSave = computed(() => {
    const tableData = this.tableDataSignal();
    const isEditing = this.isRowEditing();

    if (!this.dataForm.valid || !tableData.length || isEditing) return !1;

    const validData = tableData.filter(item => {
      const isNewRow = (item as any).Apply_No?.startsWith('temp-');
      return !isNewRow || this.hasBasicData(item);
    });

    if (!validData.length) return !1;

    const isComplete = this.isTableDataComplete(validData);
    const totalRate = this.calculateTotalRate(validData);
    this.logger.debug(`canSave:`, [validData, isComplete, totalRate]);
    return isComplete && totalRate === 100;
  });

  /** Row Edit 按鈕控制 */
  public readonly rowEditCanSave = computed(() => {
    const tableData = this.tableDataSignal();
    const isEditing = this.isRowEditing();

    if (!isEditing) return this.canSave();
    if (!this.dataForm.valid || !tableData.length) return !1;

    const validData = tableData.filter(item => {
      const isNewRow = (item as any).Apply_No?.startsWith('temp-');
      return !isNewRow || this.hasBasicData(item);
    });

    if (!validData.length) return !1;

    const isComplete = this.isTableDataComplete(validData);
    const totalRate = this.calculateTotalRate(validData);
    this.logger.debug(`rowEditCanSave:`, [validData, isComplete, totalRate]);
    return isComplete && totalRate <= 100;
  });

  /** 檢查表格資料完整性 */
  private isTableDataComplete(tableData: ASS21020Detail[]): boolean {
    const hasEmptyTltNo = tableData.some(item => !item.TLT_No);
    const hasEmptyRates = tableData.some(item => item.ENG_Rate == null || item.ENG_Rate === void 0);
    const tltNos = tableData.map(item => item.TLT_No);
    const hasDuplicates = tltNos.length !== new Set(tltNos).size;
    const hasInvalidRates = tableData.some(item => {
      const rate = Number(item.ENG_Rate);
      return isNaN(rate) || rate < 0 || rate > 100;
    });

    this.logger.debug(`isTableDataComplete:`, [tableData, hasEmptyTltNo, hasEmptyRates, hasDuplicates, hasInvalidRates]);
    return !(hasEmptyTltNo || hasEmptyRates || hasDuplicates || hasInvalidRates);
  }

  private editingRow: TLTByFlag | undefined;
  private lastQueriedMeterNo: string | undefined;

  /** 資料載入效果器 */
  public readonly dataFormEffect = effect(() => {
    const payload = this.payload();
    const types = this.service.engTypeSignal();
    const meters = this.service.engMeterNoSignal();
    this.logger.debug(`dataFormEffect:`, [payload, types, meters]);

    if (this.isFormReadable) return void this.dataFormEffect.destroy();

    // 自動選擇第一個可用的能源類型
    if (!payload?.EngTypes && types.length && meters.length) {
      const firstValidType = types.find(t => meters.some(m => m.ENG_Type === t.Name));
      if (firstValidType) this.df().ENG_Type.patchValue(firstValidType.No as EngType);
    }

    if (!payload?.ENG_MeterNo) return;

    const meterNo = payload.ENG_MeterNo;
    const meterData = meters.find(m => m.ENG_MeterNo === meterNo);

    // 查詢 TLT 資料
    if (meterNo !== this.lastQueriedMeterNo) { this.lastQueriedMeterNo = meterNo; this.service.queryTltByFlag(meterNo); }

    // 更新表單資料
    if (!payload.EngTypes || !meterData) return;
    if (this.crudstatus !== CRUDStatus.Create) this.service.loadASS21020(payload);

    queueMicrotask(() => this.dataForm.patchValue({
      Location_No: meterData.Location_No,
      floor_no: meterData.Floor_No,
      floor_name: meterData.Floor_Desc,
      Building_No: meterData.building_No,
      Building_Name: meterData.building_DESC,
      x_coord: meterData.Draw_X,
      y_coord: meterData.Draw_Y,
    }));
  }, { allowSignalWrites: !0 });

  /* 初始化 */
  public readonly initEffect = effect(() => {
    if (this.isFormCreateable) return void this.initEffect.destroy();

    const rowData = this.rowdata;
    if (!rowData?.ENG_MeterNo) return;

    const engTypes = this.service.engTypeSignal();
    const meterNos = this.service.engMeterNoSignal();
    if (!engTypes.length || !meterNos.length) return;

    const meterNo = rowData.ENG_MeterNo;
    const engType = engTypes.find(t => t.Name === rowData.ENG_Type);
    const meterData = meterNos.find(m => m.ENG_MeterNo === meterNo);
    if (!engType || !meterData) return;

    this.logger.debug(`initEffect:`, [engType, meterData]);

    this.dataForm.patchValue({
      ENG_Type: engType.No as EngType,
      ENG_MeterNo: meterNo,
      Location_No: meterData.Location_No,
      floor_no: meterData.Floor_No,
      floor_name: meterData.Floor_Desc,
      Building_No: meterData.building_No,
      Building_Name: meterData.building_DESC,
      x_coord: meterData.Draw_X,
      y_coord: meterData.Draw_Y,
    });

    if (meterNo !== this.lastQueriedMeterNo) { this.lastQueriedMeterNo = meterNo; this.service.queryTltByFlag(meterNo); }

    const target = this.service.ASS21020Data().find(v => v.ENG_MeterNo === meterNo);
    if (target?.Details) this.tableDataSignal.set(target.Details);

    this.initEffect.destroy();
  }, { allowSignalWrites: !0 });

  /** 監聽API資料載入 */
  public readonly serviceDataEffect = effect(() => {
    const ass21020Data = this.service.ASS21020Data();
    const currentMeterNo = this.df().ENG_MeterNo.value;
    this.logger.debug(`serviceDataEffect:`, [ass21020Data, currentMeterNo]);

    if (!currentMeterNo || !ass21020Data.length || this.isFormCreateable) return;

    const target = ass21020Data.find(v => v.ENG_MeterNo === currentMeterNo);
    if (target?.Details) this.tableDataSignal.set(target.Details);
  }, { allowSignalWrites: !0 });

  public readonly columns: (Omit<Column, 'field'> & { field: keyof ASS21020CRUTable; })[] = [
    {
      field: 'TLT_No',
      header: '專櫃編號/名稱',
      type: 'dropdown',
      options: () => this.service.tltNoSignal().map(({ TLT_No, TLT_Name }) => ({
        No: TLT_No,
        Name: `${TLT_No}-${TLT_Name}`
      })),
      optionLabel: 'Name',
      optionValue: 'No',
      disabled: () => this.isFormReadable,
      required: !0,
    },
    {
      field: 'Location_No',
      header: '位置編號',
      format: (v: string) => v || this.editingRow?.Location_No || '',
    },
    {
      field: 'NET_SPACE',
      header: '營業面積',
      format: (v: number) => v || this.editingRow?.NET_SPACE || 0,
      disabled: () => this.isFormReadable,
    },
    {
      field: 'ENG_Rate',
      header: '比率',
      type: 'inputNumber',
      format: (v: number) => (v || this.editingRow?.ENG_Rate || 0) + '%',
      disabled: () => this.isFormReadable,
      validate: [this.validateEngRate.bind(this)],
      required: !0,
    },
    {
      field: 'ENG_Remark',
      header: '備註',
      type: 'input',
      disabled: () => this.isFormReadable,
    },
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
      const tb = this.tb()!;
      const tableValue = tb.dt.value;
      const cleanedData = tableValue.filter((i: any) => !i.Apply_No?.startsWith('temp'));
      const filteredData = this.filteredData();

      const total = this.calculateTotalRate(filteredData);
      if (total > 100) return void (this.loading = !1);

      const formValue = this.dataForm.value;
      const payload = filteredData.map((item): ASS21020Update => ({
        ENG_Type: formValue.ENG_Type!,
        ENG_MeterNo: formValue.ENG_MeterNo!,
        TLT_No: item.TLT_No,
        ENG_Rate: item.ENG_Rate,
        ENG_Remark: item.ENG_Remark,
      }));

      tb.dt.value = cleanedData;

      this.logger.debug(`onSubmit:`, [payload, formValue, tableValue, cleanedData, filteredData]);
      this.service.updateASS21020(payload).pipe(
        tap(() => {
          this.onCancel();
          this.service.loadASS21020({ ENG_MeterNo: formValue.ENG_MeterNo! });
        }),
        tap(({ Status }) =>
          Status === '0000' && this.messageService.successBubble('資料儲存成功')
        ),
        finalize(() => this.loading = !1),
      ).subscribe();
    });
  }

  public onClear(): void {
    this.dataForm.reset();
    this.tableDataSignal.set([]);
    this.isRowEditing.set(!1);
    const tb = this.tb();
    if (tb) tb.rowEditing = !1;
  }

  public onKancel(): void {
    const tb = this.tb()!;
    const filtered = tb.dt.value.filter((i: any) => !i.Apply_No?.startsWith('temp'));
    tb.dt.value = filtered;
    this.tableDataSignal.set(filtered);
    this.isRowEditing.set(!1);
  }

  public onRowInit(): void {
    this.editingRow = void 0;
    this.isRowEditing.set(!0);
  }

  public onRowEdit(event: RowEditSaveEvent<ASS21020Detail>): void {
    const eventData = event.data as ASS21020Detail[];
    const editingRow = this.editingRow;

    this.tableDataSignal.set(eventData.map(d => editingRow ? {
      ...d,
      Location_No: editingRow.Location_No,
      NET_SPACE: editingRow.NET_SPACE,
    } : d));

    this.loading = !1;
    this.editingRow = void 0;
    this.isRowEditing.set(!1);
    this.logger.debug(`onRowEdit:`, [event, this.editingRow, this.tableDataSignal()]);
  };

  public onFieldChange(event: FieldChangeEvent): void {
    this.logger.debug(`onFieldChange:`, [event]);
    const currentData = this.tb()!.dt.value;

    if (event.field === 'TLT_No') this.handleTltNoChange(event);

    this.updateTableData(currentData, event);
  }

  private handleTltNoChange(event: FieldChangeEvent): void {
    const current = this.tltByFlagMap().get(event.value);
    if (!current) return;

    this.editingRow = current;

    const rowData = event.rowData;
    const isNotTempRow = rowData && (rowData as any).Apply_No && !(rowData as any).Apply_No.startsWith('temp');

    if (isNotTempRow) {
      const updatedData = this.tableDataSignal().map(item =>
        item === rowData ? {
          ...item,
          ...current,
          TLT_No: rowData.TLT_No,
          ENG_Rate: item.ENG_Rate || current.ENG_Rate || 0,
        } as ASS21020Detail : item
      );
      this.tableDataSignal.set(updatedData);
    }
  }

  /** 表格資料更新方法 */
  private updateTableData(currentData: ASS21020Detail[], event: FieldChangeEvent): void {
    this.logger.debug(`updateTableData:`, [currentData, event]);

    const simulatedData = currentData.map(item =>
      item === event.rowData ? {
        ...item,
        [event.field]: event.field === 'ENG_Rate' && !event.value ? void 0 : event.value
      } : item
    );

    this.tableDataSignal.set(simulatedData);
  }

  /** 檢查新增行 */
  private hasBasicData(rowData: ASS21020Detail): boolean {
    return !!(rowData.TLT_No || (rowData.ENG_Rate !== null && rowData.ENG_Rate !== void 0));
  }

  public onAutoCalculate(): void {
    const current = this.tableDataSignal();
    if (!current.length) return;

    const tltMap = this.tltByFlagMap();
    const totalSize = current.reduce((sum, item) =>
      sum + (tltMap.get(item.TLT_No)?.NET_SPACE || 0), 0);
    if (!totalSize) return;

    const updated = current.map((d): ASS21020Detail => ({
      ...d,
      ENG_Rate: Math.round(((tltMap.get(d.TLT_No)?.NET_SPACE || 0) / totalSize) * 1e4) / 100
    }));

    queueMicrotask(() => this.tableDataSignal.set(updated));
  }

  public onDelete(event: ASS21020Detail | ASS21020Detail[]): void {
    const itemsToDelete = Array.isArray(event) ? event : [event];
    if (!itemsToDelete.length) return;

    const deleteSet = new Set(itemsToDelete);
    const tb = this.tb()!;
    const filteredData = tb.dt.value.filter(item => !deleteSet.has(item));

    tb.dt.value = filteredData;
    this.tableDataSignal.set(filteredData);
    this.logger.debug(`onDelete:`, [event, filteredData]);
  }

  private validateEngRate(v: string): { isValid: boolean; errorMessage: string[]; } {
    return { isValid: !v || this.ratePtn.test(v), errorMessage: ['比率格式不正確'] };
  }

  private calculateTotalRate(data: ASS21020Detail[]): number {
    return data.reduce((sum, item) => sum + (item.ENG_Rate || 0), 0);
  }
}
