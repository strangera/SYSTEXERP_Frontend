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
import { ASS11090Data, ASS11090UpdateRequest, ASS11090DetailRequest, ASS11090DetailItem, PurchaseAccountDetail, ExpenseTransferDetail, DepreciationDetail } from '../ass11090/ass11090.model';
import { ASS11090Service } from '../../../service/api/ass/ass11090.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { Option } from '../../../service/utility/dropdown-api.model';
import { TableEditComponent } from '../../../shared/componentkit/table-edit/table-edit.component';
import { EditColumn, FieldChangeEvent } from '../../../shared/componentkit/table-edit/table-edit.model';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';

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
  organizationOptions: Option[] = []; // 組織代號下拉選單

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
  purchaseAccountColumns = computed<EditColumn[]>(() => [
    {
      field: 'AccountingCode',
      header: '會計科目(借)代號/名稱',
      type: this.isFormCreateable || this.isFormEditable ? 'dropdown' : undefined,
      required: true,
      options: () => this.accountingOptions,
      optionLabel: 'label',
      optionValue: 'value',
      format: (v, i, r) => {
        if (!r?.AccountingCode) return '';
        return `${r.AccountingCode}-${r.AccountingName || ''}`;
      },
    },
    {
      field: 'OrganizationCode',
      header: '組織代號',
      type: this.isFormCreateable || this.isFormEditable ? 'dropdown' : undefined,
      options: () => this.organizationOptions,
      optionLabel: 'label',
      optionValue: 'value',
      format: (v, i, r) => {
        if (!r?.OrganizationCode) return '';
        const option = this.organizationOptions.find(opt => opt.value === r.OrganizationCode);
        const orgName = option?.label?.split('-').slice(1).join('-') || '';
        return `${r.OrganizationCode}-${orgName}`;
      },
    },
  ]);

  expenseTransferColumns = computed<EditColumn[]>(() => [
    {
      field: 'ExpenseCode',
      header: '費用科目代號/名稱',
      type: this.isFormCreateable || this.isFormEditable ? 'dropdown' : undefined,
      required: true,
      options: () => this.accountingOptions,
      optionLabel: 'label',
      optionValue: 'value',
      format: (v, i, r) => {
        if (!r?.ExpenseCode) return '';
        return `${r.ExpenseCode}-${r.ExpenseName || ''}`;
      },
    },
    {
      field: 'OrganizationCode',
      header: '組織代號',
      type: this.isFormCreateable || this.isFormEditable ? 'dropdown' : undefined,
      options: () => this.organizationOptions,
      optionLabel: 'label',
      optionValue: 'value',
      format: (v, i, r) => {
        if (!r?.OrganizationCode) return '';
        const option = this.organizationOptions.find(opt => opt.value === r.OrganizationCode);
        const orgName = option?.label?.split('-').slice(1).join('-') || '';
        return `${r.OrganizationCode}-${orgName}`;
      },
    },
  ]);

  depreciationColumns = computed<EditColumn[]>(() => [
    {
      field: 'ExpenseCode',
      header: '費用科目代號/名稱',
      type: this.isFormCreateable || this.isFormEditable ? 'dropdown' : undefined,
      required: true,
      options: () => this.accountingOptions,
      optionLabel: 'label',
      optionValue: 'value',
      format: (v, i, r) => {
        if (!r?.ExpenseCode) return '';
        return `${r.ExpenseCode}-${r.ExpenseName || ''}`;
      },
    },
    {
      field: 'OrganizationCode',
      header: '組織代號',
      type: this.isFormCreateable || this.isFormEditable ? 'dropdown' : undefined,
      options: () => this.organizationOptions,
      optionLabel: 'label',
      optionValue: 'value',
      format: (v, i, r) => {
        if (!r?.OrganizationCode) return '';
        const option = this.organizationOptions.find(opt => opt.value === r.OrganizationCode);
        const orgName = option?.label?.split('-').slice(1).join('-') || '';
        return `${r.OrganizationCode}-${orgName}`;
      },
    },
  ]);

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
          this.organizationOptions = response.Data.map(item => ({
            label: `${item.No || ''}-${item.Name || ''}`,
            value: item.No || ''
          }));
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
   * 呼叫 detailASS11090 API 取得完整資料
   */
  private loadDetailData(): void {
    const payload: ASS11090DetailRequest = {
      B_CLASS_ID: this.rowdata?.B_CLASS_ID,
      M_CLASS_ID: this.rowdata?.M_CLASS_ID,
    };

    this.loading = true;
    this.ass11090Service.queryASS11090Detail(payload).pipe(
      finalize(() => this.loading = false),
      untilDestroyed(this)
    ).subscribe({
      next: (res) => {
        if (res.Status !== '0000') return;
        // 保存原始資料用於比較變更
        this.originalData = res.Data;
        // 將 API 資料映射到表單
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
      }
    });
  }

  /**
   * 將 API 回傳資料映射到表單欄位
   * API 欄位名稱與表單欄位名稱對應
   */
  private mapApiDataToForm(data: ASS11090Data): void {
    this.dataForm.patchValue({
      // 基本資料
      BigCategoryCode: data.B_CLASS_ID ?? null,
      BigCategoryName: data.B_CLASS_NAME ?? '',
      MidCategoryCode: data.M_CLASS_ID ?? null,
      MidCategoryName: data.M_CLASS_NAME ?? '',
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
          const orgOption = this.organizationOptions.find(opt => opt.value === d.ORG_ID);
          return {
            SerialNo: i + 1,
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
          const orgOption = this.organizationOptions.find(opt => opt.value === d.ORG_ID);
          return {
            SerialNo: i + 1,
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
          const orgOption = this.organizationOptions.find(opt => opt.value === d.ORG_ID);
          return {
            SerialNo: i + 1,
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
      const option = this.organizationOptions.find(opt => opt.value === event.value);
      rowData.OrganizationName = option?.label ?? '';
    }
  }

  onExpenseTransferFieldChange(event: FieldChangeEvent): void {
    const rowData = event.rowData;
    if (event.field === 'ExpenseCode') {
      const option = this.accountingOptions.find(opt => opt.value === event.value);
      rowData.ExpenseName = option?.label ?? '';
    } else if (event.field === 'OrganizationCode') {
      const option = this.organizationOptions.find(opt => opt.value === event.value);
      rowData.OrganizationName = option?.label ?? '';
    }
  }

  onDepreciationFieldChange(event: FieldChangeEvent): void {
    const rowData = event.rowData;
    if (event.field === 'ExpenseCode') {
      const option = this.accountingOptions.find(opt => opt.value === event.value);
      rowData.ExpenseName = option?.label ?? '';
    } else if (event.field === 'OrganizationCode') {
      const option = this.organizationOptions.find(opt => opt.value === event.value);
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

    // 所屬會計科目(借)
    if (formValue.AccountingDebitCode !== (orig?.STYPE_ACCNO ?? null)) {
      details.push({
        AccKind: 'STYPE_ACCNO',
        OLD_ORG_ID: '',
        OLD_AccNo: orig?.STYPE_ACCNO ?? '',
        NEW_ORG_ID: '',
        NEW_AccNo: formValue.AccountingDebitCode ?? '',
      });
    }

    // 所屬會計科目(貸)
    if (formValue.AccountingCreditCode !== (orig?.STYPE_ACCNO2 ?? null)) {
      details.push({
        AccKind: 'STYPE_ACCNO2',
        OLD_ORG_ID: '',
        OLD_AccNo: orig?.STYPE_ACCNO2 ?? '',
        NEW_ORG_ID: '',
        NEW_AccNo: formValue.AccountingCreditCode ?? '',
      });
    }

    // 進項稅額科目(借)
    if (formValue.InputTaxDebitCode !== (orig?.STYPE_TAX_ACCNO ?? null)) {
      details.push({
        AccKind: 'STYPE_TAX_ACCNO',
        OLD_ORG_ID: '',
        OLD_AccNo: orig?.STYPE_TAX_ACCNO ?? '',
        NEW_ORG_ID: '',
        NEW_AccNo: formValue.InputTaxDebitCode ?? '',
      });
    }

    // 費用科目
    if (formValue.ExpenseAccountCode !== (orig?.FEES_STYPE_ID_ACCNO ?? null)) {
      details.push({
        AccKind: 'FEES_STYPE_ID_ACCNO',
        OLD_ORG_ID: '',
        OLD_AccNo: orig?.FEES_STYPE_ID_ACCNO ?? '',
        NEW_ORG_ID: '',
        NEW_AccNo: formValue.ExpenseAccountCode ?? '',
      });
    }

    // 折舊科目(借)
    if (formValue.DepreciationDebitCode !== (orig?.DEPRE_STYPE_ACCNO ?? null)) {
      details.push({
        AccKind: 'DEPRE_STYPE_ACCNO',
        OLD_ORG_ID: '',
        OLD_AccNo: orig?.DEPRE_STYPE_ACCNO ?? '',
        NEW_ORG_ID: '',
        NEW_AccNo: formValue.DepreciationDebitCode ?? '',
      });
    }

    // 累計折舊科目(貸)
    if (formValue.AccumulatedDepreciationCreditCode2 !== (orig?.DEPRE_STYPE_ACCNO2 ?? null)) {
      details.push({
        AccKind: 'DEPRE_STYPE_ACCNO2',
        OLD_ORG_ID: '',
        OLD_AccNo: orig?.DEPRE_STYPE_ACCNO2 ?? '',
        NEW_ORG_ID: '',
        NEW_AccNo: formValue.AccumulatedDepreciationCreditCode2 ?? '',
      });
    }

    // 折舊年限
    if (formValue.DepreciationLife !== (orig?.EXP_YEAR ?? null)) {
      details.push({
        AccKind: 'EXP_YEAR',
        OLD_ORG_ID: '',
        OLD_AccNo: String(orig?.EXP_YEAR ?? ''),
        NEW_ORG_ID: '',
        NEW_AccNo: String(formValue.DepreciationLife ?? ''),
      });
    }

    // 備注
    if (formValue.Description !== (orig?.NOTES ?? null)) {
      details.push({
        AccKind: 'NOTES',
        OLD_ORG_ID: '',
        OLD_AccNo: orig?.NOTES ?? '',
        NEW_ORG_ID: '',
        NEW_AccNo: formValue.Description ?? '',
      });
    }

    return details;
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
