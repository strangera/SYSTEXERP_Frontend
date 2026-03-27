export class ColorUtil {
  /** * 將 'RGB:r,g,b' 字串解析為 PrimeNG ColorPicker 用的物件格式 { r, g, b }
     * 若格式不正確則回傳 null
     */
  static parseRgbToObj(rgbStr: string | undefined | null): { r: number, g: number, b: number } | null {
    if (!rgbStr || typeof rgbStr !== 'string' || !rgbStr.startsWith('RGB:')) {
      return null;
    }

    try {
      const parts = rgbStr.replace('RGB:', '').split(',').map(Number);
      if (parts.length === 3 && parts.every(n => !isNaN(n))) {
        return { r: parts[0], g: parts[1], b: parts[2] };
      }
    } catch (e) {
      console.error('ColorUtil parse error:', e);
    }
    return null;
  }

  /** Delphi TColor → RGB:r,g,b */
  static delphiToRgb(tcolor: string): string {
    if (!tcolor) return 'RGB:0,0,0';
    if (tcolor.startsWith('RGB:')) return tcolor;
    const name = (tcolor || '').toString().trim().toLowerCase();
    const nameMap: Record<string, string> = {
      'clblack': 'RGB:0,0,0',
      'clmaroon': 'RGB:128,0,0',
      'clgreen': 'RGB:0,128,0',
      'clolive': 'RGB:128,128,0',
      'clnavy': 'RGB:0,0,128',
      'clpurple': 'RGB:128,0,128',
      'clteal': 'RGB:0,128,128',
      'clgray': 'RGB:128,128,128',
      'clsilver': 'RGB:192,192,192',
      'clred': 'RGB:255,0,0',
      'cllime': 'RGB:0,255,0',
      'clyellow': 'RGB:255,255,0',
      'clblue': 'RGB:0,0,255',
      'clfuchsia': 'RGB:255,0,255',
      'claqua': 'RGB:0,255,255',
      'clltgray': 'RGB:192,192,192',
      'cldkgray': 'RGB:128,128,128',
      'clwhite': 'RGB:255,255,255',
      'clmoneygreen': 'RGB:192,220,192',
      'clskyblue': 'RGB:166,202,240',
      'clcream': 'RGB:255,251,240',
      'clmedgray': 'RGB:160,160,164',
      'clbtnface': 'RGB:240,240,240',
      'clwindowtext': 'RGB:0,0,0',
      'clnone': '',
      'cldefault': ''
    };
    if (nameMap[name] !== undefined) return nameMap[name];
    // 移除 $ 符號與非十六進位字元
    let hex = tcolor.replace(/\$/g, '').trim();
    hex = hex.replace(/[^0-9A-Fa-f]/g, '');
    // 若為 8 位元（常見系統色或特殊值），檢查特殊碼
    if (hex.length === 8) {
      const up = hex.toUpperCase();
      // clNone / clDefault：無法直接對應顯示色（系統或無色），回傳空字串以讓 UI 使用預設
      if (up === '1FFFFFFF' || up === '20000000') return '';
      // 若高位元非 00（代表系統色參考），嘗試匹配常見系統色的 hex
      const high = parseInt(up.substring(0, 2), 16);
      if (high !== 0) {
        // 若為系統色（高位元非 00），嘗試以尾 6 碼匹配常見顏色
        const tail6 = up.slice(-6);
        const sysMap: Record<string, string> = {
          'F0F0F0': 'RGB:240,240,240', // btnface-like
          '000000': 'RGB:0,0,0', // black/window text
        };
        if (sysMap[tail6]) return sysMap[tail6];
        return '';
      }
    }
    // 取最後 6 個字元當作 BGR，若不足則左側補 0
    if (hex.length < 6) hex = hex.padStart(6, '0');
    if (hex.length > 6) hex = hex.slice(-6);
    const b = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const r = parseInt(hex.substring(4, 6), 16) || 0;
    return `RGB:${r},${g},${b}`;
  }

  /** RGB:r,g,b → rgb(r,g,b) */
  static rgbToCss(rgbString: string): string {
    if (!rgbString || !rgbString.startsWith('RGB:')) return '';
    return `rgb(${rgbString.replace('RGB:', '')})`;
  }
}
