import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // 引入 AbstractControl
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { AccordionModule } from 'primeng/accordion';
import { untilDestroyed } from '@ngneat/until-destroy'; // 引入直到組件銷毀才停止訂閱的工具
import { PanelModule } from 'primeng/panel';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { Tls13080CreateRequest, Tls13080QueryRequest, Tls13080Response, Tls13080Service } from '@service/api/tls/tls13080.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls13080',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    ButtonComponent,
    ReactiveFormsModule,
    TranslateModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    DropdownComponent,
    InputNumberComponent,
    AsyncPipe,
    PanelModule,
    TableReportComponent
  ],
  templateUrl: './tls13080.component.html'
})
export class TLS13080Component extends BasicQueryPageComponent<Tls13080Response> implements OnInit {
  formTitle = '合約扣款項目';
  dataForm = this.formBuilder.nonNullable.group({
    cap_type: [{ value: 'D', disabled: true }], // 扣款類型
    cap_item: [null, [Validators.required]], // 扣款代號
    tpy_rate: [null, [Validators.required, Validators.max(9999999)]], // 抽成率% numeric(8, 6)
    cap_saletype: [null, [Validators.required]], // 銷售類型
    instms_type: [null], // 期數
    edc_bank: [null], // 收單行
    pay_no: [null, [Validators.required]], // 支付編號
  });
  cap_itemOptions = this.dropdown.queryAps1003({ cap_typeList: ['D'] });
  cap_saletypeOptions = getSYS1000Options('CAP_SaleType').filter(option => {
    const allowedValues = ['1', '2', '3', '5', '52', '55'];
    return allowedValues.includes(option.value as string);
  });
  instms_typeOptions = getSYS1000Options('instms_type');
  edc_bankOptions = getSYS1000Options('EDC_Bank');
  pay_noOptions = this.dropdown.queryPos1006();
  queryForm = this.formBuilder.nonNullable.group({
    tlt_noList: [null], // 專櫃編號
    bus_type: [null], // 大分類
    tlt_bdate_Start: [null], // 契約起日
    tlt_bdate_End: [null], // 契約迄日
    tlt_term_type: [null], // 抽成別
    ven_uniform: [null], // 廠商統一編號
    org_id: [null], // 組織代碼
  });

  tlt_noListOptions = this.dropdown.queryTltTalent();
  bus_typeOptions = this.dropdown.queryTltBusType();
  tlt_term_typeOptions = getSYS1000Options('tlt_term_type');
  ven_uniform_noOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  org_idOptions = this.dropdown.querySys3100();

  data: Tls13080Response[] = [];
  selectedItems: Tls13080Response[] = [];
  columns: ReportColumn[] = [
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '專櫃名稱' },
    { field: 'tlt_bdate', header: '契約起始日' },
    { field: 'tlt_edate', header: '契約到期日' },
    { field: 'tlt_term_type_Name', header: '抽成別' },
    { field: 'bus_type', header: '大分類' },
    { field: 'bus_type_name', header: '大分類名稱' },
    { field: 'contract_no', header: '合約編號' },
    { field: 'contract_subno', header: '合約版次' },
  ];
  totalRecords = 0;
  lastQueryBody: Tls13080QueryRequest | null = null;

  constructor(
    private readonly dropdown: DropdownApiService,
    public readonly tls13080Service: Tls13080Service,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS13080');
    this.setupConditionalValidation();
  }

  /** 根據 cap_saletype 變化，動態設置 instms_type 和 edc_bank 的必填規則 */
  private setupConditionalValidation(): void {
    const capSaletypeControl = this.dataForm.get('cap_saletype');
    const instmsTypeControl = this.dataForm.get('instms_type');
    const edcBankControl = this.dataForm.get('edc_bank');
    if (!capSaletypeControl || !instmsTypeControl || !edcBankControl) return;
    // 首次載入時執行一次，確保初始狀態正確
    this.applyValidationRules(capSaletypeControl.value, instmsTypeControl, edcBankControl);
    capSaletypeControl.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      this.applyValidationRules(value, instmsTypeControl, edcBankControl);
    });
  }

  private applyValidationRules(
    capSaletype: string | null,
    instmsTypeControl: AbstractControl,
    edcBankControl: AbstractControl
  ): void {
    // 預設先清除所有必填和值
    instmsTypeControl.clearValidators();
    instmsTypeControl.setValue(null, { emitEvent: false });
    edcBankControl.clearValidators();
    edcBankControl.setValue(null, { emitEvent: false });
    if (capSaletype === '2') {
      // 情況 1: 銷售類型選 '2' (收單行必填)
      edcBankControl.setValidators([Validators.required]);
    } else if (capSaletype === '3') {
      // 情況 2: 銷售類型選 '3' (期數跟收單行都要必填)
      instmsTypeControl.setValidators([Validators.required]);
      edcBankControl.setValidators([Validators.required]);
    }
    // 情況 3: 其他 (兩個都非必填，已在前面處理)
    // 更新控制項狀態以觸發驗證和錯誤訊息更新
    instmsTypeControl.updateValueAndValidity();
    edcBankControl.updateValueAndValidity();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls13080Service.queryTLS13080(frm.getRawValue()).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = frm.getRawValue();
        this.selectedItems = [];
      })
    });
  }

  override onCreate(frm: FormGroup) {
    // 1. 驗證扣款資訊表單
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      const request: Tls13080CreateRequest = this.selectedItems.map(item => ({
        talent_id: item.talent_id,
        cap_type: formValue.cap_type as string, // 'D' // '?' 要傳？ // TODOL 後端應該會自動帶入
        cap_item: formValue.cap_item as string,
        tpy_bdate: '?', // this.getYYMM(item.tlt_bdate), // TODO: 不確定是否需要轉？ convert(varchar(6), tlttalent.tlt_bdate, 112)
        tpy_edate: '?', // this.getYYMM(item.tlt_edate), // TODO: 不確定是否需要轉？ convert(varchar(6), tlttalent.tlt_edate, 112)
        tpy_amount: 0, // TODO // '?'
        tpy_totalamt: 0, // TODO // '?'
        down_payment: 0, // TODO // '?'
        period_nos: 0, // TODO // '?'
        cap_saletype: formValue.cap_saletype as string,
        edc_bank: formValue.edc_bank as string | null,
        instms_type: formValue.instms_type as string | null,
        pay_no: formValue.pay_no as string,
        tpy_rate: (formValue.tpy_rate || 0) / 100, // TODO: 這邊可能後端會算，那前端就直接給值
        org_id: '?' // item.org_id, // 組織代碼取自選取的合約資料 // TODO: 不確定要不要給後端？
      }));
      // 4. 提示確認訊息
      this.confirmationService.confirm({
        acceptLabel: '執行',
        rejectLabel: '取消',
        message: `共有 ${request.length} 家合約要增加 NN XXXXX 抽成率為 999.99%`, // TODO 確認NN 跟 XX 是啥
        header: `確認寫入合約？`,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.loading = true;
          this.tls13080Service.createTLS13080(request).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
            this.messageService.successBubble(res.Message);
            this.selectedItems = []; // 清空選取
            this.data = []; // 清空表格資料
            this.totalRecords = 0; // 清空總筆數
            this.lastQueryBody = null; // 清空上次查詢條件
          });
        }
      });
    });
  }
}
