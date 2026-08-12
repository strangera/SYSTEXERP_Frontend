import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ASS11080Service } from '../../../service/api/ass/ass11080.service';
import { ASS11080Data, ASS11080QueryDataItem, ASS11080UpdateItem, ASS11080UpdateRequest } from './ass11080.model';

// 3.1.1.8 處分資產基本設定
@UntilDestroy()
@Component({
  selector: 'app-ass11080',
  templateUrl: './ass11080.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    ButtonComponent
  ]
})
export class ASS11080Component extends BasicCruPageComponent<ASS11080Data> implements OnInit {

  // 所有 TAG 欄位名稱
  private static readonly TAG_FIELDS: (keyof ASS11080Data)[] = [
    'PS', 'PC', 'PC_LOSS', 'AR', 'LOSS', 'GET', 'MTDAM', 'MTINVW', 'MTINVL'
  ];

  // 需要 Y/N 轉換的布林欄位
  private static readonly BOOLEAN_FIELDS: (keyof ASS11080Data)[] = ['PS', 'PC'];

  // 表單定義
  dataForm = this.formBuilder.group({
    /** 變賣傳票是否啟用 */
    PS: ['', [Validators.required]],
    /** 報廢傳票是否啟用 */
    PC: ['', [Validators.required]],
    /** 資產報廢->處分資產損失 */
    PC_LOSS: ['', [Validators.required]],
    /** 資產變賣->應收帳款 */
    AR: ['', [Validators.required]],
    /** 資產變賣->處分資產損失 */
    LOSS: ['', [Validators.required]],
    /** 資產變賣->處分資產收入 */
    GET: ['', [Validators.required]],
    /** 資產變賣->耗材報廢會科 */
    MTDAM: ['', [Validators.required]],
    /** 耗材盤點->耗材盤盈會科 */
    MTINVW: ['', [Validators.required]],
    /** 耗材盤點->耗材盤損會科 */
    MTINVL: ['', [Validators.required]],
  });

  // 下拉選項：是/否
  yesNoOptions = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' }
  ];

  // 下拉選項：會計科目 (queryGLS1005_ledgerMD_DropDownList)
  accountOptions: Option[] = [];

  // 儲存每個 TAG 的完整資料（用於更新時取得 ID、SortNo 等）
  tagDataMap = new Map<string, ASS11080QueryDataItem>();

  constructor(
    private ass11080Service: ASS11080Service,
    private dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11080', this.dataForm);

    // 設定頁面應該允許直接編輯，不需要透過路由 state
    this.crudstatus = CRUDStatus.Edit;

    // 載入會計科目下拉選項
    this.loadAccountOptions();

    // 一進入頁面就載入設定資料
    this.onQuery();
  }

  /**
   * 判斷欄位是否為布林欄位（需要 Y/N 轉換）
   */
  private isBooleanField(field: keyof ASS11080Data): boolean {
    return ASS11080Component.BOOLEAN_FIELDS.includes(field);
  }

  /**
   * 將查詢資料轉換為表單值
   */
  private convertQueryDataToFormValues(): Partial<ASS11080Data> {
    const formValues: Partial<ASS11080Data> = {};

    ASS11080Component.TAG_FIELDS.forEach((field) => {
      const tagData = this.tagDataMap.get(field);
      if (tagData) {
        if (this.isBooleanField(field)) {
          formValues[field] = tagData.IsActive ? 'Y' : 'N';
        } else {
          formValues[field] = tagData.AccNo || '';
        }
      } else {
        // 如果該 TAG 不存在，設為預設值
        formValues[field] = this.isBooleanField(field) ? 'N' : '';
      }
    });

    return formValues;
  }

  /**
   * 建立更新項目
   */
  private createUpdateItem(
    field: keyof ASS11080Data,
    formValue: string,
    tagData?: ASS11080QueryDataItem
  ): ASS11080UpdateItem {
    if (this.isBooleanField(field)) {
      // PS/PC 為是否啟用開關，本身無會計科目概念，AccNo 一律不帶值，
      // 避免延續舊資料殘留的 'Y'/'N'（非合法科目代號）觸發後端 GLS1005 存在性檢查失敗
      return {
        TAG: field,
        AccNo: '',
        NOTES: tagData?.Notes || '',
        IsActive: formValue === 'Y',
        Sort: tagData?.SortNo ?? 0
      };
    } else {
      return {
        TAG: field,
        AccNo: formValue,
        NOTES: tagData?.Notes || '',
        IsActive: tagData?.IsActive ?? true,
        Sort: tagData?.SortNo ?? 0
      };
    }
  }

  /**
   * 載入會計科目下拉選項 (queryGLS1005_ledgerMD_DropDownList)
   */
  private loadAccountOptions(): void {
    this.dropdownApiService.queryGls1005_ledgerMD()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (options) => {
          this.accountOptions = options || [];
        },
        error: (err) => {
          console.error('載入會計科目選項失敗:', err);
          this.accountOptions = [];
        }
      });
  }

  /**
   * 重新查詢 - 載入設定資料
   */
  onQuery(): void {
    this.loading = true;
    this.messageService.blockUi();

    // 查詢所有資料（不傳 TAG 參數）
    this.ass11080Service.queryASS11080()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          if (res?.Status === '0000' && res?.Data?.QueryData) {
            // 清空現有的 tagDataMap
            this.tagDataMap.clear();

            // 將 QueryData 陣列轉換為 Map，以 TAG 為 key
            res.Data.QueryData.forEach((item) => {
              this.tagDataMap.set(item.Tag, item);
            });

            // 將查詢資料轉換為表單值並更新表單
            const formValues = this.convertQueryDataToFormValues();
            this.dataForm.patchValue(formValues);
          } else {
            // API 回應失敗或無資料
            if (res?.Status !== '0000') {
              this.messageService.errorBubble(res?.Message || '查詢設定失敗');
            }
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err) => {
          console.error('查詢設定失敗:', err);
          this.messageService.errorBubble('查詢設定失敗');
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
  }

  /**
   * 更新設定
   */
  onUpdate(): void {
    this.handleSubmit(this.dataForm, () => {
      const formValues = this.dataForm.getRawValue() as ASS11080Data;

      // 將表單值轉換為 Items 陣列
      const items: ASS11080UpdateItem[] = ASS11080Component.TAG_FIELDS.map((field) => {
        const tagData = this.tagDataMap.get(field);
        const formValue = formValues[field] || '';
        return this.createUpdateItem(field, formValue, tagData);
      });

      // 建構更新請求
      const payload: ASS11080UpdateRequest = {
        Items: items
      };

      this.ass11080Service.updateASS11080(payload)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (res) => {
            if (res?.Status === '0000') {
              this.messageService.successBubble('更新成功');
              this.submitted = false;
              // 更新成功後重新查詢以取得最新資料（onQuery 會處理 loading 和 unblockUi）
              this.onQuery();
            } else {
              this.messageService.errorBubble(res?.Message || '更新失敗');
              this.loading = false;
              this.messageService.unblockUi();
            }
          },
          error: (err) => {
            console.error('更新設定失敗:', err);
            this.messageService.errorBubble('更新設定失敗');
            this.loading = false;
            this.messageService.unblockUi();
          }
        });
    });
  }
}
