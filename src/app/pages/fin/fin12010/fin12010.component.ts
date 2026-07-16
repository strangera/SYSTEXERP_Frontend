import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { transformOptionsForExport } from 'src/app/others/componentextends/basic-print/basic-print-data.component';
import { formatAmount, formatDateTime, formatYYYYMM } from '../../../others/component/table/table.model';
import { Fin12010Service, IFin12010Data, IQueryFin12010Request } from '../../../service/api/fin/fin12010.service';
import { getSYS1000, getSYS1000Options } from '../../../service/system/sys1000.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextRangeComponent } from '../../../shared/components/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

@Component({
  selector: 'app-fin12010',
  templateUrl: './fin12010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputTextRangeComponent,
    MultiSelectComponent,
    TableReportComponent,
    TranslateModule,
    YearMonthComponent
  ],
})
//1.1.2.1 電子式發票各系統配號維護
export class FIN12010Component extends BasicQueryPageComponent<IFin12010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    SAL_GUIYYYYMM_start: ['', [Validators.required]], // 發票年月
    SAL_GUIYYYYMM_end: ['', [Validators.required]], // 發票年月
    SAL_GUITrack: ['', [Validators.maxLength(2)]], // 字軌
    SAL_GUINo_start: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.max(99999950)]], // 發票起始號碼
    SAL_GUINo_end: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.max(99999999)]], // 發票結束號碼
    SAL_TypeList: [[]], // 使用別
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'SAL_GUIYYYYMM', order: 1 }, { field: 'SAL_GUITrack', order: 1 }]],
  }, { validators: this.validationService.guiNumberRangeValidator('SAL_GUINo_start', 'SAL_GUINo_end') });
  totalRecords = 0;
  lastQueryBody: IQueryFin12010Request | null = null;
  data: IFin12010Data[] = [];
  selectedItems: IFin12010Data[] = [];
  columns: ReportColumn[] = [
    { field: 'SAL_GUIYYYYMM', header: '發票年月', visible: true, format: formatYYYYMM },
    { field: 'SAL_GUITrack', header: '字軌', visible: true },
    { field: 'SAL_GUIBegNo', header: '發票起始號碼', visible: true },
    { field: 'SAL_GUIEndNo', header: '發票結束號碼', visible: true },
    { field: 'SAL_LastUsedGUINo', header: '已使用的發票號', visible: true },
    {
      field: 'usageStatus', header: '使用狀態', visible: true,
      format: (_value: unknown, _index?: number, rowData?: IFin12010Data) => {
        if (!rowData) return '';
        if (!rowData.SAL_LastUsedGUINo) return '尚未使用';
        if (rowData.SAL_LastUsedGUINo === rowData.SAL_GUIEndNo) return '已用完';
        return '使用中';
      }
    },
    { field: 'SAL_Type', header: '使用別', visible: true, format: value => getSYS1000('T205', value), exportFormat: transformOptionsForExport(getSYS1000Options('T205')) }, // 修正為 '發票用途'
    { field: 'SAL_GUIBegMM', header: '起始月份', visible: false },
    { field: 'SAL_GUIEndMM', header: '終止月份', visible: false },
    { field: 'SAL_GUIPaper', header: '發票類別', visible: false, format: value => getSYS1000('SAL_GUIPaper', value), exportFormat: transformOptionsForExport(getSYS1000Options('SAL_GUIPaper')) }, // 修正為 '發票類別'
    { field: 'SAL_VoidGUICnt', header: '作廢發票張數', visible: false, format: formatAmount },
    { field: 'SAL_BlankCnt', header: '發票張數', visible: false, format: formatAmount },
    { field: 'SAL_SAmt', header: '應稅金額', visible: false, format: formatAmount },
    { field: 'SAL_TaxAmt', header: '稅額', visible: false, format: formatAmount },
    { field: 'SAL_NoTaxAmt', header: '免稅金額', visible: false, format: formatAmount }, // 修正為 '免稅金額'
    { field: 'SAL_ZeroTaxAmt', header: '零稅金額', visible: false, format: formatAmount }, // 修正為 '零稅金額'
    { field: 'STR_Uniform', header: '統一編號', visible: false }, // 修正為 '統一編號'
    { field: 'STO_No', header: '分店編號', visible: false }, // 修正為 '分店編號'
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime }, // 修正為 '建立日期'
    { field: 'CRT_USR_No', header: '建立人員', visible: false }, // 修正為 '建立人員'
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime }, // 修正為 '變更日期'
    { field: 'UPD_USR_No', header: '變更人員', visible: false }, // 修正為 '變更人員'
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
  ];
  usageTypeOptions = getSYS1000Options('T205');
  SAL_GUIPaperOptions = getSYS1000Options('SAL_GUIPaper');
  constructor(
    public readonly fin12010Service: Fin12010Service,
    private readonly validationService: ValidationService,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('FIN12010', '/FIN/FIN12010cru', this.queryForm, (form) => this.onSubmit(form));
    // 設定發票年月預設值
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
    if (currentMonth % 2 === 0) {
      currentDate.setMonth(currentDate.getMonth() - 1);
    }
    this.queryForm.get('SAL_GUIYYYYMM_start')?.setValue(
      this.datePipe.transform(currentDate, 'yyyyMM'));
    this.queryForm.get('SAL_GUIYYYYMM_end')?.setValue(
      this.datePipe.transform(currentDate, 'yyyyMM'));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin12010Service.queryFIN12010(frm.value).pipe(finalize(() => this.loading = false)).pipe(untilDestroyed(this)).subscribe(res => {
        this.data = res.Data;
        this.lastQueryBody = frm.value;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  onDelete(selectedRows: IFin12010Data[]) {
    if (!selectedRows || selectedRows.length === 0) return;
    this.messageService.confirm({
      header: `是否確認刪除 ${selectedRows.length} 筆資料?`,
      accept: () => {
        const idList = selectedRows.map(row => row.id);
        this.loading = true;
        this.fin12010Service.deleteFIN12010(idList)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(() => {
            this.messageService.successBubble('刪除成功');
            this.onSubmit(this.queryForm); // 重新查詢資料
            this.selectedItems = []; // 清空已選項目（假設你有這個變數）
          });
      }
    });
  }
}
