import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ASS11050Tree } from '@pages/ass/ass11050/ass11050.component';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ASS11050Service {
  apiUrl: string = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  public getASS11050Tree(): Observable<ApiResponse<ASS11050Tree[]>> {
    return this.http.post<ApiResponse<ASS11050Tree[]>>(`${this.apiUrl}/queryASS11050`, {}).pipe(
      take(1),
    );
  }

}
