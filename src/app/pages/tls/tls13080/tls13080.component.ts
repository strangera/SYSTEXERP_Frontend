import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // 引入 AbstractControl
import { untilDestroyed } from '@ngneat/until-destroy'; // 引入直到組件銷毀才停止訂閱的工具
import { TranslateModule } from '@ngx-translate/core'; //  引入 TranslateService
import { Tls13080InsertRequest, Tls13080QueryRequest, Tls13080Response, Tls13080Service } from '@service/api/tls/tls13080.service'; //  修正 Tls13080CreateRequest 為 Tls13080InsertRequest
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService, IAPS1003Item } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { TableSelectAllChangeEvent } from 'primeng/table';
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
    cap_type: [{ value: 'D', disabled: true }], // 扣款類型 (固定 D)
    cap_item: [null, [Validators.required]], // 扣款代號
    tpy_rate: [null, [Validators.required, Validators.max(100)]], // 抽成率% numeric(8, 6)
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
    ven_uniform: [null], // 廠商統一編號 (已修正為 ven_uniform)
    org_id: [null], // 組織代碼
    PageSize: [30],
    PageIndex: [1],
  });

  tlt_noListOptions = this.dropdown.queryTltTalent();
  bus_typeOptions = this.dropdown.queryTltBusType();
  tlt_term_typeOptions = getSYS1000Options('tlt_term_type');
  ven_uniform_noOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  org_idOptions = this.dropdown.querySys3100();
  capItemDetails: IAPS1003Item[] = [];

  isAllSelected = false;
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
    private readonly dropDownListService: DropDownListService,
    public readonly tls13080Service: Tls13080Service,
    private readonly datePipe: DatePipe,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS13080');
    this.setupConditionalValidation();
    this.dropDownListService.queryAPS1003DropDownList({ CAP_ItemList: [] }).pipe(untilDestroyed(this)).subscribe(data => {
      this.capItemDetails = data.Data;
    });
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

  private applyValidationRules(capSaletype: string | null, instmsTypeControl: AbstractControl, edcBankControl: AbstractControl): void {
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

  /**
   * 查詢邏輯
   */
  onSubmit(frm: FormGroup) {
    if (!this.dataForm.get('cap_item')?.value) {
      this.messageService.errorBubble('請先選擇 扣款代碼');
      return;
    }
    const body: Tls13080QueryRequest = {
      ...frm.getRawValue(),
      cap_item: this.dataForm.get('cap_item')?.value,
      tlt_bdate_Start: this.datePipe.transform(frm.value.tlt_bdate_Start, 'yyyy-MM-dd'),
      tlt_bdate_End: this.datePipe.transform(frm.value.tlt_bdate_End, 'yyyy-MM-dd'),
    } as Tls13080QueryRequest;
    this.handleSubmit(frm, () => {
      this.tls13080Service.queryTLS13080(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = body
        this.selectedItems = [];
      })
    });
  }
  /** 輔助方法：根據 cap_item 尋找 gui_flag */
  private getGuiFlagByCapItem(capItem: string | null): string {
    if (!capItem) return '';
    const detail = this.capItemDetails.find(item => item.CAP_Item === capItem); // 假設下拉選單的 value 對應 CAP_Item
    return detail ? detail.GUI_FLAG : 'N'; // 找不到則回傳預設值 'N'
  }
  /**
   * 新增邏輯
   */
  override onCreate(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = false;
      const formValue = frm.value;
      if (!this.selectedItems || this.selectedItems.length === 0) {
        this.messageService.warnBubble('請至少選擇一筆合約資料');
        return;
      }
      // 2. 組裝 selectList (選取的合約資訊)
      const selectList = this.selectedItems.map(item => ({
        talent_id: item.talent_id,
        tlt_bdate: item.tlt_bdate, // 直接使用 YYYY-MM-DD 格式
        tlt_edate: item.tlt_edate, // 直接使用 YYYY-MM-DD 格式
        org_id: item.org_id,
      }));
      // 3. 組裝完整 Request Body (扁平化結構)
      const request: Tls13080InsertRequest = {
        isAll: this.isAllSelected || false,
        cap_item: formValue.cap_item as string,
        cap_saletype: formValue.cap_saletype as string,
        instms_type: formValue.instms_type as string | null,
        edc_bank: formValue.edc_bank as string | null,
        pay_no: formValue.pay_no as string,
        gui_flag: this.getGuiFlagByCapItem(formValue.cap_item),
        tpy_rate: formValue.tpy_rate,
        selectList: selectList,
        Query: this.lastQueryBody || {} as Tls13080QueryRequest, // 傳入上次查詢條件，若為 null 則傳入空物件
      };

      // 4. 取得扣款代號名稱 (用於提示訊息)  修正邏輯
      const capItemOption = this.capItemDetails.find(opt => opt.CAP_Item === formValue.cap_item);
      const capItemName = capItemOption ? capItemOption.CAP_Name : formValue.cap_item; // 使用 CAP_Name

      // 取得銷售類型名稱 (如果提示訊息中也需要這個)
      const tpyRate = (formValue.tpy_rate || 0).toFixed(2);

      // 5. 提示確認訊息
      this.messageService.confirm({
        acceptLabel: '執行',
        rejectLabel: '取消',
        message: `共有 ${this.isAllSelected ? this.totalRecords : request.selectList.length} 家合約要增加 ${formValue.cap_item} (${capItemName}) 抽成率為 ${tpyRate}%`,
        header: `確認寫入合約？`,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.loading = true;
          this.tls13080Service.insertTLS13080(request).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe({
            next: (res) => {
              this.messageService.successBubble(res.Message);
              this.selectedItems = []; // 清空選取
              this.data = [];
              this.totalRecords = 0;
              this.queryForm.reset();
              this.dataForm.reset();
            },
          });
        }
      });
    });
  }

  selectAllChange(event: TableSelectAllChangeEvent) {
    console.log(event.checked);
  }
}
