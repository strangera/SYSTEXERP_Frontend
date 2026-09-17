import { NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DetailASS13010Response, InsertASS13010Request, UpdateASS13010Request } from '@pages/ass/ass13010/ass13010.model';
import { ASS11090Service } from '@service/api/ass/ass11090.service';
import { ASS13010Service } from '@service/api/ass/ass13010.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { getSYS1000Options } from 'src/app/service/system/sys1000.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/components/editor-text/editor-text.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

//3.1.3.1 資產維護作業 CRU
@Component({
  selector: 'app-ass13010-cru',
  templateUrl: './ass13010-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, InputTextComponent, CalendarComponent, EditorTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class ASS13010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  private validationService = inject(ValidationService);
  private dropdownApiService = inject(DropdownApiService);
  private ass13010Service = inject(ASS13010Service);
  private ass11090Service = inject(ASS11090Service);
  accordionTabCss = '';

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // ----------------------------------------------------------------
    // 資產編號：新增時由後端 SP 自動產生（disabled 不參與 validation 也不送 API），最大長度 20。
    assetsCode: [{ value: null as string | null, disabled: true } as any, [Validators.maxLength(20)]], // 資產編號
    itemCode: [, [Validators.required]], // 品項編號
    assetsStatus: [, [Validators.required]], // 資產狀態
    assetsType: [{ value: null as string | null, disabled: true }],// 資產類型
    original_assetsCode: [, [this.validationService.numberValidator, Validators.maxLength(20)]], // 原資產編號

    //---
    //採購資訊
    //---
    purchaseNumber: [, [Validators.maxLength(11)]],
    purchaseDate: [],
    purchasePrice: [, [this.validationService.numberValidator, Validators.maxLength(8)]],

    // 異動金額，SP 計算欄位，只供顯示
    changeAmount: [{ value: null, disabled: true }],

    supplierCode: [],
    accounting_Borrow: [, [Validators.required]], // 會計科目(借)
    accounting_Credit: [, [Validators.required]], // 會計科目(貸)
    entryDate: [, [Validators.required]], // 入帳日期
    deviceCode: [, [Validators.maxLength(10)]], // 設備編號
    //---
    //折舊資訊
    //---
    depreciation: [, [Validators.required]], // 折舊會計科目
    totalDepreciation: [, [Validators.required]], // 累計折舊科目
    depreciationLife: [, [Validators.required, Validators.maxLength(8)]],

    // 異動折舊年限，SP 計算欄位，只供顯示
    changeExpYear: [{ value: null, disabled: true }],

    residual: [, [Validators.required, Validators.maxLength(8)]],
    depreciationLifeMM: [, [Validators.required, Validators.maxLength(8)]],
    amortizedAmount: [, [Validators.maxLength(8)]], // 已攤提金額
    amortizedMonth: [, [Validators.maxLength(8)]], // 已攤提月數
    //---
    //保管資訊
    //---
    keepingPerson: [null as string | null, [Validators.required]], // 保管人
    keepingUnit: [null as string | null], // 保管單位
    user: [null as string | null], // 使用人
    userUnit: [null as string | null], // 使用單位
    locationCode: [], // 位置編號
    maintenanceCode: [, [Validators.maxLength(11)]], // 維修合約編號
    //---
    //處分資訊
    //---
    disposalDate: [], // 處份日期(變賣或報廢)
    dispose_Manufacturers: [], // 處份廠商
    dispose_Manufacturers_Summons: [, [Validators.maxLength(12)]], // 處份傳票編號
    soldAmount: [, [Validators.maxLength(8)]], // 變賣金額
    warrantyDays: [, [Validators.maxLength(8)]], // 保固年限(日)
    amortizationYearMonth: [], // 攤提年月（dateMonthOne，表單值為 Date；送 API 由 interceptor 序列化）
    //---
    //其他
    //---
    disposeRemark: [,], // 處分說明(變賣或報廢)
    remark: [,],        // 採購說明
    assetNotes: [,],    // 資產註記說明 NOTES
  });
  // ----------------------------------------------------------------
  // 下拉選單（來源同 ass13010，見註解）
  itemCodeOptions: Option[] = []; // queryASS11040_DropDownList
  assetsStatusOptions: Option[] = []; // querySYS1000_DropDownList SYS_Type='ASSET_STATUS'（Edit 模式下依 applyAssetsStatusEditRule 動態替換為 assetsStatusEditableOptions）
  /** Edit 模式下資產狀態僅允許在「使用中」「庫存中未使用」之間切換，其餘狀態鎖定不可編輯 */
  assetsStatusEditableOptions: Option[] = [
    { value: '1', label: '使用中' },
    { value: '7', label: '庫存中未使用' },
  ];
  /** querySYS1000 完整清單快取，供資產狀態鎖定時仍能正確顯示原狀態名稱 */
  private assetsStatusFullOptions: Option[] = [];
  /** 目前資產狀態是否落於可編輯範圍（1:使用中 / 7:庫存中未使用），控制 assetsStatusOptions 要用完整清單還是限縮清單 */
  private isAssetsStatusEditableMode = false;
  assetsTypeOptions = getSYS1000Options('ASSET_TYPE');
  purchaseNumberOptions: Option[] = []; // queryASS13010DropDownList
  supplierCodeOptions: Option[] = []; // queryPOS2013_DropDownList
  depreciationOptions: Option[] = []; // queryGLS1005_ledgerMD_DropDownList
  /** 所有人員（含 Org_ID），供依單位篩選 */
  allUserOptionsWithOrg: Option[] = [];
  /** 保管人下拉：依 保管單位 篩選該單位人員 */
  keepingPersonOptions: Option[] = [];
  /** 使用人下拉：依 使用單位 篩選該單位人員 */
  userOptions: Option[] = [];
  /** 編輯模式下先暫存人員欄位，待下拉資料就緒後再回填 */
  private pendingEmployeeSelection: { keepingPerson: string | null; user: string | null } | null = null;
  orgUnitOptions: Option[] = []; // querySYS3100_DropDownList
  locationCodeOptions: Option[] = []; // queryPOS2002_DropDownList

  /**
   * 「取消」還原用快照。ButtonComponent 的 cancel 會在 mount 後 1s 截表單初值；
   * 編輯頁明細由 API 較晚帶入，初值會錯，導致 reset 變成清空。改由明細就緒後自行保存。
   */
  private formBaseline: Record<string, unknown> | null = null;

  /** 明細載入時的原始資產狀態，供「取消」還原後重新判斷欄位是否鎖定用 */
  private originalAssetsStatus: string | null = null;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13010', this.dataForm);
    this.accordionTabCss = this.crudstatus === CRUDStatus.Create ? 'create-accordionTab' : 'edit-accordionTab';
    this.loadDropdownOptions();
    // 監聽「品項編號 (itemCode)」選取事件，自動帶入「資產類型 (assetsType)」及會計科目/折舊設定
    // 僅新增模式會觸發：編輯模式下 itemCode 欄位鎖定不可改，明細載入 patchValue 也用 emitEvent:false 不會觸發此處。
    this.dataForm.controls.itemCode.valueChanges.pipe(untilDestroyed(this)).subscribe(selectedGoodsId => {
      if (!selectedGoodsId || this.crudstatus !== CRUDStatus.Create) return;

      // 從下拉選單陣列中尋找對應的 Option
      const selectedOption = this.itemCodeOptions.find(opt => opt.value === selectedGoodsId);
      if (selectedOption) {
        // 後端展平後會存放在 MATERIAL_TYPE 屬性中
        const materialType = selectedOption['MaterialType'] ?? '';

        if (materialType) {
          this.dataForm.patchValue({
            assetsType: String(materialType)
          });
        }
      }

      this.autoFillAccountingByItem(selectedOption);
    });
    this.dataForm.controls.keepingUnit.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.updateKeepingPersonOptions();
      if (!this.allUserOptionsWithOrg.length) {
        return;
      }
      const unitVal = this.dataForm.controls.keepingUnit.value;
      const personVal = this.dataForm.controls.keepingPerson.value;
      if (unitVal == null || unitVal === '' || personVal == null || personVal === '') {
        return;
      }
      const allowed = this.keepingPersonOptions.some(o => this.isSameOptionValue(o.value, personVal));
      if (!allowed) {
        this.dataForm.patchValue(
          { keepingPerson: null },
          { emitEvent: false }
        );
        this.dataForm.controls.keepingPerson.markAsPristine({ onlySelf: true });
      }
    });
    this.dataForm.controls.userUnit.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.updateUserOptions();
      if (!this.allUserOptionsWithOrg.length) {
        return;
      }
      const unitVal = this.dataForm.controls.userUnit.value;
      const userVal = this.dataForm.controls.user.value;
      if (unitVal == null || unitVal === '' || userVal == null || userVal === '') {
        return;
      }
      const allowed = this.userOptions.some(o => this.isSameOptionValue(o.value, userVal));
      if (!allowed) {
        this.dataForm.patchValue(
          { user: null },
          { emitEvent: false }
        );
        this.dataForm.controls.user.markAsPristine({ onlySelf: true });
      }
    });

    if (this.crudstatus === CRUDStatus.Create) {
      queueMicrotask(() => this.captureFormBaseline());
    }

    if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read) {
      const id = this.rowdata?.ID != null ? String(this.rowdata.ID) : '';
      if (id) {
        this.loading = true;
        this.ass13010Service
          .detailASS13010({ ID: id })
          .pipe(
            untilDestroyed(this),
            finalize(() => {
              this.loading = false;
            }),
          )
          .subscribe({
            next: res => {
              const rawData: any = res?.Data;
              const data: DetailASS13010Response | null | undefined = Array.isArray(rawData)
                ? (rawData[0] as DetailASS13010Response | undefined)
                : (rawData as DetailASS13010Response | null | undefined);

              if (!data) {
                return;
              }

              const soldAmount =
                data.ONSALE_AMT != null
                  ? data.ONSALE_AMT
                  : data.ONSALE_NORATE_AMT != null
                    ? data.ONSALE_NORATE_AMT
                    : null;

              const patch: any = {
                assetsCode: data.ASSET_ID ?? null,
                itemCode: data.GOODS_ID ?? null,
                assetsStatus: data.ASSET_STATUS ?? null,
                assetsType: data.DEPRE_YN ?? null,
                original_assetsCode: data.ORI_ASSET_ID ?? null,
                purchaseNumber: data.SUBPOENA_ID ?? null,
                purchaseDate: data.GET_DATE ?? null,
                purchasePrice: data.GET_COST ?? null,

                // 異動金額
                changeAmount: data.CHANGE_AMT ?? null,

                supplierCode: data.SUPPLIER_ID ?? null,
                accounting_Borrow: data.STYPE_D ?? null,
                accounting_Credit: data.STYPE_C ?? null,
                entryDate: data.BILL_DATE ?? null,
                deviceCode: data.EQUIP_ID ?? null,
                depreciation: data.STYPE_ID ?? null,
                totalDepreciation: data.STYPE_ID2 ?? null,
                depreciationLife: data.EXP_YEAR ?? null,

                // 異動折舊年限(年)
                changeExpYear: data.CHANGE_EXP_YEAR ?? null,

                residual: data.RESI_VALUE ?? null,

                // SP 已經 FIR_EXP_YEAR * 12，所以前端不用再乘 12
                depreciationLifeMM: data.FIR_EXP_YEAR ?? null,
                amortizedAmount: data.TAL_DEPRE_AMT ?? null,
                amortizedMonth: data.TAL_DEPRE_MON ?? null,
                keepingUnit: data.HOLD_ORG_ID ?? null,
                userUnit: data.USE_ORG_ID ?? null,
                locationCode: data.LOCATION_ID ?? null,
                maintenanceCode: data.FIX_N ?? null,
                disposalDate: data.HANDLE_DATE ?? null,
                dispose_Manufacturers: data.HANDLE_VENDOR ?? null,
                dispose_Manufacturers_Summons: data.HANDLE_VID ?? null,
                soldAmount,
                warrantyDays: data.Warranty_YEAR ?? null,
                disposeRemark: data.HANDLE_NOTE ?? null,

                // 採購說明
                remark: data.PURCHASE_NOTES ?? null,

                // 資產註記說明
                assetNotes: data.NOTES ?? null,

                amortizationYearMonth: data.DEPRE_SDATE
                  ? new Date(data.DEPRE_SDATE)
                  : null,
              };

              // detail 初始化帶值時不觸發 valueChanges，避免保管人/使用人被清空
              this.dataForm.patchValue(patch, { emitEvent: false });
              this.pendingEmployeeSelection = {
                keepingPerson: data.HOLD_EMP_ID ?? null,
                user: data.USE_EMP_ID ?? null,
              };
              this.applyPendingEmployeeSelection();

              // Edit 模式：依是否已攤提動態鎖欄
              const isAlreadyAmortized = (data.TAL_DEPRE_AMT ?? 0) > 0;
              if (this.crudstatus === CRUDStatus.Edit) {
                this.applyEditLock(isAlreadyAmortized);
                this.originalAssetsStatus = data.ASSET_STATUS ?? null;
                this.applyAssetsStatusEditRule(this.originalAssetsStatus);
              }

              if (this.crudstatus === CRUDStatus.Read) {
                this.dataForm.disable();
              }

              this.captureFormBaseline();
            },
            error: () => {
              // 交給共用的 error interceptor / notification 處理，這裡不另外彈錯
            },
          });
      }
    }
  }

  private captureFormBaseline(): void {
    try {
      this.formBaseline = structuredClone(this.dataForm.getRawValue()) as Record<string, unknown>;
    } catch {
      this.formBaseline = { ...(this.dataForm.getRawValue() as Record<string, unknown>) };
    }
  }

  /** 取消鈕：還原至進入頁／明細載入後的狀態（同 ass11010 的「復原」語意，非清空） */
  onCancelFormReset(): void {
    if (this.formBaseline == null) {
      return;
    }
    this.dataForm.reset(this.formBaseline);
    this.submitted = false;
    this.updateKeepingPersonOptions();
    this.updateUserOptions();
    if (this.crudstatus === CRUDStatus.Edit) {
      const raw = this.dataForm.getRawValue() as Record<string, unknown>;
      const isAlreadyAmortized = Number(raw['amortizedAmount'] ?? 0) > 0;
      this.applyEditLock(isAlreadyAmortized);
      this.applyAssetsStatusEditRule(this.originalAssetsStatus);
    }
  }

  /**
   * 比對下拉選項值與表單值是否代表同一人員。統一轉字串並 trim 再比對，
   * 避免資料庫欄位（如 CHAR 定長型別）前後空白或型別差異，導致明明屬於該單位的人員被誤判為不存在而清空。
   */
  private isSameOptionValue(optionValue: unknown, formValue: unknown): boolean {
    return String(optionValue ?? '').trim() === String(formValue ?? '').trim();
  }

  private updateKeepingPersonOptions(): void {
    const unitVal = String(
      this.dataForm.controls.keepingUnit.value ?? ''
    ).trim();

    if (!unitVal) {
      this.keepingPersonOptions = [
        ...this.allUserOptionsWithOrg
      ];
      return;
    }

    this.keepingPersonOptions =
      this.allUserOptionsWithOrg.filter(option => {
        const orgId = String(
          (option as Option & { Org_ID?: string }).Org_ID ?? ''
        ).trim();

        return orgId === unitVal;
      });
  }

  private updateUserOptions(): void {
    const unitVal = String(
      this.dataForm.controls.userUnit.value ?? ''
    ).trim();
    if (!unitVal) {
      this.userOptions = [...this.allUserOptionsWithOrg];
    } else {
      this.userOptions = this.allUserOptionsWithOrg.filter(o => {
        const orgId = String(
          (o as Option & { Org_ID?: string }).Org_ID ?? ''
        ).trim();

        return orgId === unitVal;
      });
    }
  }

  private applyPendingEmployeeSelection(): void {
    if (
      !this.pendingEmployeeSelection ||
      !this.allUserOptionsWithOrg.length
    ) {
      return;
    }

    const { keepingPerson, user } =
      this.pendingEmployeeSelection;

    // 先依單位建立正常 options
    this.updateKeepingPersonOptions();
    this.updateUserOptions();

    // ==============================
    // 保管人
    // ==============================
    if (keepingPerson) {
      const targetValue =
        String(keepingPerson).trim();

      let exists =
        this.keepingPersonOptions.some(option =>
          String(option.value ?? '').trim() === targetValue
        );

      // 如果因為歷史單位等原因被過濾掉，
      // 從完整人員清單補回
      if (!exists) {
        const employee =
          this.allUserOptionsWithOrg.find(option =>
            String(option.value ?? '').trim() === targetValue
          );

        if (employee) {
          this.keepingPersonOptions = [
            ...this.keepingPersonOptions,
            employee,
          ];

          exists = true;
        }
      }

      console.log(
        'HOLD_EMP_ID:',
        keepingPerson,
        '保管人是否存在 options:',
        exists
      );
    }

    // ==============================
    // 使用人
    // ==============================
    if (user) {
      const targetValue =
        String(user).trim();

      const exists =
        this.userOptions.some(option =>
          String(option.value ?? '').trim() === targetValue
        );

      if (!exists) {
        const employee =
          this.allUserOptionsWithOrg.find(option =>
            String(option.value ?? '').trim() === targetValue
          );

        if (employee) {
          this.userOptions = [
            ...this.userOptions,
            employee,
          ];
        }
      }
    }

    // 最後才 patch 人員 ID
    this.dataForm.patchValue(
      {
        keepingPerson:
          keepingPerson != null
            ? String(keepingPerson).trim()
            : null,

        user:
          user != null
            ? String(user).trim()
            : null,
      },
      {
        emitEvent: false,
      }
    );

    this.pendingEmployeeSelection = null;
  }

  /**
   * 新增模式下，依品項所屬中分類(B_CLASS_ID+M_CLASS_ID)向 ASS11090 查詢對應的會計科目/折舊設定並自動帶入。
   * 查無設定（Data 為 null）時將對應欄位清空，不報錯、不阻擋操作；每次切換品項都重新查詢並覆蓋，帶入後使用者仍可手動修改。
   */
  private autoFillAccountingByItem(selectedOption: Option | undefined): void {
    const bClassId = selectedOption?.['B_CLASS_ID'] ? String(selectedOption['B_CLASS_ID']) : '';
    const mClassId = selectedOption?.['M_CLASS_ID'] ? String(selectedOption['M_CLASS_ID']) : '';

    if (!bClassId || !mClassId) {
      const clearPatch: any = {
        accounting_Borrow: null,
        accounting_Credit: null,
        depreciation: null,
        totalDepreciation: null,
        depreciationLife: null,
      };
      this.dataForm.patchValue(clearPatch);
      return;
    }

    this.ass11090Service
      .queryASS11090Detail({ B_CLASS_ID: bClassId, M_CLASS_ID: mClassId })
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const data = res?.Data;
        const fillPatch: any = {
          accounting_Borrow: data?.STYPE_ACCNO ?? null,
          accounting_Credit: data?.STYPE_ACCNO2 ?? null,
          depreciation: data?.DEPRE_STYPE_ACCNO ?? null,
          totalDepreciation: data?.DEPRE_STYPE_ACCNO2 ?? null,
          depreciationLife: data?.EXP_YEAR ?? null,
        };
        this.dataForm.patchValue(fillPatch);
      });
  }

  private loadDropdownOptions(): void {
    this.dropdownApiService.queryASS11040_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.itemCodeOptions = res ?? [];
    });
    this.dropdownApiService.queryASS13010DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.purchaseNumberOptions = res ?? [];
    });
    this.dropdownApiService.querySys1000({ SYS_Type: 'ASSET_STATUS' }).pipe(untilDestroyed(this)).subscribe(res => {
      this.assetsStatusFullOptions = (res ?? []).map(item => ({ value: item.No, label: item.Name }));
      if (!this.isAssetsStatusEditableMode) {
        this.assetsStatusOptions = this.assetsStatusFullOptions;
      }
    });
    this.dropdownApiService.queryPos2013({ VEN_Flag: '' }).pipe(untilDestroyed(this)).subscribe(res => {
      this.supplierCodeOptions = res ?? [];
    });
    this.dropdownApiService.queryGls1005_ledgerMD().pipe(untilDestroyed(this)).subscribe(res => {
      this.depreciationOptions = res ?? [];
    });
    this.dropdownApiService.queryTblUserOrgid().pipe(untilDestroyed(this)).subscribe(res => {
      this.allUserOptionsWithOrg = res ?? [];
      this.updateKeepingPersonOptions();
      this.updateUserOptions();
      this.applyPendingEmployeeSelection();
    });
    this.dropdownApiService.querySys3100().pipe(untilDestroyed(this)).subscribe(res => {
      this.orgUnitOptions = res ?? [];
    });
    this.dropdownApiService.queryPos2002().pipe(untilDestroyed(this)).subscribe(res => {
      this.locationCodeOptions = res ?? [];
    });
  }

  Edit(rowdata: any): void {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any): void {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  /** 將表單日期欄位轉成 API 接受的 date-time 字串 */
  private toDateString(value: Date | string | null | undefined): string | null {
    if (value == null) return null;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    return null;
  }

  /** 攤提年月：傳 Date 或既有字串，由 dateToISOStringInterceptor 轉成與其他日期相同之時間格式（不另做 YYYYMM 等轉換） */
  private depreciationDateForApi(value: unknown): Date | string | null {
    if (value == null || value === '') return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string') return value;
    return null;
  }

  private buildInsertPayload(raw: Record<string, unknown>): InsertASS13010Request {
    // 表單欄位名稱 => API request 欄位（InsertASS13010Request）
    return {
      // 新增時資產代號由後端 SP 自動產生，前端不送（送 null）。
      ASSET_ID: null,
      GOODS_ID: raw['itemCode'] != null && raw['itemCode'] !== '' ? String(raw['itemCode']) : null,
      ASSET_STATUS: raw['assetsStatus'] != null && raw['assetsStatus'] !== '' ? String(raw['assetsStatus']) : null,
      DEPRE_YN: raw['assetsType'] != null && raw['assetsType'] !== '' ? String(raw['assetsType']) : null,
      ORI_ASSET_ID:
        raw['original_assetsCode'] != null && raw['original_assetsCode'] !== ''
          ? String(raw['original_assetsCode'])
          : null,
      SUBPOENA_ID:
        raw['purchaseNumber'] != null && raw['purchaseNumber'] !== '' ? String(raw['purchaseNumber']) : null,
      GET_DATE: this.toDateString(raw['purchaseDate'] as Date | string | null),
      GET_COST: raw['purchasePrice'] != null && raw['purchasePrice'] !== '' ? Number(raw['purchasePrice']) : null,
      SUPPLIER_ID: raw['supplierCode'] != null && raw['supplierCode'] !== '' ? String(raw['supplierCode']) : null,
      STYPE_D: raw['accounting_Borrow'] != null && raw['accounting_Borrow'] !== '' ? String(raw['accounting_Borrow']) : null,
      STYPE_C: raw['accounting_Credit'] != null && raw['accounting_Credit'] !== '' ? String(raw['accounting_Credit']) : null,
      BILL_DATE: this.toDateString(raw['entryDate'] as Date | string | null),
      EQUIP_ID: raw['deviceCode'] != null && raw['deviceCode'] !== '' ? String(raw['deviceCode']) : null,
      STYPE_ID: raw['depreciation'] != null && raw['depreciation'] !== '' ? String(raw['depreciation']) : null,
      STYPE_ID2:
        raw['totalDepreciation'] != null && raw['totalDepreciation'] !== '' ? String(raw['totalDepreciation']) : null,
      EXP_YEAR: raw['depreciationLife'] != null && raw['depreciationLife'] !== '' ? Number(raw['depreciationLife']) : null,
      RESI_VALUE: raw['residual'] != null && raw['residual'] !== '' ? Number(raw['residual']) : null,
      FIR_EXP_YEAR:
        raw['depreciationLifeMM'] != null && raw['depreciationLifeMM'] !== '' ? Number(raw['depreciationLifeMM']) : null,
      TAL_DEPRE_MON:
        raw['amortizedMonth'] != null && raw['amortizedMonth'] !== '' ? Number(raw['amortizedMonth']) : null,
      TAL_DEPRE_AMT:
        raw['amortizedAmount'] != null && raw['amortizedAmount'] !== '' ? Number(raw['amortizedAmount']) : null,
      HOLD_EMP_ID: raw['keepingPerson'] != null && raw['keepingPerson'] !== '' ? String(raw['keepingPerson']) : null,
      HOLD_ORG_ID: raw['keepingUnit'] != null && raw['keepingUnit'] !== '' ? String(raw['keepingUnit']) : null,
      USE_EMP_ID: raw['user'] != null && raw['user'] !== '' ? String(raw['user']) : null,
      USE_ORG_ID: raw['userUnit'] != null && raw['userUnit'] !== '' ? String(raw['userUnit']) : null,
      LOCATION_ID: raw['locationCode'] != null && raw['locationCode'] !== '' ? String(raw['locationCode']) : null,
      FIX_N: raw['maintenanceCode'] != null && raw['maintenanceCode'] !== '' ? String(raw['maintenanceCode']) : null,
      HANDLE_DATE: this.toDateString(raw['disposalDate'] as Date | string | null),
      HANDLE_VENDOR:
        raw['dispose_Manufacturers'] != null && raw['dispose_Manufacturers'] !== ''
          ? String(raw['dispose_Manufacturers'])
          : null,
      HANDLE_VID:
        raw['dispose_Manufacturers_Summons'] != null && raw['dispose_Manufacturers_Summons'] !== ''
          ? String(raw['dispose_Manufacturers_Summons'])
          : null,
      ONSALE_AMT: raw['soldAmount'] != null && raw['soldAmount'] !== '' ? Number(raw['soldAmount']) : null,
      Warranty_YEAR: raw['warrantyDays'] != null && raw['warrantyDays'] !== '' ? Number(raw['warrantyDays']) : null,
      DEPRE_SDATE: this.depreciationDateForApi(raw['amortizationYearMonth']),
      HANDLE_NOTE: raw['disposeRemark'] != null && raw['disposeRemark'] !== '' ? String(raw['disposeRemark']) : null,

      // 畫面 `remark` 僅對應採購說明
      PURCHASE_NOTES: raw['remark'] != null && raw['remark'] !== '' ? String(raw['remark']) : null,
      CRT_USR_No: this.user?.user_No ?? null,
      CRT_USR_Name: this.user?.user_Name ?? null,
    };
  }

  /**
   * 財務類欄位：尚未攤提時可自由編輯，已攤提後鎖定不可修改（避免帳務資料與已入帳分錄脫勾）。
   * 對應驗收條件列出的：金額、入帳日期、折舊年限(年/月)、殘值、會計科目(借/貸)、折舊科目(借)、累計折舊科目(貸)、供應商、原資產編號。
   * 另外加入 purchaseDate（購入日期）：語意上屬同一組財務資訊，且既有鎖定方向本來就正確，一併沿用。
   */
  private readonly financialEditLockFields: readonly string[] = [
    'purchasePrice',
    'purchaseDate',
    'entryDate',
    'depreciationLife',
    'depreciationLifeMM',
    'residual',
    'accounting_Borrow',
    'accounting_Credit',
    'depreciation',
    'totalDepreciation',
    'supplierCode',
    'original_assetsCode',
  ];

  /** 非財務類欄位：不論是否已攤提皆可編輯，對應驗收條件列出的 8 個欄位。 */
  private readonly nonFinancialEditFields: readonly string[] = [
    'assetsStatus',
    'keepingPerson',
    'keepingUnit',
    'user',
    'userUnit',
    'deviceCode',
    'maintenanceCode',
    'remark',
  ];

  private applyEditLock(isAlreadyAmortized: boolean): void {
    // ⚠️ 後端限制：dbo.SP_ASS13010Update 目前只接受 GET_DATE/GET_COST/ASSET_STATUS/EQUIP_ID/NOTES/
    // PURCHASE_NOTES/RESI_VALUE/EXP_YEAR/EXP_MONTH/HOLD_EMP_ID/USE_EMP_ID/DEPRE_SDATE/TAL_DEPRE_AMT/TAL_DEPRE_MON
    // 這些參數（已用 sqlcmd 查過 OBJECT_DEFINITION 確認，唯讀查詢未動 SP）。本函式解鎖的 entryDate/
    // accounting_Borrow/accounting_Credit/depreciation/totalDepreciation/supplierCode/original_assetsCode/
    // keepingUnit/userUnit/maintenanceCode 這 10 個欄位，SP 完全沒有對應參數可接收，UpdateASS13010Request
    // 也還沒加這些欄位，使用者在編輯畫面改了值、送出仍不會被儲存（非本次改動範圍，需要另外 ALTER PROCEDURE
    // 才能真正持久化，已回報請使用者決定是否要開這個後續工單）。
    // 另外 SP 在「已攤提」分支裡完全不更新 HOLD_EMP_ID/USE_EMP_ID，即使本函式讓保管人/使用人在已攤提時仍可編輯，
    // 送出後 SP 也不會套用該次修改，同樣需要改 SP 才能徹底符合「已攤提仍可改保管人/使用人並送出成功」的驗收條件。
    // 由於 ReactiveForms 的 disabled 欄位不參與 validation，因此鎖欄能避免 required 驗證誤擋送出。
    // 注意：amortizationYearMonth（攤提年月）沿用既有規則（僅已攤提時可編輯），本次未列入財務/非財務兩組，非本次調整範圍。
    const allowedControls = new Set<string>([
      ...this.nonFinancialEditFields,
      ...(isAlreadyAmortized ? [] : this.financialEditLockFields),
      ...(isAlreadyAmortized ? ['amortizationYearMonth'] : []),
    ]);

    // `Object.keys()` 會回傳 `string[]`，但 `controls` 是強型別結構；
    // 這裡把 key 型別收斂回 `keyof controls` 以避免 TS7053。
    for (const key of Object.keys(this.dataForm.controls) as (keyof typeof this.dataForm.controls)[]) {
      const ctrl = this.dataForm.controls[key];
      if (allowedControls.has(key as string)) {
        ctrl.enable({ emitEvent: false });
      } else {
        ctrl.disable({ emitEvent: false });
      }
    }
  }

  /** Edit 模式下：資產狀態僅「使用中(1)」「庫存中未使用(7)」可編輯，其餘狀態鎖定不可改 */
  private applyAssetsStatusEditRule(currentStatus: string | null): void {
    this.isAssetsStatusEditableMode = currentStatus === '1' || currentStatus === '7';
    if (this.isAssetsStatusEditableMode) {
      this.assetsStatusOptions = this.assetsStatusEditableOptions;
      this.dataForm.controls.assetsStatus.enable({ emitEvent: false });
    } else {
      this.assetsStatusOptions = this.assetsStatusFullOptions;
      this.dataForm.controls.assetsStatus.disable({ emitEvent: false });
    }
  }

  private buildUpdatePayload(raw: Record<string, unknown>): UpdateASS13010Request {
    return {
      ID: (this.rowdata as any)?.ID as number,
      GET_DATE: this.toDateString(raw['purchaseDate'] as Date | string | null),
      GET_COST: raw['purchasePrice'] != null && raw['purchasePrice'] !== '' ? Number(raw['purchasePrice']) : null,
      ASSET_STATUS: raw['assetsStatus'] != null && raw['assetsStatus'] !== '' ? String(raw['assetsStatus']) : null,
      EQUIP_ID: raw['deviceCode'] != null && raw['deviceCode'] !== '' ? String(raw['deviceCode']) : null,

      PURCHASE_NOTES: raw['remark'] != null && raw['remark'] !== '' ? String(raw['remark']) : null,
      // API：RESI_VALUE = 預留殘值（residual）
      RESI_VALUE: raw['residual'] != null && raw['residual'] !== '' ? Number(raw['residual']) : null,
      EXP_YEAR: raw['depreciationLife'] != null && raw['depreciationLife'] !== '' ? Number(raw['depreciationLife']) : null,
      EXP_MONTH:
        raw['depreciationLifeMM'] != null && raw['depreciationLifeMM'] !== '' ? Number(raw['depreciationLifeMM']) : null,
      HOLD_EMP_ID: raw['keepingPerson'] != null && raw['keepingPerson'] !== '' ? String(raw['keepingPerson']) : null,
      USE_EMP_ID: raw['user'] != null && raw['user'] !== '' ? String(raw['user']) : null,
      DEPRE_SDATE: this.depreciationDateForApi(raw['amortizationYearMonth']),
      TAL_DEPRE_AMT:
        raw['amortizedAmount'] != null && raw['amortizedAmount'] !== '' ? Number(raw['amortizedAmount']) : null,
      TAL_DEPRE_MON:
        raw['amortizedMonth'] != null && raw['amortizedMonth'] !== '' ? Number(raw['amortizedMonth']) : null,
      UPD_USR_No: this.user?.user_No ?? null,
      UPD_USR_Name: this.user?.user_Name ?? null,
    };
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            const raw = frm.getRawValue() as Record<string, unknown>;
            // 表單無欄位不送出：MID, STO_NO, NOTES, FORG_ID, HANDLE_VKEY, DEPRE_ID, GET_COST_TAX, USE_STATUS, DEPRE_AMT, ORI_ORG_ID, ORI_EMP_ID, ASSET_INS_ID, FIX_AMT, SOURCE_STATUS, SUBCHECK_ID, FIR_GET_COST, LEND_TYPE, REDU_CODE, ONSALE_RATE, ONSALE_NORATE_AMT, EXTEND_EXP_YEAR, DAMAGEM_ID。remark→PURCHASE_NOTES；depreciationLifeMM→FIR_EXP_YEAR；amortizedAmount→TAL_DEPRE_AMT、amortizedMonth→TAL_DEPRE_MON。
            const payload: InsertASS13010Request = this.buildInsertPayload(raw);
            this.ass13010Service
              .insertASS13010(payload)
              .pipe(
                finalize(() => {
                  this.loading = false;
                }),
                untilDestroyed(this),
              )
              .subscribe(res => {
                if (res.Status !== '0000') {
                  this.messageService.errorBubble(res.Message ?? res.Error?.Message ?? '新增失敗');
                  return;
                }
                this.messageService.successBubble(res.Message ?? '新增成功');
                this.onCancel();
              });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            const raw = frm.getRawValue() as Record<string, unknown>;
            // 表單→API 對應見計畫；表單無欄位不送出同 Create 分支。
            const payload: UpdateASS13010Request = this.buildUpdatePayload(raw);
            this.ass13010Service
              .updateASS13010(payload)
              .pipe(
                finalize(() => {
                  this.loading = false;
                }),
                untilDestroyed(this),
              )
              .subscribe({
                next: res => {
                  if (res.Status !== '0000') {
                    this.messageService.errorBubble(res.Message ?? res.Error?.Message ?? '更新失敗');
                    return;
                  }
                  this.messageService.successBubble(res.Message ?? '更新成功');
                  this.onCancel();
                },
                error: err => {
                  // this.messageService.errorBubble(err?.message ?? '更新失敗');
                },
              });
          }
          break;
      }
    });
  }

  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }
}
