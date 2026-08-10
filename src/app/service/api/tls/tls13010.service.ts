import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { CleanSubmitData } from '@pages/tls/tls13010-v2/core/models/workflow/clean-submit.interface';
import { RenewalQueryResponse, RenewalQueryRequest } from './tls12040.service';

interface TLS13010FareRequest {
  talentId: string;
  showAll: boolean;
}

interface APPROVE_TLS13010Request {
  talentId: string;
}

interface UNAPPROVE_TLS13010Request {
  talentId: string;
}

interface VOID_TLS13010Request {
  talentId: string;
}

interface EARLY_TERMINATION_TLS13010Request {
  talentId: string;
  tlt_contract_edate: string; // YYYY-MM-DD
}

interface TLS13010CommissionRequest {
  TalentId: string;
  CurrentTltTermType: string;
}


@Injectable({
  providedIn: 'root',
})
export class TLS13010Service {
  private apiUrl: string = environment.ApiUrl;

  constructor(private http: HttpClient, private errorHandler: ErrorHandlerService) { }

  /** 查詢契約書維護資料 */
  queryTLS13010(payload: any) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS13010`, payload).pipe(
      tap((res) => console.log('查詢結果:', res)),
      map((response: { Status: string; Data: any[]; }) => {
        // 如果查詢成功且有資料，就清理空格並轉換 check_type
        if (response.Status === '0000' && response.Data && Array.isArray(response.Data)) {
          response.Data = response.Data.map((item: any) => {
            // ✅ 處理 check_type 轉換為 check_typeList
            let checkTypeList = item.check_typeList || [];

            // 第一次轉換嘗試
            if ((!checkTypeList || checkTypeList.length === 0) && item.check_type) {
              const checkTypeStr = String(item.check_type);
              if (checkTypeStr && checkTypeStr !== '' && checkTypeStr !== 'null' && checkTypeStr !== 'undefined') {
                checkTypeList = checkTypeStr.split(',').map((x: string) => x.trim()).filter((x: string) => x);
              }
            }

            // ✅ 額外防護：如果 check_typeList 仍然是空陣列但 check_type 有值，強制轉換
            if (item.check_type && Array.isArray(checkTypeList) && checkTypeList.length === 0) {
              const checkTypeStr = String(item.check_type);
              if (checkTypeStr && checkTypeStr !== '' && checkTypeStr !== 'null' && checkTypeStr !== 'undefined') {
                checkTypeList = checkTypeStr.split(',').map((x: string) => x.trim()).filter((x: string) => x);
                console.log(`🔧 [queryTLS13010] 強制轉換 check_type "${checkTypeStr}" 為 check_typeList:`, checkTypeList);
              }
            }

            return {
              ...item,
              tlt_term_type: item.tlt_term_type?.trim() || '',
              check_typeList: checkTypeList  // ✅ 加入轉換後的 check_typeList
            };
          });
        }
        return response;
      })
    );
  }


  /** 查詢契約書維護資料 */
  queryTLS13010Detail(talent_id: any) {
    // 🔥 確保 talent_id 轉換為字串格式再傳送給後端
    const payload = {
      talent_id: String(talent_id)
    };

    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS13010Detail`, payload).pipe(
      tap((res) => console.log('查詢結果:', res)),
      map((response: { Status: string; Data: any[]; }) => {
        // 如果查詢成功且有資料，就清理空格並轉換 check_type
        if (response.Status === '0000' && response.Data && Array.isArray(response.Data)) {
          response.Data = response.Data.map((item: any) => {
            // ✅ 處理 check_type 轉換為 check_typeList
            let checkTypeList = item.check_typeList || [];

            // 第一次轉換嘗試
            if ((!checkTypeList || checkTypeList.length === 0) && item.check_type) {
              const checkTypeStr = String(item.check_type);
              if (checkTypeStr && checkTypeStr !== '' && checkTypeStr !== 'null' && checkTypeStr !== 'undefined') {
                checkTypeList = checkTypeStr.split(',').map((x: string) => x.trim()).filter((x: string) => x);
              }
            }

            // ✅ 額外防護：如果 check_typeList 仍然是空陣列但 check_type 有值，強制轉換
            if (item.check_type && Array.isArray(checkTypeList) && checkTypeList.length === 0) {
              const checkTypeStr = String(item.check_type);
              if (checkTypeStr && checkTypeStr !== '' && checkTypeStr !== 'null' && checkTypeStr !== 'undefined') {
                checkTypeList = checkTypeStr.split(',').map((x: string) => x.trim()).filter((x: string) => x);
                console.log(`🔧 [queryTLS13010Detail] 強制轉換 check_type "${checkTypeStr}" 為 check_typeList:`, checkTypeList);
              }
            }

            return {
              ...item,
              tlt_term_type: item.tlt_term_type?.trim() || '',
              check_typeList: checkTypeList  // ✅ 加入轉換後的 check_typeList
            };
          });
        }
        return response;
      })
    );
  }

  /** 查詢契約書維護地點資料 */
  queryTLS13010Location(talentId: string) {
    const payload = { TalentId: talentId };
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS13010Location`, payload).pipe(
      tap((res) => console.log('查詢地點資料結果:', res)),
    );
  }

  /** 查詢契約書維護地點資料 */
  // Service 方法
  queryTLS13010Fare(request: TLS13010FareRequest) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS13010Fare`, request).pipe(
      tap((res) => console.log('查詢扣款資料結果:', res)),
    );
  }
  /** 查詢契約書抽成設定資料 */
  queryTLS13010Charge(talentId: string) {
    const payload = { TalentId: talentId };
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS13010Charge`, payload).pipe(
      tap((res) => console.log('查詢抽成設定資料結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  /** 查詢契約書租金設定資料 - Next3 使用 */
  queryTLS13010Commission(request: TLS13010CommissionRequest) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS13010Commission`, request).pipe(
      tap((res) => console.log('查詢租金設定資料結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  // queryTLS13010ChargeUnified(request: { TalentId: string; CurrentTltTermType: string }) {
  //   return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS13010ChargeUnified`, request).pipe(
  //     tap((res) => console.log('統一抽成設定查詢結果:', res)),
  //     catchError(this.errorHandler.handleError)
  //   );
  // }

  // 提交最終契約資料（清理後格式）
  /**
   * 提交清理後的契約資料到後端
   * @param cleanData 清理後的提交資料
   * @returns Observable<any>
   */
  submitFinalTLS13010(cleanData: CleanSubmitData): Observable<any> {
    console.log('📤 TLS13010Service: 準備提交清理後的契約資料');
    console.log('📋 提交資料預覽:', {
      contractOperation: cleanData.contractInfo.operation,
      talentId: cleanData.metadata.talentId,
      contractId: cleanData.metadata.contractId,
      commissionType: cleanData.metadata.commissionType,
      isNewContract: cleanData.metadata.isNewContract,
      totalOperations: cleanData.metadata.totalOperations
    });

    // 對應後端 CleanContractRequest 的完整結構
    // [FromBody] 直接綁定整個 request body
    const requestPayload = {
      contractInfo: cleanData.contractInfo,
      deductions: cleanData.deductions,
      commissions: cleanData.commissions,
      conditions: cleanData.conditions,
      metadata: cleanData.metadata,
      commissionTypeChange: cleanData.commissionTypeChange
    };

    console.log('🚀 TLS13010Service: 發送 API 請求到:', `${this.apiUrl}/TLS0000/TLS1000/submitFinalTLS13010`);

    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/submitFinalTLS13010`, requestPayload).pipe(
      tap((res) => {
        console.log('✅ TLS13010Service: 提交契約資料成功:', res);
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
            message: response.Message || '契約資料提交成功',
            data: response.Data,
            talentId: response.Data?.TalentId,
            applyNo: response.Data?.ApplyNo,
            tltNo: response.Data?.TltNo,
            contractNo: response.Data?.ContractNo,
            totalProcessed: response.Data?.TotalProcessed || 0,
            processingTime: response.Data?.ProcessingTime,
            warnings: response.Data?.Warnings || []
          };
        } else {
          // 業務邏輯失敗（Status !== '0000'）：回傳 success: false，不拋出例外
          // 避免觸發 catchError 導致重複顯示錯誤通知
          return {
            success: false,
            message: response.Message || response.Data?.Message || '提交失敗'
          };
        }
      }),
      catchError((error) => {
        // 此處只會接到 HTTP 層錯誤（interceptor 已顯示通知並 rethrow）
        // 不再重複呼叫 handleError，直接 rethrow
        console.error('❌ TLS13010Service: 提交契約資料失敗:', error);
        return throwError(() => error);
      })
    );
  }

  /** 審核 */
  approveTLS13010(request: APPROVE_TLS13010Request) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/approveTLS13010`, request).pipe(
      tap((res) => console.log('審核結果:', res)),
    );
  }

  /** 反審核 */
  unapproveTLS13010(request: UNAPPROVE_TLS13010Request) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/unapproveTLS13010`, request).pipe(
      tap((res) => console.log('反審核結果:', res)),
    );
  }

  /** 作廢 */
  voidTLS13010(request: VOID_TLS13010Request) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/voidTLS13010`, request).pipe(
      tap((res) => console.log('作廢結果:', res)),
    );
  }

  /** 提前撤櫃 */
  earlyTerminationTLS13010(request: EARLY_TERMINATION_TLS13010Request) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/earlyTerminationTLS13010`, request).pipe(
      tap((res) => console.log('提前撤櫃結果:', res)),
    );
  }

  /** 根據廠商編號查詢POS2013廠商聯絡資訊 */
  queryVendorInfo(venNo: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryVendorInfo`, { venNo }).pipe(
      tap((res) => console.log('查詢廠商聯絡資訊結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  /**
   * 檢查廠商編號是否已被其他櫃號的未作廢合約使用
   * @returns 佔用中的專櫃編號（空字串=可用）
   */
  checkVendorOccupied(venNo: string, tltNo?: string | null): Observable<string> {
    return this.http.post<any>(
      `${this.apiUrl}/TLS0000/TLS1000/checkVendorOccupied`,
      { ven_no: venNo, tlt_no: tltNo ?? '' }
    ).pipe(
      map((res) => (res?.Data as string) ?? ''),
      catchError(this.errorHandler.handleError)
    );
  }

  /** 檢查指定專櫃編號是否存在尚未審核的合約版本 */
  checkUnapprovedVersion(tltNo: string): Observable<boolean> {
    return this.http.post<any>(
      `${this.apiUrl}/TLS0000/TLS1000/checkUnapprovedVersion`,
      JSON.stringify(tltNo),
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(
      map((res) => res.Data as boolean),
      catchError(this.errorHandler.handleError)
    );
  }

  /**
   * 續約用 - 查詢廠商最新版次契約完整資料（從契約表 TLS13010 查詢）
   * @param ven_no 廠商編號 (唯一值，如 27669188-1)
   * @returns 最新版次契約的完整資料（含扣款、抽成、條件）
   * @description 此方法不使用通用錯誤處理器，由呼叫端自行處理錯誤訊息
   * TODO: 待後端確認 TLS13010 對應的續約查詢 endpoint，目前暫用 queryContractForRenewal
   */
  queryContractForRenewal(ven_no: string, tlt_no?: string): Observable<RenewalQueryResponse> {
    const payload: RenewalQueryRequest = { ven_no, ...(tlt_no ? { tlt_no } : {}) };

    console.log('🔄 [TLS13010] 查詢續約資料，廠商編號:', ven_no, '專櫃編號:', tlt_no);

    return this.http.post<any>(
      `${this.apiUrl}/TLS0000/TLS1000/queryContractForRenewal`,
      payload
    ).pipe(
      tap((res) => console.log('[TLS13010] 查詢續約資料結果:', res)),
      map((response) => {
        if (response.Status === '0000') {
          return response.Data as RenewalQueryResponse;
        }
        const errorMsg = response.Data || response.Message || '查詢續約資料失敗';
        throw { isBusinessError: true, message: errorMsg, status: response.Status };
      }),
      catchError((error) => {
        console.warn('⚠️ [TLS13010] 查詢續約資料失敗:', error);

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
   * TLS13020 續約維護 - 查詢每個專櫃最新版次合約
   * 只讀 TLTTALENT，每個 tlt_no 只回傳 contract_subno 最大的那筆
   */
  queryTLS13020(payload: any) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS13020`, payload).pipe(
      tap((res) => console.log('[queryTLS13020] 結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  /**
   * 查詢契約清單（只查 TLTTALENT，含最新版去重，供續約查詢 dialog 使用）
   * 後端已做 ROW_NUMBER 去重 + 使用者權限過濾，前端不需再做
   */
  queryTLTALENTList(payload: {
    tlt_no?: string;
    tlt_name?: string;
    ven_uniformList?: string[];
    apply_typeList?: string[];
  }): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/TLS0000/TLS1000/queryTLTALENTList`,
      payload
    ).pipe(
      tap((res) => console.log('[queryTLTALENTList] 結果:', res)),
      catchError(this.errorHandler.handleError)
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
