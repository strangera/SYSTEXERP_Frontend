import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeductionService {
  apiUrl: string = environment.ApiUrl;
  title = '扣款類別';

  constructor(
    private http: HttpClient,
  ) { }

  getAPS1003DropDownList(payload: { cap_typeList: string[] }): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/queryAPS1003_DropDownList`, payload)
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
      );
  }
}
