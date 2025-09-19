import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52080Service } from '@service/api/fin/fin52080.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { TreeDropdownComponent } from '@shared/componentkit/tree-dropdown/tree-dropdown.component';
import { ValidationService } from '@shared/service/validation.service';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { finalize } from 'rxjs';
import { AccDCType, FIN52080Data, LedgerMDType, VoucherType } from './fin52080.model';

@Component({
  selector: 'app-fin52080',
  templateUrl: './fin52080.component.html',
  styleUrl: './fin52080.component.scss',
  standalone: !0,
  imports: [
    AccordionModule,
    ButtonComponent,
    FormsModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    TranslateModule,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TableComponent,
    TreeDropdownComponent,
  ]
})
export class FIN52080Component extends BasicQueryPageComponent<FIN52080Data> implements OnInit {

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
  public readonly queryForm = this.formBuilder.group({
    AccNo: new FormControl<string | void>(void 0, [Validators.minLength(3), Validators.maxLength(8)]),
    AccCname: new FormControl<string | void>(void 0, [Validators.maxLength(40)]),
    AccEname: new FormControl<string | void>(void 0, [Validators.maxLength(50)]),
    AccDC: new FormControl<AccDCType | void>(void 0),
    Ledger_MD: new FormControl<LedgerMDType | void>(void 0),
    ClassNo: new FormControl<string | void>(void 0),
    ABAT_YN: new FormControl<'Y' | 'N' | void>(void 0),
    Voucher_Type: new FormControl<VoucherType | void>(void 0),
    Budget_YN: new FormControl<'Y' | 'N' | void>(void 0),
    Org_YN: new FormControl<'Y' | 'N' | void>(void 0),
    rest_value: new FormControl<string | void>(void 0, [Validators.maxLength(10), this.validationService.numberValidator]),
    rest_value2: new FormControl<string | void>(void 0, [Validators.maxLength(10), this.validationService.numberValidator]),
    Input_YN: new FormControl<'Y' | 'N' | void>(void 0),
    ...createPaginationConfig([{ field: 'AccNo', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  private readonly accNoSignal = toSignal(this.qf().AccNo.valueChanges);
  private readonly classNoSignal = toSignal(this.qf().ClassNo.valueChanges);

  public readonly totalRecords = computed(() => this.filteredData().length);

  public readonly filteredData = computed(() => {
    const formValue = this.queryForm.getRawValue();
    return this.service.FIN52080Data().filter(item => {
      return (!formValue.AccNo || item.AccNo.includes(formValue.AccNo))
        && (!formValue.AccCname || item.AccCName.includes(formValue.AccCname))
        && (!formValue.AccEname || item.AccEName?.includes(formValue.AccEname))
        && (!formValue.AccDC?.length || formValue.AccDC.includes(item.AccDC))
        && (!formValue.Ledger_MD?.length || formValue.Ledger_MD.includes(item.Ledger_MD))
        && (!formValue.ClassNo?.length || formValue.ClassNo.includes(item.ClassNo))
        && (!formValue.ABAT_YN?.length || formValue.ABAT_YN.includes(item.ABAT_YN))
        && (!formValue.Voucher_Type?.length || formValue.Voucher_Type.includes(item.Voucher_Type))
        && (!formValue.Budget_YN?.length || formValue.Budget_YN.includes(item.Budget_YN))
        && (!formValue.Org_YN?.length || formValue.Org_YN.includes(item.Org_YN))
        && (!formValue.Input_YN?.length || formValue.Input_YN.includes(item.Input_YN));
    });
  });

  /** accNo驗證 綁定classNo用 */
  public readonly accNoEffect = effect(() => {
    const accNo = String(this.accNoSignal() ?? 0)?.substring(0, 3);
    this.qf().ClassNo.setValue(void 0);
    // this.logger.debug(`accNoEffect:`, [accNo, this.queryForm.getRawValue()]);
    if (!accNo) return;
    const matched = this.service.classNoMap().get(accNo);
    matched?.length && this.qf().ClassNo.setValue(accNo, { emitEvent: !1 });
  }, { allowSignalWrites: !0 });

  /** classNo驗證 accNo沒在清單內就清空 */
  public readonly classNoEffect = effect(() => {
    const classNo = this.classNoSignal();
    const current = this.qf().AccNo.value?.substring(0, 3);
    // this.logger.debug(`classNoEffect:`, [classNo, current, this.queryForm.getRawValue()]);
    if (!classNo?.length) return;

    const match = this.service.classNoMap().get(classNo) === current;
    if (!match) this.qf().AccNo.setValue(void 0, { emitEvent: !1 });
  });

  /**
   * - AccNo: 科目代號
   * - AccCname: 科目名稱
   * - AccEname: 科目英文名稱
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
  public readonly columns: (Omit<Column, 'field'> & { field: keyof FIN52080Data; })[] = [ //先放可視範圍內的
    { field: 'AccNo', header: '科目代號' },
    { field: 'AccCName', header: '科目名稱' },
    { field: 'AccEName', header: '科目英文名稱' },
    { field: 'AccDC', header: '借/貸', options: this.service.accDCOption, format: v => this.service.accDCOption.find(o => o.No === v)?.Name || v },
    { field: 'Ledger_MD', header: '統制/明細', options: this.service.ledgerMDOption, format: v => this.service.ledgerMDOption.find(o => o.No === v)?.Name || v },
    { field: 'ClassNo', header: '三碼代號', options: this.service.classNoOption(), format: v => this.service.classNoOption().find(o => o.ClassNo === v)?.ClassCName || v },
    { field: 'ABAT_YN', header: '是否為沖帳代號', options: this.service.whetherOption, format: v => this.service.whetherOption.find(o => o.No === v)?.Name || v },
    { field: 'Voucher_Type', header: '傳票格式', options: this.service.voucherTypeOption, format: v => this.service.voucherTypeOption.find(o => o.No === v)?.Name || v },
    { field: 'Budget_YN', header: '是否為預算科目', options: this.service.whetherOption, format: v => this.service.whetherOption.find(o => o.No === v)?.Name || v },
    { field: 'Org_YN', header: '是否設定部門代號', options: this.service.whetherOption, format: v => this.service.whetherOption.find(o => o.No === v)?.Name || v },
    { field: 'Input_YN', header: '是否可輸', options: this.service.whetherOption, format: v => this.service.whetherOption.find(o => o.No === v)?.Name || v },
  ];

  constructor(
    public readonly service: FIN52080Service,
    private readonly validationService: ValidationService,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN52080', '/FIN/FIN52080CRU', this.queryForm, this.onSubmit.bind(this));

    this.service.getClassNos();
    this.service.getFIN52080Tree();

    this.logger.debug(`init:`, [this.service.classNoOption(), this.service.classNoMap()]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const payload = Object.fromEntries(
        Object
          .entries(this.queryForm.getRawValue())
          .filter(([_, value]) =>
            (Array.isArray(value) && value.length)
            || value !== void 0 && value !== '' && value !== null),
      );

      this.logger.debug(`對象及對帳維護作業 request:`, [payload]);

      this.service.loadFIN52080(payload).pipe(
        finalize(() => this.loading = !1),
      ).subscribe();

      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
    });
  };

  public onLevelSelected(selected: any[]): void {
    this.logger.debug(`onLevelSelected:`, [selected]);
  }
}
