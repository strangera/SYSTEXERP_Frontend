import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';
import { CleanSubmitData } from '../../../pages/tls/tls13010/tls13010.model';

interface TLS13010FareRequest {
  talentId: string;
  showAll: boolean;
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
  /** 刪除扣款項目資料 */
  deleteTLS11020(idList: number[]) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/deleteTLS11020`, { idList }).pipe(
      tap((res) => console.log('刪除結果:', res)),
      catchError(this.errorHandler.handleError)
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
  queryTLS13010ChargeUnified(request: { TalentId: string; CurrentTltTermType: string }) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS13010ChargeUnified`, request).pipe(
      tap((res) => console.log('統一抽成設定查詢結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  // 🎯 提交最終契約資料（清理後格式）
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

    // 🎯 對應後端 CleanContractRequest 的完整結構
    const requestPayload = {
      contractInfo: cleanData.contractInfo,
      deductions: cleanData.deductions,
      commissions: cleanData.commissions,
      conditions: cleanData.conditions,
      metadata: cleanData.metadata
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
        // 🎯 統一回應格式處理
        if (response.Status === '0000') {
          return {
            success: true,
            message: response.Message || '契約資料提交成功',
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
        console.error('❌ TLS13010Service: 提交契約資料失敗:', error);
        return this.errorHandler.handleError(error);
      })
    );
  }
}
