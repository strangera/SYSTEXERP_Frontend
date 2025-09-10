/*POS2008M 商品促銷主檔*/
drop table POS2008M;
create table POS2008M
(
     id                   NUMERIC(19,0) IDENTITY(1,1) NOT NULL,
     MID                 numeric(19,0)        DEFAULT 0 not null, /*商戶編號*/
     MAM_No               varchar(16)         not null ,     /*促銷編號(變價單號)=POS2004.MAM_No PR+YYYYMMDD+SSSS*/  --欄位長度改16 變價單號  POS2004 MAM_NO 也要調整欄位長度
     SYS_StoreNo          VARCHAR(10)         not null,      /*公司編號/店號*/
     VEN_No               varchar (16)            null ,     /*廠商編號*/ --放在主檔，因要依廠商編號、品牌及啟用日期分拆為變價單
     LOGO_No              varchar (4)             null ,     /*品牌代碼*/ --新增欄位

     MAM_BegDate          DATE                    null ,     /*生效起始日期*/
     MAM_EndDate          DATE                    null ,     /*生效結束日期*/
     MAM_Status           char(1)             not null ,     /*變價狀態: 0 已申請 1已審核 2變價生效中 3變價結束 9作廢*/
	                                                         /*原本KGSMART 0未確認, 1已確認, 2變價中, 3.變價結束, 9無效促銷(1.刪除變價 2.重複下單)*/
     MAM_Method           char(1)                 null ,     /*促銷方式  1 永久變價  H 降價促銷*/  --促銷方式只剩兩種
     MAM_TotAmt           numeric(10,2)           null ,     /*組合價格/滿額金額*/
     MAM_MaxCondition     numeric(10)             null ,     /*限購組數*/
     MAM_DiscType         char(1)                 null ,     /*優惠方式Y:優惠價/N:折扣%*/
     MAM_Source           numeric(2)              null ,     /*優先等級 1.低 2.中 3.高  數字越高等級越高*/  --原本varchar 改 numeric
     MAM_Remark           nvarchar(200)           null ,     /*變價備註*/
     MAM_ActiveDate       DATE                    null ,     /*變價啟動日期*/
     MAM_FirstActiveDate  DATE                    null ,     /*第一次變價啟動日期*/
     MAM_RecoverDate      DATE                    null ,     /*變價回復日期*/
     MAM_PLU_MagNo        varchar(20)             null ,     /*促銷條碼貨號(憑券使用)*/ --POS有用到
     MAM_BegTime          varchar(4)              null ,     /*促銷開始時段(hhnn)*/
     MAM_EndTime          varchar(4)              null ,     /*促銷結束時段(hhnn)*/
     MAM_DateType         char(1)                 null,      /*日期種類: 1=每日, 2=每週, 3=每月*/
     MAM_Week1            char(1)                 null,      /*星期一(Y/N)*/
     MAM_Week2            char(1)                 null,      /*星期二(Y/N)*/
     MAM_Week3            char(1)                 null,      /*星期三(Y/N)*/
     MAM_Week4            char(1)                 null,      /*星期四(Y/N)*/
     MAM_Week5            char(1)                 null,      /*星期五(Y/N)*/
     MAM_Week6            char(1)                 null,      /*星期六(Y/N)*/
     MAM_Week7            char(1)                 null,      /*星期日(Y/N)*/
     MAM_Day              numeric(2)              null,      /*每月幾號: 0=最後一天*/ --欄位改2 原本欄位大小8
     MAM_Type             char (1)                null,      /*價格種類:1售價促銷,2進價促銷,3售價及進價促銷*/
     MAM_InvDesc          nvarchar(40)            null,      /*POS顯示的促銷說明*/

     APPLY_Date           DATE                    NULL,      /*申請日期*/
     APPLY_USR_No         VARCHAR(16)             NULL,      /*申請人員*/
     APPLY_USR_Name       NVARCHAR(20)            NULL,      /*申請人員姓名*/
     APRV_Date            DATE                    NULL,      /*審核日期*/
     APRV_USR_No          VARCHAR(16)             NULL,      /*審核人員*/
     APRV_USR_Name        NVARCHAR(20)            NULL,      /*審核人員姓名*/
     ReAPRV_Date          DATE                    NULL,      /*反審核日期*/
     ReAPRV_USR_No        VARCHAR(16)             NULL,      /*反審核人員*/
     ReAPRV_USR_Name      NVARCHAR(20)            NULL,      /*反審核人員姓名*/
     Void_Date            DATE                    NULL,      /*作廢日期*/
     Void_USR_No          VARCHAR(16)             NULL,      /*作廢人員*/
     Void_USR_Name        NVARCHAR(20)            NULL,      /*作廢人員姓名*/
     CRT_Date             datetime                null ,     /*建立日期*/
     CRT_USR_No           varchar (16)            null ,     /*建立人員*/
     CRT_USR_Name         nvarchar (20)           null ,     /*建立人員姓名*/
     UPD_Date             datetime                null ,     /*變更日期*/
     UPD_USR_No           varchar (16)            null ,     /*變更人員*/
     UPD_USR_Name         nvarchar (20)           null ,     /*變更人員姓名*/

     CONSTRAINT PK_POS2008M PRIMARY KEY CLUSTERED (id)
);

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS2008M_1')
  CREATE UNIQUE INDEX IDX_POS2008M_1 ON POS2008M (MID, MAM_No, SYS_StoreNo);


/*POS2008 商品促銷明細檔*/
drop table POS2008;
create table POS2008
(
     id                   NUMERIC(19,0) IDENTITY(1,1) NOT NULL,
     MAM_No                 varchar(16)         not null ,     /*促銷編號(變價單號)=POS2004.MAM_No PR+YYYYMMDD+SSSS*/
     PLU_MagNo              varchar(20)         not null ,     /*貨號*/

     PLU_SalePrc            numeric (10, 2)         null ,     /*原售價*/
     MAM_UnitPrc            numeric (10,2)          null ,     /*促銷單價-POS售價*/
     PLU_OrderPrc           numeric (10, 2)         null ,     /*原進價*/
     MAM_OrderPrc           numeric (10, 2)         null,      /*促銷進價*/

     PLU_OrderPrcRate       numeric (10, 2)         null ,     /*新進價折數*/

     MAD_Remark             nvarchar(200)           null ,     /*明細備註*/
	 CONSTRAINT PK_POS2008 PRIMARY KEY CLUSTERED (id)
);

/*POS2010M 商品促銷回復主檔*/
drop table POS2010M;
create table POS2010M
(
     id                   NUMERIC(19,0) IDENTITY(1,1) NOT NULL,
     MID                 numeric(19,0)        DEFAULT 0 not null, /*商戶編號*/
     MAM_No               varchar(16)         not null ,     /*促銷編號(變價單號)=POS2004.MAM_No PR+YYYYMMDD+SSSS*/  --欄位長度改16 變價單號  POS2004 MAM_NO 也要調整欄位長度
     SYS_StoreNo            VARCHAR(10)         not null,      /*公司編號/店號*/
     VEN_No               varchar (16)            null ,     /*廠商編號*/ --放在主檔，因要依廠商編號、品牌及啟用日期分拆為變價單
     LOGO_No              varchar (4)             null ,     /*品牌代碼*/ --新增欄位

     MAM_BegDate          DATE                    null ,     /*生效起始日期*/
     MAM_EndDate          DATE                    null ,     /*生效結束日期*/
     MAM_Status           char(1)             not null ,     /*變價狀態: 0 已申請 1已審核 2變價生效中 3變價結束 9作廢*/
	                                                         /*原本KGSMART 0未確認, 1已確認, 2變價中, 3.變價結束, 9無效促銷(1.刪除變價 2.重複下單)*/
     MAM_Method           char(1)                 null ,     /*促銷方式  1 永久變價  H 降價促銷*/  --促銷方式只剩兩種
     MAM_TotAmt           numeric(10,2)           null ,     /*組合價格/滿額金額*/
     MAM_MaxCondition     numeric(10)             null ,     /*限購組數*/
     MAM_DiscType         char(1)                 null ,     /*優惠方式Y:優惠價/N:折扣%*/
     MAM_Source           numeric(2)              null ,     /*優先等級 1.低 2.中 3.高  數字越高等級越高*/  --原本varchar 改 numeric
     MAM_Remark           nvarchar(200)           null ,     /*變價備註*/
     MAM_ActiveDate       DATE                    null ,     /*變價啟動日期*/
     MAM_FirstActiveDate  DATE                    null ,     /*第一次變價啟動日期*/
     MAM_RecoverDate      DATE                    null ,     /*變價回復日期*/
     MAM_PLU_MagNo        varchar(20)             null ,     /*促銷條碼貨號(憑券使用)*/ --POS有用到
     MAM_BegTime          varchar(4)              null ,     /*促銷開始時段(hhnn)*/
     MAM_EndTime          varchar(4)              null ,     /*促銷結束時段(hhnn)*/
     MAM_DateType         char(1)                 null,      /*日期種類: 1=每日, 2=每週, 3=每月*/
     MAM_Week1            char(1)                 null,      /*星期一(Y/N)*/
     MAM_Week2            char(1)                 null,      /*星期二(Y/N)*/
     MAM_Week3            char(1)                 null,      /*星期三(Y/N)*/
     MAM_Week4            char(1)                 null,      /*星期四(Y/N)*/
     MAM_Week5            char(1)                 null,      /*星期五(Y/N)*/
     MAM_Week6            char(1)                 null,      /*星期六(Y/N)*/
     MAM_Week7            char(1)                 null,      /*星期日(Y/N)*/
     MAM_Day              numeric(2)              null,      /*每月幾號: 0=最後一天*/ --欄位改2 原本欄位大小8
     MAM_Type             char (1)                null,      /*價格種類:1售價促銷,2進價促銷,3售價及進價促銷*/
     MAM_InvDesc          nvarchar(40)            null,      /*POS顯示的促銷說明*/

     APPLY_Date           DATE                    NULL,      /*申請日期*/
     APPLY_USR_No         VARCHAR(16)             NULL,      /*申請人員*/
     APPLY_USR_Name       NVARCHAR(20)            NULL,      /*申請人員姓名*/
     APRV_Date            DATE                    NULL,      /*審核日期*/
     APRV_USR_No          VARCHAR(16)             NULL,      /*審核人員*/
     APRV_USR_Name        NVARCHAR(20)            NULL,      /*審核人員姓名*/
     ReAPRV_Date          DATE                    NULL,      /*反審核日期*/
     ReAPRV_USR_No        VARCHAR(16)             NULL,      /*反審核人員*/
     ReAPRV_USR_Name      NVARCHAR(20)            NULL,      /*反審核人員姓名*/
     Void_Date            DATE                    NULL,      /*作廢日期*/
     Void_USR_No          VARCHAR(16)             NULL,      /*作廢人員*/
     Void_USR_Name        NVARCHAR(20)            NULL,      /*作廢人員姓名*/
     CRT_Date             datetime                null ,     /*建立日期*/
     CRT_USR_No           varchar (16)            null ,     /*建立人員*/
     CRT_USR_Name         nvarchar (20)           null ,     /*建立人員姓名*/
     UPD_Date             datetime                null ,     /*變更日期*/
     UPD_USR_No           varchar (16)            null ,     /*變更人員*/
     UPD_USR_Name         nvarchar (20)           null ,     /*變更人員姓名*/

     CONSTRAINT PK_POS2010M PRIMARY KEY CLUSTERED (id)
);

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS2010M_1')
  CREATE UNIQUE INDEX IDX_POS2010M_1 ON POS2010M (MID, MAM_No, SYS_StoreNo);


/*POS2010 商品促銷回復明細檔*/
drop table POS2010;
create table POS2010
(
     id                   NUMERIC(19,0) IDENTITY(1,1) NOT NULL,
     MID                 numeric(19,0)        DEFAULT 0 not null, /*商戶編號*/
     MAM_No                 varchar(16)         not null ,     /*促銷編號(變價單號)=POS2004.MAM_No PR+YYYYMMDD+SSSS*/
     SYS_StoreNo            VARCHAR(10)         not null,      /*公司編號/店號*/
     PLU_MagNo              varchar(20)         not null ,     /*貨號*/
     PLU_SalePrc            numeric (10, 2)         null ,     /*原售價*/
     MAM_UnitPrc            numeric (10,2)          null ,     /*促銷單價-POS售價*/
     PLU_OrderPrc           numeric (10, 2)         null ,     /*原進價*/
     MAM_OrderPrc           numeric (10, 2)         null,      /*促銷進價*/

     PLU_SalePrcRateOrg     numeric (10, 2)         null ,     /*原售價折數(調整前)*/
     PLU_OrderPrcRateOrg    numeric (10, 2)         null ,     /*原進價折數(調整前)*/
     PLU_MemPrcRateOrg      numeric (10, 2)         null ,     /*原會員價折數(調整前)*/
     MAM_MemUnitPrc2RateOrg numeric (10, 2)         null ,     /*原員購價折數(調整前)*/
     MAM_MemUnitPrc3RateOrg numeric (10, 2)         null ,     /*原聯名卡價折數(調整前)*/

     PLU_OrderPrcRate       numeric (10, 2)         null ,     /*新進價折數*/
     PLU_SalePrcRate        numeric (10, 2)         null ,     /*新售價折數*/
     PLU_MemPrcRate         numeric (10, 2)         null ,     /*新會員價折數*/
     MAM_MemUnitPrc2Rate    numeric (10, 2)         null ,     /*新員購價折數*/
     MAM_MemUnitPrc3Rate    numeric (10, 2)         null ,     /*新聯名卡價折數*/

	 PLU_MemPrc             numeric (10, 2)         null ,     /*會員價*/
     PLU_MemPrc2            numeric (10, 2)         null ,     /*員工價*/
     PLU_MemPrc3            numeric (10, 2)         null ,     /*聯名卡價*/

	 MAM_MemUnitPrc         numeric (10, 2)         null ,     /*會員價*/
     MAM_MemUnitPrc2        numeric (10, 2)         null ,     /*員工價*/
	 MAM_MemUnitPrc3        numeric (10, 2)         null ,     /*聯名卡價*/
     MAD_Remark             nvarchar(200)           null ,     /*明細備註*/

     MAM_Condition          numeric(8)              null ,     /*組合最少購買數量/購買數量/Group購買量/N數量*/
     MAM_AddPrc             numeric(10,2)           null ,     /*群組總數*/
     MAM_AddQty             numeric(8)              null ,     /*商品群組/M數量*/
     MAM_AddPLU_No          varchar(13)             null ,     /*贈品貨號/A,B區分群組*/
     MAM_DiscAmt            numeric(10,2)           null ,     /*優惠價/印花價*/
     CRT_Date               datetime                null ,     /*建立日期*/
     CRT_USR_No             varchar (16)            null ,     /*建立人員*/
     CRT_USR_Name           nvarchar (20)           null ,     /*建立人員姓名*/
     UPD_Date               datetime                null ,     /*變更日期*/
     UPD_USR_No             varchar (16)            null ,     /*變更人員*/
     UPD_USR_Name           nvarchar (20)           null ,     /*變更人員姓名*/

	 CONSTRAINT PK_POS2010 PRIMARY KEY CLUSTERED (id)
);
