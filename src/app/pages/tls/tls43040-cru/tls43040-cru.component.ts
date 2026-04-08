import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin, map } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LocationOptionsService } from '@service/api/dropdownservice/location-options.service';
import { Sys0110Service } from '@service/api/sys/sys0110.service';
import { Tls43040Service } from '@service/api/tls/tls43040.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';

// 只用到欄位
interface SYS1000 {
  SYS_Type: string;
  SYS_Code: string;
  SYS_Name: string;
}

// 機台群組明細介面
export interface TLS43040Detail {
  ID?: number | string;
  ECR_GrpSeqNo?: number;
  ECR_No?: string;
  ECR_Type?: string;
  TLT_No?: string;
  BUILDING_No?: string;
  FLOOR_No?: string;
  Area_No?: string;
  status?: string;
}

@UntilDestroy()
@Component({
  selector: 'app-tls43040-cru',
  templateUrl: './tls43040-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
    TranslateModule,
    TableEditComponent,
    CommonModule,
  ],
})
export class TLS43040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  constructor(
    private locationOptionsService: LocationOptionsService,
    private sys0110Service: Sys0110Service,
    private dropDownListService: DropDownListService,
    private tls43040Service: Tls43040Service
  ) {
    super();
  }

  // ===== Form =====
  dataForm = this.formBuilder.nonNullable.group({
    ECR_GrpNo: [{ value: '自動編號', disabled: true }],
    ECR_GrpName: ['', [Validators.required, Validators.maxLength(64)]],
    ECR_GrpDesc: ['', [Validators.maxLength(255)]],
    ECR_DtlLimit: ['0', Validators.required],

  });

  // ===== 下拉資料源 =====
  ECR_DtlLimit_Options = [
    { value: "0", label: '不限制' },
    { value: "1", label: '符合明細設定的機台才列入群組' },
    { value: "2", label: '不符合明細設定的機台才列入群組' },
  ];
  POS1002_ECR_Options: { label: string; value: string }[] = [];
  SYS1000_ECRType_Options: { label: string; value: string }[] = [];
  SYS3700_Options: { label: string; value: string }[] = []; // 館別
  SYS3900_Options: { label: string; value: string }[] = []; // 樓層
  SYS3A00_Options: { label: string; value: string }[] = []; // 區域
  TLTTALENT_OPTIONS: { label: string; No: string; Name?: string }[] = [];

  isTableDisabled = false; // 控制 table 是否禁用
  private previousEcrDtlLimit: string | null = null; // 記錄上一次的選項值

  // 表格
  data: TLS43040Detail[] = [];
  selectedRows: TLS43040Detail[] = [];
  columns: EditColumn[] = [];
  // snapshot for cancel/restore
  private originalDataSnapshot: TLS43040Detail[] | null = null;
  private originalFormSnapshot: any = null;

  ngOnInit(): void {
    this.initializePage('TLS43040', this.dataForm);
    this.loadAndSetupColumns();
    console.log('選擇的資料 rowdata:', this.rowdata);
    console.log('選擇的資料的Details ECR_Details:', this.rowdata?.ECR_Details);
    console.log('表格資料data:', this.data);

    // capture snapshot so cancel can restore (both form and table data)
    this.captureOriginalSnapshot();
    try { this.originalFormSnapshot = this.dataForm.getRawValue(); } catch { this.originalFormSnapshot = null; }
    this.data = (this.rowdata?.ECR_Details ?? []).map((item: TLS43040Detail) => ({
      ...item,
      status: 'original'
    }));
    console.log('表格資料data:', this.data);

    // 設定初始值，但不清空資料
    const initialValue = this.dataForm.controls.ECR_DtlLimit.value;
    this.previousEcrDtlLimit = initialValue;
    this.isTableDisabled = initialValue === "0";

    // 監聽下拉選單變化
    this.dataForm.controls.ECR_DtlLimit.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(value => {
        this.onEcrDtlLimitChange(value);
      });
  }

  // capture deep copy snapshot of current data for restore on cancel
  private captureOriginalSnapshot(): void {
    try {
      this.originalDataSnapshot = JSON.parse(JSON.stringify(this.data || []));
    } catch (err) {
      this.originalDataSnapshot = null;
    }
  }

  // restore table data back to captured snapshot (used by cancel button)
  onCancelClicked(): void {
    // If no captured snapshot but rowdata exists (loaded from query), use rowdata as fallback
    if ((!this.originalDataSnapshot || this.originalDataSnapshot.length === 0) && this.rowdata?.ECR_Details?.length) {
      try {
        this.originalDataSnapshot = (this.rowdata.ECR_Details ?? []).map((item: TLS43040Detail) => ({ ...item }));
        this.originalFormSnapshot = {
          ECR_GrpNo: this.rowdata?.ECR_GrpNo ?? this.dataForm.controls.ECR_GrpNo.value,
          ECR_GrpName: this.rowdata?.ECR_GrpName ?? this.dataForm.controls.ECR_GrpName.value,
          ECR_DtlLimit: this.rowdata?.ECR_DtlLimit ?? this.dataForm.controls.ECR_DtlLimit.value,
          ECR_GrpDesc: this.rowdata?.ECR_GrpDesc ?? this.dataForm.controls.ECR_GrpDesc.value,
        };
      } catch (err) {
        // ignore
      }
    }

    if (this.originalDataSnapshot) {
      // deep copy
      this.data = JSON.parse(JSON.stringify(this.originalDataSnapshot));
      // ensure statuses are original
      this.data = this.data.map(d => ({ ...d, status: 'original' }));
      this.selectedRows = [];
      try {
        if (this.originalFormSnapshot) {
          // restore main form values to the captured snapshot
          this.dataForm.reset(this.originalFormSnapshot);
        } else {
          this.dataForm.markAsPristine();
        }
      } catch { }
    } else {
      // fallback: clear table and selection
      this.resetTable();
    }
  }

  // ===== 載入下拉並設定 columns =====
  private loadAndSetupColumns(): void {
    const pos1002Options$ = this.dropDownListService.queryPOS1002_DropDownList().pipe(
      map((res: any) => (res?.Data ?? []).map((x: any) => {
        const no = x.No ?? x.ECR_No ?? x.value ?? '';
        const name = x.Name ?? x.ECR_Name ?? x.label ?? '';
        return { label: name ? `${no} - ${name}` : `${no}`, value: no };
      }))
    );

    const ecrTypeOptions$ = this.sys0110Service.queryAllSystemCode({}).pipe(
      map((res: any) =>
        (res?.Data ?? [])
          .filter((x: SYS1000) => x.SYS_Type === 'ECR_Type')
          .map((x: SYS1000) => ({ label: `${x.SYS_Code}-${x.SYS_Name}`, value: x.SYS_Code }))
      )
    );

    const buildingOptions$ = this.locationOptionsService.getBuildingOptions();
    const floorOptions$ = this.locationOptionsService.getFloorOptions();
    const regionOptions$ = this.locationOptionsService.getRegionOptions();

    const tltTalentOptions$ = this.sys0110Service.queryTLTTALENT_DropDownList({}).pipe(
      map((res: any) => (res?.Data ?? []).map((i: any) => ({
        ...i,
        label: `${i.No}-${i.Name}`,
        value: i.No,
        No: i.No,
      })))
    );

    forkJoin(
      pos1002Options$,
      ecrTypeOptions$,
      buildingOptions$,
      floorOptions$,
      regionOptions$,
      tltTalentOptions$,
    )
      .pipe(untilDestroyed(this))
      .subscribe(([POS1002_ECR_Options, SYS1000_ECRType_Options, SYS3700_Options, SYS3900_Options, SYS3A00_Options, TLTTALENT_OPTIONS]) => {
        this.POS1002_ECR_Options = POS1002_ECR_Options ?? [];
        this.SYS1000_ECRType_Options = SYS1000_ECRType_Options ?? [];
        this.SYS3700_Options = SYS3700_Options ?? [];
        this.SYS3900_Options = SYS3900_Options ?? [];
        this.SYS3A00_Options = SYS3A00_Options ?? [];
        this.TLTTALENT_OPTIONS = TLTTALENT_OPTIONS ?? [];

        this.columns = [
          { field: 'ECR_No', header: '收銀機號', type: 'dropdown', options: this.POS1002_ECR_Options, optionLabel: 'label', optionValue: 'value' },
          { field: 'ECR_Type', header: '機台類型', type: 'dropdown', options: this.SYS1000_ECRType_Options, optionLabel: 'label', optionValue: 'value' },
          { field: 'TLT_No', header: '專櫃編號', type: 'dropdown', options: this.TLTTALENT_OPTIONS, optionLabel: 'label', optionValue: 'value' },
          { field: 'BUILDING_No', header: '館別代碼', type: 'dropdown', options: this.SYS3700_Options, optionLabel: 'label', optionValue: 'value' },
          { field: 'FLOOR_No', header: '樓層代碼', type: 'dropdown', options: this.SYS3900_Options, optionLabel: 'label', optionValue: 'value' },
          { field: 'Area_No', header: '區域', type: 'dropdown', options: this.SYS3A00_Options, optionLabel: 'label', optionValue: 'value' },
        ];
      });
  }


  onEcrDtlLimitChange(value: string) {
    this.isTableDisabled = value === "0";
    console.log("ECR_DtlLimit 選擇:", value, "→ tableDisabled:", this.isTableDisabled);

    // 只有在真正切換選項時才清空表格資料（排除初始化）
    if (this.previousEcrDtlLimit !== null && this.previousEcrDtlLimit !== value) {
      console.log("選項已改變，清空表格資料");
      this.resetTable();
    }

    this.previousEcrDtlLimit = value;
  }


  onSubmit(form: FormGroup): void {

    if (form.valid) {
      const raw = form.getRawValue();

      // 驗證：若選擇「符合明細設定的機台才列入群組」或「不符合明細設定的機台才列入群組」，需至少有一筆明細
      if ((raw.ECR_DtlLimit === '1' || raw.ECR_DtlLimit === '2') && this.visibleData.length === 0) {
        this.messageService.errorBubble('請至少新增一筆明細資料');
        return;
      }

      const payload = {
        ID: this.isFormCreateable ? 0 : Number(this.rowdata?.ID ?? 0),
        ECR_GrpNo: (!raw.ECR_GrpNo || raw.ECR_GrpNo === '自動編號') ? '' : raw.ECR_GrpNo,
        ECR_GrpName: raw.ECR_GrpName,
        ECR_DtlLimit: raw.ECR_DtlLimit,
        ECR_GrpDesc: raw.ECR_GrpDesc,
        Detail: this.data.map((item, index) => {
          let detailStatus = item.status;


          if (typeof item.ID === 'string' || !item.ID) {
            detailStatus = 'new';
          } else if (item.status === 'deleted') {
            detailStatus = 'deleted';
          } else if (!item.status || item.status === 'original') {
            detailStatus = 'modified';
          }

          return {
            ID: (typeof item.ID === 'string' || item.ID == null) ? 0 : Number(item.ID),
            ECR_GrpSeqNo: item.ECR_GrpSeqNo ?? index,
            ECR_No: item.ECR_No ?? '',
            ECR_Type: item.ECR_Type ?? '',
            TLT_No: item.TLT_No ?? '',
            BUILDING_No: item.BUILDING_No ?? '',
            FLOOR_No: item.FLOOR_No ?? '',
            Area_No: item.Area_No ?? '',
            status: detailStatus
          };
        })


      };

      console.log('送出的 payload:', payload);

      if (!raw.ECR_GrpNo || raw.ECR_GrpNo === '自動編號') {
        // 新增
        this.tls43040Service
          .insertTLS43040(payload)
          .pipe(finalize(() => this.loading = false), untilDestroyed(this))
          .subscribe({
            next: (res) => {
              this.messageService.successBubble(res.Message);
              this.onCancel();
            },
          });
      } else {
        // 更新
        this.tls43040Service
          .updateTLS43040(payload)
          .pipe(finalize(() => this.loading = false), untilDestroyed(this))
          .subscribe({
            next: (res) => {
              this.messageService.successBubble(res.Message);
              this.onCancel();
            },
          });
      }
    } else {
      this.submitted = true;
      try { form.markAllAsTouched(); } catch { }
      try { this.messageService.clearBubble(); } catch { }
      setTimeout(() => {
        this.messageService.errorBubble('必填欄位未填');
      }, 50);
      return;
    }
  }



  resetTable() {
    this.data = [];
    this.selectedRows = [];
  }

  onDataChange(updatedData: TLS43040Detail[]): void {
    // 保留所有被標記為刪除的資料
    const deletedItems = this.data.filter(d => d.status === 'deleted');

    // 處理更新的資料（排除已經是 deleted 狀態的）
    const processedData = updatedData
      .filter(row => row.status !== 'deleted')
      .map((row) => {
        if (!row.ID || row.ID === 0 || typeof row.ID === 'string') {
          return { ...row, status: 'new' };
        }
        return { ...row, status: row.status ?? 'modified' };
      });

    // 合併時使用 Map 去重，優先保留 processedData 中的資料
    const dataMap = new Map<number | string, TLS43040Detail>();

    // 先加入被刪除的資料
    deletedItems.forEach(item => {
      const key = item.ID ?? `temp_${Math.random()}`;
      dataMap.set(key, item);
    });

    // 再加入處理後的資料（會覆蓋相同 ID 的項目）
    processedData.forEach(item => {
      const key = item.ID ?? `temp_${Math.random()}`;
      dataMap.set(key, item);
    });

    this.data = Array.from(dataMap.values());
  }

  onDelete(selectedItems: TLS43040Detail[]): void {
    if (!selectedItems || selectedItems.length === 0) {
      this.messageService.errorBubble('請先勾選要刪除的明細');
      return;
    }
    for (const item of selectedItems) {
      const idx = this.data.findIndex(d => d.ID === item.ID);
      if (idx !== -1) {
        this.data[idx] = { ...this.data[idx], status: 'deleted' };
      }
    }
    this.data = [...this.data];
    // 不需要調用 onDataChange，因為我們已經直接更新了 this.data
    this.selectedRows = [];
    this.messageService.successBubble('已標記刪除');
  }

  get visibleData() {
    return this.data.filter((d) => d.status !== 'deleted');
  }
}
