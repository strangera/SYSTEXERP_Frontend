import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Fin11030Service } from '../../../service/api/fin/fin11030.service';
import { APS2001Data, SAL_GUIPaperOptions2 } from '../fin11030/fin11030.model';
import { ValidationService } from '../../../shared/service/validation.service';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { convertDateToYYYYMM } from '@shared/componentkit/table/table.model';
// 1.1.3 銷項品項資料設定 CRU
@Component({
  selector: 'app-fin11030-cru',
  templateUrl: './fin11030-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    InputTextComponent,
    InputTextRangeComponent,
    DropdownComponent,
    InputNumberComponent,
    NgIf,
    TranslateModule,
  ],
})
export class FIN11030CRUComponent extends BasicCruPageComponent<APS2001Data> implements OnInit {
  dataForm = this.formBuilder.group({
    id: [0], // 編輯模式下的 ID
    SAL_GUIYYYYMM: [null],                          // 發票年月
    SAL_GUITrack: ['', [Validators.required, Validators.maxLength(2), Validators.minLength(2), this.validationService.guiTrackValidator]],  // 發票字軌
    SAL_GUIBegNo: ['', [Validators.maxLength(8), Validators.minLength(8), Validators.required, this.validationService.guiBegNoValidator]], // 發票起始號碼
    SAL_GUIEndNo: ['', [Validators.maxLength(8), Validators.minLength(8), Validators.required, this.validationService.guiEndNoValidator]], // 發票起始號碼
    SAL_GUIPaper: [null, [Validators.required]],
    GUI_Qty: [0, [Validators.required, Validators.maxLength(8), Validators.max(99999999)]], // 券數
  }, { validators: this.validationService.guiNumberRangeValidator('SAL_GUIBegNo', 'SAL_GUIEndNo') });

  SAL_GUIPaperOptions = SAL_GUIPaperOptions2

  constructor(
    private fin11030Service: Fin11030Service,
    private validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11030', this.dataForm);
    if (this.isFormCreateable) {
      this.dataForm.get('SAL_GUIYYYYMM')?.setValidators([Validators.required, this.validationService.oddMonthValidator]);
    }
    this.dataForm.get('SAL_GUIEndNo')?.valueChanges.pipe(untilDestroyed(this)).subscribe(endNoValue => {
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
    this.dataForm.get('GUI_Qty')?.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
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
      const body = {
        ...frm.value,
        id: this.dataForm.get('id')?.value ?? 0, // 如果是編輯模式，則包含 ID
        GUI_Qty: undefined,
        SAL_GUIYYYYMM: convertDateToYYYYMM(frm.value.SAL_GUIYYYYMM), // 將日期轉換為 YYYYMM 格式
      }
      const serviceCall = this.isFormCreateable
        ? this.fin11030Service.insertFIN11030(body)
        : this.fin11030Service.updateFIN11030(body);
      serviceCall
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe({
          next: (res) => {
            this.messageService.successBubble(res.Message);
            if (this.isFormCreateable) {
              this.dataForm.reset();
            } else {
              this.onCancel();
            }
          },
          error: (error) => { console.error(error) }
        });
    });
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
