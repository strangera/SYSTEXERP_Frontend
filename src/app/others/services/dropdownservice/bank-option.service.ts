import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BankOptionsService {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  // 銀行
  getBankOptions(searchKeyword?: string): Observable<any[]> {
    const requestBody = {
      SearchKeyword: searchKeyword || ""
    };

    return this.http
      .post<any>(`${this.apiUrl}/queryAPS1001_DropDownList`, requestBody)
      .pipe(
        map((res) =>
          res?.Data?.map((x: any) => ({
            label: x.Name.replace(/^(.+?)\1/, '$1'),
            value: x.No
          })) ?? []
        )
      );
  }
}