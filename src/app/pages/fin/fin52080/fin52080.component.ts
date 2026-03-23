import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52080Service } from '@service/api/fin/fin52080.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { TreeDropdownComponent } from '@shared/componentkit/tree-dropdown/tree-dropdown.component';
import { ValidationService } from '@shared/service/validation.service';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { finalize, map } from 'rxjs';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { AccDCType, FIN52080Data, FIN52080Query, FIN52080Tree, LedgerMDType, VoucherType } from './fin52080.model';


@Component({
  selector: 'app-fin52080',
  templateUrl: './fin52080.component.html',
  standalone: true,
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
    RadiobuttonYNComponent,
    TableComponent,
    TreeDropdownComponent,
  ]
})
export class FIN52080Component extends BasicQueryPageComponent<FIN52080Data> implements OnInit {

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
  public readonly queryForm = this.formBuilder.group({
    AccNo: new FormControl<string | void>(void 0, [Validators.minLength(3), Validators.maxLength(8)]),
    AccCName: new FormControl<string | void>(void 0, [Validators.maxLength(40)]),
    AccEName: new FormControl<string | void>(void 0, [Validators.maxLength(50)]),
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

  public readonly FIN52080Tree = signal<FIN52080Tree[]>([]);

  public readonly tableLoading = signal<boolean>(!1);
  public readonly treeLoading = signal<boolean>(!1);

  public readonly tableData = signal<FIN52080Data[]>([]);
  public readonly totalRecords = signal<number>(0);

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading()
  }, { allowSignalWrites: true });

  /**
   * - AccNo: 科目代號
   * - AccCName: 科目名稱
   * - AccEName: 科目英文名稱
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
    {
      field: 'AccDC',
      header: '借/貸',
      options: this.service.accDCOption,
      format: v => v === 'D' ? '借' : v === 'C' ? '貸' : v,
    },
    {
      field: 'Ledger_MD',
      header: '統制/明細',
      options: this.service.ledgerMDOption,
      format: v => v === '0' ? '統制' : v === '1' ? '明細' : v,
    },
    {
      field: 'ClassNo',
      header: '三碼代號',
      options: this.service.classNoOptions(),
    },
    {
      field: 'ABAT_YN',
      header: '是否為沖帳代號',
      options: this.service.whetherOption,
      format: v => v === 'Y' ? '是' : v === 'N' ? '否' : v,
    },
    {
      field: 'Voucher_Type',
      header: '傳票格式',
      options: this.service.voucherTypeOption,
      format: v => this.service.voucherTypeMap().get(v) || v,
    },
    {
      field: 'Budget_YN',
      header: '是否為預算科目',
      options: this.service.whetherOption,
      format: v => v === 'Y' ? '是' : v === 'N' ? '否' : v,
    },
    {
      field: 'Org_YN',
      header: '是否設定部門代號',
      options: this.service.whetherOption,
      format: v => v === 'Y' ? '是' : v === 'N' ? '否' : v,
    },
    {
      field: 'Input_YN',
      header: '是否可輸',
      options: this.service.whetherOption,
      format: v => v === 'Y' ? '是' : v === 'N' ? '否' : v,
    },
    {
      field: 'EXP_YEAR',
      header: '折舊攤提年限',
      // hidden: true,
      visible: false,
    },
    {
      field: 'RESI_VALUE',
      header: '殘值',
      // hidden: true,
      visible: false,
    },
  ];

  public readonly isRowSelectable = (rowData: FIN52080Data): boolean => rowData.CanDel !== false;

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

  constructor(
    public readonly service: FIN52080Service,
    private readonly validationService: ValidationService,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN52080', '/FIN/FIN52080CRU', this.queryForm, this.onSubmit.bind(this));

    this.treeLoading.set(!0);
    this.service.getClassNos();
    this.service.getFIN52080Tree().pipe(
      map(res => res.Data || []),
      finalize(() => this.treeLoading.set(!1)),
    ).subscribe(res => this.FIN52080Tree.set(res));

    this.logger.debug(`init:`, [this.service.classNoOptions(), this.FIN52080Tree()]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = { ...this.queryForm.getRawValue() } as FIN52080Query;
      const payload = Object.fromEntries(Object.entries(raw).filter(([_, v]) =>
        v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0)
      )) as unknown as FIN52080Query;

      this.tableLoading.set(!0);
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.logger.debug(`onSubmit:`, [this.queryForm.value, payload]);
      this.service.loadFIN52080(payload).pipe(
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.tableData.set(res.Data || []);
          this.totalRecords.set(res.TotalCount || 0);
        },
      });
    });
  };

  public onLevelSelected(selected: any[]): void {
    this.logger.debug(`onLevelSelected:`, [selected]);
  }

  public onDelete(selected: FIN52080Data[]): void {
    this.logger.debug(`onDelete:`, [selected]);
    this.messageService.confirm({
      header: '刪除確認',
      message: '確定要刪除選取的資料嗎？',
      accept: () => {
        const accNos = selected.map(v => v.AccNo);
        this.tableLoading.set(!0);
        this.service.deleteFIN52080({ Ids: accNos }).pipe(
          finalize(() => this.tableLoading.set(!1)),
        ).subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.messageService.successBubble(res.Message);
            this.onSubmit();
          },
        });
      },
    });
  }
}
