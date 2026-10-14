import { ReportColumn } from '../table-report.model';
import { ColumnWidthInfo, TableReportWidthService } from './table-report-width.service';

interface Row {
  text: string;
}

describe('TableReportWidthService.calculateColumnWidths', () => {
  const service = new TableReportWidthService();

  function calc(texts: string[], col: Partial<ReportColumn> = {}): ColumnWidthInfo {
    const column: ReportColumn = { field: 'text', header: '欄位', ...col };
    const data: Row[] = texts.map((text) => ({ text }));
    return service.calculateColumnWidths([column], data, data.length, false, new Set())['text'];
  }

  it('純中文：每字 12px + 24px 邊距', () => {
    expect(calc(['中文字元五'])).toEqual({ px: '84px', truncated: false });
  });

  it('純數字：每字 7px + 24px 邊距', () => {
    expect(calc(['1234567890'])).toEqual({ px: '94px', truncated: false });
  });

  it('中英混合：中文 12px、其他 7px', () => {
    expect(calc(['ABC中文'])).toEqual({ px: '69px', truncated: false });
  });

  it('取已載入資料中最長的一筆', () => {
    expect(calc(['短', '中文字元五', '12'])).toEqual({ px: '84px', truncated: false });
  });

  it('估算值低於預設最小寬度時以 55px 為準', () => {
    expect(calc(['1'])).toEqual({ px: '55px', truncated: false });
  });

  it('剛好 240px 不截斷；超過 240px 封頂並回傳截斷旗標', () => {
    expect(calc(['字'.repeat(18)])).toEqual({ px: '240px', truncated: false });
    expect(calc(['字'.repeat(20)])).toEqual({ px: '240px', truncated: true });
  });

  it('頁面 width 大於估算值時以 width 為準', () => {
    expect(calc(['中文'], { width: '120px' })).toEqual({ px: '120px', truncated: false });
  });

  it('頁面 width 大於 240px 時仍照 width 顯示', () => {
    expect(calc(['中文'], { width: '300px' })).toEqual({ px: '300px', truncated: false });
  });

  it('maxWidth 小於 240px 時以 maxWidth 為準並標示截斷', () => {
    expect(calc(['字'.repeat(20)], { maxWidth: '100px' })).toEqual({ px: '100px', truncated: true });
  });

  it('maxWidth 大於 240px 時仍封頂 240px', () => {
    expect(calc(['字'.repeat(40)], { maxWidth: '500px' })).toEqual({ px: '240px', truncated: true });
  });

  it('html 欄位以去除標籤後的純文字估算', () => {
    expect(calc(['<b>中文字元五</b>'], { type: 'html' })).toEqual({ px: '84px', truncated: false });
  });
});

describe('TableReportWidthService.mergeGrowOnly', () => {
  const service = new TableReportWidthService();

  it('載入更多後欄寬只增不減', () => {
    const merged = service.mergeGrowOnly(
      { a: { px: '120px', truncated: false }, b: { px: '90px', truncated: false } },
      { a: { px: '80px', truncated: false }, b: { px: '150px', truncated: false } }
    );
    expect(merged['a'].px).toBe('120px');
    expect(merged['b'].px).toBe('150px');
  });

  it('截斷旗標一旦成立就保留', () => {
    const merged = service.mergeGrowOnly(
      { a: { px: '240px', truncated: true } },
      { a: { px: '100px', truncated: false } }
    );
    expect(merged['a']).toEqual({ px: '240px', truncated: true });
  });

  it('新資料沒有的欄位保留原寬度、新欄位直接加入', () => {
    const merged = service.mergeGrowOnly(
      { a: { px: '120px', truncated: false } },
      { c: { px: '70px', truncated: false } }
    );
    expect(merged['a'].px).toBe('120px');
    expect(merged['c'].px).toBe('70px');
  });
});
