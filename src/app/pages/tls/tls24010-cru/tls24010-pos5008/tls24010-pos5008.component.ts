import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DividerModule } from 'primeng/divider';
import { TableModule, TableRowSelectEvent, TableRowUnSelectEvent } from 'primeng/table';
import { POS5008Data, Tls24010Service } from '../../../../service/api/tls/tls24010.service';
import { getSYS1000Options } from '../../../../service/system/sys1000.service';
import { DropDownListService, IDropdownItem } from '../../../../service/utility/dropDownList.service';
import { DropdownComponent } from '../../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../../shared/componentkit/input-text/input-text.component';
import { Column } from '../../../../others/component/table/table.model';
import { POS5008Columns } from '../tls24010-cru.model';

@UntilDestroy()
@Component({
  selector: 'app-tls24010-pos5008',
  standalone: true,
  imports: [
    TableModule,
    DividerModule,
    InputTextComponent,
    InputNumberComponent,
    DropdownComponent,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './tls24010-pos5008.component.html',
  styleUrls: ['./tls24010-pos5008.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tls24010Pos5008Component implements OnInit, OnChanges {
  private readonly dropDownListService = inject(DropDownListService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly datePipe = inject(DatePipe);
  private readonly tls24010Service = inject(Tls24010Service);
  @Input() rece_yn?: string // 是否開立業主發票 'Y':是 'N':否
  @Input() data: POS5008Data[] = [];
  @Input() type?: string;
  @Input() isFormCreateable?: boolean;
  @Input() isFormEditable?: boolean;
  @Input() isFormReadable?: boolean;
  @Input() submitted?: boolean;
  @Input() totalSaleAmt = 0; // 接收父層傳來的銷售總金額
  @Input() queryInfo?: { TXN_Date?: string | Date, ECR_No?: string, Talent_ID?: number }; // 接收父層傳來的查詢條件資訊
  @Output() payChange = new EventEmitter<void>();
  get currentTotalPaid(): number {
    return this.posFormArrayControls.reduce((sum, group, index) => {
      // 如果該行被勾選，則計入其金額
      if (this.POS5008Data[index].selected) {
        return sum + (Number(group.get('TXN_PayAmt')?.value) || 0);
      }
      return sum;
    }, 0);
  }

  POS5008FormArray: FormArray = this.fb.array([]);
  form = this.fb.group({ POS5008: this.POS5008FormArray });
  POS5008Data: POS5008Data[] = [];
  POS5008SelectedItems: POS5008Data[] = [];
  POS5008Columns: Column[] = POS5008Columns;
  isOptionsLoaded = false;
  trackByRow = (index: number, item: POS5008Data) => { return item?.id || index; }
  checkPayNoList: string[] = [];

  CRD_TypeOptions = getSYS1000Options('CRD_Type');
  PAY_TypeOptions: IDropdownItem[] = [];
  sys_typeOptions = getSYS1000Options('T109');

  ngOnInit(): void {
    // 預先加載下拉選單基礎資料
    this.loadInitialOptions();
    this.POS5008FormArray.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.payChange.emit();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isFormCreateable'] || changes['rece_yn']) && this.POS5008FormArray?.length > 0) {
      this.updateRowDisableStatus();
    }
    if (this.isFormCreateable && changes['queryInfo'] && this.queryInfo?.ECR_No) {
      // 新增的時候要卡已審核的付款別disable，所以只要查詢條件有變化就重新撈一次已審核的付款別清單
      this.fetchCheckStatusAndReload();
    }
    if (changes['data'] && changes['data'].currentValue?.length > 0 && !this.isFormCreateable) {
      this.applyInputData();
    }
    if (changes['isFormCreateable'] && this.POS5008FormArray?.length > 0) {
      this.updateRowDisableStatus();
    }

    if (changes['isFormCreateable'] && this.POS5008FormArray?.length > 0) {
      const isDisabled = !this.isFormCreateable;
      this.posFormArrayControls.forEach(formGroup => {
        Object.keys(formGroup.controls).forEach(controlName => {
          const control = formGroup.get(controlName);
          if (controlName !== 'PAY_Name' && controlName !== 'PAY_No' && controlName !== 'PAY_OverPay') {
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

  private fetchCheckStatusAndReload(): void {
    const payload = {
      TXN_Date: this.datePipe.transform(this.queryInfo?.TXN_Date, 'yyyy-MM-dd') || '',
      ECR_No: this.queryInfo?.ECR_No || '',
      Talent_ID: this.queryInfo?.Talent_ID || 0,
    };

    this.tls24010Service.queryTLS24010CheckStatus(payload).pipe(untilDestroyed(this)).subscribe(res => {
      this.checkPayNoList = res.Data?.payNoList || [];
      if (this.isOptionsLoaded && this.posFormArrayControls.length > 0) {
        this.updateRowDisableStatus();
      }
      this.cdr.markForCheck();
    });
  }

  private loadInitialOptions(): void {
    this.dropDownListService.queryPOS1006_DropDownList().pipe(untilDestroyed(this)).subscribe((res) => {
      this.PAY_TypeOptions = res.Data.map(item => ({ ...item, label: item.Name }));
      this.initFormRows(res.Data);
      this.isOptionsLoaded = true;
      this.updateRowDisableStatus();

      if (this.data?.length > 0 && !this.isFormCreateable) {
        this.applyInputData();
      }
      this.cdr.markForCheck();
    });
  }

  private initFormRows(options: any[]): void {
    this.POS5008FormArray.clear();
    this.POS5008Data = options.map(item => {
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
        PAY_TaxType: item.PAY_TaxType,
        selected: false,
        PAY_OverPay: item.PAY_OverPay,
        isLocked: false // 自定義屬性標示是否已審核
      };
      this.POS5008FormArray.push(this.createRowForm(row));
      return row;
    });
  }

  private updateRowDisableStatus(): void {
    if (!this.posFormArrayControls || this.posFormArrayControls.length === 0) return;
    this.posFormArrayControls.forEach((group, index) => {
      const rowData = this.POS5008Data[index];
      if (!rowData) return;
      // 判斷是否有已審核的付款別
      const isApiLocked = rowData.PAY_No ? this.checkPayNoList.includes(rowData.PAY_No) : false;
      rowData.isLocked = isApiLocked;
      const shouldDisable = !this.isFormCreateable || isApiLocked;

      if (shouldDisable) {
        group.disable({ emitEvent: false });
      } else {
        group.enable({ emitEvent: false });

        // 2. 處理固定唯讀欄位
        group.get('PAY_Name')?.disable({ emitEvent: false });
        group.get('PAY_No')?.disable({ emitEvent: false });
        group.get('PAY_OverPay')?.disable({ emitEvent: false });

        // 3. 處理「信用卡/券號」欄位 (根據 rece_yn)
        // 如果還沒勾選該行，且 rece_yn 為 N，則應維持 disable
        if (this.rece_yn === 'N') {
          group.get('CRD_Type')?.disable({ emitEvent: false });
          group.get('CRD_No')?.disable({ emitEvent: false });
          group.get('TERM_No')?.disable({ emitEvent: false });
          group.get('TXN_CouponNo')?.disable({ emitEvent: false });
          group.get('TXN_PayDesc')?.disable({ emitEvent: false });
        }
      }
    });
    this.cdr.markForCheck();
  }

  private applyInputData(): void {
    if (!this.isOptionsLoaded || !this.data?.length || !this.POS5008Data.length) return;

    this.POS5008SelectedItems = [...this.data];
    this.POS5008SelectedItems.forEach(item => {
      const rowIndex = this.POS5008Data.findIndex(d => d.PAY_No === item.PAY_No);
      if (rowIndex !== -1) {
        const formGroup = this.POS5008FormArray.at(rowIndex) as FormGroup;

        // --- 關鍵修正：計算顯示用的複合欄位值 ---
        // 先找出該支付方式的 PAY_Type (從預載的選項中找)
        const selectedOption = this.PAY_TypeOptions.find(opt => opt.No === item.PAY_No);
        const payType = selectedOption?.PAY_Type || item.PAY_Type;

        let compositeValue = '';
        if (payType === '0') {
          compositeValue = item.CRD_No || '';
        } else if (payType === 'A') {
          compositeValue = item.TXN_PayDesc || '';
        } else {
          compositeValue = item.TXN_CouponNo || '';
        }
        // ------------------------------------

        const patchedData = {
          ...item,
          TERM_No: item.TERM_No != null ? String(item.TERM_No) : null,
          // 賦值給 Form 中對應的複合控制項名稱
          CRD_NoTXN_CouponNoTXN_PayDesc: compositeValue
        };

        formGroup.patchValue(patchedData, { emitEvent: false });
        this.POS5008Data[rowIndex].selected = true;

        // 更新 Data 狀態，確保 PAY_Type 也被存入 Data 物件
        this.POS5008Data[rowIndex].PAY_Type = payType;

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
      PAY_No: [{ value: row.PAY_No, disabled: true }, [Validators.min(0)]],
      TXN_PayAmt: [{ value: null, disabled: isDisabled }],
      CRD_Type: [{ value: null, disabled: isDisabled }],
      CRD_No: [{ value: null, disabled: isDisabled }, [Validators.maxLength(20)]],
      TXN_CouponNo: [{ value: null, disabled: isDisabled }, [Validators.maxLength(50)]],
      TXN_PayDesc: [{ value: null, disabled: isDisabled }, [Validators.maxLength(100)]],
      TERM_No: [{ value: null, disabled: isDisabled }],
      PAY_OverPay: [{ value: row.PAY_OverPay, disabled: true }],
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
    this.submitted = false;
    const rowData = event.data as POS5008Data;
    // --- 如果這筆資料已審核被鎖定，直接跳出，不做任何 enable 動作 ---
    if (rowData.isLocked) {
      return;
    }

    rowData.selected = true;
    const rowIndex = this.POS5008Data.findIndex(d => d.PAY_No === rowData.PAY_No);
    if (rowIndex === -1) return;

    const formGroup = this.posFormArrayControls[rowIndex];
    const txnPayAmtControl = formGroup.get('TXN_PayAmt');
    const crdTypeControl = formGroup.get('CRD_Type');
    const crdNoControl = formGroup.get('CRD_No');
    const termNoControl = formGroup.get('TERM_No');
    const txnPayDescControl = formGroup.get('TXN_PayDesc');
    const txnCouponNoControl = formGroup.get('TXN_CouponNo');

    // --- 新增自動帶入金額邏輯 ---
    // 剩餘應付 = 總金額 - 目前已填寫的支付總額 (此時這筆剛勾選，金額還是 null 或 0)
    const remaining = this.totalSaleAmt - this.currentTotalPaid;
    const currentVal = txnPayAmtControl?.value;
    if ((currentVal === null || currentVal === undefined || currentVal === 0) && Math.abs(remaining) > 0.001) {
      txnPayAmtControl?.setValue(remaining, { emitEvent: false });
    }
    // -------------------------

    // A. 通用：金額必填
    txnPayAmtControl?.setValidators([Validators.required]);

    // B. 根據 rece_yn 決定是否允許輸入及必填卡控
    if (this.rece_yn === 'N') {
      // 如果不開立業主發票，禁止輸入以下欄位
      crdTypeControl?.disable();
      crdNoControl?.disable();
      termNoControl?.disable();
      txnPayDescControl?.disable();
      txnCouponNoControl?.disable();

      // 清除可能殘留的驗證
      crdNoControl?.clearValidators();
      crdTypeControl?.clearValidators();
    } else {
      // 如果 rece_yn === 'Y'，啟用欄位
      crdTypeControl?.enable();
      crdNoControl?.enable();
      termNoControl?.enable();
      txnPayDescControl?.enable();
      txnCouponNoControl?.enable();

      // 條件必填卡控
      if (rowData.PAY_Type === '0') {
        // 信用卡：卡號必填，卡別保持不選則不控 (依您需求)
        // crdNoControl?.setValidators([Validators.required, Validators.maxLength(20)]);
        crdNoControl?.setValidators([Validators.maxLength(20)]);
        // 如果信用卡別也需要必填，可取消下行註解
        // crdTypeControl?.setValidators([Validators.required]);
      } else if (rowData.PAY_Type === 'A') {
        // 應收付款對象：保持目前必填
        txnPayDescControl?.setValidators([Validators.required, Validators.maxLength(100)]);
      }
    }

    // C. 強制重新驗證
    [txnPayAmtControl, crdTypeControl, crdNoControl, termNoControl, txnPayDescControl, txnCouponNoControl].forEach(ctrl => {
      ctrl?.updateValueAndValidity({ emitEvent: false });
    });

    this.cdr.markForCheck();
    this.payChange.emit(); // 通知父元件重算發票金額
  }
  onRowUnselect(event: TableRowUnSelectEvent): void {
    this.submitted = false;
    const rowData = event.data as POS5008Data;
    rowData.selected = false;
    const rowIndex = this.POS5008Data.findIndex(d => d.PAY_No === rowData.PAY_No);
    if (rowIndex === -1) return;
    const formGroup = this.posFormArrayControls[rowIndex];
    formGroup.get('TXN_PayAmt')?.clearValidators();
    formGroup.get('CRD_Type')?.clearValidators();
    formGroup.get('TERM_No')?.clearValidators();
    formGroup.get('CRD_No')?.clearValidators();
    formGroup.get('TXN_PayDesc')?.clearValidators();
    formGroup.get('TXN_CouponNo')?.clearValidators();
    formGroup.get('TXN_CouponNo')?.setValidators([Validators.maxLength(50)]);
    // 清空取消選擇的資料
    formGroup.patchValue({
      TXN_PayAmt: null,
      CRD_Type: null,
      CRD_No: null,
      TXN_CouponNo: null,
      TXN_PayDesc: null,
      TERM_No: null
    }, { emitEvent: false });
    formGroup.updateValueAndValidity({ emitEvent: false });
    this.cdr.markForCheck();
    this.payChange.emit(); // 通知父元件重算發票金額
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
  getCRD_NoTXN_CouponNoTXN_PayDesc(rowData: POS5008Data): string {
    return rowData.CRD_No && rowData.CRD_No !== '' ?
      rowData.CRD_No : rowData.TXN_CouponNo && rowData.TXN_CouponNo !== '' ?
        rowData.TXN_CouponNo : rowData.TXN_PayDesc && rowData.TXN_PayDesc !== '' ?
          rowData.TXN_PayDesc : '';
  }
  get hasCheckedData(): boolean { // 控制已審核提示字樣
    return this.checkPayNoList && this.checkPayNoList.length > 0;
  }
}
