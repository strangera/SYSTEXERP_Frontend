/*POS5007 銷售商品明細檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS5007')
BEGIN
CREATE TABLE POS5007
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
	MID                 DECIMAL(19) DEFAULT 0 NOT NULL,   /*商戶編號*/
    SYS_StoreNo         VARCHAR(10)        NOT NULL,      /*門市店號*/
    TXN_Date            DATE               NOT NULL,      /*交易日期*/
    ECR_No              VARCHAR(10)        NOT NULL,      /*收銀機機號*/
    TXN_No              DECIMAL(08)        NOT NULL,      /*交易序號*/
    TXN_Item            DECIMAL(06)        NOT NULL,      /*項次*/
    TXN_Time            DATETIME           NOT NULL,      /*交易時間*/
    TXN_GUINo           VARCHAR(10)        NOT NULL,      /*發票號碼，不開發票時固定為「0000000000」*/
    PLU_MagNo           VARCHAR(20)        NOT NULL,      /*商品管理編號(商品貨號)*/
    PLU_No              VARCHAR(13)        NOT NULL,      /*國際條碼(商品條碼)*/
    VEN_No              VARCHAR(08)            NULL,      /*廠商編號*/
    CAT_LNo             VARCHAR(06)            NULL,      /*大分類編號*/
    CAT_MNo             VARCHAR(06)            NULL,      /*中分類編號*/
    CAT_SNo             VARCHAR(06)            NULL,      /*小分類編號*/
    TXN_Qty             DECIMAL(08)        NOT NULL,      /*數量*/
    PLU_FixPrc          DECIMAL(14,4)      NOT NULL,      /*定價*/
    PLU_SalePrc         DECIMAL(14,4)      NOT NULL,      /*售價*/
    TXN_Disc            DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*折扣總額(負數)，TXN_DiscS + TXN_DiscM + TXN_DiscT + TXN_DiscP + TXN_DiscD + TXN_RebateS + TXN_RebateT + TXN_PayScoreAmt */
    TXN_DiscS           DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*人工折扣(負數)*/
    TXN_DiscM           DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*會員折扣(負數)*/
    TXN_DiscT           DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*總合折扣(負數)*/
    TXN_DiscP           DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*促銷折扣(負數)*/
    TXN_DiscD           DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*類別折扣(負數)*/
    TXN_RebateS         DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*單項折讓(負數)*/
    TXN_RebateT         DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*小計折讓(負數)*/
    TXN_MINUS_GM_Amt    DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*折價券扣減銷項金額*/
    TXN_Coup_Disc_Amt   DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*折價券金額*/
    TXN_SaleAmt         DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*銷售金額=應稅銷售金額+免稅銷售金額*/
    TXN_SaleTax         DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*應稅銷售金額=未稅銷售金額+稅額*/
    TXN_SaleNoTax       DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*免稅銷售金額*/
    TXN_Net             DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*未稅銷售金額*/
    TXN_Tax             DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*稅額*/
    TXN_HealthAmt       DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*健康捐金額=健康捐單價X數量*/
    TXN_ExtraAmt        DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*代收代售銷售金額*/
    PLU_TaxType         CHAR(01)           NOT NULL,      /*稅別，0=免稅、1=應稅*/

    MAM_No              VARCHAR(16)            NULL,      /*促銷編號*/
    MAM_Condition       DECIMAL(08)            NULL,      /*促銷數量*/
    MAM_TotAmt          DECIMAL(14,4)          NULL,      /*促銷總價*/
    MAM_CombNo          VARCHAR(20)            NULL,      /*組合編號*/
    MAM_CombGrp         VARCHAR(06)            NULL,      /*組合群組*/
    MAM_Method          VARCHAR(02)            NULL,      /*促銷方式*/
    TXN_Ref             VARCHAR(64)            NULL,      /*參考號碼*/
    TXN_AuthNo          VARCHAR(16)            NULL,      /*授權編號*/
    TXN_AuthReason      VARCHAR(02)            NULL,      /*授權原因*/
    TXN_Mode            CHAR(01)           NOT NULL,      /*交易模式(同POS5006)*/
    TXN_Status          CHAR(01)           NOT NULL,      /*交易狀態(同POS5006)*/
    MAM_UnitPrc         DECIMAL(14,4)          NULL,      /*促銷單價*/
    PLU_Disc            CHAR(01)               NULL,      /*是否可折扣(Y/N)*/
    TXN_Ret_Cod         VARCHAR(02)            NULL,      /*退貨原因，0=預設退貨、X=系統折價券、Y=被更正、Z=更正、S=銷退*/
    TXN_Except_Sta      VARCHAR(02)            NULL,      /*例外註記，N=正常、P=更改售價、F=強制輸入、G=自帶價格條碼、#=更正*/
    PLU_Type            VARCHAR(02)            NULL,      /*商品類別*/
    PLU_Name            NVARCHAR(60)           NULL,      /*商品名稱*/
    PLU_Set_Code        VARCHAR(02)            NULL,      /*組合商品類別*/
    PLU_Gift            VARCHAR(02)            NULL,      /*[未使用]*/
    PLU_Source          CHAR(01)               NULL,      /*是否為自製品-未使用，0=其他、1=自製、2=OEM、3=外購、4=自行進口、5=代工、6=煙酒*/
    TXN_ActualPrc       DECIMAL(14,4)          NULL,      /*實際售價*/
    TXN_Type            VARCHAR(04)            NULL,      /*銷售類別*/

    TXN_DiscMebDiv      DECIMAL(10,2)          NULL,      /*會員折扣分攤金額(負數)[未使用]*/
    MAS_No              VARCHAR(20)            NULL,      /*會員活動編號[未使用]*/
    TXN_DownMarginAmt   DECIMAL(14,4)          NULL,      /*會員積分扣抵扣減銷項金額[未使用]*/
    TXN_PayScoreAmt     DECIMAL(14,4)          NULL,      /*會員積分扣抵金額[未使用]*/
    TXN_PayScore        DECIMAL(14,4)          NULL,      /*會員積分扣抵[未使用]*/
    TXN_UseSalePrc      CHAR(01)               NULL,      /*是否使用原價(Y/N)*/

    MAM_UseScore        DECIMAL(14,4)          NULL,      /*扣抵點數[未使用]*/
    MAM_DoScore         CHAR(01)               NULL,      /*是否計算點數(Y/N)[未使用]*/
    MAM_MultiScore      DECIMAL(14,4)          NULL,      /*計算積點金額倍數[未使用]*/
    MAM_GiftScore       DECIMAL(14,4)          NULL,      /*贈送積點[未使用]*/

    PLU_Health          CHAR(01)               NULL,      /*是否有健康捐(Y/N)*/
    PLU_HealthPrc       DECIMAL(14,4)          NULL,      /*健康捐單價*/
    PLU_HealthBegDate   DATETIME               NULL,      /*健康捐有效開始日期*/
    PLU_HealthEndDate   DATETIME               NULL,      /*健康捐有效結束日期*/

    PLU_TaxRate         DECIMAL(7,4)           NULL,      /*稅率*/

    TLT_No              VARCHAR(12)            NULL,      /*專櫃編號*/
    Contract_No         VARCHAR(12)            NULL,      /*專櫃合約編號*/
    Contract_SubNo      VARCHAR(04)            NULL,      /*專櫃合約附號*/
    Talent_ID           DECIMAL(19,0)          NULL,      /*專櫃合約編號系統 ID*/
    TLT_ID              CHAR(01)               NULL,      /*分類抽成類別，TLTTALENT_CHARGEM.TLT_ID*/
    TXN_DiscCode        VARCHAR(06)            NULL,      /*專櫃折數代碼，預設值為000，代表正品*/

	PRM_PLU_MagNo       VARCHAR(20)            NULL,      /*修正前-商品管理編號*/
	PRM_TLT_No          VARCHAR(12)            NULL,      /*修正前-專櫃編號*/
	PRM_Talent_ID       DECIMAL(19,0)          NULL,      /*修正前-專櫃合約編號系統 ID*/
	PRM_TLT_ID          CHAR(01)               NULL,      /*修正前-分類抽成類別，TLTTALENT_CHARGEM.TLT_ID*/
    PRM_TXN_DiscCode    VARCHAR(06)            NULL,      /*修正前-專櫃折數代碼，預設值專櫃折數代碼*/

    CRT_Date            DATETIME               NULL,      /*建立日期*/
    UPD_Date            DATETIME               NULL,      /*變更日期*/

    CONSTRAINT PK_POS5007 PRIMARY KEY CLUSTERED (ID)
)
END
