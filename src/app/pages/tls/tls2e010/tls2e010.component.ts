import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Column, formatAmount, formatYYYYMM } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { Tls2e010Data, Tls2e010QueryBody, Tls2e010Service } from './../../../service/api/tls/tls2e010.service';

// 2.2.14.1 專櫃租金結算作業
@Component({
  selector: 'app-tls2e010',
  templateUrl: './tls2e010.component.html',
  standalone: true,
  imports: [TableReportComponent, AsyncPipe, DropdownComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, TranslateModule]
})
export class TLS2E010Component extends BasicQueryPageComponent<Tls2e010Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm: [new Date() as Date | null], // 租金結算年月
    tlt_no: [null], // 單一專櫃查詢
    sam_yyymm_start: [new Date(), [Validators.required]], // 起迄年月
    sam_yyymm_end: [new Date(), [Validators.required]], // 起迄年月
    PageSize: [30],
    PageIndex: [1],
    SortBy: [[{ field: 'sam_yyymm', order: 1 }, { field: 'tlt_no', order: 1 }]],
  });
  tlt_noOptions$ = this.dropdown.queryTltTalent();
  totalRecords = 0;
  lastQueryBody: Tls2e010QueryBody | null = null;
  footerData: Tls2e010Data | null = null;
  data: Tls2e010Data[] = [];
  columns: Column[] = [
    { field: 'sam_yyymm', header: '結算年月', visible: true, format: formatYYYYMM },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'rent_net', header: '未稅金額', visible: true, format: formatAmount },
    { field: 'rent_tax', header: '稅額', visible: true, format: formatAmount },
    { field: 'rent_amt', header: '總金額', visible: true, format: formatAmount },
  ];

  constructor(
    public readonly tls2e010Service: Tls2e010Service,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2E010');
    // 新增：監聽「起日」變化，自動帶入「迄日」
    this.queryForm.controls.sam_yyymm_start.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(startDate => {
        // 如果起日有值，且迄日目前沒有值（或你想強制覆蓋），則同步
        if (startDate) {
          // 這裡採取「若迄日為空則自動帶入」或「連動帶入」的邏輯
          // 如果要強迫同步，就直接 patchValue
          // 如果你希望只有在迄日還沒被選過時才自動帶入，可以加個判斷：
          // if (startDate && !this.queryForm.controls.sam_yyymm_end.dirty) {
          this.queryForm.patchValue({ sam_yyymm_end: startDate });
          // }
        }
      });
    // 監聽起迄年月的變化
    this.queryForm.valueChanges.pipe(untilDestroyed(this)).subscribe(val => {
      const start = val.sam_yyymm_start;
      const end = val.sam_yyymm_end;

      // 1. 只要其中一個是空的，sam_yyymm 就變空
      if (!start || !end) {
        if (this.queryForm.controls.sam_yyymm.value !== null) {
          this.queryForm.patchValue({ sam_yyymm: null }, { emitEvent: false });
        }
        return;
      }

      // 2. 當兩者都有值時，判斷是否相同
      const startStr = this.datePipe.transform(start, 'yyyyMM');
      const endStr = this.datePipe.transform(end, 'yyyyMM');

      if (startStr === endStr) {
        // 相同則同步
        const currentSettle = this.datePipe.transform(this.queryForm.controls.sam_yyymm.value, 'yyyyMM');
        if (currentSettle !== startStr) {
          this.queryForm.patchValue({ sam_yyymm: new Date(start) }, { emitEvent: false });
        }
      } else {
        // 3. 不相同時，也將 sam_yyymm 變空 (確保結算月份必須明確)
        if (this.queryForm.controls.sam_yyymm.value !== null) {
          this.queryForm.patchValue({ sam_yyymm: null }, { emitEvent: false });
        }
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        PageSize: frm.value.PageSize,
        PageIndex: frm.value.PageIndex,
        SortBy: frm.value.SortBy,
        tlt_no: frm.value.tlt_no,
        sam_yyymm_start: this.datePipe.transform(frm.value.sam_yyymm_start, 'yyyyMM'),
        sam_yyymm_end: this.datePipe.transform(frm.value.sam_yyymm_end, 'yyyyMM'),
      }
      this.tls2e010Service.queryTls2e010(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data
        this.lastQueryBody = body;
        this.footerData = res.total
        this.totalRecords = res.TotalCount || 0;
      })
    });
  }
  onSettle(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const sam_yyymm_start = frm.value.sam_yyymm_start;
      const sam_yyymm_end = frm.value.sam_yyymm_end;
      if (this.datePipe.transform(sam_yyymm_start, 'yyyyMM') !== this.datePipe.transform(sam_yyymm_end, 'yyyyMM')) {
        this.loading = false;
        return this.messageService.errorBubble('「結算」時，租金結算年月(起訖)必須相同');
      }
      const body = {
        tlt_no: frm.value.tlt_no,
        sam_yyymm: this.datePipe.transform(frm.value.sam_yyymm, 'yyyyMM'),
      }
      this.tls2e010Service.executeTls2e010(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.messageService.successBubble(res.Data.ErrMsg);
      })
    })
  }
  onLock(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const sam_yyymm_start = frm.value.sam_yyymm_start;
      const sam_yyymm_end = frm.value.sam_yyymm_end;
      if (this.datePipe.transform(sam_yyymm_start, 'yyyyMM') !== this.datePipe.transform(sam_yyymm_end, 'yyyyMM')) {
        this.loading = false;
        return this.messageService.errorBubble('「租金結算鎖定」時，租金結算年月(起訖)必須相同');
      }
      const body = {
        ...frm.value,
        sam_yyymm: this.datePipe.transform(frm.value.sam_yyymm, 'yyyyMM'),
        money_type: "30",
        sam_termno: "1"
      }
      this.tls2e010Service.lockTls2e010(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.messageService.successBubble(res.Message)
      })
    })
  }
}
