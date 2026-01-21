/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { FIN13010Service } from '../../../service/api/fin/fin13010.service';
import { ValidationService } from '@shared/service/validation.service';

// UI
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-fin13010-cru',
  templateUrl: './fin13010-cru.component.html',
  styleUrls: ['./fin13010-cru.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    YearMonthComponent,
    InputNumberComponent,
    NgIf,
    TranslateModule,
  ],
})
export class FIN13010CRUComponent extends BasicCruPageComponent<any> {
  CRUDStatus = CRUDStatus;

  voucherTypeOptions = [
    { value: '21', label: '21-進項三聯式、電子計算機統一發票' },
    { value: '22', label: '22-進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    {
      value: '23',
      label: '23-三聯式、電子計算機及三聯式收銀機統一發票之進貨退出或折讓證明單',
    },
    {
      value: '24',
      label:
        '24-二聯式收銀機統一發票及載有稅額之其他憑證之進貨退出或折讓證明單',
    },
    { value: '25', label: '25-進項三聯式收銀機統一發票' },
    {
      value: '26',
      label: '26-彙總登錄每張稅額500元以下之進項三聯式、電子計算機統一發票',
    },
    {
      value: '27',
      label:
        '27-彙總登錄每張稅額500元以下之進項二聯式收銀機統一發票、載有稅額之其他憑證',
    },
    { value: '28', label: '28-進項海關代徵營業稅繳納證' },
    { value: '29', label: '29-進項海關退還溢繳營業稅申報單' },
  ];

  creditTypeOptions = [
    { value: 'C', label: '折讓' },
    { value: 'R', label: '退出' },
  ];

  taxTypeOptions = [
    { value: '1', label: '應稅' },
    { value: '2', label: '零稅率' },
    { value: '3', label: '免稅' },
  ];

  guiNumberOptions: any[] = []; // 若你有從 APS 載入發票號碼，下方 TODO 補完

  dataForm = this.formBuilder.group({
    TXN_Ret_No: ['', [Validators.maxLength(20)]],
    GUI_Track: ['', [Validators.maxLength(2)]],
    PUR_GUINo: ['', [Validators.maxLength(10)]],
    Inv_Date: [null], // 發票日期
    PUR_GUIDate: [null], // 退出/折讓日期
    PUR_VoucherType: [null, [Validators.required]],
    PUR_RepYYYYMM: [null as string | null], // 申報年月（給 year-month）
    Credit_Type: [null, [Validators.required]],
    PUR_TaxType: [null, [Validators.required]],
    Inv_Net: [null],
    Inv_Tax: [null],
    PUR_Net: [null],
    PUR_Tax: [null],
    PUR_Amt: [null],
    Total_hitory_PUR_Amt: [null],
    Total_Amt: [null],
    Source_Doc_No: ['', [Validators.maxLength(16)]],
    Voucher_No: ['', [Validators.maxLength(16)]],
  });

  constructor(
    private translate: TranslateService,
    private validationService: ValidationService,
    private fin13010Service: FIN13010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    // 會把 crudstatus / rowdata / 權限帶進來
    this.initializePage('FIN13010', this.dataForm);

    // 若有需要，這裡可以載 GUI_No 選單
    // TODO: 例如 this.fin13010Service.getGuiNoOptions().subscribe( ... )

    // 編輯/檢視模式：把後端 PUR_RepYYYYMM 轉成 "YYYY/MM" 給 year-month 控制
    if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read) {
      const raw = this.rowdata?.PUR_RepYYYYMM as string | null | undefined;
      const normalized = this.normalizeYYYYMMForControl(raw); // 202602 -> 2026/02
      const patch: any = { ...this.rowdata };
      if (normalized) {
        patch.PUR_RepYYYYMM = normalized;
      }
      this.dataForm.patchValue(patch, { emitEvent: false });
    }

    // 檢視模式：整張表單會被 Base disable，按鈕那邊 HTML 已用 *ngIf="!isFormReadable"
  }

  /** 202602 -> 2026/02，給 YearMonthComponent 顯示用 */
  private normalizeYYYYMMForControl(raw: string | null | undefined): string | null {
    if (!raw) return null;
    const s = String(raw);
    const onlyDigits = s.replace(/\D/g, '');
    if (onlyDigits.length !== 6) return null;
    const y = onlyDigits.substring(0, 4);
    const m = onlyDigits.substring(4, 6);
    return `${y}/${m}`;
  }

  /** year-month 控制值 -> YYYYMM 傳回後端 */
  private toYYYYMM(input: any): string | null {
    if (!input) return null;

    if (typeof input === 'string') {
      const onlyDigits = input.replace(/\D/g, '');
      if (onlyDigits.length >= 6) return onlyDigits.slice(0, 6);
      const d = new Date(input);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}${m}`;
      }
      return null;
    }

    if (input instanceof Date) {
      const y = input.getFullYear();
      const m = String(input.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }

    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }
    return null;
  }

  /** 送出：這裡示意 Create / Edit，你可以把原本 APS 對應邏輯塞進來 */
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      if (form.invalid) {
        this.messageService.warnBubble('請先修正表單錯誤');
        return;
      }

      const raw = form.getRawValue() as any;

      // year-month 轉 YYYYMM
      raw.PUR_RepYYYYMM = this.toYYYYMM(raw.PUR_RepYYYYMM);

      // TODO：如果有 APS 明細，需要在這裡一起組 payload

      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        this.fin13010Service.insertFIN13010(raw).subscribe({
          next: () => {
            this.messageService.successBubble(
              this.translate.instant('success_message'),
            );
            // 新增完回列表 + 還原查詢
            this.router.navigate(['/account/fin', 'fin13010'], {
              state: { fromCru: true },
            });
          },
          error: () => {
            this.messageService.errorBubble(
              this.translate.instant('create_failed'),
            );
          },
        });
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        raw.id = this.rowdata?.id;

        this.fin13010Service.updateFIN13010(raw).subscribe({
          next: () => {
            this.messageService.successBubble(
              this.translate.instant('updated-successfully'),
            );
            this.router.navigate(['/account/fin', 'fin13010'], {
              state: { fromCru: true },
            });
          },
          error: () => {
            this.messageService.errorBubble(
              this.translate.instant('update_failed'),
            );
          },
        });
      }
    });
  }

  /** 返回按鈕：一律帶 fromCru=true，讓查詢頁還原條件 */
  override onCancel(): void {
    this.router.navigate(['/account/fin', 'fin13010'], {
      state: { fromCru: true },
    });
  }

  // 清除：如果你有需要，也可以照 TLS11020CRU 的寫法自訂
  onClear(): void {
    this.dataForm.reset();
    this.dataForm.markAsPristine();
  }
}
