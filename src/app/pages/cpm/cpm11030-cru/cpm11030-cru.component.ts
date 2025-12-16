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
} from '../../../service/api/cpm/cpm11030.service';

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

  /** ✅ 服務台下拉（HTML 會用到） */
  counterCodeOptions: { value: string; label: string }[] = [
    { value: '11A001', label: '11A001/服務諮詢台' },
    { value: '12A001', label: '12A001/VIP室' },
    { value: '12D001', label: '12D001/總機' },
    { value: '15A001', label: '15A001/顧客服務中心' },
  ];

  dataForm = this.formBuilder.nonNullable.group({
    ID: [null as number | null],

    Loan_No: [{ value: '' as string, disabled: true }], // 後端產生/不可改
    Loan_Date: [null as Date | null, [Validators.required]],
    Loan_Time: [null as Date | null], // 只取時間

    Service_Id: ['' as string, [Validators.required, Validators.maxLength(20)]],
    User_Name: ['' as string, [Validators.required, Validators.maxLength(20)]],
    Loan_Phone: ['' as string, [Validators.maxLength(20)]],
    Loan_USR_No: ['' as string, [Validators.maxLength(20)]],

    Cert_Type: ['' as string, [Validators.maxLength(20)]],
    Cert_No: ['' as string, [Validators.maxLength(20)]],

    Device_ID: ['' as string, [Validators.maxLength(20)]],
    Device_Name: ['' as string, [Validators.maxLength(50)]],
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

    // Create/Edit：可編輯，但 Loan_No 不允許改（後端產生或 Edit 不給改）
    this.dataForm.enable();
    this.dataForm.get('Loan_No')?.disable();

    // Edit：ID 不給改（如果你們 Edit 需要帶 ID）
    if (this.crudstatus === CRUDStatus.Edit) {
      this.dataForm.get('ID')?.disable();
    }
  }

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

  private buildPayload(raw: any): Cpm11030CruPayload {
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
      const payload = this.buildPayload(raw);

      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.cpm11030Service.insertCPM11030(payload).subscribe({
              next: () => {
                this.messageService.successBubble('新增成功');
                this.onCancel();
              },
            });
          }
          break;

        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.cpm11030Service.updateCPM11030(payload).subscribe({
              next: () => {
                this.messageService.successBubble('更新成功');
                this.onCancel();
              },
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
