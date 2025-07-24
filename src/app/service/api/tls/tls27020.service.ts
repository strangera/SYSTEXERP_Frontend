import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@service/system/auth.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface queryParams {
  TXN_Date: string,
  TLT_NOList: string[],
  ECR_NoList: string[],
  BOOK_PayAmt: string
}

export interface TLS27020Data {
  id: number,
  contract_no: string,
  tlt_no: string,
  tlt_name: string
}


@Injectable({
  providedIn: 'root'
})
export class TLS27020Service {

  private readonly apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  queryTLS27020(queryParams: queryParams): Observable<ApiResponse<TLS27020Data[]>> {
    return this.http.post<ApiResponse<TLS27020Data[]>>(`${this.apiUrl}/queryTLS27020`, queryParams);
  }

  insertTLS27020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS27020`, data);
  }

  updateTLS27020(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/updateTLS27020`, data);
  }
}
