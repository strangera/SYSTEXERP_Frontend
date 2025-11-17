import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS21020Service } from '@service/api/tls/tls21020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { createPaginationConfig, Maps } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { mergeMap, tap } from 'rxjs';
import { TLS21020Data, TLS21020Query, TLS21020UpdateQuery } from './tls21020.model';

@Component({
  selector: 'app-tls21020',
  templateUrl: './tls21020.component.html',
  standalone: !0,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    MenubarComponent,
    TableEditComponent,
  ],
})
export class TLS21020Component extends BasicQueryPageComponent<TLS21020Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    ENTRY_TYPE: new FormControl<string | void>(void 0),
    ...createPaginationConfig([{ field: 'SEQNO', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  private readonly entryTypeSignal = toSignal(this.qf().ENTRY_TYPE.valueChanges);

  public readonly tableData = signal<TLS21020Data[]>([]);
  public readonly totalRecords = signal(0);
  public readonly selectedItems = signal<TLS21020Data[]>([]);
  public readonly canSave = signal<boolean>(!0);

  /** entryType 改變時，取得table 資料 */
  public readonly entryTypeEffect = effect(() => {
    const ENTRY_TYPE = this.entryTypeSignal();
    if (!ENTRY_TYPE) return;

    const controls = this.qf();
    const payload: TLS21020Query = { ENTRY_TYPE, PageSize: 9999 };

    for (const [k, v] of Object.entries(controls)) {
      const val = v.value;
      if (val !== null && val !== void 0 && val !== '') (payload as any)[k] = val;
    }

    this.service.queryTLS21020(payload).pipe(
      tap(res => {
        this.tableData.set(res.Data ?? []);
        this.totalRecords.set(res.TotalCount ?? 0);
      }),
    ).subscribe();
    this.logger.debug(`entryType changed:`, [ENTRY_TYPE, payload]);
    this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
  }, { allowSignalWrites: !0 });

  private readonly AccDCMap = new Map<string, string>([['D', '借'], ['C', '貸']]);
  private readonly ABATYN = (v: any) => v?.ABAT_YN === 'N';

  public readonly loadingEffect = effect(() => {
    this.loading = this.service.tableLoading()
      || this.service.gls1005Loading()
      || this.service.pos2013Loading()
      || this.service.orgIdLoading();
  });

  public readonly columns: EditColumn[] = [
    {
      field: 'AccDC',
      header: '借/貸',
      type: 'dropdown',
      format: v => this.AccDCMap.get(v) || v,
      options: [{ label: '借', value: 'D' }, { label: '貸', value: 'C' }],
      optionLabel: 'label',
      optionValue: 'value',
      showClear: !1,
      validate: [validateRequired],
      width: '6em',
    },
    {
      field: 'ItemDesc',
      header: '項目名稱',
      type: 'input',
    },
    {
      field: 'ABAT_YN',
      header: '是否專案應收',
      type: 'dropdown',
      format: v => Maps.YN.get(v) || v,
      options: this.service.getYNOptions,
      optionLabel: 'label',
      optionValue: 'value',
      showClear: !1,
      validate: [validateRequired],
      width: '8em',
    },
    {
      field: 'AccNo',
      header: '會計科目',
      type: 'dropdown',
      options: this.service.GLS1005Options,
      optionLabel: 'label',
      optionValue: 'value',
      validate: [validateRequired],
      showClear: !1,
    },
    {
      field: 'Org_ID',
      header: '組織代碼',
      type: 'dropdown',
      options: this.service.SYS3100Options,
      optionLabel: 'label',
      optionValue: 'value',
      showClear: !1,
      validate: [validateRequired],
    },
    {
      field: 'AccNotes',
      header: '傳票備註',
      type: 'input',
    },
    {
      field: 'ObjectNo',
      header: '是否依合約拆立組織',
      type: 'dropdown',
      options: this.service.getYNOptions,
      optionLabel: 'label',
      optionValue: 'value',
      showClear: !1,
    },
    {
      field: 'RelatedPartyAccNo',
      header: '區分關係人會科',
      groupField: 'RelatedPartyAcc',
      type: 'dropdown',
      options: this.service.GLS1005Options,
      optionLabel: 'label',
      optionValue: 'value',
      showClear: !1,
      disabled: this.ABATYN,
    },
    {
      field: 'VEN_No',
      header: '應收廠商',
      groupField: 'Vendor',
      type: 'dropdown',
      options: this.service.POS2013Options,
      optionLabel: 'Name',
      optionValue: 'VEN_No',
      disabled: this.ABATYN,
      templateLabel: 'ShortName',
      showClear: !1,
      validate: [this.abatVal.bind(this)],
    },
    {
      field: 'PAY_days',
      header: '付款天數',
      type: 'inputNumber',
      disabled: this.ABATYN,
      validate: [this.abatVal.bind(this)],
    },
    {
      field: 'PAY_No',
      header: '付款別編號',
      type: 'input',
      disabled: this.ABATYN,
    },
  ];

  private readonly fail = (msg: string) => ({ isValid: !1, errorMessage: msg });
  private readonly warn = (msg: string) => ({ isValid: !0, errorMessage: msg });
  private readonly isEmpty = (v: unknown) => !v?.toString().trim();

  private abatVal(value: any, rowData: any): { isValid: boolean; errorMessage: string[]; } {
    return Object.create(this.ABATYN(rowData) ? { isValid: !0, errorMessage: [] } : validateRequired(value));
  }

  public readonly defaultInsertData: Partial<TLS21020Data> = {
    AccDC: 'D',
    ABAT_YN: 'N',
    ObjectNo: 'N',
  };

  constructor(
    public readonly service: TLS21020Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS21020', '/TLS/TLS21020CRU', this.queryForm, this.onSubmit.bind(this));

    this.service.getGLS1005s();
    this.service.getPOS2013s('1');
    this.service.getOrgIDs();
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const ENTRY_TYPE = this.entryTypeSignal();
      if (!ENTRY_TYPE) return;

      const data = this.tableData().filter(v => !v._isAutoInsertCandidate);
      const payload: TLS21020UpdateQuery[] = data.map(item => {
        const row: Partial<TLS21020UpdateQuery> = { id: item.id };
        const fields: (keyof TLS21020Data)[] = ['ABAT_YN', 'AccNo', 'AccNotes', 'ObjectNo', 'Org_ID', 'PAY_No', 'PAY_days', 'RelatedPartyAccNo', 'VEN_No'];

        for (const field of fields) {
          const value = item[field];
          if (!this.validateValue(value)) (row as any)[field] = value;
        }

        return row as TLS21020UpdateQuery;
      });

      this.logger.debug(`onSubmit:`, [payload]);
      this.service.updateTLS21020(payload).pipe(
        mergeMap(() => this.service.queryTLS21020({ ENTRY_TYPE })),
        tap(res => this.logger.debug(`更新:`, [res])),
      ).subscribe();
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
    });
  }

  public validateRow = (rowData: TLS21020Data, index?: number): { isValid: boolean, errorMessage: string; } => {
    // Org_ID 必填
    if (this.isEmpty(rowData.Org_ID)) return this.fail('組織代碼必須填寫');

    // ABAT_YN 為 Y 時，VEN_No 與 PAY_days 必填
    if (rowData.ABAT_YN !== 'N') {
      if (this.isEmpty(rowData.VEN_No)) return this.fail('應收廠商必須填寫');
      if (this.isEmpty(rowData.PAY_days)) return this.fail('付款天數必須填寫');
    }

    // 可選欄位警告檢查
    if (this.validateValue(rowData.PAY_days)) return this.warn('付款天數必須為大於等於0的整數');
    if (this.isEmpty(rowData.PAY_No)) return this.warn('付款別編號必須填寫');
    if (this.isEmpty(rowData.AccNotes)) return this.warn('傳票備註必須填寫');
    if (this.isEmpty(rowData.AccNo)) return this.warn('會計科目必須填寫');
    if (this.isEmpty(rowData.RelatedPartyAccNo)) return this.warn('區分關係人會科必須填寫');

    // 檢查重複 (AccDC, ItemDesc, AccNo)
    const rows = this.tableData();
    const rowIndex = rows.indexOf(rowData);
    if (rowIndex === -1) return this.fail('找不到該列資料');

    const { AccDC, ItemDesc, AccNo } = rowData;
    for (let i = 0; i < rows.length; i++) {
      if (i === rowIndex) continue;
      const item = rows[i];
      if (item.AccDC === AccDC && item.ItemDesc === ItemDesc && item.AccNo === AccNo)
        return this.fail('會計科目與項目描述必須唯一');
    }

    return { isValid: !0, errorMessage: '' };
  };

  public dataChange(event: TLS21020Data[], validate: boolean): void {
    // this.logger.debug(`dataChange:`, [event]);
    this.tableData.set(event);
    this.canSave.set(!validate);
  }

  /** 檢查型別 */
  private validateValue<T>(value: T): boolean {
    if (typeof value === 'string') return !value.trim();
    if (typeof value === 'number') return !Number.isInteger(value) || value < 0;
    const str = value?.toString();
    return !str || !str.trim();
  }
}
