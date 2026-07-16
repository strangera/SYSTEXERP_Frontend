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

import { DropDownListService } from '@service/utility/dropDownList.service';

import { Fin63020DetailRow, Fin63020Service, Fin63020UpdateRequest } from '../../../service/api/fin/fin63020.service';

@UntilDestroy()
@Component({
  selector: 'app-fin63040-cru',
  templateUrl: './fin63040-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
  ],
})
export class FIN63040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  readonly CRUD = CRUDStatus;
  override loading = false;

  endorsementProhibitedOptions = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  statusOptions = [
    { value: '1', label: '確認' },
    { value: '2', label: '拋轉' },
  ];

  checkStatusOptions = [
    { value: '2', label: '到期' },
    { value: '3', label: '兌現' },
  ];

  pickupTypeOptions = [
    { value: '0', label: '未領' },
    { value: '1', label: '已領' },
    { value: '2', label: '郵寄' },
  ];

  organizationCodeOptions: any[] = [];

  dataForm = this.formBuilder.group({
    CheckNo: ['', [Validators.required, Validators.maxLength(10)]],
    VendorNo: [''],
    VEN_Name: [''],
    CompanyAccNo: [''],
    CompanyAccName: [''],
    IssueDate: [{ value: null as Date | null, disabled: true }],
    ExpireDate: [{ value: null as Date | null, disabled: true }],
    CheckAmount: [{ value: null as number | null, disabled: true }],
    OrgId: [''],
    ProjectNo: [''],
    PamNo: [''],
    VoucherNoIssued: [''],
    VouNo_paid: [''],
    CheckTitle: ['', [Validators.required, Validators.maxLength(100)]],
    Remark: ['', [Validators.maxLength(160)]],
    CompanyAccDisplay: [{ value: '', disabled: true }],
    NoEndorseYn: ['' as any, [Validators.required, Validators.maxLength(1)]],
    StatusFlag: ['' as any, [Validators.required, Validators.maxLength(1)]],
    PickupType: ['' as any, [Validators.required, Validators.maxLength(1)]],
    PickupDate: [null as Date | null],
    PayDate: [null as Date | null],
    WithdrawDate: [null as Date | null],
    CheckStatus: [{ value: '' as any, disabled: true }],
  });

  private _checkStatus = '';
  private _payDate = '';

  constructor(
    private fin63020Service: Fin63020Service,
    private route: ActivatedRoute,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN63040', this.dataForm);

    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.organizationCodeOptions = (res?.Data ?? []).map((item: any) => ({
          ...item,
          value: item.No,
          label: `${item.No} - ${item.Name}`,
        }));
      });

    this.applyCrudDisabledState();

    this.route.queryParams
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        const chkNo = String(params?.['ChkNo'] ?? '').trim();
        if (!chkNo) return;

        this.dataForm.patchValue({ CheckNo: chkNo }, { emitEvent: false });
        this.loadDetail(chkNo);
      });
  }

  private applyCrudDisabledState(): void {
    Object.keys(this.dataForm.controls).forEach((k) => {
      this.dataForm.controls[k as keyof typeof this.dataForm.controls].disable({ emitEvent: false });
    });

    this.dataForm.controls.CheckNo.disable({ emitEvent: false });
    this.dataForm.controls.CheckStatus.disable({ emitEvent: false });
    this.dataForm.controls.CompanyAccDisplay.disable({ emitEvent: false });

    const checkStatus = String(this._checkStatus ?? '').trim();
    const payDate = String(this._payDate ?? '').trim();

    const forbidEdit = checkStatus === '3' || !!payDate;
    if (forbidEdit) return;

    if (this.crudstatus === CRUDStatus.Read) return;
    if (this.crudstatus === CRUDStatus.Create) return;

    if (this.crudstatus === CRUDStatus.Edit) {
      const editableKeys: (keyof typeof this.dataForm.controls)[] = [
        'CheckTitle',
        'Remark',
        'NoEndorseYn',
        'StatusFlag',
        'PickupType',
        'PickupDate',
        'PayDate',
        'WithdrawDate',
      ];
      editableKeys.forEach((k) => this.dataForm.controls[k].enable({ emitEvent: false }));
    }
  }

  private loadDetail(chkNo: string): void {
    this.messageService.blockUi();
    this.loading = true;

    this.fin63020Service
      .queryFIN63020Detail({ ChkNo: chkNo })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: any) => {
          const d: Fin63020DetailRow = res?.Data?.QueryData ?? res?.Data ?? res ?? ({} as any);

          this.patchFromDetail(d);

          this._checkStatus = String((d as any).CheckStatus ?? '').trim();
          this._payDate = String((d as any).PayDate ?? '').trim();

          this.applyCrudDisabledState();
        },
        error: () => {
          this.messageService.errorBubble('查詢明細失敗');
          this.applyCrudDisabledState();
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
  }

  private patchFromDetail(d: Fin63020DetailRow): void {
    this.dataForm.patchValue(
      {
        CheckNo: (d as any).CheckNo ?? '',
        VendorNo: (d as any).VendorNo ?? '',
        VEN_Name: (d as any).VEN_Name ?? '',
        CompanyAccNo: (d as any).CompanyAccNo ?? '',
        CompanyAccName: (d as any).CompanyAccName ?? '',
        IssueDate: this.parseDate((d as any).IssueDate),
        ExpireDate: this.parseDate((d as any).ExpireDate),
        PayDate: this.parseDate((d as any).PayDate),
        PickupDate: this.parseDate((d as any).PickupDate),
        WithdrawDate: this.parseDate((d as any).WithdrawDate),
        CompanyAccDisplay: (() => {
          const no = String((d as any).CompanyAccNo ?? '').trim();
          const name = String((d as any).CompanyAccName ?? '').trim();
          if (!no && !name) return '';
          return name ? `${no}-${name}` : no;
        })(),
        CheckAmount: (d as any).CheckAmount ?? null,
        CheckTitle: (d as any).CheckTitle ?? '',
        NoEndorseYn: (d as any).NoEndorseYn ?? '',
        Remark: (d as any).Remark ?? '',
        OrgId: String((d as any).OrgId ?? '').trim(),
        StatusFlag: (d as any).StatusFlag ?? '',
        CheckStatus: String((d as any).CheckStatus ?? '').trim(),
        PickupType: (d as any).PickupType ?? '',
        ProjectNo: (d as any).ProjectNo ?? '',
        PamNo: (d as any).PamNo ?? '',
        VoucherNoIssued: (d as any).VoucherNoIssued ?? '',
        VouNo_paid: (d as any).VouNo_paid ?? '',
      },
      { emitEvent: false }
    );
  }

  private parseDate(v: any): Date | null {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  onSubmit(form: FormGroup): void {
    if (this.isRead) return;

    this.handleSubmit(form, () => {
      if (this.crudstatus !== CRUDStatus.Edit) {
        this.messageService.errorBubble('此功能目前僅提供編輯更新');
        return;
      }

      const checkStatus = String(this._checkStatus ?? '').trim();
      const payDate = String(this._payDate ?? '').trim();
      if (checkStatus === '3' || !!payDate) {
        this.messageService.errorBubble('此票據已兌現，禁止修改');
        return;
      }

      const raw = this.dataForm.getRawValue();
      const remark = String(raw.Remark ?? '').trim();

      const payload: Fin63020UpdateRequest = {
        CheckNo: String(raw.CheckNo ?? '').trim(),
        CheckTitle: String(raw.CheckTitle ?? '').trim(),
        ...(remark ? { Remark: remark } : {}),
        NoEndorseYn: raw.NoEndorseYn as any,
        StatusFlag: raw.StatusFlag as any,
        PickupType: raw.PickupType as any,
        PickupDate: raw.PickupDate ? this.toYMD(raw.PickupDate) : null,
        PayDate: raw.PayDate ? this.toYMD(raw.PayDate) : null,
        WithdrawDate: raw.WithdrawDate ? this.toYMD(raw.WithdrawDate) : null,
      };

      if (!payload['CheckNo'] || !payload['CheckTitle'] || !payload['NoEndorseYn'] || !payload['StatusFlag'] || !payload['PickupType']) {
        this.messageService.errorBubble('必填欄位請填寫完整');
        return;
      }

      this.messageService.blockUi();
      this.loading = true;

      this.fin63020Service
        .updateFIN63020(payload)
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
          complete: () => {
            this.loading = false;
            this.messageService.unblockUi();
          },
        });
    });
  }

  get isRead(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  private toYMD(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  override onCancel(): void {
    this.router.navigate(['/account/fin', 'fin63040'], { state: { fromCru: true } });
  }
}
