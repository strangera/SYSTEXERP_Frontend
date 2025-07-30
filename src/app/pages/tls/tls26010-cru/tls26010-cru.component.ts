import { NgIf } from '@angular/common';
import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS26010Service } from '@service/api/tls/tls26010.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent, CalendarRangeComponent, DialogComponent, DropdownComponent, InputTextComponent, MultiSelectComponent, TableComponent } from '@shared/componentkit';
import { Column } from '@shared/componentkit/table/table.model';
import { MenubarComponent } from '@shared/index';
import { ApprovalStatus } from '@shared/models';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { finalize, tap } from 'rxjs';
import { EcrItem, FormValue, PodRequest, StatusProcessStrategy, TalentItem, TLS26010Data } from '../tls26010/tls26010.model';

const shallowEqual = <T extends Record<string, any>>(a: T, b: T): boolean => {
  const keys = Object.keys(a) as (keyof T)[];
  return keys.every((k: keyof T) => a[k] === b[k]);
};

/**
 * 建立模式狀態處理策略
 */
class CreateStatusStrategy implements StatusProcessStrategy {
  constructor(
    private formValue: FormValue,
    private service: TLS26010Service
  ) { }

  processEcrList(): EcrItem[] {
    return (this.formValue.ECR_Nos || []).map((ecrNo: string) => {
      const ecrOption = this.service.ECRMap?.get(ecrNo);
      return {
        ECR_No: ecrNo,
        tlt_no: ecrOption?.Name || '',
        tlt_name: ecrOption?.Name || '',
        Status: 'new' as const
      };
    });
  }

  processTalentList(): TalentItem[] {
    return (this.formValue.tlt_nos || []).map((tltNo: string) => {
      const tltOption = this.service.TLTMap?.get(tltNo);
      return {
        tlt_no: tltNo,
        tlt_name: tltOption?.Name || '',
        Status: 'new' as const
      };
    });
  }
}

/**
 * 修改模式狀態處理策略
 */
class UpdateStatusStrategy implements StatusProcessStrategy {
  constructor(
    private formValue: FormValue,
    private service: TLS26010Service,
    private ecrDetailMap: Map<string, EcrItem>,
    private tltDetailMap: Map<string, TalentItem>
  ) { }

  processEcrList(): EcrItem[] {
    const currentSelected = new Set(this.formValue.ECR_Nos || []);
    const originalEcrs = new Set(Array.from(this.ecrDetailMap.keys()));
    const result: EcrItem[] = [];

    // 處理刪除的項目：原始存在但表單中未選中
    for (const originalEcrNo of originalEcrs) {
      if (!currentSelected.has(originalEcrNo)) {
        const originalEcr = this.ecrDetailMap.get(originalEcrNo)!;
        result.push({
          ...originalEcr,
          Status: 'delete'
        });
      }
    }

    // 處理表單中選中的項目
    for (const selectedEcrNo of currentSelected) {
      if (originalEcrs.has(selectedEcrNo)) {
        // 原始存在：判斷是否為 original 或 modify
        const originalEcr = this.ecrDetailMap.get(selectedEcrNo)!;
        result.push({
          ...originalEcr,
          Status: originalEcr.ECR_No === selectedEcrNo ? 'original' : 'modify'
        });
      } else {
        // 原始不存在：new
        const originalEcr = this.ecrDetailMap.get(selectedEcrNo);
        result.push({
          ECR_No: selectedEcrNo,
          tlt_no: originalEcr?.tlt_no || '',
          tlt_name: originalEcr?.tlt_name || '',
          Status: 'new'
        });
      }
    }

    return result;
  }

  processTalentList(): TalentItem[] {
    const currentSelected = new Set(this.formValue.tlt_nos || []);
    const originalTalents = new Set(Array.from(this.tltDetailMap.keys()));
    const result: TalentItem[] = [];

    // 處理刪除的項目：原始存在但表單中未選中
    for (const originalTltNo of originalTalents) {
      if (!currentSelected.has(originalTltNo)) {
        const originalTalent = this.tltDetailMap.get(originalTltNo)!;
        result.push({
          ...originalTalent,
          Status: 'delete'
        });
      }
    }

    // 處理表單中選中的項目
    for (const selectedTltNo of currentSelected) {
      if (originalTalents.has(selectedTltNo)) {
        // 原始存在：判斷是否為 original 或 modify
        const originalTalent = this.tltDetailMap.get(selectedTltNo)!;
        const currentNo = this.service.TLTMap.get(selectedTltNo)?.No || originalTalent.tlt_no;
        result.push({
          ...originalTalent,
          tlt_no: currentNo,
          tlt_name: this.service.TLTMap.get(selectedTltNo)?.Name || originalTalent.tlt_name,
          Status: originalTalent.tlt_no === currentNo ? 'original' : 'modify'
        });
      } else {
        // 原始不存在：new
        result.push({
          tlt_no: selectedTltNo,
          tlt_name: this.service.TLTMap.get(selectedTltNo)?.Name || '',
          Status: 'new'
        });
      }
    }

    return result;
  }
}

/**
 * 狀態處理工廠
 */
class StatusProcessorFactory {
  static createStrategy(
    isCreateMode: boolean,
    formValue: FormValue,
    service: TLS26010Service,
    ecrDetailMap?: Map<string, EcrItem>,
    tltDetailMap?: Map<string, TalentItem>
  ): StatusProcessStrategy {
    if (isCreateMode) {
      return new CreateStatusStrategy(formValue, service);
    } else {
      if (!ecrDetailMap || !tltDetailMap) {
        throw new Error('修改模式需要提供 ecrDetailMap 和 tltDetailMap');
      }
      return new UpdateStatusStrategy(formValue, service, ecrDetailMap, tltDetailMap);
    }
  }
}

// 預購活動檔期設定
@Component({
  selector: 'app-tls26010-cru',
  templateUrl: './tls26010-cru.component.html',
  styleUrl: './tls26010-cru.component.scss',
  standalone: true,
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
    ECR_Nos: new FormControl<string[]>([]), // 收銀機清單
    tlt_nos: new FormControl<string[]>([]), // 專櫃清單
    sys3800: new FormControl<string | undefined>(undefined), // 館別
    sys3900: new FormControl<string | undefined>(undefined), // 樓層
  });
  private get df() { return this.dataForm.controls; }

  public get podStatus() {
    const statusSet = new Set(['0', '1', '9']);
    const podStatus = this.dataForm.controls.pod_status;
    if (!podStatus.value) { podStatus.patchValue('未核准'); return podStatus; }
    podStatus.patchValue(statusSet.has(podStatus.value)
      ? this.service.approvalStatus(podStatus.value)
      : podStatus.value || '未核准');
    return podStatus;
  }

  private sys3800Signal = toSignal(this.df.sys3800.valueChanges);
  private sys3900Signal = toSignal(this.df.sys3900.valueChanges);
  private sdateSignal = toSignal(this.df.pod_sdate.valueChanges);
  private edateSignal = toSignal(this.df.pod_edate.valueChanges);

  private ecrDetailMap = new Map<string, EcrItem>();
  private tltDetailMap = new Map<string, TalentItem>();

  private readonly dateCheckEffect = effect(() => {
    const sdate = this.sdateSignal();
    const edate = this.edateSignal();
    const payload = this.queryPayload();
    if (sdate && edate && sdate > edate) {
      this.df.pod_edate.setErrors({ dateError: !0 });
      this.service.loadPreorderECRList({ ...payload, data_type: '1' });
    } else { this.df.pod_edate.setErrors(null); }
  });
  private readonly ecrDialogOpenEffect = effect(() => {
    const dialog = this.dialogVisible();
    if (!this.dialogVisible())
      this.dataForm.patchValue({ sys3800: undefined, sys3900: undefined, ECR_Nos: [] });
    if (dialog !== 'ecr') return;
    this.service.loadSYS3800();
    this.service.loadSYS3900();
    this.service.loadPreorderECRList({ ...this.queryPayload(), data_type: '1' });
    console.log('ecrDialogOpenEffect:', [this.dataForm.value, this.queryPayload(), dialog]);
  }, { allowSignalWrites: !0 });
  private readonly tltDialogOpenEffect = effect(() => {
    const dialog = this.dialogVisible();
    if (!this.dialogVisible())
      this.dataForm.patchValue({ sys3800: undefined, sys3900: undefined, tlt_nos: [] });
    if (dialog !== 'tlt') return;
    this.service.loadSYS3800();
    this.service.loadSYS3900();
    this.service.loadTLTTALENT({ ...this.queryPayload() });
    console.log('tltDialogOpenEffect:', [this.dataForm.value, this.queryPayload(), dialog]);
  }, { allowSignalWrites: !0 });
  private readonly TLS26010DetailEffect = effect(() => {
    if (!this.service.TLS26010Detail()) return;
    const detail = this.service.TLS26010Detail()!;
    this.dataForm.patchValue({
      ECR_Nos: detail.ecr_list.map(ecr => ecr.ECR_No),
      tlt_nos: detail.talent_list.map(tlt => tlt.tlt_no),
    });
    this.ecrDetailMap.clear();
    this.tltDetailMap.clear();
    this.ecrTableFiltered = detail.ecr_list;
    this.tltTableFiltered = detail.talent_list;
    for (const ecr of detail.ecr_list) { this.ecrDetailMap.set(ecr.ECR_No, ecr); }
    for (const tlt of detail.talent_list) { this.tltDetailMap.set(tlt.tlt_no, tlt); }
  });

  // API queries
  private readonly queryPayload = computed(() => ({
    building_no: this.sys3800Signal(),
    floor_no: this.sys3900Signal(),
    sdate: this.sdateSignal()!,
    edate: this.edateSignal()!,
  }), { equal: shallowEqual });

  public columns: Column[] = [
    { field: 'ECR_No', header: '收銀機號', visible: !0 },
    { field: 'tlt_no', header: '專櫃編號', visible: !0 },
    { field: 'tlt_name', header: '櫃位名稱', visible: !0 },
  ];

  public columns2: Column[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: !0 },
    { field: 'tlt_name', header: '櫃位名稱', visible: !0 },
  ];

  public readonly isRowSelectable = (rowData: TLS26010Data): boolean =>
    !(Reflect.has(rowData, 'CanDelete') && rowData.CanDelete === '0');

  constructor(public service: TLS26010Service) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS26010', this.dataForm);
    if (this.crudstatus !== CRUDStatus.Create)
      this.service.loadTLS26010Detail({ pod_no: this.rowdata?.pod_no || '' });
    console.log(`init:`, [this.funInfo, this.rowdata, this.dataForm.value]);
  }

  /** 處理文件上傳事件 */
  public onImportExcel(event: FileSelectEvent): void {
    const file = event.files[0];
    this.service.importTLS26010(file);
  }

  // 下載範例檔案
  public onExportExcel() {
    this.service.downloadTemplate();
  }

  public onSubmit(): void {
    const value = this.dataForm.value;
    this.handleSubmit(this.dataForm, () => {
      const strategy = StatusProcessorFactory.createStrategy(
        this.isFormCreateable,
        value,
        this.service,
        this.ecrDetailMap,
        this.tltDetailMap
      );

      const ecrList = strategy.processEcrList();
      const talentList = strategy.processTalentList();

      const payload: PodRequest = {
        pod_info: {
          ...(this.isFormCreateable ? {} : { pod_no: this.rowdata?.pod_no }),
          ...(this.isFormCreateable ? {} : { id: this.rowdata?.id }),
          pod_desc: value.pod_desc || '',
          pod_sdate: value.pod_sdate || new Date(),
          pod_edate: value.pod_edate || this.dateE,
          pod_status: ApprovalStatus.未核准,
        },
        ecr_list: ecrList,
        talent_list: talentList,
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
              ECR_Nos: this.df.ECR_Nos.value,
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

  public dialogChange(event: DropdownChangeEvent): void {
    console.log(`dialogChange:`, [event]);
  }

  public onClear(): void {
    this.dataForm.reset({
      pod_no: '自動給號',
      pod_desc: void 0,
      pod_sdate: new Date(),
      pod_edate: this.dateE,
      pod_busdate: this.dateE,
      pod_status: '未核准',
      ECR_Nos: [],
      tlt_nos: [],
      sys3800: void 0,
      sys3900: void 0,
    });
  }

  public ngOnDestroy(): void {
    this.service.TLS26010Detail.set(undefined);
  }
}
