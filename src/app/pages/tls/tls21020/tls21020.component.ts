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
import { validateNumber, validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { createPaginationConfig, Maps } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize, mergeMap } from 'rxjs';
import { TLS21020Data, TLS21020UpdateQuery } from './tls21020.model';

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
  public readonly totalRecords = computed(() => this.service.TLS21020Data().length);

  private readonly entryTypeSignal = toSignal(this.qf().ENTRY_TYPE.valueChanges);
  public canSave = signal(!1);

  public readonly loadingEffect = effect(() => {
    this.loading = this.service.tableLoading()
      || this.service.gls1005Loading()
      || this.service.pos2013Loading()
      || this.service.orgIdLoading();
  });

  /** entryType 改變時，取得table 資料 */
  public readonly entryTypeEffect = effect(() => {
    const ENTRY_TYPE = this.entryTypeSignal();
    if (!ENTRY_TYPE) return;

    this.service.queryTLS21020({ ENTRY_TYPE }).subscribe();
    this.logger.debug(`entryType changed:`, [ENTRY_TYPE]);
    this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
  }, { allowSignalWrites: !0 });

  public selectedItems: TLS21020Data[] = [];
  private AccDCMap = new Map<string, string>([['D', '借'], ['C', '貸']]);
  private ABATYN = (v: any) => v?.ABAT_YN === 'N';

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
      options: this.service.GLS1005Data,
      optionLabel: 'label',
      optionValue: 'value',
      validate: [validateRequired],
      showClear: !1,
    },
    {
      field: 'Org_ID',
      header: '組織代碼',
      type: 'dropdown',
      options: this.service.SYS3100Data,
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
      options: this.service.GLS1005Data,
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
      options: this.service.POS2013Data,
      optionLabel: 'Name',
      optionValue: 'VEN_No',
      disabled: this.ABATYN,
      templateLabel: 'ShortName',
      showClear: !1,
    },
    {
      field: 'PAY_days',
      header: '付款天數',
      type: 'inputNumber',
      disabled: this.ABATYN,
      validate: [validateNumber],
    },
    {
      field: 'PAY_No',
      header: '付款別編號',
      type: 'input',
      disabled: this.ABATYN,
    },
  ];

  public readonly defaultInsertData: Partial<TLS21020Data> = {
    AccDC: 'D',
    ABAT_YN: 'N',
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
    this.logger.debug(`init:`, []);
  }

  public rowEditValid(row: TLS21020Data, index: number, data: TLS21020Data[]): boolean {
    return index === data.length - 2;
  }

  public validateEntireRow = (rowData: TLS21020Data): { isValid: boolean, errorMessage: string; } => {
    // const baseRequiredFields: (keyof TLS21020Data)[] = ['Org_ID', 'ObjectNo'];
    const result = (errorMessage: string) => {
      this.canSave.set(!1);
      return { isValid: !1, errorMessage };
    };

    // 必填欄位檢查
    // const objectNoFormatValid = rowData.ObjectNo === 'Y' || rowData.ObjectNo === 'N';
    // if (!objectNoFormatValid) return { isValid: !1, errorMessage: '對象別編號格式錯誤' };

    // 基本必填欄位
    // const baseFieldsValid = baseRequiredFields.every(field => {
    //   const value = rowData[field];
    //   return value !== void 0 && value !== null && String(value).trim() !== '';
    // });
    // if (!baseFieldsValid) return { isValid: !1, errorMessage: '必要欄位未填寫' };

    // Org_ID 必填
    if (this.validateValue(rowData.Org_ID)) return result('組織代碼必須填寫');

    // ABAT_YN 為 Y 時，VEN_No 與 PAY_days 必填
    if (rowData.ABAT_YN !== 'N') {
      if (!String(rowData.VEN_No ?? '').trim()) return result('應收廠商必須填寫');
      if (!String(rowData.PAY_days ?? '').trim()) return result('付款天數必須填寫');
    }

    // 可選欄位檢查
    let optionalFieldsValid = '';

    // PAY_days 必須為大於等於0的整數
    if (this.validateValue(rowData.PAY_days)) optionalFieldsValid = '付款天數必須為大於等於0的整數';
    // PAY_No 不可為空字串
    if (this.validateValue(rowData.PAY_No)) optionalFieldsValid = '付款別編號必須填寫';
    // AccNotes 不可為空字串
    if (this.validateValue(rowData.AccNotes)) optionalFieldsValid = '傳票備註必須填寫';
    // AccNo 必填且不可為空字串
    if (this.validateValue(rowData.AccNo)) optionalFieldsValid = '會計科目必須填寫';
    // RelatedPartyAccNo 不可為空字串
    if (this.validateValue(rowData.RelatedPartyAccNo)) optionalFieldsValid = '區分關係人會科必須填寫';

    // if (optionalFieldsValid.length > 0) return { isValid: !1, errorMessage: optionalFieldsValid };

    // 檢查是否有重複的組合 (AccDC, ItemDesc, AccNo)
    const rows = this.service.TLS21020Data();
    if (!rows.includes(rowData)) return result('找不到該列資料');

    const { AccDC, ItemDesc, AccNo } = rowData;
    const duplicate = rows.some(item => item !== rowData && item.AccDC === AccDC && item.ItemDesc === ItemDesc && item.AccNo === AccNo);
    if (duplicate) return result('會計科目與項目描述必須唯一');

    this.canSave.set(!0);
    return { isValid: !0, errorMessage: '' };
  };

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const ENTRY_TYPE = this.entryTypeSignal();
      if (!ENTRY_TYPE) return;

      const payload: TLS21020UpdateQuery[] = this.service.TLS21020Data().map(v => ({
        ABAT_YN: v.ABAT_YN,
        AccNo: v.AccNo,
        AccNotes: v.AccNotes,
        ObjectNo: v.ObjectNo,
        Org_ID: v.Org_ID,
        PAY_No: v.PAY_No,
        PAY_days: v.PAY_days,
        RelatedPartyAccNo: v.RelatedPartyAccNo,
        VEN_No: v.VEN_No,
        id: v.id,
      }));
      this.logger.debug(`onSubmit:`, [payload]);
      this.service.updateTLS21020(payload).pipe(
        mergeMap(() => this.service.queryTLS21020({ ENTRY_TYPE })),
      ).subscribe({
        next: () => this.messageService.successBubble('更新成功'),
        error: () => this.messageService.errorBubble('更新失敗'),
      });
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
    });
  }

  private validateValue(value: unknown): boolean {
    if (typeof value === 'string') return !value.trim();
    if (typeof value === 'number') return !Number.isInteger(value) || value < 0;
    return !String(value ?? '').trim();
  }
}
