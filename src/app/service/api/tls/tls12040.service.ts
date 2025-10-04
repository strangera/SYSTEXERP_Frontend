import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, tap } from 'rxjs';
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
  queryTLS12040Charge(apply_no: string) {
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
}
