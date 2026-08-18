import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS21020Service } from '@service/api/tls/tls21020.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { Maps } from '@others/component/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { concatMap, filter, finalize, Observable, switchMap, tap } from 'rxjs';
import { EntryType, TLS21020Data, TLS21020Query, TLS21020UpdateQuery } from './tls21020.model';

@Component({
  selector: 'app-tls21020',
  templateUrl: './tls21020.component.html',
  standalone: true,
  imports: [AccordionModule, FormsModule, ReactiveFormsModule, TranslateModule, ButtonComponent, DropdownComponent, MenubarComponent, TableEditComponent,],
})
export class TLS21020Component extends BasicQueryPageComponent<TLS21020Data> implements OnInit {
  public readonly service = inject(TLS21020Service);
  private readonly logger = inject(NGXLogger);
  private readonly destroyRef = inject(DestroyRef);

  public readonly queryForm = this.formBuilder.group({
    ENTRY_TYPE: new FormControl<EntryType | void>(void 0),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<TLS21020Data[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public readonly selectedItems = signal<TLS21020Data[]>([]);

  private readonly AccDCMap = new Map<'D' | 'C', '借' | '貸'>([['D', '借'], ['C', '貸']]);

  // 以下三組宣告需在 allColumns 之前，確保 plain property 初始化順序正確
  private readonly fail = (msg: string) => ({ isValid: false, errorMessage: msg });
  private readonly warn = (msg: string) => ({ isValid: true, errorMessage: msg });
  private readonly isEmpty = (v: unknown) => !v?.toString().trim();

  private readonly validatorField: [keyof TLS21020Data, string, boolean][] = [
    ['AccNo', '會計科目', true],
    ['Org_ID', '組織代碼', true],
    ['AccNotes', '傳票備註', false],
    ['RelatedPartyAccNo', '區分關係人會科', false],
    ['PAY_days', '付款天數', false],
    ['PAY_No', '付款別編號', false],
  ];

  /** 欄位級別驗證 */
  private readonly validator = (value: unknown, rowData: TLS21020Data, _data: TLS21020Data[], field: keyof TLS21020Data) => {
    const { Voucher_Type, ENTRY_TYPE } = rowData;
    if (Voucher_Type === '4' && ENTRY_TYPE?.trim() === 'SD') {
      if (field === 'VEN_No' && this.isEmpty(value)) {
        return { isValid: false, errorMessage: ['應收廠商必須填寫'] };
      }
      if (field === 'PAY_days') {
        if (this.validateValue(value)) return { isValid: false, errorMessage: ['付款天數必須為大於等於0的整數'] };
        if (this.isEmpty(value)) return { isValid: true, errorMessage: ['付款天數建議填寫'] };
      }
    }
    for (const [key, label, isRequired] of this.validatorField) {
      if (field !== key) continue;
      if (isRequired && this.isEmpty(value)) return { isValid: false, errorMessage: [`${label}為必填欄位`] };
      if (!isRequired && this.isEmpty(value)) return { isValid: true, errorMessage: [`${label}建議填寫`] };
    }
    return { isValid: true, errorMessage: [''] };
  };

  /**
   * 欄位顯示設定
   * - 有 key 就顯示該欄位,沒 key 就不顯示
   * - boolean 值 true 代表預設 type, false 則變成純文字顯示
   */
  private readonly columnsKeys = signal<Partial<Record<keyof TLS21020Data, boolean>>>({
    AccDC: true,
    ItemDesc: true,
    AccNo: true,
    Org_ID: true,
    AccNotes: true,
  });

  // allColumns 沒有呼叫任何 signal（選項以 Signal reference 傳入），computed 追蹤不到依賴，
  // 等同 plain property 但多一層包裹；改為 readonly 後每次存取不再重新建立陣列。
  private readonly allColumns: EditColumn[] = [
    { field: 'AccDC', header: '借/貸', format: (v: 'D' | 'C') => this.AccDCMap.get(v) || v, },
    { field: 'ItemDesc', header: '項目名稱' },
    {
      field: 'AccNo',
      header: '會計科目',
      type: 'dropdown',
      options: this.service.GLS1005Options,
      optionLabel: 'label',
      optionValue: 'value',
      validate: [this.validator],
      showClear: false,
      calculate: (_d: TLS21020Data, v: string) => {
        const glsData = this.service.GLS1005Map().get(v);
        const ABAT_YN = glsData?.['ABAT_YN'] || 'N';
        const Voucher_Type = glsData?.['Voucher_Type'];
        const updates: Partial<TLS21020Data> & { Voucher_Type?: string } = { ABAT_YN, Voucher_Type };
        if (Voucher_Type !== '4') {
          updates.VEN_No = void 0;
          updates.PAY_days = void 0;
        }
        return updates as Partial<TLS21020Data>;
      },
      width: '250px',
    },
    { field: 'ABAT_YN', header: '立沖科目', format: (v: 'Y' | 'N') => Maps.YN.get(v) || v },
    {
      field: 'Org_ID',
      header: '組織代碼',
      type: 'dropdown',
      options: this.service.SYS3100Options,
      optionLabel: 'label',
      optionValue: 'value',
      validate: [this.validator],
      format: (v: string) => this.service.SYS3100Map().get(v)?.label || v,
      showClear: false,
      width: '200px',
    },
    { field: 'AccNotes', header: '傳票備註', type: 'input', validate: [this.validator], width: '300px' },
    {
      field: 'ObjectNo',
      header: '是否依合約拆立組織',
      type: 'dropdown',
      format: (v: 'Y' | 'N') => Maps.YN.get(v) || v,
      options: this.service.getYNOptions,
      optionLabel: 'label',
      optionValue: 'value',
      width: '30px',
      showClear: false,
    },
    {
      field: 'RelatedPartyAccNo',
      header: '區分關係人會科',
      groupField: 'RelatedPartyAcc',
      type: 'dropdown',
      options: this.service.GLS1005Options,
      optionLabel: 'label',
      optionValue: 'value',
      validate: [this.validator],
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
      validate: [this.validator],
      disabled: (_v, _i, r) => (r as TLS21020Data).Voucher_Type !== '4',
    },
    {
      field: 'PAY_days',
      header: '付款天數',
      type: 'inputNumber',
      validate: [this.validator],
      disabled: (_v, _i, r) => (r as TLS21020Data).Voucher_Type !== '4',
      width: '1rem',
    },
    { field: 'PAY_No', header: '付款別編號', type: 'input', validate: [this.validator] },
  ];

  /** 根據 columnsKeys 動態產生最終欄位 */
  public readonly columns = computed((): EditColumn[] => {
    const keys = this.columnsKeys();
    return this.allColumns
      .filter(col => col.field in keys)
      .map(col => {
        const shouldKeepType = keys[col.field as keyof TLS21020Data];
        return shouldKeepType ? col : { ...col, type: void 0 };
      });
  });

  public readonly defaultInsertData: Partial<TLS21020Data> = {
    AccDC: 'D',
    ABAT_YN: 'N',
    ObjectNo: 'N',
  };

  public ngOnInit(): void {
    this.initializePage('TLS21020', void 0, this.queryForm, this.onSubmit.bind(this));
    this.service.getGLS1005s();
    this.service.getPOS2013s('1');
    this.service.getOrgIDs();
    this.qf().ENTRY_TYPE.valueChanges.pipe(takeUntilDestroyed(this.destroyRef), tap(type => {
      if (!type) {
        this.tableData.set([]);
        this.totalRecords.set(0);
      } else {
        this.updateColumnsKeys(type);
      }
    }), filter((type): type is EntryType => !!type), switchMap(() => {
      this.loading = true;
      this.tableLoading.set(true);
      return this.queryTLS21020().pipe(
        finalize(() => {
          this.loading = false;
          this.tableLoading.set(false);
        }),
      );
    })).subscribe(res => {
      if (res.Status !== '0000') return;
      this.tableData.set(res.Data || []);
      this.totalRecords.set(res.TotalCount || 0);
    });
  }

  private updateColumnsKeys(type: EntryType): void {
    switch (type) {
      case EntryType['WD自營日結傳票']:
        this.columnsKeys.set({ AccDC: true, ItemDesc: true, AccNo: true, Org_ID: true, AccNotes: true });
        break;
      case EntryType['SD銷售日傳票']:
        this.columnsKeys.set({ AccDC: true, ItemDesc: true, AccNo: true, Org_ID: true, AccNotes: true, ObjectNo: true, RelatedPartyAccNo: true, VEN_No: true, PAY_days: true });
        break;
      default:
        this.columnsKeys.set({ AccDC: true, ItemDesc: true, AccNo: true, Org_ID: true, AccNotes: true, ObjectNo: true, RelatedPartyAccNo: true });
    }
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const data = this.tableData().filter(v => !v._isAutoInsertCandidate);
      for (const item of data) {
        const { isValid, errorMessage } = this.validateRow(item);
        if (isValid) continue;
        this.loading = false;
        this.messageService.errorBubble(errorMessage);
        return;
      }

      const payload: TLS21020UpdateQuery[] = data.map(item => ({
        ...item,
        ObjectNo: item.ObjectNo === 'Y' ? 'Y' : 'N',
      }));

      this.loading = true;
      this.tableLoading.set(true);
      this.logger.debug('submit:', [this.queryForm.getRawValue(), this.tableData(), payload]);
      this.service.updateTLS21020(payload).pipe(
        concatMap(() => this.queryTLS21020()),
        finalize(() => {
          this.loading = false;
          this.tableLoading.set(false);
        }),
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

  public queryTLS21020(): Observable<ApiResponse<TLS21020Data[]>> {
    const payload = { ...this.queryForm.getRawValue(), pageSize: 1e5 } as TLS21020Query;
    this.queryStateService.setQueryState(this.ProgNo, payload);
    this.logger.debug('queryTLS21020:', [payload]);
    return this.service.queryTLS21020(payload);
  }

  public validateRow = (rowData: TLS21020Data): { isValid: boolean; errorMessage: string } => {
    const { VEN_No, PAY_days, Voucher_Type, ENTRY_TYPE } = rowData;
    if (Voucher_Type === '4' && ENTRY_TYPE?.trim() === 'SD') {
      if (this.isEmpty(VEN_No)) return this.fail('應收廠商必須填寫');
      if (this.validateValue(PAY_days)) return this.warn('付款天數必須為大於等於0的整數');
      if (this.isEmpty(PAY_days)) return this.warn('付款天數建議填寫');
    }

    const col = this.columns().some(col => this.validatorField.some(([key]) => col.field === key));
    if (col) for (const [key, label, isRequired] of this.validatorField) {
      const value = rowData[key];
      if (isRequired && this.isEmpty(value)) return this.fail(`${label}為必填欄位`);
      if (!isRequired && this.isEmpty(value)) return this.warn(`${label}建議填寫`);
    }

    return this.warn('');
  };

  private validateValue<T>(value: T): boolean {
    if (typeof value === 'string') return !value.trim();
    if (typeof value === 'number') return !Number.isInteger(value) || value < 0;
    const str = value?.toString();
    return !str?.trim();
  }
}
