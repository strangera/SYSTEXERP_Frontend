import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin54045Service } from '@service/api/fin/fin54045.service';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-fin54045',
  templateUrl: './fin54045.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, ButtonComponent, TranslateModule, InputTextComponent, TableComponent]
})
export class FIN54045Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    vendorSName: ['', Validators.required], //反年結（預設 disabled，會由後端填入並控制狀態）
    ...createPaginationConfig([{ field: 'cls_date', order: -1 }])
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
    private fin54045Service: Fin54045Service

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN54045', 'fin/fin54045cru', this.queryForm, (form) => this.onSubmit(form));

  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 後端需求：FIN54045 查詢 body 為空物件 {}
      this.fin54045Service.queryFIN54045({})
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());

          // 若後端回傳反年結欄位，填入並 disable；否則啟用給使用者輸入
          const respAny = response as any;
          const vendorFromResp = (respAny?.VendorSName ?? respAny?.vendorSName ?? respAny?.Data?.VendorSName ?? respAny?.Data?.vendorSName) as string | undefined;
          if (vendorFromResp) {
            this.queryForm.patchValue({ vendorSName: vendorFromResp });
            this.queryForm.get('vendorSName')?.disable();
          } else {
            this.queryForm.get('vendorSName')?.enable();
          }
        });
    });
  }

  /**
   * 執行反年結：呼叫 executeFIN54045
   * 後端需求：body = { CloseYEAR: 'string' }
   */
  defineDateCheckout(): void {
    if (this.queryForm.invalid) {
      this.submitted = true;
      return;
    }

    const yearValue = this.queryForm.get('vendorSName')?.value;
    const closeYear = (yearValue ?? '').toString().trim();

    if (!closeYear) {
      this.messageService.warnBubble('請輸入年分');
      return;
    }

    const payload = { CloseYEAR: closeYear };
    this.loading = true;
    this.fin54045Service.executeFIN54045(payload)
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe(res => {
        this.messageService.successBubble(res.Message || '執行完成');
        // 執行後重新查詢
        this.onSubmit(this.queryForm);
      });
  }


}
