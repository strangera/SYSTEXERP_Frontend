import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin, map } from 'rxjs';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { Tls41040Service } from '../../../service/api/tls/tls41040.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { DropDownListService, IDropdownItem } from './../../../service/utility/dropDownList.service';

// ===== 定義 TLS41040 明細型別 =====
export interface TLS41040Detail {
  ID?: number;             // 明細 ID
  STO_No?: string;         // ← 後端主檔編號
  NOT_DateTime?: string;   // ← 後端通告時間
  NOT_SeqNo?: number;      // ← 通告序號
  TLT_No?: string;         // 專櫃編號
  ECR_Type?: string;       // 機台類型
  ECR_GrpNo?: string | null; // 機台群組編號
  BUILDING_No?: string;    // 館別
  FLOOR_No?: string;       // 樓層
  Area_No?: string;        // 區域
  status?: string;         // 狀態
}


@Component({
  selector: 'app-tls41040-cru',
  templateUrl: './tls41040-cru.component.html',
  styleUrls: ['./tls41040-cru.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    RadiobuttonComponent,
    ButtonComponent,
    CommonModule,
    TableComponent,
    InputTextareaComponent,
    TableEditComponent,
  ]
})
export class TLS41040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  private originalSnapshot: TLS41040Detail[] = [];
  // ===== 主檔表單 =====
  dataForm = this.formBuilder.group({
    NOT_DateTime: [new Date(), [Validators.required]],
    NOT_BegDateTime: [new Date(), [Validators.required]],
    NOT_EndDateTime: [new Date(), [Validators.required]],
    NOT_Status: ['A', [Validators.required]],
    NOT_Remark: ['', [Validators.maxLength(200)]],
    NOT_Desc: ['', [Validators.maxLength(2000)]],
    NOT_DispRt: ['Y'],
    NOT_DispSpd: ['Y'],
    NOT_DispBtn: ['Y'],
    NOT_DispCd: ['Y'],
    NOT_Prn: ['Y'],
    NOT_DtlLimit: ['Y'],
  });
  TLTTALENT_OPTIONS: IDropdownItem[] = [];
  ECR_Type_Options: IDropdownItem[] = [];
  ECR_GrpNoOptions: IDropdownItem[] = [];
  SYS3700_Options: IDropdownItem[] = [];
  SYS3800_Options: IDropdownItem[] = [];
  SYS3A00_Options: IDropdownItem[] = [];
  NOT_Status_Option: any[] = [
    { value: 'A', label: '啟用' },
    { value: 'D', label: '停用' },
  ];
  columns: EditColumn[] = [];
  data: TLS41040Detail[] = [];
  selectedRows: any[] = [];


  constructor(
    private locationOptionsService: LocationOptionsService,
    private dropDownListService: DropDownListService,
    private tls41040Service: Tls41040Service
    ,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41040', this.dataForm);

    // 確保主檔ID正確
    if (this.rowdata?.ID) {
      console.log('帶入主檔 ID:', this.rowdata.ID);
    } else {
      console.warn(' 無主檔 ID，更新會失敗');
    }
    this.loadDropdownOptions();

    this.data = (this.rowdata?.Details ?? []).map((d: TLS41040Detail) => ({
      ...d,
      ID: d.ID ?? 0,
      status: 'original'
    }));
    this.originalSnapshot = JSON.parse(JSON.stringify(this.data));
  }
  private loadDropdownOptions(): void {
    forkJoin({
      // ===== 機台群組 =====
      ECR_GrpNo: this.dropDownListService
        .queryPOS1002GRM_DropDownList()
        .pipe(
          map(res => (res?.Data ?? []).map((it: any): IDropdownItem => ({
            No: it.No,
            Name: it.Name,
            value: it.No,
            label: `${it.No}-${it.Name}`,
          })))
        ),

      // ===== 機台類型 =====
      ECR_Type: this.dropDownListService
        .querySYS1000_DropDownList({ SYS_Type: 'ECR_Type', SYS_Status: 'A' } as any)
        .pipe(
          map(res => (res?.Data ?? []).map((it: any): IDropdownItem => ({
            No: it.No ?? it.SYS_Code,
            Name: it.Name ?? it.SYS_Name ?? '',
            value: it.No ?? it.SYS_Code,
            label: it.Name ?? it.SYS_Name ?? '',
          })))
        ),

      // ===== 專櫃 =====
      TLT: this.dropDownListService
        .queryTLTTALENT_DropDownList()
        .pipe(
          map(res => (res?.Data ?? []).map((item: any): IDropdownItem => ({
            No: item.No,
            Name: item.Name,
            value: item.No,
            label: `${item.No}-${item.Name}`,
          })))
        ),

      // ===== 館別 =====
      BUILDING: this.locationOptionsService.getBuildingOptions().pipe(
        map(res => res.map((x: any): IDropdownItem => ({
          No: x.No ?? x.value,
          Name: x.Name ?? x.label,
          value: x.No ?? x.value,
          label: x.Name ?? x.label,
        })))
      ),

      // ===== 樓層 =====
      FLOOR: this.locationOptionsService.getFloorOptions().pipe(
        map(res => res.map((x: any): IDropdownItem => ({
          No: x.No ?? x.value,
          Name: x.Name ?? x.label,
          value: x.No ?? x.value,
          label: x.Name ?? x.label,
        })))
      ),

      // ===== 區域 =====
      AREA: this.locationOptionsService.getRegionOptions().pipe(
        map(res => res.map((x: any): IDropdownItem => ({
          No: x.No ?? x.value,
          Name: x.Name ?? x.label,
          value: x.No ?? x.value,
          label: x.Name ?? x.label,
        })))
      ),
    })
      .subscribe(res => {
        this.ECR_GrpNoOptions = res.ECR_GrpNo;
        this.ECR_Type_Options = res.ECR_Type;
        this.TLTTALENT_OPTIONS = res.TLT;
        this.SYS3700_Options = res.BUILDING;
        this.SYS3800_Options = res.FLOOR;
        this.SYS3A00_Options = res.AREA;
        this.loadAndSetupColumns();
        this.columns = Array.isArray(this.columns) ? [...this.columns] : this.columns;
        this.data = Array.isArray(this.data) ? [...this.data] : this.data;
        try { this.cdr.detectChanges(); } catch { /* no-op if not available */ }
      });
  }


  private loadAndSetupColumns(): void {
    this.columns = [
      {
        field: 'TLT_No',
        header: '專櫃編號',
        type: 'dropdown',
        options: this.TLTTALENT_OPTIONS,
        optionLabel: 'label',
        optionValue: 'value',
        disabled: (_value, _index, row) => this.isOtherGroupSelected(row)
      },
      {
        field: 'ECR_Type',
        header: '機台類型',
        type: 'dropdown',
        options: this.ECR_Type_Options,
        optionLabel: 'label',
        optionValue: 'value',
        disabled: (_value, _index, row) => this.isOtherGroupSelected(row)
      },
      {
        field: 'ECR_GrpNo',
        header: '機台群組編號',
        type: 'dropdown',
        options: this.ECR_GrpNoOptions,
        optionLabel: 'label',
        optionValue: 'value',
        disabled: (_value, _index, row) => this.isEcrGrpNoSelected(row)
      },
      {
        field: 'BUILDING_No',
        header: '館別',
        type: 'dropdown',
        options: this.SYS3700_Options,
        optionLabel: 'label',
        optionValue: 'value',
        disabled: (_value, _index, row) => this.isOtherGroupSelected(row)
      },
      {
        field: 'FLOOR_No',
        header: '樓層',
        type: 'dropdown',
        options: this.SYS3800_Options,
        optionLabel: 'label',
        optionValue: 'value',
        disabled: (_value, _index, row) => this.isOtherGroupSelected(row)
      },
      {
        field: 'Area_No',
        header: '區域',
        type: 'dropdown',
        options: this.SYS3A00_Options,
        optionLabel: 'label',
        optionValue: 'value',
        disabled: (_value, _index, row) => this.isOtherGroupSelected(row)
      },
    ];
  }



  // 檢查其他互斥欄位是否有值
  isOtherGroupSelected(rowData: any): boolean {
    return !!(rowData['ECR_GrpNo'] && rowData['ECR_GrpNo'] !== '');
  }
  // 檢查機台群組編號是否有值
  isEcrGrpNoSelected(rowData: any): boolean {
    return !!(
      (rowData.TLT_No && rowData.TLT_No.trim()) ||
      (rowData.ECR_Type && rowData.ECR_Type.trim()) ||
      (rowData.BUILDING_No && rowData.BUILDING_No.trim()) ||
      (rowData.FLOOR_No && rowData.FLOOR_No.trim()) ||
      (rowData.Area_No && rowData.Area_No.trim())
    );
  }
  /** Insert payload */
  private createInsertBody(frm: FormGroup) {
    const raw = frm.getRawValue();

    const toIso = (d: any) => {
      if (d === null || d === undefined || d === '') return null;
      try {
        const dt = new Date(d);
        return isNaN(dt.getTime()) ? null : dt.toISOString();
      } catch {
        return null;
      }
    };

    return {
      NOT_DateTime: toIso(raw.NOT_DateTime),
      NOT_BegDateTime: toIso(raw.NOT_BegDateTime),
      NOT_EndDateTime: toIso(raw.NOT_EndDateTime),
      NOT_Status: raw.NOT_Status,
      NOT_Remark: raw.NOT_Remark,
      NOT_Desc: raw.NOT_Desc,
      NOT_DispRt: raw.NOT_DispRt,
      NOT_DispSpd: raw.NOT_DispSpd,
      NOT_DispBtn: raw.NOT_DispBtn,
      NOT_DispCd: raw.NOT_DispCd,
      NOT_Prn: raw.NOT_Prn,
      NOT_DtlLimit: raw.NOT_DtlLimit,

      Detail: this.data.map(d => {
        const clone = { ...d } as any;
        // 群組互斥欄位處理
        if (clone.ECR_GrpNo) {
          clone.TLT_No = '';
          clone.ECR_Type = '';
          clone.BUILDING_No = '';
          clone.FLOOR_No = '';
          clone.Area_No = '';
        } else {
          clone.ECR_GrpNo = null;
        }
        return {
          NOT_SeqNo: null,
          TLT_No: clone.TLT_No ?? '',
          ECR_Type: clone.ECR_Type ?? '',
          ECR_GrpNo: clone.ECR_GrpNo ?? null,
          BUILDING_No: clone.BUILDING_No ?? '',
          FLOOR_No: clone.FLOOR_No ?? '',
          Area_No: clone.Area_No ?? '',
          status: 'new',
        };
      })
    };
  }

  private createUpdateBody(frm: FormGroup) {
    const raw = frm.getRawValue();
    return {
      ID: Number(this.rowdata?.ID ?? 0),
      STO_No: this.rowdata?.STO_No ?? '',
      NOT_DateTime: raw.NOT_DateTime,
      NOT_BegDateTime: raw.NOT_BegDateTime,
      NOT_EndDateTime: raw.NOT_EndDateTime,
      NOT_Status: raw.NOT_Status,
      NOT_Remark: raw.NOT_Remark,
      NOT_Desc: raw.NOT_Desc,
      NOT_DispRt: raw.NOT_DispRt,
      NOT_DispSpd: raw.NOT_DispSpd,
      NOT_DispBtn: raw.NOT_DispBtn,
      NOT_DispCd: raw.NOT_DispCd,
      NOT_Prn: raw.NOT_Prn,
      NOT_DtlLimit: raw.NOT_DtlLimit,

      Detail: this.data.map((d) => {
        const clone = { ...d };
        let status = clone.status ?? 'original';

        if (!clone.NOT_SeqNo) {
          status = 'new';
        } else if (clone.status === 'deleted') {
          status = 'deleted';
        } else if (clone.status === 'modified') {
          status = 'modified';
        }
        return {
          ID: clone.ID ?? 0,
          STO_No: clone.STO_No ?? this.rowdata?.STO_No ?? '',
          NOT_DateTime: clone.NOT_DateTime ?? raw.NOT_DateTime,
          NOT_SeqNo: !isNaN(Number(clone.NOT_SeqNo)) ? Number(clone.NOT_SeqNo) : null,
          TLT_No: clone.TLT_No ?? '',
          ECR_Type: clone.ECR_Type ?? '',
          ECR_GrpNo: clone.ECR_GrpNo ?? '',
          BUILDING_No: clone.BUILDING_No ?? '',
          FLOOR_No: clone.FLOOR_No ?? '',
          Area_No: clone.Area_No ?? '',
          status,
        };
      }),
    };
  }

  /** 明細資料驗證：互斥 + 唯一 + 至少一欄有值 */
  private validateDetailData(): boolean {
    const uniqueSet = new Set<string>();

    for (const d of this.data) {
      const ecrGrpNo = d.ECR_GrpNo?.trim() ?? '';
      const tltNo = d.TLT_No?.trim() ?? '';
      const ecrType = d.ECR_Type?.trim() ?? '';
      const building = d.BUILDING_No?.trim() ?? '';
      const floor = d.FLOOR_No?.trim() ?? '';
      const area = d.Area_No?.trim() ?? '';

      // --- 群組互斥檢查 ---
      if (ecrGrpNo && (tltNo || ecrType || building || floor || area)) {
        this.messageService.errorBubble('若設定了「機台群組編號」，其他欄位必須留空');
        return false;
      }

      // --- 至少一欄必填 ---
      if (!ecrGrpNo && !tltNo && !ecrType && !building && !floor && !area) {
        this.messageService.errorBubble('每筆明細至少要有一個欄位有設定值');
        return false;
      }

      // --- 唯一條件檢查 ---
      const key = ecrGrpNo
        ? `grp:${ecrGrpNo}`
        : `tlt:${tltNo}|type:${ecrType}|b:${building}|f:${floor}|a:${area}`;

      if (uniqueSet.has(key)) {
        this.messageService.errorBubble('明細設定條件重複，請檢查');
        return false;
      }
      uniqueSet.add(key);
    }

    return true;
  }
  onDataChange(updatedData: TLS41040Detail[]): void {
    this.data = updatedData.map((row) => {
      const snapshot = this.originalSnapshot.find((x) => x.NOT_SeqNo === row.NOT_SeqNo);

      if (!row.NOT_SeqNo || row.NOT_SeqNo === 0) {
        return { ...row, status: 'new' };
      }
      if (row.status === 'deleted') {
        return row;
      }
      if (snapshot) {
        const changed = Object.keys(row).some((key) => {
          if (['status', 'ID', 'STO_No', 'NOT_DateTime'].includes(key)) return false;
          const oldVal = snapshot[key as keyof TLS41040Detail] ?? '';
          const newVal = row[key as keyof TLS41040Detail] ?? '';
          return oldVal !== newVal;
        });
        if (changed) {
          return { ...row, status: 'modified' };
        }
      }
      return { ...row, status: row.status ?? 'original' };
    });
  }

  // ===== 儲存 =====
  onSubmit(frm: FormGroup): void {
    const detailValid = this.validateDetailData();
    if (!detailValid) return;
    if (!this.isFormCreateable && !this.isFormEditable) {
      const hasNew = Array.isArray(this.data) && this.data.some(d => d.status === 'new');
      if (hasNew) {
        this.crudstatus = CRUDStatus.Create;
      } else {
        this.messageService.errorBubble('目前為檢視模式，請使用「新增」或「編輯」進入可編輯模式後再送出');
        return;
      }
    }

    this.handleSubmit(frm, () => {
      this.loading = true;
      let body: any;
      let serviceCall;
      if (this.isFormCreateable) {
        body = this.createInsertBody(frm);
        serviceCall = this.tls41040Service.insertTLS41040(body);
      } else if (this.isFormEditable) {
        body = this.createUpdateBody(frm);
        serviceCall = this.tls41040Service.updateTLS41040(body);
      }
      serviceCall?.pipe(finalize(() => (this.loading = false))).subscribe({
        next: (res) => {
          this.messageService.successBubble(res.Message ?? '成功');
          if (this.isFormEditable) {
            this.originalSnapshot = JSON.parse(JSON.stringify(this.data));
            this.onCancel();
          } else if (this.isFormCreateable) {
            this.onCancel();
          }
        }
      });
    });
  }
  validateEntireRow(rowData: any) {
    if (!rowData.TLT_No && !rowData.ECR_Type && !rowData.ECR_GrpNo && !rowData.BUILDING_No && !rowData.FLOOR_No && !rowData.Area_No) {
      return { isValid: false, errorMessage: '至少其中一個有值' };
    }
    return { isValid: true, errorMessage: '' };
  }

  onDelete(selectedItems: TLS41040Detail[]): void {
    if (!selectedItems || selectedItems.length === 0) {
      this.messageService.errorBubble('請先勾選要刪除的明細');
      return;
    }
    for (const item of selectedItems) {
      const idx = this.data.findIndex(d => d.NOT_SeqNo === item.NOT_SeqNo);
      if (idx !== -1) {
        this.data[idx] = { ...this.data[idx], status: 'deleted' };
      }
    }
    this.data = [...this.data];
    this.onDataChange(this.data);
    this.selectedRows = [];
    this.messageService.successBubble('已標記刪除');
  }


}

