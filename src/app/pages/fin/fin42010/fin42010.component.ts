import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { fin42010DetailData, FIN42010Service } from './../../../service/api/fin/fin42010.service';
// Services
// Shared
import { CommonModule, formatDate } from '@angular/common';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { apiOption, option } from '@shared/models/sys/sysb000.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { TableComponent } from '../../../others/component/table/table.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { TableSubheaderComponent } from './fin42010-table/fin42010-table.component';

@Component({
  selector: 'app-fin42010',
  templateUrl: './fin42010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    CommonModule,
    CalendarComponent,
    TableSubheaderComponent,
    ButtonModule]
})
export class FIN42010Component extends BasicQueryPageComponent<fin42010DetailData> implements OnInit {
  queryForm = this.formBuilder.group({
    BudgetVersion: [null, [Validators.required]], //版本
    BudgetYear: [null, [Validators.required]], //年
    OrgId: [null], //部門
    AmtUnit: [1, [Validators.required]], // 金額單位表示
  });

  totalRecords = 0;// 分頁和排序參數 // 排序需要
  lastQueryBody = null;

  OrgId_Options: option[] = [];
  AmtUnit_Options = [
    { value: 1, label: '元' },
    { value: 2, label: '千' },
    { value: 3, label: '萬' }];

  data: fin42010DetailData[] = [];
  filteredData = [...this.data];
  columns = [
    // { field: 'SortNo', header: 'SortNo', visible: true },
    // { field: 'LevelNo', header: 'LevelNo', visible: true },
    { field: '科目代號', header: '科目代號', visible: true },
    { field: '科目名稱', header: '科目名稱', visible: true },
    { field: '1月', header: '1月', format: formatAmount, visible: true },
    { field: '2月', header: '2月', format: formatAmount, visible: true },
    { field: '3月', header: '3月', format: formatAmount, visible: true },
    { field: '4月', header: '4月', format: formatAmount, visible: true },
    { field: '5月', header: '5月', format: formatAmount, visible: true },
    { field: '6月', header: '6月', format: formatAmount, visible: true },
    { field: '7月', header: '7月', format: formatAmount, visible: true },
    { field: '8月', header: '8月', format: formatAmount, visible: true },
    { field: '9月', header: '9月', format: formatAmount, visible: true },
    { field: '10月', header: '10月', format: formatAmount, visible: true },
    { field: '11月', header: '11月', format: formatAmount, visible: true },
    { field: '12月', header: '12月', format: formatAmount, visible: true },
    { field: '預算總金額', header: '預算總金額', format: formatAmount, visible: true }
  ];

  // 控制變數
  btnLoading = false;

  constructor(
    private readonly fin42010Service: FIN42010Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN42010', 'fin/fin42010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    const payload = {
      ...frm.value,
      BudgetYear: formatDate(frm.getRawValue().BudgetYear, 'yyyy', 'en-US'),
    }
    console.log('損益表request', payload)
    this.handleSubmit(frm, () => {
      this.fin42010Service.queryFIN42010(payload).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        if (response.Status == "0000") {
          this.data = response.Data.Details;
          console.log('損益表response', response.Data);
          this.lastQueryBody = payload;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, payload);
        } else {
          this.messageService.errorBubble(response.Message);
        }
      });
    });
  }

  //列印
  btnPDFLoading = false;
  btnExcelLoading = false;
  printPDF(isPDF: boolean) {
    if (!this.lastQueryBody) return;
    if (isPDF) {
      this.btnPDFLoading = true;
      this.fin42010Service.exportPDFFIN42010(this.lastQueryBody)
        .pipe(finalize(() => this.btnPDFLoading = false))
        .subscribe(blob => this.downloadFile(blob, 'application/pdf', '預算損益表.pdf'));
    } else {
      this.btnExcelLoading = true;
      this.fin42010Service.exportExcelFIN42010(this.lastQueryBody)
        .pipe(finalize(() => this.btnExcelLoading = false))
        .subscribe(blob => this.downloadFile(blob, 'application/vnd.ms-excel', '預算損益表.xlsx'));
    }
  }

  //讀取下拉  
  loadOptions() {
    //部門 下拉
    this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.OrgId_Options = res.Data.map((item: apiOption) => ({
        value: item.No,
        label: item.No + '-' + item.Name,
      }));
      // console.log('res', res.Data);
    });
  }

  // 下載pdf/excel
  private downloadFile(blob: Blob, type: string, fileName: string) {
    const newBlob = new Blob([blob], { type });
    const url = URL.createObjectURL(newBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}
/**
 * 格式化金額。
 *
 * 功能：
 * 1. null / undefined / 空字串 顯示空白
 * 2. 可以轉成數字時，加上千分位
 * 3. 不能轉成數字時，直接顯示原值
 */
const formatAmount = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return String(value);
  }

  return num.toLocaleString();
};