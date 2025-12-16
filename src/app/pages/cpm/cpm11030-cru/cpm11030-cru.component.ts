import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';

import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

import {
  Cpm11030Service,
  Cpm11030CruPayload,
  InsertDailyEquipAvailabilityRequest,
} from '../../../service/api/cpm/cpm11030.service';

@UntilDestroy()
@Component({
  selector: 'app-cpm11030-cru',
  templateUrl: './cpm11030-cru.component.html',
  styleUrl: './cpm11030-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
    CalendarComponent,
  ],
})
export class CPM11030CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit
{
  readonly CRUD = CRUDStatus;

  /** 服務台下拉（你說不要連動，所以只當純下拉） */
  counterCodeOptions: { value: string; label: string }[] = [
    { value: '11A001', label: '11A001/服務諮詢台' },
    { value: '12A001', label: '12A001/VIP室' },
    { value: '12D001', label: '12D001/總機' },
    { value: '15A001', label: '15A001/顧客服務中心' },
  ];

  /** ✅ 用一般 group：讓 CSS_CurrentQty 初始可為 null（不要預設 0） */
  dataForm = this.formBuilder.group({
    ID: [null as number | null],

    Loan_No: [{ value: '' as string, disabled: true }], // 顯示用（不一定會用到）
    Loan_Date: [null as Date | null, [Validators.required]],
    Loan_Time: [null as Date | null],

    Service_Id: ['' as string, [Validators.required, Validators.maxLength(7)]], // 你的 DB 是 varchar(7)
    User_Name: ['' as string, [Validators.maxLength(20)]],
    Loan_Phone: ['' as string, [Validators.maxLength(20)]],
    Loan_USR_No: ['' as string, [Validators.maxLength(20)]],

    Cert_Type: ['' as string, [Validators.maxLength(20)]],
    Cert_No: ['' as string, [Validators.maxLength(20)]],

    /** ✅ 不連動：改自由輸入，並限制長度 2（DB varchar(2)） */
    Device_ID: ['' as string, [Validators.required, Validators.maxLength(2)]],

    /** ✅ 不連動：設備名稱自由輸入 */
    Device_Name: ['' as string, [Validators.maxLength(50)]],

    /** ✅ 不要預設 0：必填、>=0 */
    CSS_CurrentQty: [null as number | null, [Validators.required, Validators.min(0)]],
  });

  constructor(private cpm11030Service: Cpm11030Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11030', this.dataForm);
    this.updateDisabledState();
  }

  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Read) {
      if (!this.useReadonlyInsteadOfDisable) this.dataForm.disable();
      return;
    }

    // Create/Edit：可編輯，但 Loan_No 不允許改
    this.dataForm.enable();
    this.dataForm.get('Loan_No')?.disable();

    if (this.crudstatus === CRUDStatus.Edit) {
      this.dataForm.get('ID')?.disable();
    }
  }

  private toIso(d: Date | null | undefined): string {
    const dt = d instanceof Date ? d : new Date();
    return dt.toISOString();
  }

  /** ✅ Create：insertCPM11030_DailyEquipAvailability payload */
  private buildDailyInsertPayload(raw: any): InsertDailyEquipAvailabilityRequest {
    return {
      CSS_Date: this.toIso(raw.Loan_Date),
      Service_Id: (raw.Service_Id ?? '').trim() || null as any,
      Device_ID: (raw.Device_ID ?? '').trim() || null as any,

      CSS_PriorQty: 0,
      CSS_LendQty: 0,
      CSS_ReturnQty: 0,
      CSS_CurrentQty: Number(raw.CSS_CurrentQty),
    };
  }

  /** Edit：保留原本 updateCPM11030（如果你後端有） */
  private toYMD(d: Date | null | undefined): string {
    const dt = d instanceof Date ? d : new Date();
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private toHMS(t: Date | null | undefined): string | undefined {
    if (!t) return undefined;
    const hh = String(t.getHours()).padStart(2, '0');
    const mm = String(t.getMinutes()).padStart(2, '0');
    const ss = String(t.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  private buildCpm11030Payload(raw: any): Cpm11030CruPayload {
    return {
      ID: raw.ID ?? undefined,
      Loan_No: raw.Loan_No ?? undefined,
      Loan_Date: this.toYMD(raw.Loan_Date),
      Loan_Time: this.toHMS(raw.Loan_Time),

      Service_Id: (raw.Service_Id ?? '').trim(),
      User_Name: (raw.User_Name ?? '').trim(),
      Loan_Phone: (raw.Loan_Phone ?? '').trim(),
      Loan_USR_No: (raw.Loan_USR_No ?? '').trim(),

      Cert_Type: (raw.Cert_Type ?? '').trim(),
      Cert_No: (raw.Cert_No ?? '').trim(),

      Device_ID: (raw.Device_ID ?? '').trim() || undefined,
      Device_Name: (raw.Device_Name ?? '').trim() || undefined,
    };
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();

      switch (this.crudstatus) {
        /** ✅ Create：改打 insertCPM11030_DailyEquipAvailability */
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // 保險：避免空值被 Number(null)=0 偷偷變 0
            if (raw.CSS_CurrentQty == null || raw.CSS_CurrentQty === ('' as any)) {
              this.dataForm.controls.CSS_CurrentQty?.setErrors({ required: true });
              this.dataForm.controls.CSS_CurrentQty?.markAsTouched();
              this.messageService.errorBubble('本日庫存量不可空白');
              return;
            }

            const payload = this.buildDailyInsertPayload(raw);

            this.cpm11030Service
              .insertCPM11030_DailyEquipAvailability(payload)
              .pipe(untilDestroyed(this))
              .subscribe({
                next: (res: any) => {
                  if (res?.IsSuccess === false) {
                    this.messageService.errorBubble(res?.Message ?? '新增失敗');
                    return;
                  }
                  this.messageService.successBubble('新增成功');
                  this.onCancel();
                },
                error: () => this.messageService.errorBubble('新增失敗'),
              });
          }
          break;

        /** Edit：維持原本 updateCPM11030 */
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            const payload = this.buildCpm11030Payload(raw);

            this.cpm11030Service
              .updateCPM11030(payload)
              .pipe(untilDestroyed(this))
              .subscribe({
                next: () => {
                  this.messageService.successBubble('更新成功');
                  this.onCancel();
                },
                error: () => this.messageService.errorBubble('更新失敗'),
              });
          }
          break;
      }
    });
  }

  get isRead(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }
}
