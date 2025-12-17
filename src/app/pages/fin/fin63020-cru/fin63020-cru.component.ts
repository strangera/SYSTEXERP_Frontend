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
  Fin63020DetailRow,
  Fin63020Service,
  Fin63020UpdateDetailRequest,
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

  /** ✅ 給 template 用 */
  override loading = false;

  /** 下拉選項 */
  noEndorseOptions = [
    { value: 'Y', label: 'Y/是' },
    { value: 'N', label: 'N/否' },
  ];

  /** StatusFlag 1確認 2拋轉（顯示用） */
  ticketFlowStatusOptions = [
    { value: '1', label: '1/確認' },
    { value: '2', label: '2/拋轉' },
  ];

  /** CHK_Status：0=作廢 1=未異動 2=到期 3=兌現 4=撤票 5=退票 */
  chkStatusOptions = [
    { value: '0', label: '0/作廢' },
    { value: '1', label: '1/未異動' },
    { value: '2', label: '2/到期' },
    { value: '3', label: '3/兌現' },
    { value: '4', label: '4/撤票' },
    { value: '5', label: '5/退票' },
  ];

  /** CHK_PickupType：0/1/2 */
  pickupTypeOptions = [
    { value: '0', label: '0/未領' },
    { value: '1', label: '1/已領' },
    { value: '2', label: '2/郵寄' },
  ];

  /**
   * ✅ 表單：完全不做 disable
   * - 只靠 template 用 isRead / crudstatus 控 readonly
   */
dataForm = this.formBuilder.group({
// 顯示(原本不可改) - 這裡不 disable 了
CheckNo: ['', [Validators.required, Validators.maxLength(10)]], // @ChkNo varchar(10)

CompanyAccNo: [''],
CompanyAccName: [''],
VendorNo: [''],
VEN_Name: [''],
IssueDate: [null as Date | null],
ExpireDate: [null as Date | null, [Validators.required]], 
CheckAmount:  ['', [Validators.required]], 

  // 顯示用
  VoucherNoPaid: [''],

  // 可編輯（Update 用）
  CheckTitle: ['', [Validators.required, Validators.maxLength(100)]], // @ChkTitle varchar(100)
  NoEndorseYn: ['N' as 'Y' | 'N', [Validators.required, Validators.maxLength(1)]], // char(1)
  Remark: ['', [Validators.maxLength(160)]], // @Comment nvarchar(160)（不可 NULL；空字串OK）

  // 顯示欄位（原本不可改）
  OrgId: [''],
  StatusFlag: [''], // 1/2
  VouNo_paid: [''],

  // 可編輯（Update 用）
  CheckStatus: ['', [Validators.required, Validators.maxLength(1)]], // @Status varchar(1)
  PickupType: ['', [Validators.required, Validators.maxLength(1)]],  // @PickupType varchar(1)
  PickupDate: [null as Date | null],
  PayDate: [null as Date | null],
  WithdrawDate: [null as Date | null],

  // 顯示欄位
  ProjectNo: [''],
  PamNo: [''],
  VoucherNo: [''],
  ApCheckAccNo: [''],

  // UpdateDetail 用（你 SP_UpdateDetail 那支若有限制再補）
  PickName: [''],
});

  constructor(private fin63020Service: Fin63020Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN63020', this.dataForm);

    // ✅ 不再呼叫 disable，只保留「Read 模式」給 template 判斷
    // this.updateDisabledState();  // <- 不需要了（但你想保留也行，我下面給無 disable 版本）

    const chkNo =
      (this.rowdata as any)?.CheckNo ||
      (this.rowdata as any)?.ChkNo ||
      this.dataForm.get('CheckNo')?.value;

    if (chkNo) this.loadDetail(String(chkNo));
  }

  /**
   * ✅ 如果你仍想保留這個方法（不做 disable 版本）
   * - 只負責「必要時初始化預設值」或「處理 Read 時的 UI flag」
   */
  private updateDisabledState(): void {
    // 這裡故意不呼叫 this.dataForm.disable()
    // Read 模式由 template 用 isRead 去控制 readonly
  }

  private loadDetail(chkNo: string): void {
    this.messageService.blockUi();
    this.loading = true;

    this.fin63020Service
      .queryFIN63020Detail({ ChkNo: chkNo })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: any) => {
          if (res?.IsSuccess === false) {
            this.messageService.errorBubble(res?.Message ?? '查詢明細失敗');
            return;
          }
          const d: Fin63020DetailRow = res?.Data ?? res ?? ({} as any);
          this.patchFromDetail(d);
        },
        error: () => this.messageService.errorBubble('查詢明細失敗'),
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
        CompanyAccNo: (d as any).CompanyAccNo ?? '',
        CompanyAccName: (d as any).CompanyAccName ?? '',
        VendorNo: (d as any).VendorNo ?? '',
        VEN_Name: (d as any).VEN_Name ?? '',

        IssueDate: this.parseDate((d as any).IssueDate),
        ExpireDate: this.parseDate((d as any).ExpireDate),
        CheckAmount: (d as any).CheckAmount ?? null,

        VoucherNoPaid: (d as any).VoucherNoPaid ?? '',

        CheckTitle: (d as any).CheckTitle ?? '',
        NoEndorseYn: ((d as any).NoEndorseYn ?? 'N') as any,
        Remark: (d as any).Remark ?? '',

        OrgId: (d as any).OrgId ?? '',
        StatusFlag: (d as any).StatusFlag ?? '',
        VouNo_paid: (d as any).VouNo_paid ?? (d as any).VouNoPaid ?? '',

        CheckStatus: (d as any).CheckStatus ?? '',
        PickupType: (d as any).PickupType ?? '',
        PickupDate: this.parseDate((d as any).PickupDate),
        PayDate: this.parseDate((d as any).PayDate),
        WithdrawDate: this.parseDate((d as any).WithdrawDate),

        ProjectNo: (d as any).ProjectNo ?? '',
        PamNo: (d as any).PamNo ?? '',
        VoucherNo: (d as any).VoucherNo ?? '',
        ApCheckAccNo: (d as any).ApCheckAccNo ?? '',

        PickName: (d as any).PickName ?? '',
      },
      { emitEvent: false }
    );
  }

  /** Submit：走 Update */
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();

      if (this.crudstatus === CRUDStatus.Create) {
        this.messageService.errorBubble('此功能目前未提供新增');
        return;
      }

      if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        const payload: Fin63020UpdateRequest = {
          ChkNo: String(raw.CheckNo).trim(),
          ChkTitle: String(raw.CheckTitle ?? '').trim(),
          Comment: raw.Remark ?? '',

          NoEndorseYn: raw.NoEndorseYn as any,
          Status: String(raw.CheckStatus ?? '').trim(),
          PickupType: String(raw.PickupType ?? '').trim(),

          PickupDate: this.toYMDHMS(raw.PickupDate),
          PayDate: this.toYMDHMS(raw.PayDate),
          WithdrawDate: this.toYMDHMS(raw.WithdrawDate),
        };

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
          });
      }
    });
  }

  /** 確認領取（UpdateDetail） */
  onPickupConfirm(): void {
    if (this.isRead) return;

    const raw = this.dataForm.getRawValue();

    if (!raw.PickupDate) {
      this.dataForm.controls.PickupDate.setErrors({ required: true });
      this.dataForm.controls.PickupDate.markAsTouched();
      this.messageService.errorBubble('領取日期為必填');
      return;
    }

    if (!raw.PickName || String(raw.PickName).trim() === '') {
      this.dataForm.controls.PickName.setErrors({ required: true });
      this.dataForm.controls.PickName.markAsTouched();
      this.messageService.errorBubble('領取人姓名為必填');
      return;
    }

    const payload: Fin63020UpdateDetailRequest = {
      ChkNo: String(raw.CheckNo).trim(),
      PickupDate: this.toYMD(raw.PickupDate),
      UPD_USRNo: String(this.user?.user_No ?? '').trim(),
      UPD_USRName: String(this.user?.user_Name ?? '').trim(),
      PickName: String(raw.PickName).trim(),
    };

    this.messageService.blockUi();
    this.loading = true;

    this.fin63020Service
      .updateFIN63020Detail(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: any) => {
          if (res?.IsSuccess === false) {
            this.messageService.errorBubble(res?.Message ?? '確認領取失敗');
            return;
          }
          this.messageService.successBubble('確認領取成功');
          this.dataForm.patchValue({ PickupType: '1' }, { emitEvent: false });
        },
        error: () => this.messageService.errorBubble('確認領取失敗'),
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
  }

  get isRead(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  // ===== helpers =====
  private parseDate(v: any): Date | null {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  private toYMD(d: Date | null | undefined): string {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private toYMDHMS(d: Date | null | undefined): string | null {
    if (!d) return null;
    const ymd = this.toYMD(d);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${ymd} ${hh}:${mm}:${ss}`;
  }
}
