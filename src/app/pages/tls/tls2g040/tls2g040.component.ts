import { AsyncPipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS2G040Data, TLS2G040Service } from '@service/api/tls/tls2g040.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatAmount } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { debounceTime, finalize, skip } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { bus_classColumns, bus_sclassColumns, bus_typeColumns, org_idColumns, report_typeOptions, tlt_noColumns } from './tls2g040.model';

// 2.2.16.4 預算日報表
@Component({
  selector: 'app-tls2g040',
  templateUrl: './tls2g040.component.html',
  standalone: true,
  imports: [ButtonModule, DropdownComponent, RadiobuttonComponent, AsyncPipe, MultiSelectComponent, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, TranslateModule]
})
export class TLS2G040Component extends BasicQueryPageComponent<TLS2G040Data> implements OnInit {
  queryForm = this.formBuilder.group({
    budget_yymm: [null, [Validators.required]], // 年月
    bus_type: [null], // 大分類
    bus_class: [null as any], // 中分類
    bus_sclass: [null as any], // 小分類
    org_ids: [null], // 組織
    tlt_nos: [null], // 專櫃
    report_type: ['bus_type', [Validators.required]],
  });
  CAT_LNoOptions: IDropdownItem[] = [];
  CAT_MNoOptions: IDropdownItem[] = [];
  CAT_SNoOptions: IDropdownItem[] = [];
  org_idOptions = this.dropdown.querySys3100();
  tlt_noOptions = this.dropdown.queryTltTalent();
  report_typeOptions = report_typeOptions;
  totalRecords = 0;
  data: TLS2G040Data[] = [];
  footerTotal: TLS2G040Data | null = null;
  columns: ReportColumn[] = bus_typeColumns;
  lastQueryForm: any;
  btnLoading = false;
  constructor(
    private readonly dropdown: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
    public readonly tls2g040Service: TLS2G040Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2G040', '/tls/tls2g040cru');
    this.queryForm.valueChanges.pipe(debounceTime(200)).subscribe(() => {
      this.updateColumns();
    });// 獲取大分類下拉選項
    this.dropDownListService.queryTLTBUSTYPE_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.CAT_LNoOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
    });
    // 監聽大分類變化
    this.queryForm.controls.bus_type.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((value) => {
      if (value) {
        this.dropDownListService.queryTLTBUSCLASS_DropDownList({ bus_type: [value] }).pipe(untilDestroyed(this)).subscribe(response => {
          this.CAT_MNoOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
          this.queryForm.controls.bus_class.enable();
        });
      } else {
        this.queryForm.controls.bus_class.disable();
      }
      this.queryForm.controls.bus_class.setValue(null); // 清空中分類選擇
      this.queryForm.controls.bus_sclass.setValue(null); // 清空中分類選擇
    });
    // 監聽中分類變化
    this.queryForm.controls.bus_class.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe((value) => {
      if (value && this.queryForm.controls.bus_type.value) {
        this.dropDownListService.queryTLTBUSSCLASS_DropDownList({
          queryTLTBUSSCLASSInfos: [
            {
              bus_type: this.queryForm.controls.bus_type.value,
              bus_class: value
            }
          ]
        }).pipe(untilDestroyed(this)).subscribe(response => {
          this.CAT_SNoOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, }));
        });
        this.queryForm.controls.bus_sclass.enable();
      } else {
        this.queryForm.controls.bus_sclass.disable();
      }
      this.queryForm.controls.bus_sclass.setValue(null); // 清空中分類選擇
    });
    this.updateColumns();
    // 當報表格式變更時直接觸發查詢（不需額外按確認）
    this.queryForm.controls.report_type.valueChanges.pipe(debounceTime(200), skip(1), untilDestroyed(this)).subscribe(() => {
      // 只有在表單主要必要欄位存在時才觸發查詢
      if (this.queryForm.get('budget_yymm')?.value) {
        this.onSubmit(this.queryForm);
      }
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 轉換日期格式為 YYYYMM
      const budgetDate = frm.value.budget_yymm ? (new Date(frm.value.budget_yymm).getFullYear().toString() + (new Date(frm.value.budget_yymm).getMonth() + 1).toString().padStart(2, '0')) : '';

      const body = {
        ...frm.value,
        budget_yymm: budgetDate,
        bus_class: frm.value.bus_class ? typeof frm.value.bus_class === 'string' ? frm.value.bus_class : frm.value.bus_class.No : null,
        bus_sclass: frm.value.bus_sclass ? frm.value.bus_sclass : null,
        pageIndex: 1,
        pageSize: 30,
        SortBy: [{ field: 'bus_type', order: 1 }],
      };

      this.tls2g040Service.queryTLS2G040(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.lastQueryForm = body;
        this.totalRecords = res.TotalCount;
        this.data = res.Data;
        this.footerTotal = res.FooterTotal;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  private updateColumns(): void {
    const reportType = this.queryForm.get('report_type')?.value;
    const budgetDate = this.queryForm.get('budget_yymm')?.value;

    if (!reportType) {
      this.columns = [];
      return;
    }
    let baseColumns: ReportColumn[];
    switch (reportType) {
      case 'bus_type':
        baseColumns = bus_typeColumns;
        break;
      case 'bus_class':
        baseColumns = bus_classColumns;
        break;
      case 'bus_sclass':
        baseColumns = bus_sclassColumns;
        break;
      case 'org_id':
        baseColumns = org_idColumns;
        break;
      case 'tlt_no':
        baseColumns = tlt_noColumns;
        break;
      default:
        baseColumns = [];
        break;
    }

    // 建立每日欄位
    const dailyColumns: ReportColumn[] = [];
    if (budgetDate) {
      const date = new Date(budgetDate);
      const year = date.getFullYear();
      const month = date.getMonth();
      const lastDay = new Date(year, month + 1, 0).getDate(); // 取得該月的最後一天
      const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];

      for (let i = 1; i <= lastDay; i++) {
        const dayDate = new Date(year, month, i);
        const dayOfWeek = daysOfWeek[dayDate.getDay()];
        dailyColumns.push({
          field: `daily_${i}`, // 建議使用 unique 的 field 名稱，例如 daily_1, daily_2
          header: `${i}(${dayOfWeek})`,
          groupField: 'daily', // 可以考慮新增一個 'daily' 的群組
          format: formatAmount
        });
      }
    }

    // 將所有欄位合併
    this.columns = [...baseColumns, ...dailyColumns];
  }

  onExportPDF() {
    this.btnLoading = true;
    this.tls2g040Service.exportTLS2G040Pdf(this.lastQueryForm)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.btnLoading = false)
      )
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          if (response.body) {
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `專櫃預算日報表.pdf`; // 預設檔名

            // 嘗試從 Content-Disposition 取得檔名
            if (contentDisposition) {
              const filenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
              if (filenameMatch && filenameMatch.length > 1) {
                try {
                  filename = decodeURIComponent(filenameMatch[1]);
                } catch (e) {
                  console.error('Failed to decode filename from Content-Disposition', e);
                }
              } else {
                const fallbackMatch = contentDisposition.match(/filename="?([^;"]+)"?/);
                if (fallbackMatch && fallbackMatch.length > 1) {
                  filename = fallbackMatch[1];
                }
              }
            }

            const url = globalThis.URL.createObjectURL(response.body);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            a.click();
            globalThis.URL.revokeObjectURL(url);
          }
        },
        error: (err) => {
          console.error('PDF export failed', err);
        }
      });
  }
  onExportXLSX() {
    this.btnLoading = true;
    this.tls2g040Service.exportTLS2G040Excel(this.lastQueryForm)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.btnLoading = false)
      )
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          if (response.body) {
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `專櫃預算日報表.pdf`; // 預設檔名

            // 嘗試從 Content-Disposition 取得檔名
            if (contentDisposition) {
              const filenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
              if (filenameMatch && filenameMatch.length > 1) {
                try {
                  filename = decodeURIComponent(filenameMatch[1]);
                } catch (e) {
                  console.error('Failed to decode filename from Content-Disposition', e);
                }
              } else {
                const fallbackMatch = contentDisposition.match(/filename="?([^;"]+)"?/);
                if (fallbackMatch && fallbackMatch.length > 1) {
                  filename = fallbackMatch[1];
                }
              }
            }

            const url = globalThis.URL.createObjectURL(response.body);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            a.click();
            globalThis.URL.revokeObjectURL(url);
          }
        },
        error: (err) => {
          console.error('PDF export failed', err);
        }
      });
  }
}
