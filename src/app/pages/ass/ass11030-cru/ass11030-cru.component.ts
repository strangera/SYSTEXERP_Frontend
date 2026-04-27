import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11010Service } from '@service/api/ass/ass11010.service';
import { ASS11020Service } from '@service/api/ass/ass11020.service';
import { ASS11030Service } from '@service/api/ass/ass11030.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { ASS11030Data, ASS11030InsertRequest, ASS11030UpdateRequest } from '../ass11030/ass11030.model';

// 3.1.1.3 資產列管品及耗材分類管理作業-小分類維護作業 CRU
@Component({
  selector: 'app-ass11030-cru',
  templateUrl: './ass11030-cru.component.html',
  styleUrl: './ass11030-cru.component.scss',
  standalone: true,
  imports: [
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputTextareaComponent,
    InputTextComponent,
    MenubarComponent,
  ]
})
export class ASS11030CRUComponent extends BasicCruPageComponent<ASS11030Data> implements OnInit {

  public readonly dataForm = this.formBuilder.nonNullable.group({
    CLASS_ID: new FormControl<string>('', [Validators.required, Validators.maxLength(2)]),    // 小分類代碼
    CLASS_NAME: new FormControl<string>('', [Validators.required, Validators.maxLength(32)]), // 小分類名稱
    M_CLASS_ID: new FormControl<string>('', [Validators.required]),                            // 中分類代碼
    B_CLASS_ID: new FormControl<string>('', [Validators.required]),                            // 大分類代碼
    NOTES: new FormControl<string>(''),                                                        // 說明
  });
  public readonly df = computed(() => this.dataForm.controls);

  public readonly tableLoading = signal<boolean>(false);

  // 大分類代碼/名稱下拉選項
  public readonly bigClassOptions = signal<{ label: string; value: string }[]>([]);
  // 中分類代碼/名稱下拉選項（篩選後的選項）
  public readonly midClassOptions = signal<{ label: string; value: string }[]>([]);
  // 儲存所有中分類資料（用於根據大分類篩選）
  private allMidClassData: { label: string; value: string; bClassId: string }[] = [];

  constructor(
    public readonly service: ASS11030Service,
    private readonly ass11010Service: ASS11010Service,
    private readonly ass11020Service: ASS11020Service,
    private readonly logger: NGXLogger,
    private readonly notification: NotificationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11030', this.dataForm);
    this.logger.debug(`ASS11030 CRU init:`, [this.user, this.rowdata]);

    // 1. 先設定 valueChanges 監聽（避免 patchValue 觸發時清除資料）
    this.setupBigClassFilterSync();

    // 2. 再 patchValue（這樣 valueChanges 會被觸發，但有保護條件）
    if (this.rowdata) {
      this.dataForm.patchValue({
        CLASS_ID: this.rowdata.S_CLASS_ID ?? '',
        CLASS_NAME: this.rowdata.S_CLASS_NAME ?? '',
        M_CLASS_ID: this.rowdata.M_CLASS_ID ?? '',
        B_CLASS_ID: this.rowdata.B_CLASS_ID ?? '',
        NOTES: this.rowdata.NOTES ?? '',
      });
    }

    // 3. 最後載入下拉選項
    this.loadBigClassOptions();
    this.loadMidClassOptions();
  }

  /**
   * 載入大分類下拉選項
   */
  private loadBigClassOptions(): void {
    this.ass11010Service.queryASS11010({}).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.CLASS_ID} - ${item.CLASS_NAME}`,
          value: item.CLASS_ID,
        }));
        this.bigClassOptions.set(options);
      },
    });
  }

  /**
   * 載入中分類下拉選項
   */
  private loadMidClassOptions(): void {
    this.ass11020Service.queryASS11020({}).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        this.allMidClassData = res.Data.map(item => ({
          label: `${item.M_CLASS_ID} - ${item.M_CLASS_NAME}`,
          value: item.M_CLASS_ID,
          bClassId: item.B_CLASS_ID,
        }));

        // 根據目前選擇的大分類篩選中分類選項
        this.filterMidClassOptions();
      },
    });
  }

  /**
   * 根據大分類代碼篩選中分類選項
   */
  private filterMidClassOptions(): void {
    const selectedBClassId = this.dataForm.controls.B_CLASS_ID.value;
    if (selectedBClassId) {
      // 篩選出屬於該大分類的中分類
      const filtered = this.allMidClassData.filter(item => item.bClassId === selectedBClassId);
      this.midClassOptions.set(filtered);
    } else {
      // 若未選擇大分類，顯示所有中分類
      this.midClassOptions.set(this.allMidClassData);
    }
  }

  /**
   * 設定大分類代碼變更時重新篩選中分類選項
   */
  private setupBigClassFilterSync(): void {
    this.dataForm.controls.B_CLASS_ID.valueChanges.subscribe(() => {
      // 重新篩選中分類選項
      this.filterMidClassOptions();

      // 只有在中分類選項已載入後才檢查是否需要清除
      if (this.allMidClassData.length > 0) {
        const currentMClassId = this.dataForm.controls.M_CLASS_ID.value;
        const isValidOption = this.midClassOptions().some(opt => opt.value === currentMClassId);
        if (!isValidOption) {
          // 清除不符合的中分類選擇
          this.dataForm.controls.M_CLASS_ID.setValue('');
        }
      }
    });
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const raw = this.dataForm.getRawValue();

      this.tableLoading.set(true);

      if (this.isFormCreateable) {
        // 新增
        const insertPayload: ASS11030InsertRequest = {
          B_CLASS_ID: raw.B_CLASS_ID ?? '',
          M_CLASS_ID: raw.M_CLASS_ID ?? '',
          CLASS_ID: raw.CLASS_ID ?? '',
          CLASS_NAME: raw.CLASS_NAME ?? '',
          NOTES: raw.NOTES ?? '',
        };
        this.logger.debug(`onSubmit insert:`, [insertPayload]);

        this.service.insertASS11030(insertPayload).pipe(
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          })
        ).subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.notification.successBubble('新增成功');
            this.onCancel();
          },
        });
      } else {
        // 更新
        const updatePayload: ASS11030UpdateRequest = {
          OLD_STO_NO: this.authService.getUserInfo()?.SYS_StoreNo || '',
          OLD_B_CLASS_ID: this.rowdata?.B_CLASS_ID ?? '',
          OLD_M_CLASS_ID: this.rowdata?.M_CLASS_ID ?? '',
          OLD_CLASS_ID: this.rowdata?.S_CLASS_ID ?? '',
          NEW_B_CLASS_ID: raw.B_CLASS_ID ?? '',
          NEW_M_CLASS_ID: raw.M_CLASS_ID ?? '',
          NEW_CLASS_ID: raw.CLASS_ID ?? '',
          NEW_CLASS_NAME: raw.CLASS_NAME ?? '',
          NEW_NOTES: raw.NOTES ?? '',
        };
        this.logger.debug(`onSubmit update:`, [updatePayload]);

        this.service.updateASS11030(updatePayload).pipe(
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          })
        ).subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.notification.successBubble('更新成功');
            this.onCancel();
          },
        });
      }
    });
  }
}
