// contract-flow.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ContractFlowService {
  private contractData: {
    contractId: string | null,
    step1: any | null,    // CRU頁面的資料
    step2: any[],         // 代扣款資料
    step3: any[],         // 其他資料
    step4: any[],         // 附加資料
    step5: any | null     // 最終資料
  } = {
      contractId: null,
      step1: null,
      step2: [],
      step3: [],
      step4: [],
      step5: null
    };

  constructor(private http: HttpClient) { }

  // 儲存第1步資料
  saveStep1Data(formData: any) {
    const contractId = formData.talent_id || formData.apply_no;
    this.contractData.contractId = contractId;
    this.contractData.step1 = formData;
    console.log('暫存第1步資料:', contractId, formData);
  }

  // 取得第1步資料
  getStep1Data(queryData: any) {
    const contractId = queryData.talent_id || queryData.apply_no;
    if (this.contractData.contractId === contractId) {
      return this.contractData.step1;
    }
    return null;
  }

  // 儲存第2步資料（代扣款）
  saveStep2Data(contractId: string, data: any[]) {
    if (this.contractData.contractId === contractId) {
      this.contractData.step2 = data;
    }
  }

  // 清空所有暫存
  clearTempData() {
    this.contractData = {
      contractId: null,
      step1: null,
      step2: [],
      step3: [],
      step4: [],
      step5: null
    };
  }

  // 取得某個欄位的值（給第5步用）
  getStep1Field(fieldName: string) {
    return this.contractData.step1?.[fieldName];
  }

  // 最終送出所有資料
  submitAllData() {
    console.log('送出所有暫存資料:', this.contractData);
    // 這裡之後會呼叫你的後端API
    // return this.http.put('/api/contracts/complete', this.contractData);
  }
}
