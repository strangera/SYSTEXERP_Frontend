import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
export class Tls24010Pos5008Component implements OnInit, OnChanges {
  @Input() data: POS5008Data[] = [];
  @Input() type?: string;
  @Input() isFormCreateable?: boolean;
  @Input() isFormEditable?: boolean;
  @Input() isFormReadable?: boolean;
  @Input() submitted?: boolean;

  form?: FormGroup;
  POS5008FormArray: FormArray = this.fb.array([]);
  POS5008Data: POS5008Data[] = [];
  POS5008SelectedItems: POS5008Data[] = [];
  POS5008Columns: Column[] = POS5008Columns;
  isOptionsLoaded = false;
  trackByRow = (index: number, item: POS5008Data) => { return item?.id || index; }

  CRD_TypeOptions = CRD_TypeOptions;
  PAY_TypeOptions: IDropdownItem[] = [];
  sys_typeOptions: SystemOption[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      POS5008: this.POS5008FormArray
    });
  }

  ngOnInit(): void {
    this.dropDownListService.queryPOS1006_DropDownList().pipe(untilDestroyed(this)).subscribe((res) => {
      this.PAY_TypeOptions = res.Data.map(item => ({ ...item, label: item.Name }));
      const rows = res.Data.map(item => {
        const row: POS5008Data = {
          PAY_No: item.No,
          PAY_Name: item.Name,
          TXN_PayAmt: 0,
          CRD_Type: '',
          CRD_No: '',
          TXN_CouponNo: '',
          TXN_PayDesc: '',
          TERM_No: '',
          PAY_Type: item.PAY_Type,
          selected: false
        };
        this.POS5008FormArray.push(this.createRowForm(row));
        return row;
      });
      this.POS5008Data = rows;
      this.sys_typeOptions = SystemOptionsService.getOptions('T109');

      this.isOptionsLoaded = true;
      this.applyInputData();
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue?.length > 0 && !this.isFormCreateable) {
      this.applyInputData();
    }

    if (changes['isFormCreateable'] && this.POS5008FormArray?.length > 0) {
      const isDisabled = !this.isFormCreateable;
      this.posFormArrayControls.forEach(formGroup => {
        Object.keys(formGroup.controls).forEach(controlName => {
          const control = formGroup.get(controlName);
          if (controlName !== 'PAY_Name' && controlName !== 'PAY_No') {
            if (isDisabled) {
              control?.disable({ emitEvent: false })
            } else {
              control?.enable({ emitEvent: false });
            }
          }
        });
      });
      this.cdr.markForCheck();
    }
  }

  private applyInputData(): void {
    if (!this.isOptionsLoaded || !this.data?.length || !this.POS5008Data.length) return;
    this.POS5008SelectedItems = [...this.data];
    this.POS5008SelectedItems.forEach(item => {
      const rowIndex = this.POS5008Data.findIndex(d => d.PAY_No === item.PAY_No);
      if (rowIndex !== -1) {
        const formGroup = this.POS5008FormArray.at(rowIndex) as FormGroup;
        const patchedData = {
          ...item,
          TERM_No: String(item.TERM_No),
        };
        formGroup.patchValue(patchedData, { emitEvent: false });
        this.POS5008Data[rowIndex].selected = true;
        formGroup.updateValueAndValidity({ emitEvent: false });
      }
    });
    const combined = this.POS5008Data.map((data, index) => ({
      data,
      form: this.POS5008FormArray.at(index) as FormGroup,
    }));
    const sorted = [
      ...combined.filter(x => x.data.selected),
      ...combined.filter(x => !x.data.selected),
    ];
    this.POS5008Data = sorted.map(x => x.data);
    this.POS5008FormArray.clear();
    sorted.forEach(x => this.POS5008FormArray.push(x.form));

    this.cdr.markForCheck();
  }

  createRowForm(row: POS5008Data): FormGroup {
    const isDisabled = !this.isFormCreateable;

    return this.fb.group({
      PAY_Name: [{ value: row.PAY_Name, disabled: true }],
      PAY_No: [{ value: row.PAY_No, disabled: true }],
      TXN_PayAmt: [{ value: null, disabled: isDisabled }],
      CRD_Type: [{ value: '', disabled: isDisabled }],
      CRD_No: [{ value: '', disabled: isDisabled }, [Validators.maxLength(20)]],
      TXN_CouponNo: [{ value: '', disabled: isDisabled }, [Validators.maxLength(50)]],
      TXN_PayDesc: [{ value: '', disabled: isDisabled }, [Validators.maxLength(100)]],
      TERM_No: [{ value: '', disabled: isDisabled }]
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
    // 條件驗證
    if (rowData.PAY_Type === '0') {
      formGroup.get('CRD_No')?.setValidators([Validators.required, Validators.maxLength(20)]);// 信用卡
      formGroup.get('CRD_Type')?.setValidators([Validators.required]);
      formGroup.get('TERM_No')?.setValidators([Validators.required]);
    } else if (rowData.PAY_Type === 'A') {
      formGroup.get('TXN_PayDesc')?.setValidators([Validators.required, Validators.maxLength(100)]);// 應收付款對象
    } else {
      formGroup.get('TXN_CouponNo')?.setValidators([Validators.maxLength(50)]);// 其他券號
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
