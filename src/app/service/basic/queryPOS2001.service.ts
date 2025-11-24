import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CashierService {
  apiUrl: string = environment.ApiUrl + '/queryPOS2001_DropDownList';
  title = '收銀員';

  constructor(
    private http: HttpClient,
  ) { }

  getCashierOptions(): Observable<any[]> {
    return this.http.post<any>(this.apiUrl, {}).pipe(
      map(response =>
        (response?.Data ?? []).map((item: any) => ({
          value: item.No,
          label: item.Name
        }))
      ),
    );
  }
}
