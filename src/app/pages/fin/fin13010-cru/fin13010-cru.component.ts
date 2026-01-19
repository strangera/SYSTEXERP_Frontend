import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { FIN13010Service } from '../../../service/api/fin/fin13010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';

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
    InputNumberComponent,
    NgIf,
    TranslateModule,
    YearMonthComponent,
  ],
})
export class FIN13010CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit {
  guiNumberOptions: { label: string; value: string }[] = [];

  voucherTypeOptions: any[] = [
    { value: '21', label: '21-進項三聯式、電子計算機統一發票' },
    { value: '22', label: '22-進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    { value: '23', label: '23-三聯式、電子計算機及三聯式收銀機統一發票之進貨退出或折讓證明單' },
    { value: '24', label: '24-二聯式收銀機統一發票及載有稅額之其他憑證之進貨退出或折讓證明單' },
    { value: '25', label: '25-進項三聯式收銀機統一發票' },
    { value: '26', label: '26-彙總登錄每張稅額500元以下之進項三聯式、電子計算機統一發票' },
    { value: '27', label: '27-彙總登錄每張稅額500元以下之進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    { value: '28', label: '28-進項海關代徵營業稅繳納證' },
    { value: '29', label: '29-進項海關退還溢繳營業稅申報單' },
  ];

  taxTypeOptions = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' },
    { label: '零稅', value: '2' },
  ];

  /** 區別：'C' 折讓、'R' 退出（由程式自動判斷，使用者不能選） */
  creditTypeOptions = [
    { label: '折讓', value: 'C' },
    { label: '退出', value: 'R' },
  ];

dataForm = this.formBuilder.nonNullable.group({
  id: [null as number | null],                 // ⬅️ 新增這行

  GUI_Track: [null as string | null, Validators.required], // 字軌 (必填)
  PUR_GUINo: ['', Validators.required],                    // 發票號碼 (必填)
  PUR_GUINo_Correspond: [''],                              // 發票號碼(字軌+號碼)
  PUR_GUIDate: ['', Validators.required],                  // 退出/折讓日期
  PUR_VoucherType: [''],                                   // 發票格式
  PUR_RepYYYYMM: [null],
  Credit_Type: ['', Validators.required],                  // 區別（折讓/退出）→ 自動判斷
  PUR_TaxType: ['', Validators.required],                  // 稅別
  PUR_Net: [undefined as any],                             // 退出/折讓金額
  PUR_Tax: [undefined as any],                             // 退出/折讓稅額（自動計算，不可修改）
  PUR_Amt: [undefined as any],                             // 退回/折讓總金額
  Inv_Date: [undefined as any],                            // 發票日期
  Total_hitory_PUR_Amt: [undefined as any],                // 已退出/折讓歷史總金額
  Total_Amt: [undefined as any],                           // 剩餘總金額
  TXN_Ret_No: ['系統自動帶入', Validators.required],        // 退出/折讓單號
  Inv_Net: [undefined as any],                             // 銷售額
  Inv_Tax: [undefined as any],                             // 稅額
  Source_Doc_No: [''],                                     // 憑證單號
  Voucher_No: [''],                                        // 傳票編號
});


  constructor(
    private fin13010Service: FIN13010Service,
    private validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13010', this.dataForm);
    this.updateDisabledState();
    this.setupTrackNoWatcher();             // 監聽字軌 → 載入發票號碼清單
    this.setupGuiNoAndCorrespondWatcher();  // 監聽發票號碼 & 對應欄位
    this.setupAmountRelations();            // 金額互算 + 區別自動判斷

    // 固定禁止手動輸入的欄位
    this.dataForm.get('TXN_Ret_No')?.disable();
    // this.dataForm.get('PUR_VoucherType')?.disable(); // ⬅️ 移除這行，讓「新增」時可以選發票格式
    this.dataForm.get('PUR_TaxType')?.disable();
    this.dataForm.get('Inv_Tax')?.disable();
    this.dataForm.get('Inv_Net')?.disable();
    this.dataForm.get('Inv_Date')?.disable();
    this.dataForm.get('Total_hitory_PUR_Amt')?.disable();
    this.dataForm.get('Total_Amt')?.disable();
    this.dataForm.get('PUR_Tax')?.disable();     // 退出/折讓稅額不可手動改
    this.dataForm.get('Credit_Type')?.disable(); // 區別不可手動改

    // ⭐ 編輯 / 檢視模式：一進畫面就用目前字軌＋發票號碼去撈 APS4023，帶出發票日期 / 稅額 / 銷售額 / 剩餘總金額
    if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read) {
      this.loadInvoiceInfoByCurrentGUINo();
    }
  }

  /* ----------------- 共用：依目前 GUI_Track + PUR_GUINo 撈 APS4023 對應資料 ----------------- */

  private loadInvoiceInfoByCurrentGUINo(): void {
    const track = this.dataForm.get('GUI_Track')?.value?.trim();
    const guiNo = this.dataForm.get('PUR_GUINo')?.value?.trim();

    if (!track || !guiNo) {
      return;
    }

    const full = `${track}${guiNo}`;

    // 更新 PUR_GUINo_Correspond 欄位（如果後端有用）
    this.dataForm.patchValue(
      { PUR_GUINo_Correspond: full },
      { emitEvent: false },
    );

    this.fin13010Service
      .queryCorrespondByGUINoCorrespond({ PUR_GUINo_Correspond: full })
      .subscribe((res) => {
        const detail = res?.Data?.[0];
        if (detail) {
          // APS4023 schema：InvoiceDate, PUR_Net(銷售額), PUR_Tax(稅額), PUR_TaxType, Total_hitory_PUR_Amt, Total_Amt
          this.dataForm.patchValue(
            {
              // 🔹 發票日期：直接塞給 calendar 綁的控制項
              Inv_Date: detail.PUR_GUIDate,
              // 🔹 銷售額 / 稅額
              Inv_Net: detail.PUR_Net,
              Inv_Tax: detail.PUR_Tax,
              // 🔹 稅別
              PUR_TaxType: detail.PUR_TaxType,
              // 🔹 歷史金額 / 剩餘總金額
              Total_hitory_PUR_Amt: detail.Total_hitory_PUR_Amt,
              Total_Amt: detail.Total_Amt,
            },
            { emitEvent: false },
          );

          // 依目前「退回/折讓總金額 + 剩餘總金額」重新判斷 區別
          const currentAmt = this.dataForm.get('PUR_Amt')?.value;
          const totalInt =
            currentAmt === null || currentAmt === undefined || currentAmt === ''
              ? null
              : this.roundToInt(Number(currentAmt));
          this.updateCreditTypeByAmount(totalInt);
        } else {
          // 查不到則清空
          this.dataForm.patchValue(
            {
              Inv_Date: null,
              Inv_Net: null,
              Inv_Tax: null,
              PUR_TaxType: '',
              PUR_Amt: null,
              Total_hitory_PUR_Amt: null,
              Total_Amt: null,
              Credit_Type: '',
            },
            { emitEvent: false },
          );
        }
      });
  }

  /* ----------------- 監聽字軌 & 發票號碼 ----------------- */

  private setupTrackNoWatcher(): void {
    const trackControl = this.dataForm.get('GUI_Track');

    if (trackControl) {
      trackControl.valueChanges.subscribe((trackNo) => {
        if (typeof trackNo === 'string' && trackNo.trim().length >= 2) {
          this.fin13010Service
            .queryINV1000List({ GUI_Track: trackNo.trim() })
            .subscribe((res) => {
              this.guiNumberOptions = res.Data.map((item: any) => ({
                label: item.PUR_GUINo,
                value: item.PUR_GUINo,
              }));
            });
        } else {
          this.guiNumberOptions = [];
        }
      });
    }
  }

  private setupGuiNoAndCorrespondWatcher(): void {
    const trackControl = this.dataForm.get('GUI_Track');
    const noControl = this.dataForm.get('PUR_GUINo');

    if (trackControl && noControl) {
      const trigger = () => {
        // 改成呼叫共用方法：依目前 GUI_Track + PUR_GUINo 撈 APS4023
        this.loadInvoiceInfoByCurrentGUINo();
      };

      trackControl.valueChanges.subscribe(trigger);
      noControl.valueChanges.subscribe(trigger);
    }
  }

  // 依照 CRUDStatus 控制哪些欄位可編輯
  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Edit) {
      const editableFields = [
        'PUR_GUIDate',
        'PUR_RepYYYYMM',
        'Source_Doc_No',
        // 'Credit_Type', // 區別改成由程式自動判斷，不能手動改
        'PUR_Net',
        'PUR_Amt',
        'Voucher_No',
        // ⚠️ 不把 PUR_VoucherType 放進來 → Edit 模式不可改發票格式
      ];
      Object.keys(this.dataForm.controls).forEach((key) => {
        const control = this.dataForm.get(key);
        if (editableFields.includes(key)) {
          control?.enable();
        } else {
          control?.disable();
        }
      });
    } else if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable();
    } else {
      // Create 模式：全部先 enable，後面再個別關掉不該改的欄位
      this.dataForm.enable();
    }

    // 不論什麼狀態，退出/折讓稅額 & 區別 一律不可手動修改
    this.dataForm.get('PUR_Tax')?.disable();
    this.dataForm.get('Credit_Type')?.disable();
  }

  formatRepYYYYMM(value: string): string {
    if (!value || value.length !== 6) return value;
    return `${value.substring(0, 4)}/${value.substring(4, 6)}`;
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const formValue = form.getRawValue();

      // 送後端前，先把金額三個欄位變成整數（或 null）
      const intNet = this.toIntOrNull(formValue.PUR_Net);
      const intTax = this.toIntOrNull(formValue.PUR_Tax);
      const intAmt = this.toIntOrNull(formValue.PUR_Amt);

      const payload: any = {
        GUI_Track: formValue.GUI_Track,
        PUR_GUINo: formValue.PUR_GUINo,
        PUR_GUIDate: formValue.PUR_GUIDate,
        PUR_VoucherType: formValue.PUR_VoucherType,
        PUR_RepYYYYMM: formValue.PUR_RepYYYYMM,
        Credit_Type: formValue.Credit_Type, // 由程式自動帶入 C/R
        PUR_TaxType: formValue.PUR_TaxType,
        PUR_Net: intNet,
        PUR_Tax: intTax,
        PUR_Amt: intAmt,
        Source_Doc_No: formValue.Source_Doc_No,
        Voucher_No: formValue.Voucher_No,
      };

      // 申報年月轉成 YYYYMM
      payload.PUR_RepYYYYMM = this.toYYYYMM(payload.PUR_RepYYYYMM);

      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.fin13010Service.insertFIN13010(payload).subscribe(() => {
              this.messageService.successBubble('新增成功');
              this.dataForm.reset();
            });
          }
          break;
case CRUDStatus.Edit:
  payload.id = formValue.id;                  // ⬅️ 把 id 帶出去
  payload.TXN_Ret_No = formValue.TXN_Ret_No;  // 保留原本的

  if (this.canEdit()) {
    this.fin13010Service.updateFIN13010(payload).subscribe(() => {
      this.messageService.successBubble('更新成功');
      this.onCancel();
    });
  }
  break;
      }
    });
  }

  // 金額互算邏輯（全部用整數） + 區別自動判斷
  private setupAmountRelations(): void {
    const netControl = this.dataForm.get('PUR_Net'); // 退出/折讓金額
    const taxControl = this.dataForm.get('PUR_Tax'); // 退出/折讓稅額（自動）
    const amtControl = this.dataForm.get('PUR_Amt'); // 退回/折讓總金額

    if (!netControl || !taxControl || !amtControl) {
      return;
    }

    let updatingFromNet = false;
    let updatingFromAmt = false;

    // 使用者輸入「退出/折讓金額」時：
    netControl.valueChanges.subscribe((value) => {
      if (updatingFromAmt) return; // 避免互相觸發
      updatingFromNet = true;

      if (value === null || value === undefined || value === '') {
        // 清空時：連帶清空稅額與總額 & 區別
        taxControl.setValue(null, { emitEvent: false });
        amtControl.setValue(null, { emitEvent: false });
        this.updateCreditTypeByAmount(null);
        updatingFromNet = false;
        return;
      }

      const rawNet = Number(value);
      if (!isNaN(rawNet)) {
        const invNetControl = this.dataForm.get('Inv_Net');
        const invNetRaw = invNetControl?.value;
        const invNet =
          invNetRaw === null || invNetRaw === undefined || invNetRaw === ''
            ? null
            : Number(invNetRaw);

        // 先算出整數淨額 & 稅額 & 總額
        let netInt = this.roundToInt(rawNet);
        let taxInt = this.roundToInt(netInt * 0.05);
        let totalInt = this.roundToInt(netInt + taxInt);

        // 若有銷售額，且總額 > 銷售額 → 不允許，壓回銷售額
        if (invNet !== null && !isNaN(invNet) && invNet > 0 && totalInt > invNet) {
          this.messageService.errorBubble('退回/折讓總金額不可大於銷售額');

          const maxTotal = this.roundToInt(invNet);
          const maxNet = this.roundToInt(maxTotal / 1.05);
          const maxTax = maxTotal - maxNet;

          netInt = maxNet;
          taxInt = maxTax;
          totalInt = maxTotal;
        }

        netControl.setValue(netInt, { emitEvent: false });
        taxControl.setValue(taxInt, { emitEvent: false });
        amtControl.setValue(totalInt, { emitEvent: false });

        // 依照「剩餘總金額 / 銷售額 vs 總金額」 判斷 區別
        this.updateCreditTypeByAmount(totalInt);
      }

      updatingFromNet = false;
    });

    // 使用者只填「退回/折讓總金額」時，也要能反向回填
    amtControl.valueChanges.subscribe((value) => {
      if (updatingFromNet) return;
      updatingFromAmt = true;

      if (value === null || value === undefined || value === '') {
        netControl.setValue(null, { emitEvent: false });
        taxControl.setValue(null, { emitEvent: false });
        this.updateCreditTypeByAmount(null);
        updatingFromAmt = false;
        return;
      }

      const rawTotal = Number(value);
      if (!isNaN(rawTotal)) {
        const invNetControl = this.dataForm.get('Inv_Net');
        const invNetRaw = invNetControl?.value;
        const invNet =
          invNetRaw === null || invNetRaw === undefined || invNetRaw === ''
            ? null
            : Number(invNetRaw);

        let totalInt = this.roundToInt(rawTotal);

        // 若有銷售額，且總額 > 銷售額 → 不允許，壓回銷售額
        if (invNet !== null && !isNaN(invNet) && invNet > 0 && totalInt > invNet) {
          this.messageService.errorBubble('退回/折讓總金額不可大於銷售額');
          totalInt = this.roundToInt(invNet);
        }

        // total = net + tax，tax = round(net * 0.05)
        // 反推 net，大致用 total / 1.05，再取整數
        const approxNet = totalInt / 1.05;
        const netInt = this.roundToInt(approxNet);
        const taxInt = totalInt - netInt; // 保證 net + tax = total，三者皆整數

        amtControl.setValue(totalInt, { emitEvent: false });
        netControl.setValue(netInt, { emitEvent: false });
        taxControl.setValue(taxInt, { emitEvent: false });

        // 依照「剩餘總金額 / 銷售額 vs 總金額」 判斷 區別
        this.updateCreditTypeByAmount(totalInt);
      }

      updatingFromAmt = false;
    });
  }

  /**
   * 依照「剩餘總金額」優先判斷：
   *  - Total_Amt === 0 → 退出 (R)
   *  - Total_Amt > 0  → 折讓 (C)
   * 若沒有剩餘總金額，就 fallback：
   *  - totalAmt === Inv_Net → 退出
   *  - totalAmt <  Inv_Net → 折讓
   */
  private updateCreditTypeByAmount(totalAmt: number | null): void {
    const creditControl = this.dataForm.get('Credit_Type');
    const invNetControl = this.dataForm.get('Inv_Net');
    const totalAmtControl = this.dataForm.get('Total_Amt');

    if (!creditControl) return;

    // ① 先看「剩餘總金額」：0 → 退出，其餘 → 折讓
    if (totalAmtControl) {
      const remainingRaw = totalAmtControl.value;
      if (
        remainingRaw !== null &&
        remainingRaw !== undefined &&
        remainingRaw !== ''
      ) {
        const remaining = Number(remainingRaw);
        if (!isNaN(remaining)) {
          if (remaining === 0) {
            creditControl.setValue('R', { emitEvent: false }); // 剩餘0 → 退出
            return;
          }
          if (remaining > 0) {
            creditControl.setValue('C', { emitEvent: false }); // 還有剩 → 折讓
            return;
          }
        }
      }
    }

    // ② 若沒有剩餘總金額，就 fallback 用「銷售額 vs 退回/折讓總金額」判斷
    if (!invNetControl) {
      creditControl.setValue('', { emitEvent: false });
      return;
    }

    const invNetRaw = invNetControl.value;
    const invNet =
      invNetRaw === null || invNetRaw === undefined || invNetRaw === ''
        ? null
        : Number(invNetRaw);

    if (
      totalAmt === null ||
      totalAmt === undefined ||
      isNaN(totalAmt) ||
      invNet === null ||
      isNaN(invNet) ||
      invNet <= 0
    ) {
      creditControl.setValue('', { emitEvent: false });
      return;
    }

    if (totalAmt === invNet) {
      // 銷售額 = 退回/折讓總金額 → 退出
      creditControl.setValue('R', { emitEvent: false });
    } else if (totalAmt < invNet) {
      // 退回/折讓總金額 < 銷售額 → 折讓
      creditControl.setValue('C', { emitEvent: false });
    } else {
      creditControl.setValue('', { emitEvent: false });
    }
  }

  // 四捨五入為整數
  private roundToInt(value: number): number {
    return Math.round(value);
  }

  // 將任意值轉成整數（或 null）
  private toIntOrNull(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    if (isNaN(n)) return null;
    return this.roundToInt(n);
  }

  private toYYYYMM(input: any): string | null {
    if (!input) return null;

    // 處理 '2025/05'、'2025-05-01T00:00:00' 等字串
    if (typeof input === 'string') {
      const onlyDigits = input.replace(/\D/g, ''); // 拿掉所有非數字
      if (onlyDigits.length >= 6) return onlyDigits.slice(0, 6); // '202505'
      const d = new Date(input);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}${m}`;
      }
      return null;
    }

    // Date 物件
    if (input instanceof Date) {
      const y = input.getFullYear();
      const m = String(input.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }

    // 其他型別就試著 new Date 看看
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }
    return null;
  }

  clearFormExcept(): void {
    const keepValues = ['PUR_GUINo'];
    const patch: any = {};
    keepValues.forEach((key) => {
      patch[key] = this.dataForm.get(key)?.value;
    });

    this.dataForm.reset(); // 先清除
    this.dataForm.patchValue(patch); // 再補回保留的值
    this.updateDisabledState(); // 最後重新套用 disabled 狀態
  }
}
