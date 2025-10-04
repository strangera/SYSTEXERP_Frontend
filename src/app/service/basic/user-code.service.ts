import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserCodeService {
  apiUrl: string = environment.ApiUrl;
  title: string = '使用者編號';
  options: any[] = [
    { value: 1, label: '阮湘晴' },
    { value: 2, label: '1000000002' },
    { value: 3, label: '工讀生' },
    { value: 4, label: '工讀生02' },
    { value: 5, label: '工讀生03' },
    { value: 6, label: 'TEST' },
    { value: 7, label: 'TEST調班' },
    { value: 8, label: '2000000001' },
    { value: 9, label: '2000000002' },
    { value: 10, label: '余秀娟' },
    { value: 11, label: '小精靈' },
    { value: 12, label: '2015104001' },
    { value: 13, label: '2013104002' },
    { value: 14, label: '2013104003' },
    { value: 15, label: '鄭高輝' },
    { value: 16, label: '侯博明' },
    { value: 17, label: '張國光' },
    { value: 18, label: '廖孟省' },
    { value: 19, label: '于秀娟' },
    { value: 20, label: '阮湘晴' },
    { value: 21, label: '楊錦榮' },
    { value: 22, label: '楊鈵彥' },
    { value: 23, label: '楊淨如' },
    { value: 24, label: '呂孟恭' },
    { value: 25, label: '陳建宏' },
    { value: 26, label: '卓慧儀' },
    { value: 27, label: '柳蕙蘭' },
    { value: 28, label: '王立範' },
    { value: 29, label: '林書慶' },
    { value: 30, label: '胡竣壹' },
    { value: 31, label: '王智賢' },
    { value: 32, label: '陳瑩霜' },
    { value: 33, label: '邵致平' },
    { value: 34, label: '李翊琦' },
    { value: 35, label: '林俐利' },
    { value: 36, label: '林嘉文' },
    { value: 37, label: '方旭仁' },
    { value: 38, label: '林永順' },
    { value: 39, label: '蔡欣縈' },
    { value: 40, label: '呂宛玲' },
    { value: 41, label: '林佳盈' },
    { value: 42, label: '王曉韻' },
    { value: 43, label: '江睿婷' },
    { value: 44, label: '王銘石' },
    { value: 45, label: '李惠玉' },
    { value: 46, label: '蔣宜宸' },
    { value: 47, label: '洪于涵' },
    { value: 48, label: '黃國庭' },
    { value: 49, label: '胡若珊' },
    { value: 50, label: '張靖妍' },
    { value: 51, label: '張簡雅苓' },
    { value: 52, label: '呂佳珍' },
    { value: 53, label: '陳姿云' },
    { value: 54, label: '王育雯' },
    { value: 55, label: '陳宣中' },
    { value: 56, label: '林嘉啟' },
    { value: 57, label: '劉建業' },
    { value: 58, label: '李麗娟' },
    { value: 59, label: '王士華' },
    { value: 60, label: '張嘉芷' },
    { value: 61, label: '李政達' },
    { value: 62, label: '廖婉如' },
    { value: 63, label: '薛曉珮' },
    { value: 64, label: '賴柔君' },
    { value: 65, label: '顏怡姍' },
    { value: 66, label: '葉珍妤' },
    { value: 67, label: '黃雅玲' },
    { value: 68, label: '陳秉鏞' },
    { value: 69, label: '楊政達' },
    { value: 70, label: '林慧真' },
    { value: 71, label: '黃堃盛' },
    { value: 72, label: '林慧玲' },
    { value: 73, label: '林翔澤' },
    { value: 74, label: '徐惠卿' },
    { value: 75, label: '鄭宇婕' },
    { value: 76, label: '胡燦如' },
    { value: 77, label: '楊添貴' },
    { value: 78, label: '李威德' },
    { value: 79, label: '蔡斐如' },
    { value: 80, label: '陳宥岓' },
    { value: 81, label: '郭國樑' },
    { value: 82, label: '莊千瑱' },
    { value: 83, label: '謝宜馨' },
    { value: 84, label: '侯詠馨' },
    { value: 85, label: '林冠維' },
    { value: 86, label: '賴盈中' },
    { value: 87, label: '鄭函真' },
    { value: 88, label: '龔薇伊' },
    { value: 89, label: '方泰翔' },
    { value: 90, label: '張怡淳' },
    { value: 91, label: '吳承叡' },
    { value: 92, label: '黃宗榮' },
    { value: 93, label: '張進欽' },
    { value: 94, label: '謝芳銘' },
    { value: 95, label: '莊勝雄' },
    { value: 96, label: '王宣捷' },
    { value: 97, label: '李婕瑩' },
    { value: 98, label: '張珮琪' },
    { value: 99, label: '楊智雯' },
    { value: 100, label: '洪紹禎' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getUserCode(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getUserCodeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createUserCode(userCode: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, userCode).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateUserCode(id: number, userCode: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, userCode).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // 更新 使用者密碼
  changePassword(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/User/changePassword`, body);
  }

  // 重製 使用者密碼
  resetPassword(body: { SYS_StoreNo: string, User_No: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/User/resetPassword`, body);
  }
}
