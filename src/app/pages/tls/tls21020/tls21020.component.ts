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
import { createPaginationConfig, Maps } from '@shared/componentkit/table/table.model';
import { validateRequired } from '@shared/componentkit/table/validate-field.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { concatMap, finalize } from 'rxjs';
import { EntryType, TLS21020Data, TLS21020Query, TLS21020UpdateQuery } from './tls21020.model';

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
    ENTRY_TYPE: new FormControl<EntryType | void>(void 0),
    ...createPaginationConfig([{ field: 'AccDC', order: 0 }, { field: 'AccNo', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  private readonly entryTypeSignal = toSignal(this.qf().ENTRY_TYPE.valueChanges);

  public readonly tableData = signal<TLS21020Data[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(!1);
  public readonly selectedItems = signal<TLS21020Data[]>([]);

  /** 根據 ENTRY_TYPE 動態調整欄位顯示與查詢 */
  public readonly entryTypeEffect = effect(() => {
    const ENTRY_TYPE = this.entryTypeSignal();
    if (!ENTRY_TYPE) return (this.tableData.set([]), this.totalRecords.set(0));

    // 日後可客製化欄位顯示
    switch (ENTRY_TYPE) {
      case EntryType['SD銷售日傳票']:
        this.columnsKeys.set({
          AccDC: !0,
          ItemDesc: !0,
          AccNo: !0,
          Org_ID: !0,
          AccNotes: !0,
          ObjectNo: !0,
          RelatedPartyAccNo: !0,
          VEN_No: !0,
          PAY_days: !0,
        });
        break;
      case EntryType['WD自營日結傳票']:
        this.columnsKeys.set({
          AccDC: !0,
          ItemDesc: !0,
          AccNo: !0,
          Org_ID: !0,
          AccNotes: !0,
        });
        break;
      default:
        this.columnsKeys.set({
          AccDC: !0,
          ItemDesc: !0,
          AccNo: !0,
          Org_ID: !0,
          AccNotes: !0,
          ObjectNo: !0,
          RelatedPartyAccNo: !0,
        });
        break;
    }
    this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
    this.queryTLS21020();
  }, { allowSignalWrites: !0 });

  private readonly AccDCMap = new Map<'D' | 'C', '借' | '貸'>([['D', '借'], ['C', '貸']]);

  /**
   * 欄位顯示設定
   * - 有 key 就顯示該欄位,沒 key 就不顯示
   * - boolean 值 true 代表預設 type, false 則變成純文字顯示
   */
  private readonly columnsKeys = signal<Partial<Record<keyof TLS21020Data, boolean>>>({
    AccDC: !0,
    ItemDesc: !0,
    AccNo: !0,
    // ABAT_YN: !1, 照要求隱藏
    Org_ID: !0,
    AccNotes: !0,
    // PAY_No: !1,
  });
  private readonly allColumns = computed((): EditColumn[] => {


    return [
      {
        field: 'AccDC',
        header: '借/貸',
        format: (v: 'D' | 'C') => this.AccDCMap.get(v) || v,
      },
      { field: 'ItemDesc', header: '項目名稱' },
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
        field: 'ABAT_YN',
        header: '是否專案應收',
        format: (v: 'Y' | 'N') => Maps.YN.get(v) || v,
      },
      {
        field: 'Org_ID',
        header: '組織代碼',
        type: 'dropdown',
        options: this.service.SYS3100Options,
        optionLabel: 'label',
        optionValue: 'value',
        validate: [validateRequired],
        format: (v: string) => this.service.SYS3100Map().get(v)?.label || v,
        showClear: !1,
      },
      {
        field: 'AccNotes',
        header: '傳票備註',
        type: 'input',
        width: '100%', /** @describe 先100 太寬再改 */
      },
      {
        field: 'ObjectNo',
        header: '是否依合約拆立組織',
        type: 'dropdown',
        format: (v: 'Y' | 'N') => Maps.YN.get(v) || v,
        options: this.service.getYNOptions,
        optionLabel: 'label',
        optionValue: 'value',
        width: '4rem',
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
        format: (v: string) => this.service.GLS1005Map().get(v)?.label || v || null,
      },
      {
        field: 'VEN_No',
        header: '應收廠商',
        groupField: 'Vendor',
        type: 'dropdown',
        options: this.service.POS2013Options,
        optionValue: 'value',
        templateLabel: 'label',
        validate: [this.ABATValidator],
        // disabled: v => v.ABAT_YN === 'N',
        // disabled: (v, i, r) => r.ABAT_YN === 'N',
      },
      {
        field: 'PAY_days',
        header: '付款天數',
        type: 'inputNumber',
        validate: [this.ABATValidator],
        // disabled: v => v.ABAT_YN === 'N',
        // disabled: (v, i, r) => r.ABAT_YN === 'N',
        width: '4rem',
      },
      {
        field: 'PAY_No',
        header: '付款別編號',
        type: 'input',
      },
    ];
  });

  /** 根據 columnsKeys 動態產生最終欄位 */
  public readonly columns = computed((): EditColumn[] => {
    const keys = this.columnsKeys();
    const all = this.allColumns();
    this.logger.debug(`columns:`, [keys, all]);
    return all
      .filter(col => col.field in keys)
      .map(col => {
        const shouldKeepType = keys[col.field as keyof TLS21020Data];
        if (!shouldKeepType) { const { type, ...rest } = col; return { ...rest, type: void 0 }; }
        return col;
      });
  });

  private readonly fail = (msg: string) => ({ isValid: !1, errorMessage: msg });
  private readonly warn = (msg: string) => ({ isValid: !0, errorMessage: msg });
  private readonly isEmpty = (v: unknown) => !v?.toString().trim();

  public readonly defaultInsertData: Partial<TLS21020Data> = {
    AccDC: 'D',
    ABAT_YN: 'N',
    ObjectNo: 'N',
  };

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading()
      || this.service.gls1005Loading()
      || this.service.pos2013Loading()
      || this.service.orgIdLoading();
  });

  constructor(
    public readonly service: TLS21020Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS21020', void 0, this.queryForm, this.onSubmit.bind(this));

    this.service.getGLS1005s();
    this.service.getPOS2013s('1');
    this.service.getOrgIDs();
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const ENTRY_TYPE = this.entryTypeSignal();
      if (!ENTRY_TYPE) return void (this.loading = !1);

      const data = this.tableData().filter(v => !v._isAutoInsertCandidate);
      for (const item of data) {
        const validation = this.validateRow(item);
        if (!validation.isValid) return this.messageService.errorBubble(validation.errorMessage);
      }

      const payload: TLS21020UpdateQuery[] = data.map(item => ({
        ...item,
        ObjectNo: item.ObjectNo === 'Y' ? 'Y' : 'N',
      }));

      this.tableLoading.set(!0);
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.logger.debug(`submit:`, [ENTRY_TYPE, this.tableData(), payload]);
      this.service.updateTLS21020(payload).pipe(
        concatMap(() => this.service.queryTLS21020({ ENTRY_TYPE, pageSize: 1e5 })),
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.tableData.set(res.Data || []);
          this.totalRecords.set(res.TotalCount || 0);
          this.messageService.successBubble('更新成功');
        },
      });
    });
  }

  public queryTLS21020(): void {
    this.tableLoading.set(!0);
    const raw = <TLS21020Query>{ ...this.queryForm.getRawValue(), pageSize: 1e5 };
    const payload = Object.fromEntries(Object.entries(raw).filter(([_, v]) =>
      v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0)
    )) as unknown as TLS21020Query;

    this.logger.debug(`queryTLS21020:`, [payload]);
    this.service.queryTLS21020(payload).pipe(
      finalize(() => this.tableLoading.set(!1)),
    ).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        this.tableData.set(res.Data || []);
        this.totalRecords.set(res.TotalCount || 0);
      },
    });
  }

  /** 錯誤檢查 */
  public validateRow = (rowData: TLS21020Data, index?: number): { isValid: boolean, errorMessage: string; } => {
    // Org_ID 必填
    if (this.isEmpty(rowData.Org_ID)) return this.fail('組織代碼必須填寫');

    // 必填欄位檢查
    if (this.isEmpty(rowData.AccDC)) return this.fail('借/貸必須填寫');
    if (this.isEmpty(rowData.ItemDesc)) return this.fail('項目名稱必須填寫');
    if (this.isEmpty(rowData.AccNo)) return this.fail('會計科目必須填寫');

    // ABAT_YN 為 Y 時，VEN_No 必填
    if (rowData.ABAT_YN === 'Y')
      if (this.isEmpty(rowData.VEN_No)) return this.fail('應收廠商必須填寫');

    // 可選欄位警告檢查
    if (rowData.ABAT_YN === 'Y') {
      if (this.validateValue(rowData.PAY_days)) return this.warn('付款天數必須為大於等於0的整數');
      if (this.isEmpty(rowData.PAY_days)) return this.warn('付款天數必須填寫');
    }
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

  private ABATValidator(value: any, rowData: any, data: any[], field: string, header: string) {
    return (rowData?.ABAT_YN === 'Y' && this.isEmpty(value))
      ? { isValid: !1, errorMessage: [header ? `${header}必須填寫` : '此欄位必須填寫'] }
      : { isValid: !0, errorMessage: [] };
  }

  /** 檢查型別 */
  private validateValue<T>(value: T): boolean {
    if (typeof value === 'string') return !value.trim();
    if (typeof value === 'number') return !Number.isInteger(value) || value < 0;
    const str = value?.toString();
    return !str || !str.trim();
  }
}
