
import { NgIf } from '@angular/common';
import { Component, computed, effect, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
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
import { FileSelectEvent } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
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
    ENG_MeterNo: new FormControl<string | undefined>(void 0, [Validators.required]),
    Location_No: new FormControl<string | undefined>(void 0),
    floor_no: new FormControl<string | undefined>(void 0),
    floor_name: new FormControl<string | undefined>(void 0),
    floor_cat_no: new FormControl<string | undefined>(void 0),
    floor_cat_name: new FormControl<string | undefined>(void 0),
    x_coord: new FormControl<string | undefined>(void 0),
    y_coord: new FormControl<string | undefined>(void 0),
    ...createPaginationConfig([{ field: 'TLT_No', order: 1 }])
  });
  public readonly df = computed(() => this.dataForm.controls);

  private readonly meterNoSignal = toSignal(this.df().ENG_MeterNo.valueChanges);

  private readonly rateValidate = /^(100|[1-9]?[0-9])(\.[0-9]{1,2})?$/;

  public readonly totalRecords = computed(() => [].length);
  private readonly getTltList = computed(() => this.service.tltNoSignal().map(i => ({ No: i.TLT_No, Name: i.TLT_Name })));
  private readonly getLocList = computed(() => this.service.locationSignal());

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
      floor_cat_no: selected?.building_No || void 0,
      floor_cat_name: selected?.building_DESC || void 0,
      x_coord: selected?.Draw_X || void 0,
      y_coord: selected?.Draw_Y || void 0,
    });
    this.logger.debug(`meterNoEffect:`, [meterNo, selected, this.service.engMeterNoMap.entries(), this.dataForm.value]);
  });

  public readonly columns: Column[] = [
    { field: 'TLT_Name', header: '專櫃名稱', type: 'dropdown', options: () => this.getTltList(), optionLabel: 'Name', optionValue: 'No', required: !0 },
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

    this.service.loadEngMeterNo();
  }

  public onSelectionChange(selected: any[]): void {
    this.logger.debug(`onSelectionChange:`, [selected]);
  }

  public onRowEditInit(event: any): void {
    this.logger.debug(`onRowEditInit:`, [event]);
    this.service.loadEngType();
    this.service.loadLocationNo();
  }

  public onRowEdit(event: RowEditSaveEvent): void {
    if (Object.is(event.newData, event.oldData)) return;

    const filterNonDates = (obj: any) => Object.fromEntries(
      Object.entries(obj).filter(([, value]) => !(value instanceof Date))
    );

    if (JSON.stringify(filterNonDates(event.newData)) === JSON.stringify(filterNonDates(event.oldData))) return;

    this.loading = !0;
    const m = this.service.engMeterNoMap.get(this.meterNoSignal()!);
    const t = event.newData;
    const isNewRow = !this.service.ASS21020Data().some(item => item.TLT_No === t.TLT_No);
    this.logger.debug(`onRowEdit:`, [event, m, t, 'isNewRow:', isNewRow]);

    if (!m) return this.messageService.errorBubble('請選擇錶號', '更新失敗');
    const payload: ASS21020Payload = {
      ID: String(m.Id),
      ENG_Type: m.ENG_Type,
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
      if (!res.IsUpdateSuccess) {
        if (isNewRow) {
          const currentData = this.service.tltNoSignal();
          const filteredData = currentData.filter(item => item.TLT_No !== t.TLT_No);
          this.service.tltNoSignal.set(filteredData);
        }
        return this.messageService.errorBubble(res.ErrorMsg, `${stat}失敗`);
      }
      this.onCancel();
      this.messageService.successBubble(`${stat}成功`);
      this.service.loadASS21020({ ENG_MeterNo: m.ENG_MeterNo });
    });
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      this.loading = !1;
      const payload = <ASS21020Payload>{
        ENG_MeterNo: this.df().ENG_MeterNo.value,
        Location_No: this.df().Location_No.value,
        floor_no: this.df().floor_no.value,
        floor_name: this.df().floor_name.value,
        floor_cat_no: this.df().floor_cat_no.value,
        floor_cat_name: this.df().floor_cat_name.value,
        x_coord: this.df().x_coord.value,
        y_coord: this.df().y_coord.value,
      };
      this.service.updateASS21020(payload).pipe(finalize(() => {
        this.loading = !1;
        this.logger.debug(`onSubmit:`, [this.dataForm, payload]);
      })).subscribe(res => {
        if (!res.IsUpdateSuccess) return this.messageService.errorBubble(res.ErrorMsg, '新增失敗');
        this.onCancel();
        this.messageService.successBubble(`新增成功`);
      });
    });
  }

  public onClear(): void {
    this.service.tltNoSignal.set([]);
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

  /** 處理 excel 匯入 */
  public async onImportExcel(event: FileSelectEvent): Promise<void> {
    // try {
    //   const file = event.files?.[0];
    //   if (!file) return;

    //   // 使用中文欄位名稱匯入，然後手動對應到資料欄位
    //   const rawData = await this.excelImport.importExcel(file, ['專櫃編號', '專櫃名稱']);

    //   // 將中文欄位對應到資料欄位
    //   const data: TltItem[] = rawData.map((item: any) => ({
    //     ...item,
    //     tlt_no: item['專櫃編號'] || '',
    //     tlt_name: item['專櫃名稱'] || '',
    //     Status: ItemOperationStatus.New
    //   }));

    //   const importedTltNos = data.filter(i => i.tlt_no?.trim() && i.tlt_name?.trim());
    //   if (!importedTltNos.length) return void this.messageService.errorBubble('匯入檔案沒有有效資料');

    //   const existingSet = new Set(this.tltTableFiltered().map(i => i.tlt_no));
    //   const merged = new Map<string, TltItem>(this.tltTableFiltered().map(i => [i.tlt_no, { ...i, Status: ItemOperationStatus.Original }]));

    //   let newCount = 0;
    //   for (const item of importedTltNos) {
    //     if (!existingSet.has(item.tlt_no)) {
    //       newCount++;
    //       merged.set(item.tlt_no, { ...item, Status: ItemOperationStatus.New });
    //     }
    //   }

    //   this.tltTableFiltered.set(Array.from(merged.values(), (i => ({ ...i, Status: i.Status ?? ItemOperationStatus.Original }))));

    //   this.logger.debug(`importExcel:`, [event, this.tltTableFiltered]);
    //   this.messageService.successBubble(`匯入成功：新增 ${newCount} 筆資料`);
    // } catch (error) {
    //   console.error('Excel 匯入錯誤:', error);
    //   this.messageService.errorBubble('Excel 檔案讀取失敗，請檢查檔案格式');
    // }
  };

  /** 下載範例檔案 */
  public onExportExcel(): void {
    // // 建立工作簿
    // const wb = XLSX.utils.book_new();
    // // 建立工作表
    // const ws = XLSX.utils.aoa_to_sheet([['專櫃編號', '專櫃名稱'],]);
    // this.logger.debug(`onExportExcel:`, [wb, ws]);
    // // 將工作表加入工作簿
    // XLSX.utils.book_append_sheet(wb, ws, '專櫃範本');
    // // 生成並下載檔案
    // XLSX.writeFile(wb, `專櫃範本_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
}
