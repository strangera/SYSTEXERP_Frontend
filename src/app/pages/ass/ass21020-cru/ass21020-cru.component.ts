import { NgIf } from '@angular/common';
import { Component, computed, effect, OnInit, signal, viewChild } from '@angular/core';
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
import { finalize, startWith, tap } from 'rxjs';
import { ASS2100ENGMeterType } from '../ass21010/ass21010.model';
import { ASS21020Data, ASS21020Detail, ASS21020Query, ASS21020Update, TLTByFlag } from '../ass21020/ass21020.model';

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
export class ASS21020CRUComponent extends BasicCruPageComponent<ASS21020Data> implements OnInit {
  public tb = viewChild<TableComponent>('tb');
  public readonly CRUDStatus = CRUDStatus;
  private readonly ratePtn = /^(100|[1-9]?[0-9])(\.[0-9]{1,2})?$/;

  private static readonly equalFn = (a: any, b: any) => String(a) === String(b);

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
  });
  public readonly df = computed(() => this.dataForm.controls);

  private readonly engTypeSignal = toSignal(this.df().ENG_Type.valueChanges, { equal: ASS21020CRUComponent.equalFn });
  private readonly meterNoSignal = toSignal(this.df().ENG_MeterNo.valueChanges, { equal: ASS21020CRUComponent.equalFn });
  private readonly tableDataSignal = signal<ASS21020Detail[]>([], { equal: ASS21020CRUComponent.equalFn });

  private readonly allEngTypes = computed(() => this.service.engTypeSignal());
  private readonly allMeterNo = computed(() => this.service.engMeterNoSignal());
  private readonly tltByFlagMap = computed(() => this.service.tltByFlagMap);
  private readonly payload = computed((): ASS21020Query => {
    const type = this.engTypeSignal()!;
    const mtrNo = this.meterNoSignal()!;
    return {
      EngTypes: this.service.engTypeMap.get(type ?? '') ?? '',
      ENG_MeterNo: mtrNo,
      // Location_No: mtrNoData.Floor_No,
      Mid: Number(this.user.mid),
      SYS_StoreNo: this.user.SYS_StoreNo,
    };
  }, { equal: ASS21020CRUComponent.equalFn });

  public readonly rowEditCanSaveSignal = signal(!0);

  private editingRow: TLTByFlag | undefined;

  /** 根據工程類型篩選的電錶編號清單 */
  public readonly filteredMeterNo = computed<ASS2100ENGMeterType[]>(() => {
    const selected = this.engTypeSignal();
    const all = this.allMeterNo();
    if (!selected) return all;
    const nameSet = new Set(this.allEngTypes().filter(t => t.No === selected).map(t => t.Name));
    return all.filter(m => nameSet.has(m.ENG_Type));
  });

  public readonly filteredData = computed<ASS21020Detail[]>(() => {
    const rows = this.tableDataSignal();
    const map = this.tltByFlagMap();
    return rows.map(d => ({
      ...d,
      Location_No: map.get(d.TLT_No)?.Location_No ?? '',
      NET_SPACE: map.get(d.TLT_No)?.NET_SPACE ?? 0,
    }));
  });

  public readonly dropdownEffect = effect(() => {
    const payload = this.payload();
    const mtrNoData = this.service.engMeterNoSignal().find(item => item.ENG_MeterNo === payload.ENG_MeterNo);
    this.logger.debug(`dropwnEffect:`, [payload, mtrNoData]);
    if (payload.EngTypes && payload.ENG_MeterNo && mtrNoData) {
      this.service.queryTltByFlag(payload.ENG_MeterNo);
      if (this.crudstatus !== CRUDStatus.Create) this.service.loadASS21020(this.payload());
      this.dataForm.patchValue({
        Location_No: mtrNoData.Location_No,
        floor_no: mtrNoData.Floor_No,
        floor_name: mtrNoData.Location_Name,
        Building_No: mtrNoData.building_No,
        Building_Name: mtrNoData.building_DESC,
        x_coord: mtrNoData.Draw_X,
        y_coord: mtrNoData.Draw_Y,
      });
    }
  }, { allowSignalWrites: !0 });

  public readonly bootstrapEffect = effect(() => {
    if (this.isFormCreateable) return void (this.bootstrapEffect.destroy());
    const rowData = this.rowdata;
    const type = this.service.engTypeSignal();
    const mtrNo = this.service.engMeterNoSignal();
    this.logger.debug(`bootstrap startup:`, [rowData, type, mtrNo, this.service.ASS21020Data()]);
    if (type?.length && mtrNo?.length && rowData) {
      const fixedEngType = type.find(t => t.Name === rowData.ENG_Type)?.No as EngType;
      this.service.loadASS21020({ EngTypes: fixedEngType, ENG_MeterNo: rowData.ENG_MeterNo });
      this.df().ENG_Type.setValue(fixedEngType);
      this.df().ENG_MeterNo.setValue(rowData.ENG_MeterNo);
      this.logger.debug(`bootstrap:`, [this.df(), this.tableDataSignal()]);
      this.bootstrapEffect.destroy();
    }
  }, { allowSignalWrites: !0 });

  public readonly bootstrapTableEffect = effect(() => {
    if (this.isFormCreateable) this.bootstrapTableEffect.destroy();
    this.tableDataSignal.set(this.service.ASS21020Data().find(v => v.ENG_MeterNo === this.rowdata?.ENG_MeterNo)?.Details ?? []);
    this.tableDataSignal()?.length && this.bootstrapTableEffect.destroy();
  }, { allowSignalWrites: !0 });

  public readonly totalRecords = computed(() => this.tableDataSignal().length);
  private readonly getTltList = computed(() => this.service.tltNoListSignal());

  public readonly columns: Column[] = [
    { field: 'TLT_No', header: '專櫃編號/名稱', type: 'dropdown', options: () => this.getTltList(), optionLabel: 'Name', optionValue: 'No', required: !0 },
    { field: 'Location_No', header: '位置編號', format: v => v ?? this.editingRow?.Location_No },
    { field: 'NET_SPACE', header: '營業面積', format: v => v ?? this.editingRow?.NET_SPACE },
    { field: 'ENG_Rate', header: '比率', type: 'inputNumber', format: v => (v ?? this.editingRow?.ENG_Rate ?? 0) + '%', validate: [(v) => ({ isValid: !v || this.ratePtn.test(v), errorMessage: ['比率格式不正確'] })] },
    { field: 'ENG_Remark', header: '備註', type: 'input' },
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

    if (this.isFormCreateable) {
      this.service.ASS21020Data.set([]);
      this.service.engTypeSignal.set([]);
      this.service.engMeterNoSignal.set([]);
    }

    this.service.loadEngType();
    this.service.loadEngMeterNo();

    this.logger.debug(`init:`, [this.rowdata, this.dataForm.value]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      this.tb()!.dt.value = this.tb()!.dt.value.filter(i => !i.Apply_No?.startsWith('temp'));

      const total = this.filteredData().map(v => v.ENG_Rate).reduce((a, b) => a + (b ?? 0), 0);
      if (total > 100) {
        this.messageService.errorBubble('總比率不能大於100%', '提交失敗');
        return void (this.loading = !1);
      }

      const payload = this.filteredData().map<ASS21020Update>(i => ({
        ENG_Type: this.df().ENG_Type.value!,
        ENG_MeterNo: this.df().ENG_MeterNo.value!,
        TLT_No: i.TLT_No,
        ENG_Rate: i.ENG_Rate,
        ENG_Remark: i.ENG_Remark,
      }));
      this.service.updateASS21020(payload).pipe(
        finalize(() => {
          this.loading = !1;
          this.logger.debug(`onSubmit:`, [this.dataForm.value, payload]);
        }),
        tap(res => {
          const stat = CRUDStatus.Create === this.crudstatus ? '新增' : '更新';
          if (!res.IsUpdateSuccess) return this.messageService.errorBubble(res.ErrorMsg, `${stat}失敗`);
          this.onCancel();
          this.messageService.successBubble(`${stat}成功`);
          this.service.loadASS21020({ ENG_MeterNo: this.df().ENG_MeterNo.value! });
        })).subscribe();
    });
  }

  public onClear(): void {
    this.dataForm.reset();
    this.tableDataSignal.set([]);
    if (this.tb()) this.tb()!.rowEditing = !1;
  }

  public onKancel(): void {
    this.logger.debug(`onKancel:`, [this.editingRow, this.tb()!.dt.value]);
    this.tb()!.dt.value = this.tb()!.dt.value.filter(i => !i.Apply_No?.startsWith('temp'));
    this.tableDataSignal.set(this.tb()!.dt.value);
  }

  public onRowEdit(event: RowEditSaveEvent): void {
    this.tableDataSignal.set([...event.data]);
    this.loading = !1;
    this.editingRow = void 0;
    this.logger.debug(`onRowEdit:`, [event]);
  }

  public onAutoCalculate(): void {
    const data = this.filteredData();
    const current = this.tableDataSignal();
    const totalSize = data.reduce((a, b) => (a ?? 0) + (b.NET_SPACE ?? 0), 0) ?? 0;
    if (!totalSize || !current?.length) return;

    const map = this.tltByFlagMap();
    const updated = current.map(d => ({
      ...d,
      ENG_Rate: Math.round(((map.get(d.TLT_No)?.NET_SPACE ?? 0) / totalSize) * 10000) / 100
    }));
    this.tableDataSignal.set(updated);
    this.logger.debug('onAutoCalculate:', [data, totalSize, current]);
  }

  public onFieldChange(event: FieldChangeEvent): void {
    const current = this.tltByFlagMap().get(event.rowData.TLT_No);
    this.logger.debug(`onFieldChange:`, [event, current]);
    if (!current) return;
    this.editingRow = current;

    // 檢查總比率是否超過 100%
    if (event.field === 'ENG_Rate') {
      const currentData = this.filteredData();
      const total = currentData.reduce((sum, item) => {
        const rate = item.TLT_No === event.rowData.TLT_No ? (event.value ?? 0) : (item.ENG_Rate ?? 0);
        return sum + rate;
      }, 0);

      if (total > 100) {
        this.messageService.errorBubble(`總比率不能超過 100%（目前：${total}%）`, '輸入有誤');
        this.editingRow.ENG_Rate = 0;
        this.rowEditCanSaveSignal.set(!1);
        return;
      }
      this.rowEditCanSaveSignal.set(!0);
    }
    this.logger.debug('onFieldChange:', [event, current, this.filteredData()]);
  }

  public onDelete(event: ASS21020Detail | ASS21020Detail[]): void {
    event = Array.isArray(event) ? event : [event];
    this.tb()!.dt.value = this.tb()!.dt.value.filter(i => !event.includes(i));
    this.tableDataSignal.set(this.tb()!.dt.value);
    this.logger.debug('onDelete:', [event, this.tableDataSignal()]);
  }
}
