import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin14020Service } from '@service/api/fin/fin14020.service';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextRangeComponent } from '../../../shared/components/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { TableComponent } from '../../../others/component/table/table.component';
import { createPaginationConfig } from '../../../others/component/table/table.model';
import { YearMonthComponent } from '../fin11020/query-year-month.component';
// 本期發票月
const today = new Date();
let invoiceYear = today.getFullYear();
let invoiceMonth = today.getMonth() + 1; // JS 月份 0~11

// 如果不是偶數月，就加 1 個月
if (invoiceMonth % 2 !== 0) {
  invoiceMonth += 1;
  if (invoiceMonth > 12) {
    invoiceMonth = 1;
    invoiceYear += 1;
  }
}
// 將年月轉成 YYYYMM 字串
export const invoiceDate = invoiceYear.toString() + invoiceMonth.toString().padStart(2, '0');


/** 結轉回應 */
export interface clearResponse {
  IsClearSuccess: boolean;
  ErrorMsg: string;
}

//1.1.4.2 資料結轉
@Component({
  selector: 'app-fin14020',
  templateUrl: './fin14020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    InputTextComponent,
    InputTextRangeComponent,
    TableComponent,
    TranslateModule,
    YearMonthComponent]
})
export class FIN14020Component extends BasicQueryPageComponent<clearResponse> implements OnInit {
  queryForm = this.formBuilder.group({
    Mid: [this.authService.getUserInfo()?.mid ?? null, [Validators.required]], // section抓
    StoreNo: [this.authService.getUserInfo()?.SYS_StoreNo ?? null, [Validators.required]], // section抓
    DeclareYM: [invoiceDate, [Validators.required]], // 結轉申報年月
    ...createPaginationConfig([{ field: 'DeclareYM', order: 1 }]), // 分頁和排序參數
  });

  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: clearResponse[] = [];
  selectedRows: clearResponse[] = [];

  //--20250829備註--
  // SA還沒完成預存程式，但是後端API是可以呼叫的
  //----

  constructor(
    private fin14020Service: Fin14020Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN14020', '/FIN/FIN14020cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = frm.getRawValue();

      console.log('結轉request', body);
      this.fin14020Service.ClearFIN14020(body).pipe(untilDestroyed(this)).subscribe({
        next: (response) => {
          this.data = response.Data.map;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
          this.loading = false;

          // console.log('結轉response', response);

          if (response.Data.IsClearSuccess) {
            this.messageService.successBubble('結轉成功');
          } else {
            this.messageService.errorBubble('結轉失敗' + response.Data.ErrorMsg); //顯示錯誤訊息
          }
        },
        error: () => { this.loading = false; },
      });
    });
  }
}
