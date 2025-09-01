import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatAmount, formatDateTime, formatYN, formatYYYYMM } from '../../../shared/componentkit/table/table.model';
import { SystemOptionsService } from '../../../service/system/sys1000.service';
import { SystemOption } from '../../../shared/models/sys/sys1000.model';
import { Fin12010Service, IFin12010Data } from '../../../service/api/fin/fin12010.service';
import { finalize } from 'rxjs';
import { formatDate as dateFnsFormatDate } from '@angular/common';
import { SAL_GUIPaperOptions } from '../fin11030/fin11030.model';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';
import { firstDayOfCurrentPeriod, lastDayOfCurrentPeriod } from '@shared/models/system/query-form.model';

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
    CalendarRangeComponent,
    InputTextComponent,
    InputTextRangeComponent,
    MultiSelectComponent,
    TableComponent,
    TranslateModule,
  ],
})
//1.1.2.1 電子式發票各系統配號維護
export class FIN12010Component extends BasicQueryPageComponent<IFin12010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    SAL_GUIYYYYMM_start: [firstDayOfCurrentPeriod, [Validators.required]], // 發票年月
    SAL_GUIYYYYMM_end: [lastDayOfCurrentPeriod, [Validators.required]], // 發票年月
    SAL_GUITrack: ['', [Validators.maxLength(2)]], // 字軌
    SAL_GUINo_start: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.max(99999950)]], // 發票起始號碼
    SAL_GUINo_end: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.max(99999999)]], // 發票結束號碼
    SAL_TypeList: [[]], // 使用別
    ...createPaginationConfig([{ field: 'id', order: 1 }]), // 分頁和排序參數
  }, { validators: this.validationService.guiNumberRangeValidator('SAL_GUINo_start', 'SAL_GUINo_end') });
  totalRecords = 0;
  data: IFin12010Data[] = [];
  selectedItems: IFin12010Data[] = [];
  columns: Column[] = [
    { field: 'SAL_GUIYYYYMM', header: '發票年月', visible: true, format: formatYYYYMM },
    { field: 'SAL_GUITrack', header: '字軌', visible: true },
    { field: 'SAL_GUIBegNo', header: '發票起始號碼', visible: true },
    { field: 'SAL_GUIEndNo', header: '發票結束號碼', visible: true },
    { field: 'SAL_LastUsedGUINo', header: '已使用的發票號', visible: true },
    { field: 'SAL_Type', header: '使用別', visible: true, format: value => this.usageTypeOptions.find(x => x.SYS_Code === value)?.SYS_Name || value }, // 修正為 '發票用途'
    { field: 'GUI_DingType', header: '是否為丁種發票', visible: true, format: formatYN },
    { field: 'SAL_GUIBegMM', header: '起始月份', visible: false },
    { field: 'SAL_GUIEndMM', header: '終止月份', visible: false },
    { field: 'SAL_GUIPaper', header: '發票類別', visible: false, format: value => this.SAL_GUIPaperOptions.find(x => x.value === value)?.label || value }, // 修正為 '發票類別'
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
  usageTypeOptions: SystemOption[] = SystemOptionsService.getOptions('T205');
  SAL_GUIPaperOptions = SAL_GUIPaperOptions
  constructor(
    private fin12010Service: Fin12010Service,
    private validationService: ValidationService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('FIN12010', '/FIN/FIN12010cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      const SAL_GUIYYYYMM_start = formValue.SAL_GUIYYYYMM_start ? dateFnsFormatDate(formValue.SAL_GUIYYYYMM_start, 'yyyyMM', 'en-US') : '';
      const SAL_GUIYYYYMM_end = formValue.SAL_GUIYYYYMM_end ? dateFnsFormatDate(formValue.SAL_GUIYYYYMM_end, 'yyyyMM', 'en-US') : '';
      const body = {
        ...formValue,
        SAL_GUIYYYYMM_start,
        SAL_GUIYYYYMM_end,
      };
      this.fin12010Service.queryFIN12010(body).pipe(finalize(() => this.loading = false)).pipe(untilDestroyed(this)).subscribe(res => {
        this.data = res.Data.map(item => ({
          ...item,
          SAL_GUIYYYYMM: item.SAL_GUIYYYYMM
            ? new Date(+item.SAL_GUIYYYYMM.substring(0, 4), +item.SAL_GUIYYYYMM.substring(4, 6) - 1, 1)
            : null,
        }));

        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, formValue);
      });
    });
  }

  onDelete(selectedRows: IFin12010Data[]) {
    if (!selectedRows || selectedRows.length === 0) return;

    const idList = selectedRows.map(row => row.id);
    this.loading = true;

    this.fin12010Service.deleteFIN12010(idList)
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.messageService.successBubble('刪除成功');
          this.onSubmit(this.queryForm); // 重新查詢資料
          this.selectedItems = []; // 清空已選項目（假設你有這個變數）
        },
        error: () => {
          this.messageService.errorBubble('刪除失敗');
        }
      });
  }

}
