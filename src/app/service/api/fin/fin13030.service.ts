import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseDeleteRequest, BaseQueryRequest, BaseQueryResponse, DropdownOption } from '../../../shared/models/api/base-api.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// --- FIN13030 查詢參數 Model 定義 ---
export interface FIN13030QueryRequest extends BaseQueryRequest {
  INV_GUINo_B?: string;                // 發票號碼_起
  INV_GUINo_E?: string;                // 發票號碼_迄
  INV_GUIDate_B?: string;              // 發票日期_起
  INV_GUIDate_E?: string;              // 發票日期_迄
  INV_YM_B?: string;                   // 資料所屬年月_起
  INV_YM_E?: string;                   // 資料所屬年月_迄
  INV_DeclareYM_B?: string;            // 申報年月_起
  INV_DeclareYM_E?: string;            // 申報年月_迄
  INV_Uniform?: string;                // 買受人統一編號
  GoodsOrServicesName?: string;        // 貨物或勞務名稱
  GoodsQtyStart?: number;              // 貨物或勞務數量_起
  GoodsQtyEnd?: number;                // 貨物或勞務數量_迄
  ExportMethod?: string[];             // 外銷方式
  INV_DocName?: string;                // 證明文件名稱
  INV_DocNo?: string;                  // 證明文件編號
  NonCustomsExportAmt_B?: number;      // 非經海關出口金額_起
  NonCustomsExportAmt_E?: number;      // 非經海關出口金額_迄
  INV_ExportType?: string[];           // 出口報單類別
  INV_ExportNo?: string;               // 出口報單號碼
  CustomsExportAmt_B?: number;         // 經海關出口金額_起
  CustomsExportAmt_E?: number;         // 經海關出口金額_迄
  ExportDate_B?: string;               // 輸出或結匯日期_起
  ExportDate_E?: string;               // 輸出或結匯日期_迄
  INV_Remark?: string;                 // 備註
}

// --- FIN13030 回應資料 Model 定義 ---
export interface FIN13030Data {
  ID: number;                         // 資料識別碼
  INV_GUINo: string;                  // 發票號碼
  INV_GUIDate: string;                // 發票日期 (ISO字串)
  INV_YM: string;                     // 資料所屬年月
  INV_DeclareYM: string;              // 申報年月
  INV_SAL_Uniform: string;            // 銷售方統一編號
  INV_Uniform: string;                // 買受人統一編號
  GoodsOrServicesName: string;        // 貨物或勞務名稱
  GoodsQty: number;                   // 貨物或勞務數量
  ExportMethod: string;               // 外銷方式
  INV_DocName: string;                // 證明文件名稱
  INV_DocNo: string;                  // 證明文件編號
  NonCustomsExportAmt: number;        // 非經海關出口金額
  INV_ExportType: string;             // 出口報單類別
  INV_ExportNo: string;               // 出口報單號碼
  CustomsExportAmt: number;           // 經海關出口金額
  ExportDate: string;                 // 輸出或結匯日期 (ISO字串)
  INV_Remark: string;                 // 備註
  INV_PassType: string;               // 通關方式註記
  INV_Name: string;                   // 買受人名稱
  CRT_Date: string;                   // 建立日期 (ISO字串)
  CRT_USR_No: string;                 // 建立人員編號
  CRT_USR_Name: string;               // 建立人員姓名
  UPD_Date: string;                   // 更新日期 (ISO字串)
  UPD_USR_No: string;                 // 更新人員編號
  UPD_USR_Name: string;               // 更新人員姓名
}

// 取得零稅率發票 - 查詢參數
export interface FIN13030GetZeroTaxGUIRequest {
  INV_GUINo_B?: string;             // 發票號碼_起
  INV_GUINo_E?: string;             // 發票號碼_迄
  INV_GUIDate_B?: string;           // 發票日期_起 (ISO字串)
  INV_GUIDate_E?: string;           // 發票日期_迄 (ISO字串)
  INV_YM_B?: string;                // 資料所屬年月_起
  INV_YM_E?: string;                // 資料所屬年月_迄
  INV_DeclareYM_B?: string;         // 申報年月_起
  INV_DeclareYM_E?: string;         // 申報年月_迄
}

// 取得零稅率發票 - 回應資料
export interface FIN13030GetZeroTaxGUIResponse {
  ID: number;                  // 資料識別碼
  INV_GUITrack: string;        // 發票字軌
  INV_GUINo: string;           // 發票號碼
  INV_GUIDate: string;         // 發票日期 (ISO字串)
  INV_YM: string;              // 資料所屬年月
  INV_DeclareYM: string;       // 申報年月
  INV_Uniform: string;         // 買受人統一編號
  INV_Amt: number;             // 發票金額
  INV_GUIType: string;         // 發票類別
  INV_ZeroTax: string;         // 零稅率註記
  INV_SeqNo: number;           // 序號
}


// 新增TDS10012資料 - 請求資料
export interface FIN13030InsertRequest {
  INV_GUINo: string;                // 發票號碼
  INV_YM: string;                   // 資料所屬年月
  INV_DeclareYM: string;            // 申報年月
  INV_Name: string;                 // 買受人名稱
  INV_PassType: string;             // 通關方式註記
  GoodsOrServicesName: string;      // 貨物或勞務名稱
  GoodsQty: number;                 // 貨物或勞務數量
  ExportMethod: string;             // 外銷方式
  INV_DocName: string;              // 證明文件名稱
  INV_DocNo: string;                // 證明文件編號
  NonCustomsExportAmt: number;      // 非經海關出口金額
  INV_ExportType: string;           // 出口報單類別
  INV_ExportNo: string;             // 出口報單號碼
  CustomsExportAmt: number;         // 經海關出口金額
  ExportDate: string;               // 輸出或結匯日期 (ISO字串)
  INV_Remark: string;               // 備註
  INV_GUITrack: string;             // 發票字軌
  INV_GUIType: string;              // 發票類別
  INV_ZeroTax: string;              // 零稅率註記
  INV_SeqNo: number;                // 序號
}

// 更新TDS10012資料 - 請求資料
export interface FIN13030UpdateRequest {
  ID: number;                       // 資料識別碼
  INV_GUINo: string;                // 發票號碼
  INV_YM: string;                   // 資料所屬年月
  INV_DeclareYM: string;            // 申報年月
  INV_Name: string;                 // 買受人名稱
  GoodsOrServicesName: string;      // 貨物或勞務名稱
  GoodsQty: number;                 // 貨物或勞務數量
  ExportMethod: string;             // 外銷方式
  INV_DocName: string;              // 證明文件名稱
  INV_DocNo: string;                // 證明文件編號
  NonCustomsExportAmt: number;      // 非經海關出口金額
  INV_ExportType: string;           // 出口報單類別
  INV_ExportNo: string;             // 出口報單號碼
  CustomsExportAmt: number;         // 經海關出口金額
  ExportDate: string;               // 輸出或結匯日期 (ISO字串)
  INV_Remark: string;               // 備註
  INV_PassType: string;             // 通關方式註記
  INV_GUITrack: string;             // 發票字軌
  INV_GUIType: string;              // 發票類別
  INV_ZeroTax: string;              // 零稅率註記
  INV_SeqNo: number;                // 序號
}

@Injectable({
  providedIn: 'root'
})
export class FIN13030Service {
  private apiUrl: string = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN13030(data: FIN13030QueryRequest): Observable<BaseQueryResponse<FIN13030Data>> {
    return this.http.post<BaseQueryResponse<FIN13030Data>>(`${this.apiUrl}/queryFIN13030`, data);

    // 回傳假資料
    return new Observable<BaseQueryResponse<FIN13030Data>>(observer => {
      const Data: BaseQueryResponse<FIN13030Data> = {
        TotalCount: 1,
        Data: [{
          ID: 0,
          INV_GUINo: '12345678',
          INV_GUIDate: '2023-10-01T00:00:00Z',
          INV_YM: '202310',
          INV_DeclareYM: '202310',
          INV_SAL_Uniform: '12345678',
          INV_Uniform: '87654321',
          GoodsOrServicesName: 'Sample Goods',
          GoodsQty: 100,
          ExportMethod: '1',
          INV_DocName: 'Sample Document',
          INV_DocNo: 'DOC123456',
          NonCustomsExportAmt: 1000,
          INV_ExportType: '1',
          INV_ExportNo: 'EXP123456',
          CustomsExportAmt: 2000,
          ExportDate: '2023-10-02T00:00:00Z',
          INV_Remark: 'Sample Remark',
          INV_PassType: '1',
          INV_Name: 'Sample Buyer',
          CRT_Date: '2023-10-01T00:00:00Z',
          CRT_USR_No: 'USR001',
          CRT_USR_Name: 'User One',
          UPD_Date: '2023-10-01T00:00:00Z',
          UPD_USR_No: 'USR001',
          UPD_USR_Name: 'User One',
        }, {
          ID: 1,
          INV_GUINo: '87654321',
          INV_GUIDate: '2023-10-02T00:00:00Z',
          INV_YM: '202310',
          INV_DeclareYM: '202310',
          INV_SAL_Uniform: '87654321',
          INV_Uniform: '12345678',
          GoodsOrServicesName: 'Sample Goods 2',
          GoodsQty: 200,
          ExportMethod: '2',
          INV_DocName: 'Sample Document 2',
          INV_DocNo: 'DOC654321',
          NonCustomsExportAmt: 2000,
          INV_ExportType: '2',
          INV_ExportNo: 'EXP654321',
          CustomsExportAmt: 4000,
          ExportDate: '2023-10-03T00:00:00Z',
          INV_Remark: 'Sample Remark 2',
          INV_PassType: '2',
          INV_Name: 'Sample Buyer 2',
          CRT_Date: '2023-10-01T00:00:00Z',
          CRT_USR_No: 'USR001',
          CRT_USR_Name: 'User One',
          UPD_Date: '2023-10-01T00:00:00Z',
          UPD_USR_No: 'USR001',
          UPD_USR_Name: 'User One',
        }],
        Status: '',
        Message: '',
        TotalPage: 0
      };
      observer.next(Data);
      observer.complete();
    });
  }

  // 取得零稅率發票
  queryFIN13030_GetZeroTaxGUI(data: FIN13030GetZeroTaxGUIRequest): Observable<BaseQueryResponse<FIN13030GetZeroTaxGUIResponse>> {
    return this.http.post<BaseQueryResponse<FIN13030GetZeroTaxGUIResponse>>(`${this.apiUrl}/queryFIN13030_GetZeroTaxGUI`, data);
    // 回傳假資料
    return new Observable<BaseQueryResponse<FIN13030GetZeroTaxGUIResponse>>(observer => {
      const Data: BaseQueryResponse<FIN13030GetZeroTaxGUIResponse> = {
        TotalCount: 1,
        Data: [{
          ID: 0,
          INV_GUITrack: 'A',
          INV_GUINo: '12345678',
          INV_GUIDate: '2023-10-01T00:00:00Z',
          INV_YM: '202310',
          INV_DeclareYM: '202310',
          INV_Uniform: '87654321',
          INV_Amt: 1000,
          INV_GUIType: '1',
          INV_ZeroTax: 'Y',
          INV_SeqNo: 1
        }],
        Status: '',
        Message: '',
        TotalPage: 0
      };
      observer.next(Data);
      observer.complete();
    });
  }

  // 新增TDS10012資料
  insertFIN13030(data: FIN13030InsertRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN13030`, data);
  }

  // 更新TDS10012資料表
  updateFIN13030(data: FIN13030UpdateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateFIN13030`, data);
  }

  // 刪除TDS10012資料
  deleteFIN13030(data: BaseDeleteRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteFIN13030`, data);
  }


  // 取得外銷方式選項
  getExportMethodOptions(): DropdownOption[] {
    return [
      { Name: '1.外銷貨物', No: '1' },
      { Name: '2.與外銷有關之勞務,或在國內提供而在國外使用之勞務', No: '2' },
      { Name: '3.依法設立之免稅商店與過境或出境旅客之貨物', No: '3' },
      { Name: '4.出口區,科學園區,保稅工廠或保稅倉庫之機器設備原料,物料,燃料,半制品', No: '4' },
      { Name: '5.國際運輸', No: '5' },
      { Name: '6.國際運輸用之船舶,航空器,及遠洋漁船', No: '6' },
      { Name: '7.銷售與國際運輸之船舶,航空器,及遠洋漁船所使用之貨物或修繕勞務', No: '7' }
    ]
  }

  // 取得出口報單類別選項
  getINV_ExportTypeOptions(): DropdownOption[] {
    return [
      { Name: '1.國內廠售與保稅廠原料', No: '1' },
      { Name: '2.保稅廠售與他保稅區再加工出口', No: '2' },
      { Name: '3.保稅廠原料復出口', No: '3' },
      { Name: '4.保稅廠加工品出口', No: '4' },
      { Name: '5.課稅區售與發貨或退回物流中心', No: '5' },
      { Name: '6.保稅貨售與保稅倉或物流中心', No: '6' },
      { Name: '7.保稅貨退運出口', No: '7' },
      { Name: '8.保稅貨出倉出口', No: '8' },
      { Name: '9.國貨進保稅倉', No: '9' },
      { Name: 'A.加工區輸出國外', No: 'A' },
      { Name: 'B.課稅區輸入加工區', No: 'B' },
      { Name: 'C.國外輸入加工區復出口', No: 'C' },
      { Name: 'D.加工區售予他保稅區再加工出口', No: 'D' },
      { Name: 'E.外貨復出口', No: 'E' },
      { Name: 'F.國貨出口', No: 'F' },
      { Name: 'G.物流中心貨物出口', No: 'G' },
      { Name: 'H.國內廠售與科園區', No: 'H' },
      { Name: 'I.科園區售與他保稅區再加工出口', No: 'I' },
      { Name: 'J.科園區進口原料復出口', No: 'J' },
      { Name: 'K.科園區成品出口', No: 'K' },
      { Name: 'L.出口快遞文件(簡易申報單)', No: 'L' },
      { Name: 'M.出口低價快遞貨物(簡易申報單)', No: 'M' }
    ];
  }

  // 取得通關方式選項
  getINV_PassTypeOptions(): DropdownOption[] {
    return [
      { Name: '1.適用零稅率非經海關出口應附證明文件之銷項', No: '1' },
      { Name: '2.適用零稅率經海關出口免附證明文件之銷項', No: '2' }
    ];
  }
}