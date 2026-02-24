import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { QueryASS11060Response, UpdateASS11060Request } from '../../../service/api/ass/ass11060.model';
import { ASS11060Service } from '../../../service/api/ass/ass11060.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '../../../shared/componentkit/input-textarea/input-textarea.component';

//3.1.1.6 供應商資料維護作業 CRU
@Component({
  selector: 'app-ass11060-cru',
  templateUrl: './ass11060-cru.component.html',
  styleUrl: './ass11060-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberComponent,
    DropdownComponent,
    InputTextareaComponent,
    ButtonComponent,
    TranslateModule,
  ]
})
export class ASS11060CRUComponent extends BasicCruPageComponent<QueryASS11060Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    /** 訂貨地址 */
    ORDER_ADDR: ['', [Validators.maxLength(100)]],
    /** 訂貨電話 */
    ORDER_TEL: ['', [Validators.maxLength(12)]],
    /** 訂貨傳真 */
    ORDER_FAX: ['', [Validators.maxLength(12)]],
    /** 工廠地址 */
    FACTO_ADDR: ['', [Validators.maxLength(100)]],
    /** 工廠電話 */
    FACTO_TEL: ['', [Validators.maxLength(12)]],
    /** 工廠傳真 */
    FACTO_FAX: ['', [Validators.maxLength(12)]],
    /** 送貨方式 */
    DELIVERY: [null as string | null],
    /** 廠商送貨期限 */
    DELIVERY_LIMIT: [null as number | null],
    /** 退貨處理方式 */
    RETURN_ORDER: [null as string | null],
    /** 附註 */
    VEN_Remark: [''],
  });

  /** 送貨方式下拉選項 */
  deliveryMethodOptions = [
    { value: '1', label: '貨運' },
    { value: '2', label: '自取' },
    { value: '3', label: '其他' },
  ];
  /** 退貨處理方式下拉選項 */
  returnMethodOptions = [
    { value: '1', label: '貨運' },
    { value: '2', label: '自取' },
    { value: '3', label: '其他' },
  ];

  constructor(
    private readonly ass11060Service: ASS11060Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11060', this.dataForm);
  }

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const rawValue = this.dataForm.getRawValue();

      const payload: UpdateASS11060Request = {
        VEN_No: this.rowdata?.VEN_No ?? '',
        ORDER_ADDR: rawValue.ORDER_ADDR || null,
        ORDER_TEL: rawValue.ORDER_TEL || null,
        ORDER_FAX: rawValue.ORDER_FAX || null,
        FACTO_ADDR: rawValue.FACTO_ADDR || null,
        FACTO_TEL: rawValue.FACTO_TEL || null,
        FACTO_FAX: rawValue.FACTO_FAX || null,
        DELIVERY: rawValue.DELIVERY || null,
        DELIVERY_LIMIT: rawValue.DELIVERY_LIMIT ?? null,
        RETURN_ORDER: rawValue.RETURN_ORDER || null,
        VEN_Remark: rawValue.VEN_Remark || null,
      };

      this.loading = true;
      this.ass11060Service.updateASS11060(payload)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.messageService.unblockUi();
          }),
          untilDestroyed(this),
        )
        .subscribe({
          next: () => {
            this.messageService.successBubble('編輯成功');
            this.onCancel();
          },
          error: (err) => {
            this.messageService.errorBubble('操作失敗：' + (err.message || '未知錯誤'));
          },
        });
    });
  }
}
