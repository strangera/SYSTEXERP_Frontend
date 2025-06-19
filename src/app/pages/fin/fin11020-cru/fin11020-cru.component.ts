import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { guiStatusOptions, guiTypeOptions, MainInvoiceData } from '../fin11020/fin11020.model';
import { ValidationService } from '../../../shared/service/validation.service';
import { Fin11020Service } from '../../../service/api/fin/fin11020.service';

//1.1.1.2 發票基本資料維護 CRU
@Component({
  selector: 'app-fin11020-cru',
  templateUrl: './fin11020-cru.component.html',
})
export class FIN11020CRUComponent extends BasicCruPageComponent<MainInvoiceData> implements OnInit {
  dataForm = this.formBuilder.group({
    ID: [{ value: null, disabled: true }], // 主鍵ID
    GUI_YYMM: [null, [Validators.required, this.validationService.oddMonthValidator]],                          // 發票年月
    GUI_SerNo: [{ value: '', disabled: true }],                       // 序號
    GUI_Track: ['', [Validators.required, Validators.maxLength(2), Validators.minLength(2), this.validationService.guiTrackValidator]],  // 發票字軌
    GUI_BegNo: ['', [Validators.maxLength(8), Validators.minLength(8), Validators.required, this.validationService.guiBegNoValidator]], // 發票起始號碼
    GUI_EndNo: ['', [Validators.maxLength(8), Validators.minLength(8), Validators.required, this.validationService.guiEndNoValidator]], // 發票結束號碼
    GUI_Qty: [0, [Validators.required, Validators.maxLength(8), Validators.max(99999999)]], // 券數
    GUI_TotQty: [{ value: 0, disabled: true }],       // 發票張數
    GUI_AssignQty: [{ value: 0, disabled: true }],    // 發票號碼已分配張數
    GUI_Status: [{ value: '00', disabled: true }],       // 發票號碼狀態
    GUI_Type: [{ value: '07', disabled: true }],         // 發票類別
    GUI_VERIFY1: [{ value: '', disabled: true }],      // 設定確認人員一
    GUI_VERIFY1_Name: [{ value: '', disabled: true }], // 設定確認人員一姓名
    GUI_VERIFY2: [{ value: '', disabled: true }],      // 設定確認人員二
    GUI_VERIFY2_Name: [{ value: '', disabled: true }], // 設定確認人員二姓名
    GUI_File: [{ value: '', disabled: true }],         // 匯入檔案名稱
    CRT_Date: [{ value: null, disabled: true }],       // 建立日期
    CRT_USR_No: [{ value: '', disabled: true }],       // 建立人員
    CRT_USR_Name: [{ value: '', disabled: true }],     // 建立人員姓名
    UPD_Date: [{ value: null, disabled: true }],       // 變更日期
    UPD_USR_No: [{ value: '', disabled: true }],       // 變更人員
    UPD_USR_Name: [{ value: '', disabled: true }],     // 變更人員姓名
  }, { validators: this.validationService.guiNumberRangeValidator('GUI_BegNo', 'GUI_EndNo') });
  guiTypeOptions = guiTypeOptions     // 發票類別選項
  guiStatusOptions = guiStatusOptions;// 發票狀態選項
  constructor(
    private validationService: ValidationService,
    private fin11020Service: Fin11020Service
  ) {
    super();  // 呼叫父類建構子
  }
  ngOnInit(): void {
    this.initializePage('FIN11020', this.dataForm);
    const totQtyValue = this.dataForm.get('GUI_TotQty')?.value;
    if (totQtyValue && totQtyValue !== 0) {
      const qty = Math.floor(totQtyValue / 50);
      this.dataForm.get('GUI_Qty')?.setValue(qty);
    }
    this.dataForm.get('GUI_EndNo')?.valueChanges.subscribe(endNoValue => {
      const begNoValue = this.dataForm.get('GUI_BegNo')?.value;

      if (begNoValue !== null && begNoValue !== '' && endNoValue !== null && endNoValue !== '') {
        const beg = Number(begNoValue);
        const end = Number(endNoValue);
        if (!isNaN(beg) && !isNaN(end)) {
          if (end >= beg && (beg % 100 === 0 || beg % 100 === 50) && (end % 100 === 49 || end % 100 === 99)) {
            const totalQty = end - beg + 1;
            if (totalQty % 50 === 0) {
              const qty = totalQty / 50;
              this.dataForm.get('GUI_Qty')?.setValue(qty, { emitEvent: false });
              this.dataForm.get('GUI_TotQty')?.setValue(totalQty, { emitEvent: false });
            } else {
              this.dataForm.get('GUI_Qty')?.setValue(null, { emitEvent: false });
              this.dataForm.get('GUI_TotQty')?.setValue(null, { emitEvent: false });
              console.warn('總張數無法被 50 整除，資料格式可能有誤');
            }
          }
        }
      }
    });
    // 監聽「券數」變更，自動計算 GUI_TotQty
    this.dataForm.get('GUI_Qty')?.valueChanges.subscribe(value => {
      const qty = Number(value);
      if (!isNaN(qty)) {
        const totalQty = qty * 50;
        this.dataForm.get('GUI_TotQty')?.setValue(totalQty, { emitEvent: false });
        // 如果 GUI_BegNo 有填值才推算 GUI_EndNo
        const begValue = this.dataForm.get('GUI_BegNo')?.value;
        if (begValue != null && begValue !== '' && !isNaN(Number(begValue))) {
          const beg = Number(begValue);
          const end = beg + totalQty - 1;
          this.dataForm.get('GUI_EndNo')?.setValue(end.toString().padStart(8, '0'), { emitEvent: false });
        }
      } else {
        this.dataForm.get('GUI_TotQty')?.setValue(null, { emitEvent: false });
        this.dataForm.get('GUI_EndNo')?.setValue(null, { emitEvent: false });  // 也可以考慮清除 GUI_EndNo
      }
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const serviceCall = this.isFormCreateable
        ? this.fin11020Service.insertFIN11020(this.buildInsertBody(frm))
        : this.fin11020Service.updateFIN11020(this.buildUpdateBody(frm));
      serviceCall.subscribe({
        next: () => {
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    });
  }

  private buildInsertBody(frm: FormGroup): { GUI_YYMM: string; GUI_Track: string; GUI_BegNo: string; GUI_EndNo: string; } {
    const guiDate: Date | null = frm.get('GUI_YYMM')?.value;
    let guiYYMM = '';
    if (guiDate instanceof Date && !isNaN(guiDate.getTime())) {
      const year = guiDate.getFullYear();
      const month = (guiDate.getMonth() + 1).toString().padStart(2, '0');
      guiYYMM = `${year}${month}`;
    }

    return {
      GUI_YYMM: guiYYMM,
      GUI_Track: frm.get('GUI_Track')?.value,
      GUI_BegNo: frm.get('GUI_BegNo')?.value,
      GUI_EndNo: frm.get('GUI_EndNo')?.value
    };
  }

  private buildUpdateBody(frm: FormGroup): { ID: number; GUI_YYMM: string; GUI_Track: string; GUI_BegNo: string; GUI_EndNo: string; } {
    return { ID: this.dataForm.get('ID')?.value ?? 0, ...this.buildInsertBody(frm) };
  }

  // 僅在 isFormCreateable 為 true 時才提供 minDate，否則回傳 null
  get minDate(): Date | undefined {
    if (this.isFormCreateable) {
      const today = new Date();
      const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1); // 前一個月的 1 號
      return prevMonth;
    }
    return undefined;
  }

}
