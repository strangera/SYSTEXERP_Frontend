//TODO: API名稱(未來希望可以都由個別作業定義傳入) -> 報表標題
// 1. 優先使用傳入的 API（context.reportTitle）
// 2. 若無，則使用REPORT_TITLES[fallbackTitleKey] 作為 API 名稱
// 3. 若 REPORT_TITLES 中也沒有對應的 API 名稱，則使用 funInfo?.prog_name 作為 API 名稱
export const REPORT_TITLES: Record<string, string> = {
  queryTLS13030: '專櫃契約代扣款報表',
  queryTLS13040: '專櫃契約抽成報表',
  queryTLS23010: '型態別報表',
  queryTLS23020: '折扣別報表',
  queryTLS23030: '付款別報表',
  queryTLS23040: '發票報表',
  queryTLS23050: '收銀機日報表',
  queryTLS23060: '收銀機區間報表',
  queryTLS23070: '專櫃收銀機月報表',
  queryTLS23080: '支付工具實收報表',
  queryTLS23090: '信用卡明細表',
  queryTLS2310: '付款別明細表',
  queryTLS23110: '折扣別月報表',
  queryTLS23120: '專櫃日對帳單',
  queryTLS23130: '信用卡銷貨月報表',
  queryTLS32070: '抽成類別分析報表',
  queryTLS32080: '抽成類別條件分析報表',

  queryForExportFIN24020: '保留款沖款明細',
  queryFIN25010: '電匯付款資料',
  query_addFIN25010: '電匯付款明細',
  query_detailFIN25010: '電匯付款明細',
  queryFIN52090: '會計科目摘要明細表',
  queryFIN52050: '科目大分類代號表',
  queryFIN52060: '科目中分類代號表',
  queryFIN52070: '科目三碼代號表',
  queryFIN52080: '會計科目代號表',

  queryFIN31020: '應收調整科目明細',

  queryFIN73030: '支付申請單',

  querySYS0710: 'UserBehavior 使用者權限列表',
  querySYS0730: 'tblRoleBehavior角色系統權限列表',
  querySYS0740: 'tblRoleBehavior角色系統權限列表',
  querySYS0750: 'tblUserRole使用者角色列表',
  querySYS0770AllUsers: 'tblUserRole使用者角色列表',
  querySYS0770UserRoles: 'tblUserRole使用者角色列表',
};
