import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

import { getSYS1000Options$ } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { FIN23010Data, FIN23010Service } from '../../../service/api/fin/fin23010.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ValidationService } from '../../../shared/service/validation.service';
import { VenEmpPicked, VenEmpPickedType, VenEmpPickerComponent } from './ven-emp-picker/ven-emp-picker.component';

/** 票據禁止背書轉讓 是/否 (單純Y/N旗標，非SYS1000代碼表) */
const CTRLYN_OPTIONS = [
  { label: '是', value: 'Y' },
  { label: '否', value: 'N' },
];

//1.2.3.1 暫付款申請作業 CRU
@Component({
  selector: 'app-fin23010-cru',
  templateUrl: './fin23010-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, CalendarComponent, DropdownComponent, InputTextComponent, ButtonComponent, ButtonModule, InputTextModule, VenEmpPickerComponent, NgIf, AsyncPipe, TranslateModule]
})
export class FIN23010CRUComponent extends BasicCruPageComponent<FIN23010Data> implements OnInit {
  private readonly finService = inject(FIN23010Service);
  private readonly dropdown = inject(DropdownApiService);
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.group({
    advanceSheetNumber: [{ value: '系統自動產生', disabled: true }], // 預支單號(系統自動編碼)
    requestDate: [new Date(), [Validators.required]], //申請日期
    advanceAmount: [null as number | null, [Validators.required, this.validationService.numberValidator]], // 預支金額
    writeOffDate: [new Date(), [Validators.required]], //預計核銷日
    requsetEmployee: ['', [Validators.required]], //申請廠商/員工(VEN_No)
    payoutMethod: [{ value: null as string | null, disabled: true }], //付款方式
    transferAccount: [{ value: '', disabled: true }, [Validators.maxLength(10)]], //匯款銀行代號
    bankAccount: [{ value: '', disabled: true }, [Validators.maxLength(20)]], // 銀行帳號
    accountName: [{ value: '', disabled: true }, [Validators.maxLength(80)]], // 帳戶名稱
    ticketTransfer: [null as string | null], // 票據禁止背書轉讓
    ticketTitle: [{ value: '', disabled: true }, [Validators.maxLength(100)]], // 票據抬頭
    eExpectPayDate: [null as Date | null, [Validators.required]], //預計付款日
    organization: [null as string | null, [Validators.required]], //費用組織
    summary: ['', [Validators.maxLength(160)]], // 摘要
  });

  readonly CRUDStatus = CRUDStatus;
  readonly ctrlYNOptions = CTRLYN_OPTIONS;
  readonly payoutMethodOptions$ = getSYS1000Options$(this.systemDataService, 'VEN_PayType');
  readonly organizationOptions$ = this.dropdown.querySys3100();

  /** 目前選定的廠商/員工名稱(顯示用) */
  venName = '';
  /** 目前資料 id(修改時使用) */
  private currentId: number | null = null;
  /** 目前狀態(0作廢/1建立/2已付款)，供畫面顯示 */
  status: string | null = null;
  prepNo = '';
  vouNo = '';
  redeemNo = '';

  pickerVisible = false;

  /** 「申請廠商/員工」欄位顯示用文字 (代號 - 名稱) */
  get venDisplayValue(): string {
    const code = this.dataForm.controls.requsetEmployee.value;
    if (!code) return '';
    return this.venName ? `${code} - ${this.venName}` : code;
  }

  constructor(
    private readonly validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
    // 不把 dataForm 傳給 initializePage：清單頁傳回的列資料欄位命名與本頁表單不同，
    // 交由本頁自行依 id 呼叫 getByIdFIN23010 取得完整資料後再 patch，避免誤用泛用 patchValue。
    this.initializePage('FIN23010');

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        // 申請日期/預計核銷日 預設帶系統日期(已在 dataForm 初始值設定)
        break;
      case CRUDStatus.Edit:
      case CRUDStatus.Read:
        this.loadDetail();
        break;
    }
  }

  private loadDetail(): void {
    const id = this.rowdata?.id;
    if (!id) {
      this.messageService.warnBubble('缺少識別碼(id)，無法載入資料。');
      return;
    }
    this.currentId = id;
    this.loading = true;
    this.finService.getByIdFIN23010(id).pipe(
      finalize(() => (this.loading = false)),
    ).subscribe({
      next: res => {
        const d = res.Data;
        if (!d) {
          this.messageService.warnBubble('查無此筆暫付款申請資料。');
          return;
        }
        this.prepNo = d.PREP_NO ?? '';
        this.status = d.Status ?? null;
        this.vouNo = d.VouNo ?? '';
        this.redeemNo = d.REDEEM_NO ?? '';
        this.venName = d.VenName ?? '';
        this.dataForm.patchValue({
          advanceSheetNumber: d.PREP_NO,
          requestDate: d.APPY_Date ? new Date(d.APPY_Date) : null,
          advanceAmount: d.PREP_Amt,
          writeOffDate: d.CLOSE_Date ? new Date(d.CLOSE_Date) : null,
          requsetEmployee: d.VEN_No,
          payoutMethod: d.VEN_PayType,
          transferAccount: d.BNK_No,
          bankAccount: d.BNK_AccNo,
          accountName: d.BNK_AccountName,
          ticketTransfer: d.VEN_CTRLYN,
          ticketTitle: d.VEN_CheckTitle,
          eExpectPayDate: d.PAY_Date ? new Date(d.PAY_Date) : null,
          organization: d.CostOrg,
          summary: d.Summary,
        });
        // 僅「建立中」狀態允許編輯；已作廢/已付款一律鎖定唯讀(不論從編輯或明細按鈕進入)
        if (this.crudstatus === CRUDStatus.Read || !d.CanEdit) {
          this.dataForm.disable();
        }
      },
      error: () => {
        this.messageService.errorBubble('載入暫付款申請資料失敗，請稍後再試。', '載入失敗');
      },
    });
  }

  // ----------------------------------------------------------------
  openPicker(): void {
    if (this.dataForm.disabled) return;
    this.pickerVisible = true;
  }

  onPickerSelected(picked: VenEmpPicked): void {
    this.loading = true;
    const done = (venName: string, patch: Record<string, unknown>) => {
      this.venName = venName;
      this.dataForm.patchValue({ requsetEmployee: picked.code, ...patch });
      this.loading = false;
    };
    if (picked.type === VenEmpPickedType.Vendor) {
      this.finService.queryVenFIN23010(picked.code).pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.loading = false)),
      ).subscribe(res => {
        const v = res.Data;
        if (!v) {
          this.messageService.warnBubble('查無此廠商資料。');
          return;
        }
        done(v.VenName ?? '', {
          payoutMethod: v.PayType,
          transferAccount: v.BnkNo,
          bankAccount: v.BnkAccNo,
          accountName: v.BnkAccountName,
          ticketTitle: v.CheckTitle,
        });
      });
    } else {
      this.finService.queryEmpFIN23010(picked.code).pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.loading = false)),
      ).subscribe(res => {
        const e = res.Data;
        if (!e) {
          this.messageService.warnBubble('查無此員工資料。');
          return;
        }
        done(e.VenName ?? '', {
          payoutMethod: e.PayType,
          transferAccount: e.BnkNo,
          bankAccount: e.BnkAccNo,
          accountName: e.BnkAccountName,
          organization: e.CostOrg,
        });
      });
    }
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => this.doSave());
  }

  private doSave(): void {
    const v = this.dataForm.getRawValue();
    const payload = {
      ActionMode: (this.crudstatus === CRUDStatus.Create ? 'I' : 'U') as 'I' | 'U',
      id: this.crudstatus === CRUDStatus.Create ? null : this.currentId,
      APPY_Date: this.toDateString(v.requestDate),
      VEN_No: v.requsetEmployee ?? '',
      PREP_Amt: Number(v.advanceAmount ?? 0),
      PAY_Date: this.toDateString(v.eExpectPayDate),
      CLOSE_Date: this.toDateString(v.writeOffDate),
      VEN_PayType: v.payoutMethod,
      BNK_No: v.transferAccount || null,
      BNK_AccNo: v.bankAccount || null,
      BNK_AccountName: v.accountName || null,
      VEN_CheckTitle: v.ticketTitle || null,
      VEN_CTRLYN: v.ticketTransfer,
      CostOrg: v.organization ?? '',
      Summary: v.summary || null,
    };

    this.finService.saveFIN23010(payload).pipe(
      finalize(() => (this.loading = false)),
    ).subscribe(res => {
      if (!res.Data?.Success) {
        this.messageService.errorBubble(res.Data?.Message || '儲存失敗', '儲存失敗');
        return;
      }
      this.messageService.successBubble(res.Data.Message || '儲存成功');
      this.onCancel();
    });
  }

  private toDateString(value: Date | string | null | undefined): string {
    if (!value) return '';
    if (value instanceof Date) {
      return this.datePipe.transform(value, 'yyyy-MM-dd') ?? '';
    }
    return value;
  }
}
