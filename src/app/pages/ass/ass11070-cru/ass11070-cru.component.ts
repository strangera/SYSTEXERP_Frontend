import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11070Service } from '@service/api/ass/ass11070.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { ASS11070Data, ASS11070InsertRequest, ASS11070UpdateRequest } from '../ass11070/ass11070.model';

// 3.1.1.7 備用供應商資料維護作業 CRU
@Component({
  selector: 'app-ass11070-cru',
  templateUrl: './ass11070-cru.component.html',
  styleUrl: './ass11070-cru.component.scss',
  standalone: true,
  imports: [
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    CalendarComponent,
    InputTextComponent,
    InputTextRangeComponent,
    RadiobuttonComponent,
  ],
})
export class ASS11070CRUComponent extends BasicCruPageComponent<ASS11070Data> implements OnInit {
  public readonly dataForm = this.formBuilder.nonNullable.group({
    buildDate: new FormControl<Date | null>(null, [Validators.required]),
    receptionPerson: new FormControl<string>('', [Validators.required]),
    vendorUID: new FormControl<string>('', [Validators.required]),
    bussinessModel: new FormControl<number | null>(null),
    vendorCName: new FormControl<string>('', [Validators.required, Validators.maxLength(60)]),
    vendorEName: new FormControl<string>('', [Validators.maxLength(60)]),
    contactPerson: new FormControl<string>('', [Validators.required, Validators.maxLength(60)]),
    contactPhone: new FormControl<string>('', [Validators.required, Validators.maxLength(15)]),
    contactTitle: new FormControl<string>('', [Validators.maxLength(60)]),
    contactFax: new FormControl<string>('', [Validators.maxLength(60)]),
    contactCellphone: new FormControl<string>('', [Validators.maxLength(10)]),
    contactEmail: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]),
    companyAddress: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]),
    companyResponsibility: new FormControl<string>('', [Validators.maxLength(60)]),
    paymentMethod: new FormControl<number | null>(null),
    ticketPeriodStart: new FormControl<string | null>(null),
    ticketPeriodEnd: new FormControl<string | null>(null),
    services: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]),
    remark: new FormControl<string>('', [Validators.maxLength(100)]),
  });
  public readonly df = computed(() => this.dataForm.controls);
  public readonly tableLoading = signal<boolean>(false);

  public readonly bussinessOptions: { value: number; label: string }[] = [
    { value: 1, label: '工廠直銷' },
    { value: 2, label: '代理商' },
    { value: 3, label: '經銷商' },
    { value: 4, label: '零售連鎖' },
    { value: 5, label: '零售一般' },
  ];
  public readonly paymentMethodOptions: { value: number; label: string }[] = [
    { value: 1, label: '電匯' },
    { value: 2, label: '開票' },
    { value: 3, label: '現金' },
  ];

  constructor(
    public readonly service: ASS11070Service,
    private readonly notification: NotificationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11070', this.dataForm);
  }

  private toDateString(d: Date | null): string | undefined {
    if (!d || !(d instanceof Date) || isNaN(d.getTime())) return undefined;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const raw = this.dataForm.getRawValue();
      this.tableLoading.set(true);

      if (this.isFormCreateable) {
        const insertPayload: ASS11070InsertRequest = {
          BuildDate: this.toDateString(raw.buildDate ?? null),
          ReceptionPerson: raw.receptionPerson ?? undefined,
          VendorUID: raw.vendorUID ?? undefined,
          BussinessModel: raw.bussinessModel ?? undefined,
          VendorCName: raw.vendorCName ?? undefined,
          VendorEName: raw.vendorEName || undefined,
          ContactPerson: raw.contactPerson ?? undefined,
          ContactPhone: raw.contactPhone ?? undefined,
          ContactTitle: raw.contactTitle || undefined,
          ContactFax: raw.contactFax || undefined,
          ContactCellphone: raw.contactCellphone || undefined,
          ContactEmail: raw.contactEmail ?? undefined,
          CompanyAddress: raw.companyAddress ?? undefined,
          CompanyResponsibility: raw.companyResponsibility || undefined,
          PaymentMethod: raw.paymentMethod ?? undefined,
          TicketPeriodStart: raw.ticketPeriodStart ?? undefined,
          TicketPeriodEnd: raw.ticketPeriodEnd ?? undefined,
          Services: raw.services ?? undefined,
          Remark: raw.remark || undefined,
        };
        this.service.insertASS11070(insertPayload).pipe(
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          }),
        ).subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.notification.successBubble('新增成功');
            this.onCancel();
          },
        });
      } else {
        const updatePayload: ASS11070UpdateRequest = {
          VendorID: this.rowdata?.VendorID,
          BuildDate: this.toDateString(raw.buildDate ?? null),
          ReceptionPerson: raw.receptionPerson ?? undefined,
          VendorUID: raw.vendorUID ?? undefined,
          BussinessModel: raw.bussinessModel ?? undefined,
          VendorCName: raw.vendorCName ?? undefined,
          VendorEName: raw.vendorEName || undefined,
          ContactPerson: raw.contactPerson ?? undefined,
          ContactPhone: raw.contactPhone ?? undefined,
          ContactTitle: raw.contactTitle || undefined,
          ContactFax: raw.contactFax || undefined,
          ContactCellphone: raw.contactCellphone || undefined,
          ContactEmail: raw.contactEmail ?? undefined,
          CompanyAddress: raw.companyAddress ?? undefined,
          CompanyResponsibility: raw.companyResponsibility || undefined,
          PaymentMethod: raw.paymentMethod ?? undefined,
          TicketPeriodStart: raw.ticketPeriodStart ?? undefined,
          TicketPeriodEnd: raw.ticketPeriodEnd ?? undefined,
          Services: raw.services ?? undefined,
          Remark: raw.remark || undefined,
        };
        this.service.updateASS11070(updatePayload).pipe(
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          }),
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

  override onCancel(): void {
    super.onCancel();
  }
}
