import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11010Service } from '@service/api/ass/ass11010.service';
import { ASS11020Service } from '@service/api/ass/ass11020.service';
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
import { ASS11020Data, ASS11020InsertRequest, ASS11020UpdateRequest } from '../ass11020/ass11020.model';

// 3.1.1.2 資產列管品及耗材分類管理作業-中分類維護作業 CRU
@Component({
  selector: 'app-ass11020-cru',
  templateUrl: './ass11020-cru.component.html',
  styleUrl: './ass11020-cru.component.scss',
  standalone: true,
  imports: [
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    InputTextareaComponent,
    MenubarComponent,
  ]
})
export class ASS11020CRUComponent extends BasicCruPageComponent<ASS11020Data> implements OnInit {

  public readonly dataForm = this.formBuilder.nonNullable.group({
    /** 中分類代碼 */
    CLASS_ID: new FormControl<string>('', [Validators.required, Validators.maxLength(2)]),
    /** 中分類名稱 */
    CLASS_NAME: new FormControl<string>('', [Validators.required, Validators.maxLength(32)]),
    /** 大分類代碼 */
    B_CLASS_ID: new FormControl<string>('', [Validators.required]),
    /** 大分類名稱 */
    B_CLASS_NAME: new FormControl<string>(''),
    /** 說明 */
    NOTES: new FormControl<string>(''),
  });
  public readonly df = computed(() => this.dataForm.controls);

  public readonly tableLoading = signal<boolean>(false);

  // 大分類代碼下拉選項
  public readonly bigClassOptions = signal<{ label: string; value: string; name: string }[]>([]);

  constructor(
    public readonly service: ASS11020Service,
    private readonly ass11010Service: ASS11010Service,
    private readonly logger: NGXLogger,
    private readonly notification: NotificationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11020', this.dataForm);
    this.logger.debug(`ASS11020 CRU init:`, [this.user, this.rowdata]);

    // 手動處理欄位對應：API 回傳 M_CLASS_ID/M_CLASS_NAME，表單使用 CLASS_ID/CLASS_NAME
    if (this.rowdata) {
      this.dataForm.patchValue({
        CLASS_ID: this.rowdata.M_CLASS_ID ?? '',
        CLASS_NAME: this.rowdata.M_CLASS_NAME ?? '',
        B_CLASS_ID: this.rowdata.B_CLASS_ID ?? '',
        B_CLASS_NAME: this.rowdata.B_CLASS_NAME ?? '',
        NOTES: this.rowdata.NOTES ?? '',
      });
    }

    this.loadBigClassOptions();
    this.setupBigClassNameSync();
  }

  /**
   * 載入大分類下拉選項
   */
  private loadBigClassOptions(): void {
    this.ass11010Service.queryASS11010({}).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.QueryData.map(item => ({
          label: `${item.CLASS_ID}/${item.CLASS_NAME}`,
          value: item.CLASS_ID,
          name: item.CLASS_NAME,
        }));
        this.bigClassOptions.set(options);

        // 如果是編輯或檢視模式，同步大分類名稱
        if (this.rowdata?.B_CLASS_ID) {
          this.syncBigClassName(this.rowdata.B_CLASS_ID);
        }
      },
    });
  }

  /**
   * 設定大分類代碼變更時自動同步大分類名稱
   */
  private setupBigClassNameSync(): void {
    this.dataForm.controls.B_CLASS_ID.valueChanges.subscribe(value => {
      if (value) {
        this.syncBigClassName(value);
      }
    });
  }

  /**
   * 同步大分類名稱
   */
  private syncBigClassName(classId: string): void {
    const selectedOption = this.bigClassOptions().find(opt => opt.value === classId);
    this.dataForm.controls.B_CLASS_NAME.setValue(selectedOption?.name ?? '');
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const raw = this.dataForm.getRawValue();

      this.tableLoading.set(true);

      if (this.isFormCreateable) {
        // 新增
        const insertPayload: ASS11020InsertRequest = {
          CLASS_ID: raw.CLASS_ID ?? '',
          CLASS_NAME: raw.CLASS_NAME ?? '',
          B_CLASS_ID: raw.B_CLASS_ID ?? '',
          NOTES: raw.NOTES ?? '',
        };
        this.logger.debug(`onSubmit insert:`, [insertPayload]);

        this.service.insertASS11020(insertPayload).pipe(
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
        const updatePayload: ASS11020UpdateRequest = {
          OLD_B_CLASS_ID: this.rowdata?.B_CLASS_ID ?? '',
          OLD_CLASS_ID: this.rowdata?.M_CLASS_ID ?? '',
          NEW_B_CLASS_ID: raw.B_CLASS_ID ?? '',
          NEW_CLASS_ID: raw.CLASS_ID ?? '',
          NEW_CLASS_NAME: raw.CLASS_NAME ?? '',
          NEW_NOTES: raw.NOTES ?? '',
        };
        this.logger.debug(`onSubmit update:`, [updatePayload]);

        this.service.updateASS11020(updatePayload).pipe(
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
