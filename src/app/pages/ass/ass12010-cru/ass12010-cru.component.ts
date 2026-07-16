import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11040Service } from '@service/api/ass/ass11040.service';
import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { ASS12010Service } from '@service/api/ass/ass12010.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { NGXLogger } from 'ngx-logger';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { RippleModule } from 'primeng/ripple';
import { finalize } from 'rxjs';
import { ASS12010Data, ASS12010DetailItem, ASS12010DetailResponse, ASS12010InsertRequest, ASS12010Item, ASS12010UpdateRequest } from '../ass12010/ass12010.model';

// 請購申請作業 CRU
@Component({
  selector: 'app-ass12010-cru',
  templateUrl: './ass12010-cru.component.html',
  standalone: true,
  imports: [
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    ButtonModule,
    RippleModule,
    DropdownComponent,
    InputTextComponent,
    CalendarComponent,
    MenubarComponent,
    TableEditComponent,
  ]
})
export class ASS12010CRUComponent extends BasicCruPageComponent<ASS12010Data> implements OnInit {

  public readonly dataForm = this.formBuilder.nonNullable.group({
    /** 部門代號 */
    ORG_ID: new FormControl<string | null>(null, [Validators.required]),
    /** 申請人代號 */
    EMP_ID: new FormControl<string | null>(null, [Validators.required]),
    /** 需求日期 */
    APPLY_DATE: new FormControl<Date | null>(null, [Validators.required]),
    /** 需求期限(天) */
    NEED_NUM: new FormControl<string | null>(null),
    /** 倉別 */
    WH_ID: new FormControl<string | null>(null, [Validators.required]),
    /** 說明 */
    REMARK: new FormControl<string | null>(null),
  });
  public readonly df = computed(() => this.dataForm.controls);

  public readonly tableLoading = signal<boolean>(false);

  // 表格資料
  public readonly tableData = signal<ASS12010Item[]>([]);
  public selectedItems: ASS12010Item[] = [];

  /** 部門代號選項 */
  public readonly orgIdOptions = signal<{ label: string; value: string; Name?: string }[]>([]);
  /** 申請人代號選項 */
  public readonly empIdOptions = signal<{ label: string; value: string; Name?: string }[]>([]);
  /** 倉別選項 */
  public readonly whIdOptions = signal<{ label: string; value: string }[]>([]);
  /** 品項代碼選項（unit 用於選擇後自動帶入單位） */
  public readonly goodsIdOptions = signal<{ label: string; value: string; unit?: string }[]>([]);
  /** 保管單位選項 */
  public readonly custodyUnitOptions = signal<{ label: string; value: string }[]>([]);
  /** 保管人選項 */
  public readonly custodianOptions = signal<{ label: string; value: string; Name?: string }[]>([]);

  // 所有申請人選項（用於過濾）
  private allEmpIdOptions: { label: string; value: string; Name?: string; ORG_ID?: string }[] = [];
  // 所有保管人選項（用於過濾）
  private allCustodianOptions: { label: string; value: string; Name?: string; ORG_ID?: string }[] = [];

  // EditColumn 配置
  public readonly editColumns: EditColumn[] = [
    {
      field: 'GOODS_ID',
      header: '品項代碼',
      type: 'dropdown',
      options: () => this.goodsIdOptions(),
      optionLabel: 'label',
      optionValue: 'value',
      showClear: true,
      calculate: (_rowData, value: string) => ({
        UNIT: value ? (this.goodsIdOptions().find(o => o.value === value)?.unit ?? '') : '',
      }),
    },
    {
      field: 'CUSTODY_UNIT',
      header: '保管單位',
      type: 'dropdown',
      options: () => this.custodyUnitOptions(),
      optionLabel: 'label',
      optionValue: 'value',
      showClear: true,
    },
    {
      field: 'CUSTODIAN',
      header: '保管人',
      type: 'dropdown',
      options: () => this.custodianOptions(),
      optionLabel: 'label',
      optionValue: 'value',
      showClear: true,
    },
    {
      field: 'UNIT',
      header: '單位',
      type: 'input',
      maxLength: 8,
      disabled: () => true,
    },
    {
      field: 'QUANTITY',
      header: '數量',
      type: 'inputNumber',
      min: 0,
      maxFractionDigits: 0,
    },
    {
      field: 'ITEM_REMARK',
      header: '單項說明',
      type: 'input',
      placeholder: '單項說明',
    },
  ];

  constructor(
    public readonly service: ASS12010Service,
    private readonly ass11100Service: ASS11100Service,
    private readonly ass11040Service: ASS11040Service,
    private readonly dropDownListService: DropDownListService,
    private readonly logger: NGXLogger,
    private readonly notification: NotificationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS12010', this.dataForm);
    this.logger.debug(`ASS12010 CRU init:`, [this.user, this.rowdata]);

    this.loadDropdownOptions();
    this.setupDepartmentCascade();

    // 從 router state 的 rowdata 取得 NEED_ID（非新增模式時）
    if (!this.isFormCreateable && this.rowdata) {
      const needId = (this.rowdata as ASS12010Data)?.NEED_ID;
      if (needId) {
        this.loadDetail(needId);
      }
    }
  }

  /**
   * 載入詳細資料
   */
  private loadDetail(needId: string): void {
    this.messageService.blockUi();
    this.loading = true;
    this.tableLoading.set(true);

    this.service.detailASS12010({ NEED_ID: needId })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<ASS12010DetailResponse>) => {
          if (res.Status !== '0000') {
            this.notification.errorBubble(res.Message || '載入詳細資料失敗');
            return;
          }

          const detailData = res.Data;
          if (!detailData || !detailData.Header) {
            this.logger.warn('ASS12010 loadDetail: Invalid response data', [res]);
            return;
          }

          const header = detailData.Header;
          const details = detailData.Details || [];

          // 填入表單資料
          this.dataForm.patchValue({
            ORG_ID: header.ORG_ID || null,
            EMP_ID: header.EMP_ID || null,
            APPLY_DATE: header.APPLY_DATE ? new Date(header.APPLY_DATE) : null,
            NEED_NUM: header.NEED_NUM || null,
            WH_ID: header.WH_ID || null,
            REMARK: header.NOTE || null, // API 回傳的是 NOTE，表單欄位是 REMARK
          }, { emitEvent: false });

          // 轉換並填入表格資料
          // 注意：API 回傳的 Details 結構與 ASS12010Item 不同，需要轉換
          const tableItems: ASS12010Item[] = details.map((detail: ASS12010DetailItem) => ({
            GOODS_ID: detail.GOODS_ID,
            CUSTODY_UNIT: detail.HOLD_ORG_ID, // 保管部門對應到 CUSTODY_UNIT
            CUSTODIAN: detail.HOLD_EMP_ID, // 保管人員對應到 CUSTODIAN
            UNIT: detail.GOODS_ID ? this.goodsIdOptions().find(o => o.value === detail.GOODS_ID)?.unit : undefined,
            QUANTITY: detail.QTY,
            ITEM_REMARK: detail.NOTES, // API 的 NOTES 對應到 ITEM_REMARK
          }));

          this.tableData.set(tableItems);

          this.logger.debug('ASS12010 detail loaded:', [header, details]);
        },
        error: (err) => {
          this.logger.error('ASS12010 loadDetail error:', err);
          this.notification.errorBubble('載入詳細資料時發生錯誤');
        },
        complete: () => {
          this.loading = false;
          this.tableLoading.set(false);
          this.messageService.unblockUi();
        }
      });
  }

  /**
   * 載入下拉選單選項
   */
  private loadDropdownOptions(): void {
    // 部門代號 / 保管單位（querySYS3100_DropDownList）
    this.dropDownListService.querySYS3100_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
          Name: item.Name,
        }));
        this.orgIdOptions.set(options);
        this.custodyUnitOptions.set(options);
      },
    });

    // 申請人代號與保管人
    this.dropDownListService.queryTBLUSER_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
          Name: item.Name,
        }));
        this.allEmpIdOptions = options;
        this.empIdOptions.set(options);
        this.allCustodianOptions = options;
        this.custodianOptions.set(options);
      },
    });

    // 倉別 (WH_ID)
    this.ass11100Service.queryASS11100({ PageSize: 9999, PageIndex: 1 }).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = (res.Data ?? [])
          .filter(item => item.WH_ID != null && item.WH_ID !== '')
          .map(item => ({
            label: `${item.WH_ID} - ${item.WH_NAME ?? ''}`,
            value: item.WH_ID!,
          }));
        this.whIdOptions.set(options);
      },
    });

    // 品項代碼 (GOODS_ID)
    this.ass11040Service.queryFASITEM_DropDownList({ PageSize: 9999, PageIndex: 1 }).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = (res.Data?.Data ?? [])
          .filter(item => item.GOODS_ID != null && item.GOODS_ID !== '')
          .map(item => ({
            label: `${item.GOODS_ID} - ${item.GOODS_NAME ?? ''}`,
            value: item.GOODS_ID!,
            unit: item.UNIT_NAME ?? '',
          }));
        this.goodsIdOptions.set(options);

        // 編輯模式下 detail 可能早於下拉載入完成，這裡回頭補上既有列缺少的單位
        const current = this.tableData();
        if (current.length > 0) {
          const filled = current.map(item => {
            if (item.GOODS_ID && !item.UNIT) {
              const found = options.find(o => o.value === item.GOODS_ID);
              if (found?.unit) {
                return { ...item, UNIT: found.unit };
              }
            }
            return item;
          });
          this.tableData.set(filled);
        }
      },
    });
  }

  /**
   * 設定部門代號連動邏輯
   */
  private setupDepartmentCascade(): void {
    // 監聽部門代號變化
    this.dataForm.controls.ORG_ID.valueChanges.pipe(
      untilDestroyed(this)
    ).subscribe(orgId => {
      if (orgId) {
        // 1. 同步更新表格資料中所有項目的「保管單位」欄位
        const currentData = this.tableData();
        const updatedData = currentData.map(item => ({
          ...item,
          CUSTODY_UNIT: orgId,
        }));
        this.tableData.set(updatedData);


        // 4. 自動帶入部門主管
        // TODO: 等 API 規格確認後，實作取得部門主管的邏輯
        // 目前先清空申請人和保管人欄位
        if (!this.dataForm.controls.EMP_ID.value) {
          // 如果有部門主管資料，自動帶入
          // const manager = this.getDepartmentManager(orgId);
          // if (manager) {
          //   this.dataForm.controls.EMP_ID.setValue(manager.value, { emitEvent: false });
          // }
        }
      }
    });
  }

  /**
   * 清除上半部固定欄位
   */
  public onClearHeader(): void {
    this.dataForm.patchValue({
      ORG_ID: '',
      EMP_ID: '',
      APPLY_DATE: null,
      NEED_NUM: '',
      WH_ID: '',
      REMARK: '',
    });
  }

  /**
   * 處理表格新增事件
   */
  public onTableInsert(): void {
    const newItem = this.defaultNewItem();
    const currentData = this.tableData();
    this.tableData.set([...currentData, newItem as ASS12010Item]);
  }

  /**
   * 提供新增行的預設值
   */
  public defaultNewItem(): Partial<ASS12010Item> {
    const orgId = this.dataForm.controls.ORG_ID.value;
    return {
      GOODS_ID: undefined,
      CUSTODY_UNIT: orgId || undefined,
      CUSTODIAN: undefined,
      UNIT: undefined,
      QUANTITY: undefined,
      ITEM_REMARK: undefined,
    };
  }


  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const raw = this.dataForm.getRawValue();
      const tableItems = this.tableData();

      // 驗證至少有一筆品項
      if (tableItems.length === 0) {
        this.notification.warnBubble('至少需要輸入一筆品項');
        this.loading = false;
        return;
      }

      this.tableLoading.set(true);

      if (this.isFormCreateable) {
        // 新增：使用新的 API 規格
        // 轉換表格資料為明細項目格式
        const items = tableItems
          .filter(item => item.GOODS_ID && item.QUANTITY) // 過濾掉未完成的項目
          .map((item) => ({
            GOODS_ID: item.GOODS_ID!,
            QTY: Number(item.QUANTITY) || 0,
            HOLD_ORG_ID: item.CUSTODY_UNIT || raw.ORG_ID || '', // 保管部門，如果沒有則使用申請部門
            HOLD_EMP_ID: item.CUSTODIAN || '', // 保管人員
            NOTES: item.ITEM_REMARK || undefined,
          }));

        // 驗證轉換後的資料
        if (items.length === 0) {
          this.notification.warnBubble('至少需要輸入一筆完整的品項資料（品項代號和數量）');
          this.tableLoading.set(false);
          this.loading = false;
          return;
        }

        // 將明細陣列序列化為 JSON 字串
        const detailJson = JSON.stringify(items);

        const u = this.authService.currentUserValue;
        const applyDate = raw.APPLY_DATE
          ? (raw.APPLY_DATE instanceof Date
            ? raw.APPLY_DATE
            : new Date(raw.APPLY_DATE as string))
          : new Date();
        const applyDateIso = Number.isNaN(applyDate.getTime())
          ? new Date().toISOString()
          : applyDate.toISOString();

        const insertPayload: ASS12010InsertRequest = {
          EMP_ID: raw.EMP_ID ?? '',
          ORG_ID: raw.ORG_ID ?? '',
          WH_ID: raw.WH_ID ?? '',
          APPLY_DATE: applyDateIso,
          NEED_NUM: raw.NEED_NUM?.trim() ? raw.NEED_NUM.trim() : undefined,
          NOTE: raw.REMARK?.trim() ? raw.REMARK.trim() : undefined,
          DetailJson: detailJson,
        };
        this.logger.debug(`onSubmit insert:`, [insertPayload]);

        this.service.insertASS12010(insertPayload).pipe(
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          })
        ).subscribe({
          next: res => {
            if (res.Status !== '0000') {
              this.notification.errorBubble(res.Message || '新增失敗');
              return;
            }
            this.notification.successBubble('新增成功');
            this.onCancel();
          },
        });
      } else {
        // 更新：使用新的 API 規格
        // 從 router state 的 rowdata 取得 NEED_ID
        const needId = (this.rowdata as ASS12010Data)?.NEED_ID || '';
        if (!needId) {
          this.notification.errorBubble('無法取得需求單號');
          this.tableLoading.set(false);
          this.loading = false;
          return;
        }

        // 轉換表格資料為新的 API 規格
        const details = tableItems
          .filter(item => item.GOODS_ID && item.QUANTITY) // 過濾掉未完成的項目
          .map((item) => ({
            GOODS_ID: item.GOODS_ID!,
            QTY: Number(item.QUANTITY) || 0,
            UNIT: item.UNIT || '', //單位
            HOLD_ORG_ID: item.CUSTODY_UNIT || raw.ORG_ID || '', // 保管部門，如果沒有則使用申請部門
            HOLD_EMP_ID: item.CUSTODIAN || '', // 保管人員
            NOTES: item.ITEM_REMARK || undefined,
          }));

        // 驗證轉換後的資料
        if (details.length === 0) {
          this.notification.warnBubble('至少需要輸入一筆完整的品項資料（品項代號和數量）');
          this.tableLoading.set(false);
          this.loading = false;
          return;
        }

        const updatePayload: ASS12010UpdateRequest = {
          NEED_ID: needId,
          EMP_ID: raw.EMP_ID ?? '',
          ORG_ID: raw.ORG_ID ?? '',
          WH_ID: raw.WH_ID ?? '',
          APPLY_DATE: raw.APPLY_DATE ?? new Date(),
          NEED_NUM: raw.NEED_NUM || undefined,
          NOTE: raw.REMARK || undefined, // 表單欄位是 REMARK，API 需要 NOTE
          Details: details,
        };
        this.logger.debug(`onSubmit update:`, [updatePayload]);

        this.service.updateASS12010(updatePayload).pipe(
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          })
        ).subscribe({
          next: res => {
            if (res.Status !== '0000') {
              this.notification.errorBubble(res.Message || '更新失敗');
              return;
            }
            this.notification.successBubble('更新成功');
            this.onCancel();
          },
        });
      }
    });
  }
}
