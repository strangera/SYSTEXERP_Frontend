/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgIf } from '@angular/common';
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

import {
  Fin63020Service,
  Fin63020DetailRow,
  Fin63020UpdateRequest,
} from '../../../service/api/fin/fin63020.service';

@UntilDestroy()
@Component({
  selector: 'app-fin63020-cru',
  templateUrl: './fin63020-cru.component.html',
  styleUrls: ['./fin63020-cru.component.scss'],
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
export class FIN63020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  readonly CRUD = CRUDStatus;
  override loading = false;

  // ✅ Dropdown options
  endorsementProhibitedOptions = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  statusOptions = [
    { value: '1', label: '確認' },
    { value: '2', label: '拋轉' },
  ];

  billStatusOptions = [
    { value: '2', label: '到期' },
    { value: '3', label: '兌現' },
    { value: '0', label: '作廢' },
    { value: '1', label: '未異動' },
    { value: '4', label: '撤票' },
    { value: '5', label: '退票' },
  ];

  pickupTypeOptions = [
    { value: '0', label: '未領' },
    { value: '1', label: '已領' },
    { value: '2', label: '郵寄' },
  ];

  // ✅ 表單（顯示欄位 + 可更新欄位）
  dataForm = this.formBuilder.group({
    // --- 顯示用(多數不可改) ---
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

    // --- ✅ 可更新欄位（依 Swagger updateFIN63020Request）---
    CheckTitle: ['', [Validators.required, Validators.maxLength(100)]],
    Remark: ['', [Validators.required, Validators.maxLength(160)]],

    NoEndorseYn: ['' as any, [Validators.required, Validators.maxLength(1)]],
    StatusFlag: ['' as any, [Validators.required, Validators.maxLength(1)]],
    PickupType: ['' as any, [Validators.required, Validators.maxLength(1)]],

    PickupDate: [null as Date | null],     // nullable
    PayDate: [null as Date | null],        // nullable
    WithdrawDate: [null as Date | null],   // nullable

    // 顯示用：票據狀態/狀態（如果你仍要顯示，可保留）
    CheckStatus: [{ value: '', disabled: true }],
  });

  constructor(
    private fin63020Service: Fin63020Service,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN63020', this.dataForm);

    // ✅ Read 模式：整張表單不可改
    // ✅ Edit 模式：只開放指定欄位；其餘 disabled
    this.applyCrudDisabledState();

    // ✅ 從 Query 頁帶過來 ?ChkNo=
    this.route.queryParams
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        const chkNo = String(params?.['ChkNo'] ?? '').trim();
        if (!chkNo) return;

        this.dataForm.patchValue({ CheckNo: chkNo }, { emitEvent: false });
        this.loadDetail(chkNo);
      });
  }

  /** ✅ 依 CRUDStatus 套用可編輯欄位 */
  private applyCrudDisabledState(): void {
    // 先全部 disable（避免漏網）
    Object.keys(this.dataForm.controls).forEach((k) => {
      this.dataForm.controls[k as keyof typeof this.dataForm.controls].disable({ emitEvent: false });
    });

    // CheckNo 永遠不給改，但要顯示
    this.dataForm.controls.CheckNo.disable({ emitEvent: false });

    // Read：全部不開
    if (this.crudstatus === CRUDStatus.Read) return;

    // Create：本需求不處理（你也說不提供新增）
    if (this.crudstatus === CRUDStatus.Create) return;

    // Edit：只開放 Swagger 指定可更新欄位
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

      editableKeys.forEach((k) => {
        this.dataForm.controls[k].enable({ emitEvent: false });
      });

      // 另外這些是顯示用（要看你要不要可編輯；你需求沒列就不開）
      // this.dataForm.controls.OrgId.enable({ emitEvent: false });
      // this.dataForm.controls.ProjectNo.enable({ emitEvent: false });
    }
  }

  // ✅ /FIN0000/NTS1000/queryFIN63020Detail  { "ChkNo": "string" }
  private loadDetail(chkNo: string): void {
    this.messageService.blockUi();
    this.loading = true;

    this.fin63020Service
      .queryFIN63020Detail({ ChkNo: chkNo })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: any) => {
          const d: Fin63020DetailRow =
            res?.Data?.QueryData ??
            res?.Data ??
            res ??
            ({} as any);

          this.patchFromDetail(d);

          // 打完明細後再套一次（避免 patchValue 影響 disable 狀態）
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

        CheckAmount: (d as any).CheckAmount ?? null,
        CheckTitle: (d as any).CheckTitle ?? '',

        NoEndorseYn: (d as any).NoEndorseYn ?? '',
        Remark: (d as any).Remark ?? '',

        OrgId: (d as any).OrgId ?? '',
        StatusFlag: (d as any).StatusFlag ?? '',
        CheckStatus: (d as any).CheckStatus ?? '',

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
  

  // ✅ 送出（只在 Edit 才打 updateFIN63020）
  onSubmit(form: FormGroup): void {
  if (this.isRead) return;

  this.handleSubmit(form, () => {
    if (this.crudstatus !== CRUDStatus.Edit) {
      this.messageService.errorBubble('此功能目前僅提供編輯更新');
      return;
    }

    const raw = this.dataForm.getRawValue();

    const payload: Fin63020UpdateRequest = {
      CheckNo: String(raw.CheckNo ?? '').trim(),
      CheckTitle: String(raw.CheckTitle ?? '').trim(),
      Remark: String(raw.Remark ?? '').trim(),

      NoEndorseYn: raw.NoEndorseYn as 'Y' | 'N',
      StatusFlag: raw.StatusFlag as '1' | '2',
      PickupType: raw.PickupType as '0' | '1' | '2',

      PickupDate: raw.PickupDate ? this.toYMD(raw.PickupDate) : null,
      PayDate: raw.PayDate ? this.toYMD(raw.PayDate) : null,
      WithdrawDate: raw.WithdrawDate ? this.toYMD(raw.WithdrawDate) : null,
    };

    // 👉 如果你 service 還是 index signature，就用這個
    if (
      !payload['CheckNo'] ||
      !payload['CheckTitle'] ||
      !payload['Remark'] ||
      !payload['NoEndorseYn'] ||
      !payload['StatusFlag'] ||
      !payload['PickupType']
    ) {
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
}
