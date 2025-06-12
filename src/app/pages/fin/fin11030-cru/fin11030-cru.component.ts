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
    SAL_GUIYYYYMM_start: [null, [Validators.required]],
    SAL_GUIYYYYMM_end: [null, [Validators.required]],
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
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      // this.fin11030Service.insertFIN11030(this.buildInsertBody(frm)).subscribe({
      //   next: (res) => {
      //     this.dataForm.reset();
      //     console.log(res);
      //   }
      // });
    });
  }
}
