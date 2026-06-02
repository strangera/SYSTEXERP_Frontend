import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { InsertTLS27020, TLS27020Data, TLS27020Service, UpdateTLS27020 } from '@service/api/tls/tls27020.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService, ITalentOption } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { PanelModule } from 'primeng/panel';
import { finalize, take } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-tls27020-cru',
  templateUrl: './tls27020-cru.component.html',
  standalone: true,
  imports: [AsyncPipe, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputTextComponent, ButtonComponent, NgIf, TranslateModule, InputNumberComponent, DropdownComponent]
})
export class TLS27020CRUComponent extends BasicCruPageComponent<TLS27020Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    TXN_Date: ['', Validators.required], // 銷售日期
    ECR_No: ['', Validators.required], // 收銀機號
    TLT_NO: [''], // 專櫃編號
    TLT_Name: [{ value: '', disabled: true }], // 櫃位名稱
    magneticCard: [''], // 磁卡編號 目前資料庫沒有
    TSDP_DepositAmt: [{ value: '', disabled: true }], /*顯示用金額*/
    PayAmt: [null, [Validators.max(99999999), Validators.required]], /*存入金額*/
  });
  TLTTALENT_DropDownList: ITalentOption[] = [];
  ECR_NoOptions = this.dropdown.queryPos1002();
  constructor(
    private readonly dropDownList: DropDownListService,
    private readonly tLS27020Service: TLS27020Service,
    private readonly datePipe: DatePipe,
    private readonly dropdown: DropdownApiService,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS27020', this.dataForm);
    // 專櫃下拉選單 (TLTTALENT) 與連動邏輯
    this.dropDownList.queryTLTTALENTDropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.TLTTALENT_DropDownList = res.Data.map(item => ({
        ...item,
        label: `${item.tlt_no}-${item.tlt_name}`,
        No: item.tlt_no,
        Name: item.tlt_name
      }));

      // 初始化 TLT_Name
      const selectedItem = this.TLTTALENT_DropDownList.find(item => item.No === this.rowdata?.TLT_NO)?.Name ?? '';
      this.dataForm.controls.TLT_Name.setValue(selectedItem);
      this.dataForm.controls.TLT_Name.disable({ emitEvent: false });

      // 監聽 TLT_NO 變動，自動帶入 Name
      this.dataForm.controls.TLT_NO.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
        const selectedItem = this.TLTTALENT_DropDownList.find(item => item.No === value)?.Name ?? '';
        this.dataForm.controls.TLT_Name.setValue(selectedItem);
        this.dataForm.controls.TLT_Name.disable({ emitEvent: false });
      });
    });
  }

  onECRNoChange(ECR_No: string): void {
    if (ECR_No) {
      this.ECR_NoOptions.pipe(take(1)).subscribe(options => {
        if (options) {
          // 1. 尋找對應的選項物件
          const selectedOption = options.find(opt => opt.value === ECR_No);
          if (selectedOption && selectedOption['ECR_TLT_No']) {
            this.dataForm.patchValue({ TLT_NO: selectedOption['ECR_TLT_No'] });
          }
        }
      });
    }
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const serviceCall = this.isFormCreateable
        ? this.tLS27020Service.insertTLS27020(this.createTLS27020(frm))
        : this.tLS27020Service.updateTLS27020(this.updateTLS27020(frm));
      serviceCall.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe({
        next: (res) => {
          if (res.Data) {
            this.messageService.successBubble(res.Message);
            if (this.isFormCreateable) {
              this.dataForm.reset();
            } else if (this.isFormEditable) {
              this.onCancel();
            }
          }
          else {
            this.messageService.warnBubble(res.Message);
          }
        },
      });
    });
  }
  createTLS27020(frm: FormGroup): InsertTLS27020 {
    return {
      ...frm.value,
      TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd'),
      TSDP_DepositAmt: frm.value.PayAmt || 0,
      magneticCard: undefined, //! 磁卡編號 目前資料庫沒有
      Talent_ID: this.TLTTALENT_DropDownList.find(item => item.No === frm.getRawValue().TLT_NO)?.talent_id || null,
    }
  }
  updateTLS27020(frm: FormGroup): UpdateTLS27020 {
    return {
      ...frm.value,
      TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd'),
      ID: this.rowdata?.ID ?? 0,
      TSDP_DepositAmt: this.rowdata?.TSDP_DepositAmt ?? null,
      PRM_TSDP_DepositAmt: this.rowdata?.PRM_TSDP_DepositAmt ?? null,
      Talent_ID: this.TLTTALENT_DropDownList.find(item => item.No === frm.getRawValue().TLT_NO)?.talent_id || null,
      old_ECR_No: this.rowdata?.ECR_No ?? '',
      old_TXN_Date: this.datePipe.transform(this.rowdata?.TXN_Date, 'yyyy-MM-dd'),
    };
  }
}
