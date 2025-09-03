import { NgIf } from '@angular/common';
import { Component, computed, effect, OnInit } from '@angular/core';
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
import { Column, RowEditSaveEvent } from '@shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';
import { finalize, tap } from 'rxjs';
import { ASS2100ENGMeterType } from '../ass21010/ass21010.model';
import { ASS21020CRUTable, ASS21020Data, ASS21020Update } from '../ass21020/ass21020.model';

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
  public readonly CRUDStatus = CRUDStatus;
  public tableEditing = !1;
  private readonly ratePtn = /^(100|[1-9]?[0-9])(\.[0-9]{1,2})?$/;

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
  private readonly dfChange = toSignal(this.dataForm.valueChanges);

  private readonly engTypeSignal = toSignal(this.df().ENG_Type.valueChanges);
  private readonly meterNoSignal = toSignal(this.df().ENG_MeterNo.valueChanges);

  /** 根據工程類型篩選的電錶編號清單 */
  public readonly filteredMeterNo = computed<ASS2100ENGMeterType[]>(() => {
    const engType = this.engTypeSignal();
    const allMeterNo = this.service.engMeterNoSignal();

    if (!engType) return allMeterNo;

    const engTypeMap = new Map<string, boolean>();

    for (const type of this.service.engTypeSignal()) {
      if (engType === type.No) engTypeMap.set(type.Name, true);
    }

    return allMeterNo.filter(meter => engTypeMap.has(meter.ENG_Type));
  });
  public readonly filteredData = computed<ASS21020CRUTable[]>(() => {
    if (this.isFormCreateable) return [];

    return this.service.tltNoSignal().map(item => ({
      ...item,
      ENG_Rate: item.ENG_Rate ?? (this.rowdata?.Details?.find(d => d.TLT_No === item.TLT_No)?.ENG_Rate || 0),
      ENG_Remark: item.ENG_Remark ?? (this.rowdata?.Details?.find(d => d.TLT_No === item.TLT_No)?.ENG_Remark || ''),
    }));
  });

  public readonly totalRecords = computed(() => this.service.tltNoSignal().length);
  private readonly getTltList = computed(() => this.service.tltNoListSignal());
  private readonly getLocList = computed(() => this.service.locationSignal());

  public readonly meterNoEffect = effect(() => {
    const meterNo = this.meterNoSignal();
    if (!meterNo?.length) return;
    const selected = this.service.engMeterNoMap.get(meterNo);
    // selected && this.service.loadASS21020(selected);
    selected && this.service.queryTltByFlag(meterNo);
    selected && this.service.loadLocationNo(meterNo);
    this.dataForm.patchValue({
      Location_No: selected?.Location_No || void 0,
      floor_no: selected?.Floor_No || void 0,
      floor_name: selected?.Floor_Desc || void 0,
      Building_No: selected?.building_No || void 0,
      Building_Name: selected?.building_DESC || void 0,
      x_coord: selected?.Draw_X || void 0,
      y_coord: selected?.Draw_Y || void 0,
    });

    if (this.engTypeSignal()?.length) return;
    const type = this.service.engMeterNoMap.get(meterNo)?.ENG_Type;
    const current = this.service.engTypeSignal().find(t => t.Name === type);
    current && this.df().ENG_Type.patchValue(current.No as EngType);
    this.logger.debug(`meterNoEffect:`, [meterNo, selected]);
  }, { allowSignalWrites: !0 });

  public readonly dfEffect = effect(() => {
    this.logger.debug(`dfEffect:`, [this.dfChange()]);
  });

  public readonly columns: Column[] = [
    { field: 'TLT_No', header: '專櫃編號/名稱', type: 'dropdown', options: () => this.getTltList(), optionLabel: 'Name', optionValue: 'No', required: !0 },
    { field: 'Location_No', header: '位置編號', type: 'dropdown', options: () => this.getLocList(), optionLabel: 'Name', optionValue: 'No', required: !0 },
    { field: 'NET_SPACE', header: '營業面積', type: 'inputNumber', required: !0 },
    { field: 'ENG_Rate', header: '比率', type: 'inputNumber', format: v => v + '%', validate: [(v) => ({ isValid: !v || this.ratePtn.test(v), errorMessage: ['比率格式不正確'] })] },
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

    if (!this.isFormCreateable) {
      const fixedEngType: EngType | undefined = this.service.engTypeSignal().find(t => t.Name === this.rowdata!.ENG_Type)?.No as EngType;
      this.df().ENG_Type.setValue(fixedEngType);
    }

    this.service.loadEngType();
    this.service.loadEngMeterNo();

    this.logger.debug(`init:`, [this.rowdata, this.formTitle, this.dataForm.value]);
  }

  public onRowEditInit(event: any): void {
    this.logger.debug(`onRowEditInit:`, [event]);
    this.tableEditing = !0;
    if (!this.df().ENG_MeterNo.value) return;
  }

  public onRowEdit(event: RowEditSaveEvent): void {
    if (Object.is(event.newData, event.oldData)) return;
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const payload = this.filteredData().map<ASS21020Update>(i => ({
        ENG_Type: this.service.engTypeSignal().find(f => this.df().ENG_Type.value === f.Name)?.No!,
        ENG_MeterNo: this.df().ENG_MeterNo.value!,
        TLT_No: i.TLT_No,
        ENG_Rate: i.ENG_Rate,
        ENG_Remark: i.ENG_Remark,
      }));
      this.service.updateASS21020(payload).pipe(
        finalize(() => {
          this.loading = !1;
          this.logger.debug(`onSubmit:`, [this.dataForm, payload]);
        }),
        tap(res => {
          const stat = CRUDStatus.Create === this.crudstatus ? '新增' : '更新';
          if (!res.IsUpdateSuccess) return this.messageService.errorBubble(res.ErrorMsg, `${stat}失敗`);
          this.onCancel();
          this.tableEditing = !1;
          this.messageService.successBubble(`${stat}成功`);
          this.service.loadASS21020({ ENG_MeterNo: this.df().ENG_MeterNo.value! });
        })).subscribe();
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

  public onAutoCalculate(): void {
    const data = this.filteredData();
    const totalSize = data.map(v => v.NET_SPACE).reduce((a, b) => a + (b ?? 0), 0);

    const updatedData = data.map(item => ({
      ...item,
      ENG_Rate: totalSize ? Math.round((item.NET_SPACE ?? 0) / totalSize * 10000) / 100 : 0
    }));

    const updatedTltData = this.service.tltNoSignal().map(tltItem => {
      const found = updatedData.find(updated => updated.Apply_No === tltItem.Apply_No);
      return found ? { ...tltItem, ENG_Rate: found.ENG_Rate } : tltItem;
    });

    this.service.tltNoSignal.set(updatedTltData);

    this.logger.debug(`onAutoCalculate:`, [data, totalSize, updatedData]);
  }

  public onDelete(e: any): void {
    this.logger.debug('onDelete:', [e]);
    // 由於 filteredData 現在是 computed，需要更新底層資料源
    const updatedData = this.service.tltNoSignal().filter(item => item !== e);
    this.service.tltNoSignal.set(updatedData);
  }

  private customInit(): void {
    this.ProgNo = 'ASS21020';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.formLabelService.clearLabels();
    this.currentPageService.setCurrentProgNo(this.ProgNo);

    const state = this.router.lastSuccessfulNavigation?.extras.state;
    const { crudstatus, rowdata } = state?.['crudstatus'] || {};
    this.previousRoute = state?.['fromRoute'] || this.activatedRoute.snapshot.queryParams['fromRoute'] || document.referrer || '/account/dashboard';
    this.rowdata = CRUDStatus.Create ? void 0 : state?.['rowdata'];
    this.crudstatus = crudstatus || CRUDStatus.Create;

    const statusMap = {
      [CRUDStatus.Create]: () => {
        this.formTitle = '新增資訊';
      },
      [CRUDStatus.Edit]: () => {
        this.formTitle = '編輯資料';
        this.dataForm?.patchValue(rowdata);
      },
      [CRUDStatus.Read]: () => {
        this.formTitle = '顯示資料';
        this.dataForm?.patchValue(rowdata);
        this.dataForm?.disable();
      },
      [CRUDStatus.Delete]: () => {
        return;
      }
    };

    statusMap[this.crudstatus]();
  }
}
