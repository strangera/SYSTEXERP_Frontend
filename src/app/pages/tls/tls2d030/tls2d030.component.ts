import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ExecuteTls2d030Request, QueryTls2d030DataItem, QueryTls2d030Request, Tls2d030Service } from '@service/api/tls/tls2d030.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Column, convertDateToYYYYMM, formatDate, formatYYYYMM } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

// 2.2.13.3 專櫃代扣款結算作業
@Component({
  selector: 'app-tls2d030',
  templateUrl: './tls2d030.component.html',
  standalone: true,
  imports: [TableReportComponent, AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, TranslateModule]
})
export class TLS2D030Component extends BasicQueryPageComponent<QueryTls2d030DataItem> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm: [null, [Validators.required]], // 結算年月
    money_type: [null, [Validators.required]], // 結帳方式 (對應API的 sam_termno)
    tlt_no: [null], // 專櫃編號
    tlt_floor: [null], // 樓層 (對應API的 tlt_floor)
    pageSize: [30],
    pageIndex: [1],
  });
  sam_termnoOptions = getSYS1000Options('money_type');
  tlt_noOptions = this.dropdown.queryTltTalent();
  tlt_floorOptions = this.dropdown.querySys3900();
  totalRecords = 0;
  lastQueryBody: ExecuteTls2d030Request | null = null;
  data: QueryTls2d030DataItem[] = [];
  columns: Column[] = [
    { field: 'sam_yyymm', header: '結算年月', visible: true, format: formatYYYYMM },
    { field: 'money_type_name', header: '結帳方式' },
    { field: 'sam_termno', header: '帳次', visible: true },
    { field: 'sam_type_name', header: '費用型態', visible: true },
    { field: 'CRT_Date', header: '關帳時間', visible: true, format: formatDate },
    { field: 'CRT_USR_Name', header: '關帳者', visible: true },
  ];
  constructor(
    private readonly dropdown: DropdownApiService,
    public readonly tls2d030Service: Tls2d030Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2D030');
  }

  /**
   * 執行結算作業
   * @param frm 表單群組
   */
  onSettle(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body: ExecuteTls2d030Request = {
        sam_yyymm: convertDateToYYYYMM(frm.value.sam_yyymm),
        money_type: frm.value.money_type,
        tlt_no: frm.value.tlt_no,
        tlt_floor: frm.value.tlt_floor,
      };
      this.messageService.clearBubble();
      this.messageService.infoBubble('結算中,請稍候...');
      this.tls2d030Service.executeTLS2D030(body).pipe(
        untilDestroyed(this),
        finalize(() => { this.loading = false })
      ).subscribe(res => {
        if (res.Data.ErrCode === 1) {
          this.messageService.successBubble(res.Data.ErrMsg || '結算成功');
          this.onSubmit(frm);
        } else {
          this.messageService.errorBubble(res.Data.ErrMsg || '結算失敗');
        }
      });
    });
  }

  /**
   * 查詢結算資料
   * @param frm 表單群組
   */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body: QueryTls2d030Request = {
        ...frm.value,
        sam_yyymm: convertDateToYYYYMM(frm.value.sam_yyymm),
      };
      this.tls2d030Service.queryTLS2D030(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = body;
        this.data = res.Data;
      });
    });
  }
}
