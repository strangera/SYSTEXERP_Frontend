import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Tls46050Request {
  PageSize: number,
  PageIndex: number,
  SortBy: SortMeta[],
  ECR_No_Start: string,
  ECR_No_End: string,
  ShowTypes: string,
  ECR_GrpNos: string[]
}

export interface Tls46050Response {
  ID: number,
  ECR_No: string,
  EOS_TmplNo: string,
  ECR_TmplNo: string,
  EOS_KBLevel: string,
  ECR_KBLevel: string,
  EOS_MstSysVer: string,
  ECR_GrpNo: string,
  ECR_GrpName: string
}

@Injectable({
  providedIn: 'root'
})
export class Tls46050Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;

  constructor(private http: HttpClient) { }

  queryTLS57050(requestBody: Tls46050Request): Observable<ApiResponse<Tls46050Response[]>> {
    return this.http.post<ApiResponse<Tls46050Response[]>>(`${this.apiUrl}/queryTLS46050`, requestBody);
  }
}
