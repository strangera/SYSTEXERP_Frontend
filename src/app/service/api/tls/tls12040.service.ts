import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { CleanSubmitData } from '../../../pages/tls/tls13010/tls13010.model';
import { TLS12040RequestModel } from '@pages/tls/tls12040-cru/models/tls12040-cru.model';
import { TLS12040SubmitData } from '@pages/tls/tls12040/models/tls12040submit.model';

interface TLS12040FareRequest {
  apply_no: string;
  showAll: boolean;
}

interface TLS12040CommissionRequest {
  apply_no: string;
  CurrentTltTermType: string;
}

interface APPROVE_TLS12040Request {
  apply_no: string;
}

interface UNAPPROVE_TLS12040Request {
  apply_no: string;
}

interface VOID_TLS12040Request {
  apply_no: string;
}

// ========== 續約查詢介面 ==========

/** 續約查詢請求 */
export interface RenewalQueryRequest {
  ven_no: string;
}

/** 續約用基本資訊 */
export interface RenewalBasicInfo {
  tlt_no: string;
  tlt_shortname: string;
  tlt_name: string;
  ven_uniform: string;
  ven_no: string;
  VEN_Name: string;
  VEN_Address: string;
  paper_type: string;
  org_id: string;
  bus_type: string;
  bus_class: string;
  bus_sclass: string;
  tlt_term_type: string;
  comm_comp_type: string;
  tlt_kind: string;
  deco_type: string;
  edc_yn: string;
  tlt_ctype_mtotal: string;
  overall_status: string;
  rent_ahead: string;
  rent_period: number;
  base_rent: number;
  deposit: number;
  rece_yn: string;
  pos_yn: string;
  cash_yn: string;
  comm_yn: string;
  money_type: string;
  store_way: string;
  check_type: string;
  paytype: string;
  vip_yn: string;
  credit_card: number;
  total_amt: number;
  total_amt_vendor: number;
  total_amt_unit: string;
  total_amt_vendor_unit: string;
  open_deposit: string;
  open_fees: number;
  construct_deposit: string;
  construct_fees: number;
  expiration_deposit: string;
  expiration_fees: number;
  ticket_remarks: string;
  check_day: number;
  invoice_type: string;
  email: string;
  invoice_email: string;
  CHECK_TITLE: string;
  store_tel: string;
  bank_id: string;
  vendor_acct_name: string;
  vendor_acct_no: string;
  contact_tel: string;
  contact_fax: string;
  contact_addr: string;
  water_flag: string;
  electric_flag: string;
  gas_flag: string;
  cap_saletype1: string;
  cap_saletype2: string;
  cap_saletype3: string;
  cap_saletype4: string;
  cap_saletype5: string;
  tlt_remark: string;
}

/** 續約用位置資訊 */
export interface RenewalLocationInfo {
  location_no: string;
  tlt_building: string;
  tlt_floor: string;
  area_no: string;
  tlt_space: number;
  building_desc: string;
  floor_desc: string;
  area_desc: string;
}

/** 續約查詢回應 */
export interface RenewalQueryResponse {
  source_talent_id: string;
  source_apply_no: string;
  source_contract_subno: number;
  next_contract_subno: number;
  BasicInfo: RenewalBasicInfo;
  Locations: RenewalLocationInfo[];
  FareData: any;
  ChargeData: any;
  CommissionData: any;
}

@Injectable({
  providedIn: 'root',
})
export class TLS12040Service {
  private apiUrl: string = environment.ApiUrl;

  constructor(private http: HttpClient, private errorHandler: ErrorHandlerService) { }

  /** 查詢資料 */
  queryTLS12040(payload: any) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS12040`, payload).pipe(
      tap((res) => console.log('查詢結果:', res)),
      map((response: { Status: string; Data: any[]; }) => {
        // 如果查詢成功且有資料，就清理空格
        if (response.Status === '0000' && response.Data && Array.isArray(response.Data)) {
          response.Data = response.Data.map((item: any) => ({
            ...item,
            tlt_term_type: item.tlt_term_type?.trim() || ''
          }));
        }
        return response;
      })
    );
  }

  /** 查詢維護地點資料 */
  // 在 TLS12040Service 中添加
  queryTLS12040Detail(request: TLS12040RequestModel): Observable<any> {
    return this.http.post(`${this.apiUrl}/TLS0000/TLS1000/queryTLS12040Detail`, request).pipe(
      tap((res) => console.log('查詢合約詳細資料結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }
  /** 查詢維護地點資料 */
  // Service 方法
  queryTLS12040Fare(request: TLS12040FareRequest) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS12040Fare`, request).pipe(
      tap((res) => console.log('查詢扣款資料結果:', res)),
    );
  }

  /** 查詢抽成設定資料 */
  queryTLS12040Charge(apply_no: string | null) {
    const payload = { apply_no: apply_no };
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS12040Charge`, payload).pipe(
      tap((res) => console.log('查詢抽成設定資料結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  /** 查詢契約書租金設定資料 - Next3 使用 */
  queryTLS12040Commission(request: TLS12040CommissionRequest) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS12040Commission`, request).pipe(
      tap((res) => console.log('查詢租金設定資料結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  /**
   * 提交清理後的契約資料到後端
   * @param cleanData 清理後的提交資料
   * @returns Observable<any>
   */
  submitFinalTLS12040(cleanData: TLS12040SubmitData): Observable<any> {
    console.log('📤 TLS12040Service: 準備提交清理後的合約資料');
    console.log('📋 提交資料預覽:', {
      contractOperation: cleanData.contractInfo.operation,
      applyNo: cleanData.metadata.apply_no,
      contractId: cleanData.metadata.contractId,
      commissionType: cleanData.metadata.commissionType,
      isNewContract: cleanData.metadata.isNewContract,
      totalOperations: cleanData.metadata.totalOperations
    });

    // 對應後端 TLS12040SubmitRequest 的完整結構
    const requestPayload = {
      contractInfo: cleanData.contractInfo,
      deductions: cleanData.deductions,
      commissions: cleanData.commissions,
      conditions: cleanData.conditions,
      metadata: cleanData.metadata
    };

    console.log('🚀 TLS12040Service: 發送 API 請求到:', `${this.apiUrl}/TLS0000/TLS1000/submitFinalTLS12040`);

    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/submitFinalTLS12040`, requestPayload).pipe(
      tap((res) => {
        console.log('✅ TLS12040Service: 提交合約資料成功:', res);
        if (res.Status === '0000') {
          console.log('📊 提交摘要:', {
            成功: true,
            訊息: res.Message,
            處理項目數: res.Data?.TotalProcessed || 0,
            處理時間: res.Data?.ProcessingTime,
            專櫃編號: res.Data?.TalentId,
            合約編號: res.Data?.ContractNo
          });
        }
      }),
      map((response: any) => {
        // 統一回應格式處理
        if (response.Status === '0000') {
          return {
            success: true,
            message: response.Message || '合約資料提交成功',
            data: response.Data,
            talentId: response.Data?.TalentId,
            contractNo: response.Data?.ContractNo,
            totalProcessed: response.Data?.TotalProcessed || 0,
            processingTime: response.Data?.ProcessingTime,
            warnings: response.Data?.Warnings || []
          };
        } else {
          throw new Error(response.Message || '提交失敗');
        }
      }),
      catchError((error) => {
        console.error('❌ TLS12040Service: 提交合約資料失敗:', error);

        //  修正：提供更詳細的錯誤處理
        let errorMessage = '提交合約資料失敗';
        let errorData = null;

        if (error?.error) {
          // API 回傳的結構化錯誤
          if (error.error.Message) {
            errorMessage = error.error.Message;
          }
          if (error.error.Data) {
            errorData = error.error.Data;
          }
        } else if (error?.message) {
          // 一般錯誤
          errorMessage = error.message;
        }

        // 重新包裝錯誤以包含更多資訊
        const enhancedError = new Error(errorMessage);
        (enhancedError as any).originalError = error;
        (enhancedError as any).errorData = errorData;
        (enhancedError as any).submittedData = {
          applyNo: cleanData.metadata.apply_no,
          contractId: cleanData.metadata.contractId,
          totalOperations: cleanData.metadata.totalOperations
        };

        throw enhancedError;
      })
    );
  }

  /** 審核 */
  approveTLS12040(request: APPROVE_TLS12040Request) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/approveTLS12040`, request).pipe(
      tap((res) => console.log('審核結果:', res)),
    );
  }

  /** 反審核 */
  unapproveTLS12040(request: UNAPPROVE_TLS12040Request) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/unapproveTLS12040`, request).pipe(
      tap((res) => console.log('反審核結果:', res)),
    );
  }

  /** 作廢 */
  voidTLS12040(request: VOID_TLS12040Request) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/voidTLS12040`, request).pipe(
      tap((res) => console.log('作廢結果:', res)),
    );
  }

  // ========== 續約查詢 ==========

  /**
   * 續約用 - 查詢廠商最新版次契約完整資料
   * @param ven_no 廠商編號 (唯一值，如 27669188-1)
   * @returns 最新版次契約的完整資料（含扣款、抽成、條件）
   * @description 此方法不使用通用錯誤處理器，由呼叫端自行處理錯誤訊息
   */
  queryContractForRenewal(ven_no: string): Observable<RenewalQueryResponse> {
    const payload: RenewalQueryRequest = { ven_no };

    console.log('🔄 查詢續約資料，廠商編號:', ven_no);

    return this.http.post<any>(
      `${this.apiUrl}/TLS0000/TLS1000/queryContractForRenewal`,
      payload
    ).pipe(
      tap((res) => console.log('查詢續約資料結果:', res)),
      map((response) => {
        if (response.Status === '0000') {
          console.log('✅ 續約資料查詢成功:', {
            source_talent_id: response.Data.source_talent_id,
            source_contract_subno: response.Data.source_contract_subno,
            next_contract_subno: response.Data.next_contract_subno
          });
          return response.Data as RenewalQueryResponse;
        }
        // 非成功狀態，拋出包含後端訊息的錯誤
        const errorMsg = response.Data || response.Message || '查詢續約資料失敗';
        throw { isBusinessError: true, message: errorMsg, status: response.Status };
      }),
      catchError((error) => {
        // 不使用通用錯誤處理器，避免重複顯示錯誤訊息
        // 由呼叫端 (component) 自行處理錯誤訊息顯示
        console.warn('⚠️ 查詢續約資料失敗:', error);

        // 提取後端回傳的錯誤訊息
        let errorMessage = '查詢續約資料失敗';
        if (error.isBusinessError) {
          errorMessage = error.message;
        } else if (error?.error?.Data) {
          errorMessage = error.error.Data;
        } else if (error?.error?.Message) {
          errorMessage = error.error.Message;
        } else if (error?.status === 404) {
          errorMessage = '該廠商尚無契約資料';
        }

        return throwError(() => ({ message: errorMessage, originalError: error }));
      })
    );
  }

  /**
   * 刷新使用者資料權限範圍
   */
  refreshUserDataPermissions(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/User/RefreshUserDataPermissions`, {}).pipe(
      tap((res) => console.log('刷新權限結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }
}
