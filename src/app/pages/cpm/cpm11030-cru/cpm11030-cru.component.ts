/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';

import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import {
  Cpm11030Service,
  DropDownListResponse,
  InsertCPM11030Request,
  OptionItem,
  UpdateCPM11030Request,
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
export class CPM11030CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  readonly CRUD = CRUDStatus;
  /** ✅ 服務中心位置編號下拉 */
  counterCodeOptions: OptionItem[] = [];

  /** ✅ 證件類型下拉 */
  certTypeOptions: OptionItem[] = [];

  /** ✅ 設備名稱下拉 */
  deviceNameOptions: OptionItem[] = [];
  private mapDropDownToOptions(resp: DropDownListResponse | null | undefined): OptionItem[] {
    const rows = Array.isArray(resp?.Data) ? resp!.Data! : [];
    return rows
      .filter(x => x && x.No != null && x.Name != null)
      .map(x => ({
        value: String(x.No).trim(),
        label: `${String(x.No).trim()}-${String(x.Name).trim()}`,
      }));
  }



  /** 出借狀態：1已出借 2已歸還 */
  loanStatusOptions: { value: string; label: string }[] = [
    { value: '1', label: '1-已出借' },
    { value: '2', label: '2-已歸還' },
  ];

  /** 依欄位說明：大多 nullable:true，所以不要全部 required（除非你前端想強制） */
  dataForm = this.formBuilder.group({
    /** Update 用 */
    ID: [null as number | null],

    /** 顯示用（後端產生；單據規則 YY+MM+DD+SSS） */
    Loan_No: [{ value: '' as string, disabled: true }],

    /** nullable:true（你要強制必填可加 Validators.required） */
    Service_Id: ['' as string, [Validators.required, Validators.maxLength(7)]],

    /** 出借日期：string($date-time)（通常必填比較合理，但規格寫 nullable:true 就先不強制） */
    Loan_Date: [null as Date | null, [Validators.required]],

    /** 出借時間：HHMM（nullable:true） */
    Loan_Time: [null as Date | null],

    /** 出借狀態：1/2（nullable:true） */
    Loan_Status: ['1' as string],

    /** 其他欄位皆 nullable:true */
    User_Name: ['' as string, [Validators.maxLength(50)]],
    Cert_Type: ['' as string, [Validators.maxLength(2)]],
    Cert_No: ['' as string, [Validators.maxLength(50)]],
    Loan_Phone: ['' as string, [Validators.maxLength(20)]],
    Device_ID: ['' as string, [Validators.required, Validators.maxLength(50)]],
    Device_Name: ['' as string, [Validators.maxLength(50)]],
  });

  constructor(private cpm11030Service: Cpm11030Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11030', this.dataForm);
    this.updateDisabledState();

    // ✅ 下拉：跟 Query 共用同一份快取（只會真的打一次）
    this.cpm11030Service
      .getDropdownsOnce()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: ({ css1001, sys1000, css2001 }) => {
          this.counterCodeOptions = this.mapDropDownToOptions(css1001);
          this.certTypeOptions = this.mapDropDownToOptions(sys1000);
          this.deviceNameOptions = this.mapDropDownToOptions(css2001);
        },
        error: (err) => {
          console.error('CPM11030 CRU dropdown load error:', err);
          this.counterCodeOptions = [];
          this.certTypeOptions = [];
          this.deviceNameOptions = [];
        },
      });

    // 把 Cert_Type 從「顯示用的 01-身分證」轉成「後端要的代碼 01」
    const certRaw = this.dataForm.get('Cert_Type')?.value as any;
    const certType = certRaw.includes('-')
      ? certRaw.split('-')[0].trim()
      : certRaw.trim();
    this.dataForm.patchValue({ Cert_Type: certType }, { emitEvent: false });

    // ✅ 先把後端/route 帶回來的值正規化成 Date（給 calendar 顯示用）
    const rawDate = this.dataForm.get('Loan_Date')?.value as any;
    const rawTime = this.dataForm.get('Loan_Time')?.value as any;

    const parsedDate = rawDate instanceof Date ? rawDate : rawDate ? new Date(rawDate) : null;
    const parsedTime = rawTime instanceof Date ? rawTime : rawTime ? new Date(rawTime) : null;

    const patch: any = {};
    if (parsedDate && !isNaN(parsedDate.getTime())) patch.Loan_Date = parsedDate;
    if (parsedTime && !isNaN(parsedTime.getTime())) patch.Loan_Time = parsedTime;

    if (Object.keys(patch).length) {
      this.dataForm.patchValue(patch, { emitEvent: false });
    }

    // ✅ Create：預設帶現在日期 + 現在時間（但「已有值就不覆蓋」）
    if (this.crudstatus === CRUDStatus.Create) {
      const now = new Date();

      const curDate = this.dataForm.get('Loan_Date')?.value as any;
      const curTime = this.dataForm.get('Loan_Time')?.value as any;

      const hasDate = curDate instanceof Date && !isNaN(curDate.getTime());
      const hasTime = curTime instanceof Date && !isNaN(curTime.getTime());

      this.dataForm.patchValue(
        {
          Loan_Date: hasDate ? curDate : now,
          Loan_Time: hasTime ? curTime : now,
        },
        { emitEvent: false }
      );
    }
  }



  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Read) {
      if (!this.useReadonlyInsteadOfDisable) this.dataForm.disable();
      return;
    }

    this.dataForm.enable();

    // Loan_No 永遠不給改（顯示用）
    this.dataForm.get('Loan_No')?.disable();

    // Edit：ID 通常不給改（但仍需送出）
    if (this.crudstatus === CRUDStatus.Edit) {
      this.dataForm.get('ID')?.disable();
    }
  }

  /** Loan_Date：送本地日期 ISO datetime（不帶 Z，避免 UTC 時區偏移） */
  private toIso(d: Date | null | undefined): string {
    const dt = d instanceof Date ? d : new Date();
    const yyyy = dt.getFullYear();
    const MM = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${MM}-${dd}`;
  }

  /** Loan_Time：依規格送 HHMM（不是 HH:mm:ss） */
  private toHHMM(t: Date | null | undefined): string {
    if (!(t instanceof Date)) return '';
    const hh = String(t.getHours()).padStart(2, '0');
    const mm = String(t.getMinutes()).padStart(2, '0');
    return `${hh}${mm}`;
  }

  private trimOrEmpty(v: any): string {
    return (v ?? '').toString().trim();
  }

  private buildInsertPayload(raw: any): InsertCPM11030Request {
    const deviceId = this.trimOrEmpty(raw.Device_ID);
    const deviceName =
      this.deviceNameOptions.find(o => o.value === deviceId)?.label
        ?.split('-')
        .slice(1)
        .join('-') || '';

    return {
      Service_Id: this.trimOrEmpty(raw.Service_Id),
      Loan_Date: raw.Loan_Date ? this.toIso(raw.Loan_Date) : '', // nullable:true，但 DTO 是 string：沒值就送空字串
      Loan_Time: raw.Loan_Time ? this.toHHMM(raw.Loan_Time) : '',
      Loan_Status: this.trimOrEmpty(raw.Loan_Status),

      User_Name: this.trimOrEmpty(raw.User_Name),
      Cert_Type: this.trimOrEmpty(raw.Cert_Type),
      Cert_No: this.trimOrEmpty(raw.Cert_No),
      Loan_Phone: this.trimOrEmpty(raw.Loan_Phone),

      Device_ID: deviceId ?? '',
      Device_Name: deviceName ?? '',
    };
  }

  private buildUpdatePayload(raw: any): UpdateCPM11030Request {
    const deviceId = this.trimOrEmpty(raw.Device_ID);
    const deviceName =
      this.deviceNameOptions.find(o => o.value === deviceId)?.label
        ?.split('-')
        .slice(1)
        .join('-') || '';

    return {
      ID: Number(raw.ID ?? 0),
      Loan_No: this.trimOrEmpty(raw.Loan_No),

      Service_Id: this.trimOrEmpty(raw.Service_Id),
      Loan_Date: raw.Loan_Date ? this.toIso(raw.Loan_Date) : '',
      Loan_Time: raw.Loan_Time ? this.toHHMM(raw.Loan_Time) : '',
      Loan_Status: this.trimOrEmpty(raw.Loan_Status),

      User_Name: this.trimOrEmpty(raw.User_Name),
      Cert_Type: this.trimOrEmpty(raw.Cert_Type),
      Cert_No: this.trimOrEmpty(raw.Cert_No),
      Loan_Phone: this.trimOrEmpty(raw.Loan_Phone),

      Device_ID: deviceId ?? '',
      Device_Name: deviceName ?? '',
    };
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();

      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (!this.canAdd()) return;

          this.cpm11030Service
            .insertCPM11030(this.buildInsertPayload(raw))
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
          break;

        case CRUDStatus.Edit:
          if (!this.canEdit()) return;

          this.cpm11030Service
            .updateCPM11030(this.buildUpdatePayload(raw))
            .pipe(untilDestroyed(this))
            .subscribe({
              next: (res: any) => {
                if (res?.IsSuccess === false) {
                  this.messageService.errorBubble(res?.Message ?? '更新失敗');
                  return;
                }
                this.messageService.successBubble('更新成功');
                this.onCancel();
              },
              error: () => this.messageService.errorBubble('更新失敗'),
            });
          break;
      }
    });
  }

  get isRead(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }
}
