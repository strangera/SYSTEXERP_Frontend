import { Component } from '@angular/core';
import { Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { HttpClient } from '@angular/common/http';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgIf } from '@angular/common';
// until-destroy
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
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
export class TLS11010CRUComponent extends BasicCruPageComponent<any> {
  // 建立表單欄位
  dataForm = this.formBuilder.nonNullable.group({
    LOCATION_Name: ['', [Validators.maxLength(30)]], // 店位說明
    org_id: ['', [Validators.maxLength(20)]], // 組織代碼
    building_no: ['', [Validators.required, Validators.maxLength(1)]], // 館別代碼
    FLOOR_NO: ['', [Validators.required, Validators.maxLength(2)]], // 楼層代碼
    AREA_NO: ['', [Validators.required, Validators.maxLength(2)]], // 區域代碼

    // 簽約坪數
    GROSS_SPACE: [
      null,
      [
        Validators.min(0),
        Validators.max(9999.999),
        Validators.pattern(/^[0-9]*\.?[0-9]*$/), // 只能 0-9 和一個小數點
      ],
    ],

    NET_SPACE: [
      null,
      [Validators.required, Validators.min(0), Validators.max(9999.999)],
    ], // 營業坪數
    LOCATION_Status: ['0', [Validators.required, Validators.maxLength(1)]], // 使用狀態（字串 '0' 預設未使用）
    Purpose_no: [null, [Validators.required]], // 用途代碼
    Draw_X: ['', [Validators.maxLength(255)]], // X 座標
    Draw_Y: ['', [Validators.maxLength(255)]], // Y 座標
    LOCATION_No: [
      { value: '由系統帶入', disabled: true },
      [Validators.required, Validators.maxLength(10)],
    ], // 店位代碼
  });

  floorOptions: any[] = [];
  RegionCodeOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  usageOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];

  // 下拉選單：一律以字串值 '0' | '1' | '2' | '3' 維持一致
  LOCATION_Status_Options: any[] = [];

  constructor(
    private validationService: ValidationService,
    private translate: TranslateService,
    private http: HttpClient,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
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

        // 提示使用者
        this.messageService.warnBubble('簽約坪數不得輸入中文，請改用數字。');

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
            (opt) => String(opt.value) === String(this.rowdata?.Purpose_no).trim(),
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

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const raw = this.dataForm.getRawValue() as any;

      // 正規化 payload
      raw.GROSS_SPACE =
        raw.GROSS_SPACE === null || raw.GROSS_SPACE === ''
          ? null
          : Number(raw.GROSS_SPACE);
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
        raw.LOCATION_No = this.rowdata?.LOCATION_No;

        this.tls11010Service
          .updateData(raw)
          .pipe(untilDestroyed(this))
          .subscribe({
            next: () => {
              this.messageService.successBubble(
                this.translate.instant('updated-successfully'),
              );
              this.router.navigate(['account/tls', 'tls11010']);
            },
            error: () => {
              this.messageService.errorBubble(
                this.translate.instant('update_failed'),
              );
            },
          });
      }
    });
  }

  // 刪除
  onDelete(): void {
    const id = this.rowdata?.id;
    if (!id) {
      this.messageService.warnBubble('無有效資料可刪除');
      return;
    }

    const confirmDelete = window.confirm('是否確認刪除此筆資料？');
    if (!confirmDelete) return;

    this.tls11010Service
      .deleteData([id])
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          this.messageService.successBubble('刪除成功');
          this.router.navigate(['/tls', 'TLS11010']);
        },
        error: () => {
          this.messageService.errorBubble('刪除失敗');
        },
      });
  }

  // 清除
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
