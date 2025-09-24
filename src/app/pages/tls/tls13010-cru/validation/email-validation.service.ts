// validation/email-validation.service.ts
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class EmailValidationService {

  /**
   * 格式化 email 欄位
   */
  formatEmailField(form: FormGroup, fieldName: string, value: string, messageService: any): void {
    if (!value || value.trim() === '') {
      return;
    }

    // 檢查是否包含分隔符號
    if (!value.includes(',') && !value.includes(';')) {
      this.validateSingleEmail(fieldName, value.trim(), messageService);
      return;
    }

    // 格式化多個 email
    const formattedValue = this.formatMultipleEmails(value);

    // 如果格式有改變，更新表單值
    if (formattedValue !== value) {
      const control = form.get(fieldName);
      control?.setValue(formattedValue);

      messageService.infoBubble(`已自動格式化 ${this.getFieldDisplayName(fieldName)}`);
    }

    // 驗證格式化後的 email
    this.validateMultipleEmails(fieldName, formattedValue, messageService);
  }

  /**
   * 格式化多個 email 字串
   */
  private formatMultipleEmails(emailString: string): string {
    return emailString
      .split(/[;,]/)
      .map(email => email.trim())
      .filter(email => email !== '')
      .join(';');
  }

  /**
   * 驗證單一 email
   */
  private validateSingleEmail(fieldName: string, email: string, messageService: any): void {
    if (email && !this.isValidEmailFormat(email)) {
      messageService.warnBubble(`${this.getFieldDisplayName(fieldName)} 格式不正確`);
    }
  }

  /**
   * 驗證多個 email
   */
  private validateMultipleEmails(fieldName: string, emailString: string, messageService: any): void {
    if (!emailString) return;

    const emails = emailString.split(';');
    const invalidEmails: string[] = [];

    emails.forEach(email => {
      if (email && !this.isValidEmailFormat(email)) {
        invalidEmails.push(email);
      }
    });

    if (invalidEmails.length > 0) {
      messageService.warnBubble(
        `${this.getFieldDisplayName(fieldName)} 中有無效格式：${invalidEmails.join(', ')}`
      );
    }
  }

  /**
   * 驗證 email 格式
   */
  private isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * 取得欄位顯示名稱
   */
  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      'email': '聯絡信箱',
      'invoice_email': '發票信箱'
    };
    return fieldNames[fieldName] || fieldName;
  }
}
