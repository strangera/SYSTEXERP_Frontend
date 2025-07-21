import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule, TableRowSelectEvent, TableRowUnSelectEvent } from 'primeng/table';
import { POS5008Data } from '../../../../service/api/tls/tls24010.service';
import { Column } from '../../../../shared/componentkit/table/table.model';
import { CRD_TypeOptions, POS5008Columns } from '../tls24010-cru.model';
import { DropDownListService, IDropdownItem } from '../../../../service/utility/dropDownList.service';
import { SystemOption } from '../../../../shared/models/sys/sys1000.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SystemOptionsService } from '../../../../service/system/sys1000.service';
import { InputTextComponent } from '../../../../shared/componentkit/input-text/input-text.component';
import { InputNumberComponent } from '../../../../shared/componentkit/input-number/input-number.component';
import { DropdownComponent } from '../../../../shared/componentkit/dropdown/dropdown.component';

@UntilDestroy()
@Component({
  selector: 'app-tls24010-pos5008',
  standalone: true,
  imports: [
    TableModule,
    DividerModule,
    InputTextModule,
    InputTextComponent,
    InputNumberComponent,
    DropdownComponent,
    NgIf,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './tls24010-pos5008.component.html',
  styleUrls: ['./tls24010-pos5008.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tls24010Pos5008Component implements OnInit {
  @Input() submitted = false;
  form?: FormGroup;
  POS5008FormArray?: FormArray;
  POS5008Data: POS5008Data[] = [];
  POS5008SelectedItems: POS5008Data[] = [];
  POS5008Columns: Column[] = POS5008Columns;
  trackByRow = (index: number, item: POS5008Data) => { return item?.id || index; }
  CRD_TypeOptions = CRD_TypeOptions; //下拉選單 信用卡別
  PAY_TypeOptions: IDropdownItem[] = []; //下拉選單 付款別
  sys_typeOptions: SystemOption[] = []; // 下拉選單 分期數

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.POS5008FormArray = this.fb.array([]);
    this.form = this.fb.group({
      POS5008: this.POS5008FormArray
    });
  }
  ngOnInit(): void {
    //--付款明細------------------------------------------------------
    this.dropDownListService.queryPOS1006_DropDownList().pipe(untilDestroyed(this)).subscribe((res) => {
      this.PAY_TypeOptions = res.Data.map((item) => ({ ...item, label: item.Name }));
      const rows = res.Data.map((item, index) => {
        const row: POS5008Data = { ID: index, PAY_No: item.No, PAY_Name: item.Name, PAY_Type: item.PAY_Type, selected: false };
        this.POS5008FormArray?.push(this.createRowForm(row));
        return row;
      });
      this.POS5008Data = rows;
      this.sys_typeOptions = SystemOptionsService.getOptions('T109');
      this.cdr.markForCheck();
    });
  }
  createRowForm(row: POS5008Data): FormGroup {
    return this.fb.group({
      PAY_Name: [{ value: row.PAY_Name, disabled: true }],
      TXN_PayAmt: [null],
      CRD_Type: [''],
      CRD_No: ['', [Validators.maxLength(20)]],
      TXN_CouponNo: ['', [Validators.maxLength(50)]],
      TXN_PayDesc: ['', [Validators.maxLength(100)]],
      TERM_No: ['']
    });
  }
  get posFormArrayControls() {
    return this.POS5008FormArray?.controls as FormGroup[];
  }
  getFormControl(formGroup: FormGroup, controlName: string): FormControl {
    const ctrl = formGroup.get(controlName);
    if (!(ctrl instanceof FormControl)) {
      throw new Error(`${controlName} 不是 FormControl`);
    }
    return ctrl;
  }
  onRowSelect(event: TableRowSelectEvent): void {
    const rowData = event.data as POS5008Data;
    rowData.selected = true;
    const rowIndex = this.POS5008Data.findIndex(d => d.ID === rowData.ID);
    const formGroup = this.posFormArrayControls[rowIndex];
    // 通用驗證
    formGroup.get('TXN_PayAmt')?.setValidators([Validators.required, Validators.min(0)]);
    formGroup.get('CRD_Type')?.setValidators([Validators.required]);
    formGroup.get('TERM_No')?.setValidators([Validators.required]);
    // 條件驗證
    if (rowData.PAY_Type === '0') {
      formGroup.get('CRD_No')?.setValidators([Validators.required, Validators.maxLength(20)]);// 信用卡
    } else if (rowData.PAY_Type === 'A') {
      formGroup.get('TXN_PayDesc')?.setValidators([Validators.required, Validators.maxLength(100)]);// 應收付款對象
    } else {
      formGroup.get('TXN_CouponNo')?.setValidators([Validators.required, Validators.maxLength(50)]);// 其他券號
    }
    formGroup.updateValueAndValidity({ emitEvent: false });
    this.cdr.markForCheck();
  }
  onRowUnselect(event: TableRowUnSelectEvent): void {
    const rowData = event.data as POS5008Data;
    rowData.selected = false;
    const rowIndex = this.POS5008Data.findIndex(d => d.ID === rowData.ID);
    const formGroup = this.posFormArrayControls[rowIndex];
    formGroup.get('TXN_PayAmt')?.clearValidators();
    formGroup.get('CRD_Type')?.clearValidators();
    formGroup.get('TERM_No')?.clearValidators();
    formGroup.get('CRD_No')?.clearValidators();
    formGroup.get('TXN_PayDesc')?.clearValidators();
    formGroup.get('TXN_CouponNo')?.clearValidators();
    formGroup.updateValueAndValidity({ emitEvent: false });
    this.cdr.markForCheck();
  }
  validate(): boolean {
    this.submitted = true;
    this.posFormArrayControls.forEach((formGroup, index) => {
      const rowData = this.POS5008Data[index];
      if (rowData.selected) {
        formGroup.markAllAsTouched(); // 讓錯誤顯示
        formGroup.updateValueAndValidity({ emitEvent: false });
      }
    });
    this.cdr.markForCheck();
    // 只檢查有選取的
    const invalidRows = this.posFormArrayControls.some((formGroup, index) => {
      return this.POS5008Data[index].selected && formGroup.invalid;
    });

    return !invalidRows;
  }
}
