import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CurrentPageService } from '../layout/app.menulist/current-page.service';
import { QueryStateService } from '@shared/service/query-state.service';

@Injectable()
export class QueryCacheInterceptorService implements HttpInterceptor {

  constructor(
    private queryState: QueryStateService,
    private currentPage: CurrentPageService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse && event.status === 200) {
          const url = req.url.toLowerCase();
          const isQueryAPI = url.includes('/query');
          const progNo = this.currentPage.currentPageProgNoSubject.getValue();
          if (isQueryAPI && progNo) {
            this.queryState.setQueryState(`query${progNo}`, req.body);
          }
        }
      })
    );
  }
}
