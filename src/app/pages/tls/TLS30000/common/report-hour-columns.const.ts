import { formatAmount } from '@others/component/table/table.model';
import { ReportColumn } from '@pages/tls/tls2f010-cru/tls2f010-table-report.model';

/**
 * 「各時段之XX營業報表」家族（目前為 tls31080、tls31090）共用的 00~23 時段欄位定義。
 * 抽出原因：兩支作業的主查詢頁與各自 CRU 明細 Dialog（共 4 處）原本各自宣告一份逐字相同的陣列，
 * 修改任一時段欄位屬性（例如 format/align）都要同步改 4 個地方，容易漏改。
 *
 * 使用方式：於 buildColumns() 內對這份陣列做 .filter() 篩選 TimeMode='T' 的時段區間，
 * 不要直接 mutate 這個陣列本身（是 shared 常數，多個元件共用同一份參考）。
 */
export const ALL_HOUR_COLUMNS: ReportColumn[] = [
  { field: 'H00', header: '00時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H01', header: '01時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H02', header: '02時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H03', header: '03時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H04', header: '04時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H05', header: '05時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H06', header: '06時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H07', header: '07時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H08', header: '08時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H09', header: '09時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H10', header: '10時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H11', header: '11時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H12', header: '12時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H13', header: '13時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H14', header: '14時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H15', header: '15時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H16', header: '16時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H17', header: '17時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H18', header: '18時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H19', header: '19時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H20', header: '20時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H21', header: '21時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H22', header: '22時段', visible: true, format: formatAmount, align: 'right' },
  { field: 'H23', header: '23時段', visible: true, format: formatAmount, align: 'right' },
];

/**
 * 依 TimeMode/TimeFromHH/TimeToHH 篩選出要顯示的時段欄位。
 * TimeMode !== 'T' 或起訖小時任一為 null 時視為「全時段顯示」，回傳全部 24 欄。
 * 支援跨夜區間（例如 22~02 時）：TimeFromHH > TimeToHH 時用 OR 判斷而非 AND。
 */
export function filterHourColumns(
  timeMode: string | null | undefined,
  timeFromHH: number | null | undefined,
  timeToHH: number | null | undefined,
): ReportColumn[] {
  return ALL_HOUR_COLUMNS.filter(col => {
    if (timeMode !== 'T' || timeFromHH === null || timeFromHH === undefined || timeToHH === null || timeToHH === undefined) {
      return true;
    }
    const hourNum = Number.parseInt(col.field.substring(1), 10);
    return timeFromHH <= timeToHH
      ? hourNum >= timeFromHH && hourNum <= timeToHH
      : hourNum >= timeFromHH || hourNum <= timeToHH;
  });
}
