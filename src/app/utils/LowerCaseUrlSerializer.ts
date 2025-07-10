import { UrlTree, DefaultUrlSerializer } from '@angular/router';

/**
 * 自定義 UrlSerializer，用於將路由路徑轉換為小寫，實現大小寫不敏感的路由匹配。
 */
export class LowerCaseUrlSerializer extends DefaultUrlSerializer {
  /**
   * 將 UrlTree 序列化為 URL 字串。
   * 在此方法中，我們會將每個路徑段 (path segment) 轉換為小寫。
   * @param tree 要序列化的 UrlTree。
   * @returns 序列化後的小寫 URL 字串。
   */
  override serialize(tree: UrlTree): string {
    // 遍歷 UrlTree 中的每個路徑段，並將其路徑轉換為小寫。
    // 這樣，無論路由定義是大寫還是小寫，都會被匹配到。
    const path = super.serialize(tree);
    return path.toLowerCase();
  }

  /**
   * 將 URL 字串解析為 UrlTree。
   * 此方法通常不需要修改，因為我們主要是在序列化時進行小寫轉換。
   * @param url 要解析的 URL 字串。
   * @returns 解析後的 UrlTree。
   */
  override parse(url: string): UrlTree {
    return super.parse(url.toLowerCase());
  }
}

