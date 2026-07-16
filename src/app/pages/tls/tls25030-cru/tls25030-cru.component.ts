/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';

import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from './../../../service/utility/dropdown-api.service';

import {
  ApiResponse,
  OptionItem,
  QueryTLS25030DetailResponse,
  TLS25030Service,
} from '../../../service/api/tls/tls25030.service';


@UntilDestroy()
@Component({
  selector: 'app-tls25030-cru',
  templateUrl: './tls25030-cru.component.html',
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
export class TLS25030CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  readonly CRUD = CRUDStatus;
  CounterOptions: OptionItem[] = [];

  // ✅ 下拉 options
  violationTypeOptions: OptionItem[] = getSYS1000Options('Violation_type') as any;
  capItemOptions: OptionItem[] = [];
  orgOptions: OptionItem[] = [];
  payTypeOptions: OptionItem[] = [
    { value: '1', label: '1-扣款' },
    { value: '2', label: '2-現金' },
    { value: '9', label: '9-其他' },
  ];

  dataForm = this.formBuilder.group({
    fine_no: [{ value: '' as string, disabled: true }],
    ID: [null as number | null],

    tlt_no: ['' as string, [Validators.required, Validators.maxLength(12)]],
    talent_id: [null as number | null],
    org_id: ['' as string, [Validators.required, Validators.maxLength(20)]],
    fine_date: [null as Date | null, [Validators.required]],
    fine_amount: [null as number | null, [Validators.required]],
    Violation_type: ['' as string, [Validators.required, Validators.maxLength(1)]],
    pay_type: ['' as string, [Validators.required, Validators.maxLength(1)]],
    deduct_date: [null as Date | null, [Validators.required]],

    Violation_Facts: ['' as string],
    violation_otherdesc: ['' as string],
    pay_otherdesc: ['' as string],
  });

  constructor(
    private tls25030Service: TLS25030Service,
    private dropdown: DropdownApiService,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS25030', this.dataForm);
    this.updateDisabledState();
    // 2) Counter
    this.dropdown
      .queryTltTalentAllowed({ ProgNo: this.ProgNo })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (v) => {
          this.CounterOptions = (v || []).map((x) => ({
            label: x.label,
            formLabel: `${x.label}`,
            value: x.value,
          }));
        },
        error: () => (this.CounterOptions = []),
      });

    // ✅ 1) orgOptions（SYS3100）
    this.dropdown
      .querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (opts: any) => (this.orgOptions = Array.isArray(opts) ? opts : []),
        error: () => (this.orgOptions = []),
      });

    // ✅ 2) capItemOptions（APS1003）
    this.dropdown
      .queryAps1003({ cap_typeList: ['Z'] })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (list) => {
          this.capItemOptions = (list || []).map((x: any) => ({
            value: String(x.value),
            label: x.label,
          }));
        },
        error: () => (this.capItemOptions = []),
      });



    // ✅ 4) Edit/Read：抓 fine_no -> detail
    this.route.queryParamMap
      .pipe(untilDestroyed(this))
      .subscribe((pm) => {
        const fineNo = (pm.get('fine_no') ?? '').trim();
        if (fineNo && this.crudstatus !== CRUDStatus.Create) {
          this.loadDetail(fineNo);
        }
      });
  }

  private mapDropDownToOptions(resp: any): OptionItem[] {
    const rows = Array.isArray(resp?.Data) ? resp.Data : [];
    return rows
      .filter((x: any) => x && x.No != null && x.Name != null)
      .map((x: any) => ({
        value: String(x.No).trim(),
        label: `${String(x.No).trim()}-${String(x.Name).trim()}`,
      }));
  }

  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Read) {
      if (!this.useReadonlyInsteadOfDisable) this.dataForm.disable();
      return;
    }
    this.dataForm.enable();
    this.dataForm.get('fine_no')?.disable();
  }

  private toIso(d: Date | null | undefined): string {
    const dt = d instanceof Date ? d : new Date();
    return dt.toISOString();
  }

  private trim(v: any): string {
    return String(v ?? '').trim();
  }

  private loadDetail(fineNo: string) {
    this.loading = true;

    this.tls25030Service
      .queryTLS25030Detail({ fine_no: fineNo })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<QueryTLS25030DetailResponse>) => {
          const d = (res as any)?.Data as QueryTLS25030DetailResponse | null | undefined;
          if (!d) {
            this.messageService.errorBubble('查無明細');
            this.loading = false;
            return;
          }

          const fineDate = d.fine_date ? new Date(d.fine_date) : null;
          const deductDate = d.deduct_date ? new Date(d.deduct_date) : null;

          this.dataForm.patchValue(
            {
              fine_no: d.fine_no ?? '',
              ID: (d as any).ID ?? null,
              tlt_no: d.tlt_no ?? '',
              talent_id: d.talent_id ? Number(d.talent_id) : null,
              org_id: d.org_id ?? '',
              fine_date: fineDate && !isNaN(fineDate.getTime()) ? fineDate : null,
              fine_amount: d.fine_amount != null ? Number(d.fine_amount) : null,
              Violation_type: d.Violation_type ?? '',
              pay_type: d.pay_type ?? '',
              deduct_date: deductDate && !isNaN(deductDate.getTime()) ? deductDate : null,
              Violation_Facts: d.Violation_Facts ?? '',
              violation_otherdesc: d.violation_otherdesc ?? '',
              pay_otherdesc: d.pay_otherdesc ?? '',
            },
            { emitEvent: false }
          );

          this.loading = false;
        },
        error: (err) => {
          console.error('queryTLS25030Detail error:', err);
          this.loading = false;
          this.messageService.errorBubble('載入明細失敗');
        },
      });
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();

      if (this.crudstatus === CRUDStatus.Create) {
        if (!this.canAdd()) return;

        const payload = {
          tlt_no: this.trim(raw.tlt_no),
          talent_id: Number(raw.talent_id ?? 0),
          org_id: this.trim(raw.org_id),
          fine_date: this.toIso(raw.fine_date),
          fine_amount: Number(raw.fine_amount ?? 0),
          Violation_type: this.trim(raw.Violation_type),
          pay_type: this.trim(raw.pay_type),
          deduct_date: this.toIso(raw.deduct_date),
          Violation_Facts: this.trim(raw.Violation_Facts) || undefined,
          violation_otherdesc: this.trim(raw.violation_otherdesc) || undefined,
          pay_otherdesc: this.trim(raw.pay_otherdesc) || undefined,
        };

        this.tls25030Service
          .insertTLS25030(payload as any)
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
        return;
      }

      if (this.crudstatus === CRUDStatus.Edit) {
        if (!this.canEdit()) return;

        const fineNo = this.trim(this.dataForm.get('fine_no')?.value ?? raw.fine_no);
        if (!fineNo) {
          this.messageService.errorBubble('缺少 fine_no');
          return;
        }

        const payload = {
          fine_no: fineNo,
          Violation_type: this.trim(raw.Violation_type),
          pay_type: this.trim(raw.pay_type),
          deduct_date: this.toIso(raw.deduct_date),
          Violation_Facts: this.trim(raw.Violation_Facts) || undefined,
          violation_otherdesc: this.trim(raw.violation_otherdesc) || undefined,
          pay_otherdesc: this.trim(raw.pay_otherdesc) || undefined,
        };

        this.tls25030Service
          .updateTLS25030(payload as any)
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
      }
    });
  }
  override onCancel(): void {
    this.router.navigate(['/account/tls', 'tls25030'], {
      state: { fromCru: true },
    });
  }
  goBack(): void {
    this.router.navigate(['/account/tls', 'tls25030'], {
      state: { fromCru: true },
    });
  }
  get isRead(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }
}
