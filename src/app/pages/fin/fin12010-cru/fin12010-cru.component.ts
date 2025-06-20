import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { SystemOption } from '../../../shared/models/sys/sys1000.model';
import { SystemOptionsService } from '../../../service/system/sys1000.service';
import { monthOptions } from '../fin11200/fin11200.model';
import { IAPS2001 } from '../fin12010/fin12010.model';

//1.1.2.1 電子式發票各系統配號維護
@Component({
  selector: 'app-fin12010-cru',
  templateUrl: './fin12010-cru.component.html',
  styleUrl: './fin12010-cru.component.scss'
})
export class FIN12010CRUComponent extends BasicCruPageComponent<IAPS2001> implements OnInit {
  dataForm = this.formBuilder.group({
    SAL_GUIYYYYMM: [null, [Validators.required, this.validationService.oddMonthValidator]],                          // 發票年月
    SAL_GUITrack: ['', [Validators.required, Validators.maxLength(2), Validators.minLength(2), this.validationService.guiTrackValidator]],  // 發票字軌
    GUI_Qty: [0, [Validators.required, Validators.maxLength(8), Validators.max(99999999)]], // 券數
    SAL_BlankCnt: [{ value: 0, disabled: true }],       // 發票張數
    SAL_GUIBegNo: ['', [Validators.maxLength(8), Validators.minLength(8), Validators.required, this.validationService.guiBegNoValidator]], // 發票起始號碼
    SAL_GUIEndNo: ['', [Validators.maxLength(8), Validators.minLength(8), Validators.required, this.validationService.guiEndNoValidator]], // 發票結束號碼
    SAL_Type: [null, [Validators.required]], // 使用別
  }, { validators: this.validationService.guiNumberRangeValidator('SAL_GUIBegNo', 'SAL_GUIEndNo') });
  monthOptions = monthOptions;
  usageTypeOptions: SystemOption[] = SystemOptionsService.getOptions('T205');

  constructor(
    private validationService: ValidationService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN12010', this.dataForm);
    const totQtyValue = this.dataForm.get('SAL_BlankCnt')?.value;
    if (totQtyValue && totQtyValue !== 0) {
      const qty = Math.floor(totQtyValue / 50);
      this.dataForm.get('GUI_Qty')?.setValue(qty);
    }
    this.dataForm.get('SAL_GUIEndNo')?.valueChanges.subscribe(endNoValue => {
      const begNoValue = this.dataForm.get('SAL_GUIBegNo')?.value;
      if (begNoValue !== null && begNoValue !== '' && endNoValue !== null && endNoValue !== '') {
        const beg = Number(begNoValue);
        const end = Number(endNoValue);
        if (!isNaN(beg) && !isNaN(end)) {
          if (end >= beg && (beg % 100 === 0 || beg % 100 === 50) && (end % 100 === 49 || end % 100 === 99)) {
            const totalQty = end - beg + 1;
            if (totalQty % 50 === 0) {
              const qty = totalQty / 50;
              this.dataForm.get('GUI_Qty')?.setValue(qty, { emitEvent: false });
              this.dataForm.get('SAL_BlankCnt')?.setValue(totalQty, { emitEvent: false });
            } else {
              this.dataForm.get('GUI_Qty')?.setValue(null, { emitEvent: false });
              this.dataForm.get('SAL_BlankCnt')?.setValue(null, { emitEvent: false });
              console.warn('總張數無法被 50 整除，資料格式可能有誤');
            }
          }
        }
      }
    });
    this.dataForm.get('GUI_Qty')?.valueChanges.subscribe(value => {
      const qty = Number(value);
      if (!isNaN(qty)) {
        const totalQty = qty * 50;
        this.dataForm.get('SAL_BlankCnt')?.setValue(totalQty, { emitEvent: false });
        const begValue = this.dataForm.get('SAL_GUIBegNo')?.value;
        if (begValue != null && begValue !== '' && !isNaN(Number(begValue))) {
          const beg = Number(begValue);
          const end = beg + totalQty - 1;
          this.dataForm.get('SAL_GUIEndNo')?.setValue(end.toString().padStart(8, '0'), { emitEvent: false });
        }
      } else {
        this.dataForm.get('SAL_BlankCnt')?.setValue(null, { emitEvent: false });
        this.dataForm.get('SAL_GUIEndNo')?.setValue(null, { emitEvent: false });  // 也可以考慮清除 GUI_EndNo
      }
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // this.loading = true;
      // const serviceCall = this.isFormCreateable
      //   ? this.fin11020Service.insertFIN11020(this.buildInsertBody(frm))
      //   : this.fin11020Service.updateFIN11020(this.buildUpdateBody(frm));
      // serviceCall.subscribe({
      //   next: () => {
      //     this.loading = false;
      //   },
      //   error: () => {
      //     this.loading = false;
      //   },
      // });
    });
  }

  private buildInsertBody(frm: FormGroup): {
    SAL_GUIYYYYMM: string;
    SAL_GUITrack: string;
    SAL_GUIBegNo: string;
    SAL_GUIEndNo: string;
    SAL_Type: string;
  } {
    const guiDate: Date | null = frm.get('GUI_YYMM')?.value;
    let guiYYMM = '';
    if (guiDate instanceof Date && !isNaN(guiDate.getTime())) {
      const year = guiDate.getFullYear();
      const month = (guiDate.getMonth() + 1).toString().padStart(2, '0');
      guiYYMM = `${year}${month}`;
    }

    return {
      SAL_GUIYYYYMM: guiYYMM,
      SAL_GUITrack: frm.get('GUI_Track')?.value,
      SAL_GUIBegNo: frm.get('GUI_BegNo')?.value,
      SAL_GUIEndNo: frm.get('GUI_EndNo')?.value,
      SAL_Type: frm.get('SAL_Type')?.value
    };
  }
  private buildUpdateBody(frm: FormGroup): {
    ID: number;
    SAL_GUIYYYYMM: string;
    SAL_GUITrack: string;
    SAL_GUIBegNo: string;
    SAL_GUIEndNo: string;
    SAL_Type: string;
  } {
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
