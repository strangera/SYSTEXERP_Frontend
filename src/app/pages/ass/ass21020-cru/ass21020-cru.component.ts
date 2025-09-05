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
import { finalize, tap } from 'rxjs';
import { ASS2100ENGMeterType } from '../ass21010/ass21010.model';
import { ASS21020CRUTable, ASS21020Data, ASS21020Detail, ASS21020Update, TLTByFlag } from '../ass21020/ass21020.model';

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
  private readonly tableDataSignal = signal<ASS21020Detail[]>([]);

  private editingRow: TLTByFlag | undefined;

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

  public readonly filteredData = computed<ASS21020Detail[]>(() => {
    return this.tableDataSignal().map(detail => {
      const current = this.service.tltByFlagMap.get(detail.TLT_No);
      return {
        ...detail,
        Location_No: current?.Location_No ?? '',
        NET_SPACE: current?.NET_SPACE ?? 0,
      };
    }) || [];
  });

  public readonly totalRecords = computed(() => this.tableDataSignal().length);
  private readonly getTltList = computed(() => this.service.tltNoListSignal());

  public readonly dropdownEffect = effect(() => {
    const type = this.engTypeSignal();
    const mtrNo = this.meterNoSignal();
    const mtrNoData = this.service.engMeterNoMap.get(mtrNo || '');
    this.logger.debug(`dropwnEffect:`, [type, mtrNo, mtrNoData]);
    if (!type && !mtrNo) {
      this.onClear();
      this.tb()!.dt.clear();
      return;
    }
    if (type && mtrNo && (!mtrNoData || this.service.engTypeMap.get(mtrNoData.ENG_Type) !== type)) {
      this.dataForm.patchValue({
        ENG_MeterNo: void 0,
        Location_No: void 0,
        floor_no: void 0,
        floor_name: void 0,
        Building_No: void 0,
        Building_Name: void 0,
        x_coord: void 0,
        y_coord: void 0,
      });
      return;
    }
    if (type && mtrNo && mtrNoData) {
      this.service.queryTltByFlag(mtrNo);
      if (this.crudstatus !== CRUDStatus.Create) this.service.loadASS21020({
        EngTypes: type,
        ENG_MeterNo: mtrNo,
        Location_No: this.dataForm.controls.Location_No.value!,
        Mid: Number(this.user.mid),
        SYS_StoreNo: this.user.SYS_StoreNo,
      });
    }
  }, { allowSignalWrites: !0 });

  public readonly initEffect = effect(() => {
    if (this.isFormCreateable) return void (this.initEffect.destroy());
    const rowData = this.rowdata;
    const type = this.service.engTypeSignal();
    const mtrNo = this.service.engMeterNoSignal();
    const data = this.service.ASS21020Data().find(v => v.ENG_MeterNo === rowData?.ENG_MeterNo)?.Details;
    if (type?.length && mtrNo?.length && data?.length && rowData) {
      const fixedEngType = type.find(t => t.Name === rowData.ENG_Type)?.No as EngType;
      this.df().ENG_Type.setValue(fixedEngType);
      this.df().ENG_MeterNo.setValue(rowData.ENG_MeterNo);
      this.tableDataSignal.set(data);
      this.initEffect.destroy();
    }
  }, { allowSignalWrites: !0 });

  public readonly dfEffect = effect(() => {
    // 處理編輯狀態bug
    this.logger.debug(`dfEffect:`, [this.dfChange(), this.tb()]);
    if ('object' !== typeof this.tb()) return;
    this.tb()!.rowEditing = !1;
    // this.tb()!.dt.cancelRowEdit(this.filteredData());
  });

  public readonly columns: Column[] = [
    { field: 'TLT_No', header: '專櫃編號/名稱', type: 'dropdown', options: () => this.getTltList(), optionLabel: 'Name', optionValue: 'No', required: !0 },
    { field: 'Location_No', header: '位置編號', format: v => v ?? this.editingRow?.Location_No },
    { field: 'NET_SPACE', header: '營業面積', format: v => v ?? this.editingRow?.NET_SPACE },
    { field: 'ENG_Rate', header: '比率', type: 'inputNumber', format: v => (v ?? this.editingRow?.ENG_Rate) + '%', validate: [(v) => ({ isValid: !v || this.ratePtn.test(v), errorMessage: ['比率格式不正確'] })] },
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
      this.tb()!.dt.cancelRowEdit(this.filteredData());
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
  }

  public onRowEdit(event: RowEditSaveEvent): void {
    this.tableDataSignal.set(event.data);
    this.loading = !1;
    this.editingRow = void 0;
    this.logger.debug(`onRowEdit:`, [event]);
  }

  public onAutoCalculate(): void {
    const data = this.filteredData();
    const current = this.tableDataSignal();
    const totalSize = data.map(v => v.NET_SPACE).reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0;
    if (totalSize === 0) return;

    this.logger.debug(`onAutoCalculate:`, [data, totalSize, current]);
    if (!current?.length) return;
    const updatedDetails = current.map(detail => ({
      ...detail,
      ENG_Rate: Math.round((this.service.tltByFlagMap.get(detail.TLT_No)?.NET_SPACE ?? 0) / totalSize * 10000) / 100
    }));
    this.tableDataSignal.set(updatedDetails);
  }

  public onFieldChange(event: FieldChangeEvent): void {
    const current = this.service.tltByFlagMap.get(event.rowData.TLT_No);
    this.logger.debug(`onFieldChange:`, [event, current]);
    if (!current) return;
    this.editingRow = current;

    // 檢查總比率是否超過 100%
    if ('ENG_Rate' === event.field) {
      const currentData = this.filteredData();
      const total: number = currentData.reduce((sum, item) => {
        const rate: number = item.TLT_No === event.rowData.TLT_No ? (event.value ?? 0) : (item.ENG_Rate ?? 0);
        return sum + rate;
      }, 0);

      if (total > 100) {
        this.messageService.errorBubble(`總比率不能超過 100%（目前：${total}%）`, '輸入有誤');
        this.editingRow.ENG_Rate = 0;
        return;
      }
    }
    this.logger.debug('onFieldChange:', [event, current, this.filteredData()]);
  }

  public onDelete(e: any): void {
    this.logger.debug('onDelete:', [e]);
    const updatedData = this.service.ASS21020Data().filter(item => item !== e);
    this.service.ASS21020Data.set(updatedData);
  };

  /**
   * 可能可以解決create 時的bug
   * - 當前一頁有選項時，會被錯誤帶進來，導致選項被verified
   */
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
        // 跟原本的差異是這邊 拿掉dataForm binding
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
