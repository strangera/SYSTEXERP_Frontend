import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataTypeService {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  getDataOptions(): Observable<any[]> {
    return this.http.post<any>(`${this.apiUrl}/queryDEFTBL_DropDownList`, {}).pipe(
      map(res => res?.Data || []),
    );
  }
}
