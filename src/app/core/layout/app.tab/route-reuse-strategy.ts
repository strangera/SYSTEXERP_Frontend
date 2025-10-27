// src/app/route-reuse-strategy.ts (修改)

import {
  RouteReuseStrategy,
  ActivatedRouteSnapshot,
  DetachedRouteHandle
} from '@angular/router';
import { getProgNoFromPath } from './route-reuse-strategy-helper'; // 👈 引入輔助函數

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private handlers: Record<string, DetachedRouteHandle> = {};

  // 1. 決定是否可以重用路由 (確保同一個 progNo 視為同一個元件)
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    const futureProgNo = getProgNoFromPath(future);
    const currentProgNo = getProgNoFromPath(curr);

    // 如果同屬一個 progNo (例如 sys0110 和 sys0110cru)，則視為可重用
    if (futureProgNo && currentProgNo && futureProgNo === currentProgNo) {
      return true;
    }

    // 預設行為：如果路由路徑相同，則重用
    return future.routeConfig === curr.routeConfig;
  }

  // 2. 決定是否應該分離（快取）當前路由
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // 只有那些我們能解析出 ProgNo 的程式碼才應該被快取
    return !!getProgNoFromPath(route);
  }

  // 3. 分離元件並儲存到快取
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    const progNo = getProgNoFromPath(route);
    if (progNo && handle) {
      this.handlers[progNo] = handle;
    }
  }

  // 4. 決定是否應該重用路由（從快取中取出）
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const progNo = getProgNoFromPath(route);
    // 如果快取中有該 progNo 的實例，則取出快取
    return !!progNo && !!this.handlers[progNo];
  }

  // 5. 從快取中取出儲存的元件
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const progNo = getProgNoFromPath(route);
    return progNo ? this.handlers[progNo] || null : null;
  }

  // (新增) 刪除快取的方法 (供 TabService 呼叫)
  public deleteRouteSnapshot(progNo: string): void {
    delete this.handlers[progNo.toUpperCase()]; // 確保大小寫匹配
  }
}
