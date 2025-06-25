import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { SystemOption } from '../../../shared/models/sys/sys1000.model';
import { SystemOptionsService } from '../../../service/system/sys1000.service';
import { monthOptions } from '../fin11200/fin11200.model';
import { Fin12010Service, IFin12010Data } from '../../../service/api/fin/fin12010.service';
import { finalize } from 'rxjs';

//1.1.2.1 電子式發票各系統配號維護
@Component({
  selector: 'app-fin12010-cru',
  templateUrl: './fin12010-cru.component.html',
})
export class FIN12010CRUComponent extends BasicCruPageComponent<IFin12010Data> implements OnInit {
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
    private fin12010Service: Fin12010Service
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN12010', this.dataForm);
    if (!this.isFormCreateable) {
      this.dataForm.get('SAL_GUIYYYYMM')?.disable();
      this.dataForm.get('SAL_GUITrack')?.disable();
      this.dataForm.get('GUI_Qty')?.disable();
      this.dataForm.get('SAL_GUIBegNo')?.disable();
      this.dataForm.get('SAL_GUIEndNo')?.disable();
    }
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
      this.loading = true;
      const serviceCall = this.isFormCreateable
        ? this.fin12010Service.insertFIN12010(this.buildInsertBody(frm))
        : this.fin12010Service.updateFIN12010(this.buildUpdateBody(frm));
      serviceCall.pipe(finalize(() => this.loading = false)).subscribe(res => {
        this.messageService.successBubble(res.Message)
        if (this.isFormCreateable) {
          this.dataForm.reset();
        }
        if (this.isFormEditable) {
          this.onCancel();
        }
      });
    });
  }

  private buildInsertBody(frm: FormGroup): {
    SAL_GUIYYYYMM: string;
    SAL_GUITrack: string;
    SAL_GUIBegNo: string;
    SAL_GUIEndNo: string;
    SAL_Type: string;
  } {
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
      SAL_Type: frm.get('SAL_Type')?.value
    };
  }
  private buildUpdateBody(frm: FormGroup): {
    id: number;
    SAL_Type: string;
  } {
    return { id: frm.get('id')?.value ?? 0, SAL_Type: frm.get('SAL_Type')?.value || '' };
  }


}
