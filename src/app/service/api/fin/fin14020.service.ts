import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Fin14020Service {
  // 資料結轉
  apiUrl: string = environment.ApiUrl + '/FIN0000/INV1000';
  constructor(private http: HttpClient) { }
    
  // 資料結轉
  ClearFIN14020(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ClearFIN14020`, body);
  }
}
