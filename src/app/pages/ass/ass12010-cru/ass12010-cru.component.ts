import { NgFor, NgIf } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
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
    InputTextareaComponent,
    CalendarComponent,
    MenubarComponent,
    NgIf,
    NgFor,
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
    /** 動態品項明細 */
    items: this.formBuilder.array([this.createItem()]),
  });
  public readonly df = computed(() => this.dataForm.controls);

  public readonly tableLoading = signal<boolean>(false);

  // Get the form array for dynamic items
  get items(): FormArray { return this.dataForm.get('items') as FormArray; }

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

    // 如果是編輯模式，載入資料
    if (this.rowdata) {
      this.loadEditData();
    }
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
        // 1. 同步更新「保管單位」欄位
        this.dataForm.controls.items.controls.forEach(itemControl => {
          itemControl.get('CUSTODY_UNIT')?.setValue(orgId, { emitEvent: false });
        });

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
   * 載入編輯資料
   */
  private loadEditData(): void {
    if (!this.rowdata) return;

    // 載入主檔資料
    this.dataForm.patchValue({
      ORG_ID: this.rowdata.ORG_ID ?? '',
      EMP_ID: this.rowdata.EMP_ID ?? '',
      APPLY_DATE: this.rowdata.APPLY_DATE ? new Date(this.rowdata.APPLY_DATE) : null,
      WH_ID: this.rowdata.WH_ID ?? '',
      // TODO: 等 API 規格確認後，載入其他欄位
    });

    // TODO: 等 API 規格確認後，載入品項明細
    // 目前先保留預設的 1 筆空品項
  }

  /**
   * 取得表單控制項（用於動態表單陣列）
   */
  public getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  /**
   * 建立品項表單群組
   */
  public createItem(): ReturnType<typeof this.formBuilder.group> {
    return this.formBuilder.group({
      GOODS_ID: new FormControl<string | null>(null),
      CUSTODY_UNIT: new FormControl<string | null>(null),
      CUSTODIAN: new FormControl<string | null>(null, [Validators.maxLength(6)]),
      UNIT: new FormControl<string | null>(null, [Validators.maxLength(8)]),
      QUANTITY: new FormControl<string | null>(null, [Validators.maxLength(8)]),
      ITEM_REMARK: new FormControl<string | null>(null),
    });
  }

  /**
   * 新增品項
   */
  public onAddItem(): void {
    this.items.push(this.createItem());
    // 如果已選取部門代號，同步更新新品項的保管單位
    const orgId = this.dataForm.controls.ORG_ID.value;
    if (orgId) {
      const lastIndex = this.items.length - 1;
      this.items.at(lastIndex).get('CUSTODY_UNIT')?.setValue(orgId, { emitEvent: false });
    }
  }

  /**
   * 刪除品項
   */
  public onRemoveItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    } else {
      this.notification.warnBubble('至少需要保留一筆品項');
    }
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
   * 重置品項 FormArray 為預設的 1 筆
   */
  private resetItemsToDefault(): void {
    // 清空所有品項
    this.items.clear();
    // 新增 1 筆預設品項
    this.items.push(this.createItem());
  }

  /**
   * 覆寫 onCancel 方法，在新增模式下重置品項數量
   */

  public onResetForm(): void {
    // 如果是新增模式，重置品項為預設的 1 筆
    if (this.isFormCreateable) {
      this.resetItemsToDefault();
    }
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const raw = this.dataForm.getRawValue();

      this.tableLoading.set(true);

      if (this.isFormCreateable) {
        // 新增
        const insertPayload: ASS12010InsertRequest = {
          ORG_ID: raw.ORG_ID ?? '',
          EMP_ID: raw.EMP_ID ?? '',
          APPLY_DATE: raw.APPLY_DATE ?? new Date(),
          NEED_PERIOD: raw.NEED_PERIOD ?? undefined,
          WH_ID: raw.WH_ID ?? '',
          REMARK: raw.REMARK ?? undefined,
          items: (raw.items as ASS12010Item[]).map((item) => ({
            GOODS_ID: item.GOODS_ID || undefined,
            CUSTODY_UNIT: item.CUSTODY_UNIT || undefined,
            CUSTODIAN: item.CUSTODIAN || undefined,
            UNIT: item.UNIT || undefined,
            QUANTITY: item.QUANTITY || undefined,
            ITEM_REMARK: item.ITEM_REMARK || undefined,
          })) as ASS12010Item[],
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
          items: (raw.items as ASS12010Item[]).map((item) => ({
            GOODS_ID: item.GOODS_ID || undefined,
            CUSTODY_UNIT: item.CUSTODY_UNIT || undefined,
            CUSTODIAN: item.CUSTODIAN || undefined,
            UNIT: item.UNIT || undefined,
            QUANTITY: item.QUANTITY || undefined,
            ITEM_REMARK: item.ITEM_REMARK || undefined,
          })) as ASS12010Item[],
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
