// src/app/services/string-utils.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InputTextService {

  constructor() { }

  /**
   * 計算字串的加權長度 (中文字元 = 2, 英文字元/數字 = 1)
   * @param s 輸入字串
   * @returns 加權長度
   */
  getWeightedLength(s: string): number {
    let length = 0;
    for (const char of s ?? '') {
      length += /[^\x00-\x7F]/.test(char) ? 2 : 1;
    }
    return length;
  }

  /**
   * 根據加權長度裁切字串 (中文字元 = 2, 英文字元/數字 = 1)
   * @param s 輸入字串
   * @param weightedMax 最大加權長度
   * @returns 包含裁切後字串和是否達到最大長度的物件
   */
  trimToWeighted(s: string, weightedMax: number): { trimmedValue: string; isMaxLength: boolean } {
    let currentLength = 0;
    let trimmedValue = '';
    let isMaxLength = false;

    for (const char of s ?? '') {
      const charWeight = /[^\x00-\x7F]/.test(char) ? 2 : 1;
      if (currentLength + charWeight <= weightedMax) {
        currentLength += charWeight;
        trimmedValue += char;
      } else {
        isMaxLength = true;
        break;
      }
    }
    return { trimmedValue, isMaxLength };
  }
}
