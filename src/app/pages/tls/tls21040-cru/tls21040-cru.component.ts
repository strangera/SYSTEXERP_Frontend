import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS21040Data, Tls21040Service } from '@service/api/tls/tls21040.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { formatDateToYYYYMMDD } from '@shared/componentkit/table/table.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { PanelModule } from 'primeng/panel';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, switchMap, tap } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ValidationService } from './../../../shared/service/validation.service';

@Component({
  selector: 'app-tls21040-cru',
  templateUrl: './tls21040-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarRangeQuickComponent,
    NgIf,
    TranslateModule,
  ],
})
export class TLS21040CRUComponent extends BasicCruPageComponent<TLS21040Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    CRD_BinCode: ['', [Validators.required, Validators.maxLength(16), this.validationService.numberValidator]],
    BNK_No: ['', [Validators.required, Validators.maxLength(3), this.validationService.numberValidator]],
    CRD_Type: [null, [Validators.required]],
    CRD_Kind: [null, [Validators.required]],
    Active_Date: [null],
    Disable_Date: [null]
  });
  BNK_NoOptions: IDropdownItem[] = [];
  cardTypeOptions: { value: string, label: string }[] = [
    { value: 'V', label: 'VISA' },
    { value: 'M', label: 'MASTER' },
    { value: 'J', label: 'JCB' },
    { value: 'A', label: 'AE' },
    { value: 'D', label: 'DINERS' },
    { value: 'S', label: '銀聯卡' },
    { value: 'N', label: '聯合簽帳卡' },
    { value: 'O', label: '其他' },
  ];
  cardCategoryOptions: { value: string, label: string }[] = [
    { value: 'B', label: '商務卡' },
    { value: 'C', label: '普卡' },
    { value: 'G', label: '金卡' },
    { value: 'I', label: '無限卡' },
    { value: 'O', label: '其他' },
    { value: 'P', label: '白金卡' },
    { value: 'S', label: '御璽卡' },
    { value: 'T', label: '鈦金卡' },
  ];
  constructor(
    private readonly tls21040Service: Tls21040Service,
    private readonly validationService: ValidationService,
    private readonly dropDown: DropDownListService,
  ) { super(); }


  ngOnInit(): void {
    this.initializePage('TLS21040', this.dataForm);
    if (this.isFormEditable) {
      this.dataForm.controls.CRD_BinCode.disable();
    }
    // 當為建立模式時，監聽 CRD_BinCode 的變更並即時檢查是否重複
    if (this.isFormCreateable) {
      this.dataForm.controls.CRD_BinCode.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(val => {
          // 如果為空，清除自訂錯誤
          if (!val) {
            const ctrl = this.dataForm.controls.CRD_BinCode;
            const errs = ctrl.errors;
            if (errs && errs['binExists']) {
              delete errs['binExists'];
              if (Object.keys(errs).length === 0) ctrl.setErrors(null); else ctrl.setErrors(errs);
            }
          }
        }),
        switchMap((val: string) => {
          if (!val) return of({ Data: { exists: false } } as any);
          return this.tls21040Service.checkTLS21040_BIN({ CRD_BinCode: val }).pipe(
            catchError(err => {
              console.error('checkTLS21040_BIN error', err);
              return of({ Data: { exists: false } } as any);
            })
          );
        }),
        untilDestroyed(this)
      ).subscribe((res: any) => {
        const exists = res?.Data?.exists;
        const ctrl = this.dataForm.controls.CRD_BinCode;
        if (exists) {
          ctrl.setErrors({ ...(ctrl.errors || {}), binExists: true });
          this.messageService.errorBubble('BIN 碼已存在，請輸入其他 BIN');
        } else {
          const errs = ctrl.errors;
          if (errs && errs['binExists']) {
            delete errs['binExists'];
            if (Object.keys(errs).length === 0) ctrl.setErrors(null); else ctrl.setErrors(errs);
          }
        }
      });
    }
    // 取得發卡銀行下拉 (APS1001, 不含分行)
    this.dropDown.queryAPS1001NoBranch_DropDownList({ SearchKeyword: '' }).pipe(untilDestroyed(this)).subscribe({
      next: (res: ApiResponse<IDropdownItem[]>) => {
        if (res && res.Data) {
          this.BNK_NoOptions = res.Data.map((item: IDropdownItem) => ({ No: item.No, Name: item.Name, label: `${item.No}-${item.Name}`, value: item.No }));
        }
      },
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      const body = {
        ...frm.getRawValue(),
        ID: this.rowdata?.id || undefined,
        Active_Date: formatDateToYYYYMMDD(raw.Active_Date),
        Disable_Date: formatDateToYYYYMMDD(raw.Disable_Date)
      }
      const serviceCall = this.isFormCreateable
        ? this.tls21040Service.insertTLS21040(body)
        : this.tls21040Service.updateTLS21040(body);
      serviceCall.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe({
        next: (res) => {
          this.messageService.successBubble(res.Message);
          if (this.isFormCreateable) {
            this.dataForm.reset();
          } else if (this.isFormEditable) {
            this.onCancel();
          }
        },
      });
    });
  }
}
