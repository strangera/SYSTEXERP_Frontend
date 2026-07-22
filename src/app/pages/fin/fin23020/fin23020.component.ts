import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin23020Service, QueryFIN23020Response } from '@service/api/fin/fin23020.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { InputTextRangeComponent } from '@shared/components/input-text-range/input-text-range.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, ReportColumn } from '@shared/components/table-report/table-report.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { toLocalDateTimeString } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

//1.2.3.2 暫付款申請傳票拋轉作業
@Component({
  selector: 'app-fin23020',
  templateUrl: './fin23020.component.html',
  standalone: true,
  imports: [
    MenubarComponent, AccordionModule, ButtonModule, FormsModule, ReactiveFormsModule,
    InputTextRangeComponent, CalendarComponent, ButtonComponent, TableReportComponent, TranslateModule
  ]
})
export class FIN23020Component extends BasicQueryPageComponent<QueryFIN23020Response> implements OnInit {
  public readonly fin23020Service = inject(Fin23020Service);

  queryForm = this.formBuilder.group({
    PREP_NOS: [null as string | null, [Validators.maxLength(16)]], // 預支單號(起)，長度對齊 APS3010.PREP_NO VARCHAR(16)
    PREP_NOE: [null as string | null, [Validators.maxLength(16)]], // 預支單號(迄)，長度對齊 APS3010.PREP_NO VARCHAR(16)
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'PrepNo', order: 1 }]],
  });

  // 傳票日期：不是查詢條件，是這批拋轉要蓋在傳票上的日期，預設今天，帶進預覽頁再一起送給 SP_FIN23020Posting 的 @VouDate
  voucherDateControl = this.formBuilder.control(new Date());

  data: QueryFIN23020Response[] = [];
  selectedItems: QueryFIN23020Response[] = [];
  footerData: any = null;
  totalRecords = 0;
  lastQuery: unknown = null;

  columns: ReportColumn[] = [
    { field: 'PrepNo', header: '預支單號', align: 'left' },
    { field: 'VenNo', header: '廠商/員工代號', align: 'left', width: '100px' },
    { field: 'VenName', header: '廠商/員工名稱', align: 'left' },
    { field: 'ApplyDate', header: '申請日期', align: 'left', width: '90px' },
    { field: 'PlanCloseDate', header: '預計核銷日', align: 'left', width: '90px' },
    { field: 'PlanPayDate', header: '預計付款日', align: 'left', width: '90px' },
    { field: 'PrepAmt', header: '預支金額', format: formatAmount, align: 'right' },
    { field: 'Remark', header: '備註', align: 'left' },
  ];

  ngOnInit(): void {
    this.initializePage('FIN23020', 'fin/fin23020cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin23020Service.queryFIN23020(frm.value).pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this),
      ).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQuery = frm.value;
        this.selectedItems = [];
        this.footerData = {
          PrepAmt: res.TotalAmt ?? 0
        };
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  get isPreviewDisabled(): boolean {
    return this.selectedItems.length === 0 || !this.voucherDateControl.value;
  }

  /**
   * 預覽傳票：把勾選的多筆暫付款申請(rowData)+ 傳票日期整包帶進 fin23020cru 頁面，
   * 由該頁呼叫 SP_FIN23020Detail 逐筆組出預覽資料，使用者確認/編輯完後在那頁按「確定拋轉」才會真的呼叫 SP_FIN23020Posting。
   * 這裡只負責導頁，不呼叫任何拋轉相關 API。
   */
  onPreview() {
    if (this.isPreviewDisabled) return;
    this.navigateWithState(CRUDStatus.Create, {
      items: [...this.selectedItems],
      VouDate: toLocalDateTimeString(this.voucherDateControl.value),
    });
  }
}
