import { NgIf } from '@angular/common';
import { Component, computed, effect, OnInit, signal } from '@angular/core';
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
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { ExcelImportService } from '@shared/service/excel-import.service';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { finalize, tap } from 'rxjs';
import * as XLSX from 'xlsx';
import { EcrItem, PodRequest, TalentItem, TLS26010Data } from '../tls26010/tls26010.model';
import { columns } from './../../fin/fin11020/fin11020.model';

const shallowEqual = <T extends Record<string, any>>(a: T, b: T): boolean => {
  const keys = Object.keys(a) as (keyof T)[];
  return keys.every((k: keyof T) => a[k] === b[k]);
};

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
  private dateS: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  private dateE: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  public CRUDStatus = CRUDStatus;
  public ecrTableFiltered: EcrItem[] = [];
  public tltTableFiltered: TalentItem[] = [];
  public dialogVisible = signal<'ecr' | 'tlt' | false>(!1);
  private dialogLoading = signal<boolean>(!1);

  public dataForm = this.formBuilder.nonNullable.group({
    pod_no: new FormControl<string>('自動給號'), // 預售活動編號
    pod_desc: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]), // 預售名稱
    pod_sdate: new FormControl<Date>(new Date(), Validators.required), // 預售期間(起)
    pod_edate: new FormControl<Date>(this.dateE, Validators.required), // 預售期間(迄)
    pod_busdate: new FormControl<Date>(this.dateE, Validators.required), // 活動正檔日期
    pod_status: new FormControl<string>('未核准'), // 核准狀態
    ecr_nos: new FormControl<string[]>([]), // 收銀機清單
    tlt_nos: new FormControl<string[]>([]), // 專櫃清單
    sys3800: new FormControl<string[] | undefined>(void 0), // 館別
    sys3900: new FormControl<string[] | undefined>(void 0), // 樓層
    sys3A00: new FormControl<string[] | undefined>(void 0), // 區域
  });
  private get df() { return this.dataForm.controls; }

  private sys3800Signal = toSignal(this.df.sys3800.valueChanges);
  private sys3900Signal = toSignal(this.df.sys3900.valueChanges);
  private sys3A00Signal = toSignal(this.df.sys3A00.valueChanges);
  private sdateSignal = toSignal(this.df.pod_sdate.valueChanges);
  private edateSignal = toSignal(this.df.pod_edate.valueChanges);
  private ecrNosSignal = signal<EcrItem[]>([]);
  private tltNosSignal = signal<TalentItem[]>([]);

  private ecrDetailMap = new Map<string, EcrItem>();
  private tltDetailMap = new Map<string, TalentItem>();

  public get podStatus() {
    const statusSet = new Set(['0', '1', '9']);
    const podStatus = this.dataForm.controls.pod_status;
    if (!podStatus.value) { podStatus.patchValue('未核准'); return podStatus; }
    podStatus.patchValue(statusSet.has(podStatus.value)
      ? this.service.approvalStatus(podStatus.value)
      : podStatus.value || '未核准');
    return podStatus;
  }

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
    const payload = this.queryPayload();
    const dialogType = this.dialogVisible();
    if (!dialogType) return;
    this.service.loadSYS3800();
    this.service.loadSYS3900();
    this.service.loadSYS3A00();
    if (!payload.building_nos?.length && !payload.floor_nos?.length && !payload.area_nos?.length) return;
    if (dialogType === 'ecr') {
      this.dataForm.patchValue({
        ecr_nos: this.ecrTableFiltered.map(ecr => ecr.ecr_no),
        tlt_nos: [],
      });
      this.service.loadPreorderECRList({ ...payload, ecr_type: '1' });
      console.log('ecrDialogOpenEffect:', [this.dataForm.value, payload]);
    }
    else if (dialogType === 'tlt') {
      this.dataForm.patchValue({
        tlt_nos: this.tltTableFiltered.map(tlt => tlt.tlt_no),
        ecr_nos: [],
      });
      this.service.loadTLTTALENT(payload);
      console.log('tltDialogOpenEffect:', [this.dataForm.value, payload]);
    }
  }, { allowSignalWrites: !0 });

  /** 監聽館別樓層區域、重置收銀機號及專櫃ID */
  private readonly dependentDataEffect = effect(() => {
    const building_no = this.sys3800Signal();
    const floor_no = this.sys3900Signal();
    const area_no = this.sys3A00Signal();
    const dialogType = this.dialogVisible();
    const payload = this.queryPayload();
    if ((!floor_no?.length && !building_no?.length && !area_no?.length) || !dialogType) return;
    let ecr_nos: string[] = [];
    let tlt_nos: string[] = [];
    if (dialogType === 'ecr') {
      this.service.loadPreorderECRList({ ...payload, ecr_type: '2' });
      for (const ecr of this.ecrTableFiltered) {
        if (this.service.ECRMap.has(ecr.ecr_no)) ecr_nos.push(ecr.ecr_no);
      }
    }
    else if (dialogType === 'tlt') {
      this.service.loadTLTTALENT(payload);
      for (const tlt of this.tltTableFiltered) {
        if (this.service.TLTMap.has(tlt.tlt_no)) tlt_nos.push(tlt.tlt_no);
      }
    }
    this.dataForm.patchValue({ tlt_nos, ecr_nos }, { emitEvent: !1 });
    console.log(`dependentDataEffect:`, [building_no, floor_no, area_no, dialogType, payload, ecr_nos, tlt_nos]);
  }, { allowSignalWrites: !0 });

  /** 初始化 ECR & TLT Table資料 */
  private readonly TLS26010DetailEffect = effect(() => {
    if (!this.service.TLS26010Detail()) return;
    const detail = this.service.TLS26010Detail()!;
    this.dataForm.patchValue({
      ecr_nos: detail.ecr_list.map(ecr => ecr.ecr_no),
      tlt_nos: detail.talent_list.map(tlt => tlt.tlt_no),
    });
    this.ecrDetailMap.clear();
    this.tltDetailMap.clear();
    this.ecrTableFiltered = detail.ecr_list;
    this.tltTableFiltered = detail.talent_list;
    for (const ecr of detail.ecr_list) { this.ecrDetailMap.set(ecr.ecr_no, ecr); }
    for (const tlt of detail.talent_list) { this.tltDetailMap.set(tlt.tlt_no, tlt); }
    this.TLS26010DetailEffect.destroy(); // 只需執行一次
  });

  /** API queries */
  private readonly queryPayload = computed(() => ({
    building_nos: this.sys3800Signal() || [],
    floor_nos: this.sys3900Signal() || [],
    area_nos: this.sys3A00Signal() || [],
  }), { equal: shallowEqual });

  public columns: Column[] = [
    { field: 'ecr_no', header: '收銀機號', visible: !0 },
    { field: 'tlt_no', header: '專櫃編號', visible: !0 },
    { field: 'tlt_name', header: '櫃位名稱', visible: !0 },
  ];

  public columns2: Column[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: !0 },
    { field: 'tlt_name', header: '櫃位名稱', visible: !0 },
  ];

  public readonly isRowSelectable = (rowData: TLS26010Data): boolean =>
    !(Reflect.has(rowData, 'CanDelete') && rowData.CanDelete === '0');

  // 靜態資料: 用於表單初始化和重置
  private staticData: TLS26010Data = this.dataForm.value as TLS26010Data;

  constructor(
    public service: TLS26010Service,
    private readonly excelImport: ExcelImportService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS26010', this.dataForm);
    if (this.crudstatus !== CRUDStatus.Create)
      this.service.loadTLS26010Detail({ pod_no: this.rowdata?.pod_no || '' });
    this.staticData = this.dataForm.value as TLS26010Data;
    console.log(`init:`, [this.funInfo, this.rowdata, this.dataForm.value]);
  }

  /** 處理 excel 匯入 */
  public async onImportExcel(event: FileSelectEvent): Promise<void> {
    const file = event.files[0];
    const columns = ['tlt_no', 'tlt_name'];
    try {
      const data: TalentItem[] = await this.excelImport.importExcel(file, columns);

      // 驗證資料完整性
      const validData = data.filter(item =>
        item.tlt_no && item.tlt_no.trim() !== '' &&
        item.tlt_name && item.tlt_name.trim() !== ''
      );

      if (!validData.length) return void this.messageService.errorBubble('匯入檔案沒有有效資料');

      // 建立現有項目的 Set 以提升查找效率
      const existingSet = new Set<string>();
      for (const item of this.tltTableFiltered) { existingSet.add(item.tlt_no); }

      // 將匯入資料轉為 Map 以提升處理效率
      const importDataMap = new Map<string, TalentItem>();
      for (const item of validData) { importDataMap.set(item.tlt_no, item); }

      // 過濾出不存在的項目並加上 CRUD 標記
      const newItems: TalentItem[] = [];
      for (const [tlt_no, item] of importDataMap) {
        if (!existingSet.has(tlt_no)) {
          newItems.push(item);
          // 同時更新 tltDetailMap
          this.tltDetailMap.set(tlt_no, item);
        }
      }

      // 更新 tltNosSignal，為新項目加上 'new' 標記
      const currentTltNos = this.tltNosSignal();
      const newTltItems = newItems.map(item => ({ ...item, Status: 'new' as const }));
      this.tltNosSignal.set([...currentTltNos, ...newTltItems]);
      this.tltTableFiltered = [...this.tltTableFiltered, ...newItems];
      this.messageService.successBubble(`匯入成功：新增 ${newItems.length} 筆資料`);

      console.log(`importExcel:`, [event, this.tltTableFiltered, this.tltNosSignal()]);

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
    const ws = XLSX.utils.aoa_to_sheet([
      ['tlt_no', 'tlt_name'],
    ]);
    console.log(`onExportExcel:`, [wb, ws]);

    // 將工作表加入工作簿
    XLSX.utils.book_append_sheet(wb, ws, '專櫃範本');
    // 生成並下載檔案
    XLSX.writeFile(wb, `專櫃範本_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  /**
   * 建立 CRUD 列表
   * @param original 原始資料
   * @param selected 選取的 ID 列表
   * @param resolveNew 新增項目的解析函式
   * @returns CRUD 列表
   */
  private buildCrudList<T extends { Status?: any; }>(
    original: Map<string, T>,
    selected: string[],
    resolveNew: (id: string) => T
  ): (T & { Status: 'new' | 'delete' | 'original' | 'modify'; })[] {
    const result: (T & { Status: any; })[] = [];
    const selectedSet = new Set(selected);

    // 刪除：原本有但現在沒有
    for (const [id, item] of original.entries()) {
      if (!selectedSet.has(id)) {
        result.push({ ...item, Status: 'delete' });
      }
    }

    // 新增或保留
    for (const id of selectedSet) {
      const item = original.get(id);
      if (!item) {
        // 原始不存在 → 新增
        result.push({ ...resolveNew(id), Status: 'new' });
      } else {
        // 原始存在 → 保留
        result.push({ ...item, Status: 'original' });
      }
    }
    console.log(`buildCrudList:`, [original, selected, resolveNew, result]);
    return result;
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const value = this.dataForm.value;
      const payload: PodRequest = {
        ecr_list: this.ecrNosSignal(),
        talent_list: this.tltNosSignal(),
        pod_info: {
          ...(this.isFormCreateable ? {} : { pod_no: this.rowdata?.pod_no }),
          ...(this.isFormCreateable ? {} : { id: this.rowdata?.id }),
          pod_desc: value.pod_desc || '',
          pod_sdate: value.pod_sdate || new Date(),
          pod_edate: value.pod_edate || this.dateE,
          pod_status: ApprovalStatus.未核准,
        },
      };

      console.log(`submit:`, [value, this.ecrNosSignal(), this.tltNosSignal(), payload]);
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

  /** 對話框資料 */
  public onDialogSubmit(): void {
    const dialog = this.dialogVisible();
    const tlt = this.service.TLTMap;
    if (dialog === 'ecr') {
      const ecrNos = this.df.ecr_nos.value || [];

      this.ecrTableFiltered = ecrNos.map(ecrNo => ({
        ecr_no: ecrNo,
        tlt_no: tlt.get(ecrNo)?.tlt_no || '',
        tlt_name: tlt.get(ecrNo)?.tlt_name || ''
      }));

      this.ecrNosSignal.set(this.buildCrudList(
        this.ecrDetailMap,
        ecrNos,
        (id) => this.ecrDetailMap.get(id) || {
          ecr_no: id,
          tlt_no: tlt.get(id)?.tlt_no || '',
          tlt_name: tlt.get(id)?.tlt_name || ''
        }));
    }
    if (dialog === 'tlt') {
      const tltNos = this.df.tlt_nos.value || [];

      this.tltTableFiltered = tltNos.map(tltNo => ({
        tlt_no: tltNo,
        tlt_name: tlt.get(tltNo)?.tlt_name || ''
      }));


      this.tltNosSignal.set(this.buildCrudList(
        this.tltDetailMap,
        tltNos,
        (id) => this.tltDetailMap.get(id) || {
          tlt_no: id,
          tlt_name: tlt.get(id)?.tlt_name || ''
        }));

    }
    this.onVisibleChange(!1); // 關閉對話框並清除資料
  }

  public onClear(): void {
    this.crudstatus === CRUDStatus.Edit
      ? this.dataForm.reset(this.staticData)
      : this.dataForm.reset({
        pod_no: '自動給號',
        pod_desc: void 0,
        pod_sdate: new Date(),
        pod_edate: this.dateE,
        pod_busdate: this.dateE,
        pod_status: '未核准',
        ecr_nos: [],
        tlt_nos: [],
        sys3800: void 0,
        sys3900: void 0,
      });
  }

  public onDelete(items: (EcrItem | TalentItem)[]): void {
    if (!items.length) return;
    if ('ecr_no' in items[0]) {
      const ecrItems = items as EcrItem[];
      const deleteSet = new Set(ecrItems.map(item => item.ecr_no));
      this.ecrNosSignal.set(this.ecrNosSignal().filter(ecr => !deleteSet.has(ecr.ecr_no)));
      this.ecrTableFiltered = this.ecrTableFiltered.filter(ecr => !deleteSet.has(ecr.ecr_no));
    } else {
      const tltItems = items as TalentItem[];
      const deleteSet = new Set(tltItems.map(item => item.tlt_no));
      this.tltNosSignal.set(this.tltNosSignal().filter(tlt => !deleteSet.has(tlt.tlt_no)));
      this.tltTableFiltered = this.tltTableFiltered.filter(tlt => !deleteSet.has(tlt.tlt_no));
    }

    console.log(`onDelete:`, [items, this.ecrNosSignal(), this.tltNosSignal(), this.ecrTableFiltered, this.tltTableFiltered]);
  }

  public onVisibleChange(visible: boolean | 'ecr' | 'tlt'): void {
    console.log('onVisibleChange', [visible]);
    if (visible === !1) {
      this.dialogVisible.set(!1);
      this.dialogLoading.set(!1);
      this.dataForm.patchValue({
        sys3800: void 0,
        sys3900: void 0,
        sys3A00: void 0,
        ecr_nos: [],
        tlt_nos: [],
      }, { emitEvent: !1 });
      return;
    }
  }

  public ngOnDestroy(): void {
    this.service.TLS26010Detail.set(void 0);
  }
}
