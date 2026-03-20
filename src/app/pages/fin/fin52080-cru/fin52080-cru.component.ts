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
    AccNo: new FormControl<string>('', [Validators.minLength(3), Validators.maxLength(8)]),
    AccNoPrefix: new FormControl<string>('', []),
    AccNoSuffix: new FormControl<string>('', [Validators.required, Validators.maxLength(5), this.validationService.numberValidator]),
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
  });
  public readonly df = computed(() => this.dataForm.controls);

  private readonly accNoPrefixSignal = toSignal(this.df().AccNoPrefix.valueChanges);
  private readonly accNoSuffixSignal = toSignal(this.df().AccNoSuffix.valueChanges);
  private readonly classNoSignal = toSignal(this.df().ClassNo.valueChanges);

  public readonly FIN52080Tree = signal<FIN52080Tree[]>([]);

  public readonly tableLoading = signal<boolean>(!1);
  public readonly treeLoading = signal<boolean>(!1);

  private readonly leaveLabel = 'T_Name';
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

  /** AccNoSuffix 的數字過濾器（最多5碼） */
  public readonly accNoSuffixFilter = /^\d{0,5}$/;

  /** ClassNo 變更時更新 AccNoPrefix（僅在新增模式） */
  public readonly classNoEffect = effect(() => {
    // 只在新增模式執行
    if (!this.isFormCreateable) return;

    const classNo = this.classNoSignal();
    if (!classNo) return;

    const currentPrefix = this.df().AccNoPrefix.value;
    if (currentPrefix !== classNo) {
      this.df().AccNoPrefix.setValue(classNo, { emitEvent: !1 });
    }
  }, { allowSignalWrites: !0 });

  /** AccNoPrefix 和 AccNoSuffix 變更時組合為 AccNo（僅在新增模式） */
  public readonly accNoCombineEffect = effect(() => {
    // 只在新增模式執行
    if (!this.isFormCreateable) return;

    const prefix = this.accNoPrefixSignal();
    const suffix = this.accNoSuffixSignal();
    const combined = (prefix || '') + (suffix || '');
    const currentAccNo = this.df().AccNo.value;
    if (currentAccNo !== combined) {
      this.df().AccNo.setValue(combined, { emitEvent: !1 });
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

    // 處理新增模式的資料初始化：從 ClassNo 設定 AccNoPrefix
    if (this.isFormCreateable) {
      // 新增模式：如果 ClassNo 有值，使用 ClassNo 作為 AccNoPrefix
      const classNo = this.df().ClassNo.value;
      if (classNo) {
        this.df().AccNoPrefix.setValue(classNo, { emitEvent: !1 });
      }
    } else if (this.isFormEditable || this.isFormReadable) {
      // 編輯/檢視模式：確保 AccNo 有值（從 rowdata 取得）
      // AccNo 已經在 initializePage 中透過 patchValue 設定，不需要額外處理
      // 為了提交時使用，仍然需要拆解 AccNo 為 AccNoPrefix 和 AccNoSuffix（但不顯示）
      const accNo = this.df().AccNo.value;
      if (accNo && accNo.length >= 3) {
        const prefix = accNo.substring(0, 3);
        const suffix = accNo.substring(3);
        // 設定 AccNoPrefix 和 AccNoSuffix，不觸發事件以避免循環更新
        this.df().AccNoPrefix.setValue(prefix, { emitEvent: !1 });
        this.df().AccNoSuffix.setValue(suffix, { emitEvent: !1 });
      }
    }

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
    const allErrors: Array<{ fieldName: string; message: string }> = [];

    // 檢查科目代號的錯誤
    // 新增模式：檢查 AccNoPrefix 和 AccNoSuffix
    // 編輯模式：檢查 AccNo
    if (this.isFormCreateable) {
      const accNoError = this.getAccNoErrorMessage();
      if (accNoError) {
        allErrors.push({ fieldName: '科目代號', message: accNoError });
      }
    } else if (this.isFormEditable) {
      // 編輯模式：檢查 AccNo 的錯誤
      const accNoControl = this.df().AccNo;
      if (accNoControl.errors) {
        for (const propertyName in accNoControl.errors) {
          if (Object.prototype.hasOwnProperty.call(accNoControl.errors, propertyName)) {
            const errorMsg = this.validationService.getValidatorErrorMessage(
              propertyName,
              accNoControl.errors[propertyName]
            );
            allErrors.push({
              fieldName: '科目代號',
              message: `此欄位 ${errorMsg}，請檢查輸入資料`
            });
          }
        }
      }
    }

    // 檢查其他欄位的錯誤（排除 AccNoPrefix 和 AccNoSuffix，因為已經在上面處理了）
    Object.keys(this.dataForm.controls).forEach(key => {
      // 跳過 AccNoPrefix 和 AccNoSuffix，因為已經在上面處理了
      if (key === 'AccNoPrefix' || key === 'AccNoSuffix') {
        return;
      }

      const controlErrors = this.dataForm.get(key)?.errors;
      if (controlErrors) {
        const fieldName = this.formLabelService.getLabel(key) || key;
        Object.keys(controlErrors).forEach(errorKey => {
          const errorMessage = this.validationService.getValidatorErrorMessage(
            errorKey,
            controlErrors[errorKey]
          );
          allErrors.push({
            fieldName,
            message: `此欄位 ${errorMessage}，請檢查輸入資料`
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
      const raw = this.dataForm.getRawValue() as FIN52080Query & { AccNoPrefix?: string; AccNoSuffix?: string };

      // 根據模式決定 AccNo 的值
      let accNo: string;
      if (this.isFormCreateable) {
        // 新增模式：組合 AccNoPrefix + AccNoSuffix 為 AccNo
        accNo = (raw.AccNoPrefix || '') + (raw.AccNoSuffix || '');
      } else {
        // 編輯模式：直接使用 AccNo（已經有值）
        accNo = raw.AccNo || '';
      }

      const filteredData = Object.fromEntries(Object.entries(raw).filter(([k, v]) =>
        k !== 'AccNoPrefix' && k !== 'AccNoSuffix' && v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0)
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

  /**
   * 取得科目代號的共用錯誤訊息
   * 檢查 AccNoPrefix 和 AccNoSuffix 兩個欄位的錯誤，優先顯示 AccNoPrefix 的錯誤
   * @returns 錯誤訊息字串，如果沒有錯誤則返回 null
   */
  public getAccNoErrorMessage(): string | null {
    const prefixControl = this.df().AccNoPrefix;
    const suffixControl = this.df().AccNoSuffix;

    // 優先檢查 AccNoPrefix 的錯誤
    if (prefixControl.errors) {
      for (const propertyName in prefixControl.errors) {
        if (Object.prototype.hasOwnProperty.call(prefixControl.errors, propertyName)) {
          const errorMsg = this.validationService.getValidatorErrorMessage(
            propertyName,
            prefixControl.errors[propertyName]
          );
          // 返回錯誤訊息（不包含欄位名稱，因為會在 errorBubble 的標題中顯示）
          return `此欄位 ${errorMsg}，請檢查輸入資料`;
        }
      }
    }

    // 再檢查 AccNoSuffix 的錯誤
    if (suffixControl.errors) {
      for (const propertyName in suffixControl.errors) {
        if (Object.prototype.hasOwnProperty.call(suffixControl.errors, propertyName)) {
          const errorMsg = this.validationService.getValidatorErrorMessage(
            propertyName,
            suffixControl.errors[propertyName]
          );
          // 返回錯誤訊息（不包含欄位名稱，因為會在 errorBubble 的標題中顯示）
          return `此欄位 ${errorMsg}，請檢查輸入資料`;
        }
      }
    }

    return null;
  }
}
