import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrganizationNumberService {

  apiUrl: string = environment.ApiUrl;
  title: string = '等級';
  options: any[] = [
    { value: 1, label: '全公司' },
    { value: 2, label: '稽核室' },
    { value: 3, label: '經營企劃部(停用)' },
    { value: 4, label: '行政Team(停用)' },
    { value: 5, label: '公關Team(停用)' },
    { value: 6, label: '營企Team(停用)' },
    { value: 7, label: '電子商務team(停用)' },
    { value: 8, label: '外商Team(停用)' },
    { value: 9, label: '個資小組' },
    { value: 10, label: '品牌代理小組(停用)' },
    { value: 11, label: '營運部' },
    { value: 12, label: '時尚Team' },
    { value: 13, label: '1F' },
    { value: 14, label: '2F' },
    { value: 15, label: '化妝品' },
    { value: 16, label: '休閒Team' },
    { value: 17, label: '3F' },
    { value: 18, label: '居家生活組(停用)' },
    { value: 19, label: '親子娛樂組(停用)' },
    { value: 20, label: '餐飲Team' },
    { value: 21, label: '餐廳/輕食組' },
    { value: 22, label: '美食街/食品料組' },
    { value: 23, label: '品牌經營組' },
    { value: 24, label: '流行Team' },
    { value: 25, label: '特販Team' },
    { value: 26, label: '生活Team' },
    { value: 27, label: '居家生活組' },
    { value: 28, label: '親子娛樂組' },
    { value: 29, label: '營運支援Team' },
    { value: 30, label: '行銷部' },
    { value: 31, label: '會員Team' },
    { value: 32, label: '檔期企劃組(停用)' },
    { value: 33, label: '會員經營組(停用)' },
    { value: 34, label: '顧客關係Team(停用)' },
    { value: 35, label: '廣宣陳列組(停用)' },
    { value: 36, label: '活動企劃組(停用)' },
    { value: 37, label: '活動Team' },
    { value: 38, label: '廣宣Team' },
    { value: 39, label: '企劃Team' },
    { value: 40, label: '財務部' },
    { value: 41, label: '會計Team' },
    { value: 42, label: '總帳/稅務組(停用)' },
    { value: 43, label: '專櫃/自營組(停用)' },
    { value: 44, label: '成本結轉/匯整分析組(停用)' },
    { value: 45, label: '財務Team' },
    { value: 46, label: '授信/資金組(停用)' },
    { value: 47, label: '有價券/營收組(停用)' },
    { value: 48, label: '出納/銀行組(停用)' },
    { value: 49, label: '技術服務部' },
    { value: 50, label: '物管Team(停用)' },
    { value: 51, label: '總務Team(停用)' },
    { value: 52, label: '資訊整合Team' },
    { value: 53, label: '機電Team' },
    { value: 54, label: '裝修管理Team' },
    { value: 55, label: '總經理室' },
    { value: 56, label: '電子商務事業組(停用)' },
    { value: 57, label: '品牌經營事業組(停用)' },
    { value: 58, label: '公關組' },
    { value: 59, label: '秘書室(停用)' },
    { value: 60, label: '採購組(停用)' },
    { value: 61, label: '行政服務部' },
    { value: 62, label: '人資Team' },
    { value: 63, label: '總務Team' },
    { value: 64, label: '採購Team' },
    { value: 65, label: '總經理室二(停用)' },
    { value: 66, label: '新零售事業部' },
    { value: 67, label: '電子商務Team' },
    { value: 68, label: '外商外販Team' },
    { value: 69, label: '二期商場' },
    { value: 70, label: '二期商場-時尚Team' },
    { value: 71, label: '美食街/食品料組' },
    { value: 72, label: '二期商場-休閒Team' },
    { value: 73, label: '二期商場-餐飲Team' },
    { value: 74, label: '餐廳/輕食組' },
    { value: 75, label: '美食街/食品料組' },
    { value: 76, label: '二期商場-流行Team' },
    { value: 77, label: '二期商場-特販Team' },
    { value: 78, label: '二期商場-生活Team' },
    { value: 79, label: '內裝管理室' },
    { value: 80, label: '營運事業群' },
    { value: 81, label: '營運整合Team' },
    { value: 82, label: '招商Team' }
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getOrganizationNumbers(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
    /*
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(data => console.debug('get response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
    */
  }

  getOrganizationNumberById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createOrganizationNumber(systemType: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, systemType).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateOrganizationNumber(id: number, systemType: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, systemType).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
