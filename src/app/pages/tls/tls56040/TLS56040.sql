/*POS2021 倉別調撥主檔*/
DROP TABLE POS2021;
create table POS2021
(
    id                   NUMERIC(19,0) IDENTITY(1,1) NOT NULL,
    MID                  numeric(19,0)        DEFAULT 0 not null, /*商戶編號*/
    MVM_No               nvarchar(16)         not null,      /*調撥編號:WHYYYYMMDDSSSS*/
    SYS_StoreNo          VARCHAR(10)          not null,      /*公司編號/店號*/
    OUT_HOS_No           VARCHAR (10)         not null ,     /*調出倉庫代碼*/
    IN_HOS_No            VARCHAR (10)         not null ,     /*調入倉庫代碼*/
    MVM_Status           char(1)              not null,      /*調撥狀態:1=已申請 2=已審核 3=已發貨 4=已收貨驗收 9=已作廢*/
    LOGO_No              VARCHAR (4)              null ,     /*品牌代碼*/
    org_id               VARCHAR (20)             null ,     /*組織代碼/所屬部門*/

    APPLY_TotQty         NUMERIC(10, 2)            null,      /*調撥申請數量合計*/
    APPLY_TotBuyNet      NUMERIC(14, 4)            null,      /*調撥申請未稅進價小計*/
    APPLY_TotBuyTax      NUMERIC(14, 4)            null,      /*調撥申請進價稅額小計*/
    APPLY_TotBuyAmt      NUMERIC(14, 4)            null,      /*調撥申請進價合計*/
    APPLY_TotSaleAmt     NUMERIC(14, 4)            null,      /*調撥申請售價合計*/

    OUTGODS_TotQty       NUMERIC(10, 2)            null,      /*調撥發貨數量合計*/
    OUTGODS_TotBuyNet    NUMERIC(14, 4)            null,      /*調撥發貨未稅進價小計*/
    OUTGODS_TotBuyTax    NUMERIC(14, 4)            null,      /*調撥發貨進價稅額小計*/
    OUTGODS_TotBuyAmt    NUMERIC(14, 4)            null,      /*調撥發貨進價合計*/
    OUTGODS_TotSaleAmt   NUMERIC(14, 4)            null,      /*調撥發貨售價合計*/

    Confirm_TotQty       NUMERIC(10, 2)            null,      /*調撥驗收數量合計*/
    Confirm_TotBuyNet    NUMERIC(14, 4)            null,      /*調撥驗收未稅進價小計*/  -->確認 成本用進價未稅算
    Confirm_TotBuyTax    NUMERIC(14, 4)            null,      /*調撥驗收進價稅額小計*/
    Confirm_TotBuyAmt    NUMERIC(14, 4)            null,      /*調撥驗收進價合計*/
    Confirm_TotSaleAmt   NUMERIC(14, 4)            null,      /*調撥驗收售價合計*/

    APPLY_Date           date                     null,       /*申請日期*/
    APPLY_USR_No         VARCHAR(16)              NULL,       /*申請人員*/
    APPLY_USR_Name       NVARCHAR(20)             NULL,       /*申請人員姓名*/
    APRV_Date            DATE                     NULL,       /*審核日期*/
    APRV_USR_No          VARCHAR(16)              NULL,       /*審核人員*/
    APRV_USR_Name        NVARCHAR(20)             NULL,       /*審核人員姓名*/
    ReAPRV_Date          DATE                     NULL,       /*反審核日期*/
    ReAPRV_USR_No        VARCHAR(16)              NULL,       /*反審核人員*/
    ReAPRV_USR_Name      NVARCHAR(20)             NULL,       /*反審核人員姓名*/
    Void_Date            DATE                     NULL,       /*作廢日期*/
    Void_USR_No          VARCHAR(16)              NULL,       /*作廢人員*/
    Void_USR_Name        NVARCHAR(20)             NULL,       /*作廢人員姓名*/

    OUTGODS_DATE	     date                     null,	     /*發貨日期*/
    OUTGODS_USR_No       VARCHAR(16)              NULL,      /*發貨人員*/
    OUTGODS_USR_Name     NVARCHAR(20)             NULL,      /*發貨人員姓名*/

    Confirm_DATE	     date                     null,	     /*驗收日期*/
    Confirm_USR_No       VARCHAR(16)              NULL,      /*驗收人員*/
    Confirm_USR_Name     NVARCHAR(20)             NULL,      /*驗收人員姓名*/
    MVM_Remark           NVARCHAR(200)            null,      /*備註*/

    CRT_Date               datetime                null ,     /*建立日期*/
    CRT_USR_No             VARCHAR (16)            null ,     /*建立人員*/
    CRT_USR_Name           NVARCHAR (20)           null ,     /*建立人員姓名*/
    UPD_Date               datetime                null ,     /*變更日期*/
    UPD_USR_No             VARCHAR (16)            null ,     /*變更人員*/
    UPD_USR_Name           NVARCHAR (20)           null ,     /*變更人員姓名*/

     constraint pk_POS2021 primary key clustered (id)
);
IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS2021_1')
  CREATE UNIQUE INDEX IDX_POS2021_1 ON POS2021 (MID, MVM_No, SYS_StoreNo);


/*POS2022 倉別調撥明細檔*/
create table POS2022
(
    id                  NUMERIC(19,0) IDENTITY(1,1) NOT NULL,
    MID                 numeric(19,0)        DEFAULT 0 not null, /*商戶編號*/
    MVM_No              nvarchar(16)         not null,      /*調撥編號:WHYYYYMMDDSSSS*/
    SYS_StoreNo         VARCHAR(10)          not null,      /*公司編號/店號*/
    MVD_SeqNo           numeric(4)           not null,      /*項次*/
    PLU_MagNo           varchar (20)         not null ,     /*商品管理編號*/
    PLU_No              varchar (20)             null ,     /*國際條碼*/
    PLU_Unit            varchar(2)               null,      /*單位代碼*/
    PLU_BoxQty          numeric(4)               null,      /*裝箱入數*/
    PLU_Name            nvarchar(60)             null,      /*商品名稱*/
    PLU_StockTaxType    char(1)              not null,      /*進價稅別:0免稅,1應稅*/
    PLU_TaxType         char(1)              not null,      /*售價稅別:0免稅,1應稅*/
    MVD_BuyPrc          numeric(14, 4)       not null,      /*進單價*/
    MVD_SalePrc         numeric(14, 4)       not null,      /*售單價*/
    APPLY_Qty           numeric(10, 2)           null,      /*調撥申請數量*/
    OUTGODS_QTY         numeric(10, 2)           null,      /*調撥發貨數量*/
    Confirm_QTY         numeric(10, 2)           null,      /*調撥驗收數量*/

    APPLY_BuyNet        numeric(14, 4)           null,      /*調撥申請進價未稅小計 進單價*調撥申請數量 */
    APPLY_BuyTax        numeric(14, 4)           null,      /*調撥申請進價稅額*/
    APPLY_BuyAmt        numeric(14, 4)           null,      /*調撥申請進價合計 APPLY_BuyNet+APPLY_BuyTax*/
	APPLY_SaleAmt       numeric(14, 4)           null,      /*調撥申請售價小計 售單價*調撥申請數量*/
    OUTGODS_BuyNet      numeric(14, 4)           null,      /*調撥發貨進價未稅小計 進單價*調撥發貨數量 */
    OUTGODS_BuyTax      numeric(14, 4)           null,      /*調撥發貨進價稅額*/
    OUTGODS_BuyAmt      numeric(14, 4)           null,      /*調撥發貨進價合計 OUTGODS_BuyNet+OUTGODS_BuyTax*/
    OUTGODS_SaleAmt     numeric(14, 4)           null,      /*調撥發貨售價小計 售單價*調撥發貨數量*/
    Confirm_BuyNet      numeric(14, 4)           null,      /*調撥驗收進價未稅小計 進單價*調撥驗收數量 */
    Confirm_BuyTax      numeric(14, 4)           null,      /*調撥驗收進價稅額*/
    Confirm_BuyAmt      numeric(14, 4)           null,      /*調撥驗收進價合計 Confirm_BuyNet+Confirm_BuyTax*/
    Confirm_SaleAmt     numeric(14, 4)           null,      /*調撥驗收售價小計 售單價*調撥驗收數量*/
    MVD_Remark          nvarchar(200)            null,      /*備註*/

    CRT_Date             datetime                null ,     /*建立日期*/
    CRT_USR_No           varchar (16)            null ,     /*建立人員*/
    CRT_USR_Name         nvarchar (20)           null ,     /*建立人員姓名*/
    UPD_Date             datetime                null ,     /*變更日期*/
    UPD_USR_No           varchar (16)            null ,     /*變更人員*/
    UPD_USR_Name         nvarchar (20)           null ,     /*變更人員姓名*/

     constraint pk_POS2022 primary key clustered (id)
);

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS2022_1')
  CREATE UNIQUE INDEX IDX_POS2022_1 ON POS2022 (MID, MVM_No, SYS_StoreNo, MVD_SeqNo);
/*PLULOGO  商品品牌設定檔*/
create table PLULOGO
(
     id                  numeric(19,0)        identity(1,1) not null,
     MID                 numeric(19,0)        DEFAULT 0 not null, /*商戶編號*/
     LOGO_No             varchar (4)          not null ,     /*品牌代碼*/
     LOGO_CH_NAME        nvarchar (50)        not null ,     /*品牌中文名稱*/
     LOGO_EN_NAME        nvarchar (100)           null ,     /*品牌英文名稱*/
     LOGO_Remark         nvarchar (100)           null ,     /*備註說明*/
     PLU_OrderPrcRate    NUMERIC(14,4)            null ,     /*標準進貨折數 預設100*/
     HOS_No              varchar (10)             null ,     /*倉別代碼(建議倉別)*/
     VEN_No              varchar (16)             null ,     /*廠商編號 保留目前不使用*/
	 CRT_Date            datetime                 null ,     /*建立日期*/
     CRT_USR_No          varchar (16)             null ,     /*建立人員*/
     CRT_USR_Name        nvarchar (20)            null ,     /*建立人員姓名*/
     UPD_Date            datetime                 null ,     /*變更日期*/
     UPD_USR_No          varchar (16)             null ,     /*變更人員*/
     UPD_USR_Name        nvarchar (20)            null ,     /*變更人員姓名*/

     constraint pk_PLULOGO primary key clustered (id)
);

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_PLULOGO_1')
  CREATE UNIQUE INDEX IDX_PLULOGO_1 ON PLULOGO (MID, LOGO_No);
  /*POS2034  倉庫設定檔*/
create table POS2034
(
     id                  numeric(19,0)        identity(1,1) not null,
     MID                 numeric(19,0)        DEFAULT 0 not null, /*商戶編號*/
     STO_No              varchar (10)         not null ,     /*公司編號/店號*/
     HOS_No              varchar (10)         not null ,     /*倉庫代碼*/
     HOS_NAME            nvarchar (50)        not null ,     /*倉庫名稱*/
     org_id              varchar (20)         not null ,     /*組織代碼/所屬部門*/
     building_no         char (1)                 null ,     /*館別代碼 SYS3800館別代碼檔*/
     HOS_Remark          nvarchar (100)           null ,     /*備註說明*/
	 CRT_Date            datetime                 null ,     /*建立日期*/
     CRT_USR_No          varchar (16)             null ,     /*建立人員*/
     CRT_USR_Name        nvarchar (20)            null ,     /*建立人員姓名*/
     UPD_Date            datetime                 null ,     /*變更日期*/
     UPD_USR_No          varchar (16)             null ,     /*變更人員*/
     UPD_USR_Name        nvarchar (20)            null ,     /*變更人員姓名*/

     constraint pk_POS2034 primary key clustered (id)
);

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS2034_1')
  CREATE UNIQUE INDEX IDX_POS2034_1 ON POS2034 (MID, STO_No, HOS_No);
  /*廠商主檔*/
create table POS2013
(
   	 id                  numeric(19,0) identity(1,1) not null,
   	 mid                 numeric(19,0)   DEFAULT 0     not null,
	 --基本資料
     VEN_No              varchar (16)         not null ,     /*廠商編號*/
     VEN_Name            nvarchar (100)       not null ,     /*廠商名稱*/
     VEN_ShortName       nvarchar (30)            null ,     /*廠商簡稱*/
     VEN_EngName         varchar  (100)           null ,     /*廠商英文名稱*/
     VEN_Flag            char (1)             not null ,     /*廠商統一編號欄位內容 */
	                                                         /*1=廠商統一編號 2=個人身分證字號 3=自編編號*/
     VEN_Uniform         varchar (16)         not null ,     /*廠商統一編號/身份證字號*/
	 VEN_RemitFeeMode    char (1)                 null ,     /*郵電費負擔方(0廠商負擔 1公司負擔)*/

	 --公司資料
     VEN_Post            varchar (5)              null ,     /*廠商公司地址郵遞區號 廠客用*/
     VEN_Address         nvarchar (100)       not null ,     /*廠商公司地址 公司登記地址*/
     VEN_Tel             varchar (20)             null ,     /*廠商公司電話*/
     VEN_Fax             varchar (20)             null ,     /*廠商傳真*/
     VEN_Email           varchar (60)             null ,     /*廠商電子郵件*/
     VEN_GUIAddr         nvarchar (100)           null ,     /*廠商發票地址*/
     VEN_GUIEmail        varchar (60)             null ,     /*廠商發票電子郵件*/

	 --付款資料
     VEN_PayType         char (1)             not null ,     /*付款方式(1:電匯,2:開票,3:現金)*/
     VEN_BNK_No          varchar(5)               NULL ,     /*匯款銀行代碼*/
     VEN_BNK_BranchNo    varchar(6)               NULL ,     /*匯款銀行分行代碼*/
     VEN_BankAccountNo   varchar (50)             null ,     /*匯款帳號*/
     VEN_AccountName     nvarchar (80)            null ,     /*匯款帳戶名稱*/
     VEN_PayConditionDay numeric (6)          not null ,     /*付款期限(天數)*/
     VEN_CheckTitle      nvarchar (100)           null ,     /*支票抬頭*/
	 VEN_Status          char (1)             not null ,     /*審核狀態(0未審核 1已審核 )*/
     Approved_Date       datetime                 null ,     /*審核日期*/

	 VEN_DiscYN          char (1)             not null ,     /*是否為貼現廠商(Y是 N否 ) default N*/
	 VEN_CTRLYN          char (1)             not null ,     /*是否禁止背書轉讓(Y是 N否 ) default Y*/
     VEN_DiscDateB       DATE                     NULL ,     /*貼現起始日期*/
     VEN_DiscDateE       DATE                     NULL ,     /*貼現結束日期*/
     GUI_ID_WIRE         varchar (16)             null ,     /*匯款統一編號 南紡廠客資料可修改欄位*/

     VEN_Remark          nvarchar (200)           null ,     /*備註*/
     CRT_Date            datetime                 null ,     /*建立日期*/
     CRT_USR_No          varchar (16)             null ,     /*建立人員*/
     CRT_USR_Name        nvarchar (20)            null ,     /*建立人員姓名*/
     UPD_Date            datetime                 null ,     /*變更日期*/
     UPD_USR_No          varchar (16)             null ,     /*變更人員*/
     UPD_USR_Name        nvarchar (20)            null ,     /*變更人員姓名*/

     constraint pk_POS2013 primary key clustered (VEN_No)
);
/*商品主檔*/
create table POS2004
(
     id                  numeric(19,0)        identity(1,1) not null,
     MID                 numeric(19,0)        DEFAULT 0 not null, /*商戶編號*/
     PLU_MagNo           varchar (20)         not null ,     /*商品管理編號*/
     PLU_No              varchar (20)         not null ,     /*國際條碼*/ --欄位大小改20
     PLU_OrgPLUNo        varchar (30)             null ,     /*廠商貨號*/ --廠商自編碼 廠商貨號
     PLU_Name            nvarchar (60)            null ,     /*商品名稱*/
     PLU_PrnName         nvarchar (40)            null ,     /*列印名稱*/ --欄位大改40
     PLU_EngName         varchar (100)            null ,     /*英文名稱*/ --欄位大小改100
     CAT_LNo             varchar (6)          not null ,     /*大分類代碼 POS2003*/
     CAT_MNo             varchar (6)              null ,     /*中分類代碼 POS20031*/
     CAT_SNo             varchar (6)              null ,     /*小分類代碼 POS20032*/
     VEN_No              varchar (16)             null ,     /*廠商編號*/ --欄位大小改16
     PLU_TaxType         char (1)             not null ,     /*售價稅別:0免稅,1應稅*/
     PLU_Unit            varchar (2)              null ,     /*單位代碼*/ --讀PLUUNIT  商品單位設定檔
     PLU_Spec            nvarchar (30)            null ,     /*規格*/
     PLU_FixPrc          numeric (10, 2)          null ,     /*定價*/
     PLU_SalePrc         numeric (10, 2)      not null ,     /*售價*/
     PLU_MemPrc          numeric (10, 2)          null ,     /*會員價*/
     PLU_BatPrc          numeric (10, 2)          null ,     /*批發*/
     PLU_Cost            numeric (12, 4)          null ,     /*成本*/
     PLU_OpenPrc         char (1)             not null ,     /*開放售價Y/N*/
     PLU_Status          char (1)             not null ,     /*商品狀態:0一般*/ --與南紡目前的商品狀態分開，南紡的商品狀態給EC用，所以下方有再開一個欄位PLU_ECStatus
     PLU_Type            char (2)             not null ,     /*商品類別:1一般商品,2生鮮商品,6組合商品,8專櫃,B禮券,F:折讓 CC:專櫃商品菜單 SC:特殊條碼*/  /*20250705 改2碼*/
     PLU_PageNum         varchar (8)              null ,     /*棚割編號*/
     PLU_LocNo           numeric (4, 1)           null ,     /*棚割序號*/
     PLU_BoxQty          numeric (4)              null ,     /*包裝入數(裝箱入數)*/ --南紡 包裝入數
     PLU_StockTaxType    char (1)                 null ,     /*進價稅別:0免稅,1應稅*/
     PLU_OrderPrc        numeric (10, 2)          null ,     /*進價*/
     PLU_OrderPrcRate    numeric (10, 2)          null ,     /*進價折數*/
     PLU_SafeQty         numeric (10,4)           null ,     /*安全存量*/ --欄位大小改 10,4 南紡的資料有20.3333
     PLU_LastStockDate   date                     null ,     /*最後進貨日期*/

     PLU_Reserve1        nvarchar (400)           null ,     /*說明*/ --說明  欄位大小改400
     PLU_Reserve2        nvarchar (400)           null ,     /*規格說明*/ --規格說明 欄位大小改400
     PLU_Reserve3        nvarchar (400)           null ,     /*系列*/ --系列 欄位大小改400
     PLU_Reserve4        nvarchar (400)           null ,     /*保留*/ --欄位大小改400
     PLU_Reserve5        nvarchar (400)           null ,     /*保留*/ --欄位大小改400
     PLU_StopSale        char (1)                 null ,     /*停止銷售註記(Y/N)*/
     PLU_CalcSaleStock   char (1)                 null ,     /*計算庫存方式(N:依數量 Y:依金額)*/
     PLU_Disc            char (1)                 null ,     /*是否可折扣(Y/N)*/
     PLU_OpenOrderPrc    char (1)                 null ,     /*開放進價(Y/N)*/
     PLU_LastSaleDate    date                     null ,     /*最後銷售日期*/
     PLU_LastUpdSalePrc  date                     null ,     /*最後修改售價日期*/
     PLU_LastUpdOrderPrc date                     null ,     /*最後修改進價日期*/
     PLU_RebateRate      numeric (5, 4)           null ,     /*折讓率(金額類商品的成本率)*/
     PLU_AccountType     char (1)                 null ,     /*結帳別:1寄賣、2自營、3自營與寄賣、4質借*/
     PLU_StopStockDate   date                     null ,     /*停止進貨日期*/
     PLU_StopSaleDate    date                     null ,     /*停止銷售日期*/
     PLU_ExpDays         numeric (10)             null ,     /*保存天數*/

     PLU_MemPrc2         numeric (10, 2)          null ,     /*特價*/
     PLU_MemPrc3         numeric (10, 2)          null ,     /*VIP價*/
     MAM_No              varchar(16)              null ,     /*促銷編號*/
     MAM_Condition       numeric (8)              null ,     /*促銷數量(條件數量)*/
     MAM_TotAmt          numeric(10,2)            null ,     /*促銷總額(條件金額)*/
     MAM_CombNo          varchar(20)              null ,     /*組合編號*/
     MAM_CombGrp         varchar(6)               null ,     /*組合群組項次*/
     MAM_Method          char(1)                  null ,     /*促銷方式*/
     MAM_UnitPrc         numeric(10,2)            null ,     /*促銷單價-POS售價*/
     MAM_ChangeNo        varchar(14)              null ,     /*變價單號*/ --欄位改14
     MAM_BegDate         date                     null ,     /*開始日期*/
     MAM_EndDate         date                     null ,     /*結束日期*/
     MAM_Quart           numeric(10,2)            null ,     /*會員贈扣點數*/
     MAM_TotQuart        numeric(10,2)            null ,     /*總會員贈扣點數*/
     MAM_AddPrc          numeric(10,2)            null ,     /*符合促銷條件後,優惠價格*/
     MAM_AddQty          numeric (8)              null ,     /*可買M個額外商品,優惠數量*/
     MAM_AddPLU_No       varchar(20)              null ,     /*額外商品編號/優惠商品編號*/ --欄位改20
     MAM_MemCondition    numeric (8)              null ,     /*會員促銷數量*/
     MAM_MemTotAmt       numeric(10,2)            null ,     /*會員促銷總額*/
     MAM_MemUnitPrc      numeric(10,2)            null ,     /*會員促銷單價*/
     MAM_MaxCondition    numeric (8)              null ,     /*限購組數*/
     MAM_DiscAmt         numeric(10,2)            null ,     /*優惠價*/
     MAM_ActiveDate      date                     null ,     /*變價啟動日期*/
     MAM_DiscType        char(1)                  null ,     /*優惠方式 Y:優惠價/N:折扣%*/
     MAM_FirstActiveDate date                     null ,     /*第一次變價啟動日期*/
     MAM_RecoverDate     date                     null ,     /*變價回復日期*/

     PLU_Attribute       char (1)                 null ,     /*商品型態 1一般、2進口、3買斷、4試銷、5寄賣*/ --南紡 商品型態 1一般、2進口、3買斷、4試銷、5寄賣
     PLU_Source          char (1)                 null ,     /*來源別(1:自製,2:OEM,3:外購,4:自行進口,5:代工,6:煙酒)*/
     PLU_IsStock         char (1)                 null ,     /*是否計算庫存(Y:是 N:否)*/ --欄位名稱改
     PLU_ReadyDay        numeric (4)              null ,     /*備貨天數*/
     PLU_MinOrder        numeric (8)              null ,     /*最小訂量(不使用)*/ --南紡會使用 最小訂購量
     PLU_StockType       char (1)                 null ,     /*庫存類別(0:一般 1:標準用量 2:自動轉換(沒用到) 3:子母商品 4:手動轉換)*/
     MAM_PLU_MagNo       varchar(20)              null ,     /*促銷條碼貨號(憑券使用)*/
     MAM_OrdPrcBegDate   date                     null ,     /*進價促銷開始日期*/
     MAM_OrdPrcEndDate   date                     null ,     /*進價促銷結束日期*/
     MAM_OrderPrc        numeric (10, 2)          null ,     /*促銷進價*/
     TLT_NO              varchar(12)              null ,     /*專櫃編號*/ --欄位大小改12
--20250410 add
     PLU_TaxRate         DECIMAL(7,4)             NULL,      /*稅率*/
     PLU_Lable           nvarchar(50)             null ,     /*標籤名稱*/
     LOGO_No             varchar (4)              null ,     /*品牌代碼*/
     PLU_Length          numeric (10, 2)          null ,     /*長cm*/
     PLU_Width           numeric (10, 2)          null ,     /*寬cm*/
     PLU_Height          numeric (10, 2)          null ,     /*高cm*/
     PLU_Weight          numeric (10, 2)          null ,     /*重量g*/
     PLU_Volume          numeric (10, 2)          null ,     /*容量ml*/
     PLU_Image           VARCHAR(255)             null ,     /*商品圖檔檔名*/
     PLU_ECStatus        char (1)                 null ,     /*商品狀態: 1.正常2.停用3.停進4,下架 For EC*/
     PLU_ECStopUseDate   date                     null ,     /*EC停用日期*/
     PLU_ECStopUseUsr    varchar (16)             null ,     /*EC停用人員*/
     PLU_ECStopUseName   nvarchar(20)             null ,     /*EC停用人員姓名*/

     PLU_ECReShelvesDate date                     null ,     /*EC下架日期*/
     PLU_ECReShelvesUsr  varchar (16)             null ,     /*EC下架人員*/
     PLU_ECReShelvesName nvarchar(20)             null ,     /*EC下架人員姓名*/

     PLU_ECStopInDate    date                     null ,     /*EC停進日期*/
     PLU_ECStopInUsr     varchar (16)             null ,     /*EC停進人員*/
     PLU_ECStopInName    nvarchar(20)             null ,     /*EC停進人員姓名*/


     CRT_Date            datetime                 null ,     /*建立日期*/
     CRT_USR_No          varchar (16)             null ,     /*建立人員*/
     CRT_USR_Name        nvarchar (20)            null ,     /*建立人員姓名*/
     UPD_Date            datetime                 null ,     /*變更日期*/
     UPD_USR_No          varchar (16)             null ,     /*變更人員*/
     UPD_USR_Name        nvarchar (20)            null ,     /*變更人員姓名*/

     constraint pk_POS2004 primary key clustered (id)
);
IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS2004_1')
  CREATE UNIQUE INDEX IDX_POS2004_1 ON POS2004 (MID, PLU_MagNo);

  /*POS2099 目前庫存檔*/
drop table POS2099;
create table POS2099
(
     id                  NUMERIC(19,0) IDENTITY(1,1) NOT NULL,
     MID                 numeric(19,0)        DEFAULT 0 not null, /*商戶編號*/
     SYS_StoreNo         VARCHAR(10)         not null,      /*公司編號/店號*/
     HOS_No              VARCHAR (10)        not null ,     /*倉庫代碼*/
     PLU_MagNo           varchar(20)         not null ,     /*商品管理編號*/

     STK_Date            Date                    null,      /*庫存日期*/
     STK_PriorQty        numeric (8)         default 0    null,      /*前日庫存量*/
     STK_StockQty        numeric (8)         default 0    null,      /*進貨量*/
     STK_RejectQty       numeric (8)         default 0    null,      /*退貨量*/
     STK_SaleQty         numeric (8)         default 0    null,      /*銷貨量*/
     STK_MoveInQty       numeric (8)         default 0    null,      /*移入量*/
     STK_MoveOutQty      numeric (8)         default 0    null,      /*移出量*/
     STK_ScrapQty        numeric (8)         default 0    null,      /*報廢 庫存減項*/
     STK_TakeQty         numeric (8)         default 0    null,      /*領用 庫存減項*/
     STK_ReTakeQty       numeric (8)         default 0    null,      /*領退 庫存加項*/
	 STK_TRDInQty        numeric (8)         default 0    null,      /*同業調入*/
	 STK_TRDOutQty       numeric (8)         default 0    null,      /*同業調出*/

     STK_CurrentQty      numeric (10, 2)     default 0    null,      /*本日庫存量*/
     STK_ShiftQty        numeric (8)         default 0    null,      /*移轉量*/
     STK_InStockQty      numeric (8)         default 0    null,      /*盤點量*/
     STK_DiffQty         numeric (8)         default 0    null,      /*盤盈虧數量*/
     STK_AdjustQty       numeric (8)         default 0    null,      /*調整量*/
     STK_PriorCost       numeric (12, 4)     default 0    null,      /*前日庫存成本*/
     STK_CurrentCost     numeric (12, 4)     default 0    null,      /*本日庫存成本*/
     STK_UnitCost        numeric (12, 4)     default 0    null,      /*本日單位成本*/
     STK_BatchQty        numeric (8)         default 0    null,      /*批發量(訂單出貨)*/
     CRT_Date            datetime                         null,      /*建立日期*/
     CRT_USR_No          nvarchar(8)                      null,      /*建立人員*/
     CRT_USR_Name        NVARCHAR (20)                    null,      /*建立人員姓名*/
     UPD_Date            datetime                         null,      /*變更日期*/
     UPD_USR_No          nvarchar(8)                      null,      /*變更人員*/
     UPD_USR_Name        NVARCHAR (20)                    null,      /*變更人員姓名*/

     DEP_No              nvarchar (6)                     null,      /*部門編號*/
     PLU_FixPrc          numeric (10, 2)                  null,      /*定價*/
     PLU_SalePrc         numeric (10, 2)                  null,      /*售價*/
     PLU_MemPrc          numeric (10, 2)                  null,      /*會員價*/
     PLU_BatPrc          numeric (10, 2)                  null,      /*批發價*/
     PLU_OrderPrc        numeric (10, 2)                  null,      /*進價*/
     PLU_LastStockDate   Date                             null,      /*最後進貨日期*/
     PLU_LastSaleDate    Date                             null,      /*最後銷售日期*/
     MAM_No              nvarchar(12)                     null,      /*促銷編號*/
     MAM_UnitPrc         numeric(10,2)                    null,      /*促銷售價*/
     MAM_OrderPrc        numeric (10, 2)                  null,      /*促銷進價*/
     PLU_DmsQty          numeric (10, 2)                  null,      /*平均日銷量*/
     PLU_LDmsQty         numeric (10, 2)                  null,      /*前日平均日銷量*/
     STK_InDate          Date                             null,      /*最後入庫日期*/
     STK_OutDate         Date                             null,      /*最後出庫日期*/
     STK_InAmt           numeric (12, 4)                  null,      /*進貨/移入金額*/
     MMP_SerNo           numeric(12)                      null,      /*促銷序號*/
     MMP_ActiveDate      Date                             null,      /*變價啟動日期*/
     MMP_FirstActiveDate Date                             null,      /*第一次變價啟動日期*/
     MMP_RecoverDate     Date                             null,      /*變價回復日期*/
     PLU_MemPrc2         numeric (10, 2)                  null,      /*員工價*/
     PLU_MemPrc3         numeric (10, 2)                  null,      /*VIP價(聯名卡價)*/
     MAM_MemUnitPrc      numeric (10, 2)                  null,      /*會員價*/
     MAM_MemUnitPrc2     numeric (10, 2)                  null,      /*員工價*/
     MAM_MemUnitPrc3     numeric (10, 2)                  null,      /*VIP價(聯名卡價)*/

     constraint pk_POS2099 primary key clustered (id)
);

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS2099_1')
  CREATE UNIQUE INDEX IDX_POS2099_1 ON POS2099 (MID, SYS_StoreNo, HOS_NO, PLU_MagNo);



-------------------------------------------------同業調撥
/*STORETRANSM 同業調撥主檔*/
DROP TABLE STORETRADEM;
create table STORETRANSM
(
    id                   NUMERIC(19,0) IDENTITY(1,1) NOT NULL,
    MID                  numeric(19,0)        DEFAULT 0 not null, /*商戶編號*/
    TRD_No               nvarchar(16)         not null,      /*同業調撥編號:TRYYYYMMDDSSSS*/
    SYS_StoreNo          VARCHAR(10)          not null,      /*公司編號/店號*/
    HOS_No               VARCHAR (10)         not null ,     /*倉庫代碼*/
    VEN_No               VARCHAR (16)             null,      /*廠商編號*/
    LOGO_No              VARCHAR (4)              null ,     /*品牌代碼*/

    TRD_Status           char(1)              not null,      /*同業調撥狀態:1=已申請 2=已確認 3=已審核 7=已結案 9=已作廢*/
	TRD_Reason           char(1)                  null       /*調撥原因：１＝庫存過高　２＝同業調貨　３＝同業缺貨　４＝其它  ５＝特殊*/
    IN_TotBuyAmt         NUMERIC(14, 4)           null,      /*調入總金額 明細的調入加總*/
    OUT_TotBuyAmt        NUMERIC(14, 4)           null,      /*調出總金額 明細的調出加總*/
    DIFF_TotBuyAmt       NUMERIC(14, 4)           null,      /*差異金額 調入金額與調出金額的差異 顯示正值*/

    APPLY_Date           date                     null,      /*申請日期*/
    APPLY_USR_No         VARCHAR(16)              NULL,      /*申請人員*/
    APPLY_USR_Name       NVARCHAR(20)             NULL,      /*申請人員姓名*/
    Confim_Date          DATE                     NULL,      /*確認日期*/
    Confim_USR_No        VARCHAR(16)              NULL,      /*確認人員*/
    Confim_USR_Name      NVARCHAR(20)             NULL,      /*確認人員姓名*/
    APRV_Date            DATE                     NULL,      /*審核日期*/
    APRV_USR_No          VARCHAR(16)              NULL,      /*審核人員*/
    APRV_USR_Name        NVARCHAR(20)             NULL,      /*審核人員姓名*/
    VOID_Date            DATE                     NULL,      /*作廢日期*/
    VOID_USR_No          VARCHAR(16)              NULL,      /*作廢人員*/
    VOID_USR_Name        NVARCHAR(20)             NULL,      /*作廢人員*/
    CLOS_Date            DATE                     NULL,      /*強制結案日期*/
    CLOS_USR_No          VARCHAR(16)              NULL,      /*強制結案人員*/
    CLOS_USR_Name        NVARCHAR(20)             NULL,      /*強制結案人員姓名*/
    TRD_Remark           NVARCHAR(200)            null,      /*備註*/
    CRT_Date               datetime                null ,     /*建立日期*/
    CRT_USR_No             VARCHAR (16)            null ,     /*建立人員*/
    CRT_USR_Name           NVARCHAR (20)           null ,     /*建立人員姓名*/
    UPD_Date               datetime                null ,     /*變更日期*/
    UPD_USR_No             VARCHAR (16)            null ,     /*變更人員*/
    UPD_USR_Name           NVARCHAR (20)           null ,     /*變更人員姓名*/

     constraint pk_STORETRADEM primary key clustered (id)
);
IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_STORETRADEM_1')
  CREATE UNIQUE INDEX IDX_STORETRADEM_1 ON STORETRADEM (MID, TRD_No, SYS_StoreNo, HOS_No);

