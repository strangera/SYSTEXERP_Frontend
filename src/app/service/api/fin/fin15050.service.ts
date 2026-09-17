import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

export interface FIN15050PrintRequest {
  Mid: number;
  STO_No: string;
  REP_GUIYM: string;
  GUI_Track: string | null;
  SAL_Type: string | null;
  INV_GUINumber_S: string | null;
  INV_GUINumber_E: string | null;
}

export interface FIN15050PrintResponse {
  Print_URL: string | null;
  Message: string | null;
}

@Injectable({ providedIn: 'root' })
export class FIN15050Service {
  private readonly http = inject(HttpClient);
  private readonly printApiUrl = `${environment.ApiUrl}/FIN0000/INV1000`;

  printFIN15050(data: FIN15050PrintRequest): Observable<ApiResponse<FIN15050PrintResponse>> {
    return this.http.post<ApiResponse<FIN15050PrintResponse>>(`${this.printApiUrl}/PrintFIN15050`, data);
  }
}
