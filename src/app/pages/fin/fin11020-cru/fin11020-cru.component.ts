import { NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { Fin11020Service, MainInvoiceData } from '../../../service/api/fin/fin11020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextRangeComponent } from '../../../shared/components/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

//1.1.1.2 發票基本資料維護 CRU
@Component({
  selector: 'app-fin11020-cru',
  templateUrl: './fin11020-cru.component.html',
  standalone: true,
  imports: [
    YearMonthComponent,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    NgIf,
    InputNumberComponent,
    InputTextComponent,
    InputTextRangeComponent,
    DropdownComponent,
    TranslateModule,
  ],
})
export class FIN11020CRUComponent extends BasicCruPageComponent<MainInvoiceData> implements OnInit {
  dataForm = this.formBuilder.group({
    ID: [{ value: null, disabled: true }], // 主鍵ID
    GUI_YYMM: [null, [Validators.required]],                          // 發票年月
    GUI_SerNo: [{ value: '', disabled: true }],                       // 序號
    GUI_Track: ['', [Validators.required, this.validationService.guiTrackValidator, Validators.maxLength(2), Validators.minLength(2)]],  // 字軌
    GUI_BegNo: ['', [Validators.maxLength(8), Validators.minLength(8), Validators.required, this.validationService.guiBegNoValidator]], // 碼
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
  guiTypeOptions = getSYS1000Options('GUI_Type');     // 發票類別選項
  guiStatusOptions = getSYS1000Options('GUI_Status');// 發票狀態選項
  minDate?: Date;
  constructor(
    private validationService: ValidationService,
    private fin11020Service: Fin11020Service
  ) {
    super();  // 呼叫父類建構子
  }
  ngOnInit(): void {
    this.initializePage('FIN11020', this.dataForm);
    if (this.isFormCreateable) {
      this.dataForm.get('GUI_YYMM')?.setValidators([Validators.required, this.validationService.minMonthValidator2]);
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const currentPeriodMonth = month % 2 === 0 ? month - 1 : month;
      const formattedMonth = currentPeriodMonth.toString().padStart(2, '0');
      const defaultYYYYMM = `${year}${formattedMonth}`;
      this.dataForm.get('GUI_YYMM')?.setValue(defaultYYYYMM as any, { emitEvent: false });
    }
    const totQtyValue = this.dataForm.get('GUI_TotQty')?.value;
    if (totQtyValue && totQtyValue !== 0) {
      const qty = Math.floor(totQtyValue / 50);
      this.dataForm.get('GUI_Qty')?.setValue(qty);
    }
    this.dataForm.get('GUI_EndNo')?.valueChanges.pipe(untilDestroyed(this)).subscribe(endNoValue => {
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
      const body = {
        ...frm.value,
        ID: this.isFormCreateable ? undefined : frm.get('ID')?.value ?? 0,
      }
      const serviceCall = this.isFormCreateable
        ? this.fin11020Service.insertFIN11020(body)
        : this.fin11020Service.updateFIN11020(body);
      serviceCall.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.messageService.successBubble(res.Message);
        if (this.isFormCreateable) {
          this.dataForm.reset();
        } else if (this.isFormEditable) {
          this.onCancel();
        }
      });
    });
  }
}
