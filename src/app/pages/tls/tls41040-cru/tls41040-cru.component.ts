import { DropDownListService } from './../../../service/utility/dropDownList.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { forkJoin, map, finalize } from 'rxjs';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { Tls41040Service } from '../../../service/api/tls/tls41040.service';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { Column } from '@shared/componentkit/table-edit/table-edit.model';

// ===== 定義 TLS41040 明細型別 =====
export interface TLS41040Detail {
  ID?: number;            // 明細 ID
  NOT_SeqNo?: string;     // 通告序號 (後端自動給號)
  TLT_No?: string;        // 專櫃編號
  ECR_Type?: string;      // 機台類型
  ECR_GrpNo?: string | null;     // 機台群組編號
  BUILDING_No?: string;   // 館別
  FLOOR_No?: string;      // 樓層
  Area_No?: string;       // 區域
  status?: string;        // 狀態
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
    TableEditComponent
  ]
})
export class TLS41040CRUComponent extends BasicCruPageComponent<any> implements OnInit {

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

  // 狀態選單
  NOT_Status_Option: any[] = [
    { value: 'A', label: '已生效（預設）' },
    { value: 'D', label: '已刪除' },
  ];

  // Table 欄位
  columns: Column[] = [];

  // 下拉選項
  SYS3700_Options: { value: string; label: string }[] = [];
  SYS3800_Options: { value: string; label: string }[] = [];
  SYS3A00_Options: { value: string; label: string }[] = [];
  ECR_Type_Options: { value: string; label: string }[] = [];
  TLTTALENT_OPTIONS: { value: string; label: string }[] = [];
  ECR_GrpNoOptions: { value: string; label: string }[] = [];

  // 明細資料
  data: TLS41040Detail[] = [];
  selectedRows: TLS41040Detail[] = [];

  constructor(
    private locationOptionsService: LocationOptionsService,
    private dropDownListService: DropDownListService,
    private tls41040Service: Tls41040Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41040', this.dataForm);
    this.loadAndSetupColumns();
    this.data = this.rowdata?.Details ?? [];
  }

  // ===== 載入選項並設定 Table 欄位 =====
  private loadAndSetupColumns() {
    const ECR_GrpNo$ = this.dropDownListService.queryPOS1002GRM_DropDownList()
      .pipe(map(res => (res?.Data ?? []).map((it: any) => ({
        value: it.No,
        label: `${it.No}-${it.Name}`
      }))));

    const ECR_Type$ = this.dropDownListService
      .querySYS1000_DropDownList({ SYS_Type: 'ECR_Type', SYS_Status: 'A' } as any)
      .pipe(map(res => (res?.Data ?? []).map((it: any) => ({
        value: it.No ?? it.SYS_Code,
        label: it.Name ?? it.SYS_Name ?? ''
      }))));

    const TLTTALENT_OPTIONS$ = this.dropDownListService.queryTLTTALENT_DropDownList()
      .pipe(map(res => res.Data.map((item: any) => ({
        value: item.No,
        label: `${item.No}-${item.Name}`
      }))));

    const Building_No$ = this.locationOptionsService.getBuildingOptions().pipe(
      map((res: any[]) => res.map(x => ({ value: x.No ?? x.value, label: x.Name ?? x.label })))
    );

    const Floor_No$ = this.locationOptionsService.getFloorOptions().pipe(
      map((res: any[]) => res.map(x => ({ value: x.No ?? x.value, label: x.Name ?? x.label })))
    );

    const Area_No$ = this.locationOptionsService.getRegionOptions().pipe(
      map((res: any[]) => res.map(x => ({ value: x.No ?? x.value, label: x.Name ?? x.label })))
    );

    forkJoin({
      TLT_No: TLTTALENT_OPTIONS$,
      ECR_Type: ECR_Type$,
      ECR_GrpNo: ECR_GrpNo$,
      Building_No: Building_No$,
      Floor_No: Floor_No$,
      Area_No: Area_No$,
    }).subscribe(({ TLT_No, ECR_Type, ECR_GrpNo, Building_No, Floor_No, Area_No }) => {
      this.TLTTALENT_OPTIONS = TLT_No ?? [];
      this.ECR_Type_Options = ECR_Type ?? [];
      this.ECR_GrpNoOptions = ECR_GrpNo ?? [];
      this.SYS3700_Options = Building_No ?? [];
      this.SYS3800_Options = Floor_No ?? [];
      this.SYS3A00_Options = Area_No ?? [];

      this.columns = [
        { field: 'NOT_SeqNo', header: '通告序號', format: (value) => this.isFormCreateable ? '自動給號' : value },
        { field: 'TLT_No', header: '專櫃編號', type: 'dropdown', options: this.TLTTALENT_OPTIONS, optionLabel: 'label', optionValue: 'value', disabled: (rowData) => this.isOtherGroupSelected(rowData) },
        { field: 'ECR_Type', header: '機台類型', type: 'dropdown', options: this.ECR_Type_Options, optionLabel: 'label', optionValue: 'value', disabled: (rowData) => this.isOtherGroupSelected(rowData) },
        { field: 'ECR_GrpNo', header: '機檯群組編號', type: 'dropdown', options: this.ECR_GrpNoOptions, optionLabel: 'label', optionValue: 'value', disabled: (rowData) => this.isEcrGrpNoSelected(rowData) },
        { field: 'BUILDING_No', header: '館別代碼', type: 'dropdown', options: this.SYS3700_Options, optionLabel: 'label', optionValue: 'value', disabled: (rowData) => this.isOtherGroupSelected(rowData) },
        { field: 'FLOOR_No', header: '樓層代碼', type: 'dropdown', options: this.SYS3800_Options, optionLabel: 'label', optionValue: 'value', disabled: (rowData) => this.isOtherGroupSelected(rowData) },
        { field: 'Area_No', header: '區域代碼', type: 'dropdown', options: this.SYS3A00_Options, optionLabel: 'label', optionValue: 'value', disabled: (rowData) => this.isOtherGroupSelected(rowData) },
      ];
    });
  }

  // 檢查其他互斥欄位是否有值
  isOtherGroupSelected(rowData: any): boolean {
    return !!(rowData['ECR_GrpNo'] && rowData['ECR_GrpNo'] !== '');
  }
  // 檢查機台群組編號是否有值
  isEcrGrpNoSelected(rowData: any): boolean {
    return !!(rowData['ECR_No'] || rowData['TLT_No'] || rowData['ECR_Type'] || rowData['BUILDING_No'] || rowData['FLOOR_No'] || rowData['Area_No']);
  }

  /** Insert payload */
  private createInsertBody(frm: FormGroup) {
    const raw = frm.getRawValue();

    return {
      ...raw,
      Detail: this.data.map(d => {
        const clone = { ...d };

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
          TLT_No: clone.TLT_No ?? '',
          ECR_Type: clone.ECR_Type ?? '',
          ECR_GrpNo: clone.ECR_GrpNo ?? null,
          BUILDING_No: clone.BUILDING_No ?? '',
          FLOOR_No: clone.FLOOR_No ?? '',
          Area_No: clone.Area_No ?? '',
          status: 'new'
        };
      })
    };
  }
  private createUpdateBody(frm: FormGroup) {
    const raw = frm.getRawValue();

    return {
      ID: Number(this.rowdata?.ID ?? 0),   // 確保是數字
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
      Detail: this.data.map((d, i) => {
        const clone = { ...d };

        return {
          ID: isNaN(Number(clone.ID)) ? 0 : Number(clone.ID),
          NOT_SeqNo: clone.NOT_SeqNo ? Number(clone.NOT_SeqNo) : 0,
          TLT_No: clone.TLT_No ?? '',
          ECR_Type: clone.ECR_Type ?? '',
          ECR_GrpNo: clone.ECR_GrpNo ?? '',
          BUILDING_No: clone.BUILDING_No ?? '',
          FLOOR_No: clone.FLOOR_No ?? '',
          Area_No: clone.Area_No ?? '',
          status: clone.status ?? 'A'
        };
      })
    };
  }

  // ===== 儲存 =====
  onSubmit(frm: FormGroup): void {
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
          if (this.isFormCreateable) {
            this.dataForm.reset();
          } else if (this.isFormEditable) {
            this.onCancel();
          }
        },
        error: (err) => {
          this.messageService.errorBubble('失敗');
          console.error('TLS41040 API 失敗:', err);
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
}
