import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  getRegionOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/querySYS3A00_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
      );
  }
}
