import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CounterNameService {
  apiUrl: string = environment.ApiUrl + '/queryTLTTALENT_DropDownList';
  title = '專櫃';

  constructor(
    private http: HttpClient,
  ) { }

  getCounters(): Observable<any[]> {
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
