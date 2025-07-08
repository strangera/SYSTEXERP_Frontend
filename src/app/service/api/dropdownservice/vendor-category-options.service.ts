import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorHandlerService } from '../../system/error-handler.service';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VendorCategoryOptionsService {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 廠商別下拉選項
  getVendorCategoryOptions(venFlag?: string): Observable<any[]> {
    const requestBody = {
      VEN_Flag: venFlag || ""
    };

    return this.http
      .post<any>(`${this.apiUrl}/queryPOS2013_DropDownList`, requestBody)
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({
          label: `${x.No} - ${x.Name}`,  // 改這裡
          value: x.No
        })) ?? [])
      );
  }
}
