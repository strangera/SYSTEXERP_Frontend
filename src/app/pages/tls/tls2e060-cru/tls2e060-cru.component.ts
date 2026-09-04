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
    contract_no: [{ value: '', disabled: true }],
    money_type: [{ value: null as string | null, disabled: true }],
    sam_termno: [null as number | null, [Validators.required]],
    adj_taxtype: [null, [Validators.required]],
    adj_amount: [null, [Validators.required, Validators.max(999999999999)]],
    remarks: [null, [Validators.maxLength(4000)]],
  });
  tlt_noOptions: Tls2e060DropDownListData[] = [];
  adj_taxtypeOptions = getSYS1000Options('PLU_TaxType');
  money_typeOptions = getSYS1000Options('money_type');
  sam_termnoOptions: { value: number; label: string }[] = []; // 帳次選項，依結帳方式變動
  private readonly SAM_TERMNO_MAP: Record<string, number[]> = {
    '10': [1, 2, 3], // 十日結
    '15': [1, 2],    // 半月結
    '30': [1],       // 月結
  };
  constructor(
    private readonly tls2e060Service: Tls2e060Service,
    private readonly datePipe: DatePipe
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS2E060', this.dataForm);

    // 編輯/檢視模式：initializePage 已經用這筆資料本身存的 money_type 回填，這裡只需要
    // 補算帳次選項，並把 sam_termno（後端是字串）轉成 number 讓下拉能正確選中。
    // 之後即使去查專櫃下拉清單，也不會用「目前」的專櫃資料覆蓋掉這筆資料當初存的結帳方式/帳次。
    if (!this.isFormCreateable && this.rowdata) {
      this.updateSamTermnoOptions(this.rowdata.money_type);
      this.dataForm.patchValue({
        sam_termno: this.rowdata.sam_termno != null ? Number(this.rowdata.sam_termno) : null
      });
    }

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
        this.updateSamTermnoOptions(null);
        this.dataForm.patchValue({ money_type: null, sam_termno: null });
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

        // 編輯/檢視模式：只補上 talent_id（送出 API 需要，但查詢清單資料沒有這個內部 ID）。
        // 結帳方式/帳次沿用這筆資料本身存的值（上面已從 rowdata 帶入），不要被這裡查到的
        // 「該專櫃目前」的結帳方式/帳次覆蓋掉。
        if (!this.isFormCreateable && this.rowdata) {
          const targetOption = this.tlt_noOptions.find(
            opt => opt.tlt_no === this.rowdata?.tlt_no
          );

          if (targetOption) {
            this.dataForm.patchValue({ talent_id: targetOption.talent_id });
          }
        }
      });
  }
  /** 依結帳方式 (money_type) 重算帳次 (sam_termno) 選項：月結=1，半月結=1、2，十日結=1、2、3 */
  private updateSamTermnoOptions(moneyType: string | null): void {
    const termNumbers = moneyType ? this.SAM_TERMNO_MAP[moneyType] : undefined;
    this.sam_termnoOptions = termNumbers ? termNumbers.map(num => ({ value: num, label: `${num}` })) : [];
  }
  onTltNoChange(tltNo: string | null): void {
    // valueChange 拿到的是 optionValue (tlt_no 字串)，從選單找回完整物件帶欄位
    const selectedTlt = this.tlt_noOptions.find(opt => opt.tlt_no === tltNo);
    if (selectedTlt) {
      this.updateSamTermnoOptions(selectedTlt.money_type);
      this.dataForm.patchValue({
        talent_id: selectedTlt.talent_id,
        contract_no: selectedTlt.contract_no,
        money_type: selectedTlt.money_type,
        sam_termno: 1 // 選擇專櫃編號一律預設帶入帳次 1，不取該專櫃目前既有的帳次
      });
    } else {
      // 清空時的處理
      this.updateSamTermnoOptions(null);
      this.dataForm.patchValue({
        talent_id: undefined,
        contract_no: '',
        money_type: null,
        sam_termno: null
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
