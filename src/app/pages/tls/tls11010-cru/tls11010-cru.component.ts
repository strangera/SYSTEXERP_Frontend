/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
const numberOrDecimalValidator = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === undefined || value === '') return null;

  // 使用簡單的正規表達式，並直接測試
  return /^\d+(\.\d+)?$/.test(String(value).trim()) ? null : { pattern: true };
};
@Component({
  selector: 'app-tls11010-cru',
  templateUrl: './tls11010-cru.component.html',
  styleUrls: ['./tls11010-cru.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    NgIf,
    TranslateModule,
  ],
})
export class TLS11010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  // 欄位中文名稱（用在錯誤泡泡）
  private readonly labelOf: Record<string, string> = {
    LOCATION_No: '店位代碼',
    LOCATION_Name: '店位說明',
    org_id: '組織代碼/名稱',
    building_no: '館別',
    FLOOR_NO: '樓層',
    AREA_NO: '區域',
    GROSS_SPACE: '簽約坪數',
    NET_SPACE: '營業坪數',
    LOCATION_Status: '使用狀態',
    Purpose_no: '用途代碼/名稱',
    Draw_X: '平面圖 X 座標',
    Draw_Y: '平面圖 Y 座標',
  };

  /** 錯誤泡泡的欄位檢查順序 */
  private readonly checkOrder: string[] = [
    'LOCATION_No',
    'LOCATION_Name',
    'org_id',
    'building_no',
    'FLOOR_NO',
    'AREA_NO',
    'GROSS_SPACE',
    'NET_SPACE',
    'LOCATION_Status',
    'Purpose_no',
    'Draw_X',
    'Draw_Y',
  ];

  // 建立表單欄位
  dataForm = this.formBuilder.nonNullable.group({
    LOCATION_Name: ['', [Validators.required, Validators.maxLength(30)]], // 店位說明
    org_id: ['', [Validators.maxLength(20)]], // 組織代碼
    building_no: ['', [Validators.required, Validators.maxLength(1)]], // 館別代碼
    FLOOR_NO: ['', [Validators.required, Validators.maxLength(2)]], // 樓層代碼
    AREA_NO: ['', [Validators.required, Validators.maxLength(2)]], // 區域代碼

    // 簽約坪數
    GROSS_SPACE: [null, [Validators.min(0), Validators.max(9999.999), numberOrDecimalValidator]],

    NET_SPACE: [
      null,
      [Validators.required, Validators.min(0), Validators.max(9999.999)],
    ], // 營業坪數
    LOCATION_Status: ['0', [Validators.required, Validators.maxLength(1)]], // 使用狀態（字串 '0' 預設未使用）
    Purpose_no: [null, [Validators.required]], // 用途代碼
    Draw_X: ['', [Validators.maxLength(255)]], // X 座標
    Draw_Y: ['', [Validators.maxLength(255)]], // Y 座標
    LOCATION_No: ['', [Validators.required, Validators.maxLength(10)]], // 店位代碼
  });

  floorOptions: any[] = [];
  RegionCodeOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  usageOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];

  // 下拉選單：一律以字串值 '0' | '1' | '2' | '3' 維持一致
  LOCATION_Status_Options: any[] = [];

  constructor(
    private readonly translate: TranslateService,
    private readonly tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    // ⭐ 讓 base 幫你帶 crudstatus / rowdata / listRoute 等等
    this.initializePage('TLS11010', this.dataForm);

    // 🔸簽約坪數：監聽 valueChanges，輸入中文時提示並移除
    const grossCtrl = this.dataForm.get('GROSS_SPACE') as any;

    grossCtrl?.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((val: any) => {
        if (val === null || val === undefined || val === '') {
          return;
        }

        const str = String(val);
        const chineseRegex = /[\u4E00-\u9FFF]/g;

        if (!chineseRegex.test(str)) {
          return;
        }

        // 提示使用者（中文對話泡泡）
        this.messageService.warnBubble('「簽約坪數」不得輸入中文，請改用數字。');

        // 把所有中文移除
        const noChinese = str.replace(chineseRegex, '');

        // 空字串就設回 null，有值就轉成 number
        const nextVal = noChinese === '' ? null : Number(noChinese);

        grossCtrl.setValue(nextVal, { emitEvent: false });
      });

    // --- 使用狀態選單邏輯 ---
    if (this.crudstatus === CRUDStatus.Create) {
      // 新增畫面：固定四個選項，預設「未使用」
      this.LOCATION_Status_Options = [
        { value: '0', label: '未使用' },
        { value: '2', label: '保留中' },
        { value: '1', label: '使用中' },
        { value: '3', label: '停用' },
      ];
      this.dataForm.patchValue({ LOCATION_Status: '0' });
      this.dataForm.get('LOCATION_Status')?.enable();
    }

    if (this.crudstatus === CRUDStatus.Edit) {
      // 編輯：依現有狀態決定可選項；維持字串型別
      const statusStr = String(this.rowdata?.LOCATION_Status ?? '').trim();
      this.dataForm.patchValue(this.rowdata);

      switch (statusStr) {
        case '0': // 未使用
          this.LOCATION_Status_Options = [
            { value: '0', label: '未使用' },
            { value: '3', label: '停用' },
          ];
          break;
        case '2': // 保留中
          this.LOCATION_Status_Options = [
            { value: '2', label: '保留中' },
            { value: '3', label: '停用' },
            { value: '0', label: '未使用' },
          ];
          break;
        case '1': // 使用中
        default:
          // 使用中只能維持使用中
          this.LOCATION_Status_Options = [{ value: '1', label: '使用中' }];
          this.dataForm.get('LOCATION_Status')?.disable();
          break;
      }
      this.dataForm.patchValue({ LOCATION_Status: statusStr });
    }

    if (this.crudstatus === CRUDStatus.Read) {
      // 檢視：顯示全部選項，並 disable 表單
      this.LOCATION_Status_Options = [
        { value: '0', label: '未使用' },
        { value: '1', label: '使用中' },
        { value: '2', label: '保留中' },
        { value: '3', label: '停用' },
      ];
      const chosen = String(this.rowdata?.LOCATION_Status ?? '').trim();
      this.dataForm.patchValue({ ...this.rowdata, LOCATION_Status: chosen });
      this.dataForm.disable();
    }

    // --- 其餘選項初始化（全部加上 untilDestroyed） ---
    this.tls11010Service
      .getFloorOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => (this.floorOptions = res));

    this.tls11010Service
      .getRegionOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.RegionCodeOptions =
          res?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: String(x.value).trim(),
          })) || [];

        if (this.crudstatus === CRUDStatus.Edit) {
          const matchedRegion = this.RegionCodeOptions.find(
            (opt) => String(opt.value) === String(this.rowdata?.AREA_NO).trim(),
          );
          if (matchedRegion) {
            this.dataForm.patchValue({ AREA_NO: matchedRegion.value });
          }
        }
      });

    this.tls11010Service
      .getOrgOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.OrganizationCodeOptions =
          res?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });

    this.tls11010Service
      .getUsageOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.usageOptions =
          res?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: String(x.value).trim(),
          })) || [];

        if (this.crudstatus === CRUDStatus.Edit) {
          const matchedUsage = this.usageOptions.find(
            (opt) =>
              String(opt.value) === String(this.rowdata?.Purpose_no).trim(),
          );
          if (matchedUsage) {
            this.dataForm.patchValue({ Purpose_no: matchedUsage.value });
          }
        }
      });

    this.tls11010Service
      .getBuildingOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => (this.BUILDING_NO_Options = res));
  }

  /** 送出：像 FIN13050 一樣，先用中文警告泡泡顯示所有錯誤 */
  onSubmit(form: FormGroup): void {
    this.handleSubmit(null, () => {
      // ✨ 新增自動帶入邏輯：如果 LOCATION_Name 沒有值，就自動帶入 LOCATION_No
      const currentName = this.dataForm.get('LOCATION_Name')?.value;
      const currentNo = this.dataForm.get('LOCATION_No')?.value;
      if (!currentName || String(currentName).trim() === '') {
        this.dataForm.patchValue({ LOCATION_Name: currentNo });
      }

      // 觸發 Angular 驗證
      for (const c of Object.values(this.dataForm.controls)) c.markAsTouched();
      this.submitted = true;

      if (this.dataForm.invalid) {
        // 顯示所有欄位錯誤（中文）
        this.showTopErrors();
        this.messageService.unblockUi();
        this.loading = false;
        return;
      }

      const raw = this.dataForm.getRawValue() as any;
      // 正規化 payload
      raw.GROSS_SPACE = raw.GROSS_SPACE === null || raw.GROSS_SPACE === '' ? null : Number(raw.GROSS_SPACE);
      raw.NET_SPACE =
        raw.NET_SPACE === null || raw.NET_SPACE === ''
          ? null
          : Number(raw.NET_SPACE);

      raw.LOCATION_Status = String(raw.LOCATION_Status);
      raw.org_id = raw.org_id?.trim() === '' ? null : raw.org_id;

      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        // 新增
        this.tls11010Service
          .insertData(raw)
          .pipe(untilDestroyed(this))
          .subscribe({
            next: () => {
              this.messageService.successBubble(
                this.translate.instant('success_message'),
              );
              this.dataForm.reset();
              this.dataForm.markAsPristine();
              // 重設預設狀態為未使用
              this.dataForm.patchValue({ LOCATION_Status: '0' });
            },
            error: () => {
              this.messageService.errorBubble(
                this.translate.instant('create_failed'),
              );
            },
          });
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        // 編輯
        raw.id = this.rowdata?.id;

        this.tls11010Service
          .updateData(raw)
          .pipe(untilDestroyed(this))
          .subscribe({
            next: () => {
              this.messageService.successBubble(
                this.translate.instant('updated-successfully'),
              );
              // ⭐ 交給 base onCancel 回列表（會帶 fromCru: true）
              this.onCancel();
            },
            error: () => {
              this.messageService.errorBubble(
                this.translate.instant('update_failed'),
              );
            },
          });
      } else {
        this.messageService.unblockUi();
      }
    });
  }

  /** 只用右上角泡泡顯示全部錯誤（逐條，中文） */
  private showTopErrors(): void {
    const msgs: string[] = [];

    // 依排序清單檢查
    for (const name of this.checkOrder) {
      const msg = this.buildFieldError(name);
      if (msg) msgs.push(msg);
    }

    // 其餘欄位
    for (const name of Object.keys(this.dataForm.controls)) {
      if (this.checkOrder.includes(name)) continue;
      const msg = this.buildFieldError(name);
      if (msg && !msgs.includes(msg)) msgs.push(msg);
    }

    if (msgs.length) {
      for (const m of msgs) this.messageService.errorBubble(m);
    }
  }

  /** 單欄位錯誤轉成中文描述 */
  private buildFieldError(ctrlName: string): string | null {
    const ctrl: AbstractControl | null = this.dataForm.get(ctrlName);
    if (!ctrl?.errors) return null;

    const label = this.labelOf[ctrlName] ?? ctrlName;
    const e: ValidationErrors = ctrl.errors;

    if (e['required']) {
      return `「${label}」為必填，請輸入資料。`;
    }

    if (e['maxlength']) {
      const max = (e['maxlength']).requiredLength;
      const actual = (e['maxlength']).actualLength;
      return `「${label}」長度不可超過 ${max} 碼，目前為 ${actual} 碼。`;
    }

    if (e['min']) {
      const min = (e['min']).min;
      return `「${label}」數值不可小於 ${min}。`;
    }

    if (e['max']) {
      const max = (e['max']).max;
      return `「${label}」數值不可大於 ${max}。`;
    }

    if (e['pattern']) {
      if (ctrlName === 'GROSS_SPACE' || ctrlName === 'NET_SPACE') {
        return `「${label}」僅能輸入數字與一個小數點。`;
      }
      return `「${label}」格式有誤，請檢查輸入資料。`;
    }

    return `「${label}」格式有誤，請檢查輸入資料。`;
  }

  // 刪除：成功後一樣用 onCancel 回列表（順便 fromCru）
  onDelete(): void {
    const id = this.rowdata?.id;
    if (!id) {
      this.messageService.warnBubble('無有效資料可刪除');
      return;
    }

    const confirmDelete = globalThis.confirm('是否確認刪除此筆資料？');
    if (!confirmDelete) return;

    this.tls11010Service
      .deleteData([id])
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          this.messageService.successBubble('刪除成功');
          this.onCancel();
        },
        error: () => {
          this.messageService.errorBubble('刪除失敗');
        },
      });
  }

  // 清除（CRU 自己的欄位，不影響查詢頁）
  onClear(): void {
    const keepValues = {
      LOCATION_No: this.dataForm.get('LOCATION_No')?.value,
      LOCATION_Status: this.dataForm.get('LOCATION_Status')?.value,
    };
    this.dataForm.reset();
    this.dataForm.patchValue(keepValues);
    this.dataForm.markAsPristine();
  }

  clearBtnConfig = {
    label: '清除',
    class: 'button-clear',
    text: true,
  };

  fakeControlForDisplay(value: string) {
    return this.formBuilder.control({ value, disabled: true });
  }
}
