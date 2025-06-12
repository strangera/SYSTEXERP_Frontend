import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Fin11030Service } from '../../../service/api/fin/fin11030.service';
import { APS2001Data, SAL_GUIPaperOptions } from '../fin11030/fin11030.model';
import { ValidationService } from '../../../shared/service/validation.service';
// 1.1.3 銷項品項資料設定 CRU
@Component({
  selector: 'app-fin11030-cru',
  templateUrl: './fin11030-cru.component.html',
})
export class FIN11030CRUComponent extends BasicCruPageComponent<APS2001Data> implements OnInit {
  dataForm = this.formBuilder.group({
    SAL_GUIYYYYMM: [null, [Validators.required, this.validationService.oddMonthValidator]],                          // 發票年月
    SAL_GUITrack: ['', [Validators.required, Validators.maxLength(2), Validators.minLength(2), this.validationService.guiTrackValidator]],  // 發票字軌
    SAL_GUIBegNo: ['', [Validators.maxLength(8), Validators.minLength(8), Validators.required, this.validationService.guiBegNoValidator]], // 發票起始號碼
    SAL_GUIEndNo: ['', [Validators.maxLength(8), Validators.minLength(8), Validators.required, this.validationService.guiEndNoValidator]], // 發票起始號碼
    SAL_GUIPaper: [null, [Validators.required]],
    GUI_Qty: [0, [Validators.required, Validators.maxLength(8), Validators.max(99999999)]], // 券數
  }, { validators: this.validationService.guiNumberRangeValidator('SAL_GUIBegNo', 'SAL_GUIEndNo') });

  SAL_GUIPaperOptions = SAL_GUIPaperOptions

  constructor(
    private fin11030Service: Fin11030Service,
    private validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11030', this.dataForm);
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
            } else {
              this.dataForm.get('GUI_Qty')?.setValue(null, { emitEvent: false });
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
        const begValue = this.dataForm.get('SAL_GUIBegNo')?.value;
        if (begValue != null && begValue !== '' && !isNaN(Number(begValue))) {
          const beg = Number(begValue);
          const end = beg + totalQty - 1;
          this.dataForm.get('SAL_GUIEndNo')?.setValue(end.toString().padStart(8, '0'), { emitEvent: false });
        }
      } else {
        this.dataForm.get('SAL_GUIEndNo')?.setValue(null, { emitEvent: false });  // 也可以考慮清除 GUI_EndNo
      }
    });
    const begInit = this.dataForm.get('SAL_GUIBegNo')?.value;
    const endInit = this.dataForm.get('SAL_GUIEndNo')?.value;
    if (begInit && endInit && !isNaN(Number(begInit)) && !isNaN(Number(endInit)) && !this.isFormCreateable) {
      const beg = Number(begInit);
      const end = Number(endInit);
      const totalQty = end - beg + 1;
      if (end >= beg && (beg % 100 === 0 || beg % 100 === 50) && (end % 100 === 49 || end % 100 === 99)) {
        if (totalQty % 50 === 0) {
          const qty = totalQty / 50;
          this.dataForm.get('GUI_Qty')?.setValue(qty, { emitEvent: false });
        }
      }
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const serviceCall = this.isFormCreateable
        ? this.fin11030Service.insertFIN11030(this.buildInsertBody(frm))
        : this.fin11030Service.updateFIN11030(this.buildUpdateBody(frm));
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

  private buildInsertBody(frm: FormGroup): { SAL_GUIYYYYMM: string; SAL_GUITrack: string; SAL_GUIBegNo: string; SAL_GUIEndNo: string; SAL_GUIPaper: string; } {
    const guiDate: Date | null = frm.get('SAL_GUIYYYYMM')?.value;
    let guiYYMM = '';
    if (guiDate instanceof Date && !isNaN(guiDate.getTime())) {
      const year = guiDate.getFullYear();
      const month = (guiDate.getMonth() + 1).toString().padStart(2, '0');
      guiYYMM = `${year}${month}`;
    }

    return {
      SAL_GUIYYYYMM: guiYYMM,
      SAL_GUITrack: frm.get('SAL_GUITrack')?.value,
      SAL_GUIBegNo: frm.get('SAL_GUIBegNo')?.value,
      SAL_GUIEndNo: frm.get('SAL_GUIEndNo')?.value,
      SAL_GUIPaper: frm.get('SAL_GUIPaper')?.value,
    }
  }

  private buildUpdateBody(frm: FormGroup): { id: number; SAL_GUIYYYYMM: string; SAL_GUITrack: string; SAL_GUIBegNo: string; SAL_GUIEndNo: string; SAL_GUIPaper: string; } {
    return { id: this.dataForm.get('ID')?.value ?? 0, ...this.buildInsertBody(frm) };
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
