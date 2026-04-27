import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52080Service } from '@service/api/fin/fin52080.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TreeDropdownComponent } from '@shared/componentkit/tree-dropdown/tree-dropdown.component';
import { ValidationService } from '@shared/service/validation.service';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { finalize } from 'rxjs';
import { AccDCType, FIN52080Data, FIN52080Query, FIN52080Tree, LedgerMDType, UpdateFIN52080Request, VoucherType } from '../fin52080/fin52080.model';

@Component({
  selector: 'app-fin52080-cru',
  templateUrl: './fin52080-cru.component.html',
  standalone: true,
  imports: [
    FormsModule,
    PanelModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TreeDropdownComponent,
  ]
})
export class FIN52080CRUComponent extends BasicCruPageComponent<FIN52080Data> implements OnInit {

  /**
   * 會計科目代號維護
   * - AccNo: 科目代號
   * - AccCName: 科目名稱
   * - AccEName: 科目英文名稱 (非必填)
   * - AccDC: 借/貸
   * - Ledger_MD: 統制/明細
   * - ClassNo: 三碼代號
   * - ABAT_YN: 是否為沖帳代號
   * - Voucher_Type: 傳票格式
   * - Budget_YN: 是否為預算科目
   * - Org_YN: 是否設定部門代號
   * - rest_value: 折舊攤提年限
   * - rest_value2: 殘值年限
   * - Input_YN: 是否可輸
   */
  public readonly dataForm = this.formBuilder.nonNullable.group({
    AccNo: new FormControl<string>('', [Validators.minLength(3), Validators.maxLength(8), Validators.required, this.validationService.numberValidator]),
    AccCName: new FormControl<string>('', [Validators.required, Validators.maxLength(40)]),
    AccEName: new FormControl<string>('', [Validators.maxLength(50)]),
    AccDC: new FormControl<AccDCType | void>(void 0, [Validators.required]),
    Ledger_MD: new FormControl<LedgerMDType | void>(void 0, [Validators.required]),
    ClassNo: new FormControl<string | void>(void 0, [Validators.required]),
    ABAT_YN: new FormControl<'Y' | 'N'>('N', [Validators.required]),
    Voucher_Type: new FormControl<VoucherType | void>(void 0, [Validators.required]),
    Budget_YN: new FormControl<'Y' | 'N'>('N', [Validators.required]),
    Org_YN: new FormControl<'Y' | 'N'>('N', [Validators.required]),
    rest_value: new FormControl<string>('', [Validators.maxLength(10), this.validationService.numberValidator]),
    rest_value2: new FormControl<string>('', [Validators.maxLength(10), this.validationService.numberValidator]),
    Input_YN: new FormControl<'Y' | 'N'>('N', [Validators.required]),
  }, {
    validators: [this.validationService.accNoClassNoMatchValidator('AccNo', 'ClassNo')]
  });
  public readonly df = computed(() => this.dataForm.controls);

  private readonly accNoSignal = toSignal(this.df().AccNo.valueChanges);

  public readonly FIN52080Tree = signal<FIN52080Tree[]>([]);
  public readonly accNoExists = signal<boolean>(false);

  public readonly tableLoading = signal<boolean>(!1);
  public readonly treeLoading = signal<boolean>(!1);

  private readonly leaveLabel = 'T30Label';
  private readonly listTitle = '科目圖';
  private readonly viewButtonLabel = '查看科目圖';
  private readonly treeColumn = [
    { value: 'T10Label', label: '大分類' },
    { value: 'T20Label', label: '中分類' },
    { value: 'T30Label', label: '小分類' },
  ];

  public readonly treeElements = {
    treeColumn: this.treeColumn,
    listTitle: this.listTitle,
    leaveLabel: this.leaveLabel,
    viewButtonLabel: this.viewButtonLabel,
  };

  /** AccNo 的數字過濾器（最多8碼） */
  public readonly accNoFilter = /^\d{0,8}$/;

  /** AccNo 變更時更新 ClassNo（僅在新增模式） */
  public readonly accNoEffect = effect(() => {
    // 只在新增模式執行
    if (!this.isFormCreateable) return;

    const accNo = this.accNoSignal();

    // 若輸入的科目代號為4碼時，「統制/明細」 預設 「統制」；為6碼時預設 「明細」
    if (accNo?.length === 4) {
      this.df().Ledger_MD.setValue('0', { emitEvent: !1 });
    } else if (accNo?.length === 6) {
      this.df().Ledger_MD.setValue('1', { emitEvent: !1 });
    }

    // 依科目第1碼判讀「借/貸」欄位（1,6＝借；2, 3, 4, 7＝貸）
    const accNoPrefix1 = accNo?.slice(0, 1) || '';
    const aryDebit = ['1', '6'];
    const aryCredit = ['2', '3', '4', '7'];

    if (aryDebit.includes(accNoPrefix1)) {
      this.df().AccDC.setValue('D', { emitEvent: !1 });
    } else if (aryCredit.includes(accNoPrefix1)) {
      this.df().AccDC.setValue('C', { emitEvent: !1 });
    }

    // 若科目長度為4碼，判斷 「是否可輸＝否」；長度為6碼，判斷 「是否可輸＝是」
    if (accNo?.length === 4) {
      this.df().Input_YN.setValue('N', { emitEvent: !1 });
    } else if (accNo?.length === 6) {
      this.df().Input_YN.setValue('Y', { emitEvent: !1 });
    }

    const prefixAccNo = accNo?.slice(0, 3) || '';
    const classNoOption = this.service.classNoOptions().find(option => option.value === prefixAccNo);
    if (classNoOption) {
      const currentClassNo = this.df().ClassNo.value || '';
      if (currentClassNo !== classNoOption.value) {
        this.df().ClassNo.setValue(classNoOption.value, { emitEvent: !1 });
      }
    }

    // 立即檢查科目代號是否已存在（長度 >= 3 時）
    if (accNo && accNo.length >= 3) {
      this.service.checkAccNoExists(accNo).subscribe(res => {
        this.accNoExists.set((res.Data as unknown as boolean) === true);
      });
    } else {
      this.accNoExists.set(false);
    }
  }, { allowSignalWrites: !0 });

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading()
      || this.treeLoading()
      || this.service.classNoLoading();
  });

  constructor(
    public readonly service: FIN52080Service,
    private readonly validationService: ValidationService,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN52080', this.dataForm);

    this.treeLoading.set(!0);
    this.service.getClassNos();
    this.service.getFIN52080Tree().pipe(finalize(() => this.treeLoading.set(!1)))
      .subscribe(res => this.FIN52080Tree.set(res.Data || []));

    this.logger.debug(`init:`, [this.service.classNoOptions(), this.FIN52080Tree(), this.rowdata]);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.messageService.blockUi();
    this.loading = true;

    // 收集所有錯誤訊息
    const allErrors: { fieldName: string; message: string }[] = [];

    // 新增模式：檢查科目代號是否已存在
    if (this.isFormCreateable && this.accNoExists()) {
      allErrors.push({ fieldName: '科目代號', message: '科目代號已存在，請輸入其他代號' });
    }

    Object.keys(this.dataForm.controls).forEach(key => {
      const controlErrors = this.dataForm.get(key)?.errors;
      if (controlErrors) {
        const fieldName = this.formLabelService.getLabel(key) || key;
        Object.keys(controlErrors).forEach(errorKey => {
          const errorMessage = this.validationService.getValidatorErrorMessage(
            errorKey,
            controlErrors[errorKey]
          );

          const message = errorKey === 'accNoClassNoMismatch'
            ? errorMessage
            : `此欄位 ${errorMessage}，請檢查輸入資料`;

          allErrors.push({
            fieldName,
            message
          });
        });
      }
    });

    // 如果有錯誤，一起顯示並返回
    if (allErrors.length > 0) {
      allErrors.forEach(error => {
        this.messageService.errorBubble(error.message, `「${error.fieldName}」驗證失敗`);
      });
      this.loading = false;
      this.messageService.unblockUi();
      return;
    }

    // 沒有錯誤，繼續執行提交邏輯
    if (this.isFormCreateable || this.isFormEditable) {
      const raw = this.dataForm.getRawValue() as FIN52080Query;

      const accNo = raw.AccNo || '';

      const filteredData = Object.fromEntries(Object.entries(raw).filter(([k, v]) =>
        v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0)
      ));

      this.tableLoading.set(!0);
      this.logger.debug(`onSubmit:`, [raw, filteredData, accNo]);

      if (this.isFormEditable) {
        // 編輯模式：使用 updateFIN52080
        const payload: UpdateFIN52080Request = {
          ...filteredData,
          AccNo: accNo,
        } as UpdateFIN52080Request;

        this.service.updateFIN52080(payload).pipe(
          finalize(() => this.tableLoading.set(!1))
        ).subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.onCancel();
            this.messageService.successBubble('更新成功');
          }
        });
      } else {
        // 新增模式：使用 saveFIN52080
        const payload: FIN52080Query = {
          ...filteredData,
          AccNo: accNo,
        };

        this.service.saveFIN52080(payload, 'insert').pipe(
          finalize(() => this.tableLoading.set(!1))
        ).subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.onCancel();
            this.messageService.successBubble('新增成功');
          }
        });
      }
    }
    this.messageService.unblockUi();
    this.submitted = false;
  }

  public onLevelSelected(selected: any[]): void {
    this.logger.debug(`onLevelSelected:`, [selected]);
  }
}
