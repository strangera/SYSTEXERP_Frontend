import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11070Service } from '@service/api/ass/ass11070.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { NotificationService } from '@shared/components/notification-message/notification.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import {
  DetailASS11070Response,
  InsertASS11070Request,
  QueryASS11070Response,
  UpdateASS11070Request,
} from '../ass11070/ass11070.model';

// 3.1.1.7 備用供應商資料維護作業 CRU
@Component({
  selector: 'app-ass11070-cru',
  templateUrl: './ass11070-cru.component.html',
  standalone: true,
  imports: [
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    RadiobuttonComponent,
  ],
})
export class ASS11070CRUComponent extends BasicCruPageComponent<QueryASS11070Response> implements OnInit {
  public readonly dataForm = this.formBuilder.nonNullable.group({
    prStaffId: new FormControl<string>('', [Validators.required, Validators.maxLength(20)]),
    vendorId: new FormControl<string>('', [Validators.required, Validators.maxLength(20)]),
    crtDate: new FormControl<string>('', [Validators.required, Validators.maxLength(10)]),
    mangerType: new FormControl<string>('', [Validators.maxLength(20)]),
    vendorName: new FormControl<string>('', [Validators.required, Validators.maxLength(60)]),
    vendorNameE: new FormControl<string>('', [Validators.maxLength(60)]),
    contactStaff: new FormControl<string>('', [Validators.required, Validators.maxLength(60)]),
    contactTel: new FormControl<string>('', [Validators.required, Validators.maxLength(15)]),
    contactTitle: new FormControl<string>('', [Validators.maxLength(60)]),
    contactFax: new FormControl<string>('', [Validators.maxLength(60)]),
    contactMobilePhone: new FormControl<string>('', [Validators.maxLength(10)]),
    contactEmail: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]),
    companyAddress: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]),
    chargeStaff: new FormControl<string>('', [Validators.maxLength(60)]),
    payType: new FormControl<string>('', [Validators.maxLength(20)]),
    ticketPeriod: new FormControl<string>('', [Validators.maxLength(30), Validators.pattern('^[0-9]+$')]),
    serviceItems: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]),
    notes: new FormControl<string>('', [Validators.maxLength(100)]),
    // Key fields are kept internally for detail/update payload.
    stoNo: new FormControl<string>('', [Validators.maxLength(20)]),
  });
  public readonly df = computed(() => this.dataForm.controls);
  public readonly staffOptions = signal<{ label: string; value: string; name: string }[]>([]);
  public readonly vendorOptions = signal<{ label: string; value: string }[]>([]);
  public readonly mangerTypeOptions = [
    { value: '1', label: '工廠直銷' },
    { value: '2', label: '代理商' },
    { value: '3', label: '經銷商' },
    { value: '4', label: '零售連鎖' },
    { value: '5', label: '零售一般' },
  ];
  public readonly payTypeOptions = [
    { value: '1', label: '電匯' },
    { value: '2', label: '支票' },
    { value: '3', label: '現金' },
  ];

  constructor(
    public readonly service: ASS11070Service,
    private readonly dropDownListService: DropDownListService,
    private readonly notification: NotificationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11070', this.dataForm);
    this.loadDropdownOptions();
    if (this.isFormCreateable) {
      this.dataForm.patchValue({ crtDate: this.getTodayDateString() });
    }
    if (!this.isFormCreateable && this.rowdata) {
      const row = this.rowdata as QueryASS11070Response;
      if (row.VENDOR_ID) {
        this.loadDetail(row.VENDOR_ID);
      }
    }
  }

  private loadDropdownOptions(): void {
    this.dropDownListService.queryTBLUSER_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = (res.Data ?? []).map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
          name: item.Name,
        }));
        this.staffOptions.set(options);
      },
    });

    this.dropDownListService.queryPOS2013_DropDownList({}).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = (res.Data ?? []).map(item => ({
          label: `${item.VEN_No} - ${item.Name}`,
          value: item.VEN_No ?? '',
        }));
        this.vendorOptions.set(options);
      },
    });
  }

  private resolveStaffName(staffId: string | null): string | undefined {
    if (!staffId) return undefined;
    return this.staffOptions().find(option => option.value === staffId)?.name;
  }

  private getTodayDateString(): string {
    const now = new Date();
    return this.toDateString(now);
  }

  private toDateString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private normalizeDateString(dateText?: unknown): string {
    if (dateText == null) return '';
    if (dateText instanceof Date) return isNaN(dateText.getTime()) ? '' : this.toDateString(dateText);

    const rawText = typeof dateText === 'string' ? dateText : String(dateText);
    const normalized = rawText.trim().replace(/\//g, '-');
    if (!normalized) return '';

    const matchedDate = normalized.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (matchedDate) return matchedDate;

    const parsed = new Date(normalized);
    if (!isNaN(parsed.getTime())) return this.toDateString(parsed);
    return normalized;
  }

  private buildDetailLikePayload(): DetailASS11070Response {
    const raw = this.dataForm.getRawValue();
    return {
      STO_NO: raw.stoNo ?? '',
      CRT_Date: raw.crtDate || undefined,
      VENDOR_ID: raw.vendorId ?? '',
      VENDOR_NAME: raw.vendorName || undefined,
      VENDOR_NAME_E: raw.vendorNameE || undefined,
      PR_STAFF_ID: raw.prStaffId || undefined,
      PR_STAFF_NAME: this.resolveStaffName(raw.prStaffId ?? null),
      CONTACT_STAFF: raw.contactStaff || undefined,
      CONTACT_TITLE: raw.contactTitle || undefined,
      CONTACT_TEL: raw.contactTel || undefined,
      CONTACT_MOBILE_PHONE: raw.contactMobilePhone || undefined,
      CONTACT_EMAIL: raw.contactEmail || undefined,
      CONTACT_FAX: raw.contactFax || undefined,
      CHARGE_STAFF: raw.chargeStaff || undefined,
      VENDOR_REG_ADDR: raw.companyAddress || undefined,
      PAY_TYPE: raw.payType || undefined,
      MANGER_TYPE: raw.mangerType || undefined,
      TICKET_PERIOD: raw.ticketPeriod?.trim() || undefined,
      Service_Items: raw.serviceItems || undefined,
      NOTES: raw.notes || undefined,
    };
  }

  private patchFormWithDetail(detail: DetailASS11070Response): void {
    this.dataForm.patchValue({
      stoNo: detail.STO_NO ?? '',
      crtDate: this.normalizeDateString(detail.CRT_Date),
      vendorId: detail.VENDOR_ID ?? '',
      vendorName: detail.VENDOR_NAME ?? '',
      vendorNameE: detail.VENDOR_NAME_E ?? '',
      prStaffId: detail.PR_STAFF_ID ?? '',
      contactStaff: detail.CONTACT_STAFF ?? '',
      contactTitle: detail.CONTACT_TITLE ?? '',
      contactTel: detail.CONTACT_TEL ?? '',
      contactMobilePhone: detail.CONTACT_MOBILE_PHONE ?? '',
      contactEmail: detail.CONTACT_EMAIL ?? '',
      contactFax: detail.CONTACT_FAX ?? '',
      chargeStaff: detail.CHARGE_STAFF ?? '',
      companyAddress: detail.VENDOR_REG_ADDR ?? '',
      payType: detail.PAY_TYPE ?? '',
      mangerType: detail.MANGER_TYPE ?? '',
      ticketPeriod: detail.TICKET_PERIOD ?? '',
      serviceItems: detail.Service_Items ?? '',
      notes: detail.NOTES ?? '',
    });
  }

  private loadDetail(vendorId: string): void {
    this.loading = true;
    this.service
      .detailASS11070({
        VENDOR_ID: vendorId,
      })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: res => {
          if (res.Status !== '0000' || !res.Data) return;
          this.patchFormWithDetail(res.Data);
        },
      });
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const payload = this.buildDetailLikePayload();

      if (this.isFormCreateable) {
        this.service
          .insertASS11070(payload as InsertASS11070Request)
          .pipe(
            finalize(() => {
              this.loading = false;
            })
          )
          .subscribe({
            next: res => {
              if (res.Status !== '0000') return;
              this.notification.successBubble('新增成功');
              this.onCancel();
            },
          });
        return;
      }

      this.service
        .updateASS11070(payload as UpdateASS11070Request)
        .pipe(
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.notification.successBubble('更新成功');
            this.onCancel();
          },
        });
    });
  }

  override onCancel(): void {
    super.onCancel();
  }
}
