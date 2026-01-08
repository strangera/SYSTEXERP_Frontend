import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2e060Data } from '@service/api/tls/tls2e060.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { Tls2e060DropDownListData, Tls2e060Service } from './../../../service/api/tls/tls2e060.service';

@Component({
  selector: 'app-tls2e060-cru',
  templateUrl: './tls2e060-cru.component.html',
  standalone: true,
  imports: [
    ButtonComponent,
    PanelModule,
    MenubarComponent,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgIf,
    InputTextareaComponent,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    InputNumberComponent
  ],
})
export class TLS2E060CRUComponent extends BasicCruPageComponent<Tls2e060Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    adj_no: [{ value: '系統自動產生', disabled: true }],
    adj_date: [{ value: new Date(), disabled: true }],
    sam_yyymm: [null, [Validators.required]],
    tlt_no: [null as Tls2e060DropDownListData | null, [Validators.required]],
    talent_id: [0],
    sam_termno: [0],
    contract_no: [{ value: '', disabled: true }],
    contract_subno: [{ value: 0, disabled: true }],
    adj_taxtype: [null, [Validators.required]],
    adj_amount: [null, [Validators.required, Validators.max(999999999999)]],
    remarks: [null, [Validators.maxLength(4000)]],
  });
  tlt_noOptions: Tls2e060DropDownListData[] = [];
  adj_taxtypeOptions = getSYS1000Options('PLU_TaxType');
  constructor(
    private readonly tls2e060Service: Tls2e060Service,
    private readonly datePipe: DatePipe
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS2E060', this.dataForm);

    this.tls2e060Service.queryTltTalentDropdownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.tlt_noOptions = (res.Data || []).map(item => ({
          ...item,
          label: `${item.tlt_no} - ${item.tlt_name}`
        }));

        // 編輯模式
        if (!this.isFormCreateable && this.rowdata) {
          // 找到對應的物件引用
          const targetOption = this.tlt_noOptions.find(opt => opt.tlt_no === this.rowdata?.tlt_no);

          if (targetOption && this.dataForm.controls.tlt_no) {
            // 因為沒給 optionValue，所以要塞入整個物件
            this.dataForm.controls.tlt_no.setValue(targetOption);

            // 順便把剩下的隱藏/顯示欄位填入
            this.dataForm.patchValue({
              contract_no: targetOption.contract_no,
              contract_subno: targetOption.contract_subno
            });
          }
        }
      });
  }
  onTltNoChange(event: Tls2e060DropDownListData): void {
    // 這裡的 event 通常是選中的整個物件 (Tls2e060DropDownListData)
    const selectedTlt = event;
    if (selectedTlt) {
      this.dataForm.patchValue({
        talent_id: selectedTlt.talent_id,
        contract_no: selectedTlt.contract_no,
        contract_subno: selectedTlt.contract_subno,
        sam_termno: selectedTlt.sam_termno
      });
    } else {
      // 清空時的處理
      this.dataForm.patchValue({
        talent_id: undefined,
        contract_no: '',
        contract_subno: undefined
      });
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.getRawValue(),
        sam_yyymm: this.datePipe.transform(frm.getRawValue().sam_yyymm, 'yyyyMM'),
        tlt_no: frm.getRawValue().tlt_no.tlt_no,
      }
      const request$ = this.isFormCreateable ? this.tls2e060Service.createTls2e060(body) : this.tls2e060Service.updateTls2e060(body);
      request$.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.messageService.successBubble(res.Message);
        if (this.isFormCreateable) {
          this.dataForm.reset();
        } else {
          this.onCancel();
        }
      })
    });
  }
}
