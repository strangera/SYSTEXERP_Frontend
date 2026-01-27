import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS12010Service } from '@service/api/ass/ass12010.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { NGXLogger } from 'ngx-logger';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { RippleModule } from 'primeng/ripple';
import { finalize } from 'rxjs';
import { ASS12010Data, ASS12010InsertRequest, ASS12010Item, ASS12010UpdateRequest } from '../ass12010/ass12010.model';

// 請購申請作業 CRU
@Component({
  selector: 'app-ass12010-cru',
  templateUrl: './ass12010-cru.component.html',
  styleUrl: './ass12010-cru.component.scss',
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
    NEED_PERIOD: new FormControl<string | null>(null, [Validators.maxLength(2)]),
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

  // 下拉選單選項
  public readonly orgIdOptions = signal<{ label: string; value: string; Name?: string }[]>([]);
  public readonly empIdOptions = signal<{ label: string; value: string; Name?: string }[]>([]);
  public readonly filteredEmpIdOptions = signal<{ label: string; value: string; Name?: string }[]>([]);
  public readonly whIdOptions = signal<{ label: string; value: string }[]>([]);
  public readonly goodsIdOptions = signal<{ label: string; value: string }[]>([]);
  public readonly custodyUnitOptions = signal<{ label: string; value: string }[]>([]);
  public readonly custodianOptions = signal<{ label: string; value: string; Name?: string }[]>([]);
  public readonly filteredCustodianOptions = signal<{ label: string; value: string; Name?: string }[]>([]);

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
      type: 'input',
      maxLength: 6,
      placeholder: '最多6個字',
    },
    {
      field: 'UNIT',
      header: '單位',
      type: 'input',
      maxLength: 8,
      placeholder: '最多8個字',
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
  }

  /**
   * 載入下拉選單選項
   */
  private loadDropdownOptions(): void {
    // 部門代號
    this.dropDownListService.queryPOS2013_DropDownList({}).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
          Name: item.Name,
        }));
        this.orgIdOptions.set(options);
      },
    });

    // 申請人代號（載入全部，用於過濾）
    this.dropDownListService.queryTBLUSER_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
          Name: item.Name,
          // TODO: 等 API 規格確認後，加入 ORG_ID 欄位用於過濾
          // ORG_ID: item.ORG_ID,
        }));
        this.allEmpIdOptions = options;
        this.empIdOptions.set(options);
        this.filteredEmpIdOptions.set(options);
      },
    });

    // TODO: 等 API 規格確認後，載入以下下拉選單
    // - 倉別 (WH_ID)
    // - 品項代碼 (GOODS_ID)
    // - 保管單位
    // - 保管人（載入全部，用於過濾）
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

        // 2. 過濾「申請人」下拉選單（只顯示該部門人員）
        // TODO: 等 API 規格確認後，根據 ORG_ID 過濾
        // 目前先顯示全部選項
        const filtered = this.allEmpIdOptions.filter(emp => {
          // TODO: 等 API 規格確認後，使用 emp.ORG_ID === orgId 過濾
          return true; // 暫時不過濾
        });
        this.filteredEmpIdOptions.set(filtered);

        // 3. 過濾「保管人」下拉選單（只顯示該部門人員）
        // TODO: 等 API 規格確認後，根據 ORG_ID 過濾
        const filteredCustodians = this.allCustodianOptions.filter(cust => {
          // TODO: 等 API 規格確認後，使用 cust.ORG_ID === orgId 過濾
          return true; // 暫時不過濾
        });
        this.filteredCustodianOptions.set(filteredCustodians);

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
      } else {
        // 清空部門時，重置過濾
        this.filteredEmpIdOptions.set(this.allEmpIdOptions);
        this.filteredCustodianOptions.set(this.allCustodianOptions);
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
      NEED_PERIOD: '',
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

      // 轉換表格資料為 items 陣列格式
      const items: ASS12010Item[] = tableItems.map((item) => ({
        GOODS_ID: item.GOODS_ID || undefined,
        CUSTODY_UNIT: item.CUSTODY_UNIT || undefined,
        CUSTODIAN: item.CUSTODIAN || undefined,
        UNIT: item.UNIT || undefined,
        QUANTITY: item.QUANTITY || undefined,
        ITEM_REMARK: item.ITEM_REMARK || undefined,
      }));

      if (this.isFormCreateable) {
        // 新增
        const insertPayload: ASS12010InsertRequest = {
          ORG_ID: raw.ORG_ID ?? '',
          EMP_ID: raw.EMP_ID ?? '',
          APPLY_DATE: raw.APPLY_DATE ?? new Date(),
          NEED_PERIOD: raw.NEED_PERIOD ?? undefined,
          WH_ID: raw.WH_ID ?? '',
          REMARK: raw.REMARK ?? undefined,
          items,
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
        // 更新
        const updatePayload: ASS12010UpdateRequest = {
          NEED_ID: this.rowdata?.NEED_ID ?? '',
          ORG_ID: raw.ORG_ID ?? '',
          EMP_ID: raw.EMP_ID ?? '',
          APPLY_DATE: raw.APPLY_DATE ?? new Date(),
          NEED_PERIOD: raw.NEED_PERIOD ?? undefined,
          WH_ID: raw.WH_ID ?? '',
          REMARK: raw.REMARK ?? undefined,
          items,
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
