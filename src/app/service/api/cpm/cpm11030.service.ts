import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

export interface Cpm11030Row {
  Loan_No: string;        // 出借編號
  Loan_Date: string;      // 出借日期 (yyyy-MM-dd)
  Service_Id: string;     // 服務台位置
  USER_NAME: string;      // 借用人姓名
  Loan_phone: string;     // 電話
  Loan_USR_Name: string;  // 出借處理人員
  CertTypeName: string;   // 證件類型(組合過的顯示：代碼-名稱 或純名稱)
  Cert_No: string;        // 證件編號
  Device_Name: string;    // 設備名稱

  [key: string]: any;
}

export interface Cpm11030Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];

  OrderBy?: string | null;
  Offset?: number | null;

  RecordCode?: string;
  BorrowDateFrom?: string;
  BorrowDateTo?: string;
  Name?: string;
  StaffName?: string;
  Phone?: string;
  PaperTypeList?: string[];
  PaperCode?: string;
  EquipmentNameList?: string[];
  DeviceCode?: string;
  CounterCode?: string;

  [key: string]: any;
}

/** CRU 用 payload（對應你 CSS3001 INSERT 需要的欄位） */
export interface Cpm11030CruPayload {
  Loan_No?: string;      // 出借編號（Edit 用；Create 可不送，讓後端產生）
  Loan_Date: string;     // 出借日期 (yyyy-MM-dd)
  Service_Id: string;    // 服務台位置編號
  User_Name: string;     // 借用人姓名
  Cert_Type: string;     // 證件類型代碼 (01/02/03/04/05)
  Cert_No: string;       // 證件編號
  Loan_Phone: string;    // 電話
  Loan_USR_Name: string; // 出借處理人員名稱
  Device_ID: string;     // 設備編號
  Device_Name?: string;  // 設備名稱（可由設備下拉帶入）
}

@Injectable({ providedIn: 'root' })
export class Cpm11030Service {
  // Controller 大致假設：/CPM0000/CPM1000
  private apiUrl = `${environment.ApiUrl}/CPM0000/CPM1000`;

  constructor(private http: HttpClient) {}

  /** 查詢 設備出借作業 列表 */
  queryCPM11030(body: Cpm11030Request): Observable<ApiResponse<Cpm11030Row[]>> {
    // TODO: 後端完成後，改成真正的 http.post
    // return this.http.post<ApiResponse<Cpm11030Row[]>>(
    //   `${this.apiUrl}/queryCPM11030`,
    //   body
    // );

    const mock: Cpm11030Row[] = [
      {
        Loan_No: 'L202512100001',
        Loan_Date: '2025-12-10',
        Service_Id: '11A001',
        USER_NAME: '王小明',
        Loan_phone: '0912345678',
        Loan_USR_Name: '管理者',
        CertTypeName: '身分證',
        Cert_No: 'A123456789',
        Device_Name: '愛心輪椅',
      },
      {
        Loan_No: 'L202512100002',
        Loan_Date: '2025-12-10',
        Service_Id: '15A001',
        USER_NAME: '林小美',
        Loan_phone: '0922333444',
        Loan_USR_Name: '服務人員A',
        CertTypeName: '健保卡',
        Cert_No: '0000123456',
        Device_Name: '奇哥Joie輕便娃娃車',
      },
    ];

    const response: ApiResponse<Cpm11030Row[]> = {
      Data: mock,
      TotalCount: mock.length,
      IsSuccess: true,
      Message: '',
    } as any;

    return of(response);
  }

  /** 新增 設備出借作業（CPM11030） */
  insertCPM11030(body: Cpm11030CruPayload): Observable<ApiResponse<any>> {
    // TODO: 後端完成後，改成 http.post：
    // return this.http.post<ApiResponse<any>>(
    //   `${this.apiUrl}/insertCPM11030`,
    //   body
    // );

    console.log('Mock insertCPM11030 payload:', body);
    const resp: ApiResponse<any> = {
      Data: null,
      IsSuccess: true,
      Message: 'Mock insert success',
    } as any;
    return of(resp);
  }

  /** 修改 設備出借作業（CPM11030） */
  updateCPM11030(body: Cpm11030CruPayload): Observable<ApiResponse<any>> {
    // TODO: 後端完成後，改成 http.post / put：
    // return this.http.post<ApiResponse<any>>(
    //   `${this.apiUrl}/updateCPM11030`,
    //   body
    // );

    console.log('Mock updateCPM11030 payload:', body);
    const resp: ApiResponse<any> = {
      Data: null,
      IsSuccess: true,
      Message: 'Mock update success',
    } as any;
    return of(resp);
  }
}

export { ApiResponse };
