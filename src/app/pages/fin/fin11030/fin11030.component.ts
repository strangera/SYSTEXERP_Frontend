import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { FIN11030DeleteItem, Fin11030Service } from '../../../service/api/fin/fin11030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextRangeComponent } from '../../../shared/components/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { YearMonthComponent } from '../fin11020/query-year-month.component';
import { APS2001Data, columns } from './fin11030.model';

@Component({
  selector: 'app-fin11030',
  templateUrl: './fin11030.component.html',
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
//1.1.1.3 銷項品項資料設定
export class FIN11030Component extends BasicQueryPageComponent<APS2001Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    SAL_GUIYYYYMM_start: [null, [Validators.required]],
    SAL_GUIYYYYMM_end: [null, [Validators.required]],
    SAL_GUITrack: ['', [Validators.maxLength(2)]],
    SAL_GUINo_start: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.max(99999950)]],
    SAL_GUINo_end: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.max(99999999)]],
    SAL_GUIPaper: [null],
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'SAL_GUIYYYYMM', order: 1 }, { field: 'SAL_GUITrack', order: 1 }, { field: 'SAL_GUIBegNo', order: 1 }]],
  }, { validators: this.validationService.guiNumberRangeValidator('SAL_GUINo_start', 'SAL_GUINo_end') });
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  SAL_GUIPaperOptions = getSYS1000Options('SAL_GUIPaper');     // 發票類別選項
  data: APS2001Data[] = [];
  lastQueryBody: any;
  selectedRows: APS2001Data[] = [];
  columns: ReportColumn[] = columns;
  constructor(
    public readonly fin11030Service: Fin11030Service,
    private readonly validationService: ValidationService
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('FIN11030', '/FIN/FIN11030cru', this.queryForm, (form) => this.onSubmit(form));
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    // 計算當期起始月 (單數月)
    const currentPeriodMonth = month % 2 === 0 ? month - 1 : month;
    const defaultYYYYMM = `${year}${currentPeriodMonth.toString().padStart(2, '0')}`;

    // 設定查詢條件起訖預設值
    this.queryForm.patchValue({
      SAL_GUIYYYYMM_start: defaultYYYYMM as any,
      SAL_GUIYYYYMM_end: defaultYYYYMM as any
    });
    this.queryForm.get('SAL_GUIYYYYMM_start')?.valueChanges.subscribe(value => {
      const endDate = this.queryForm.get('SAL_GUIYYYYMM_end')?.value;
      if (value && (!endDate || endDate === '')) {
        this.queryForm.get('SAL_GUIYYYYMM_end')?.setValue(value);
      }
    });
  }
  onDelete(selectedRows: APS2001Data[]) {
    this.messageService.confirm({
      header: `是否確認刪除 ${selectedRows.length} 筆資料?`,
      accept: () => {
        const deleteList: FIN11030DeleteItem[] = selectedRows
          .filter((row) => this.isRowSelectable(row))
          .map((row) => ({
            SAL_GUIYYYYMM: this.formatDeleteYYYYMM(row.SAL_GUIYYYYMM),
            SAL_GUITrack: row.SAL_GUITrack,
            SAL_GUIBegNo: row.SAL_GUIBegNo,
            SAL_GUIEndNo: row.SAL_GUIEndNo,
            SAL_GUIPaper: row.SAL_GUIPaper,
          }));

        this.fin11030Service.deleteFIN11030(deleteList).pipe(untilDestroyed(this)).subscribe({
          next: (response) => {
            if (response?.Status === '0000') {
              this.messageService.successBubble(response.Message || '刪除成功');
              this.onSubmit(this.queryForm);
              this.selectedRows = [];
              return;
            }
            this.messageService.errorBubble(response?.Message || '刪除失敗');
          },
        });
      },
    });
  }

  onSelectionChange(selectedRows: APS2001Data[]) {
    this.selectedRows = selectedRows.filter((row) => this.isRowSelectable(row));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      this.fin11030Service.queryFIN11030(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((response) => {
        this.data = response.Data;
        this.selectedRows = [];
        this.lastQueryBody = frm.value;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  isRowSelectable(rowdata: APS2001Data): boolean {
    return rowdata?.CanDel === true;
  }

  editDisabled(rowdata: APS2001Data) {
    return rowdata.SAL_GUIPaper === '35' || (rowdata.SAL_LastUsedGUINo !== '' && rowdata.SAL_LastUsedGUINo !== null);
  }

  private formatDeleteYYYYMM(value: string | Date | null | undefined): string {
    if (value instanceof Date) {
      const year = value.getFullYear().toString();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      return `${year}${month}`;
    }

    if (typeof value === 'string') {
      const normalized = value.replace(/\//g, '').trim();
      if (/^\d{6}$/.test(normalized)) {
        return normalized;
      }

      const parsedDate = new Date(value);
      if (!isNaN(parsedDate.getTime())) {
        const year = parsedDate.getFullYear().toString();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        return `${year}${month}`;
      }
    }

    return '';
  }
}
