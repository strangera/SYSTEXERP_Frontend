import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { QueryStateService } from '@shared/service/query-state.service';

@Injectable()
export class QueryCacheInterceptorService implements HttpInterceptor {

  constructor(
    private readonly queryState: QueryStateService,
  ) { }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse && event.status === 200) {
          const url = req.url;
          const api = url.split('/').pop();
          if (api) {
            this.queryState.setQueryState(`${api}`, req.body);
          }
        }
      })
    );
  }
}
