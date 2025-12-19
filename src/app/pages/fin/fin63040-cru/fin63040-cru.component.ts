/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import {
  Fin63040Service,
  QueryFIN63040DetailRow,
  UpdateFIN63040Request,
} from '../../../service/api/fin/fin63040.service';

@UntilDestroy()
@Component({
  selector: 'app-fin63040-cru',
  templateUrl: './fin63040-cru.component.html',
  styleUrls: ['./fin63040-cru.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
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

  pickupTypeOptions = [
    { value: '0', label: '未領' },
    { value: '1', label: '已領' },
    { value: '2', label: '郵寄' },
  ];

  dataForm = this.formBuilder.group({
    // --- 顯示/主鍵 ---
    CheckNo: ['', [Validators.required, Validators.maxLength(10)]],
    VendorNo: [''],
    VEN_Name: [''],

    CompanyAccNo: [''],
    CompanyAccName: [''],

    CheckAmount: [{ value: null as number | null, disabled: true }],
    IssueDate: [{ value: null as Date | null, disabled: true }],
    ExpireDate: [{ value: null as Date | null, disabled: true }],

    OrgId: [''],
    ProjectNo: [''],
    PamNo: [''],

    VoucherNoIssued: [''],
    VouNo_paid: [''], // 已拋轉傳票號碼(明細有)

    // --- ✅ 可更新（對齊 updateFIN63040Request） ---
    CheckTitle: ['', [Validators.required, Validators.maxLength(100)]],
    Remark: ['', [Validators.required, Validators.maxLength(160)]],

    NoEndorseYn: ['' as any, [Validators.required, Validators.maxLength(1)]],
    StatusFlag: ['' as any, [Validators.required, Validators.maxLength(1)]],
    PickupType: ['' as any, [Validators.required, Validators.maxLength(1)]],

    PickupDate: [null as Date | null],
    PayDate: [null as Date | null],
    WithdrawDate: [null as Date | null],
  });

  constructor(
    private fin63040Service: Fin63040Service,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN63040', this.dataForm);

    // 由 query 參數 mode 決定 Read/Edit（你也可改成你們既有 CRUDStatus 流程）
    this.route.queryParams.pipe(untilDestroyed(this)).subscribe((params) => {
      const chkNo = String(params?.['ChkNo'] ?? '').trim();
      const mode = String(params?.['mode'] ?? '').trim().toLowerCase();

      if (mode === 'read') this.crudstatus = CRUDStatus.Read;
      if (mode === 'edit') this.crudstatus = CRUDStatus.Edit;

      this.applyCrudDisabledState();

      if (chkNo) {
        this.dataForm.patchValue({ CheckNo: chkNo }, { emitEvent: false });
        this.loadDetail(chkNo);
      }
    });
  }

  get isRead(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  private applyCrudDisabledState(): void {
    // 先全鎖
    Object.keys(this.dataForm.controls).forEach((k) => {
      this.dataForm.controls[k as keyof typeof this.dataForm.controls].disable({ emitEvent: false });
    });

    // CheckNo 顯示但不可改
    this.dataForm.controls.CheckNo.disable({ emitEvent: false });

    if (this.crudstatus === CRUDStatus.Read) return;
    if (this.crudstatus !== CRUDStatus.Edit) return;

    // Edit：只開放 updateFIN63040Request 相關欄位
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

  private loadDetail(chkNo: string): void {
    this.notificationService.blockUi();
    this.loading = true;

    this.fin63040Service
      .queryFIN63040Detail({ ChkNo: chkNo })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: any) => {
          const d: QueryFIN63040DetailRow =
            (res?.Data?.QueryData ?? null) as any;

          if (!d) {
            this.notificationService.errorBubble('查無明細資料');
            return;
          }

          this.patchFromDetail(d);
          this.applyCrudDisabledState();
        },
        error: () => this.notificationService.errorBubble('查詢明細失敗'),
        complete: () => {
          this.loading = false;
          this.notificationService.unblockUi();
        },
      });
  }

  private patchFromDetail(d: QueryFIN63040DetailRow): void {
    this.dataForm.patchValue(
      {
        CheckNo: d.CheckNo ?? '',
        VendorNo: d.VendorNo ?? '',
        VEN_Name: d.VEN_Name ?? '',

        CompanyAccNo: d.CompanyAccNo ?? '',
        CompanyAccName: d.CompanyAccName ?? '',

        IssueDate: this.parseDate(d.IssueDate),
        ExpireDate: this.parseDate(d.ExpireDate),
        PayDate: this.parseDate(d.PayDate),
        PickupDate: this.parseDate(d.PickupDate),

        CheckAmount: d.CheckAmount ?? null,
        CheckTitle: d.CheckTitle ?? '',

        NoEndorseYn: d.NoEndorseYn ?? '',
        Remark: d.Remark ?? '',

        OrgId: d.OrgId ?? '',
        StatusFlag: d.StatusFlag ?? '',
        PickupType: d.PickupType ?? '',

        ProjectNo: d.ProjectNo ?? '',
        PamNo: d.PamNo ?? '',

        VoucherNoIssued: d.VoucherNoIssued ?? '',
        VouNo_paid: d.VouNo_paid ?? '',
      },
      { emitEvent: false }
    );
  }

  private parseDate(v: any): Date | null {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  private toYMD(d: Date | null): string | null {
    if (!d) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /** ✅ 送出更新（Edit 才允許） */
  onSubmit(form: FormGroup): void {
    if (this.isRead) return;

    this.handleSubmit(form, () => {
      if (this.crudstatus !== CRUDStatus.Edit) {
        this.notificationService.errorBubble('此功能目前僅提供編輯更新');
        return;
      }

      const raw = this.dataForm.getRawValue();

      const payload: UpdateFIN63040Request = {
        CheckNo: String(raw.CheckNo ?? '').trim(),
        CheckTitle: String(raw.CheckTitle ?? '').trim(),
        Remark: String(raw.Remark ?? '').trim(),
        NoEndorseYn: String(raw.NoEndorseYn ?? '').trim(),
        StatusFlag: String(raw.StatusFlag ?? '').trim(),
        PickupType: String(raw.PickupType ?? '').trim(),

        PickupDate: this.toYMD(raw.PickupDate),
        PayDate: this.toYMD(raw.PayDate),
        WithdrawDate: this.toYMD(raw.WithdrawDate),
      };

      if (!payload.CheckNo || !payload.CheckTitle || !payload.Remark) {
        this.notificationService.errorBubble('必填欄位請填寫完整');
        return;
      }

      this.notificationService.blockUi();
      this.loading = true;

      this.fin63040Service
        .updateFIN63040(payload)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (res: any) => {
            // 多數 ApiResponse<bool>：成功會是 ReturnCode=0000
            const ok = res?.ReturnCode === '0000' || res?.Data === true;
            if (!ok) {
              this.notificationService.errorBubble(res?.ReturnMessage ?? '更新失敗');
              return;
            }
            this.notificationService.successBubble('更新成功');
            this.onCancel();
          },
          error: () => this.notificationService.errorBubble('更新失敗'),
          complete: () => {
            this.loading = false;
            this.notificationService.unblockUi();
          },
        });
    });
  }
}
