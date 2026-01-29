import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';

import {
  ASS11040Service,
  QueryASS11040Response,
  SP_FASITEM_CreateRequest,
  SP_FASITEM_UpdateRequest,
} from '@service/api/ass/ass11040.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

//3.1.1.4 品項資料維護作業 CRU
@UntilDestroy()
@Component({
  selector: 'app-ass11040-cru',
  templateUrl: './ass11040-cru.component.html',
  standalone: true,
  imports: [InputTextareaComponent, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, InputTextComponent, DropdownComponent, EditorTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class ASS11040CRUComponent extends BasicCruPageComponent<QueryASS11040Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    itemCode: [null as string | null, [Validators.maxLength(13)]], // 品項代碼
    itemName: ['', [Validators.maxLength(32)]], // 品項名稱
    bigCategoryCode: [null as string | null], // 大分類代碼
    midCategoryCode: [null as string | null], // 中分類代碼
    smlCategoryCode: [null as string | null], // 小分類代碼
    itemCategory: [null as string | null], // 品項類別區分
    itemUnit: [null as string | null], // 基本單位
    packageUnit: [null as string | null], // 包裝單位
    warrantyMethod: [null as string | null], // 保固方式
    maintenanceMethod: [null as string | null], // 保養方式
    illustrate: [null as string | null], // 說明
  });
  itemCategoryOptions = getSYS1000Options('PROD_TYPE');
  itemUnitOptions = getSYS1000Options('UNIT');
  packageUnitOptions = getSYS1000Options('PACK_UNIT');

  bigCategoryCodeOptions: { value: string; label: string }[] = [];
  midCategoryCodeOptions: { value: string; label: string }[] = [];
  smlCategoryCodeOptions: { value: string; label: string }[] = [];

  warrantyMethodOptions: { value: string; label: string }[] = [
    { value: '0', label: '廠商' },
    { value: '1', label: '公司' },
  ];
  maintenanceMethodOptions: { value: string; label: string }[] = [
    { value: '0', label: '廠商' },
    { value: '1', label: '公司' },
  ];

  constructor(
    private readonly ass11040Service: ASS11040Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11040', this.dataForm);
    this.loadBigCategoryOptions();
    this.setupCategoryListeners();
  }

  /** 載入大分類選項 */
  loadBigCategoryOptions(): void {
    this.ass11040Service.queryFACLASSM({}).pipe(untilDestroyed(this)).subscribe(res => {
      this.bigCategoryCodeOptions = (res.Data?.Data || []).map(item => ({
        value: item.CLASS_ID || '',
        label: `${item.CLASS_ID} - ${item.CLASS_NAME}`
      }));
    });
  }

  /** 設定分類連動監聽 */
  setupCategoryListeners(): void {
    // 監聽大分類變更 -> 載入中分類
    this.dataForm.controls.bigCategoryCode.valueChanges.pipe(untilDestroyed(this)).subscribe(bigCode => {
      // 清空中分類和小分類
      this.dataForm.controls.midCategoryCode.setValue(null);
      this.dataForm.controls.smlCategoryCode.setValue(null);
      this.midCategoryCodeOptions = [];
      this.smlCategoryCodeOptions = [];

      if (bigCode) {
        this.loadMidCategoryOptions(bigCode);
      }
    });

    // 監聽中分類變更 -> 載入小分類
    this.dataForm.controls.midCategoryCode.valueChanges.pipe(untilDestroyed(this)).subscribe(midCode => {
      // 清空小分類
      this.dataForm.controls.smlCategoryCode.setValue(null);
      this.smlCategoryCodeOptions = [];

      if (midCode) {
        this.loadSmlCategoryOptions(midCode);
      }
    });
  }

  /** 載入中分類選項 */
  loadMidCategoryOptions(bigCategoryCode: string): void {
    this.ass11040Service.queryFACLASS1({ B_CLASS_ID: bigCategoryCode }).pipe(untilDestroyed(this)).subscribe(res => {
      this.midCategoryCodeOptions = (res.Data?.Data || []).map(item => ({
        value: item.CLASS_ID || '',
        label: `${item.CLASS_ID} - ${item.CLASS_NAME}`
      }));
    });
  }

  /** 載入小分類選項 */
  loadSmlCategoryOptions(midCategoryCode: string): void {
    this.ass11040Service.queryFACLASS2({ M_CLASS_ID: midCategoryCode }).pipe(untilDestroyed(this)).subscribe(res => {
      this.smlCategoryCodeOptions = (res.Data?.Data || []).map(item => ({
        value: item.S_CLASS_ID || '',
        label: `${item.S_CLASS_ID} - ${item.S_CLASS_NAME}`
      }));
    });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      const createPayload: SP_FASITEM_CreateRequest = {
        GOODS_ID: raw.itemCode ?? '',
        GOODS_NAME: raw.itemName ?? null,
        B_CLASS_ID: raw.bigCategoryCode ?? null,
        M_CLASS_ID: raw.midCategoryCode ?? null,
        S_CLASS_ID: raw.smlCategoryCode ?? null,
        MATERIAL_TYPE: raw.itemCategory ?? null,
        UNIT: raw.itemUnit ?? null,
        PACK_UNIT: raw.packageUnit ?? null,
        MT_MODE: raw.warrantyMethod ?? null,
        IVN_MODE: raw.maintenanceMethod ?? null,
        NOTES: raw.illustrate ?? null,
      };

      if (this.isFormCreateable) {
        this.ass11040Service
          .spFASITEMCreate(createPayload)
          .pipe(
            untilDestroyed(this),
            finalize(() => (this.loading = false))
          )
          .subscribe({
            next: res => {
              if (res.Status !== '0000') return;
              this.messageService.successBubble(res.Message ?? '新增成功');
              this.dataForm.reset();
            },
          });
      } else {
        const id = (this.rowdata as QueryASS11040Response)?.ID;
        if (id == null) {
          this.messageService.warnBubble('無法取得品項 ID');
          this.loading = false;
          return;
        }
        const updatePayload: SP_FASITEM_UpdateRequest = {
          ID: id,
          ...createPayload,
        };
        this.ass11040Service
          .spFASITEMUpdate(updatePayload)
          .pipe(
            untilDestroyed(this),
            finalize(() => (this.loading = false))
          )
          .subscribe({
            next: res => {
              if (res.Status !== '0000') return;
              this.messageService.successBubble(res.Message ?? '更新成功');
              this.onCancel();
            },
          });
      }
    });
  }
}
