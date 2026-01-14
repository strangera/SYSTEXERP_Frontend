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
import { QueryYearMonthComponent } from '../../../shared/componentkit/query-year-month/query-year-month.component';
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
  voucherTypeOptions = [
    { label: '23 - 三聯式/電子計算機/三聯收銀', value: '23' },
    { label: '24 - 二聯收銀/載有稅額之憑證', value: '24' },
  ];

  taxTypeOptions = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' },
    { label: '零稅', value: '2' },
  ];

  creditTypeOptions = [
    { label: '折讓', value: 'C' },
    { label: '退出', value: 'R' },
  ];

  dataForm = this.formBuilder.nonNullable.group({
    GUI_Track: [null as string | null, Validators.required], // 字軌 (必填)
    PUR_GUINo: ['', Validators.required],                     // 發票號碼 (必填)
    PUR_GUINo_Correspond: [''], // 發票號碼(字軌+號碼)
    PUR_GUIDate: ['', Validators.required], // 退出/折讓日期
    PUR_VoucherType: [''], // 發票格式
    PUR_RepYYYYMM: [
      null,

    ],
    Credit_Type: ['', Validators.required], // 區別（折讓/退出）
    PUR_TaxType: ['', Validators.required], // 稅別
    PUR_Net: [undefined as any],            // 退出/折讓金額
    PUR_Tax: [undefined as any],            // 退出/折讓稅額（自動計算，不可修改）
    PUR_Amt: [undefined as any],            // 退回/折讓總金額
    Inv_Date: [undefined as any],           // 發票日期
    Total_hitory_PUR_Amt: [undefined as any], // 已退出/折讓歷史總金額
    Total_Amt: [undefined as any],          // 剩餘總金額
    TXN_Ret_No: ['系統自動帶入', Validators.required], // 退出/折讓單號
    Inv_Net: [undefined as any],            // 銷售額
    Inv_Tax: [undefined as any],            // 稅額
    Source_Doc_No: [''],                    // 憑證單號
    Voucher_No: [''],                       // 傳票編號
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
    this.setupTrackNoWatcher(); // 監聽字軌
    this.setupGuiNoAndCorrespondWatcher(); // 監聽發票號碼 & 對應欄位
    this.setupAmountRelations(); // ⬅️ 新：金額互算邏輯

    // 固定禁止手動輸入的欄位
    this.dataForm.get('TXN_Ret_No')?.disable();
    this.dataForm.get('PUR_VoucherType')?.disable();
    this.dataForm.get('PUR_TaxType')?.disable();
    this.dataForm.get('Inv_Tax')?.disable();
    this.dataForm.get('Inv_Net')?.disable();
    this.dataForm.get('Inv_Date')?.disable();
    this.dataForm.get('Total_hitory_PUR_Amt')?.disable();
    this.dataForm.get('Total_Amt')?.disable();
    this.dataForm.get('PUR_Tax')?.disable(); // ⬅️ 退出/折讓稅額不可手動改
  }

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
        const track = trackControl.value?.trim();
        const guiNo = noControl.value?.trim();

        if (track && guiNo) {
          const full = `${track}${guiNo}`;

          // 更新 PUR_GUINo_Correspond 欄位
          this.dataForm.patchValue(
            { PUR_GUINo_Correspond: full },
            { emitEvent: false },
          );

          this.fin13010Service
            .queryCorrespondByGUINoCorrespond({ PUR_GUINo_Correspond: full })
            .subscribe((res) => {
              const detail = res?.Data?.[0];
              if (detail) {
                let voucherType: number | string = '';
                if (detail.PUR_VoucherType === '21') {
                  voucherType = 23;
                } else if (detail.PUR_VoucherType === '22') {
                  voucherType = 24;
                } else {
                  voucherType = 'OK'; // 測試用
                }

                this.dataForm.get('PUR_VoucherType')?.enable(); // 暫時開啟

                this.dataForm.patchValue(
                  {
                    Inv_Date: detail.PUR_GUIDate,
                    PUR_VoucherType: voucherType ? String(voucherType) : '',
                    PUR_TaxType: detail.PUR_TaxType,
                    Inv_Net: detail.PUR_Net,
                    Inv_Tax: detail.PUR_Tax,
                    Total_hitory_PUR_Amt: detail.Total_hitory_PUR_Amt,
                    Total_Amt: detail.Total_Amt,
                  },
                  { emitEvent: false },
                );

                this.dataForm.get('PUR_VoucherType')?.disable(); // 再關掉
              } else {
                // 查不到則清空
                this.dataForm.patchValue(
                  {
                    Inv_Date: null,
                    PUR_VoucherType: '',
                    PUR_TaxType: '',
                    Inv_Net: null,
                    Inv_Tax: null,
                    PUR_Amt: null,
                    Total_hitory_PUR_Amt: null,
                    Total_Amt: null,
                  },
                  { emitEvent: false },
                );
              }
            });
        }
      };

      trackControl.valueChanges.subscribe(trigger);
      noControl.valueChanges.subscribe(trigger);
    }
  }

  // ✅ 依照 CRUDStatus 控制哪些欄位可編輯
  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Edit) {
      const editableFields = [
        'PUR_GUIDate',
        'PUR_RepYYYYMM',
        'Source_Doc_No',
        'Credit_Type',
        'PUR_Net',
        'PUR_Amt',
        'Voucher_No',
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
      // Create 模式
      this.dataForm.enable();
    }

    // 不論什麼狀態，退出/折讓稅額一律不可手動修改
    this.dataForm.get('PUR_Tax')?.disable();
  }

  formatRepYYYYMM(value: string): string {
    if (!value || value.length !== 6) return value;
    return `${value.substring(0, 4)}/${value.substring(4, 6)}`;
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const formValue = form.getRawValue();

      const payload: any = {
        GUI_Track: formValue.GUI_Track,
        PUR_GUINo: formValue.PUR_GUINo,
        PUR_GUIDate: formValue.PUR_GUIDate,
        PUR_VoucherType: formValue.PUR_VoucherType,
        PUR_RepYYYYMM: formValue.PUR_RepYYYYMM,
        Credit_Type: formValue.Credit_Type,
        PUR_TaxType: formValue.PUR_TaxType,
        PUR_Net: formValue.PUR_Net,
        PUR_Tax: formValue.PUR_Tax,
        PUR_Amt: formValue.PUR_Amt,
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
          // ⬅️ Edit 時要傳 TXN_Ret_No
          payload.TXN_Ret_No = formValue.TXN_Ret_No;
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

  // ⬅️ 新：金額互算邏輯
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

      const net = Number(value);
      if (!value && value !== 0) {
        // 清空時：連帶清空稅額與總額
        taxControl.setValue(null, { emitEvent: false });
        amtControl.setValue(null, { emitEvent: false });
      } else if (!isNaN(net)) {
        // 先清空再寫入（符合作法）
        taxControl.setValue(null, { emitEvent: false });
        amtControl.setValue(null, { emitEvent: false });

        const tax = this.roundTo(net * 0.05);
        const total = this.roundTo(net + tax);

        taxControl.setValue(tax, { emitEvent: false });
        amtControl.setValue(total, { emitEvent: false });
      }

      updatingFromNet = false;
    });

    // 使用者只填「退回/折讓總金額」時，也要能反向回填
    amtControl.valueChanges.subscribe((value) => {
      if (updatingFromNet) return;
      updatingFromAmt = true;

      const total = Number(value);
      if (!value && value !== 0) {
        netControl.setValue(null, { emitEvent: false });
        taxControl.setValue(null, { emitEvent: false });
      } else if (!isNaN(total)) {
        // total = net + tax，且 tax = net * 0.05
        // => total = net * 1.05 => net = total / 1.05
        const net = this.roundTo(total / 1.05);
        const tax = this.roundTo(total - net);

        // 先清空再寫入
        netControl.setValue(null, { emitEvent: false });
        taxControl.setValue(null, { emitEvent: false });

        netControl.setValue(net, { emitEvent: false });
        taxControl.setValue(tax, { emitEvent: false });
      }

      updatingFromAmt = false;
    });
  }

  private roundTo(value: number, fractionDigits = 2): number {
    const factor = Math.pow(10, fractionDigits);
    return Math.round(value * factor) / factor;
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
