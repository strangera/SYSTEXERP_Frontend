import { NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { Fin12010Service, IFin12010Data } from '../../../service/api/fin/fin12010.service';
import { SystemOption, SystemOptionsService } from '../../../service/system/sys1000.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextRangeComponent } from '../../../shared/components/input-text-range/input-text-range.component';
import { YearMonthComponent } from '../fin11020/query-year-month.component';
import { monthOptions } from '../fin11200/fin11200.model';

//1.1.2.1 電子式發票各系統配號維護
@Component({
  selector: 'app-fin12010-cru',
  templateUrl: './fin12010-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberComponent,
    InputTextRangeComponent,
    DropdownComponent,
    NgIf,
    TranslateModule,
    YearMonthComponent
  ],
})
export class FIN12010CRUComponent extends BasicCruPageComponent<IFin12010Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    SAL_GUIYYYYMM: [null as null | string, [Validators.required]],// 發票年月
    // SAL_GUIYYYYMM: [null as null | Date, [Validators.required]],// 發票年月
    SAL_GUITrack: [{ value: null, disabled: true }, [Validators.required]],  // 發票字軌
    GUI_Qty: [{ value: null as number | null, disabled: true }, [Validators.required]], // 券數
    SAL_BlankCnt: [{ value: 0, disabled: true }],       // 發票張數
    SAL_GUIBegNo: [{ value: '', disabled: true }], // 發票起始號碼
    SAL_GUIEndNo: [{ value: '', disabled: true }], // 發票結束號碼
    SAL_Type: [null, [Validators.required]], // 使用別
  });
  monthOptions = monthOptions;
  usageTypeOptions: SystemOption[] = SystemOptionsService.getOptions('T205');
  minDate?: Date;
  guiTrackOptions: { GUI_Track: string; MAX_GUINO: string; UnassignedQty: number }[] = [];
  maxQty = 0;

  constructor(
    private fin12010Service: Fin12010Service
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN12010', this.dataForm);
    if (this.isFormCreateable) {
      this.minDate = this.setMinDate();
      this.dataForm.get('SAL_GUIYYYYMM')?.setValidators([Validators.required]);
    } else {
      this.fetchGUITrackOptions();
      const totQtyValue = this.dataForm.get('SAL_BlankCnt')?.value;
      if (totQtyValue && totQtyValue !== 0) {
        const qty = Math.floor(totQtyValue / 50);
        this.dataForm.get('GUI_Qty')?.setValue(qty);
      }
      this.dataForm.get('SAL_GUIYYYYMM')?.disable();
      this.dataForm.get('SAL_GUITrack')?.disable();
      this.dataForm.get('GUI_Qty')?.disable();
    }
    // 監聽表單變化
    this.dataForm.get('SAL_GUIYYYYMM')?.valueChanges.subscribe(() => {
      this.dataForm.get('SAL_GUITrack')?.setValue(null); // 清除字軌選擇
      this.dataForm.get('SAL_GUIBegNo')?.setValue(''); // 清除起始號碼
      this.dataForm.get('SAL_GUIEndNo')?.setValue(''); // 清除結束號碼
      this.dataForm.get('GUI_Qty')?.setValue(null); // 清除券
      this.dataForm.get('SAL_GUITrack')?.disable();
      this.fetchGUITrackOptions(); // 更新字軌選項
      this.fetchGUIBegEndNo();
    });

    this.dataForm.get('SAL_GUITrack')?.valueChanges.subscribe((value) => {
      this.fetchGUIBegEndNo();
      this.maxQty = (this.guiTrackOptions.find(option => option.GUI_Track === value)?.UnassignedQty || 0) / 50;
      if (this.maxQty > 0) {
        this.dataForm.get('GUI_Qty')?.enable();
        this.dataForm.get('GUI_Qty')?.setValidators([Validators.required, Validators.max(this.maxQty)]);
        this.dataForm.get('GUI_Qty')?.updateValueAndValidity();
      } else {
        this.dataForm.get('GUI_Qty')?.disable();
      }
    });
    this.dataForm.get('GUI_Qty')?.valueChanges.subscribe(() => {
      this.fetchGUIBegEndNo();
    });
  }

  private fetchGUITrackOptions(): void {
    const guiDate: string | null = this.dataForm.get('SAL_GUIYYYYMM')?.value || null;
    this.guiTrackOptions = []; // 清空字軌選項
    this.maxQty = 0; // 重置最大發票號碼
    if (guiDate) {
      this.fin12010Service.queryPOS1017GUITrack({ GUI_YYMM: guiDate }).subscribe(res => {
        if (res.Data.length > 0) {
          this.guiTrackOptions = res.Data
          if (this.isFormCreateable) {
            this.dataForm.get('SAL_GUITrack')?.enable();
          }
        } else {
          this.dataForm.get('SAL_GUITrack')?.disable();
        }
      });
    }
  }
  private fetchGUIBegEndNo(): void {
    if (!this.isFormCreateable) return; // 只有在可創建表單時才執行
    const guiDate: string | null = this.dataForm.get('SAL_GUIYYYYMM')?.value || null;
    const track: string = this.dataForm.get('SAL_GUITrack')?.value || '';
    const qty: number = this.dataForm.get('GUI_Qty')?.value || 0;
    this.dataForm.get('SAL_GUIBegNo')?.setValue(''); // 清除起始號碼
    this.dataForm.get('SAL_GUIEndNo')?.setValue(''); // 清除結束號碼
    if (guiDate && track && qty > 0) {
      const params = { GUI_YYMM: guiDate, GUI_Track: track, AddRolls: qty };
      this.fin12010Service.queryPOS1017GUIBegNo_GUIEndNo(params).subscribe(res => {
        this.dataForm.patchValue({
          SAL_GUIBegNo: res.Data?.New_GUI_BegNo ?? '',
          SAL_GUIEndNo: res.Data?.New_GUI_EndNo ?? ''
        }, { emitEvent: false });
      });
    }
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
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        SAL_GUIYYYYMM: frm.get('SAL_GUIYYYYMM')?.value,
        SAL_GUITrack: this.isFormCreateable ? frm.get('SAL_GUITrack')?.value : undefined,
        SAL_GUIBegNo: this.isFormCreateable ? frm.get('SAL_GUIBegNo')?.value : undefined,
        SAL_GUIEndNo: this.isFormCreateable ? frm.get('SAL_GUIEndNo')?.value : undefined,
        SAL_Type: frm.get('SAL_Type')?.value,
        id: this.isFormCreateable ? undefined : this.rowdata?.id ?? 0
      }
      const serviceCall = this.isFormCreateable
        ? this.fin12010Service.insertFIN12010(body)
        : this.fin12010Service.updateFIN12010(body);
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
}
