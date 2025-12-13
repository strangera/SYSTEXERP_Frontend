import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, PermissionGuardService } from '@shared/service/permission-guard.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true // 假設使用 Angular 15+ 且為 Standalone Component/Directive
})
export class HasPermissionDirective implements OnInit {
  private readonly permissionGuard = inject(PermissionGuardService);
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  // 用來儲存當前程式代碼，預設從路由 URL 取得
  private currentProgNo: string | undefined;

  /**
   * 輸入參數：需要的權限行為代碼 (例如：Actions.Create 或 '20')
   * 允許輸入單一代碼 (string | Actions) 或多個代碼陣列 (Array<string | Actions>)
   */
  @Input('appHasPermission') actionCode!: string | Actions | (string | Actions)[];

  // 接收可選的程式代碼，如果不傳入則從當前路由自動獲取
  @Input('appHasPermissionProgNo') progNo?: string;

  /**
   * 當指令的輸入屬性發生變化時執行
   * @param actionCode
   */
  ngOnInit() {
    // 1. 取得程式代碼 (ProgNo)
    this.currentProgNo = this.progNo || this.getProgNoFromRouteData() || this.getProgNoFromUrl();
    if (!this.currentProgNo) {
      console.warn('HasPermissionDirective: 無法確定程式代碼 (ProgNo)。');
      this.viewContainer.clear(); // 無法確定頁面，預設隱藏
      return;
    }

    // 2. 處理單一或多個權限代碼
    const requiredActions: (string | Actions)[] = Array.isArray(this.actionCode)
      ? this.actionCode
      : [this.actionCode];

    // 3. 檢查權限：只要其中一個權限通過即可顯示 (使用 OR 邏輯)
    const hasAnyPermission = requiredActions.some(action =>
      this.permissionGuard.hasPermission(this.currentProgNo!, action)
    );

    // 4. 根據結果渲染或清除元素
    if (hasAnyPermission) {
      // 擁有權限：渲染元素 (將 TemplateRef 插入 ViewContainer)
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      // 沒有權限：清除元素 (從 DOM 中移除)
      this.viewContainer.clear();
    }
  }
  /**
       * **新增：從路由的 data 屬性中提取程式代碼 (ProgNo)**
       */
  private getProgNoFromRouteData(): string | undefined {
    // 使用路由快照來獲取靜態配置的 data
    let route = this.activatedRoute.snapshot;
    // 向上查找父路由直到找到 progNo
    while (route) {
      if (route.data && route.data['progNo']) {
        return String(route.data['progNo']).toUpperCase();
      }
      route = route.firstChild!;
    }
    return undefined;
  }
  /**
   * 嘗試從當前路由 URL 中提取程式代碼 (ProgNo)
   * 假設您的路由結構包含 ProgNo，例如：/system/TLS14020
   * 這裡只是一個簡單範例，可能需要根據您的實際路由結構進行調整
   */
  private getProgNoFromUrl(): string | undefined {
    const url = this.router.url.toUpperCase();
    // 假設 ProgNo 總是出現在 URL 的倒數第二個片段，且符合 'XXX00000' 格式
    const parts = url.split('/').filter(p => p);
    if (parts.length > 0) {
      // 簡單地假設最後一個片段可能是 ProgNo (例如 /main/TLS14020)
      const lastPart = parts[parts.length - 1];
      // 您可以加入更嚴格的 ProgNo 格式檢查
      return lastPart.match(/[A-Z]{3}\d{5}/) ? lastPart : undefined;
    }
    return undefined;
  }
}
