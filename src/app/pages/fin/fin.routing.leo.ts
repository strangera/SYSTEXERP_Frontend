import { Routes } from '@angular/router';

export const finRoutes: Routes = [
  // 發票基本資料維護
  { path: 'fin11020', loadComponent: () => import('./fin11020/fin11020.component').then(m => m.FIN11020Component), data: { progNo: 'FIN11020' } },
  { path: 'fin11020cru', loadComponent: () => import('./fin11020-cru/fin11020-cru.component').then(m => m.FIN11020CRUComponent), data: { progNo: 'FIN11020' } },
  // 發票基本資料維護
  { path: 'fin11030', loadComponent: () => import('./fin11030/fin11030.component').then(m => m.FIN11030Component), data: { progNo: 'FIN11030' } },
  { path: 'fin11030cru', loadComponent: () => import('./fin11030-cru/fin11030-cru.component').then(m => m.FIN11030CRUComponent), data: { progNo: 'FIN11030' } },
  // 銷項品項資料設定
  { path: 'fin11040', loadComponent: () => import('./fin11040/fin11040.component').then(m => m.FIN11040Component), data: { progNo: 'FIN11040' } },
  { path: 'fin11040cru', loadComponent: () => import('./fin11040-cru/fin11040-cru.component').then(m => m.FIN11040CRUComponent), data: { progNo: 'FIN11040' } },
  { path: 'fin11090', loadComponent: () => import('./fin11090/fin11090.component').then(m => m.FIN11090Component), data: { progNo: 'FIN11090' } },
  // 電子發票配號作業
  { path: 'fin11200', loadComponent: () => import('./fin11200/fin11200.component').then(m => m.FIN11200Component), data: { progNo: 'FIN11200' } },
  { path: 'fin11200cru', loadComponent: () => import('./fin11200-cru/fin11200-cru.component').then(m => m.FIN11200CRUComponent), data: { progNo: 'FIN11200' } },
  { path: 'fin11210cru', loadComponent: () => import('./fin11210-cru/fin11210-cru.component').then(m => m.FIN11210CRUComponent), data: { progNo: 'FIN11210' } },
  // 進項發票調整
  { path: 'fin13050', loadComponent: () => import('./fin13050/fin13050.component').then(m => m.FIN13050Component), data: { progNo: 'FIN13050' } },
  { path: 'fin13050cru', loadComponent: () => import('./fin13050-cru/fin13050-cru.component').then(m => m.FIN13050CRUComponent), data: { progNo: 'FIN13050' } },
  // 電子式發票各系統配號維護
  { path: 'fin12010', loadComponent: () => import('./fin12010/fin12010.component').then(m => m.FIN12010Component), data: { progNo: 'FIN12010' } },
  { path: 'fin12010cru', loadComponent: () => import('./fin12010-cru/fin12010-cru.component').then(m => m.FIN12010CRUComponent), data: { progNo: 'FIN12010' } },
  //非二聯式收銀機發票調整作業
  { path: 'fin13040', loadComponent: () => import('./fin13040/fin13040.component').then(m => m.FIN13040Component), data: { progNo: 'FIN13040' } },
  { path: 'fin13040cru', loadComponent: () => import('./fin13040-cru/fin13040-cru.component').then(m => m.FIN13040CRUComponent), data: { progNo: 'FIN13040' } },
  // 銷貨退回或折讓單列印
  { path: 'fin15100', loadComponent: () => import('./fin15100/fin15100.component').then(m => m.FIN15100Component), data: { progNo: 'FIN15100' } },
  // 公司銀行資料維護
  { path: 'fin21010', loadComponent: () => import('./fin21010/fin21010.component').then(m => m.FIN21010Component), data: { progNo: 'FIN21010' } },
  { path: 'fin21010cru', loadComponent: () => import('./fin21010-cru/fin21010-cru.component').then(m => m.FIN21010CRUComponent), data: { progNo: 'FIN21010' } },
  // 費率對照維護
  { path: 'fin21020', loadComponent: () => import('./fin21020/fin21020.component').then(m => m.FIN21020Component), data: { progNo: 'FIN21020' } },
  { path: 'fin21020cru', loadComponent: () => import('./fin21020-cru/fin21020-cru.component').then(m => m.FIN21020CRUComponent), data: { progNo: 'FIN21020' } },
  // 廠客資料維護
  { path: 'fin21030', loadComponent: () => import('./fin21030/fin21030.component').then(m => m.FIN21030Component), data: { progNo: 'FIN21030' } },
  { path: 'fin21030cru', loadComponent: () => import('./fin21030-cru/fin21030-cru.component').then(m => m.FIN21030CRUComponent), data: { progNo: 'FIN21030' } },
  // 應付帳款維護
  { path: 'fin24010', loadComponent: () => import('./fin24010/fin24010.component').then(m => m.FIN24010Component), data: { progNo: 'FIN24010' } },
  { path: 'fin24010cru', loadComponent: () => import('./fin24010-cru/fin24010-cru.component').then(m => m.FIN24010CRUComponent), data: { progNo: 'FIN24010' } },
  // 保留款沖款維護
  { path: 'fin24020', loadComponent: () => import('./fin24020/fin24020.component').then(m => m.FIN24020Component) },
  { path: 'fin24020cru', loadComponent: () => import('./fin24020-cru/fin24020-cru.component').then(m => m.FIN24020CRUComponent) },
  // 產生電匯付款資料
  { path: 'fin25010', loadComponent: () => import('./fin25010/fin25010.component').then(m => m.FIN25010Component), data: { progNo: 'FIN25010' } },
  { path: 'fin25010cru', loadComponent: () => import('./fin25010-cru/fin25010-cru.component').then(m => m.FIN25010CRUComponent), data: { progNo: 'FIN25010' } },
  // 保留款彙總表
  { path: 'fin29010', loadComponent: () => import('./fin29010/fin29010.component').then(m => m.FIN29010Component), data: { progNo: 'FIN29010' } },
  // 匯款明細表
  { path: 'fin29020', loadComponent: () => import('./fin29020/fin29020.component').then(m => m.FIN29020Component), data: { progNo: 'FIN29020' } },
  // AP及ARNET之報表
  { path: 'fin29040', loadComponent: () => import('./fin29040/fin29040.component').then(m => m.FIN29040Component) },
  // 廠商付款明細表
  { path: 'fin29060', loadComponent: () => import('./fin29060/fin29060.component').then(m => m.FIN29060Component), data: { progNo: 'FIN29060' } },
  { path: 'fin29060cru', loadComponent: () => import('./fin29060-cru/fin29060-cru.component').then(m => m.FIN29060CRUComponent), data: { progNo: 'FIN29060' } },
  // 應付帳款預估表
  { path: 'fin29080', loadComponent: () => import('./fin29080/fin29080.component').then(m => m.FIN29080Component), data: { progNo: 'FIN29080' } },
  // 支出憑單明細表
  { path: 'fin29100', loadComponent: () => import('./fin29100/fin29100.component').then(m => m.FIN29100Component), data: { progNo: 'FIN29100' } },
  // 應付帳款帳齡分析表
  { path: 'fin29110', loadComponent: () => import('./fin29110/fin29110.component').then(m => m.FIN29110Component), data: { progNo: 'FIN29110' } },
  // 應收帳款維護
  { path: 'fin32010', loadComponent: () => import('./fin32010/fin32010.component').then(m => m.FIN32010Component), data: { progNo: 'FIN32010' } },
  { path: 'fin32010cru', loadComponent: () => import('./fin32010-cru/fin32010-cru.component').then(m => m.FIN32010CRUComponent), data: { progNo: 'FIN32010' } },
  // 收款項目對照會計科目維護
  { path: 'fin31010', loadComponent: () => import('./fin31010/fin31010.component').then(m => m.FIN31010Component), data: { progNo: 'FIN31010' } },
  { path: 'fin31010cru', loadComponent: () => import('./fin31010-cru/fin31010-cru.component').then(m => m.FIN31010CRUComponent), data: { progNo: 'FIN31010' } },
  // 應收帳款帳齡分析表
  { path: 'fin34040', loadComponent: () => import('./fin34040/fin34040.component').then(m => m.FIN34040Component), data: { progNo: 'FIN34040' } },
  // 存入保證金維護作業
  { path: 'fin35010', loadComponent: () => import('./fin35010/fin35010.component').then(m => m.FIN35010Component), data: { progNo: 'FIN35010' } },
  { path: 'fin35010cru', loadComponent: () => import('./fin35010-cru/fin35010-cru.component').then(m => m.FIN35010CRUComponent), data: { progNo: 'FIN35010' } },
  // 資材系統
  { path: 'fin51010', loadComponent: () => import('./fin51010/fin51010.component').then(m => m.FIN51010Component), data: { progNo: 'FIN51010' } },
  { path: 'fin51010cru', loadComponent: () => import('./fin51010-cru/fin51010-cru.component').then(m => m.FIN51010CRUComponent), data: { progNo: 'FIN51010' } },
  { path: 'fin51011', loadComponent: () => import('./fin51011/fin51011.component').then(m => m.FIN51011Component), data: { progNo: 'FIN51011' } },
  // 總帳報表-傳票列印
  { path: 'fin55010', loadComponent: () => import('./fin55010/fin55010.component').then(m => m.FIN55010Component), data: { progNo: 'FIN55010' } },
  { path: 'fin55010cru', loadComponent: () => import('./fin55010-cru/fin55010-cru.component').then(m => m.FIN55010CRUComponent), data: { progNo: 'FIN55010' } },
  // 總帳報表-日記帳表
  { path: 'fin55020', loadComponent: () => import('./fin55020/fin55020.component').then(m => m.FIN55020Component), data: { progNo: 'FIN55020' } },
  // 總帳報表-分類帳
  { path: 'fin55050', loadComponent: () => import('./fin55050/fin55050.component').then(m => m.FIN55050Component), data: { progNo: 'FIN55050' } },
  { path: 'fin55050cru', loadComponent: () => import('./fin55050-cru/fin55050-cru.component').then(m => m.FIN55050CRUComponent), data: { progNo: 'FIN55050' } },
  // 總帳報表-試算表
  { path: 'fin55070', loadComponent: () => import('./fin55070/fin55070.component').then(m => m.FIN55070Component), data: { progNo: 'FIN55070' } },
  // 總帳報表-損益表
  { path: 'fin55080', loadComponent: () => import('./fin55080/fin55080.component').then(m => m.FIN55080Component), data: { progNo: 'FIN55080' } },
  // 總帳報表-當期/累計損益表
  { path: 'fin55090', loadComponent: () => import('./fin55090/fin55090.component').then(m => m.FIN55090Component), data: { progNo: 'FIN55090' } },
  // 總帳報表-損益比較表
  { path: 'fin55100', loadComponent: () => import('./fin55100/fin55100.component').then(m => m.FIN55100Component), data: { progNo: 'FIN55100' } },
  // 總帳報表-部門科目明細表
  { path: 'fin55110', loadComponent: () => import('./fin55110/fin55110.component').then(m => m.FIN55110Component), data: { progNo: 'FIN55110' } },
  // 總帳報表-資產負債表
  { path: 'fin55120', loadComponent: () => import('./fin55120/fin55120.component').then(m => m.FIN55120Component), data: { progNo: 'FIN55120' } },
  { path: 'fin55120cru', loadComponent: () => import('./fin55120/fin55120cru/fin55120cru.component').then(m => m.Fin55120cruComponent), data: { progNo: 'FIN55120' } },
  { path: 'fin55120detail', loadComponent: () => import('./fin55120/fin55120-detail/fin55120-detail.component').then(m => m.Fin55120DetailComponent), data: { progNo: 'FIN55120' } },
  // 總帳報表-資產負債比較表
  { path: 'fin55130', loadComponent: () => import('./fin55130/fin55130.component').then(m => m.FIN55130Component), data: { progNo: 'FIN55130' } },
  { path: 'fin55130cru', loadComponent: () => import('./fin55130/fin55130cru/fin55130cru.component').then(m => m.Fin55130cruComponent), data: { progNo: 'FIN55130' } },
  { path: 'fin55130detail', loadComponent: () => import('./fin55130/fin55130-detail/fin55130-detail.component').then(m => m.Fin55130DetailComponent), data: { progNo: 'FIN55130' } },
  // 業務員資料維護
  { path: 'fin61020', loadComponent: () => import('./fin61020/fin61020.component').then(m => m.FIN61020Component), data: { progNo: 'FIN61020' } },
  { path: 'fin61020cru', loadComponent: () => import('./fin61020-cru/fin61020-cru.component').then(m => m.FIN61020CRUComponent), data: { progNo: 'FIN61020' } },
  // 銀行調撥作業
  { path: 'fin62010', loadComponent: () => import('./fin62010/fin62010.component').then(m => m.FIN62010Component), data: { progNo: 'FIN62010' } },
  { path: 'fin62010cru', loadComponent: () => import('./fin62010-cru/fin62010-cru.component').then(m => m.FIN62010CRUComponent), data: { progNo: 'FIN62010' } },
  // 銀行資金調撥單
  { path: 'fin62020', loadComponent: () => import('./fin62020/fin62020.component').then(m => m.FIN62020Component), data: { progNo: 'FIN62020' } },
  // 銀行調撥傳票拋轉作業
  { path: 'fin62030', loadComponent: () => import('./fin62030/fin62030.component').then(m => m.FIN62030Component), data: { progNo: 'FIN62030' } },
  { path: 'fin62030cru', loadComponent: () => import('./fin62030-cru/fin62030-cru.component').then(m => m.FIN62030CRUComponent), data: { progNo: 'FIN62030' } },
  // 應付票據撤票作業
  { path: 'fin63050', loadComponent: () => import('./fin63050/fin63050.component').then(m => m.FIN63050Component), data: { progNo: 'FIN63050' } },
  { path: 'fin63050cru', loadComponent: () => import('./fin63050-cru/fin63050-cru.component').then(m => m.FIN63050CRUComponent), data: { progNo: 'FIN63050' } },
  // 應收票據託收作業
  { path: 'fin64020', loadComponent: () => import('./fin64020/fin64020.component').then(m => m.FIN64020Component), data: { progNo: 'FIN64020' } },
  // 應收票據兌現作業
  { path: 'fin64030', loadComponent: () => import('./fin64030/fin64030.component').then(m => m.FIN64030Component), data: { progNo: 'FIN64030' } },
  // 應收票據退票作業
  { path: 'fin64050', loadComponent: () => import('./fin64050/fin64050.component').then(m => m.FIN64050Component), data: { progNo: 'FIN64050' } },
  { path: 'fin64050cru', loadComponent: () => import('./fin64050-cru/fin64050-cru.component').then(m => m.FIN64050CRUComponent), data: { progNo: 'FIN64050' } },

  // 應付帳款明細表
  { path: 'fin29050', loadComponent: () => import('./fin29050/fin29050.component').then(m => m.FIN29050Component), data: { progNo: 'FIN29050' } },
  { path: 'fin29050cru', loadComponent: () => import('./fin29050-cru/fin29050-cru.component').then(m => m.FIN29050CRUComponent), data: { progNo: 'FIN29050' } },

];
