import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { Fin11030Service } from '../../../service/api/fin/fin11030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextRangeComponent } from '../../../shared/components/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { YearMonthComponent } from '../fin11020/query-year-month.component';
import { APS2001Data } from '../fin11030/fin11030.model';
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
    InputTextComponent,
    InputTextRangeComponent,
    DropdownComponent,
    InputNumberComponent,
    NgIf,
    TranslateModule,
    YearMonthComponent
  ],
})
export class FIN11030CRUComponent extends BasicCruPageComponent<APS2001Data> implements OnInit {
  dataForm = this.formBuilder.group({
    id: [0], // 編輯模式下的 ID
    SAL_GUIYYYYMM: [null as null | string],                          // 發票年月
    SAL_GUITrack: ['', [Validators.required, Validators.maxLength(2), Validators.minLength(2), this.validationService.guiTrackValidator]],  // 發票字軌
    SAL_GUIBegNo: ['', [Validators.maxLength(8), Validators.minLength(8), Validators.required, this.validationService.guiBegNoValidator]], // 發票起始號碼
    SAL_GUIEndNo: ['', [Validators.maxLength(8), Validators.minLength(8), Validators.required, this.validationService.guiEndNoValidator]], // 發票起始號碼
    SAL_GUIPaper: [null, [Validators.required]],
    GUI_Qty: [null as null | number], // 券數
  }, { validators: this.validationService.guiNumberRangeValidator('SAL_GUIBegNo', 'SAL_GUIEndNo') });

  SAL_GUIPaperOptions = getSYS1000Options('SAL_GUIPaper')
  SAL_GUIPaperOptions2 = getSYS1000Options('SAL_GUIPaper').filter(item => item.value === '32' || item.value === '31');
  minDate?: Date;

  constructor(
    private fin11030Service: Fin11030Service,
    private validationService: ValidationService,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11030', this.dataForm);
    if (this.isFormCreateable) {
      this.minDate = this.setMinDate();
      this.dataForm.get('SAL_GUIYYYYMM')?.setValidators([Validators.required]);

      // --- 新增預設值邏輯 ---
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const currentPeriodMonth = month % 2 === 0 ? month - 1 : month;
      const defaultYYYYMM = `${year}${currentPeriodMonth.toString().padStart(2, '0')}`;

      this.dataForm.get('SAL_GUIYYYYMM')?.setValue(defaultYYYYMM);
      // --------------------
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

    // 發票年月顯示格式設定
    if (this.rowdata && this.rowdata.SAL_GUIYYYYMM) {
      this.dataForm.get('SAL_GUIYYYYMM')?.setValue(
        this.datePipe.transform(this.rowdata.SAL_GUIYYYYMM, 'yyyyMM')
      );
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const body = {
        ...frm.value,
        id: this.dataForm.get('id')?.value ?? 0, // 如果是編輯模式，則包含 ID
        GUI_Qty: undefined,
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

  setMinDate(): Date | undefined {
    if (this.isFormCreateable) {
      const today = new Date();
      const currentMonth = today.getMonth();
      if ((currentMonth + 1) % 2 !== 0) {
        return new Date(today.getFullYear(), currentMonth, 1);
      } else {
        return new Date(today.getFullYear(), currentMonth - 1, 1);
      }
    }
    return undefined;
  }

  SAL_GUIPaperIs35(): boolean {
    return this.rowdata?.SAL_GUIPaper === '35';
  }
}
