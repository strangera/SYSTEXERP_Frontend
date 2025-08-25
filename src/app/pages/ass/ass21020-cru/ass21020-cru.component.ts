
import { NgIf } from '@angular/common';
import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21020Service } from '@service/api/ass/ass21020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { FileSelectEvent } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';

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
    ENG_MeterNo: new FormControl<string | undefined>(void 0),
    Location_No: new FormControl<string | undefined>(void 0),
    floor_no: new FormControl<string | undefined>(void 0),
    floor_name: new FormControl<string | undefined>(void 0),
    floor_cat_no: new FormControl<string | undefined>(void 0),
    floor_cat_name: new FormControl<string | undefined>(void 0),
    x_coord: new FormControl<string | undefined>(void 0),
    y_coord: new FormControl<string | undefined>(void 0),
  });
  public readonly df = computed(() => this.dataForm.controls);

  private readonly dfSignal = toSignal(this.dataForm.valueChanges);
  private readonly meterNoSignal = toSignal(this.df().ENG_MeterNo.valueChanges);

  public readonly meterNoEffect = effect(() => {
    const meterNo = this.meterNoSignal();
    if (!meterNo) return;
    this.service.loadASS21020({ ENG_MeterNo: meterNo || '' });
  });

  public readonly columns: Column[] = [
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '專櫃名稱', disabled: () => !0 },
    { field: 'Location_No', header: '位置編號', disabled: () => !0 },
    { field: 'business_area', header: '營業面積', disabled: () => !0 },
    { field: 'ratio', header: '比率', type: 'inputNumber' },
    { field: 'remark', header: '備註', type: 'input' },
  ];

  constructor(
    public readonly service: ASS21020Service,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('ASS21010', this.dataForm);

    this.service.loadEngType();
    this.service.loadEngMeterNo();
    this.service.loadLocationNo();
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

    //   console.log(`importExcel:`, [event, this.tltTableFiltered]);
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
    // console.log(`onExportExcel:`, [wb, ws]);
    // // 將工作表加入工作簿
    // XLSX.utils.book_append_sheet(wb, ws, '專櫃範本');
    // // 生成並下載檔案
    // XLSX.writeFile(wb, `專櫃範本_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const payload = {};


      this.loading = !1;
    });
  }

  public onClear(): void {
    this.dataForm.reset();
  }
}
