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
      errorMessage = 'Network error or timeout occurred. Please try again later.';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized access. Please login again.';
      this.router.navigate(['/account/login']);
    } else if (error.status === 404) {
      errorMessage = 'Resource not found.';
    } else if (error.status === 500) {
      // Server error
      errorMessage = 'Internal server error.';
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
