import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountingaccountService {
  apiUrl = `${environment.ApiUrl}/queryGLS1005_DropDownList`;
  title = '會計科目';

  constructor(
    private http: HttpClient,
  ) { }

  getOptions(): Observable<any[]> {
    return this.http.post<any>(this.apiUrl, {}).pipe(
      map((response) => response?.Data || [])
    );
  }
}
