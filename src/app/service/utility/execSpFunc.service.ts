import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '@service/system/auth.service';

export interface IExportLabelRequest {
  SYS_StoreNo: string, // 登入者StoreNo
  EXP_StoreNo: string, // StoreNo
  EXP_Type: string, // Table名稱
  EXP_DocNo: string, // 鍵值 多個鍵值用；分開
  EXP_DataFlag: string, //固定 S2P
  EXP_Desc: string // 固定為''
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
