// src/app/route-reuse-strategy-helper.ts (新增檔案)
import { ActivatedRouteSnapshot } from '@angular/router';

// 假設您的路由結構是 /account/{module}/{progNo} 或 /account/{module}/{progNo}{suffix}
// 例如：/account/sys/sys0110 或 /account/sys/sys0110cru
export function getProgNoFromPath(route: ActivatedRouteSnapshot): string | null {
  // 從根節點到當前節點的路徑段
  const segments = route.pathFromRoot.flatMap(r => r.url.map(segment => segment.path));

  // 找到最後一個路徑段 (例如 'sys0110' 或 'sys0110cru')
  const lastSegment = segments.pop();

  if (lastSegment) {
    // 假設您的程式代碼都是大寫且以三個字母模組開頭 (例如 SYS, FIN, TLS)
    const match = lastSegment.match(/([A-Z]{3}\d{4})/i);
    if (match) {
      // 提取主要程式代碼部分 (例如從 'sys0110cru' 提取 'sys0110')
      return match[1].toUpperCase();
    }
    // 特殊處理：如果您確定所有主要作業的路由都是 7 個字元 (例如 'SYS0110')
    if (lastSegment.length >= 7) {
      return lastSegment.substring(0, 7).toUpperCase();
    }
  }

  // 預設情況，例如 Dashboard
  return null;
}
