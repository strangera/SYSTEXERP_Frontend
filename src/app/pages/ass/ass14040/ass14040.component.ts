import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// Shared
import { TranslateModule } from '@ngx-translate/core';
import { convertDateToYYYYMM } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ass14040Request, Ass14040Service } from 'src/app/service/api/ass/ass14040.service';
import { BasicQueryPageComponent } from 'src/app/shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

//3.1.4.4  庫存成本月結作業
@Component({
  selector: 'app-ass14040',
  templateUrl: './ass14040.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, TranslateModule]
})
export class ASS14040Component extends BasicQueryPageComponent<any> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    YYYYMM: [null, [Validators.required]],
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  latestMessage = ''; // 或預設為 '最近結算年月: -'
  // ----------------------------------------------------------------
  constructor(
    private ass14040Service: Ass14040Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS14040', '', this.queryForm, (form) => this.onSubmit(form));

    // 進來就直接顯示最近結算年月
    this.ass14040Service.queryASS14040().subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          this.latestMessage = response.Data?.Message || '';
        } else {
          console.error('API error:', response.Status, response.Message);
        }
        this.loading = false;
        this.messageService.unblockUi();
      },
      error: (err: string) => {
        console.error('API error:', err);
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }

  onSubmit(frm: FormGroup) {
    //   this.handleSubmit(frm, () => {
    //     console.log('庫存月結request:', JSON.stringify(frm.value, null, 2));

    //   });
  }

  // 試算
  onCalc(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = this.buildCalcRequest(frm);
      if (!body) {
        return;
      }
      this.ass14040Service.calcASS14040(body).subscribe({
        next: (response) => {
          if (response.Status === '0000' && response.Data?.Success) {
            this.messageService.successBubble(response.Data?.Message || '試算成功');
          } else {
            this.messageService.errorBubble(response.Data?.Message || '試算失敗');
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  // 結算
  onClose(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = this.buildCalcRequest(frm);
      if (!body) {
        return;
      }
      this.ass14040Service.closeASS14040(body).subscribe({
        next: (response) => {
          if (response.Status === '0000' && response.Data?.Success) {
            this.messageService.successBubble(response.Data?.Message || '結算成功');
            this.onSubmit(frm);
          } else {
            this.messageService.errorBubble(response.Data?.Message || '結算失敗');
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  private buildCalcRequest(frm: FormGroup): ass14040Request | null {
    const user = this.authService.currentUserValue;
    if (!user) {
      this.messageService.errorBubble('無法取得使用者資訊');
      this.loading = false;
      this.messageService.unblockUi();
      return null;
    }
    return {
      YYYYMM: convertDateToYYYYMM(frm.value.YYYYMM),
    };
  }
}
