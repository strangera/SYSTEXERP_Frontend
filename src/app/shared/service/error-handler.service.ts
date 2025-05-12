import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../component/notification-message/notification.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS: string = environment.LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS;

  constructor(
    private router: Router,
    private notemessage: NotificationService,
  ) { }

  handleError(error: HttpErrorResponse): Observable<never> {
    // http status error
    let errorMessage = '';
    if (error.status === 0) {
      // Network error or timeout
      errorMessage = '發生網路錯誤或逾時。請稍後重試。';
    } else if (error.status === 401) {
      errorMessage = '未經授權的存取，請重新登入。';
      this.router.navigate(['/account/login']);
    } else if (error.status === 404) {
      errorMessage = '找不到資源，請檢查網址或稍後再試。';
    } else if (error.status === 500) {
      // Server error
      errorMessage = '伺服器內部錯誤，請稍後再試。';
    } else {
      console.log(error);
      errorMessage = error.error.Message
    }
    console.error('HTTP Error:', errorMessage);
    this.notemessage.errorBubble(errorMessage);
    this.notemessage.unblockUi();
    const errorsString = sessionStorage.getItem(this.LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS);
    const errors = JSON.parse(errorsString == null ? '[]' : errorsString);
    errors.splice(100, 1000, {
      datetime: new Date().toLocaleString(),
      message: errorMessage
    });
    sessionStorage.setItem(this.LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS, JSON.stringify(errors));
    // Return the error message or a user-friendly message
    return throwError(errorMessage);
  }
}
