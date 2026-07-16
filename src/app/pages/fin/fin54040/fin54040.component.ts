import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin54040Service } from '@service/api/fin/fin54040.service';
import { TableComponent } from '@others/component/table/table.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { Column, createPaginationConfig } from '../../../others/component/table/table.model';

@Component({
  selector: 'app-fin54040',
  templateUrl: './fin54040.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, ButtonComponent, TranslateModule, TableComponent]
})
export class FIN54040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    onedatedd: ['', Validators.required], // 結帳日期
    ...createPaginationConfig([{ field: 'cls_type', order: -1 }]) // 分頁和排序參數
  });


  data: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;

  columns: Column[] = [
    { field: 'id', header: 'ID', hidden: true },
    { field: 'mid', header: 'MID', hidden: true },
    { field: 'cls_type', header: '結算型態', visible: true },
    { field: 'cls_date', header: '結算年月', visible: true },
    { field: 'check_result', header: '結果說明', visible: true },
  ];

  constructor(
    private datePipe: DatePipe,
    private fin54040Service: Fin54040Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN54040', 'fin/fin54040cru', this.queryForm, (form) => this.onSubmit(form));


  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 後端需求：FIN54040 查詢 body 為空物件 {}
      this.fin54040Service.queryFIN54040({})
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
          this.messageService.successBubble(response.Message || '查詢成功');
        });
    });
  }

  /**
   * 執行結算：呼叫 executeFIN54040
   * 後端需求：body = { CloseYEAR: 'yyyy' }
   */
  defineDateCheckout(): void {
    if (this.queryForm.invalid) {
      this.submitted = true;
      return;
    }

    const dateControl = this.queryForm.get('onedatedd');
    const selectedDate = dateControl?.value;

    const closeYear = this.datePipe.transform(selectedDate, 'yyyy') || '';
    if (!closeYear) {
      this.messageService.warnBubble('請先選擇年份');
      return;
    }

    const payload = { CloseYEAR: closeYear };
    this.loading = true;
    this.fin54040Service.executeFIN54040(payload)
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe(res => {
        this.messageService.successBubble(res.Message || '執行完成');
        // 執行後重新查詢一次
        this.onSubmit(this.queryForm);
      });
  }

}
