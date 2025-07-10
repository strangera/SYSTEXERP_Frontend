/*POS5006 銷售主檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS5006')
BEGIN
CREATE TABLE POS5006
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    MID                 DECIMAL(19) DEFAULT 0 NOT NULL,   /*商戶編號*/
    SYS_StoreNo         VARCHAR(10)        NOT NULL,      /*門市店號*/
    TXN_Date            DATE               NOT NULL,      /*交易日期*/
    ECR_No              VARCHAR(10)        NOT NULL,      /*收銀機號*/
    TXN_No              DECIMAL(08)        NOT NULL,      /*交易序號*/
    TXN_Time            DATETIME           NOT NULL,      /*交易時間*/
    USR_No              VARCHAR(16)        NOT NULL,      /*收銀員號碼*/
    TXN_Uniform         VARCHAR(08)            NULL,      /*統一編號*/
    TXN_MemCard         VARCHAR(30)            NULL,      /*會員卡號碼*/
    TXN_GUIPaper        CHAR(01)           NOT NULL,      /*發票聯數，2=二聯式、3=三聯式、N=免開發票、E=電子發票、 R=退貨(不開立折讓單)、C=折讓單*/
    TXN_GUIBegNo        VARCHAR(10)        NOT NULL,      /*起始發票號碼*/
    TXN_GUIEndNo        VARCHAR(10)            NULL,      /*結束發票號碼*/
    TXN_GUICnt          DECIMAL(02)        NOT NULL,      /*發票號碼張數*/
    TXN_TotQty          DECIMAL(08)        NOT NULL,      /*總數量*/
    TXN_TotDisc         DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*折扣總額(負數)，TXN_TotDiscS + TXN_TotDiscM + TXN_TotDiscT + TXN_TotDiscP + TXN_TotDiscD + TXN_TotRebateS + TXN_TotRebateT + TXN_PayScoreAmt */
    TXN_TotDiscS        DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*總人工折扣(負數)，POS5007.TXN_DiscS 的加總*/
    TXN_TotDiscM        DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*總組合折扣(負數)*/
    TXN_TotDiscT        DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*總總合折扣(負數)*/
    TXN_TotDiscP        DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*總促銷折扣(負數)*/
    TXN_TotDiscD        DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*類別折扣總額(負數)*/
    TXN_TotRebateS      DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*總單項折讓(負數)*/
    TXN_TotRebateT      DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*總小計折讓(負數)*/
    TXN_TotMinusAmt     DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*折價券扣減總額(負數)，POS5007.TXN_MINUS_GM_Amt 的加總*/
    TXN_TotSaleAmt      DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*總銷售金額=總應稅銷售金額+總免稅銷售金額*/
    TXN_TotSaleTax      DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*總應稅銷售金額=總未稅銷售金額+總稅額*/
    TXN_TotSaleNoTax    DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*總免稅銷售金額*/
    TXN_TotNet          DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*總未稅銷售金額*/
    TXN_TotTax          DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*總稅額*/
    TXN_TotGUI          DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*總發票金額=總發票應稅金額+總發票免稅金額*/
    TXN_TotGUISaleTax   DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*總發票應稅金額*/
    TXN_TotGUISaleNoTax DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*總發票免稅金額*/
    TXN_TotHaveTax      DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*總已稅金額*/
    TXN_TotOver         DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*總溢收金額*/
    TXN_TotHealthAmt    DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*總健康捐金額*/
    TXN_TotExtraAmt     DECIMAL(14,4) DEFAULT 0 NOT NULL,      /*代收代售銷售總額*/
    TXN_DtlCnt          DECIMAL(04)   DEFAULT 0 NOT NULL,      /*明細項數*/
    TXN_PayCnt          DECIMAL(04)   DEFAULT 0 NOT NULL,      /*付款項數*/
    TXN_CustCnt         DECIMAL(04)   DEFAULT 0 NOT NULL,      /*來客數*/
    TXN_EntryDT         DATE                   NULL,      /*補輸入日期，YYYY/MM/DD*/
    TXN_Mode            CHAR(01)           NOT NULL,      /*交易模式，R=收銀、E=補輸入、T=訓練、P=事後登錄*/
    TXN_Status          CHAR(01)           NOT NULL,      /*交易狀態，N=正常交易、C=交易取消、D=發票作廢、E=隔日發票作廢*/
    TXN_VIP             CHAR(01)           NOT NULL,      /*外交官交易，Y=是、N=否*/
    TXN_ShiftNo         VARCHAR(02)        NOT NULL,      /*班別*/
    TXN_TotPayAmt       DECIMAL(14,4)      NOT NULL,      /*總付款金額*/
    TXN_PreOrderNo      VARCHAR(40)            NULL,      /*預購單號*/
    ORG_SYS_StoreNo     VARCHAR(10)            NULL,      /*原始店號*/
    ORG_TXN_Date        DATE                   NULL,      /*原始交易日期*/
    ORG_ECR_No          VARCHAR(10)            NULL,      /*原始收銀機號*/
    ORG_TXN_No          DECIMAL(06)            NULL,      /*原始交易序號*/
    ORG_TXN_GUINo       VARCHAR(10)            NULL,      /*原始交易發票號碼*/
    TXN_VoidStoreNo     VARCHAR(10)            NULL,      /*發票作廢店號*/
    TXN_VoidDT          DATE                   NULL,      /*發票作廢日期*/
    TXN_VoidEcrNo       VARCHAR(06)            NULL,      /*發票作廢收銀機號*/
    TXN_VoidTxnNo       DECIMAL(06)            NULL,      /*發票作廢交易序號*/
    TXN_VoidTime        DATETIME               NULL,      /*發票作廢時間*/
    TXN_VoidShiftNo     VARCHAR(02)            NULL,      /*發票作廢班別*/
    TXN_VoidUsrNo       VARCHAR(08)            NULL,      /*發票作廢人員號碼*/
    TXN_TakeVoidDT      DATETIME               NULL,      /*取貨作廢日期*/
    TXN_Ret_No          VARCHAR(20)            NULL,      /*折讓單號，若為開立折讓單則需記錄折讓單號*/
    TXN_TaxType         CHAR(01)               NULL,      /*交易稅別，0=免稅、1=應稅、2=零稅*/
    TXN_Ret_PrnNo       VARCHAR(16)            NULL,      /*銷退單號，若為退貨交易且不開立折讓單則需記錄銷退單號*/
    TXN_Desc            VARCHAR(20)            NULL,      /*交易註記*/
    TXN_CustType        VARCHAR(06)            NULL,      /*交易客層*/
    TXN_OrgTime         DATETIME               NULL,      /*原始交易時間*/
    TXN_SaleNoteNo      VARCHAR(30)            NULL,      /*銷貨單號，SA + 交易日期YYMMDD + 機號 + 流水號6碼*/
    TXN_Sales           VARCHAR(20)            NULL,      /*銷貨員*/
    TXN_MemID           VARCHAR(20)            NULL,      /*會員識別碼*/
    MEB_Type            VARCHAR(02)            NULL,      /*會員卡別*/
    TXN_VIP_Disc        DECIMAL(04)            NULL,      /*[未使用]*/
    TXN_TotScore        DECIMAL(14,4)          NULL,      /*交易會員積點[未使用]*/
    TXN_TotScoreAmt     DECIMAL(14,4)          NULL,      /*交易會員積點金額[未使用]*/
    TXN_TotPayScore     DECIMAL(14,4)          NULL,      /*會員點數扣抵(負項)*/
    TXN_TotPayScoreAmt  DECIMAL(14,4)          NULL,      /*會員點數扣抵金額(負項)*/
    TXN_PrintTimes      DECIMAL(02)            NULL,      /*列印次數*/
    TXN_GUI_Flag        CHAR(01)               NULL,      /*發票註記*/
    TXN_GUIItemCnt      DECIMAL(04)            NULL,      /*發票列印項數，POS30061的筆數*/
    TXN_GUIVehicle      VARCHAR(20)            NULL,      /*電子發票共通載具編號*/
    TXN_GUIRemark       VARCHAR(10)            NULL,      /*電子發票隨機碼4碼*/
    STO_Uniform         VARCHAR(10)            NULL,      /*本店統一編號*/
    TXN_GUILoveCode     VARCHAR(20)            NULL,      /*電子發票愛心碼*/
    TXN_GUI_CarrType    VARCHAR(06)            NULL,      /*電子發票載具類別，悠遊載具卡=1K0001、手機條碼=3J0002、自然人憑證=CQ0001、一卡通載具=1H0001、信用卡載具=EK0002、#=取消載具*/
    TXN_GUI_CarrId      VARCHAR(64)            NULL,      /*電子發票載具ID隱碼，CarrierId2載具隱碼id 信用卡=信用卡加密卡號50碼*/
    TXN_GUI_CarrIdEx    VARCHAR(64)            NULL,      /*電子發票載具ID顯碼，CarrierId1載具顯碼id 信用卡=刷卡日期(民國年月日7碼)刷卡金額(右靠左補0共10碼) */
    TLT_No              VARCHAR(12)            NULL,      /*專櫃編號*/
    Contract_No         VARCHAR(12)            NULL,      /*專櫃合約編號*/
    Contract_SubNo      VARCHAR(04)            NULL,      /*專櫃合約附號*/
    Talent_ID           DECIMAL(19,0)          NULL,      /*專櫃合約編號系統 ID*/
    TXN_PkngUID         VARCHAR(20)            NULL,      /*停車票卡、車牌*/
    SAL_Type            VARCHAR(08)            NULL,      /*交易來源別，空白=收銀機(預設值)、POS=收銀機、APP=會員APP系統、PKNG=停車管理系統、CPN=環友票券系統*/
    TXN_PreOrder        CHAR(01)               NULL,      /*預售註記，Y=是、N=否*/
    ECR_LocNo           VARCHAR(10)            NULL,      /*店位代碼，POS2002.Location_No*/
    TXN_TaxFreeCertNo   VARCHAR(10)            NULL,      /*免稅證證號*/
    TXN_TotTaxAlwnc     DECIMAL(12,4)          NULL,      /*備抵總稅額*/
	PRM_TLT_No          VARCHAR(12)            NULL,      /*修正前-專櫃編號*/
	PRM_Talent_ID       DECIMAL(19,0)          NULL,      /*修正前-專櫃合約編號系統 ID*/
    CRT_Date            DATETIME               NULL,      /*建立日期*/
    UPD_Date            DATETIME               NULL,      /*變更日期*/

    CONSTRAINT PK_POS5006 PRIMARY KEY CLUSTERED (ID)
)
END
