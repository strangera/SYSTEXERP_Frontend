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
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

import {
  Fin63020DetailRow,
  Fin63020Service,
  Fin63020UpdateDetailRequest,
  Fin63020UpdateRequest,
} from '../../../service/api/fin/fin63020.service';

// ✅ 如果你專案的 app-table 需要 Column 型別，請改成你們實際的 import
// 例如：import { Column } from '@shared/componentkit/table/table.model';
type Column = any;

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
    DialogComponent,
    TableComponent,
    
  ],
})
export class FIN63020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  readonly CRUD = CRUDStatus;
  override loading = false;

  // =========================
  // 下拉選項
  // =========================
  chkStatusOptions = [
    { value: '0', label: '0-作廢' },
    { value: '1', label: '1-未異動' },
    { value: '2', label: '2-託收' },
    { value: '3', label: '3-兌現' },
    { value: '4', label: '4-撤票' },
    { value: '5', label: '5-退票' },
  ];

  pickupTypeOptions = [
    { value: '0', label: '0-未領' },
    { value: '1', label: '1-已領' },
    { value: '2', label: '2-郵寄' },
  ];

  // =========================
  // ✅ 收款對象 Dialog（參考你上方 dailyDialog）
  // =========================
  vendorDialogVisible = false;
  vendorLoading = false;
  vendorSaving = false;
  vendorSubmitted = false;
  vendorTableVer = 1;

  vendorQueryForm = this.formBuilder.group({
    keyword: [''], // 可輸入：廠商編號/名稱/統編/簡稱
  });

  vendorColumns: Column[] = [
    { field: '_rowNo', header: '序號', width: '70px' },
    { field: 'VendorNo', header: '廠商編號', width: '150px' },
    { field: 'Brand', header: '品牌', width: '180px' },
    { field: 'VendorName', header: '廠商名稱', width: '220px' },
    { field: 'UniNo', header: '統一編號', width: '140px' },
    { field: 'ShortName', header: '簡稱', width: '140px' },
  ];

  vendorRows: any[] = [];
  selectedVendorRow: any | null = null;

  // =========================
  // 表單
  // =========================
  dataForm = this.formBuilder.group({
    CheckNo: ['', [Validators.required, Validators.maxLength(10)]],

    CompanyAccNo: [''],
    CompanyAccName: [''],
    BankName: [''],

    PamNo: [''],

    // ✅ 收款對象：廠商編號 + 名稱（由 Dialog 帶入）
    VendorNo: [''],
    VEN_Name: [''],

    IssueDate: [null as Date | null],
    ExpireDate: [null as Date | null, [Validators.required]],
    CheckAmount: ['', [Validators.required]],

    VoucherNoPaid: [''],

    CheckTitle: ['', [Validators.required, Validators.maxLength(100)]],
    NoEndorseYn: ['N' as 'Y' | 'N', [Validators.required, Validators.maxLength(1)]],
    Remark: ['', [Validators.maxLength(160)]],

    OrgId: [''],
    StatusFlag: [''],
    VouNo_paid: [''],

    CheckStatus: ['', [Validators.required, Validators.maxLength(1)]],
    PickupType: ['', [Validators.required, Validators.maxLength(1)]],
    PickupDate: [null as Date | null],
    PayDate: [null as Date | null],
    WithdrawDate: [null as Date | null],

    ProjectNo: [''],
    VoucherNo: [''],
    ApCheckAccNo: [''],

    PickName: [''],

    TrustBankCode1: [''],
    TrustBankCode2: [''],
    TrustBankFullName: [''],
    TrustAccount: [''],
  });

  constructor(private fin63020Service: Fin63020Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN63020', this.dataForm);

    const chkNo =
      (this.rowdata as any)?.CheckNo ||
      (this.rowdata as any)?.ChkNo ||
      this.dataForm.get('CheckNo')?.value;

    if (chkNo) {
      this.loadDetail(String(chkNo));
    }

    // ✅ 新增時：依託收日期自動帶狀態 1/2
    if (this.crudstatus === CRUDStatus.Create) {
      this.initCreateDefaultStatus();
      this.bindCreateStatusRule();
    }
  }

  // =========================
  // ✅ 收款對象 Dialog 行為
  // =========================
  openVendorDialog(): void {
    if (this.isRead) return;
    this.vendorDialogVisible = true;
    this.selectedVendorRow = null;

    // 你也可以選擇開啟就先查一次
    // this.onVendorQuery();
  }

  onVendorDialogVisibleChange(v: boolean): void {
    this.vendorDialogVisible = v;
    if (!v) {
      this.vendorSubmitted = false;
      this.vendorQueryForm.reset({ keyword: '' }, { emitEvent: false });
      this.vendorRows = [];
      this.selectedVendorRow = null;
    }
  }

// ✅ 給「查詢」用：30 秒保底關掉 loading（API 沒回、或根本沒 API 都不會卡住）
private stopVendorLoadingSafely(message?: string): void {
  this.vendorLoading = false;
  if (message) this.messageService.errorBubble(message);
}

/** ✅ 收款對象查詢：目前沒 API → 先做成「一定有反應」且 30 秒不會卡 */
onVendorQuery(): void {
  const keyword = String(this.vendorQueryForm.controls.keyword.value ?? '').trim();

  // 進入 loading（讓你看得出有反應）
  this.vendorLoading = true;
  this.vendorSubmitted = true;
  this.selectedVendorRow = null;

  // 先清空資料（避免看起來像卡住）
  this.vendorRows = [];
  this.vendorTableVer++;

  // ✅ 30 秒保底解除 loading（API 沒回應也不會轉圈轉到死）
  const timeoutId = window.setTimeout(() => {
    // 如果 30 秒後還在 loading，就強制停止
    if (this.vendorLoading) {
      this.stopVendorLoadingSafely('查詢逾時（30 秒），請稍後再試');
    }
  }, 30_000);

  try {
    // ✅ 目前沒有 API：先用 setTimeout 模擬「查不到資料」
    // 之後你要接 API，只要把這段換成 subscribe 即可
    window.setTimeout(() => {
      // 模擬回來後：清掉 timeout、解除 loading、顯示無資料
      window.clearTimeout(timeoutId);

      // 沒資料
      this.vendorRows = [];
      this.vendorTableVer++;

      this.vendorLoading = false;
      this.messageService.errorBubble(keyword ? '查無符合資料' : '請輸入關鍵字再查詢');
    }, 300); // 300ms 讓 UI 有感

    /**
     * ✅ 未來要接真 API 時，用下面這段取代上面的 setTimeout（保留 30 秒 timeout 機制）
     *
     * this.fin63020Service.queryVendorList({ Keyword: keyword })
     *   .pipe(untilDestroyed(this))
     *   .subscribe({
     *     next: (res: any) => {
     *       const list = res?.Data ?? [];
     *       this.vendorRows = (Array.isArray(list) ? list : []).map((x: any, i: number) => ({
     *         _rowKey: `${x?.VEN_No ?? x?.VendorNo ?? ''}_${i}`,
     *         _rowNo: i + 1,
     *         VendorNo: x?.VEN_No ?? x?.VendorNo ?? '',
     *         Brand: x?.BRAND_Name ?? x?.Brand ?? '',
     *         VendorName: x?.VEN_Name ?? x?.VendorName ?? '',
     *         UniNo: x?.VEN_UBN ?? x?.UniNo ?? '',
     *         ShortName: x?.VEN_SName ?? x?.ShortName ?? '',
     *         _raw: x,
     *       }));
     *       this.vendorTableVer++;
     *
     *       if (!this.vendorRows.length) this.messageService.errorBubble('查無符合資料');
     *     },
     *     error: () => this.messageService.errorBubble('查詢廠商失敗'),
     *     complete: () => {
     *       window.clearTimeout(timeoutId);
     *       this.vendorLoading = false;
     *     },
     *   });
     */
  } catch (e) {
    // 任何例外都不要卡 loading
    window.clearTimeout(timeoutId);
    this.stopVendorLoadingSafely('查詢發生錯誤');
  }
}

  /** 如果你的 app-table 有 manage 按鈕事件，就用這個「點一下就帶入」 */
  onVendorManageClick(row: any): void {
    this.applyVendorRow(row);
  }

  /** 若你希望使用 Dialog footer 的 save 來帶入（和 dailyDialog 一樣） */
  onVendorSave(): void {
    if (!this.selectedVendorRow) {
      this.messageService.errorBubble('請先選擇一筆廠商資料');
      return;
    }
    this.applyVendorRow(this.selectedVendorRow);
  }

  /** 你 app-table 若有 rowSelect/selectionChange，就把選取的 row 指到 selectedVendorRow */
  onVendorRowSelect(row: any): void {
    this.selectedVendorRow = row;
  }

  private applyVendorRow(row: any): void {
    this.dataForm.patchValue(
      {
        VendorNo: row?.VendorNo ?? '',
        VEN_Name: row?.VendorName ?? '',
      },
      { emitEvent: false }
    );

    this.vendorDialogVisible = false;
  }

  // =========================
  // 原本功能（load / submit / helper）
  // =========================
  private initCreateDefaultStatus(): void {
    const issueDate = this.dataForm.controls.IssueDate.value;
    const status = issueDate ? '2' : '1';
    this.dataForm.patchValue({ CheckStatus: status }, { emitEvent: false });
  }

  private bindCreateStatusRule(): void {
    this.dataForm.controls.IssueDate.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((d) => {
        if (this.crudstatus !== CRUDStatus.Create) return;
        const nextStatus = d ? '2' : '1';
        this.dataForm.patchValue({ CheckStatus: nextStatus }, { emitEvent: false });
      });
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
        BankName: (d as any).BankName ?? '',

        PamNo: (d as any).PamNo ?? '',
        VendorNo: (d as any).VendorNo ?? '',
        VEN_Name: (d as any).VEN_Name ?? '',

        IssueDate: this.parseDate((d as any).IssueDate),
        ExpireDate: this.parseDate((d as any).ExpireDate),
        CheckAmount: (d as any).CheckAmount ?? null,

        CheckStatus: (d as any).CheckStatus ?? '',
        PickupType: (d as any).PickupType ?? '',
        PickupDate: this.parseDate((d as any).PickupDate),
        PayDate: this.parseDate((d as any).PayDate),
        WithdrawDate: this.parseDate((d as any).WithdrawDate),

        VoucherNo: (d as any).VoucherNo ?? '',
        ApCheckAccNo: (d as any).ApCheckAccNo ?? '',

        Remark: (d as any).Remark ?? '',

        TrustBankCode1: (d as any).TrustBankCode1 ?? '',
        TrustBankCode2: (d as any).TrustBankCode2 ?? '',
        TrustBankFullName: (d as any).TrustBankFullName ?? '',
        TrustAccount: (d as any).TrustAccount ?? '',
      },
      { emitEvent: false }
    );
  }

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
  // =========================
// ✅ 銀行查詢 Dialog（CompanyAccNo / TrustBankCode1 共用）
// =========================
bankDialogVisible = false;
bankLoading = false;
bankSaving = false;
bankSubmitted = false;
bankTableVer = 1;

/** 目前是要帶回「公司銀行」還是「託收銀行」 */
bankDialogTarget: 'company' | 'trust' = 'company';

bankQueryForm = this.formBuilder.group({
  keyword: [''], // 可輸入：銀行代碼/銀行名稱/帳號/帳戶名稱 等
});

bankColumns: Column[] = [
  { field: '_rowNo', header: '序號', width: '70px' },
  { field: 'BankCode', header: '銀行代碼', width: '120px' },
  { field: 'BankName', header: '銀行名稱', width: '220px' },
  { field: 'AccountNo', header: '帳號', width: '180px' },
  { field: 'AccountName', header: '帳戶名稱', width: '260px' },
];

bankRows: any[] = [];
selectedBankRow: any | null = null;

/** 開啟銀行查詢：company = 銀行代號；trust = 託收銀行代號 */
openBankDialog(target: 'company' | 'trust'): void {
  if (this.isRead) return;

  this.bankDialogTarget = target;
  this.bankDialogVisible = true;

  this.selectedBankRow = null;
  this.bankSubmitted = false;

  // 若你想開啟就先查一次可打開這行
  // this.onBankQuery();
}

onBankDialogVisibleChange(v: boolean): void {
  this.bankDialogVisible = v;
  if (!v) {
    this.bankSubmitted = false;
    this.bankQueryForm.reset({ keyword: '' }, { emitEvent: false });
    this.bankRows = [];
    this.selectedBankRow = null;
    this.bankLoading = false;
  }
}

/** 30 秒保底解除 loading */
private stopBankLoadingSafely(message?: string): void {
  this.bankLoading = false;
  if (message) this.messageService.errorBubble(message);
}

/** 銀行查詢：目前沒 API → 先做成一定有反應 + 30 秒不會卡 */
onBankQuery(): void {
  const keyword = String(this.bankQueryForm.controls.keyword.value ?? '').trim();

  this.bankLoading = true;
  this.bankSubmitted = true;
  this.selectedBankRow = null;

  this.bankRows = [];
  this.bankTableVer++;

  const timeoutId = window.setTimeout(() => {
    if (this.bankLoading) {
      this.stopBankLoadingSafely('查詢逾時（30 秒），請稍後再試');
    }
  }, 30_000);

  try {
    // ✅ 目前沒有 API：用 300ms 模擬查詢結束（你之後接 API 再替換）
    window.setTimeout(() => {
      window.clearTimeout(timeoutId);

      // 沒資料（你也可以改成塞一筆假資料測試帶回）
      this.bankRows = [];
      this.bankTableVer++;

      this.bankLoading = false;
      this.messageService.errorBubble(keyword ? '查無符合資料' : '請輸入關鍵字再查詢');
    }, 300);

    /**
     * ✅ 未來接真 API 時，把上面 setTimeout 換成你的 API：
     *
     * this.someService.queryBankList({ Keyword: keyword })
     *   .pipe(untilDestroyed(this))
     *   .subscribe({
     *     next: (res:any) => {
     *       const list = res?.Data ?? [];
     *       this.bankRows = (Array.isArray(list) ? list : []).map((x:any,i:number)=>({
     *         _rowKey: `${x?.BankCode ?? ''}_${i}`,
     *         _rowNo: i+1,
     *         BankCode: x?.BankCode ?? '',
     *         BankName: x?.BankName ?? '',
     *         AccountNo: x?.AccountNo ?? '',
     *         AccountName: x?.AccountName ?? '',
     *         _raw: x,
     *       }));
     *       this.bankTableVer++;
     *       if (!this.bankRows.length) this.messageService.errorBubble('查無符合資料');
     *     },
     *     error: () => this.messageService.errorBubble('查詢銀行失敗'),
     *     complete: () => { window.clearTimeout(timeoutId); this.bankLoading = false; },
     *   });
     */
  } catch (e) {
    window.clearTimeout(timeoutId);
    this.stopBankLoadingSafely('查詢發生錯誤');
  }
}

onBankRowSelect(row: any): void {
  this.selectedBankRow = row;
}

/** 點 manage 直接帶入 */
onBankManageClick(row: any): void {
  this.applyBankRow(row);
}

/** Dialog footer save 帶入 */
onBankSave(): void {
  if (!this.selectedBankRow) {
    this.messageService.errorBubble('請先選擇一筆銀行資料');
    return;
  }
  this.applyBankRow(this.selectedBankRow);
}

private applyBankRow(row: any): void {
  const bankCode = row?.BankCode ?? '';
  const bankName = row?.BankName ?? '';
  const accNo = row?.AccountNo ?? '';
  const accName = row?.AccountName ?? '';

  if (this.bankDialogTarget === 'company') {
    // ✅ 銀行代號區：CompanyAccNo / BankName / ApCheckAccNo / CompanyAccName(可選)
    this.dataForm.patchValue(
      {
        CompanyAccNo: bankCode,
        BankName: bankName,
        ApCheckAccNo: accNo,
        // 若你想把帳戶名稱塞到 CompanyAccName（你原本是分行代號，請自行決定是否要帶）
        // CompanyAccName: accName,
      } as any,
      { emitEvent: false }
    );
  } else {
    // ✅ 託收銀行代號區：TrustBankCode1 / TrustBankFullName / TrustAccount
    this.dataForm.patchValue(
      {
        TrustBankCode1: bankCode,
        TrustBankFullName: bankName,
        TrustAccount: accNo,
        // 若你有需要可加：TrustBankCode2 / 其他欄位
        // TrustBankCode2: '',
      } as any,
      { emitEvent: false }
    );
  }

  this.bankDialogVisible = false;
}

}
