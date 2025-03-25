import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, delay, retryWhen, take, tap } from 'rxjs/operators';
import { ErrorHandlerService } from '../shared/service/error-handler.service';

@Injectable()
export class ErrorinterceptorService implements HttpInterceptor {

  constructor(private errorHandler: ErrorHandlerService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.errorHandler.handleError(error);
      }),
      retryWhen(errors =>
        errors.pipe(
          tap(error => {
            if (error.status !== 0) {
              // Only retry on timeout errors
              throw error;
            }
          }),
          delay(1000), // Retry delay
          take(1) // Number of retry attempts
        )
      )
    );
  }
}
