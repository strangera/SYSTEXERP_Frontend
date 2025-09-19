import { Component, computed, effect, OnInit } from '@angular/core';
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
import { AccDCType, FIN52080Data, FIN52080Query, LedgerMDType, VoucherType } from '../fin52080/fin52080.model';

@Component({
  selector: 'app-fin52080-cru',
  templateUrl: './fin52080-cru.component.html',
  styleUrl: './fin52080-cru.component.scss',
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
   * - AccCname: 科目名稱
   * - AccEname: 科目英文名稱 (非必填)
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
  dataForm = this.formBuilder.nonNullable.group({
    AccNo: new FormControl<string>('', [Validators.required, Validators.minLength(3), Validators.maxLength(8)]),
    AccCname: new FormControl<string>('', [Validators.required, Validators.maxLength(40)]),
    AccEname: new FormControl<string>('', [Validators.maxLength(50)]),
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
  public df = computed(() => this.dataForm.controls);

  private readonly accNoSignal = toSignal(this.df().AccNo.valueChanges);
  private readonly classNoSignal = toSignal(this.df().ClassNo.valueChanges);

  /** accNo驗證 綁定classNo用 */
  public readonly accNoEffect = effect(() => {
    const accNo = String(this.accNoSignal() ?? 0)?.substring(0, 3);
    this.df().ClassNo.setValue(void 0);
    // this.logger.debug(`accNoEffect:`, [accNo, this.queryForm.getRawValue()]);
    if (!accNo) return;
    const matched = this.service.classNoMap().get(accNo);
    matched?.length && this.df().ClassNo.setValue(accNo, { emitEvent: !1 });
  }, { allowSignalWrites: !0 });

  /** classNo驗證 accNo沒在清單內就清空 */
  public readonly classNoEffect = effect(() => {
    const classNo = this.classNoSignal();
    const current = this.df().AccNo.value?.substring(0, 3);
    // this.logger.debug(`classNoEffect:`, [classNo, current, this.queryForm.getRawValue()]);
    if (!classNo?.length) return;

    const match = this.service.classNoMap().get(classNo) === current;
    if (!match) this.df().AccNo.setValue('', { emitEvent: !1 });
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

    this.service.getClassNos();
    this.service.getFIN52080Tree();

    this.logger.debug(`init:`, [this.rowdata, this.crudstatus]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const payload = <FIN52080Query>{
        ...this.dataForm.getRawValue(),
      };

      this.logger.debug(`onSubmit:`, [payload]);

      this.service.saveFIN52080(payload).pipe(
        finalize(() => this.loading = !1),
      ).subscribe(res => {
        if (res.Status !== '0000') return this.messageService.errorBubble('資料儲存失敗，請再次檢查欄位');
        this.messageService.successBubble('資料儲存成功');
        this.onCancel();
      });
    });
  }

  public onLevelSelected(selected: any[]): void {
    this.logger.debug(`onLevelSelected:`, [selected]);
  }
}
