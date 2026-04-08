import { Component, OnInit, signal, computed } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { NgFor, NgIf } from '@angular/common';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ASS11090Data, ASS11090UpdateRequest, ASS11090DetailRequest, ASS11090DetailItem, PurchaseAccountDetail, ExpenseTransferDetail, DepreciationDetail, VouAccDetail } from '../ass11090/ass11090.model';
import { ASS11090Service } from '../../../service/api/ass/ass11090.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { Option } from '../../../service/utility/dropdown-api.model';
import { TableEditComponent } from '../../../shared/componentkit/table-edit/table-edit.component';
import { EditColumn, FieldChangeEvent } from '../../../shared/componentkit/table-edit/table-edit.model';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize, forkJoin } from 'rxjs';

//3.1.1.9 資材中分類會計科目維護作業 CRU
@UntilDestroy()
@Component({
  selector: 'app-ass11090-cru',
  templateUrl: './ass11090-cru.component.html',
  styleUrl: './ass11090-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    InputNumberComponent,
    EditorTextComponent,
    NgFor,
    ButtonComponent,
    NgIf,
    TranslateModule,
    TableEditComponent
  ]
})
export class ASS11090CRUComponent extends BasicCruPageComponent<ASS11090Data> implements OnInit {

  // 下拉選單選項
  bigCategoryOptions: Option[] = []; // 大分類下拉選單（API 尚未開發，先保留欄位）
  midCategoryOptions: Option[] = []; // 中分類下拉選單（API 尚未開發，先保留欄位）
  accountingOptions: Option[] = []; // 所有會計科目下拉選單（共用 queryGLS1005）
  organizationOptions = signal<Option[]>([]); // 組織代號下拉選單（signal 讓 columns 依賴後 org 載入時會重算）

  // 明細表格資料（使用 signal 管理，類似 fin53010-cru）
  purchaseAccountDetails = signal<PurchaseAccountDetail[]>([]);
  expenseTransferDetails = signal<ExpenseTransferDetail[]>([]);
  depreciationDetails = signal<DepreciationDetail[]>([]);

  // 保存原始資料，用於後續更新時比較變更
  private originalData: ASS11090Data | null = null;

  // 表單結構
  dataForm = this.formBuilder.nonNullable.group({
    // 基本資料
    BigCategoryCode: [null as string | null],
    BigCategoryName: [''],
    MidCategoryCode: [null as string | null],
    MidCategoryName: [''],
    // 採買入帳科目區塊
    AccountingDebitCode: [null as string | null, [Validators.required]], // 所屬會計科目(借)
    AccountingDebitName: [''],
    AccountingCreditCode: [null as string | null, [Validators.required]], // 所屬會計科目(貸)
    AccountingCreditName: [''],
    InputTaxDebitCode: [null as string | null], // 進項稅額科目(借)
    InputTaxDebitName: [''],
    // 費用結轉科目區塊
    ExpenseAccountCode: [null as string | null], // 費用科目
    ExpenseAccountName: [''],
    AccumulatedDepreciationCreditCode1: [null as string | null], // 累計折舊科目(貸)
    AccumulatedDepreciationCreditName1: [''],
    // 折舊攤提科目區塊
    DepreciationDebitCode: [null as string | null], // 折舊科目(借)
    DepreciationDebitName: [''],
    AccumulatedDepreciationCreditCode2: [null as string | null], // 累計折舊科目(貸)
    AccumulatedDepreciationCreditName2: [''],
    DepreciationLife: [null as number | null, [Validators.maxLength(2)]], // 折舊年限
    Description: [''], // 說明
  });

  // 明細表格欄位定義
  /** 會計/費用科目選項：若該列有 AccNo 且不在清單中，動態加入一筆以顯示 AccNo-AccName */
  private accountingOptionsWithRow = (rowData: any): Option[] => {
    const list = this.accountingOptions;
    const code = rowData?.AccNo ?? rowData?.AccountingCode ?? rowData?.ExpenseCode;
    const name = rowData?.AccName ?? rowData?.AccountingName ?? rowData?.ExpenseName ?? '';
    if (!code) return list;
    if (list.some((o: Option) => o.value === code)) return list;
    return [{ value: code, label: `${code}-${name}` }, ...list];
  };

  purchaseAccountColumns = computed<EditColumn[]>(() => {
    this.organizationOptions(); // 依賴：org 載入後會重算 columns
    return [
      {
        field: 'AccountingCode',
        header: '會計科目(借)代號/名稱',
        type: this.isFormCreateable || this.isFormEditable ? 'dropdown' : undefined,
        required: true,
        options: (rowData: any) => this.accountingOptionsWithRow(rowData),
        optionLabel: 'label',
        optionValue: 'value',
        format: (v, i, r) => {
          const code = r?.AccNo ?? r?.AccountingCode;
          const name = r?.AccName ?? r?.AccountingName ?? '';
          if (!code) return '';
          return `${code}-${name}`;
        },
      },
      {
        field: 'OrganizationCode',
        header: '組織代號',
        type: this.isFormCreateable || this.isFormEditable ? 'dropdown' : undefined,
        options: (_rowData: any) => this.organizationOptions(),
        optionLabel: 'label',
        optionValue: 'value',
        format: (v, i, r) => {
          const orgId = r?.OrganizationCode;
          if (!orgId) return '';
          const option = this.organizationOptions().find(opt => opt.value === orgId);
          return (option ? option.label : null) ?? orgId ?? '';
        },
      },
    ];
  });

  expenseTransferColumns = computed<EditColumn[]>(() => {
    this.organizationOptions();
    return [
      {
        field: 'ExpenseCode',
        header: '費用科目代號/名稱',
        type: this.isFormCreateable || this.isFormEditable ? 'dropdown' : undefined,
        required: true,
        options: (rowData: any) => this.accountingOptionsWithRow(rowData),
        optionLabel: 'label',
        optionValue: 'value',
        format: (v, i, r) => {
          const code = r?.AccNo ?? r?.ExpenseCode;
          const name = r?.AccName ?? r?.ExpenseName ?? '';
          if (!code) return '';
          return `${code}-${name}`;
        },
      },
      {
        field: 'OrganizationCode',
        header: '組織代號',
        type: this.isFormCreateable || this.isFormEditable ? 'dropdown' : undefined,
        options: (_rowData: any) => this.organizationOptions(),
        optionLabel: 'label',
        optionValue: 'value',
        format: (v, i, r) => {
          const orgId = r?.OrganizationCode;
          if (!orgId) return '';
          const option = this.organizationOptions().find(opt => opt.value === orgId);
          return (option ? option.label : null) ?? orgId ?? '';
        },
      },
    ];
  });

  depreciationColumns = computed<EditColumn[]>(() => {
    this.organizationOptions();
    return [
      {
        field: 'ExpenseCode',
        header: '費用科目代號/名稱',
        type: this.isFormCreateable || this.isFormEditable ? 'dropdown' : undefined,
        required: true,
        options: (rowData: any) => this.accountingOptionsWithRow(rowData),
        optionLabel: 'label',
        optionValue: 'value',
        format: (v, i, r) => {
          const code = r?.AccNo ?? r?.ExpenseCode;
          const name = r?.AccName ?? r?.ExpenseName ?? '';
          if (!code) return '';
          return `${code}-${name}`;
        },
      },
      {
        field: 'OrganizationCode',
        header: '組織代號',
        type: this.isFormCreateable || this.isFormEditable ? 'dropdown' : undefined,
        options: (_rowData: any) => this.organizationOptions(),
        optionLabel: 'label',
        optionValue: 'value',
        format: (v, i, r) => {
          const orgId = r?.OrganizationCode;
          if (!orgId) return '';
          const option = this.organizationOptions().find(opt => opt.value === orgId);
          return (option ? option.label : null) ?? orgId ?? '';
        },
      },
    ];
  });

  constructor(
    private ass11090Service: ASS11090Service,
    private dropdownApiService: DropdownApiService,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11090', this.dataForm);
    this.loadDropdownOptions();

    // 編輯/查看模式時，呼叫 detailASS11090 取得完整資料
    if (!this.isFormCreateable && this.rowdata) {
      this.loadDetailData();
    }
  }

  // 載入下拉選單選項
  loadDropdownOptions(): void {
    // 載入會計科目下拉選單（使用 queryGLS1005_DropDownList）
    this.dropdownApiService.queryGls1005().pipe(untilDestroyed(this)).subscribe({
      next: (options) => {
        if (options) {
          this.accountingOptions = options;
        }
      },
      error: (err) => {
        console.error('載入會計科目下拉選單失敗:', err);
      }
    });

    // 載入組織代號下拉選單
    this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        if (response.Status === '0000' && response.Data) {
          this.organizationOptions.set(response.Data.map(item => ({
            label: `${item.No || ''}-${item.Name || ''}`,
            value: item.No || ''
          })));
        }
      },
      error: (err) => {
        console.error('載入組織代號下拉選單失敗:', err);
      }
    });

    // 大分類和中分類下拉選單的 API 尚未開發完畢，先留空
    // 待 API 開發完成後，可在此處載入
  }

  /**
   * 載入明細資料
   * 編輯/查看模式：先與組織下拉並行取得，再先設定 organizationOptions 再 mapApiDataToForm，確保表格初次渲染時組織代號能顯示 label
   */
  private loadDetailData(): void {
    const payload: ASS11090DetailRequest = {
      B_CLASS_ID: this.rowdata?.B_CLASS_ID,
      M_CLASS_ID: this.rowdata?.M_CLASS_ID,
    };

    this.loading = true;
    forkJoin({
      org: this.dropDownListService.querySYS3100_DropDownList(),
      detail: this.ass11090Service.queryASS11090Detail(payload),
    })
      .pipe(
        finalize(() => (this.loading = false)),
        untilDestroyed(this)
      )
      .subscribe({
        next: ({ org, detail: res }) => {
          if (org?.Status === '0000' && org?.Data) {
            this.organizationOptions.set(org.Data.map((item: { No?: string; Name?: string }) => ({
              label: `${item.No || ''}-${item.Name || ''}`,
              value: item.No || '',
            })));
          }
          if (res.Status !== '0000') return;
          // 保存原始資料用於比較變更
          this.originalData = res.Data;
          // 將 API 資料映射到表單（此時 organizationOptions 已就緒）
          this.mapApiDataToForm(res.Data);
          // 編輯模式下，大分類和中分類欄位設為 disabled
          this.dataForm.get('BigCategoryCode')?.disable();
          this.dataForm.get('BigCategoryName')?.disable();
          this.dataForm.get('MidCategoryCode')?.disable();
          this.dataForm.get('MidCategoryName')?.disable();
        },
        error: (err) => {
          console.error('載入資料失敗:', err);
          this.messageService.errorBubble('載入資料失敗');
        },
      });
  }

  /**
   * 將 API 回傳資料映射到表單欄位
   * API 欄位名稱與表單欄位名稱對應
   */
  private mapApiDataToForm(data: ASS11090Data): void {
    this.dataForm.patchValue({
      // 基本資料（檢視/編輯時顯示為 代碼-名稱）
      BigCategoryCode: data.B_CLASS_ID ?? null,
      BigCategoryName: `${data.B_CLASS_ID ?? ''}-${data.B_CLASS_NAME ?? ''}`,
      MidCategoryCode: data.M_CLASS_ID ?? null,
      MidCategoryName: `${data.M_CLASS_ID ?? ''}-${data.M_CLASS_NAME ?? ''}`,
      // 採買入帳科目區塊
      AccountingDebitCode: data.STYPE_ACCNO ?? null,
      AccountingDebitName: data.STYPE_ACCNO_NAME ?? '',
      AccountingCreditCode: data.STYPE_ACCNO2 ?? null,
      AccountingCreditName: data.STYPE_ACCNO2_NAME ?? '',
      InputTaxDebitCode: data.STYPE_TAX_ACCNO ?? null,
      InputTaxDebitName: data.STYPE_TAX_ACCNO_NAME ?? '',
      // 費用結轉科目區塊
      ExpenseAccountCode: data.FEES_STYPE_ID_ACCNO ?? null,
      ExpenseAccountName: data.FEES_STYPE_ACCNO_NAME ?? '',
      AccumulatedDepreciationCreditCode1: data.DEPRE_STYPE_ACCNO2 ?? null,
      AccumulatedDepreciationCreditName1: data.DEPRE_STYPE_ACCNO2_NAME ?? '',
      // 折舊攤提科目區塊
      DepreciationDebitCode: data.DEPRE_STYPE_ACCNO ?? null,
      DepreciationDebitName: data.DEPRE_STYPE_ACCNO_NAME ?? '',
      AccumulatedDepreciationCreditCode2: data.DEPRE_STYPE_ACCNO2 ?? null,
      AccumulatedDepreciationCreditName2: data.DEPRE_STYPE_ACCNO2_NAME ?? '',
      DepreciationLife: data.EXP_YEAR ?? null,
      Description: data.NOTES ?? '',
    });

    // 處理 VouAccDetails 明細資料
    if (data.VouAccDetails?.length) {
      // STYPE → 採買入帳科目明細
      const stypeDetails = data.VouAccDetails
        .filter(d => d.AccKind === 'STYPE')
        .map((d, i) => {
          const orgOption = this.organizationOptions().find(opt => opt.value === d.ORG_ID);
          return {
            SerialNo: i + 1,
            AccNo: d.AccNo,
            AccName: d.AccName,
            AccountingCode: d.AccNo,
            AccountingName: d.AccName,
            OrganizationCode: d.ORG_ID,
            OrganizationName: orgOption?.label,
          };
        });
      this.purchaseAccountDetails.set(stypeDetails);

      // FEES → 費用結轉科目明細
      const feesDetails = data.VouAccDetails
        .filter(d => d.AccKind === 'FEES')
        .map((d, i) => {
          const orgOption = this.organizationOptions().find(opt => opt.value === d.ORG_ID);
          return {
            SerialNo: i + 1,
            AccNo: d.AccNo,
            AccName: d.AccName,
            ExpenseCode: d.AccNo,
            ExpenseName: d.AccName,
            OrganizationCode: d.ORG_ID,
            OrganizationName: orgOption?.label,
          };
        });
      this.expenseTransferDetails.set(feesDetails);

      // DEPRE → 折舊攤提科目明細
      const depreDetails = data.VouAccDetails
        .filter(d => d.AccKind === 'DEPRE')
        .map((d, i) => {
          const orgOption = this.organizationOptions().find(opt => opt.value === d.ORG_ID);
          return {
            SerialNo: i + 1,
            AccNo: d.AccNo,
            AccName: d.AccName,
            ExpenseCode: d.AccNo,
            ExpenseName: d.AccName,
            OrganizationCode: d.ORG_ID,
            OrganizationName: orgOption?.label,
          };
        });
      this.depreciationDetails.set(depreDetails);
    }
  }

  // 新增明細項目
  addPurchaseAccountDetail(): void {
    const newDetail: PurchaseAccountDetail & { selected?: boolean } = {
      SerialNo: this.purchaseAccountDetails().length + 1,
      AccountingCode: undefined,
      AccountingName: undefined,
      OrganizationCode: undefined,
      OrganizationName: undefined,
      selected: false,
    };
    this.purchaseAccountDetails.update(details => [...details, newDetail]);
  }

  addExpenseTransferDetail(): void {
    const newDetail: ExpenseTransferDetail & { selected?: boolean } = {
      SerialNo: this.expenseTransferDetails().length + 1,
      ExpenseCode: undefined,
      ExpenseName: undefined,
      OrganizationCode: undefined,
      OrganizationName: undefined,
      selected: false,
    };
    this.expenseTransferDetails.update(details => [...details, newDetail]);
  }

  addDepreciationDetail(): void {
    const newDetail: DepreciationDetail & { selected?: boolean } = {
      SerialNo: this.depreciationDetails().length + 1,
      ExpenseCode: undefined,
      ExpenseName: undefined,
      OrganizationCode: undefined,
      OrganizationName: undefined,
      selected: false,
    };
    this.depreciationDetails.update(details => [...details, newDetail]);
  }

  // 明細資料變更處理
  onPurchaseAccountDataChange(data: PurchaseAccountDetail[]): void {
    this.purchaseAccountDetails.set(data);
  }

  onExpenseTransferDataChange(data: ExpenseTransferDetail[]): void {
    this.expenseTransferDetails.set(data);
  }

  onDepreciationDataChange(data: DepreciationDetail[]): void {
    this.depreciationDetails.set(data);
  }

  // 明細欄位變更處理
  onPurchaseAccountFieldChange(event: FieldChangeEvent): void {
    const rowData = event.rowData;
    if (event.field === 'AccountingCode') {
      const option = this.accountingOptions.find(opt => opt.value === event.value);
      rowData.AccountingName = option?.label ?? '';
    } else if (event.field === 'OrganizationCode') {
      const option = this.organizationOptions().find(opt => opt.value === event.value);
      rowData.OrganizationName = option?.label ?? '';
    }
  }

  onExpenseTransferFieldChange(event: FieldChangeEvent): void {
    const rowData = event.rowData;
    if (event.field === 'ExpenseCode') {
      const option = this.accountingOptions.find(opt => opt.value === event.value);
      rowData.ExpenseName = option?.label ?? '';
    } else if (event.field === 'OrganizationCode') {
      const option = this.organizationOptions().find(opt => opt.value === event.value);
      rowData.OrganizationName = option?.label ?? '';
    }
  }

  onDepreciationFieldChange(event: FieldChangeEvent): void {
    const rowData = event.rowData;
    if (event.field === 'ExpenseCode') {
      const option = this.accountingOptions.find(opt => opt.value === event.value);
      rowData.ExpenseName = option?.label ?? '';
    } else if (event.field === 'OrganizationCode') {
      const option = this.organizationOptions().find(opt => opt.value === event.value);
      rowData.OrganizationName = option?.label ?? '';
    }
  }

  // 資料拆分：將 API 回傳的資料拆分到三個區塊（編輯模式使用）
  // 注意：此方法現已被 mapApiDataToForm 取代，保留以維持相容性
  splitDataToSections(data: ASS11090Data): void {
    this.mapApiDataToForm(data);

    // 明細資料（如果 API 有回傳）
    // 注意：目前 API 可能還沒有回傳明細資料，這裡先保留結構
    if ((data as any).PurchaseAccountDetails) {
      this.purchaseAccountDetails.set((data as any).PurchaseAccountDetails);
    }
    if ((data as any).ExpenseTransferDetails) {
      this.expenseTransferDetails.set((data as any).ExpenseTransferDetails);
    }
    if ((data as any).DepreciationDetails) {
      this.depreciationDetails.set((data as any).DepreciationDetails);
    }
  }

  // 資料合併：將三個區塊的資料合併成單一物件（提交時使用）
  mergeDataFromSections(): ASS11090UpdateRequest {
    const formValue = this.dataForm.getRawValue();
    return {
      B_CLASS_ID: formValue.BigCategoryCode ?? undefined,
      M_CLASS_ID: formValue.MidCategoryCode ?? undefined,
      STYPE_ACCNO: formValue.AccountingDebitCode ?? undefined,
      STYPE_ACCNO2: formValue.AccountingCreditCode ?? undefined,
      STYPE_TAX_ACCNO: formValue.InputTaxDebitCode ?? undefined,
      FEES_STYPE_ID_ACCNO: formValue.ExpenseAccountCode ?? undefined,
      DEPRE_STYPE_ACCNO: formValue.DepreciationDebitCode ?? undefined,
      DEPRE_STYPE_ACCNO2: formValue.AccumulatedDepreciationCreditCode2 ?? undefined,
      EXP_YEAR: formValue.DepreciationLife ?? undefined,
      NOTES: formValue.Description ?? undefined,
      USR_NO: this.user?.user_No ?? '',
      USR_NAME: this.user?.user_Name ?? '',
      DETAILS: this.buildDetailsFromForm(formValue),
    };
  }

  /**
   * 建立更新明細資料（從表單欄位）
   */
  private buildDetailsFromForm(formValue: any): ASS11090DetailItem[] {
    const details: ASS11090DetailItem[] = [];
    const orig = this.originalData;

    // 明細三表：採買入帳(STYPE)、費用結轉(FEES)、折舊攤提(DEPRE) — 依索引比對新增/更新/刪除
    const vouAccDetails = orig?.VouAccDetails ?? [];
    details.push(
      ...this.buildDetailItemsForTable(
        'STYPE',
        vouAccDetails.filter((d): d is VouAccDetail => d.AccKind === 'STYPE'),
        this.purchaseAccountDetails().filter((row: PurchaseAccountDetail & { _isAutoInsertCandidate?: boolean }) => !row._isAutoInsertCandidate),
        'AccountingCode'
      )
    );
    details.push(
      ...this.buildDetailItemsForTable(
        'FEES',
        vouAccDetails.filter((d): d is VouAccDetail => d.AccKind === 'FEES'),
        this.expenseTransferDetails().filter((row: ExpenseTransferDetail & { _isAutoInsertCandidate?: boolean }) => !row._isAutoInsertCandidate),
        'ExpenseCode'
      )
    );
    details.push(
      ...this.buildDetailItemsForTable(
        'DEPRE',
        vouAccDetails.filter((d): d is VouAccDetail => d.AccKind === 'DEPRE'),
        this.depreciationDetails().filter((row: DepreciationDetail & { _isAutoInsertCandidate?: boolean }) => !row._isAutoInsertCandidate),
        'ExpenseCode'
      )
    );

    return details;
  }

  /**
   * 明細表單一表格的 OLD/NEW 比對：依索引產出新增(OLD 空/NEW 有)、更新(OLD+NEW 皆有)、刪除(OLD 有/NEW 空)。
   */
  private buildDetailItemsForTable(
    accKind: 'STYPE' | 'FEES' | 'DEPRE',
    origList: VouAccDetail[],
    currList: Array<PurchaseAccountDetail | ExpenseTransferDetail | DepreciationDetail>,
    accNoField: string
  ): ASS11090DetailItem[] {
    const items: ASS11090DetailItem[] = [];
    const origLen = origList.length;
    const currLen = currList.length;
    const minLen = Math.min(origLen, currLen);

    for (let i = 0; i < minLen; i++) {
      const orig = origList[i];
      const curr = currList[i];
      const oldOrg = orig?.ORG_ID ?? '';
      const oldAcc = orig?.AccNo ?? '';
      const newOrg = (curr?.OrganizationCode as string) ?? '';
      const newAcc = (curr as Record<string, unknown>)?.[accNoField] as string ?? '';
      const same = oldOrg === newOrg && oldAcc === newAcc;
      if (same) continue;
      if (newOrg || newAcc) {
        items.push({
          AccKind: accKind,
          OLD_ORG_ID: oldOrg,
          OLD_AccNo: oldAcc,
          NEW_ORG_ID: newOrg,
          NEW_AccNo: newAcc,
        });
      } else {
        items.push({
          AccKind: accKind,
          OLD_ORG_ID: oldOrg,
          OLD_AccNo: oldAcc,
          NEW_ORG_ID: '',
          NEW_AccNo: '',
        });
      }
    }
    for (let i = minLen; i < currLen; i++) {
      const curr = currList[i];
      const newOrg = (curr?.OrganizationCode as string) ?? '';
      const newAcc = (curr as Record<string, unknown>)?.[accNoField] as string ?? '';
      if (newOrg && newAcc) {
        items.push({
          AccKind: accKind,
          OLD_ORG_ID: '',
          OLD_AccNo: '',
          NEW_ORG_ID: newOrg,
          NEW_AccNo: newAcc,
        });
      }
    }
    for (let i = minLen; i < origLen; i++) {
      const orig = origList[i];
      items.push({
        AccKind: accKind,
        OLD_ORG_ID: orig?.ORG_ID ?? '',
        OLD_AccNo: orig?.AccNo ?? '',
        NEW_ORG_ID: '',
        NEW_AccNo: '',
      });
    }
    return items;
  }

  // 編輯模式（此方法現已被 loadDetailData 取代，保留以維持相容性）
  Edit(rowdata: any): void {
    this.loading = true;
    const payload: ASS11090DetailRequest = {
      B_CLASS_ID: rowdata.B_CLASS_ID,
      M_CLASS_ID: rowdata.M_CLASS_ID,
    };
    this.ass11090Service.queryASS11090Detail(payload).pipe(
      finalize(() => this.loading = false),
      untilDestroyed(this)
    ).subscribe({
      next: (response) => {
        if (response.Status === '0000' && response.Data) {
          this.splitDataToSections(response.Data);
          // 編輯模式下，大分類和中分類欄位設為 disabled
          this.dataForm.get('BigCategoryCode')?.disable();
          this.dataForm.get('BigCategoryName')?.disable();
          this.dataForm.get('MidCategoryCode')?.disable();
          this.dataForm.get('MidCategoryName')?.disable();
        }
      },
      error: (err) => {
        console.error('載入資料失敗:', err);
        this.messageService.errorBubble('載入資料失敗');
      }
    });
  }


  // 提交表單
  onSubmit(frm: FormGroup): void {
    this.submitted = true;

    this.handleSubmit(frm, () => {

      if (this.isFormCreateable) {
        // 新增模式（如果 API 有提供 insert 方法）
        this.messageService.errorBubble('新增功能尚未實作');
        this.loading = false;
      } else {
        // 編輯模式
        const payload = this.mergeDataFromSections();
        this.ass11090Service.updateASS11090(payload).pipe(
          finalize(() => this.loading = false),
          untilDestroyed(this)
        ).subscribe({
          next: (response) => {
            if (response.Status === '0000') {
              this.messageService.successBubble(response.Message || '更新成功');
              this.onCancel();
            } else {
              this.messageService.errorBubble(response.Message || '更新失敗');
            }
          },
          error: (err) => {
            console.error('更新失敗:', err);
            this.messageService.errorBubble('更新失敗');
          }
        });
      }
    });
  }

  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  override onCancel(): void {
    this.dataForm.reset();
    this.purchaseAccountDetails.set([]);
    this.expenseTransferDetails.set([]);
    this.depreciationDetails.set([]);
    // 重新啟用大分類和中分類欄位
    this.dataForm.get('BigCategoryCode')?.enable();
    this.dataForm.get('BigCategoryName')?.enable();
    this.dataForm.get('MidCategoryCode')?.enable();
    this.dataForm.get('MidCategoryName')?.enable();
    super.onCancel();
  }
}
