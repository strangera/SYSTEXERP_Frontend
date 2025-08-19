---------------------------------------------------------------即時業績
/*即時專櫃統計檔*/
drop table POS6010;
create table POS6010
(
     id                  numeric(19,0)        identity(1,1) not null,
     MID                 numeric(19,0)        DEFAULT 0 not null, /*商戶編號*/
     SYS_StoreNo         varchar(10)          not null ,     /*分店編號*/
     TXN_Date            datetime             not null ,     /*交易日期*/
     talent_id           numeric(19,0)        not null,      /*合約編號系統 id*/
     TLT_No              varchar(12)          not null ,     /*專櫃編號*/
     AVN_TotSaleAmt      numeric(14, 2)           null ,     /*銷售金額 一般銷售金額+預售銷售金額*/
     AVN_TotSaleNet      numeric(14, 2)           null ,     /*未稅銷售金額 一般未稅銷售額+預售未稅銷售額*/
     AVN_TotSaleQty      numeric(8)               null ,     /*銷售數量*/
     AVN_TotCustCnt      numeric(8)               null ,     /*來客數 一般銷售來客數+預售銷售來客數*/
     AVN_PreOrderAmt     numeric (14, 2)          null ,     /*預售銷售金額*/
     AVN_PreOrderNet     numeric (14, 2)          null ,     /*預售未稅銷售金額*/
     AVN_PreOrderCustCnt numeric(8)               null ,     /*預售來客數*/
     AVN_SaleAmtAmt      numeric (14, 2)          null ,     /*一般銷售金額*/
     AVN_SaleAmtNet      numeric (14, 2)          null ,     /*一般未稅銷售金額*/
     AVN_SaleCustCnt     numeric(8)               null ,     /*一般來客數*/
);

 CREATE UNIQUE INDEX IDX_POS6010_1 ON POS6010 (SYS_StoreNo, txn_date, talent_id);


/*即時時段專櫃統計檔*/
drop table POS6011;
create table POS6011
(
     id                  numeric(19,0)        identity(1,1) not null,
     MID                 numeric(19,0)        DEFAULT 0 not null, /*商戶編號*/
     SYS_StoreNo         varchar(10)          not null ,     /*分店編號*/
     TXN_Date            datetime             not null ,     /*交易日期*/
     TMS_No              varchar (2)          not null ,     /*時段*/
     talent_id           numeric(19,0)        not null,      /*合約編號系統 id*/
     TLT_No              varchar(12)          not null ,     /*專櫃編號*/
     AVN_TotSaleAmt      numeric(14, 2)           null ,     /*銷售金額 一般銷售金額+預售銷售金額*/
     AVN_TotSaleNet      numeric(14, 2)           null ,     /*未稅銷售金額 一般未稅銷售金額+預售未稅銷售金額*/
     AVN_TotSaleQty      numeric(8)               null ,     /*銷售數量*/
     AVN_TotCustCnt      numeric(8)               null ,     /*來客數 一般銷售來客數+預售銷售來客數*/
     AVN_PreOrderAmt     numeric (14, 2)          null ,     /*預售銷售金額*/
     AVN_PreOrderNet     numeric (14, 2)          null ,     /*預售未稅銷售金額*/
     AVN_PreOrderCustCnt numeric(8)               null ,     /*預售來客數*/
     AVN_SaleAmtAmt      numeric (14, 2)          null ,     /*一般銷售金額*/
     AVN_SaleAmtNet      numeric (14, 2)          null ,     /*一般未稅銷售金額*/
     AVN_SaleCustCnt     numeric(8)               null ,     /*一般來客數*/
);

 CREATE UNIQUE INDEX IDX_POS6011_1 ON POS6011 (MID, SYS_StoreNo, txn_date, TMS_No, talent_id);
