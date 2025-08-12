import { NgIf } from '@angular/common';
import { Component, computed, effect, OnInit, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS26010Service } from '@service/api/tls/tls26010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { CRUDStatus, ItemOperationStatus } from '@shared/models/system/CRUDstatus';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { ExcelImportService } from '@shared/service/excel-import.service';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { finalize, tap } from 'rxjs';
import * as XLSX from 'xlsx';
import { EcrItem, EcrTable, PodRequest, TalentItem, TLS26010Data, TLS26010Detail, TltTable } from '../tls26010/tls26010.model';

// 預購活動檔期設定
@Component({
  selector: 'app-tls26010-cru',
  templateUrl: './tls26010-cru.component.html',
  styleUrl: './tls26010-cru.component.scss',
  standalone: !0,
  imports: [
    NgIf,
    PanelModule,
    TranslateModule,
    ReactiveFormsModule,
    FileUploadModule,
    MenubarComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TableComponent,
    InputTextComponent,
    MultiSelectComponent,
    DropdownComponent,
    DialogComponent,
  ]
})
export class TLS26010CRUComponent extends BasicCruPageComponent<TLS26010Data> implements OnInit {

  public CRUDStatus = CRUDStatus;

  public ecrTableFiltered: EcrItem[] = [];
  public tltTableFiltered: TalentItem[] = [];

  public dialogDataKey: 'ecr_no' | 'talent_id' | '' = '';
  public dialogTableKey: 'TLS26010_ECR' | 'TLS26010_TLT' | '' = '';
  public dialogColumn: Column[] = [];
  public dialogData: (EcrTable | TltTable)[] = [];
  public selectedDialogData: (EcrTable | TltTable)[] = [];

  public dataForm = this.formBuilder.nonNullable.group({
    pod_no: new FormControl<string>('自動給號'), // 預售活動編號
    pod_desc: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]), // 預售名稱
    pod_sdate: new FormControl<Date>(new Date(), Validators.required), // 預售期間(起)
    pod_edate: new FormControl<Date>(this.service.dateE, Validators.required), // 預售期間(迄)
    pod_busdate: new FormControl<Date>(this.service.dateE, Validators.required), // 活動正檔日期
    pod_status: new FormControl<string>('未核准'), // 核准狀態
    ecr_nos: new FormControl<EcrTable[]>([]), // 收銀機清單
    tlt_nos: new FormControl<TltTable[]>([]), // 專櫃清單
    sys3800: new FormControl<string[]>([]), // 館別
    sys3900: new FormControl<string[]>([]), // 樓層
    sys3A00: new FormControl<string[]>([]), // 區域
  });
  public get df() { return this.dataForm.controls; }

  // 變化追蹤
  private readonly sys3800Signal: Signal<string[] | undefined | null> = toSignal(this.df.sys3800.valueChanges);
  private readonly sys3900Signal: Signal<string[] | undefined | null> = toSignal(this.df.sys3900.valueChanges);
  private readonly sys3A00Signal: Signal<string[] | undefined | null> = toSignal(this.df.sys3A00.valueChanges);
  private readonly sdateSignal: Signal<Date | undefined | null> = toSignal(this.df.pod_sdate.valueChanges);
  private readonly edateSignal: Signal<Date | undefined | null> = toSignal(this.df.pod_edate.valueChanges);

  private readonly dialogLoading = signal<boolean>(!1);
  public readonly dialogVisible = signal<'ecr' | 'tlt' | false>(!1);

  // Map用於快速查找
  private readonly ecrDetailMap = new Map<string, EcrItem>();
  private readonly tltDetailMap = new Map<string, TalentItem>();

  /** 核准狀態處理 */
  private readonly podStatusEffect = effect(() => {
    const raw = this.df.pod_status.value;
    const statusSet = new Set(['0', '1', '9']);
    if (!raw) {
      this.df.pod_status.patchValue('未核准', { emitEvent: !1 });
      return;
    }
    const mapped = statusSet.has(raw) ? this.service.approvalStatus(raw) : raw;
    mapped !== raw && this.df.pod_status.patchValue(mapped, { emitEvent: !1 });
  });

  /** 日期檢查 */
  private readonly dateCheckEffect = effect(() => {
    const sdate = this.sdateSignal();
    const edate = this.edateSignal();
    const payload = this.queryPayload();
    if (sdate && edate && sdate > edate) {
      this.df.pod_edate.setErrors({ dateError: !0 });
      this.service.loadPreorderECRList({ ...payload, ecr_type: '1' });
    } else { this.df.pod_edate.setErrors(null); }
  });

  /** 監聽 dialogVisible 狀態，根據不同對話框類型載入相關資料 */
  private readonly dialogOpenEffect = effect(() => {
    const dialogType = this.dialogVisible();
    if (dialogType === 'ecr') {
      const data = this.service.ecrData();
      [this.dialogDataKey, this.dialogTableKey] = ['ecr_no', 'TLS26010_ECR'];
      this.dialogColumn = this.columns3;
      this.dialogData = data;
      this.selectedDialogData = this.df.ecr_nos.value!;
    } else if (dialogType === 'tlt') {
      const data = this.service.tltData();
      [this.dialogDataKey, this.dialogTableKey] = ['talent_id', 'TLS26010_TLT'];
      this.dialogColumn = this.columns4;
      this.dialogData = data;
      this.selectedDialogData = this.df.tlt_nos.value!;
    } else { return; }
    console.log(`dialogOpenEffect:`, [this.dialogData, this.selectedDialogData]);
  });

  private readonly dependcyEffect = effect(() => {
    const dialogType = this.dialogVisible();
    if (!dialogType) return;
    const sys3800 = this.sys3800Signal();
    const sys3900 = this.sys3900Signal();
    const sys3A00 = this.sys3A00Signal();
    if (!sys3800?.length && !sys3900?.length && !sys3A00?.length) return;
    const payload = this.queryPayload();
    dialogType === 'ecr'
      ? this.service.loadPreorderECRList({ ...payload, ecr_type: '1' })
      : this.service.loadTLTTALENT(payload);
  });

  /** 監聽 TLT 資料變化，更新表單值 */
  private readonly TLTTalentEffect = effect(() => {
    const incoming = this.service.tltData();
    if (!incoming?.length) return;
    const picked = new Set(this.tltTableFiltered.map(t => t.tlt_no));
    const map = new Map(incoming.map(t => [t.tlt_no, t] as const));
    const tlt_nos: TltTable[] = [...picked].map(no => map.get(no)).filter(Boolean) as TltTable[];
    this.df.tlt_nos.patchValue(tlt_nos, { emitEvent: !1 });
    console.log(`TLTTalentEffect:`, [this.service.TLTMap, tlt_nos, this.dataForm.value]);
  });

  /** 監聽 ECR 資料變化，更新表單值 */
  private readonly PreorderECREffect = effect(() => {
    const incoming = this.service.ecrData();
    if (!incoming?.length) return;
    const picked = new Set(this.ecrTableFiltered.map(e => e.ecr_no));
    const map = new Map(incoming.map(e => [e.ecr_no, e] as const));
    const ecr_nos: EcrTable[] = [...picked].map(no => map.get(no)).filter(Boolean) as EcrTable[];
    this.df.ecr_nos.patchValue(ecr_nos, { emitEvent: !1 });
    console.log(`PreorderECREffect:`, [this.service.ECRMap, ecr_nos, this.dataForm.value]);
  });

  /** 初始化 ECR & TLT Table資料 */
  private readonly TLS26010DetailEffect = effect(() => {
    const detail = this.service.TLS26010Detail();
    if (!detail) return;
    this.dataForm.patchValue({
      ecr_nos: detail.ecr_list.map(ecr => (<EcrTable>{ ...ecr })),
      tlt_nos: detail.talent_list.map(tlt => (<TltTable>{ ...tlt })),
    });
    this.ecrDetailMap.clear();
    this.tltDetailMap.clear();
    this.ecrTableFiltered = detail.ecr_list;
    this.tltTableFiltered = detail.talent_list;
    for (const ecr of detail.ecr_list) this.ecrDetailMap.set(ecr.ecr_no, ecr);
    for (const tlt of detail.talent_list) this.tltDetailMap.set(tlt.tlt_no, tlt);
    console.log(`TLS26010DetailEffect:`, [this.ecrDetailMap, this.tltDetailMap, this.ecrTableFiltered, this.tltTableFiltered]);
    this.TLS26010DetailEffect.destroy(); // 只需執行一次
  });

  /** 初始化靜態資料 */
  private readonly staticDataEffect = effect(() => {
    const detail = this.service.TLS26010Detail();
    if (!detail) return;
    TLS26010CRUComponent.staticData = detail as TLS26010Detail;
    this.staticDataEffect.destroy(); // 只需執行一次
  });

  private readonly queryPayload = computed(() => ({
    building_nos: this.sys3800Signal() || [],
    floor_nos: this.sys3900Signal() || [],
    area_nos: this.sys3A00Signal() || [],
  }), { equal: this.service.shallowEqual });

  public columns: Column[] = [
    { field: 'ecr_no', header: '收銀機號' },
    { field: 'ecr_name', header: '收銀機名稱' },
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },
  ];

  public columns2: Column[] = [
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },
  ];

  private columns3: Column[] = [
    { field: 'building_name', header: '館別' },
    { field: 'floor_name', header: '樓層' },
    { field: 'area_name', header: '區域' },
    { field: 'ecr_no', header: '收銀機號' },
    { field: 'ecr_name', header: '收銀機名稱' },
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },
  ];

  private columns4: Column[] = [
    { field: 'building_name', header: '館別' },
    { field: 'floor_name', header: '樓層' },
    { field: 'area_name', header: '區域' },
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },
  ];

  // 靜態資料: 用於表單初始化和重置
  private static staticData: TLS26010Detail;

  constructor(
    public service: TLS26010Service,
    private readonly excelImport: ExcelImportService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS26010', this.dataForm);
    this.crudstatus !== CRUDStatus.Create && this.service.loadTLS26010Detail({ pod_no: this.rowdata?.pod_no || '' });
    const payload = this.queryPayload();

    queueMicrotask(() => {
      this.service.loadSYS3800();
      this.service.loadSYS3900();
      this.service.loadSYS3A00();
      this.service.loadPreorderECRList({ ...payload, ecr_type: '1' });
      this.service.loadTLTTALENT(payload);
    });

    // 使用 map + 結構賦值，避免在迴圈中建立暫時物件
    const ecrInit = this.service.ecrData();
    this.ecrTableFiltered = ecrInit.map(({ ecr_no, ecr_name, tlt_no, tlt_name }): EcrItem => ({
      ecr_no, ecr_name, tlt_no, tlt_name, Status: ItemOperationStatus.Original
    }));

    const tltInit = this.service.tltData();
    this.tltTableFiltered = tltInit.map(({ tlt_no, tlt_name }): TalentItem => ({
      tlt_no, tlt_name, Status: ItemOperationStatus.Original
    }));

    console.log(`init ${this.crudstatus}:`, [this.funInfo, this.rowdata, this.dataForm.value, this.service]);
  }

  /** 處理 excel 匯入 */
  public async onImportExcel(event: FileSelectEvent): Promise<void> {
    try {
      const file = event.files?.[0];
      if (!file) return;

      const data: TalentItem[] = await this.excelImport.importExcel(file, ['專櫃編號', '專櫃名稱']);
      const importedTltNos = data.filter(i => i.tlt_no?.trim() && i.tlt_name?.trim());
      if (!importedTltNos.length) return void this.messageService.errorBubble('匯入檔案沒有有效資料');

      const existingSet = new Set(this.tltTableFiltered.map(i => i.tlt_no));
      const merged = new Map<string, TalentItem>(this.tltTableFiltered.map(i => [i.tlt_no, { ...i, Status: ItemOperationStatus.Original }]));

      let newCount = 0;
      for (const item of importedTltNos) {
        if (!existingSet.has(item.tlt_no)) {
          newCount++;
          merged.set(item.tlt_no, { ...item, Status: ItemOperationStatus.New });
          this.tltDetailMap.set(item.tlt_no, item);
        }
      }

      this.tltTableFiltered = [...merged.values()].map(i => ({ ...i, Status: i.Status ?? ItemOperationStatus.Original }));

      console.log(`importExcel:`, [event, this.tltTableFiltered]);
      this.messageService.successBubble(`匯入成功：新增 ${newCount} 筆資料`);
    } catch (error) {
      console.error('Excel 匯入錯誤:', error);
      this.messageService.errorBubble('Excel 檔案讀取失敗，請檢查檔案格式');
    }
  }

  /** 下載範例檔案 */
  public onExportExcel(): void {
    // 建立工作簿
    const wb = XLSX.utils.book_new();
    // 建立工作表
    const ws = XLSX.utils.aoa_to_sheet([['專櫃編號', '專櫃名稱'],]);
    console.log(`onExportExcel:`, [wb, ws]);
    // 將工作表加入工作簿
    XLSX.utils.book_append_sheet(wb, ws, '專櫃範本');
    // 生成並下載檔案
    XLSX.writeFile(wb, `專櫃範本_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const value = this.dataForm.value;
      const payload: PodRequest = {
        ecr_list: this.ecrTableFiltered,
        talent_list: this.tltTableFiltered,
        pod_info: {
          ...(this.isFormCreateable ? {} : { pod_no: this.rowdata?.pod_no }),
          ...(this.isFormCreateable ? {} : { id: this.rowdata?.id }),
          pod_desc: value.pod_desc || '',
          pod_sdate: value.pod_sdate || new Date(),
          pod_edate: value.pod_edate || this.service.dateE,
          pod_status: ApprovalStatus.未核准,
        },
      };

      console.log(`submit:`, [value, payload]);
      (this.isFormCreateable ? this.service.insertTLS26010(payload) : this.service.updateTLS26010(payload)).pipe(
        finalize(() => {
          this.loading = !1;
          if (this.dialogVisible()) {
            this.dialogLoading.set(!1);
            this.dialogVisible.set(!1);
            this.service.loadTLS26010Detail({ pod_no: this.rowdata?.pod_no || '' });
          }
        }),
        tap(() => {
          this.messageService.successBubble(this.isFormCreateable ? '新增成功' : '修改成功');
          if (this.dialogVisible()) {
            // 對話框模式：更新表單值但不離開頁面
            this.dataForm.patchValue({
              ecr_nos: this.df.ecr_nos.value,
              tlt_nos: this.df.tlt_nos.value,
            });
          } else {
            // 主表單模式：重設或取消
            this.isFormCreateable ? this.dataForm.reset() : this.onCancel();
          }
        })
      ).subscribe();
    });
  }

  /** 對話框資料送出 */
  public onDialogSubmit(): void {
    const dialog = this.dialogVisible();
    if (!dialog) return;

    if (this.crudstatus === CRUDStatus.Create) {
      this.ecrTableFiltered = <EcrItem[]>this.df.ecr_nos.value?.map(item => <EcrItem>{ ...item, Status: ItemOperationStatus.New }) || [];
      this.tltTableFiltered = <TalentItem[]>this.df.tlt_nos.value?.map(item => <TalentItem>{ ...item, Status: ItemOperationStatus.New }) || [];
      return void this.onVisibleChange(!1); // 關閉對話框並清除資料;
    }

    if (dialog === 'ecr') {
      const originalData: Map<string, EcrItem> = this.ecrDetailMap.size
        ? this.ecrDetailMap
        : new Map(this.service.ecrData().map(({ ecr_no, ecr_name, tlt_no, tlt_name }) => [
          ecr_no,
          { ecr_no, ecr_name, tlt_no, tlt_name, Status: ItemOperationStatus.Original } as EcrItem
        ]));
      const changedData: Map<string, EcrItem> = new Map(
        (this.df.ecr_nos.value ?? []).map(ecr => [ecr.ecr_no, <EcrItem>{ ...ecr, Status: ecr.Status || ItemOperationStatus.New }])
      );
      this.ecrTableFiltered = this.buildCrudList<EcrItem>(originalData, changedData);
      console.log(`ECR Dialog Submit:`, [originalData, changedData]);
    }

    if (dialog === 'tlt') {
      const originalData: Map<string, TalentItem> = this.tltDetailMap.size
        ? this.tltDetailMap
        : new Map(
          this.service.tltData().map(({ tlt_no, tlt_name }) => [
            tlt_no,
            { tlt_no, tlt_name, Status: ItemOperationStatus.Original } as TalentItem
          ])
        );
      const changedData: Map<string, TalentItem> = new Map(
        (this.df.tlt_nos.value ?? []).map(tlt => [tlt.tlt_no, <TalentItem>{ ...tlt, Status: tlt.Status || ItemOperationStatus.New }])
      );
      this.tltTableFiltered = this.buildCrudList<TalentItem>(originalData, changedData);
      console.log(`TLT Dialog Submit:`, [originalData, changedData]);
    }

    this.onVisibleChange(!1); // 關閉對話框並清除資料
  }

  /** 清除或重置表單資料 */
  public onClear(): void {
    const staticData = TLS26010CRUComponent.staticData;
    console.log(`onClear:`, [staticData, this.crudstatus]);

    if (this.crudstatus === CRUDStatus.Edit) {
      this.dataForm.reset(staticData.pod_info);
      this.ecrTableFiltered = staticData.ecr_list.map(item => ({ ...item, Status: ItemOperationStatus.Original }));
      this.tltTableFiltered = staticData.talent_list.map(item => ({ ...item, Status: ItemOperationStatus.Original }));
    } else {
      this.dataForm.reset({
        pod_no: '自動給號',
        pod_desc: void 0,
        pod_sdate: new Date(),
        pod_edate: this.service.dateE,
        pod_busdate: this.service.dateE,
        pod_status: '未核准',
        ecr_nos: [],
        tlt_nos: [],
        sys3800: void 0,
        sys3900: void 0,
      });
      this.ecrTableFiltered = [];
      this.tltTableFiltered = [];
    }
  }

  /** 開啟對話框 */
  public onOpenDialog(type: 'ecr' | 'tlt'): void {
    console.log(`onOpenDialog:`, [type, this.dataForm.value]);
    this.dialogVisible.set(type);
    this.submitted = false;
  }

  /** 對話框顯示狀態變更處理 */
  public onVisibleChange(visible: boolean | 'ecr' | 'tlt'): void {
    if (visible !== !1) return;
    this.dialogVisible.set(!1);
    this.dialogLoading.set(!1);
    this.dataForm.patchValue({
      sys3800: [],
      sys3900: [],
      sys3A00: [],
    }, { emitEvent: !1 });
    console.log(`onVisibleChange:`, [this.dialogVisible(), this.dataForm.value]);
  }

  public onSelectionChange(event: (EcrTable | TltTable)[]): void {
    const dialogType = this.dialogVisible();
    if (!dialogType) return;
    console.log(`onSelectionChange:`, [dialogType, event, this.dataForm.value]);
    dialogType === 'ecr' && this.df.ecr_nos.patchValue(<EcrTable[]>event || [], { emitEvent: !1 });
    dialogType === 'tlt' && this.df.tlt_nos.patchValue(<TltTable[]>event || [], { emitEvent: !1 });
  }

  /**
   * 建立 CRUD 列表
   * @param original 原始資料
   * @param selected 選取的 ID 列表
   * @returns CRUD 列表
   */
  private buildCrudList = <T extends { Status?: ItemOperationStatus; }>(
    original: Map<string, T>,
    selected: Map<string, T>
  ): T[] => {
    const result: T[] = [];

    // 先建索引，避免在新增路徑多次 find，O(1) 取值
    const dialogIndex = new Map<string, T>(
      this.dialogData.map((it: any) => [
        this.dialogDataKey === 'ecr_no' ? it.ecr_no : (it.tlt_no ?? it.talent_id),
        it
      ])
    );

    for (const [id, item] of original) {
      // 刪除: 原本有但現在沒有
      if (!selected.has(id)) {
        result.push({ ...item, Status: ItemOperationStatus.Deleted });
        continue;
      }
      // 保留: 原本有且現在也有
      result.push({ ...item, Status: ItemOperationStatus.Original });
    }

    // 新增: 原本沒有但現在有
    for (const [id] of selected) {
      if (!original.has(id)) {
        const newItem = dialogIndex.get(id);
        newItem && result.push({ ...(newItem as T), Status: ItemOperationStatus.New });
      }
    }

    console.log(`buildCrudList:`, [original, selected, result]);
    return result;
  };

  public ngOnDestroy(): void {
    this.service.TLS26010Detail.set(void 0);
  }
}
