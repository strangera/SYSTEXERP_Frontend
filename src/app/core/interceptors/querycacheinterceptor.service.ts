import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QueryStateService } from '@shared/service/query-state.service';
import { Observable, tap } from 'rxjs';

@Injectable()
export class QueryCacheInterceptorService implements HttpInterceptor {

  constructor(
    private readonly queryState: QueryStateService,
  ) { }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse && event.status === 200) {
          const api = req.url.split('/').pop();
          if (api) {
            this.queryState.setQueryState(`${api}`, req.body);
          }
        }
      })
    );
  }
}
