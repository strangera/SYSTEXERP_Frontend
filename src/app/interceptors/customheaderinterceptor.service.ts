import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { formatDate } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable()
export class CustomheaderinterceptorService implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // TransactionTime
    let utc_now = formatDate(new Date(), 'yyyy/MM/ddThh:mm:ssZ', 'zh-Hant-TW');

    // 您的自定義
    const clonedReq = req.clone({
      headers: req.headers
        .set('X-API-KEY', environment.APIKey)
        .set('X-Service', environment.Service_Id)
        .set('X-Terminal', environment.Terminal_Id)
        .set('X-Merchant', environment.Merchant_Id)
        .set('TransactionTime', utc_now)
    });

    return next.handle(clonedReq);
  }
}
