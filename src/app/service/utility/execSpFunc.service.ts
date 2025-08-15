import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '@service/system/auth.service';

export interface IExportLabelRequest {
  SYS_StoreNo: string,
  EXP_StoreNo: string,
  EXP_Type: string, // Table名稱
  EXP_DocNo: string,
  EXP_DataFlag: string,
  EXP_Desc: string
}

@Injectable({
  providedIn: 'root'
})
export class ExecSpFuncService {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  ExecSpFunc(data: IExportLabelRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/ExecSpFunc/ExecSpFunc`, data);
  }
}
