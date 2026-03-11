import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { YearMonthComponent } from '@pages/fin/fin11020/query-year-month/query-year-month.component';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount } from '@shared/componentkit/table-report/table-report.model';
import { Column } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { Tls55030ListData, Tls55030QueryBody, Tls55030Service } from './../../../service/api/tls/tls55030.service';
import { DropdownApiService } from './../../../service/utility/dropdown-api.service';

@Component({
  selector: 'app-tls55030',
  templateUrl: './tls55030.component.html',
  standalone: true,
  imports: [YearMonthComponent, RadiobuttonComponent, MultiSelectComponent, MultiSelectComponent, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, CalendarComponent, InputNumberRangeComponent, TranslateModule]
})
export class TLS55030Component extends BasicQueryPageComponent<Tls55030ListData> implements OnInit {
  queryForm = this.formBuilder.group({
    TABTYPE: [null], //單據種類
    PUR_GUINo: [null, [Validators.maxLength(16)]], // 發票/收據號碼
    PUR_GUIDate: [null], // 發票/收據日期
    ACP_YYYYMM: [null], // 	結帳年月
    PUR_RepYYYYMM: [null], // 申報年月
    VEN_Uniform: [null, [Validators.maxLength(16)]], // 廠商統一編號
    PUR_TaxType: [null], // 課稅別 稅別 0=免稅 1=應稅 2=零稅 宏誌課稅別(1:應2:零3:免
    GUI_Amt_Start: [null, [Validators.max(9999999999)]],  // 發票總額 起
    GUI_Amt_End: [null, [Validators.max(9999999999)]],  // 發票總額 迄
    Rebate_Net_Start: [null, [Validators.max(9999999999)]], // 折讓未稅金額 起
    Rebate_Net_End: [null, [Validators.max(9999999999)]], // 折讓未稅金額 迄
    Rebate_Tax_Start: [null, [Validators.max(9999999999)]], // 折讓稅額 起
    Rebate_Tax_End: [null, [Validators.max(9999999999)]], // 折讓稅額 迄
    PUR_VoucherType: [null], // 發票格式
    DIS_Status: [null], // 狀況 1 待結帳 2 已結帳 新增時1，月結後變更2
    DIS_EntryType: [null], // 折讓項目
    // CRT_USR_No: [],
    DIS_No: [null, [Validators.maxLength(16)]], // 折讓單維護編號
    PageIndex: [1],
    PageSize: [30]
  });
  TABTYPEOptions = getSYS1000Options('TABTYPE');
  DIS_StatusOptions = getSYS1000Options('DIS_Status');
  PUR_TaxTypeOptions = getSYS1000Options('PUR_TaxType');
  PUR_VoucherTypeOptions = getSYS1000Options('PUR_VoucherType').map(opt => ({ ...opt, label: `${opt.value} - ${opt.label}` }));
  DIS_EntryTypeOptions = getSYS1000Options('DIS_EntryType');
  tblUserOptions = this.dropdown.queryTblUser();
  data: Tls55030ListData[] = [];
  selectedItems: Tls55030ListData[] = [];
  totalRecords = 0;
  lastQueryBody: Tls55030QueryBody | null = null;
  columns: Column[] = [
    { field: 'DIS_No', header: '折讓單維護編號' },
    { field: 'ACP_YYYYMM', header: '結帳年月' },
    { field: 'VEN_No', header: '廠商編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'TABTYPE', header: '單據種類', format: (v) => getSYS1000('TABTYPE', v) },
    { field: 'PUR_VoucherType', header: '格式' },
    { field: 'DIS_Status', header: '狀況', format: (v) => getSYS1000('DIS_Status', v) },
    { field: 'Rebate_Amt', header: '總折讓金額', format: formatAmount },
  ];
  isRowSelectable = (item: Tls55030ListData) => item.DIS_Status === '1';
  editDisabled = (item: Tls55030ListData) => item.DIS_Status !== '1';
  constructor(
    private readonly dropdown: DropdownApiService,
    public readonly tls55030Service: Tls55030Service,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS55030', '/tls/tls55030cru', this.queryForm, (form) => this.onSubmit(form),);
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    const body = {
      ...frm.value,
      ACP_YYYYMM: this.datePipe.transform(frm.value.ACP_YYYYMM, 'yyyyMM'),
      PUR_GUIDate: this.datePipe.transform(frm.value.PUR_GUIDate, 'yyyy-MM-dd'),
    }
    this.handleSubmit(frm, () => {
      this.tls55030Service.queryTLS55030(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = body;
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
      })
    });
  }
  onDelete(event: Tls55030ListData[]) {
    this.messageService.confirm({
      message: `是否確認刪除選中的折讓單?`,
      header: `確認刪除`,
      accept: () => {
        const DIS_Nos = event.map(v => v.DIS_No);
        this.tls55030Service.deleteTLS55030({ DIS_Nos }).subscribe(() => {
          this.messageService.successBubble('刪除成功');
          this.onSubmit(this.queryForm);
          this.selectedItems = [];
        });
      }
    });
  }
}
