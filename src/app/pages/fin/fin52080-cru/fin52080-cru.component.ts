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
import { AccDCType, FIN52080Data, FIN52080Query, FIN52080Tree, LedgerMDType, VoucherType } from '../fin52080/fin52080.model';

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
  public readonly dataForm = this.formBuilder.nonNullable.group({
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
  public readonly df = computed(() => this.dataForm.controls);

  private readonly accNoSignal = toSignal(this.df().AccNo.valueChanges);
  private readonly classNoSignal = toSignal(this.df().ClassNo.valueChanges);

  public readonly FIN52080Tree = signal<FIN52080Tree[]>([]);

  public readonly tableLoading = signal<boolean>(!1);
  public readonly treeLoading = signal<boolean>(!1);

  /** accNo/classNo 雙向同步 */
  public readonly accNoEffect = effect(() => {
    const accNo = this.accNoSignal();
    if (!accNo || accNo.length < 3) return;

    const classNoPrefix = accNo.substring(0, 3);
    const currentClassNo = this.df().ClassNo.value;
    if (this.service.classNoMap().has(classNoPrefix) && currentClassNo !== classNoPrefix)
      this.df().ClassNo.setValue(classNoPrefix, { emitEvent: !1 });
  }, { allowSignalWrites: !0 });

  /** classNo 變更時驗證與 accNo 的一致性 */
  public readonly classNoEffect = effect(() => {
    const classNo = this.classNoSignal();
    const accNo = this.df().AccNo.value;
    if (!classNo || !accNo || accNo.length < 3) return;

    const accNoPrefix = accNo.substring(0, 3);
    if (classNo !== accNoPrefix)
      this.df().AccNo.setValue('', { emitEvent: !1 });
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
    this.handleSubmit(this.dataForm, () => {
      const raw = <FIN52080Query>{ ...this.dataForm.getRawValue() };
      const payload = Object.fromEntries(Object.entries(raw).filter(([_, v]) =>
        v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0)
      ));

      this.tableLoading.set(!0);
      this.logger.debug(`onSubmit:`, [raw, payload]);
      this.service.saveFIN52080(payload).pipe(
        finalize(() => this.tableLoading.set(!1))
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.onCancel();
          this.messageService.successBubble('資料儲存成功');
        }
      });
    });
  }

  public onLevelSelected(selected: any[]): void {
    this.logger.debug(`onLevelSelected:`, [selected]);
  }
}
