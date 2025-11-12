import { Component, computed, effect, OnInit, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21020Service } from '@service/api/ass/ass21020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';
import { skip, tap } from 'rxjs';
import { ASS2100ENGMeterType, EngType } from '../ass21010/ass21010.model';
import { ASS21020Data, ASS21020Detail } from '../ass21020/ass21020.model';

@Component({
  selector: 'app-ass21020-cru',
  templateUrl: './ass21020-cru.component.html',
  styleUrl: './ass21020-cru.component.scss',
  standalone: !0,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    PanelModule,
    FormsModule,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TableEditComponent,
  ]
})
export class ASS21020CRUComponent extends BasicCruPageComponent<ASS21020Data> implements OnInit {
  public readonly CRUDStatus = CRUDStatus;
  private readonly ratePtn = /^(100|[1-9]?[0-9])(\.[0-9]{1,2})?$/;

  public readonly dataForm = this.formBuilder.nonNullable.group({
    ENG_Type: new FormControl<EngType>(EngType.水, [Validators.required]),
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

  private readonly engTypeSignal = toSignal(this.df().ENG_Type.valueChanges);
  private readonly meterNoSignal = toSignal(this.df().ENG_MeterNo.valueChanges);

  public readonly tableData = signal<ASS21020Detail[]>([]);

  /** 根據能源類型篩選的錶號清單 */
  public readonly filteredMeterNo = computed<ASS2100ENGMeterType[]>(() => {
    const engType = this.engTypeSignal() ?? void 0;
    const typeValue = engType && this.service.engTypeMap.get(engType);
    const options = this.service.engMeterNoOptions();
    this.logger.debug(`filteredMeterNo:`, [engType, typeValue, options]);

    if (!typeValue || !options.length) return options;
    return options.filter(o => EngType[o.ENG_Type] === typeValue);
  });

  /** 驗證和存檔控制 */
  public readonly canSave = computed(() => {
    const data = this.tableData();
    if (!this.dataForm.valid || !data.length) return !1;

    const validData = data.filter(item => item.TLT_No && item.ENG_Rate != null);
    if (!validData.length) return !1;

    return this.isTableDataComplete(validData) && this.calculateTotalRate(validData) === 100;
  });

  /** 能源類型改變時,清空錶號 */
  public readonly meterTypeEffect = effect(() => {
    untracked(() => this.df().ENG_MeterNo.setValue(void this.engTypeSignal()));
  }, { allowSignalWrites: !0 });

  /** 錶號改變時帶出位置資訊與專櫃清單 */
  public readonly meterNoEffect = effect(() => {
    const meterNo = this.meterNoSignal();
    const engMeterOptions = this.service.engMeterNoOptions();
    if (!meterNo || !engMeterOptions.length) return;

    const data = this.service.engMeterNoMap().get(meterNo);
    if (data) untracked(() => {
      this.dataForm.patchValue({
        Location_No: data.Location_No,
        floor_no: data.Floor_No,
        floor_name: data.Floor_Desc,
        Building_No: data.building_No,
        Building_Name: data.building_DESC,
        x_coord: data.Draw_X,
        y_coord: data.Draw_Y,
      });
    });

    this.logger.debug(`meterNoEffect:`, [meterNo, data]);
    this.service.getTltByFlags(meterNo, +this.user.mid);
  }, { allowSignalWrites: !0 });

  /** 同步後端資料到表格 */
  public readonly tableDataEffect = effect(() => {
    const data = this.service.ASS21020Data();
    const meterNo = this.df().ENG_MeterNo.value;
    if (!data.length || !meterNo) return;

    const matched = data.find(v => v.ENG_MeterNo === meterNo);
    if (matched?.Details) this.tableData.set(matched.Details);
  }, { allowSignalWrites: !0 });

  /** 整合所有載入中狀態 */
  public readonly loadingEffect = effect(() => {
    this.loading = this.service.tableLoading()
      || this.service.engMeterNoLoading()
      || this.service.tltByFlagLoading();
  });

  public readonly columns: EditColumn[] = [
    {
      field: 'TLT_No',
      header: '專櫃編號/名稱',
      type: 'dropdown',
      showClear: !1,
      options: () => this.service.tltNoOptions().map(({ TLT_No, TLT_Name }) => ({
        No: TLT_No,
        Name: `${TLT_No} - ${TLT_Name}`
      })),
      optionLabel: 'Name',
      optionValue: 'No',
      calculate: (row) => {
        if (!row.TLT_No) return {};
        const mapData = this.service.tltByFlagMap().get(row.TLT_No);
        return {
          Location_No: mapData?.Location_No || '',
          NET_SPACE: mapData?.NET_SPACE || 0,
        };
      },
      // validate: [this.validateTltNo.bind(this)],
    },
    {
      field: 'Location_No',
      header: '位置編號',
    },
    {
      field: 'NET_SPACE',
      header: '營業面積',
    },
    {
      field: 'ENG_Rate',
      header: '比率',
      type: 'inputNumber',
      min: 0,
      max: 100,
      maxFractionDigits: 2,
      validate: [this.validateEngRate.bind(this)],
    },
    {
      field: 'ENG_Remark',
      header: '備註',
      type: 'input',
      maxLength: 200,
    },
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

    this.service.getEngMeterNos();

    if (this.isFormCreateable || !this.rowdata?.ENG_MeterNo) return;
    this.service.loadASS21020({ ENG_MeterNo: this.rowdata.ENG_MeterNo }).pipe(
      tap(res => {
        if (res.Status === '0000' && res.Data.length) {
          const data = res.Data[0];
          this.dataForm.patchValue({
            ENG_Type: this.service.engTypeMap.get(data.ENG_Type),
            ENG_MeterNo: data.ENG_MeterNo
          });
          this.tableData.set(data.Details);
        }
      })
    ).subscribe();
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const payload = this.tableData()
        .filter(item => !item._isAutoInsertCandidate)
        .map(item => ({
          ENG_Type: this.df().ENG_Type.value!,
          ENG_MeterNo: this.df().ENG_MeterNo.value!,
          TLT_No: item.TLT_No,
          ENG_Rate: item.ENG_Rate,
          ENG_Remark: item.ENG_Remark,
        }));

      this.logger.debug(`onSubmit:`, [payload]);

      this.service.updateASS21020(payload).pipe(
        tap(({ Status }) => Status === '0000' && this.onCancel())
      ).subscribe({
        next: () => this.messageService.successBubble('更新成功'),
        error: () => this.messageService.errorBubble('更新失敗'),
      });
    });
  }

  public onDataChange(event: ASS21020Detail[]): void {
    this.tableData.set(event);
    this.logger.debug(`onDataChange:`, [event]);
  }

  public onAutoCalculate(): void {
    this.tableData.update(current => {
      const tltMap = this.service.tltByFlagMap();
      if (!current.length) return current;
      this.logger.debug(`onAutoCalculate:`, [current]);

      // 只計算非自動插入候選列的資料
      const validData = current.filter(d => !d._isAutoInsertCandidate);
      const validLen = validData.length;
      if (validLen === 0) return current;

      // 如果只有一筆有效資料，直接給 100%
      if (validLen === 1) {
        return current.map(d => ({
          ...d,
          ENG_Rate: !d._isAutoInsertCandidate ? 100 : d.ENG_Rate
        }));
      }

      // 單次遍歷預先取出各筆面積，並同時計算總有效面積（>0 才計入）
      const netSpaces: number[] = new Array(validLen);
      let totalSpace = 0;
      const positiveIdx: number[] = [];
      for (let i = 0; i < validLen; i++) {
        const ns = tltMap.get(validData[i].TLT_No)?.NET_SPACE || 0;
        netSpaces[i] = ns;
        if (ns > 0) { totalSpace += ns; positiveIdx.push(i); }
      }

      // 如果沒有有效面積，平均分攤（以基點 1e4 為單位確保總和精確為 100）
      if (totalSpace === 0) {
        const quotient = Math.floor(1e4 / validLen);
        const remainder = 1e4 % validLen;
        let validIdx = 0;
        return current.map(d => {
          if (d._isAutoInsertCandidate) return d;
          const rate = (quotient + (validIdx < remainder ? 1 : 0)) / 100;
          validIdx++;
          return { ...d, ENG_Rate: rate };
        });
      }

      // 按面積比例分攤（僅在有效面積項目間分攤；無效者給 0）
      // 使用基點法避免四捨五入造成總和非 100 的問題
      let assignedBp = 0;
      const lastPosIdx = positiveIdx[positiveIdx.length - 1];
      let validIdx = 0;
      return current.map(d => {
        if (d._isAutoInsertCandidate) return d;
        const ns = netSpaces[validIdx];
        if (ns <= 0) { validIdx++; return { ...d, ENG_Rate: 0 }; }

        // 最後一個有效索引承接剩餘基點,確保總和精確 10000（=100%）
        let bp: number;
        if (validIdx !== lastPosIdx) { bp = Math.floor((ns * 1e4) / totalSpace); assignedBp += bp; }
        else { bp = 1e4 - assignedBp; }
        validIdx++;
        return { ...d, ENG_Rate: bp / 100 };
      });
    });
  }

  private validateTltNo(value: string): { isValid: boolean; errorMessage: string[]; } {
    if (value && value.trim() !== '' && this.service.tltByFlagMap().has(value)) {
      return { isValid: !0, errorMessage: [] };
    }
    return { isValid: !1, errorMessage: ['專櫃編號不可為空或無效'] };
  }

  private validateEngRate(value: number): { isValid: boolean; errorMessage: string[]; } {
    if (value == null) return { isValid: !0, errorMessage: [] };
    return {
      isValid: this.ratePtn.test(value.toString()),
      errorMessage: this.ratePtn.test(value.toString()) ? [] : ['比率錯誤']
    };
  }

  private isTableDataComplete(data: ASS21020Detail[]): boolean {
    const tltNoSet = new Set<string>();
    let idx = 0;

    while (idx < data.length) {
      const item = data[idx++];
      const { TLT_No, ENG_Rate } = item;

      if (!TLT_No) return !1;
      if (ENG_Rate == null || typeof ENG_Rate !== 'number' || ENG_Rate < 0 || ENG_Rate > 100) return !1;
      if (tltNoSet.has(TLT_No)) return !1;
      tltNoSet.add(TLT_No);
    }
    return !0;
  }

  private calculateTotalRate(data: ASS21020Detail[]): number {
    return data.reduce((sum, item) => sum + (item.ENG_Rate || 0), 0);
  }
}
