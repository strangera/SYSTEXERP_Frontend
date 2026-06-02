import { Injectable } from "@angular/core";
import { KeyItem } from "./tls42010.mapper";

@Injectable({ providedIn: 'root' })
export class TlsKeyboardService {

  // 搬移 buildGrid 邏輯
  buildGrid(pageIndex: number, xCount: number, yCount: number): KeyItem[] {
    const grid: KeyItem[] = [];
    const offsetY = pageIndex * yCount;
    for (let y = 1; y <= yCount; y++) {
      for (let x = 1; x <= xCount; x++) {
        grid.push({
          code: `${x.toString().padStart(2, '0')}${(y + offsetY).toString().padStart(2, '0')}`,
          x,
          y: y + offsetY,
          mergeRight: 0,
          mergeDown: 0,
          isHidden: false,
          gridStyle: {},
          buttonStyle: {}
        });
      }
    }
    return grid;
  }

  // 搬移隱藏邏輯 (calculateIsHidden)
  public calculateIsHidden(key: KeyItem, page: KeyItem[]): boolean {
    for (const k of page) {
      if (k === key) continue;

      const mRight = k.mergeRight || 0;
      const mDown = k.mergeDown || 0;

      // 如果自己的座標落在別人的合併範圍內 (排除自己是起點的情況)
      if (key.x >= k.x && key.x <= k.x + mRight &&
        key.y >= k.y && key.y <= k.y + mDown) {
        return true;
      }
    }
    return false;
  }

  getNextMergeValue(key: KeyItem, type: 'mergeRight' | 'mergeDown', xCount: number, yCount: number): number {
    const keyX = parseInt(key.code.substring(0, 2));
    const keyY = parseInt(key.code.substring(2, 4));

    if (type === 'mergeRight') {
      if (keyX >= xCount) return 0;
      const current = key.mergeRight || 0;
      const max = xCount - keyX;
      return current >= max ? 0 : current + 1;
    } else {
      const currentPageY = (keyY - 1) % yCount + 1;
      if (currentPageY >= yCount) return 0;
      const current = key.mergeDown || 0;
      const max = yCount - currentPageY;
      return current >= max ? 0 : current + 1;
    }
  }

  /**
   * 找出是哪個「主按鈕」覆蓋了目標座標 (targetX, targetY)
   */
  public findMasterKey(targetX: number, targetY: number, pageKeys: KeyItem[]): KeyItem | undefined {
    return pageKeys.find(k => {
      // 只有「沒被別人隱藏」的按鈕才能當 Master
      if (this.calculateIsHidden(k, pageKeys)) return false;

      const mRight = k.mergeRight || 0;
      const mDown = k.mergeDown || 0;

      // 判定目標點是否在該按鈕的矩形範圍內
      return (
        targetX >= k.x && targetX <= k.x + mRight &&
        targetY >= k.y && targetY <= k.y + mDown
      );
    });
  }

  /**
 * 重新計算所有頁面的按鍵座標與 code (當有頁面被刪除、遞補時調用)
 * @param pages 當前剩餘的所有頁面矩陣
 * @param xCount 每頁橫向數量 (8)
 * @param yCount 每頁縱向數量 (5)
 */
  public reindexPages(pages: KeyItem[][], xCount: number, yCount: number): void {
    pages.forEach((page, pageIndex) => {
      const offsetY = pageIndex * yCount;

      page.forEach(key => {
        // 1. 根據原本在該頁的相對位置，推算出新的絕對 y 軸
        // 舊的 y 軸扣除舊的分頁 offset 得到相對 y (1~5)，再加上新分頁的 offset
        const relativeY = ((key.y - 1) % yCount) + 1;
        const newY = relativeY + offsetY;

        // 2. 重新產生 4 碼的絕對 ScanCode (例如: 0106)
        const newCode = `${key.x.toString().padStart(2, '0')}${newY.toString().padStart(2, '0')}`;

        // 3. 賦值更新
        key.y = newY;
        key.code = newCode;
        key.KB_ScanCode = newCode; // 同步更新後端對應欄位
      });
    });
  }
}
