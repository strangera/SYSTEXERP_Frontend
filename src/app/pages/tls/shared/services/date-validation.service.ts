// validation/date-validation.service.ts
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DateValidationService {

  /**
   * 設定所有日期驗證器，回傳 Subscription 陣列供呼叫端在 ngOnDestroy 取消訂閱
   */
  setupDateValidators(form: FormGroup, messageService: any): Subscription[] {
    const subs: Subscription[] = [];

    // 合約起始日和截止日監聽
    const s1 = form.get('tlt_bdate')?.valueChanges.subscribe(() => {
      this.validateContractDates(form, messageService);
    });
    if (s1) subs.push(s1);

    const s2 = form.get('tlt_edate')?.valueChanges.subscribe(() => {
      this.validateContractDates(form, messageService);
    });
    if (s2) subs.push(s2);

    // 營運起始日和截止日監聽
    const s3 = form.get('tlt_contract_bdate')?.valueChanges.subscribe(() => {
      this.validateOperationDates(form, messageService);
    });
    if (s3) subs.push(s3);

    const s4 = form.get('tlt_contract_edate')?.valueChanges.subscribe(() => {
      this.validateOperationDates(form, messageService);
    });
    if (s4) subs.push(s4);

    // 回函日期和截止日監聽
    const s5 = form.get('feedback_date')?.valueChanges.subscribe(() => {
      this.validateFeedbackDates(form, messageService);
    });
    if (s5) subs.push(s5);

    const s6 = form.get('due_date')?.valueChanges.subscribe(() => {
      this.validateFeedbackDates(form, messageService);
    });
    if (s6) subs.push(s6);

    return subs;
  }

  /**
   * 驗證合約日期
   */
  validateContractDates(form: FormGroup, messageService: any): void {
    const startDate = form.get('tlt_bdate')?.value;
    const endDate = form.get('tlt_edate')?.value;
    const endDateControl = form.get('tlt_edate');

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        endDateControl?.setValue('');
        messageService.warnBubble('合約截止日不可早於起始日，已清空截止日');
      }
    }
  }

  /**
   * 驗證營運日期
   */
  validateOperationDates(form: FormGroup, messageService: any): void {
    const startDate = form.get('tlt_contract_bdate')?.value;
    const endDate = form.get('tlt_contract_edate')?.value;
    const endDateControl = form.get('tlt_contract_edate');

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        endDateControl?.setValue('');
        messageService.warnBubble('營運截止日不可早於起始日，已清空截止日');
      }
    }
  }

  /**
   * 驗證回函日期
   */
  validateFeedbackDates(form: FormGroup, messageService: any): void {
    const feedbackDate = form.get('feedback_date')?.value;
    const dueDate = form.get('due_date')?.value;
    const dueDateControl = form.get('due_date');

    if (feedbackDate && dueDate) {
      const feedback = new Date(feedbackDate);
      const due = new Date(dueDate);

      if (feedback > due) {
        dueDateControl?.setValue('');
        messageService.warnBubble('回函截止日不可早於回函日期');
      }
    }
  }

  /**
   * 計算並設定預收租金期數
   */
  calculateAndSetRentPeriod(form: FormGroup, messageService: any): void {
    const startDate = form.get('tlt_bdate')?.value;
    const endDate = form.get('tlt_edate')?.value;

    if (startDate && endDate) {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const months = this.calculateMonthsDifference(start, end) + 1;

        form.get('rent_period')?.setValue(months);
        messageService.infoBubble(`已自動計算預收租金期數：${months} 個月`);
      } catch (error) {
        messageService.warnBubble('計算預收租金期數失敗，請手動輸入');
      }
    }
  }

  /**
   * 計算月數差異
   */
  private calculateMonthsDifference(startDate: Date, endDate: Date): number {
    const yearDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthDiff = endDate.getMonth() - startDate.getMonth();
    return yearDiff * 12 + monthDiff;
  }
}
