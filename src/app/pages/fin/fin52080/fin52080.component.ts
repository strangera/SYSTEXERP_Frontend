import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52080Service } from '@service/api/fin/fin52080.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatDateTime } from '@shared/componentkit/table/table.model';
import { ValidationService } from '@shared/service/validation.service';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { testDorm } from './fin52080.model';

@Component({
  selector: 'app-fin52080',
  templateUrl: './fin52080.component.html',
  styleUrl: './fin52080.component.scss',
  standalone: !0,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberComponent,
    InputTextComponent,
    MultiSelectComponent,
    TableComponent,
    TranslateModule
  ]
})
export class FIN52080Component extends BasicQueryPageComponent<testDorm> implements OnInit {

  public readonly accNoFilter = /^\d{1,8}$/;

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
    AccCname: new FormControl<string>('', [Validators.maxLength(40)]),
    AccEname: new FormControl<string>('', [Validators.maxLength(50)]),
    AccDC: new FormControl<string[] | void>(void 0),
    Ledger_MD: new FormControl<string[] | void>(void 0),
    ClassNo: new FormControl<string[] | void>(void 0),
    ABAT_YN: new FormControl<string[] | void>(void 0),
    Voucher_Type: new FormControl<string[] | void>(void 0),
    Budget_YN: new FormControl<string[] | void>(void 0),
    Org_YN: new FormControl<string[] | void>(void 0),
    rest_value: new FormControl<string | void>(void 0, [Validators.maxLength(10), this.validationService.numberValidator]),
    rest_value2: new FormControl<string | void>(void 0, [Validators.maxLength(10), this.validationService.numberValidator]),
    Input_YN: new FormControl<string[] | void>(void 0),
    ...createPaginationConfig([{ field: 'AccNo', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  private readonly accNoSignal = toSignal(this.qf().AccNo.valueChanges);
  private readonly classNoSignal = toSignal(this.qf().ClassNo.valueChanges);

  public readonly totalRecords = computed(() => this.filteredData().length);
  public readonly filteredData = signal<testDorm[]>([]);
  public readonly selectedRows = signal<testDorm[]>([]);

  /** accNo驗證 綁定classNo用 */
  public readonly accNoEffect = effect(() => {
    const accNo = String(this.accNoSignal() ?? 0)?.substring(0, 3);
    this.qf().ClassNo.setValue(void 0);
    // this.logger.debug(`accNoEffect:`, [accNo, this.queryForm.getRawValue()]);
    if (!accNo) return;
    const matched = this.service.classNoMap.get(accNo);
    matched?.length && this.qf().ClassNo.setValue([accNo], { emitEvent: !1 });
  }, { allowSignalWrites: !0 });

  /** classNo驗證 accNo沒在清單內就清空 */
  public readonly classNoEffect = effect(() => {
    const classNo = this.classNoSignal() || [];
    const current = this.qf().AccNo.value?.substring(0, 3);
    // this.logger.debug(`classNoEffect:`, [classNo, current, this.queryForm.getRawValue()]);
    if (!classNo.length) return;

    const match = classNo.some(cn => this.service.classNoMap.get(cn) === current);
    if (!match) this.qf().AccNo.setValue(void 0, { emitEvent: !1 });
  });


  columns: (Omit<Column, 'field'> & { field: keyof testDorm; })[] = [ //先放可視範圍內的
    { field: 'AccNo', header: '科目代號' }, // 科目代號
    { field: 'AccCname', header: '科目名稱' }, // 科目名稱
    { field: 'AccEname', header: '科目英文名稱' }, // 科目英文名稱
    { field: 'AccDC', header: '借/貸', options: this.service.accDCOption, format: v => this.service.accDCOption.find(o => o.No === v)?.Name || v }, // 借/貸
    { field: 'Ledger_MD', header: '統制/明細', options: this.service.ledgerMDOption, format: v => this.service.ledgerMDOption.find(o => o.No === v)?.Name || v }, // 統制/明細
    { field: 'ClassNo', header: '三碼代號', options: this.service.classNoOption, format: v => this.service.classNoOption.find(o => o.No === v)?.Name || v }, // 三碼代號
    { field: 'ABAT_YN', header: '是否為沖帳代號', options: this.service.whetherOption, format: v => this.service.whetherOption.find(o => o.No === v)?.Name || v }, // 是否為沖帳代號
    { field: 'Voucher_Type', header: '傳票格式', options: this.service.voucherTypeOption, format: v => this.service.voucherTypeOption.find(o => o.No === v)?.Name || v }, // 傳票格式
    { field: 'Budget_YN', header: '是否為預算科目', options: this.service.whetherOption, format: v => this.service.whetherOption.find(o => o.No === v)?.Name || v }, // 是否為預算科目
    { field: 'Org_YN', header: '是否設定部門代號', options: this.service.whetherOption, format: v => this.service.whetherOption.find(o => o.No === v)?.Name || v }, // 是否設定部門代號
    { field: 'Input_YN', header: '是否可輸', options: this.service.whetherOption, format: v => this.service.whetherOption.find(o => o.No === v)?.Name || v }, // 是否可輸

    { field: 'CRT_Date', header: '建立日期', visible: !1, format: formatDateTime }, // 建立日期
    { field: 'CRT_USR_No', header: '建立人員', visible: !1 }, // 建立人員
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: !1 }, // 建立人員姓名
    { field: 'CRT_Date', header: '變更日期', visible: !1, format: formatDateTime }, // 變更日期
    { field: 'CRT_USR_No', header: '變更人員', visible: !1 }, // 變更人員
    { field: 'CRT_USR_Name', header: '變更人員姓名', visible: !1 }, // 變更人員姓名
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

    this.logger.debug(`init:`, [this.service.classNoOption]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const payload = { ...this.queryForm.getRawValue() };

      this.logger.debug(`對象及對帳維護作業 request:`, [payload]);

      // Voucher_Type: string, // 傳票格式
      // Budget_YN: string, // 是否為預算科目
      // Org_YN: string, // 是否設定部門代號
      // rest_value: number, // 折舊攤提年限
      // rest_value2: number, // 殘值年限
      // Input_YN: string, // 是否可輸

      this.service.loadFIN52080(payload);
      this.filteredData.set(this.service.FIN52080Data());

      this.loading = !1;
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());

      // this.fin15090Service.PrintFIN15090(body).pipe(untilDestroyed(this)).subscribe({
      //   next: (response) => {
      //     this.data = response.Data;
      //     this.logger.debug(`對象及對帳維護作業 response:`, [response]);
      //     this.totalRecords = response.TotalCount;
      //     this.queryStateService.setQueryState(this.ProgNo, frm.value);
      //     this.loading = !1;
      //   },
      //   error: () => { this.loading = !1; },
      // });
    });
  }

  // 刪除控制_Grace 9/9:
  // GLS6002 GLS3002若有對象別編號不可刪除
  onDelete(selectedRows: testDorm[]) {
    // const ids = selectedRows.map(row => row.id);
    // this.fin14010Service.deleteFIN11020(ids).pipe(untilDestroyed(this)).subscribe({
    //   next: () => {
    //     this.onSubmit(this.queryForm);
    //     this.selectedRows = [];
    //   },
    //   error: () => { this.loading = !1; },
    // });
  }

  isRowSelectable(row: testDorm) {
    // return row.CanDel;
    return !0;
  }
}
