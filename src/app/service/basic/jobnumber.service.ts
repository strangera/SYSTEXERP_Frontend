import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobNumberService {
  apiUrl: string = environment.ApiUrl;
  title: string = '工作編號';
  options: any[] = [
    { value: 1, label: '即時戰情' },
    { value: 2, label: '銷售分析' },
    { value: 3, label: '日區段分析' },
    { value: 4, label: '銷售趨勢' },
    { value: 5, label: '廠商業務' },
    { value: 6, label: '銷售排行' },
    { value: 7, label: '激勵儀表版' },
    { value: 8, label: '警示儀表版' },
    { value: 9, label: '贈品管理' },
    { value: 10, label: '自營商品管理' },
    { value: 11, label: '系統作業資料維護' },
    { value: 12, label: '系統功能按鍵資料維護' },
    { value: 13, label: '個人化設定' },
    { value: 14, label: '系統管理' },
    { value: 15, label: '行事曆' },
    { value: 16, label: '通訊錄' },
    { value: 17, label: '待辦事項' },
    { value: 18, label: '電話紀錄' },
    { value: 19, label: '備忘錄' },
    { value: 20, label: '工作紀錄' },
    { value: 21, label: '簡訊發送' },
    { value: 22, label: '訊息收發' },
    { value: 23, label: '公告' },
    { value: 24, label: '傳閱' },
    { value: 25, label: '投票' },
    { value: 26, label: '跑馬燈' },
    { value: 27, label: '電子簽核' },
    { value: 28, label: '表單設計' },
    { value: 29, label: '簽核統計' },
    { value: 30, label: '會議管理' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getJobNumbers(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getJobNumberById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createJobNumber(jobNumber: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, jobNumber).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateJobNumber(id: number, jobNumber: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, jobNumber).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
