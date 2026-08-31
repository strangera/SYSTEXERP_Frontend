import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2e060Data } from '@service/api/tls/tls2e060.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
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
    tlt_no: [null as string | null, [Validators.required]],
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

    // 1. 初始化時先禁用專櫃下拉 (如果年月沒值)
    if (!this.dataForm.controls.sam_yyymm.value) {
      this.dataForm.controls.tlt_no.disable();
    }

    // 2. 監聽 結帳年月 的變化
    this.dataForm.controls.sam_yyymm.valueChanges.pipe(untilDestroyed(this)).subscribe((val) => {
      const formattedYYYMM = this.datePipe.transform(val, 'yyyyMM');
      if (formattedYYYMM) {
        this.fetchTltOptions(formattedYYYMM);
      } else {
        // 沒年月，清空並禁用
        this.tlt_noOptions = [];
        this.dataForm.controls.tlt_no.setValue(null);
        this.dataForm.controls.tlt_no.disable();
      }
    });

    // 3. 如果是編輯模式，初始就有年月，直接觸發一次查詢
    if (!this.isFormCreateable && this.rowdata?.sam_yyymm) {
      this.fetchTltOptions(this.rowdata?.sam_yyymm);
    }
  }
  /** 封裝打 API 的邏輯 */
  private fetchTltOptions(yyyymm: string): void {
    this.loading = true; // 開啟讀取狀態
    this.tls2e060Service.queryTltTalentDropdownList(yyyymm)
      .pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this)
      )
      .subscribe(res => {
        this.tlt_noOptions = (res.Data || []).map(item => ({
          ...item,
          label: `${item.tlt_no} - ${item.tlt_name}`
        }));

        // 啟用下拉選單 (檢視模式維持鎖定)
        if (!this.isFormReadable) {
          this.dataForm.controls.tlt_no.enable();
        }

        // 編輯模式回填
        if (!this.isFormCreateable && this.rowdata) {
          const targetOption = this.tlt_noOptions.find(
            opt => opt.tlt_no === this.rowdata?.tlt_no
          );

          if (targetOption) {
            this.dataForm.controls.tlt_no.setValue(targetOption.tlt_no);

            this.dataForm.patchValue({
              talent_id: targetOption.talent_id,
              contract_no: targetOption.contract_no,
              contract_subno: targetOption.contract_subno,
              sam_termno: targetOption.sam_termno
            });
          }
        }
      });
  }
  onTltNoChange(tltNo: string | null): void {
    // valueChange 拿到的是 optionValue (tlt_no 字串)，從選單找回完整物件帶欄位
    const selectedTlt = this.tlt_noOptions.find(opt => opt.tlt_no === tltNo);
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
