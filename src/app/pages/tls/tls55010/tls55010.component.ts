import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '@shared/componentkit/table/table.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { CheckTls55010Data, Tls55010Service } from '@service/api/tls/tls55010.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { DatePipe } from '@angular/common';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-tls55010',
  templateUrl: './tls55010.component.html',
  standalone: true,
  imports: [TableModule, TableComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, ButtonComponent, TranslateModule]
})
export class TLS55010Component extends BasicQueryPageComponent<CheckTls55010Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    TXN_Date: [null as Date | null, Validators.required],
  });
  data: any = [];
  columns: Column[] = [
    { field: 'check_content', header: '檢查內容' },
    { field: 'isPassed', header: '是否通過' },
  ];
  cls_date: string | null = null;
  expansionColumns: Column[] = [
    { field: 'cls_date', header: '交易日期' },
    { field: 'check_result', header: '結果說明' },
  ]
  constructor(
    private readonly tls55010Service: Tls55010Service,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS55010', '/tls/tls55010cru');
    this.getTLS55010Date();
    this.data = getSYS1000Options('IMSCLOSE').map((item: { value: string; label: string }) => ({
      ...item, check_content: item.label, details: []
    }));
  }
  getTLS55010Date() {
    this.tls55010Service.getTLS55010Date().pipe(untilDestroyed(this)).subscribe((res) => {
      this.cls_date = res.Data.CLS_DATE;
      const closeDate = new Date(res.Data.CLS_DATE);
      closeDate.setDate(closeDate.getDate() + 1);
      this.queryForm.patchValue({ TXN_Date: closeDate });
    });
  }
  onQuery(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd') || '',
      }
      this.columns = this.columns.map(c => c.field === 'isPassed' ? {
        ...c,
        htmlFormat: true,
        format: (v) => '<i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>'
      } : c);
      this.tls55010Service.checkTLS55010(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.messageService.successBubble(res.Message);
        this.columns = this.columns.map(c => c.field === 'isPassed' ? {
          ...c, htmlFormat: false, format: undefined
        } : c);
        this.data.forEach((item: any) => {
          item.isPassed = 'OK';
          item.details = [];
        });
        const checkItemMap = new Map<string, any>();
        this.data.forEach((item: any) => {
          checkItemMap.set(item.value, item);
        });
        res.Data.forEach((error: any) => {
          const stepCode = String(error.step_num);
          const targetItem = checkItemMap.get(stepCode);
          if (targetItem) {
            targetItem.isPassed = '有問題';
            const newDetail = {
              cls_date: error.cls_date,
              check_result: error.check_result,
              mid: error.mid,
              master_key: error.master_key
            };
            targetItem.details.push(newDetail);
          }
        });
      });
    });
  }
  insertLoading = false;
  onSubmit(frm: FormGroup) {
    this.insertLoading = true;
    const body = {
      TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd') || '',
    }
    this.tls55010Service.insertTLS55010(body).pipe(untilDestroyed(this), finalize(() => this.insertLoading = false)).subscribe((res) => {
      this.messageService.successBubble(res.Message);
      this.getTLS55010Date();
    });
  }
}
