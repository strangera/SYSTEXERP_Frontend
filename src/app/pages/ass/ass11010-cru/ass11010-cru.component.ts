import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11010Service } from '@service/api/ass/ass11010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { ASS11010Data, ASS11010InsertRequest, ASS11010UpdateRequest } from '../ass11010/ass11010.model';

// 3.1.1.1 資產列管品及耗材分類管理作業-大分類維護作業 CRU
@Component({
  selector: 'app-ass11010-cru',
  templateUrl: './ass11010-cru.component.html',
  styleUrl: './ass11010-cru.component.scss',
  standalone: true,
  imports: [
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    InputTextComponent,
    MenubarComponent,
  ]
})
export class ASS11010CRUComponent extends BasicCruPageComponent<ASS11010Data> implements OnInit {

  public readonly dataForm = this.formBuilder.nonNullable.group({
    CLASS_ID: new FormControl<string>('', [Validators.required, Validators.maxLength(1)]),   // 大分類代碼
    CLASS_NAME: new FormControl<string>('', [Validators.required, Validators.maxLength(32)]), // 大分類名稱
  });
  public readonly df = computed(() => this.dataForm.controls);

  public readonly tableLoading = signal<boolean>(false);

  constructor(
    public readonly service: ASS11010Service,
    private readonly logger: NGXLogger,
    private readonly notification: NotificationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11010', this.dataForm);
    this.logger.debug(`ASS11010 CRU init:`, [this.user, this.rowdata]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const raw = this.dataForm.getRawValue();

      this.tableLoading.set(true);

      if (this.isFormCreateable) {
        // 新增
        const insertPayload: ASS11010InsertRequest = {
          CLASS_ID: raw.CLASS_ID ?? '',
          CLASS_NAME: raw.CLASS_NAME ?? '',
        };
        this.logger.debug(`onSubmit insert:`, [insertPayload]);

        this.service.insertASS11010(insertPayload).pipe(
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
        const updatePayload: ASS11010UpdateRequest = {
          OLD_CLASS_ID: this.rowdata?.CLASS_ID ?? '',
          NEW_CLASS_ID: raw.CLASS_ID ?? '',
          NEW_CLASS_NAME: raw.CLASS_NAME ?? '',
        };
        this.logger.debug(`onSubmit update:`, [updatePayload]);

        this.service.updateASS11010(updatePayload).pipe(
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
