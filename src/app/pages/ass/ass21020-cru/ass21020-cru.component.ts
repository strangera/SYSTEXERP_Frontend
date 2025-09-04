import { NgIf } from '@angular/common';
import { Component, computed, effect, OnInit, viewChild } from '@angular/core';
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
    return [];
  });

  public readonly totalRecords = computed(() => this.service.tltNoSignal().length);
  private readonly getTltList = computed(() => this.service.tltNoListSignal());

  public readonly meterNoEffect = effect(() => {
    const meterNo = this.meterNoSignal();
    const type = this.engTypeSignal();
    if (!meterNo?.length || !type) return;
    const selected = this.service.engMeterNoMap.get(meterNo);
    selected && this.service.queryTltByFlag(meterNo);
    this.dataForm.patchValue({
      Location_No: selected?.Location_No || void 0,
      floor_no: selected?.Floor_No || void 0,
      floor_name: selected?.Floor_Desc || void 0,
      Building_No: selected?.building_No || void 0,
      Building_Name: selected?.building_DESC || void 0,
      x_coord: selected?.Draw_X || void 0,
      y_coord: selected?.Draw_Y || void 0,
    });

    this.service.loadASS21020;

    // const current = this.service.tltByFlagMap.get(meterNo);
    // current && this.df().ENG_Type.patchValue(current as EngType);
    // this.service.loadASS21020({
    //   EngTypes: current,
    //   ENG_MeterNo: meterNo,
    //   // Location_No: selected?.Location_No || void 0,
    //   Mid: Number(this.user.mid),
    //   SYS_StoreNo: this.user.SYS_StoreNo,
    // });
    this.logger.debug(`meterNoEffect:`, [meterNo, type, this.user]);
  }, { allowSignalWrites: !0 });

  public readonly dfEffect = effect(() => {
    // 處理編輯狀態bug
    this.logger.debug(`dfEffect:`, [this.dfChange(), this.tb()]);
    if ('object' !== typeof this.tb()) return;
    this.tb()!.rowEditing = !1;
    this.tb()!.dt.cancelRowEdit(this.filteredData());
  });

  public readonly columns: Column[] = [
    { field: 'TLT_No', header: '專櫃編號/名稱', type: 'dropdown', options: () => this.getTltList(), optionLabel: 'Name', optionValue: 'No', required: !0 },
    { field: 'Location_No', header: '位置編號' },
    { field: 'NET_SPACE', header: '營業面積' },
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
      this.service.queryTltByFlag(this.rowdata!.ENG_MeterNo);
    }

    this.service.loadEngType();
    this.service.loadEngMeterNo();

    this.logger.debug(`init:`, [this.rowdata, this.dataForm.value]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
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

  }

  public onRowEditSave(event: RowEditSaveEvent): void {
    this.service.tltNoSignal.set(event.data);
    this.loading = !1;
    this.logger.debug(`onRowEditSave:`, [event]);
  }

  public onAutoCalculate(): void {
    const data = this.filteredData();
    const totalSize = data.map(v => v.NET_SPACE).reduce((a, b) => a + (b ?? 0), 0);

    this.service.tltNoSignal.set(data);
    this.service.tltNoSignal.update(list =>
      list.map(data => ({
        ...data,
        ENG_Rate: totalSize ? Math.round((data.NET_SPACE ?? 0) / totalSize * 10000) / 100 : 0
      }))
    );

    this.logger.debug(`onAutoCalculate:`, [data, totalSize]);
  }

  public onFieldChange(event: FieldChangeEvent): void {
    this.logger.debug(`onFieldChange:`, [event]);
    const current = this.service.tltByFlagMap.get(event.rowData.TLT_No);
    if (!current) return;
    if ('ENG_Rate' === event.field) {
      this.logger.debug('on ENG_Rate Change:', [event, current, this.tb()]);
      return;
    }
  }

  public onDelete(e: any): void {
    this.logger.debug('onDelete:', [e]);
    // 由於 filteredData 現在是 computed，需要更新底層資料源
    const updatedData = this.service.tltNoSignal().filter(item => item !== e);
    this.service.tltNoSignal.set(updatedData);
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
