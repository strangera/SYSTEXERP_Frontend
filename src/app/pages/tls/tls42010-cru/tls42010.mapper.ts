import { Validators } from '@angular/forms';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { ColorUtil } from './color-util';

export interface KeyItem {
  code: string;
  x: number;
  y: number;
  ID?: number;
  MID?: number;
  KB_ScanCode?: string;
  KB_Func?: string;
  KB_Switch?: string;
  KB_Display1?: string;
  KB_Display2?: string;
  KB_Color?: string;
  KB_Style?: string;
  KB_Font?: string;
  KB_Size?: number;
  KB_Fonttyped?: string;
  KB_FontColor?: string;
  KB_Arg1?: string;
  KB_Arg2?: string;
  KB_Arg3?: string;
  type?: string;
  mergeRight?: number;
  mergeDown?: number;
  KB_Merge?: string;
  __isCopied?: boolean;
  isHidden?: boolean;
  gridStyle?: any;
  buttonStyle?: any;
}

export class Tls42010Mapper {

  /**
   * 右側設定表單的初始預設值與驗證規則定義
   */
  static readonly KEY_FORM_CONFIG = {
    KB_ScanCode: [''],
    KB_Func: [''],
    KB_Switch: ['Y'],
    KB_Display1: ['', [Validators.maxLength(5)]],
    KB_Display2: ['', [Validators.maxLength(5)]],
    KB_Color: ['RGB:255,255,255'],
    color: [null],
    KB_Style: ['1'],
    KB_Font: ['Microsoft JhengHei'],
    KB_Size: [12],
    KB_FontColor: ['RGB:0,0,0'],
    FontColor: [null],
    KB_Fonttyped: ['NNN'],
    KB_Arg1: [''],
    KB_Arg2: [''],
    KB_Arg3: [''],
    KB_Merge: [''],
    KB_MergeType: [[]]
  };

  /**
   * 從後端還原：此時 KB_Merge 是 ScanCode (例如 0101)
   * 這裡只負責還原基本屬性，mergeRight/Down 的計算留給 applyDetail 統籌處理
   */
  static fromBackend(d: any, mid: number): Partial<KeyItem> {
    const normalizeColor = (color: string, defaultColor: string) => {
      if (typeof color === 'string' && color.startsWith('$')) {
        return ColorUtil.delphiToRgb(color) || defaultColor;
      }
      return color || defaultColor;
    };

    return {
      ID: d.ID && Number(d.ID) > 0 ? Number(d.ID) : undefined,
      MID: mid,
      KB_ScanCode: d.KB_ScanCode,
      KB_Func: d.KB_Func || '',
      KB_Switch: d.KB_Switch || 'Y',
      KB_Display1: d.KB_Display1 || '',
      KB_Display2: d.KB_Display2 || '',
      KB_Color: normalizeColor(d.KB_Color, 'RGB:255,255,255'),
      KB_FontColor: normalizeColor(d.KB_FontColor, 'RGB:0,0,0'),
      KB_Style: d.KB_Style || '1',
      KB_Font: d.KB_Font || 'Microsoft JhengHei',
      KB_Size: d.KB_Size || 12,
      KB_Fonttyped: d.KB_Fonttyped || 'NNN',
      KB_Arg1: d.KB_Arg1 || '',
      KB_Arg2: d.KB_Arg2 || '',
      KB_Arg3: d.KB_Arg3 || '',
      KB_Merge: d.KB_Merge // 這裡存的是 Master 的 ScanCode
    };
  }

  /**
   * 將前端按鍵資料物件轉換為後端 API 需要的格式
   */
  static toBackend(k: KeyItem, pageNo: number, frm: any, crudStatus: CRUDStatus, rowData: any, posInfo: any, pageKeys: KeyItem[]): any {
    const hasConfig = this.checkIsConfigured(k);
    const master = this.findMasterInPage(k, pageKeys);
    const kbMergeValue = master ? master.code : k.code;
    return {
      ID: crudStatus === CRUDStatus.Create ? 0 : (Number(k.ID) || 0),
      MID: rowData?.ID ?? 0,
      ECR_KBType: frm.ECR_KBType,
      USR_Level: crudStatus === CRUDStatus.Create ? frm.USR_Level : (rowData?.USR_Level || frm.USR_Level),
      KB_ScanCode: k.code,
      KB_Func: hasConfig ? k.KB_Func || '' : '',
      KB_Arg1: hasConfig ? k.KB_Arg1 || '' : '',
      KB_Arg2: hasConfig ? k.KB_Arg2 || '' : '',
      KB_Arg3: hasConfig ? k.KB_Arg3 || '' : '',
      KB_Display1: hasConfig ? k.KB_Display1 || '' : '',
      KB_Display2: hasConfig ? k.KB_Display2 || '' : '',
      KB_Font: hasConfig ? k.KB_Font || 'Microsoft JhengHei' : 'Microsoft JhengHei',
      KB_Size: hasConfig ? k.KB_Size ?? 12 : 12,
      KB_Fonttyped: hasConfig ? k.KB_Fonttyped || 'NNN' : 'NNN',
      KB_Style: hasConfig ? k.KB_Style || '1' : '1',
      KB_Switch: hasConfig ? k.KB_Switch || 'Y' : 'Y',
      KB_Width: posInfo.width,   // 寬高建議傳原始尺寸，由後端根據 Merge 判定顯示
      KB_Height: posInfo.height,
      KB_Merge: kbMergeValue,    // <--- 填入 Master 的 ScanCode
      KB_KeyPage: pageNo,
      KB_Color: hasConfig ? k.KB_Color || 'RGB:255,255,255' : 'RGB:255,255,255',
      KB_FontColor: hasConfig ? k.KB_FontColor || 'RGB:0,0,0' : 'RGB:0,0,0',
    };
  }
  private static findMasterInPage(k: KeyItem, page: KeyItem[]): KeyItem | undefined {
    return page.find(m => {
      const mRight = m.mergeRight || 0;
      const mDown = m.mergeDown || 0;
      return (k.x >= m.x && k.x <= m.x + mRight && k.y >= m.y && k.y <= m.y + mDown);
    });
  }
  /**
   * 判斷該按鍵是否有被使用者調整過
   */
  private static checkIsConfigured(k: KeyItem): boolean {
    return !!(
      k.__isCopied ||
      k.KB_Func ||
      k.KB_Display1 ||
      k.KB_Display2 ||
      (k.KB_Color && k.KB_Color !== 'RGB:255,255,255') ||
      (k.KB_FontColor && k.KB_FontColor !== 'RGB:0,0,0') ||
      (k.KB_Style && k.KB_Style !== '1') ||
      (k.KB_Font && k.KB_Font !== 'Microsoft JhengHei') ||
      (k.KB_Size && k.KB_Size !== 12)
    );
  }
}
