import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarRangeComponent } from "@shared/componentkit/calendar-range/calendar-range.component";
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { TLS41040Data, TLS41040Detail, TLS41040SaveReq, Tls41040Service } from '../../../service/api/tls/tls41040.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';

@Component({
  selector: 'app-tls41040-cru',
  templateUrl: './tls41040-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarComponent,
    RadiobuttonComponent,
    ButtonComponent,
    CommonModule,
    InputTextareaComponent,
    TableEditComponent,
    CalendarRangeComponent,
  ]
})
export class TLS41040CRUComponent extends BasicCruPageComponent<TLS41040Data> implements OnInit {
  dataForm = this.formBuilder.group({
    NOT_DateTime: [{ value: new Date(), disabled: true }],
    NOT_BegDateTime: [new Date(new Date().setHours(0, 0, 0, 0)), [Validators.required]],
    NOT_EndDateTime: [new Date(new Date().setHours(23, 59, 59, 999)), [Validators.required]],
    NOT_Status: [{ value: 'A', disabled: true }],
    NOT_Remark: ['', [Validators.maxLength(200)]],
    NOT_Desc: ['', [Validators.maxLength(2000)]],
    NOT_DispRt: ['Y'],
    NOT_DispSpd: ['Y'],
    NOT_DispBtn: ['Y'],
    NOT_DispCd: ['Y'],
    NOT_Prn: ['Y'],
    NOT_DtlLimit: ['Y'],
  });
  TLTTALENT_OPTIONS$ = this.dropDown.queryTLTTALENT_TLS41040();
  ECR_Type_Options = getSYS1000Options('ECR_Type');
  ECR_GrpNoOptions$ = this.dropDown.queryPos1002Grm();
  SYS3700_Options$ = this.dropDown.querySys3A00();
  SYS3800_Options$ = this.dropDown.querySys3900();
  SYS3A00_Options$ = this.dropDown.querySys3A00();
  ECR_NoOptions$ = this.dropDown.queryPos1002();
  NOT_Status_Option = [{ value: 'A', label: '已生效' }, { value: 'D', label: '已刪除' },];
  columns: EditColumn[] = [
    { field: 'ECR_GrpNo', header: '機台群組編號', type: 'dropdown', width: '100%', options: () => this.ECR_GrpNoOptions$, optionsAsync: true, optionLabel: 'label', optionValue: 'value', disabled: (_value, _index, row) => this.isEcrGrpNoSelected(row) },
    { field: 'ECR_No', header: '收銀機號', type: 'dropdown', width: '100%', options: () => this.ECR_NoOptions$, optionsAsync: true, optionLabel: 'label', optionValue: 'value', disabled: (_value, _index, row) => this.isOtherGroupSelected(row) },
    { field: 'TLT_No', header: '專櫃編號', type: 'dropdown', width: '100%', options: () => this.TLTTALENT_OPTIONS$, optionsAsync: true, optionLabel: 'label', optionValue: 'value', disabled: (_value, _index, row) => this.isOtherGroupSelected(row) },
    { field: 'ECR_Type', header: '機台類型', type: 'dropdown', width: '100%', options: () => this.ECR_Type_Options, optionsAsync: true, optionLabel: 'label', optionValue: 'value', disabled: (_value, _index, row) => this.isOtherGroupSelected(row) },
    { field: 'BUILDING_No', header: '館別', type: 'dropdown', width: '100%', options: () => this.SYS3700_Options$, optionsAsync: true, optionLabel: 'Name', optionValue: 'No', disabled: (_value, _index, row) => this.isOtherGroupSelected(row) },
    { field: 'FLOOR_No', header: '樓層', type: 'dropdown', width: '100%', options: () => this.SYS3800_Options$, optionsAsync: true, optionLabel: 'Name', optionValue: 'No', disabled: (_value, _index, row) => this.isOtherGroupSelected(row) },
    { field: 'Area_No', header: '區域', type: 'dropdown', width: '100%', options: () => this.SYS3A00_Options$, optionsAsync: true, optionLabel: 'Name', optionValue: 'No', disabled: (_value, _index, row) => this.isOtherGroupSelected(row) },
  ];
  data: TLS41040Detail[] = [];
  selectedRows: TLS41040Detail[] = [];
  constructor(
    private readonly tls41040Service: Tls41040Service,
    private readonly dropDown: DropdownApiService,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS41040', this.dataForm);
    if (this.rowdata) {
      this.data = this.rowdata?.Details;
    }
  }
  // 檢查其他互斥欄位是否有值
  private isOtherGroupSelected(rowData: TLS41040Detail): boolean {
    return !!(rowData?.['ECR_GrpNo'] && rowData?.['ECR_GrpNo'] !== '');
  }
  // 檢查機台群組編號是否有值
  private isEcrGrpNoSelected(rowData: TLS41040Detail): boolean {
    return !!(rowData?.['ECR_No'] || rowData?.['TLT_No'] || rowData?.['ECR_Type'] || rowData?.['BUILDING_No'] || rowData?.['FLOOR_No'] || rowData?.['Area_No']);
  }
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const tableValid = this.tableEditComponent.validateAndShowErrors();
      if (!tableValid) {
        this.loading = false;
        return;
      }
      const frmValue = frm.getRawValue();
      const req: TLS41040SaveReq = {
        ...frmValue,
        ID: this.rowdata?.ID ?? 0,
        Detail: this.data,
      }
      const serviceCall = this.isFormCreateable ? this.tls41040Service.insertTLS41040(req) : this.tls41040Service.updateTLS41040(req);
      serviceCall?.pipe(finalize(() => (this.loading = false))).subscribe((res) => {
        this.messageService.successBubble(res.Message ?? '成功');
        this.onCancel();
      });
    });
  }
  validateEntireRow(rowData: TLS41040Detail) {
    if (!rowData.ECR_No && !rowData.TLT_No && !rowData.ECR_Type && !rowData.ECR_GrpNo && !rowData.BUILDING_No && !rowData.FLOOR_No && !rowData.Area_No) {
      return { isValid: false, errorMessage: '至少其中一個有值' };
    }
    return { isValid: true, errorMessage: '' };
  }
  /** 切換「是否限制播放條件」時的處理 */
  onNotDtlLimitChange(value: string): void {
    if (value === 'N') {
      this.data = [];
      this.selectedRows = [];
    }
  }
  /**
   * Cancel 按鈕被按下時呼叫：還原明細資料與已選列
   */
  onCancelClicked(): void {
  }
}

