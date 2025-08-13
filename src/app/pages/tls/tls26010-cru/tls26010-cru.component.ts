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
import { debounceTime, finalize, pairwise, startWith, Subject, takeUntil, tap } from 'rxjs';
import * as XLSX from 'xlsx';
import { EcrItem, PodRequest, TLS26010Data, TLS26010Detail, TltItem } from '../tls26010/tls26010.model';

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
  public readonly CRUDStatus = CRUDStatus;

  public ecrTableFiltered: EcrItem[] = [];
  public tltTableFiltered: TltItem[] = [];
  public dialogSelectedData: (EcrItem | TltItem)[] = [];
  public originalDetailData: TLS26010Detail | undefined;

  public dataForm = this.formBuilder.nonNullable.group({
    pod_no: new FormControl<string>('自動給號'), // 預售活動編號
    pod_desc: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]), // 預售名稱
    pod_sdate: new FormControl<Date>(new Date(), Validators.required), // 預售期間(起)
    pod_edate: new FormControl<Date>(this.service.dateE, Validators.required), // 預售期間(迄)
    pod_busdate: new FormControl<Date>(this.service.dateE, Validators.required), // 活動正檔日期
    pod_status: new FormControl<string>('未核准'), // 核准狀態
    ecr_nos: new FormControl<EcrItem[]>([]), // 收銀機清單
    tlt_nos: new FormControl<TltItem[]>([]), // 專櫃清單
    sys3800: new FormControl<string[]>([]), // 館別
    sys3900: new FormControl<string[]>([]), // 樓層
    sys3A00: new FormControl<string[]>([]), // 區域
  });
  public readonly df = computed(() => this.dataForm.controls);

  // 變化追蹤
  private readonly dfSignal = toSignal(this.dataForm.valueChanges, { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) });
  private readonly sys3800Signal: Signal<string[] | undefined | null> = toSignal(this.df().sys3800.valueChanges, { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) });
  private readonly sys3900Signal: Signal<string[] | undefined | null> = toSignal(this.df().sys3900.valueChanges, { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) });
  private readonly sys3A00Signal: Signal<string[] | undefined | null> = toSignal(this.df().sys3A00.valueChanges, { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) });
  private readonly sdateSignal: Signal<Date | undefined | null> = toSignal(this.df().pod_sdate.valueChanges, { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) });
  private readonly edateSignal: Signal<Date | undefined | null> = toSignal(this.df().pod_edate.valueChanges, { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) });

  public readonly dialogVisible = signal<'ecr' | 'tlt' | false>(!1);

  // 節流處理的 Subject
  private readonly dependencyChangeSubject = new Subject<{
    dialog: 'ecr' | 'tlt';
    payload: {
      building_nos: string[];
      floor_nos: string[];
      area_nos: string[];
    };
    date: {
      pod_sdate?: Date | null;
      pod_edate?: Date | null;
    };
  }>();
  private readonly destroy$ = new Subject<void>();

  /** 核准狀態處理 */
  public readonly podStatusEffect = effect(() => {
    const raw = this.df().pod_status.value;
    const statusSet = new Set(['0', '1', '9']);
    if (!raw) {
      this.df().pod_status.patchValue('未核准');
      return;
    }
    const mapped = statusSet.has(raw) ? this.service.approvalStatus(raw) : raw;
    mapped !== raw && this.df().pod_status.patchValue(mapped);
  });
  /** 依賴項檢查 */
  public readonly dependencyEffect = effect(() => {
    const dialog = this.dialogVisible();
    if (dialog !== 'ecr' && dialog !== 'tlt') return;

    const payload = {
      building_nos: this.sys3800Signal() || [],
      floor_nos: this.sys3900Signal() || [],
      area_nos: this.sys3A00Signal() || [],
    };
    const date = {
      pod_sdate: this.sdateSignal(),
      pod_edate: this.edateSignal(),
    };

    if (date.pod_sdate && date.pod_edate && date.pod_sdate > date.pod_edate) return;
    // 發送到節流 Subject，避免頻繁 API 呼叫
    this.dependencyChangeSubject.next({ dialog, payload, date });
  });
  /** 監聽對話框資料變化，更新表單值 */
  public readonly dialogDataEffect = effect(() => {
    const dialog = this.dialogVisible();
    if (!dialog) return;

    const incoming = dialog === 'ecr' ? this.service.ecrData() : this.service.tltData();
    if (!incoming?.length) return;

    const filtered = dialog === 'ecr' ? this.ecrTableFiltered : this.tltTableFiltered;
    const key = dialog === 'ecr' ? 'ecr_no' : 'tlt_no';

    // 使用交集運算，提升效能
    const pickedSet = new Set(filtered.map(item => item[key as keyof typeof item]));
    const selectedData = incoming.filter(item => pickedSet.has(item[key as keyof typeof item]));

    // 型別守衛確保正確的型別分配
    if (dialog === 'ecr') this.df().ecr_nos.patchValue(selectedData as EcrItem[]);
    else this.df().tlt_nos.patchValue(selectedData as TltItem[]);

    setTimeout(() => this.dialogSelectedData = selectedData, 100);
    console.log(`dialogDataEffect [${dialog}]:`, [selectedData, this.dataForm.value]);
  });
  /** 初始化 ECR & TLT Table資料 */
  public readonly TLS26010DetailEffect = effect(() => {
    const detail = this.service.TLS26010Detail();
    if (!detail) return;
    this.dataForm.patchValue({
      ecr_nos: detail.ecr_list,
      tlt_nos: detail.talent_list,
    });
    this.originalDetailData = detail;
    this.ecrTableFiltered = detail.ecr_list;
    this.tltTableFiltered = detail.talent_list;
    console.log(`TLS26010DetailEffect:`, [this.ecrTableFiltered, this.tltTableFiltered, this.dataForm.value]);
    this.TLS26010DetailEffect.destroy(); // 只需執行一次
  });
  /** 初始化靜態資料 */
  public readonly staticDataEffect = effect(() => {
    const detail = this.service.TLS26010Detail();
    if (!detail) return;
    TLS26010CRUComponent.staticData = detail as TLS26010Detail;
    this.staticDataEffect.destroy(); // 只需執行一次
  });
  /** 表單變化追蹤 */
  public readonly dfEffect = effect(() => {
    console.log(`dfEffect:`, [this.dfSignal()]);
  });

  public readonly dialogData = computed(() =>
    this.dialogVisible() === 'ecr' ? this.service.ecrData() :
      this.dialogVisible() === 'tlt' ? this.service.tltData() : []
  );
  public readonly dialogColumn = computed(() =>
    this.dialogVisible() === 'ecr' ? this.columns3 :
      this.dialogVisible() === 'tlt' ? this.columns4 : []
  );
  public readonly dialogDataKey = computed(() =>
    this.dialogVisible() === 'ecr' ? 'ecr_no' :
      this.dialogVisible() === 'tlt' ? 'talent_id' : ''
  );
  public readonly dialogTableKey = computed(() =>
    this.dialogVisible() === 'ecr' ? 'TLS26010_ECR' :
      this.dialogVisible() === 'tlt' ? 'TLS26010_TLT' : ''
  );
  public readonly dialogHeader = computed(() =>
    this.dialogVisible() === 'ecr' ? '新增收銀機' :
      this.dialogVisible() === 'tlt' ? '新增專櫃' : ''
  );

  public dialogLoading() {
    return this.dialogVisible() === 'ecr' ? this.service.ecrLoading :
      this.dialogVisible() === 'tlt' ? this.service.tltLoading : !1;
  }

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

    this.dependencyChangeSubject.pipe(
      debounceTime(400),
      takeUntil(this.destroy$),
      startWith({ dialog: '', payload: {} }),
      pairwise(),
      tap(([a, b]) => {
        console.log(`dependency:`, [a, b, this.dataForm.value]);
        if (JSON.stringify(a.payload) === JSON.stringify(b.payload)) return;
        if (b.dialog === 'ecr') { this.service.loadPreorderECRList({ ...b.payload, ecr_type: '1' }); }
        else if (b.dialog === 'tlt') { this.service.loadTLTTALENT(b.payload); }
      })
    ).subscribe();

    this.service.loadSYS3800();
    this.service.loadSYS3900();
    this.service.loadSYS3A00();

    // 使用 map + 結構賦值，避免在迴圈中建立暫時物件
    const ecrInit = this.service.ecrData();
    this.ecrTableFiltered = ecrInit.map(({ ecr_no, ecr_name, tlt_no, tlt_name }): EcrItem => (
      { ecr_no, ecr_name, tlt_no, tlt_name, Status: ItemOperationStatus.Original }
    ));

    const tltInit = this.service.tltData();
    this.tltTableFiltered = tltInit.map((item): TltItem => ({
      tlt_no: item.tlt_no,
      tlt_name: item.tlt_name,
      VEN_Name: item.VEN_Name || '',
      apply_no: item.apply_no || '',
      talent_id: item.talent_id || NaN,
      ven_no: item.ven_no || '',
      Status: ItemOperationStatus.Original
    }));

    console.log(`init ${this.crudstatus}:`, [this.funInfo, this.rowdata, this.dataForm.value, this.service]);
  };

  /** 處理 excel 匯入 */
  public async onImportExcel(event: FileSelectEvent): Promise<void> {
    try {
      const file = event.files?.[0];
      if (!file) return;

      // 使用中文欄位名稱匯入，然後手動對應到資料欄位
      const rawData = await this.excelImport.importExcel(file, ['專櫃編號', '專櫃名稱']);

      // 將中文欄位對應到資料欄位
      const data: TltItem[] = rawData.map((item: any) => ({
        ...item,
        tlt_no: item['專櫃編號'] || '',
        tlt_name: item['專櫃名稱'] || '',
        Status: ItemOperationStatus.New
      }));

      const importedTltNos = data.filter(i => i.tlt_no?.trim() && i.tlt_name?.trim());
      if (!importedTltNos.length) return void this.messageService.errorBubble('匯入檔案沒有有效資料');

      const existingSet = new Set(this.tltTableFiltered.map(i => i.tlt_no));
      const merged = new Map<string, TltItem>(this.tltTableFiltered.map(i => [i.tlt_no, { ...i, Status: ItemOperationStatus.Original }]));

      let newCount = 0;
      for (const item of importedTltNos) {
        if (!existingSet.has(item.tlt_no)) {
          newCount++;
          merged.set(item.tlt_no, { ...item, Status: ItemOperationStatus.New });
        }
      }

      this.tltTableFiltered = Array.from(merged.values(), (i => ({ ...i, Status: i.Status ?? ItemOperationStatus.Original })));

      console.log(`importExcel:`, [event, this.tltTableFiltered]);
      this.messageService.successBubble(`匯入成功：新增 ${newCount} 筆資料`);
    } catch (error) {
      console.error('Excel 匯入錯誤:', error);
      this.messageService.errorBubble('Excel 檔案讀取失敗，請檢查檔案格式');
    }
  };

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
        tap(() => {
          this.messageService.successBubble(this.isFormCreateable ? '新增成功' : '修改成功');
          if (!this.dialogVisible()) this.isFormCreateable ? this.dataForm.reset() : this.onCancel();
        }),
        finalize(() => {
          this.loading = !1;
          if (this.dialogVisible()) {
            this.dialogVisible.set(!1);
            this.service.loadTLS26010Detail({ pod_no: this.rowdata?.pod_no || '' });
          }
        }),
      ).subscribe();
    });
  };

  /** 對話框資料送出 */
  public onDialogSubmit(): void {
    const dialog = this.dialogVisible();
    if (!dialog) return;

    if (this.crudstatus === CRUDStatus.Create) {
      this.ecrTableFiltered = (this.df().ecr_nos.value || []).map(item => <EcrItem>{ ...item, Status: ItemOperationStatus.New });
      this.tltTableFiltered = (this.df().tlt_nos.value || []).map(item => <TltItem>{ ...item, Status: ItemOperationStatus.New });
      return void this.onVisibleChange(!1); // 關閉對話框並清除資料;
    }

    if (dialog === 'ecr') {
      const originalData: Map<string, EcrItem> = new Map(
        (this.originalDetailData?.ecr_list || []).map(item => [item.ecr_no, item] as const));
      const changedData: Map<string, EcrItem> = new Map(
        (this.df().ecr_nos.value || []).map(ecr => [ecr.ecr_no, <EcrItem>{ ...ecr, Status: ecr.Status || ItemOperationStatus.New }])
      );
      this.ecrTableFiltered = this.buildCrudList<EcrItem>(originalData, changedData);
      console.log(`ECR Dialog Submit:`, [originalData, changedData]);
    }

    if (dialog === 'tlt') {
      const originalData: Map<string, TltItem> = new Map(
        (this.originalDetailData?.talent_list || []).map(item => [String(item.talent_id!), item] as const));
      const changedData: Map<string, TltItem> = new Map(
        (this.df().tlt_nos.value || []).map(tlt => [String(tlt.talent_id!), <TltItem>{ ...tlt, Status: tlt.Status || ItemOperationStatus.New }])
      );
      this.tltTableFiltered = this.buildCrudList<TltItem>(originalData, changedData);
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
    this.submitted = !1;
  };

  /** 對話框顯示狀態變更處理 */
  public onVisibleChange(visible: boolean | 'ecr' | 'tlt'): void {
    if (this.dialogVisible()) return void this.dialogVisible.set(!1);
    this.dataForm.patchValue({
      sys3800: [],
      sys3900: [],
      sys3A00: [],
    });
    console.log(`onVisibleChange:`, [this.dialogVisible(), visible, this.dataForm.value]);
  }

  public onSelectionChange(event: (EcrItem | TltItem)[]): void {
    const dialog = this.dialogVisible();
    if (!dialog || this.service.ecrLoading || this.service.tltLoading) return;
    dialog === 'ecr' && this.df().ecr_nos.patchValue(<EcrItem[]>event);
    dialog === 'tlt' && this.df().tlt_nos.patchValue(<TltItem[]>event);
    console.log(`onSelectionChange:`, [dialog, event, this.dataForm.value]);
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
      this.dialogData().map((it: any) => [
        this.dialogDataKey() === 'ecr_no' ? it.ecr_no : it.tlt_no,
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
    this.dependencyChangeSubject.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
