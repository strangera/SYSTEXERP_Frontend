import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { finalize, map } from 'rxjs';

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

//1.2.3.1 暫付款申請作業 CRU
@Component({
  selector: 'app-fin23010-cru',
  templateUrl: './fin23010-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, CalendarComponent, DropdownComponent, InputTextComponent, ButtonComponent, ButtonModule, InputTextModule, NgIf, AsyncPipe, TranslateModule]
})
export class FIN23010CRUComponent extends BasicCruPageComponent<FIN23010Data> implements OnInit {
  private readonly finService = inject(FIN23010Service);
  private readonly dropdown = inject(DropdownApiService);
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);

  /** 匯款銀行代號(7碼) → { BNK_No(前3碼), BNK_BranchNo(後4碼) } 對照，存檔時拆分用 */
  private readonly bankBranchMap = new Map<string, { BNK_No: string; BNK_BranchNo: string }>();

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.group({
    advanceSheetNumber: [{ value: '系統自動產生', disabled: true }], // 預支單號(系統自動編碼)
    requestDate: [new Date(), [Validators.required]], //申請日期
    advanceAmount: [null as number | null, [Validators.required, this.validationService.numberValidator]], // 預支金額
    writeOffDate: [new Date(), [Validators.required]], //預計核銷日
    requsetEmployee: [{ value: '', disabled: true }, [Validators.required]], //申請員工(VEN_No，固定為登入帳號，鎖定不可改)
    payoutMethod: [null as string | null], //付款方式
    transferAccount: ['', [Validators.maxLength(10)]], //匯款銀行代號
    bankAccount: ['', [Validators.maxLength(20)]], // 銀行帳號
    accountName: ['', [Validators.maxLength(80)]], // 帳戶名稱
    ticketTitle: ['', [Validators.maxLength(100)]], // 統一編號/身分證字號(原票據抬頭欄位改用途)
    eExpectPayDate: [null as Date | null, [Validators.required]], //預計付款日
    organization: [null as string | null, [Validators.required]], //費用組織
    summary: ['', [Validators.maxLength(160)]], // 摘要
  });

  readonly CRUDStatus = CRUDStatus;
  /** 付款方式：SP端目前僅允許1(電匯)/3(現金)，2(開票)已停用，故濾掉 */
  readonly payoutMethodOptions$ = getSYS1000Options$(this.systemDataService, 'VEN_PayType').pipe(
    map(options => options.filter(o => o.value === '1' || o.value === '3')),
  );
  readonly organizationOptions$ = this.dropdown.querySys3100();
  readonly VEN_BNK_No_ParamOptions = this.dropdown.queryAps1001_DropDownList(); // 匯款銀行代號
  /** 目前選定的廠商/員工名稱(顯示用) */
  venName = '';
  /** 目前資料 id(修改時使用) */
  private currentId: number | null = null;
  prepNo = '';
  vouNo = '';
  redeemNo = '';
  /** 狀態(中文名稱，供畫面顯示) */
  statusName = '';
  /** 結案狀態(中文名稱) */
  closeStatusName = '';
  /** 簽核結果(中文名稱) */
  eipApproveYNName = '';

  /** 「申請員工」欄位顯示用文字 (代號 - 名稱) */
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

    // 匯款銀行下拉載入後，建立「7碼 → BNK_No/BNK_BranchNo」對照，供存檔時拆分
    this.VEN_BNK_No_ParamOptions.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(opts => {
      this.bankBranchMap.clear();
      (opts ?? []).forEach(o => {
        this.bankBranchMap.set(String(o['value']), { BNK_No: o['BNK_No'], BNK_BranchNo: o['BNK_BranchNo'] });
      });
    });

    // 付款方式為電匯(1)時，匯款銀行代號/銀行帳號/帳戶名稱必填
    this.dataForm.controls.payoutMethod.valueChanges.subscribe(payType => {
      this.setBankValidators(payType);
    });

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        // 申請日期/預計核銷日 預設帶系統日期(已在 dataForm 初始值設定)
        // 申請員工固定預帶登入帳號，欄位鎖定不可改(已在 dataForm 設 disabled: true)
        this.dataForm.controls.requsetEmployee.setValue(this.user.user_No);
        this.venName = this.user.user_Name;
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
        this.vouNo = d.VouNo ?? '';
        this.redeemNo = d.REDEEM_NO ?? '';
        this.venName = d.VenName ?? '';
        this.statusName = d.StatusName ?? '';
        this.closeStatusName = d.CloseStatusName ?? '';
        this.eipApproveYNName = d.EipApproveYNName ?? '';
        this.dataForm.patchValue({
          advanceSheetNumber: d.PREP_NO,
          requestDate: d.APPY_Date ? new Date(d.APPY_Date) : null,
          advanceAmount: d.PREP_Amt,
          writeOffDate: d.CLOSE_Date ? new Date(d.CLOSE_Date) : null,
          requsetEmployee: d.VEN_No,
          payoutMethod: d.VEN_PayType,
          // 下拉值為 7 碼(BNK_No + BNK_BranchNo)，由拆存的兩欄還原以正確帶出選項
          transferAccount: `${d.BNK_No ?? ''}${d.BNK_BranchNo ?? ''}`,
          bankAccount: d.BNK_AccNo,
          accountName: d.BNK_AccountName,
          ticketTitle: d.VEN_CheckTitle,
          eExpectPayDate: d.PAY_Date ? new Date(d.PAY_Date) : null,
          organization: d.CostOrg,
          summary: d.Summary,
        });

        // 依付款方式套用銀行相關欄位必填規則
        this.setBankValidators(d.VEN_PayType);

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

  /**
   * 付款方式為電匯(1)時，
   * 匯款銀行代號/銀行帳號/帳戶名稱皆為必填
   */
  private setBankValidators(payType: string | null): void {
    const transferAccount = this.dataForm.controls.transferAccount;
    const bankAccount = this.dataForm.controls.bankAccount;
    const accountName = this.dataForm.controls.accountName;

    if (payType === '1') {
      transferAccount.setValidators([
        Validators.required,
        Validators.maxLength(10),
      ]);
      bankAccount.setValidators([
        Validators.required,
        Validators.maxLength(20),
      ]);
      accountName.setValidators([
        Validators.required,
        Validators.maxLength(80),
      ]);
    } else {
      transferAccount.setValidators([
        Validators.maxLength(10),
      ]);
      bankAccount.setValidators([
        Validators.maxLength(20),
      ]);
      accountName.setValidators([
        Validators.maxLength(80),
      ]);
    }

    transferAccount.updateValueAndValidity({ emitEvent: false });
    bankAccount.updateValueAndValidity({ emitEvent: false });
    accountName.updateValueAndValidity({ emitEvent: false });
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => this.doSave());
  }

  private doSave(): void {
    const v = this.dataForm.getRawValue();
    // 匯款銀行 7 碼拆成 BNK_No(前3碼) / BNK_BranchNo(後4碼)分開儲存
    const bank = v.transferAccount ? this.bankBranchMap.get(v.transferAccount) : undefined;
    const payload = {
      ActionMode: (this.crudstatus === CRUDStatus.Create ? 'I' : 'U') as 'I' | 'U',
      id: this.crudstatus === CRUDStatus.Create ? null : this.currentId,
      APPY_Date: this.toDateString(v.requestDate),
      VEN_No: v.requsetEmployee ?? '',
      PREP_Amt: Number(v.advanceAmount ?? 0),
      PAY_Date: this.toDateString(v.eExpectPayDate),
      CLOSE_Date: this.toDateString(v.writeOffDate),
      VEN_PayType: v.payoutMethod,
      BNK_No: bank?.BNK_No ?? null,
      BNK_BranchNo: bank?.BNK_BranchNo ?? null,
      BNK_AccNo: v.bankAccount || null,
      BNK_AccountName: v.accountName || null,
      VEN_CheckTitle: v.ticketTitle || null,
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