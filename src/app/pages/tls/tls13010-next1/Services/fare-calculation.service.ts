import { FareItem } from './../../tls13010/tls13010.model';
import { Injectable } from '@angular/core';

/**
 * 扣款計算服務
 * 負責各種類型的扣款金額計算邏輯
 */
@Injectable({
  providedIn: 'root'
})
export class FareCalculationService {
  private totalLocationSpace = 0;
  /**
   * 設定總坪數（供其他組件呼叫）
   */
  setTotalLocationSpace(totalSpace: number): void {
    this.totalLocationSpace = totalSpace;
    console.log('🏢 設定總坪數:', totalSpace);
  }

  /**
   * 取得總坪數
   */
  getTotalLocationSpace(): number {
    return this.totalLocationSpace;
  }


  /**
   * 根據扣款類型自動計算金額
   * @param data 扣款項目資料
   * @param capType 扣款類型 (A/B/C/D/E)
   * @param changedField 變更的欄位名稱
   */
  autoCalculateAmount(data: any, capType: string, changedField?: string): void {
    switch (capType) {
      case 'A':
        this.calculateTypeA(data);
        break;
      case 'B':
        this.calculateTypeB(data);
        break;
      case 'C':
        this.calculateTypeC(data, changedField);
        break;
      case 'D':
        this.calculateTypeD(data);
        break;
      case 'E':
        this.calculateTypeE(data);
        break;
      default:
        console.warn(`未知的扣款類型: ${capType}`);
    }
  }

  /**
   * A 類型計算：一次扣款
   * 計算公式：金額 = 單價 × 數量
   */
  private calculateTypeA(data: any): void {
    const unitPrice = parseFloat(data.tpy_unitamt) || 0;

    // 坪數單位自動帶入總坪數
    if (data.tpy_type === '01' && this.totalLocationSpace > 0) {
      data.tpy_qty = this.totalLocationSpace;
      console.log(`🏢 A類型坪數自動計算: 總坪數 = ${this.totalLocationSpace}`);
    }

    const quantity = parseFloat(data.tpy_qty) || 0; // 在條件判斷後才取值

    if (unitPrice > 0 && quantity > 0) {
      data.tpy_amount = unitPrice * quantity;
      console.log(`💰 A類型計算: ${unitPrice} × ${quantity} = ${data.tpy_amount}`);
    } else {
      data.tpy_amount = 0;
    }

    // A類型特殊處理：結束日期等於開始日期
    if (data.tpy_bdate) {
      data.tpy_edate = data.tpy_bdate;
    }
  }

  /**
   * B 類型計算：每月扣款
   * 計算公式：金額 = 單價 × 數量
   */
  private calculateTypeB(data: any): void {
    const unitPrice = parseFloat(data.tpy_unitamt) || 0;
    const quantity = parseFloat(data.tpy_qty) || 0;

    if (unitPrice > 0 && quantity > 0) {
      data.tpy_amount = unitPrice * quantity;
      console.log(`💰 B類型計算: ${unitPrice} × ${quantity} = ${data.tpy_amount}`);
    } else {
      data.tpy_amount = 0;
    }
  }

  /**
   * C 類型計算：平均分攤
   * 兩種模式：
   * 1. 輸入首期金額 → 計算每月金額
   * 2. 輸入每月金額 → 計算首期金額
   */
  private calculateTypeC(data: any, changedField?: string): void {
    console.log(`🧮 C類型平均分攤計算 - 異動欄位: ${changedField}`, {
      總金額: data.tpy_totalamt,
      期數: data.period_nos,
      每月金額: data.tpy_amount,
      首期金額: data.down_payment
    });

    const totalAmount = parseFloat(data.tpy_totalamt) || 0;
    const periods = parseInt(data.period_nos) || 0;
    const monthlyAmount = parseFloat(data.tpy_amount) || 0;
    const downPayment = parseFloat(data.down_payment) || 0;

    // 必須有總金額和期數才能計算
    if (totalAmount <= 0 || periods <= 0) {
      console.log('⚠️ C類型計算: 總金額或期數無效，停止計算');
      return;
    }

    // 期數必須大於 1 才能有分攤概念
    if (periods <= 1) {
      console.log('⚠️ C類型計算: 期數必須大於1');
      data.down_payment = totalAmount;
      data.tpy_amount = 0;
      return;
    }

    switch (changedField) {
      case 'tpy_totalamt': // 總金額變更
        if (monthlyAmount > 0) {
          const calculatedDownPayment = totalAmount - (monthlyAmount * (periods - 1));
          data.down_payment = Math.max(0, calculatedDownPayment);
          console.log(`💰 總金額變更: 根據每月金額計算首期金額 = ${data.down_payment}`);
        } else if (downPayment > 0) {
          const calculatedMonthlyAmount = (totalAmount - downPayment) / (periods - 1);
          data.tpy_amount = Math.max(0, calculatedMonthlyAmount);
          console.log(`💰 總金額變更: 根據首期金額計算每月金額 = ${data.tpy_amount}`);
        }
        break;

      case 'period_nos': // 期數變更
        if (monthlyAmount > 0) {
          const calculatedDownPayment = totalAmount - (monthlyAmount * (periods - 1));
          data.down_payment = Math.max(0, calculatedDownPayment);
          console.log(`📅 期數變更: 重新計算首期金額 = ${data.down_payment}`);
        } else if (downPayment > 0) {
          const calculatedMonthlyAmount = (totalAmount - downPayment) / (periods - 1);
          data.tpy_amount = Math.max(0, calculatedMonthlyAmount);
          console.log(`📅 期數變更: 重新計算每月金額 = ${data.tpy_amount}`);
        }
        break;

      case 'tpy_amount': // 每月金額變更
        if (monthlyAmount >= 0) {
          const calculatedDownPayment = totalAmount - (monthlyAmount * (periods - 1));
          data.down_payment = Math.max(0, calculatedDownPayment);
          console.log(`🔄 每月金額變更: 計算首期金額 = ${data.down_payment}`);
        }
        break;

      case 'down_payment': // 首期金額變更
        if (downPayment >= 0) {
          const calculatedMonthlyAmount = (totalAmount - downPayment) / (periods - 1);
          data.tpy_amount = Math.max(0, calculatedMonthlyAmount);
          console.log(`🔄 首期金額變更: 計算每月金額 = ${data.tpy_amount}`);
        }
        break;
    }

    // 驗證計算結果
    this.validateTypeCCalculation(data);
  }

  /**
 * 🎯 新增：專門用於期數計算的方法
 */
  calculatePeriodsBetweenDates(startDate: Date, endDate: Date): number {
    if (!startDate || !endDate || startDate > endDate) {
      return 1;
    }

    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();

    // 計算月份差
    const months = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

    console.log('🗓️ 期數計算:', {
      開始: `${startYear}/${startMonth + 1}`,
      結束: `${endYear}/${endMonth + 1}`,
      期數: months
    });

    return Math.max(1, months);
  }

  /**
   * D 類型計算：比率分攤
   */
  private calculateTypeD(data: any): void {
    const rate = parseFloat(data.tpy_rate) || 0;
    // D類型的具體計算邏輯根據業務需求實現
    console.log(`💰 D類型計算 - 比率: ${rate}`);
  }

  /**
   * E 類型計算：活動扣款
   */
  private calculateTypeE(data: any): void {
    const rate = parseFloat(data.tpy_rate) || 0;
    // E類型的具體計算邏輯根據業務需求實現
    console.log(`💰 E類型計算 - 比率: ${rate}`);
  }

  /**
   * 驗證 C 類型計算結果
   */
  private validateTypeCCalculation(data: any): boolean {
    const totalAmount = parseFloat(data.tpy_totalamt) || 0;
    const periods = parseInt(data.period_nos) || 0;
    const monthlyAmount = parseFloat(data.tpy_amount) || 0;
    const downPayment = parseFloat(data.down_payment) || 0;

    if (totalAmount > 0 && periods > 1) {
      const calculatedTotal = downPayment + (monthlyAmount * (periods - 1));
      const difference = Math.abs(calculatedTotal - totalAmount);

      if (difference > 1) {
        console.warn(`⚠️ C類型驗算異常: 差異 ${difference} 元`);
        return false;
      } else {
        console.log(`✅ C類型驗算正確`);
        return true;
      }
    }
    return true;
  }

  /**
   * 檢查計算結果是否有效
   */
  isCalculationValid(data: any, capType: string): boolean {
    switch (capType) {
      case 'A':
      case 'B':
        return (parseFloat(data.tpy_amount) || 0) >= 0;
      case 'C':
        return this.validateTypeCCalculation(data);
      case 'D':
      case 'E':
        return (parseFloat(data.tpy_rate) || 0) >= 0;
      default:
        return true;
    }
  }
}
