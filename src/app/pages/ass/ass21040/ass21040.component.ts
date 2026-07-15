import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21040Service } from '@service/api/ass/ass21040.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { convertDateToYYYYMM } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

@Component({
  selector: 'app-ass21040',
  templateUrl: './ass21040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarComponent,
    TranslateModule,
  ],
})
export class ASS21040Component extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    ENG_YYMM: [null, [Validators.required]],
    ENG_Type: [null, [Validators.required]],
  });
  totalRecords = 0;
  ENG_TypeOptions = getSYS1000Options('ENG_Type');
  constructor(
    private aSS21040Service: ASS21040Service
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('ASS21040', 'ass/ass21040', this.queryForm, (frm) => this.onSubmit(frm));
  }

  onSubmit(frm: FormGroup) {
    const storeNo = this.authService.currentUserValue?.SYS_StoreNo;
    const mid = this.authService.currentUserValue?.mid;
    if (storeNo && mid !== null && mid !== undefined) {
      const body = {
        SYS_StoreNo: storeNo,
        Mid: mid,
        EngTypes: frm.value.ENG_Type,
        ClearingYM: convertDateToYYYYMM(frm.value.ENG_YYMM)
      };
      this.handleSubmit(frm, () => {
        this.aSS21040Service.ClearingASS21040(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe({
          next: (response) => {
            console.log('結算 API 成功回應:', response);
            if (response.Data.IsClearingSuccess) {
              this.messageService.successBubble('結算成功');
            } else {
              // 業務邏輯失敗
              this.messageService.errorBubble(response.Data.ErrorMsg || '結算失敗');
            }
          },
          error: (error) => {
            console.log('Component Error Handler - Error:', error);
            // 忽略請求取消錯誤
            if (error.message === 'Request cancelled') {
              console.log('結算請求被取消,不顯示錯誤訊息');
              return;
            }
            console.error('結算 API 錯誤:', error);
            this.messageService.errorBubble(error.message || '結算失敗,請稍後再試');
          }
        });
      });
    }
  }
  onCancelClearing(frm: FormGroup) {
    const storeNo = this.authService.currentUserValue?.SYS_StoreNo;
    const mid = this.authService.currentUserValue?.mid;
    if (storeNo && mid !== null && mid !== undefined) {
      const body = {
        SYS_StoreNo: storeNo,
        Mid: Number(mid),
        EngTypes: frm.value.ENG_Type,
        ClearingYM: convertDateToYYYYMM(frm.value.ENG_YYMM)
      };
      this.handleSubmit(frm, () => {
        this.aSS21040Service.CancelClearingASS21040(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
          if (response.Data.IsCancelClearingSuccess) {
            this.messageService.successBubble('取消結算成功');
          } else {
            this.messageService.errorBubble(response.Data.ErrorMsg);
          }
        });
      });
    }
  }

  onGenerateReport(frm: FormGroup) {
    if (!frm.valid) {
      this.submitted = true;
      this.messageService.errorBubble('請填寫必填欄位');
      return;
    }

    const storeNo = this.authService.currentUserValue?.SYS_StoreNo;
    const mid = this.authService.currentUserValue?.mid;
    if (storeNo && mid !== null && mid !== undefined) {
      const body = {
        SYS_StoreNo: storeNo,
        Mid: mid,
        EngTypes: frm.value.ENG_Type,
        ClearingYM: convertDateToYYYYMM(frm.value.ENG_YYMM)
      };
      console.log(body);

      this.loading = true;
      this.aSS21040Service.printASS21040(body)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe({
          next: (response) => {
            const url = response.Data?.Print_URL || '';
            if (url) {
              globalThis.open(environment.ApiUrl + url, '_blank');
              this.messageService.successBubble('列印成功');
            } else {
              this.messageService.errorBubble('無法取得列印檔案');
            }
          },
          error: (err) => {
            this.messageService.errorBubble(err.message || '列印失敗');
          }
        });
    }
  }
}
