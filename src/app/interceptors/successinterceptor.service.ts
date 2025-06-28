// app/interceptors/successinterceptor.service.ts
import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { NotificationService } from '../shared/component/notification-message/notification.service';

@Injectable()
export class SuccessInterceptor implements HttpInterceptor {
  constructor(private notificationService: NotificationService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse && event.status >= 200 && event.status < 300) {
          // 僅針對 POST/PUT/DELETE 顯示成功訊息
          if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
            const body = event.body;
            if (body && body.Message) {
              this.notificationService.successBubble(body.Message);
            } else {
              // 若無 Message 則顯示預設成功訊息
              this.notificationService.successBubble('操作成功！');
            }
          }
        }
      })
    );
  }
}
