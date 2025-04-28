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
      // Backend returned an unsuccessful response code.
      if (error.error.rc && error.error.rm) {
        // Handle custom error code and message
        errorMessage = `Error Code: ${error.error.rc}, Message: ${error.error.rm}`;
      } else {
        // Generic error handling
        errorMessage = `Backend returned code ${error.status}, body was: ${error.message}`;
      }
    }

    // Get the error message
    //if (error.error instanceof ErrorEvent) {
    //  errorMessage = `Error: ${error.error.message}`;
    //} else if (error.error?.rc != undefined) {
    //  errorMessage = JSON.stringify(error.error, null, 2);
    //}

    // Optionally, you can log the error or display it to the user
    console.error('HTTP Error:', errorMessage);

    // Display the error message
    this.notemessage.errorBubble(errorMessage);
    this.notemessage.unblockUi();
    let errorsString = sessionStorage.getItem(this.LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS);
    let errors: any[] = JSON.parse(errorsString == null ? '[]' : errorsString);
    errors.splice(100, 1000, {
      datetime: new Date().toLocaleString(),
      message: errorMessage
    });
    sessionStorage.setItem(this.LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS, JSON.stringify(errors));

    // Return the error message or a user-friendly message
    return throwError(errorMessage);
  }
}
