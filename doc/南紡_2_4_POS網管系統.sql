/*-------------------------------------------------------------------------*/
/* 南紡購物中心 TSRD                                                         */
/* Date: 2025/07/04                                                        */
/*-------------------------------------------------------------------------*/
/*POS1001    系統門市主檔*/
/*POS10015   門市系統主機設定檔 */
/*POS1002    收銀機設定檔 */
/*POS1002EDC 收銀機EDC設定檔 */
/*POS1002SCH 收銀機設定排程檔 */
/*POS1002TML 收銀機週邊設定模版檔 */
/*POS1002GRM 收銀機群組主檔 */
/*POS1002GRD 收銀機群組明細檔 */
/*POS1003    收銀機狀態檔 */
/*POS1004M   鍵盤設定主檔 */
/*POS1004    鍵盤設定明細檔 */
/*POS1006    付款別設定檔*/
/*POS1007    收銀功能代碼檔*/
/*POS1008    螢幕按鍵設定檔*/
/*POS1009    系統參數設定檔 */

/*POS1013    收銀機即時狀態檔*/
/*POS1017    發票範圍設定檔*/
/*POS10171   分店發票範圍設定檔*/
/*POS10172   社福團體代碼檔*/
/*POS1018    發票設定明細檔 */

/*POS1027M 收銀菜單主檔*/

/*POS2001    收銀員設定檔*/
/*POS2002    店位基本資料檔*/
/*POS2004    商品基本資料檔(收銀系統專用與後台系統的欄位有差異) */
/*POS2005    商品條碼資料*/
/*TLTTALENT  專櫃主檔(收銀系統專用與後台系統的欄位有差異)*/
/*TLTTALENT_CHARGEM 專櫃抽成主檔(收銀系統專用與後台系統的欄位有差異)*/
/*TLTTALENT_CHARGED 專櫃抽成明細檔(收銀系統專用與後台系統的欄位有差異)*/

/*POS5006    銷售主檔*/
/*POS5007    銷售商品明細檔*/
/*POS5008    銷售付款明細檔*/
/*POS3012    交易紀錄檔*/
/*POS3017    即時銷售禮券明細檔*/
/*POS3021    發票列印活動說明檔*/
/*POS7004    非銷售資料記錄檔*/
/*ECS3008    電子支付交易檔*/

/*POS6104    宜睿智慧-即享券每日對帳檔*/
/*POS6107    PayEasy 對帳檔*/
/*POS6111    LINE Pay 交易銷帳明細檔*/
/*POS6112    iPASS Money 交易銷帳明細檔*/
/*POS6115    街口支付店家撥款檔(R檔) */
/*POS6117    一卡通扣值交易比對結果明細檔(EVCR)(EACR) */
/*POS6118    聯信特店MIS LOG檔案 */
/*POS6119    中信信用卡帳務檔*/
/*POS6119P   中信信用卡帳務檔-停車場*/
/*POS6120    台新入金機匯入記錄明細檔*/
/*POS6121    台新入金機匯入記錄明細檔*/
/*LOG3001    實收資料處理記錄檔(待設計)*/

/*POS3001    收銀員交班檔 */
/*POS3002    收銀機財務日檔 */
/*POS3006    發票開立統計檔 */
/*POS30061   發票列印記錄檔 */
/*POS3006D   發票狀態異動檔 */

/*DSC2010    停車折抵時數設定檔 */

/*POS5035    傳輸記錄檔*/
/*POS5038    交易序號編號檔*/

/*IMG1001    圖檔設定主檔*/

/*SYS1000M   系統代碼主檔*/
/*SYS1000    系統代碼檔*/
/*SYS1001    程式執行記錄檔*/
/*SYS1002    程式版本檔*/

/*POS8011H   電子發票資料處理歷史檔*/

/*DEFTBL     表格定義檔*/
/*DEFFLD     欄位定義檔*/
/*DEFKEY     鍵值定義檔*/

/*POS80054   資料轉出設定檔*/
/*POS80055   資料轉出設定紀錄檔*/

/* 異動紀錄

2025-04-23
1.所有 TXN_Date 欄位的資料型態由 DATETIME 調整為 DATE
2.所有 TXN_VoidDT 欄位的資料型態由 DATETIME 調整為 DATE
3.所有 USR_No 欄位長度由 8 碼調整為 16 碼

2025-04-24
1.修改 POS5006 銷售主檔新增欄位 TXN_TotDisc 折扣總額(負數)，該筆交易所有折扣金額的合計
2.修改 POS5006 銷售主檔新增欄位 TXN_TotMinusAmt 折價券扣減總額(負數)，POS5007.TXN_MINUS_GM_Amt 的加總
3.修改 POS5006 銷售主檔新增欄位 TXN_TotGUISaleNoTax 總發票免稅金額
4.所有 TXN_Mode 資料類型調整為 CHAR(01)
5.所有 TXN_Status 資料類型調整為 CHAR(01)
6.欄位 PLU_TaxType、PAY_TaxType、TXN_TaxType 資料類型調整為 CHAR(01)
7.修改 POS5007 銷售商品明細檔，刪除欄位 TXN_GUIPageNo 發票頁數

2025-04-29
1.修改 POS1002EDC 收銀機EDC設定檔刪除欄位 ECR_TLT_No 機台所屬專櫃編號
2.修改 POS1002EDC 收銀機EDC設定檔刪除欄位 ECR_TLT_Name 機台所屬專櫃名稱
3.修改 POS2001 收銀員設定檔調整欄位 USR_Name 收銀員姓名 的長度改為60碼
4.修改 POS1013 收銀機即時狀態檔 調整欄位 USR_Name 收銀員姓名 的長度改為60碼

2025-04-30
1.修改 POS1002 收銀機設定檔，修改欄位名成 ECR_CashD1Com 為 ECR_DrawerCom
2.修改 POS1002TML 收銀機週邊設定模版檔，修改欄位名成 ECR_CashD1Com 為 ECR_DrawerCom

2025-05-02
1.修改 POS1017 發票範圍設定檔新增欄位 GUI_VERIFY1_Name 設定確認人員一姓名
2.修改 POS1017 發票範圍設定檔新增欄位 GUI_VERIFY2_Name 設定確認人員二姓名
3.修改 POS1002 收銀機設定檔，新增欄位 SYS_SrvNo 主機編號

2025-05-04
1.新增 POS6118 聯信特店MIS LOG檔案
2.修改 POS5006 銷售主檔新增欄位 ECR_LocNo 店位代碼

2025-05-05
1.新增 POS6104 宜睿智慧-即享券每日對帳檔
2.新增 POS6107 PayEasy 對帳檔
3.新增 POS6119 中信信用卡帳務檔
4.新增 POS6119P 中信信用卡帳務檔-停車場
5.新增 POS6119 POS6120 台新入金機匯入記錄明細檔

2025-05-06
1.修改 POS80054 資料轉出設定檔，欄位 EXP_DataFlag 長度調整為8碼
2.修改 POS80055 資料轉出設定記錄檔，欄位 EXP_DataFlag 長度調整為8碼

2025-05-09
1.修改 POS1002 收銀機設定檔，新增欄位 ECR_RestoreVoid 是否允許回復已作廢交易(Y/N)，預設值為N
2.修改 POS1002 收銀機設定檔，新增欄位 ECR_MSR MSR型態，預設值空白代表未設定
3.修改 POS1002 收銀機設定檔，新增欄位 ECR_MSRCom MSR連接埠，預設值為0(未啟用)
4.修改 POS1002 收銀機設定檔，新增欄位 ECR_OrderPrn 訂單印表機型態，預設值空白代表未設定
5.修改 POS1002 收銀機設定檔，新增欄位 ECR_OrderPrnCom 訂單印表機連接埠，預設值為0(未啟用)
6.修改 POS1002TML 收銀機週邊設定模版檔，新增欄位 ECR_RestoreVoid 是否允許回復已作廢交易(Y/N)，預設值為N
7.修改 POS1002TML 收銀機設定檔，新增欄位 ECR_MSR MSR型態，預設值空白代表未設定
8.修改 POS1002TML 收銀機設定檔，新增欄位 ECR_MSRCom MSR連接埠，預設值為0(未啟用)
9.修改 POS1002TML 收銀機週邊設定模版檔，新增欄位 ECR_OrderPrn 訂單印表機型態，預設值空白代表未設定
10.修改 POS1002TML 收銀機週邊設定模版檔，新增欄位 ECR_OrderPrnCom 訂單印表機連接埠，預設值為0(未啟用)
11.修改 POS1002 收銀機設定檔，新增欄位 ECR_SrvName 收銀機後台主機名稱，POS10015.SYS_SrvName)

2025-05-17
1.修改 POS5006 銷售主檔，新增欄位 TXN_TaxFreeCertNo 免稅證證號
2.修改 POS1018 發票設定明細檔，修改欄位名稱由 POS_NOS 改為 ECR_No
3.修改 POS1018 發票設定明細檔，修改欄位名稱由 STATUS 改為 GUI_Status
4.修改 POS5006 銷售主檔，修改欄位名稱由 TXN_Score 改為 TXN_TotScore
5.修改 POS5006 銷售主檔，修改欄位名稱由 TXN_ScoreAmt 改為 TXN_TotScoreAmt
6.修改 POS5006 銷售主檔，修改欄位名稱由 TXN_PayScore 改為 TXN_TotPayScore
7.修改 POS5006 銷售主檔，修改欄位名稱由 TXN_PayScoreAmt 改為 TXN_TotPayScoreAmt
9.修改 POS5007 銷售商品明細檔，修改欄位名稱由 TXN_PayQuart 改為 TXN_PayScore
9.修改 POS5007 銷售商品明細檔，修改欄位名稱由 TXN_PayQuartAmt 改為 TXN_PayScoreAmt
10.修改 POS5007 銷售商品明細檔，新增欄位 TXN_Disc 折扣總額(負數)，TXN_DiscS + TXN_DiscM + TXN_DiscT + TXN_DiscP + TXN_DiscD + TXN_RebateS + TXN_RebateT + TXN_PayScoreAmt

2025-05-18
1.所有 交易序號 欄位 TXN_No 由 DECIMAL(06) 修改為 DECIMAL(08)

2025-05-19
1.修改 POS5007 銷售商品明細檔，刪除欄位 TXN_VIP 外交官交易
2.修改 POS2004 商品基本資料檔，新增欄位 PLU_StopSale 停止銷售註記(Y/N)
3.修改 POS2004 商品基本資料檔，新增欄位 PLU_StopSaleDate 停止銷售日期

2025-05-20
1.修改 POS5007 銷售商品明細檔，刪除欄位 TXN_TermType
2.修改 POS5007 銷售商品明細檔，新增欄位 TLT_ID
3.修改 POS5007 銷售商品明細檔，欄位 TXN_AuthNo 長度改為16個字元

2025-06-02
1.修改 POS1002 收銀機設定檔，新增欄位 SYS_SRVDDirClt 前台系統下載目錄，預設值為 /MyPOSData/PosDown
2.修改 POS1002 收銀機設定檔，新增欄位 SYS_SRVUDirClt 前台系統上傳目錄，預設值為 /MyPOSData/PosUp

2025-06-03
1.修改 ECS3008 電子支付交易檔，新增欄位 PAY_No 付款編號，POS5006.PAY_No
2.修改 POS6104 宜睿智慧-即享券每日對帳檔，新增欄位 PAY_No 付款編號，POS5006.PAY_No
3.修改 POS6107 PayEasy 對帳檔，新增欄位 PAY_No 付款編號，POS5006.PAY_No

2025-06-12
1.修改 IMG1001 圖檔設定主檔，欄位 IMG_Path 圖檔路徑 資料型態由 VARCHAR 調整為 NVARCHAR
2.修改 IMG1001 圖檔設定主檔，欄位 IMG_File 圖檔檔名 資料型態由 VARCHAR 調整為 NVARCHAR
3.修改 POS5007 銷售商品明細檔，新增欄位 ACT_DiscCode 歸屬專櫃折數代碼，預設值專櫃折數代碼

2025-06-18
1.修改 POS5006 銷售主檔，新增欄位 MID 商戶編號
2.修改 POS5007 銷售商品明細檔，新增欄位 MID 商戶編號
3.修改 POS5007 銷售商品明細檔，調整欄位 PLU_Name 長度為60碼
4.修改 POS5008 銷售付款明細檔，新增欄位 MID 商戶編號
5.修改 POS5008 銷售付款明細檔，新增欄位 EDC_InstHeadAmt 分期付款-首期金額
6.修改 POS5008 銷售付款明細檔，新增欄位 EDC_InstEachAmt 分期付款-每期金額

2025-06-21
1.修改 POS10015 門市系統主機設定檔，新增欄位 MID 商戶編號
2.修改 POS1002 收銀機設定檔，新增欄位 MID 商戶編號
3.修改 POS1002EDC 收銀機EDC設定檔，新增欄位 MID 商戶編號
4.修改 POS1002TML 收銀機週邊設定模版檔，新增欄位 MID 商戶編號
5.修改 POS1002SCH 收銀機設定排程檔，新增欄位 MID 商戶編號
6.修改 POS30061 發票列印記錄檔，新增欄位 MID 商戶編號
7.修改 POS5008 銷售付款明細檔，新增欄位 TXN_BalBeforePay 交易前餘額
8.修改 POS5008 銷售付款明細檔，新增欄位 TXN_BalAfterPay 交易後餘額
9.修改 POS5008 銷售付款明細檔，新增欄位 TXN_AutoloadAmt 自動加值金額
10.修改 POS5008 銷售付款明細檔，調整欄位 EDC_RRN 長度為64碼

2025-06-25
1.修改 POS5008 銷售付款明細檔，新增欄位 VOU_Check 有價券兌回方式，1=連線、2=離線、3=大宗兌回

2025-06-30
1.修改 POS1013 收銀機即時狀態檔，新增欄位 ECR_Type 機台類型，1=集中機台(統收)、2=專櫃機台(自收)、5=離線機台(不開立業主發票、不使用業主機台)、7=它社機台(開立業主發票、不使用業主機台)

2025-07-04
1.修改 POS5006 銷售主檔，新增欄位 PRM_TLT_No 修正前-專櫃編號
2.修改 POS5006 銷售主檔，新增欄位 PRM_Talent_ID 修正前-專櫃合約編號系統 ID
3.修改 POS5007 銷售商品明細檔，新增欄位 PRM_PLU_MagNo 修正前-商品管理編號
4.修改 POS5007 銷售商品明細檔，新增欄位 PRM_TLT_No 修正前-專櫃編號
5.修改 POS5007 銷售商品明細檔，新增欄位 PRM_Talent_ID 修正前-專櫃合約編號系統 ID
6.修改 POS5007 銷售商品明細檔，新增欄位 PRM_TLT_ID 修正前-分類抽成類別，TLTTALENT_CHARGEM.TLT_ID
7.修改 POS5007 銷售商品明細檔，新增欄位 PRM_TXN_DiscCode PRM_TXN_DiscCode
8.修改 POS5008 銷售付款明細檔，新增欄位 PRM_PAY_No 修正前-付款編號，POS1006.PAY_No


*/

/* POS1001 系統門市主檔(收銀系統使用) */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS1001')
BEGIN
CREATE TABLE POS1001
(
    SYS_StoreNo         VARCHAR(10)        NOT NULL,     /*門市店號*/
    ECR_No              VARCHAR(10)        NOT NULL,     /*收銀機號*/
	STR_Uniform         VARCHAR(08)        NOT NULL,     /*統一編號*/
    SYS_StoreName       NVARCHAR(60)           NULL,     /*門市名稱*/
    SYS_StoreNameENG    VARCHAR(60)            NULL,     /*公司名稱(英文)*/

    SYS_Timeout         DECIMAL(06)            NULL,     /*TIME OUT 時間設定*/
    SYS_DateType        VARCHAR(20)        NOT NULL,     /*日期顯示模式*/
    SYS_NumType         VARCHAR(20)        NOT NULL,     /*數字顯示模式*/
    SYS_OutofPaper      DECIMAL(06)        NOT NULL,     /*提示(設定剩餘發票張數)*/
    SYS_UseDefGUI       VARCHAR(1)         NOT NULL,     /*使用發票預設號-不使用*/
    SYS_Precision       VARCHAR(10)        NOT NULL,     /*精度位數*/
    SYS_PrnGoods        VARCHAR(1)         NOT NULL,     /*商品列印欄位*/
    SYS_LOGOPATH        VARCHAR(100)           NULL,     /*商店LOGO圖檔存放路徑*/
    SYS_GUIPrnFlag      VARCHAR(1)         NOT NULL,     /*發票列印方式 1=逐筆 2=批次(預設值)*/
    SYS_AcceptMinus     VARCHAR(1)         NOT NULL,     /*是否接受負數金額*/
    SYS_NFPLU           VARCHAR(1)         NOT NULL,     /*未建檔商品是否銷售(Y=全店開放 N=全店不開放 E=依據收銀機設定)*/
    SYS_PREFIX          VARCHAR(30)            NULL,     /*生鮮條碼前置碼*/
    SYS_PLUNOLOC        DECIMAL(06)            NULL,     /*生鮮條碼之商品編號開始位置*/
    SYS_PRCLOC          DECIMAL(06)            NULL,     /*生鮮條碼之售價開始位置*/
    SYS_MBRDiscType     VARCHAR(1)         NOT NULL,     /*是否使用會員折扣 1=會員價 2=會員檔折扣率 3=固定會員折扣率 POS1001.SYS_MBRDiscRate 4=會員類別折扣*/
    SYS_MBRDiscRate     DECIMAL(06)        NOT NULL,     /*會員折扣率*/
    SYS_NFPLUDeptNo     VARCHAR(6)             NULL,     /*未建檔商品的部門預設值*/
    SYS_InputNFPDept    CHAR(1)                NULL,     /*是否輸入未建檔商品的部門*/
    SYS_DisplayCredit   VARCHAR(1)             NULL,     /*信用卡卡號顯示種類(0=全部顯示 1=顯示前後各四位)*/
    SYS_KeyboardAuth    VARCHAR(1)             NULL,     /*鍵盤權限('C'=依收銀員 'E'=依收銀機)*/
    SYS_RoundType       VARCHAR(1)             NULL,     /*四捨五入種類 0=全部捨去 1=全部進位 4=四捨五入*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS1001 PRIMARY KEY CLUSTERED (SYS_StoreNo)
)
END


/* POS1001 系統門市主檔 */
IF OBJECT_ID(N'dbo.POS1001', N'U') IS NULL
BEGIN
CREATE TABLE POS1001
(
    SYS_StoreNo         VARCHAR(10)        NOT NULL,     /*公司編號/店號*/
    STR_Uniform         VARCHAR(08)        NOT NULL,     /*統一編號*/
    SYS_StoreName       NVARCHAR(60)           NULL,     /*門市名稱*/
    SYS_StoreNameENG    VARCHAR(60)            NULL,     /*公司名稱(英文)*/
    STO_TaxNo           NVARCHAR(10)       NOT NULL,     /*稅籍編號*/
    STO_ManagerName     NVARCHAR(12)       NOT NULL,     /*負責人*/
    STO_ContactName     NVARCHAR(12)       NOT NULL,     /*聯絡人*/
    STO_ContactTel      VARCHAR(15)        NOT NULL,     /*聯絡人電話*/
    STO_ContactFax      VARCHAR(15)        NOT NULL,     /*聯絡人傳真*/
    STO_Addr            NVARCHAR(100)      NOT NULL,     /*公司(營業處)地址(中文)*/
    STO_AddrENG         VARCHAR(100)           NULL,     /*公司(營業處)地址(英文)*/
    STO_RegAddr         NVARCHAR(100)      NOT NULL,     /*公司登記地址(中文)*/
    STO_RegAddrENG      VARCHAR(100)           NULL,     /*公司登記地址(英文)*/
    STO_BRN             NVARCHAR(10)           NULL,     /*營業登記證號 (Business Registration Number)*/
    STO_Tel             VARCHAR(15)            NULL,     /*公司電話*/
    STO_Fax             VARCHAR(15)            NULL,     /*公司傳真*/
    STO_PostCode        VARCHAR(06)        NOT NULL,     /*郵遞區號*/
    STO_MailTel         VARCHAR(15)            NULL,     /*郵寄電話*/
    STO_MailFax         VARCHAR(15)            NULL,     /*郵寄傳真*/
    STO_MailAddr        NVARCHAR(100)          NULL,     /*郵寄地址*/
    STO_InvoiceAddr     NVARCHAR(100)          NULL,     /*發票地址*/
    STO_Email           VARCHAR(100)           NULL,     /*電子郵件*/
    STO_URL             NVARCHAR(100)          NULL,     /*公司網址*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS1001 PRIMARY KEY CLUSTERED (SYS_StoreNo)
)
END


/*POS10015 門市系統主機設定檔 */
IF OBJECT_ID(N'dbo.POS10015', N'U') IS NULL
BEGIN
CREATE TABLE POS10015
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
	MID                 DECIMAL(19) DEFAULT 0 NOT NULL,  /*商戶編號*/
    SYS_StoreNo         VARCHAR(10)        NOT NULL,     /*門市店號POS1001.SYS_StoreNo*/
    SYS_SrvNo           VARCHAR(08)        NOT NULL,     /*主機編號*/
    SYS_SrvIP           VARCHAR(40)        NOT NULL,     /*主機IP*/
    SYS_SrvPort         DECIMAL(06)        NOT NULL,     /*主機連接埠，預設值為20*/
    SYS_SrvStatus       VARCHAR(02)        NOT NULL,     /*主機狀態，A=啟用(預設值)、C=停用*/
    SYS_SrvName         NVARCHAR(40)           NULL,     /*主機名稱*/
    SYS_SrvUsrID        VARCHAR(20)            NULL,     /*主機登入帳號*/
    SYS_SrvUsrPwd       VARCHAR(20)            NULL,     /*主機登入密碼*/

    SYS_SRVDDir         VARCHAR(60)            NULL,     /*後台系統下載目錄，預設值為 /PosDown*/
    SYS_SRVUDir         VARCHAR(60)            NULL,     /*後台系統上傳目錄，預設值為 /PosUp*/
    SYS_MyPOSDDir       VARCHAR(60)            NULL,     /*傳輸程式下載目錄，預設值為 /MyPOSDown*/
    SYS_MyPOSUDir       VARCHAR(60)            NULL,     /*傳輸程式上傳目錄，預設值為 /MyPOSUp*/
    SYS_SRVDDirClt      VARCHAR(60)            NULL,     /*前台系統下載目錄，預設值為 /PosDown*/
    SYS_SRVUDirClt      VARCHAR(60)            NULL,     /*前台系統上傳目錄，預設值為 /PosUp*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS10015 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS10015_MST')
  CREATE UNIQUE INDEX IDX_POS10015_MST ON POS10015 (MID, SYS_StoreNo, SYS_SrvNo);

EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'SYS_StoreNo', '門市店號POS1001.SYS_StoreNo';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'SYS_SrvNo', '主機編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'SYS_SrvIP', '主機IP';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'SYS_SrvPort', '主機連接埠，預設值為20';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'SYS_SrvStatus', '主機狀態，A=啟用(預設值)、C=停用';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'SYS_SrvName', '主機名稱';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'SYS_SrvUsrID', '主機登入帳號';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'SYS_SrvUsrPwd', '主機登入密碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'SYS_SRVDDir', '後台系統下載目錄，預設值為/MyPOSData/PosDown';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'SYS_SRVUDir', '後台系統上傳目錄，預設值為/MyPOSData/PosUp';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'SYS_MyPOSDDir', '傳輸程式下載目，錄預設值為/MyPOSData/MyPOSDown';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'SYS_MyPOSUDir', '傳輸程式上傳目，錄預設值為/MyPOSData/MyPOSUp';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'SYS_SRVDDirClt', '前台系統下載目，錄預設值為/MyPOSData/PosDown';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'SYS_SRVUDirClt', '前台系統上傳目，錄預設值為/MyPOSData/PosUp';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'CRT_USR_No', '建立人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'CRT_USR_Name', '建立人員姓名';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'UPD_Date', '變更日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'UPD_USR_No', '變更人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS10015', 'UPD_USR_Name', '變更人員姓名';


/*POS1002 收銀機設定檔 */
IF OBJECT_ID(N'dbo.POS1002', N'U') IS NULL
BEGIN
CREATE TABLE POS1002
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
	MID                 DECIMAL(19) DEFAULT 0 NOT NULL,  /*商戶編號*/
    SYS_StoreNo         VARCHAR(10)        NOT NULL,     /*收銀機所屬門市店號*/
    ECR_No              VARCHAR(10)        NOT NULL,     /*收銀機號*/
    ECR_Name            NVARCHAR(20)       NOT NULL,     /*收銀機名稱*/
    ECR_Type            VARCHAR(02)        NOT NULL,     /*機台類型，1=集中機台(統收)、2=專櫃機台(自收)、5=離線機台(不開立業主發票、不使用業主機台)、7=它社機台(開立業主發票、不使用業主機台)*/
    ECR_TLT_No          VARCHAR(12)            NULL,     /*機台所屬專櫃編號，專櫃機台(自收)必須設定專櫃編號*/
    ECR_TLT_Name        NVARCHAR(60)           NULL,     /*機台所屬專櫃名稱*/
    ECR_USR_No          VARCHAR(16)            NULL,     /*機台所屬收銀員，集中收銀(統收)必須設定收銀員*/
    ECR_USR_Name        NVARCHAR(20)           NULL,     /*機台所屬收銀員姓名*/
    ECR_ActiveDate      DATE                   NULL,     /*啟用日期，YYYY/MM/DD*/
    ECR_ExpireDate      DATE                   NULL,     /*到期日期，YYYY/MM/DD*/
    ECR_CloseDate       DATE                   NULL,     /*停用日期，YYYY/MM/DD*/
    ECR_Status          VARCHAR(02)            NULL,     /*收銀機狀態，A=啟用(預設值)、C=停用、S=強制停用、T=訓練*/
    ECR_Group           VARCHAR(20)            NULL,     /*群組，預設為空白(未使用)*/
    ECR_SubGroup        VARCHAR(20)            NULL,     /*次樓別，預設為空白(未使用)*/
    ECR_AreaNo          VARCHAR(06)            NULL,     /*區域代碼，預設為空白(未使用)*/
    ECR_LocNo           VARCHAR(10)            NULL,     /*店位代碼，POS2002.Location_No*/

    HOS_No              VARCHAR(10)            NULL,     /*倉庫編號*/
    ECR_SAL_Type        VARCHAR(08)            NULL,     /*機台用途別，空白=商場收銀機台(預設值)、PKNG=停車場機台、APP=會員APP、CPN=環友票券系統*/

    ECR_ComName         VARCHAR(64)            NULL,     /*收銀機電腦名稱*/
    ECR_IP              VARCHAR(20)            NULL,     /*收銀機網路IP*/
    SYS_SrvNo           VARCHAR(08)            NULL,     /*主機編號，POS10015.SYS_SrvNo*/
    ECR_SrvIP           VARCHAR(20)            NULL,     /*收銀機後台主機(POS Server)IP，POS10015.SYS_SrvIP*/
	ECR_SrvName         NVARCHAR(40)           NULL,     /*收銀機後台主機名稱，POS10015.SYS_SrvName*/
    SYS_SRVDDirClt      VARCHAR(60)            NULL,     /*前台系統下載目錄，預設值為 /MyPOSData/PosDown*/
    SYS_SRVUDirClt      VARCHAR(60)            NULL,     /*前台系統上傳目錄，預設值為 /MyPOSData/PosUp*/

    ECR_TmplNo          VARCHAR(08)            NULL,     /*周邊設定模版編號，POS1002TML.ECR_TmplNo 新增收銀機設定時會依照輸入的模版編號匯入模版的設定內容，但允許使用者修改匯入後的設定*/

    ECR_SernoType       CHAR(01)           NOT NULL,     /*交易序號模式，1=循環使用、2=每日重計(預設值)、3=每月重計*/
    ECR_GUI_Type        VARCHAR(02)        NOT NULL,     /*發票使用類別，00=不開發票、03=二聯式收銀機發票、07=電子發票(預設值) */
    ECR_TimeTickInvl    DECIMAL(06)        NOT NULL,     /*系統對時間隔(秒)，每 XXXXXX 秒鐘對時一次*/
    ECR_Interval        DECIMAL(06)        NOT NULL,     /*上下傳異動檔間隔(秒) 預設值為6*/
    ECR_MaxQty          DECIMAL(10,2)      NOT NULL,     /*單筆交易數量上限，0=不限制、預設值為999999*/
    ECR_MaxAmt          DECIMAL(10,2)      NOT NULL,     /*單筆交易金額上限，0=不限制、預設值為99999999*/
    ECR_MaxItemAmt      DECIMAL(10,2)      NOT NULL,     /*單一明細金額上限，0=不限制、預設值為99999999*/
    ECR_MaxDisc         DECIMAL(10,2)      NOT NULL,     /*單筆交易最大折扣比率限制，0=不限制、預設值為0*/
    ECR_EdcTimeout      DECIMAL(06)        NOT NULL,     /*信用卡刷卡機連線時限(秒)預設值為60*/
    ECR_EdcSettle       CHAR(01)           NOT NULL,     /*信用卡刷卡機連動日結(Y/N)，預設值為Y*/
    ECR_ForceInput      CHAR(01)           NOT NULL,     /*是否強制輸入付款金額(Y/N)，預設值為N*/
    ECR_CustCntEntry    CHAR(01)           NOT NULL,     /*是否輸入來客數(Y/N)，預設值為N*/
    ECR_CustTypeEntry   CHAR(01)           NOT NULL,     /*是否輸入客層(Y/N)，預設值為N*/
    ECR_ClerkEntry      CHAR(01)           NOT NULL,     /*是否強制輸入營業員(Y/N)，預設值為N*/
    ECR_ForceMember     CHAR(01)           NOT NULL,     /*是否強制輸入會員編號(Y/N)，預設值為N*/
    ECR_BoxReqCode      CHAR(01)           NOT NULL,     /*開抽屜是否輸入密碼(Y/N)，預設值為N*/

    /*報表列印設定*/
    ECR_SelfReport      CHAR(01)           NOT NULL,     /*是否執行自我報帳(Y/N)，預設值為Y*/
    ECR_SaleRpt1        CHAR(01)           NOT NULL,     /*是否列印收銀員交班表(Y/N)，預設值為Y*/
    ECR_SaleRpt2        CHAR(01)           NOT NULL,     /*是否列印收銀機財務報表(Y/N)，預設值為Y*/
    ECR_SaleRpt3        CHAR(01)           NOT NULL,     /*是否列印時段銷售報表(Y/N)，預設值為Y*/
    ECR_SaleRpt4        CHAR(01)           NOT NULL,     /*是否列印部門銷售報表(Y/N)，預設值為Y*/
    ECR_SaleRpt5        CHAR(01)           NOT NULL,     /*是否列印單品銷售報表(Y/N)，預設值為Y*/
    ECR_SaleRpt6        CHAR(01)           NOT NULL,     /*是否列印銷貨明細表(Y/N)，預設值為Y*/
    ECR_SaleRpt7        CHAR(01)           NOT NULL,     /*是否列印作廢明細表(Y/N)，預設值為Y*/
    ECR_SaleRpt8        CHAR(01)           NOT NULL,     /*是否列印自我報帳(現額報告)帳條(Y/N)，預設值為Y*/
    ECR_SaleRpt9        CHAR(01)           NOT NULL,     /*是否列印保全現金帳條(現金明細表)(Y/N)，預設值為Y*/
    ECR_SaleRpt10       CHAR(01)           NOT NULL,     /*保留(Y/N)，預設值為N*/
    ECR_PcashValid      CHAR(01)           NOT NULL,     /*零用金是否需要認證(Y/N)，預設值為N*/
    ECR_PickUpValid     CHAR(01)           NOT NULL,     /*中途取現是否需要認證(Y/N)，預設值為N*/
    ECR_ReprintGUI      CHAR(01)           NOT NULL,     /*是否允許執行補印發票(Y/N)，預設值為N*/

    ECR_PrnLogo         CHAR(01)               NULL,     /*是否列印商標(Y/N)，預設值為Y*/
    ECR_Logo1           VARCHAR(100)           NULL,     /*商標1 (店名)*/
    ECR_Logo2           VARCHAR(100)           NULL,     /*商標2 (地址)*/
    ECR_Logo3           VARCHAR(100)           NULL,     /*商標3 (電話)*/
    ECR_Logo4           VARCHAR(100)           NULL,     /*商標4 (統一編號)*/
    ECR_Logo5           VARCHAR(100)           NULL,     /*商標5*/
    ECR_Logo6           VARCHAR(100)           NULL,     /*商標6*/

    ECR_VoidTxn         CHAR(01)           NOT NULL,     /*是否允許作廢交易(Y/N)，預設值為Y*/
    ECR_VoidRstDay      DECIMAL(04)        NOT NULL,     /*作廢交易限制天數 預設值為0，設定N天的交易才允許執行作廢，若為零則代表不限制*/
    ECR_CreditNote      CHAR(01)           NOT NULL,     /*是否允許開立折讓單(Y/N) 預設值為N，開立電子發票才可以設定為開立折讓單*/
	ECR_RestoreVoid     CHAR(01)  DEFAULT 'N' NOT NULL,     /*是否允許回復已作廢交易(Y/N)，預設值為N*/
    ECR_GUI_PeriodQty   DECIMAL(08)            NULL,     /*機台每期電子發票預設配號數量，預設值為50，設定值必須為50的倍數*/
    ECR_GUI_MinQty      DECIMAL(08)            NULL,     /*機台電子發票最小安全存量，預設值為50，設定值必須為50的倍數*/
    ECR_SettleDD        VARCHAR(02)        NOT NULL,     /*清機提示日期 T=當天(預設值) N=隔天*/
    ECR_SettleHHNN      VARCHAR(04)        NOT NULL,     /*清機提示時間-時分 預設值為2330*/

    /*周邊設定*/
    /*輸入*/
    ECR_KBLevel         VARCHAR(06)            NULL,     /*機台鍵盤等級*/
    ECR_KBType          VARCHAR(06)            NULL,     /*鍵盤型態*/
    ECR_Scanner         VARCHAR(20)            NULL,     /*掃描器型態，預設值空白代表未設定*/
    ECR_ScannerCom      DECIMAL(02)            NULL,     /*掃描器連接埠，預設值為0(未啟用)*/
    ECR_MSR             VARCHAR(20)            NULL,     /*MSR型態，預設值空白代表未設定*/
    ECR_MSRCom          DECIMAL(02)            NULL,     /*MSR連接埠，預設值為0(未啟用)*/
    /*顯示*/
    ECR_ScrType         VARCHAR(20)            NULL,     /*收銀畫面樣式，連結 POS1008.TSB_Name*/
    ECR_CD              VARCHAR(20)            NULL,     /*客戶顯示器型態，預設值空白代表未設定*/
    ECR_CDCom           DECIMAL(02)            NULL,     /*客戶顯示器連接埠，預設值為0(未啟用)*/
    ECR_ExtScr          VARCHAR(20)            NULL,     /*收銀外接顯示器名稱，預設值空白代表未設定*/
    ECR_ExtScrCom       DECIMAL(02)            NULL,     /*收銀外接顯示器連接埠，預設值為0(未啟用)*/
     /*列印*/
    ECR_GUIPrn          VARCHAR(20)            NULL,     /*發票印表機型態，預設值空白代表未設定*/
    ECR_GUICom          DECIMAL(02)            NULL,     /*發票印表機連接埠，預設值為0(未啟用)*/
    ECR_SlipPrn         VARCHAR(20)            NULL,     /*收據印表機型態，預設值空白代表未設定*/
    ECR_SlipPrnCom      DECIMAL(02)            NULL,     /*收據印表機連接埠，預設值為0(未啟用)*/
    ECR_OrderPrn        VARCHAR(20)            NULL,     /*訂單印表機型態，預設值空白代表未設定*/
    ECR_OrderPrnCom     DECIMAL(02)            NULL,     /*訂單印表機連接埠，預設值為0(未啟用)*/
    ECR_LablePrn        VARCHAR(20)            NULL,     /*標籤印表機型態，預設值空白代表未設定*/
    ECR_LablePrnCom     DECIMAL(02)            NULL,     /*標籤印表機連接埠，預設值為0(未啟用)*/
     /*信用卡*/
     ECR_EDC             VARCHAR(20)            NULL,     /*信用卡刷卡機型態，預設值空白代表未設定*/
     ECR_EDCCom          DECIMAL(02)            NULL,     /*信用卡刷卡機連接埠，預設值為0(未啟用)*/
     ECR_EDC2            VARCHAR(20)            NULL,     /*第二台信用卡刷卡機型態，預設值空白代表未設定*/
     ECR_EDC2Com         DECIMAL(02)            NULL,     /*第二台信用卡刷卡機連接埠，預設值為0(未啟用)*/
     ECR_EDC3            VARCHAR(20)            NULL,     /*第三台信用卡刷卡機型態，預設值空白代表未設定*/
     ECR_EDC3Com         DECIMAL(02)            NULL,     /*第三台信用卡刷卡機連接埠，預設值為0(未啟用)*/
     /*電子票證、電子支付*/
     ECR_ElecSVCrdA      VARCHAR(20)            NULL,     /*悠遊卡，預設值空白代表未設定*/
     ECR_ElecSVCrdACom   DECIMAL(02)            NULL,     /*悠遊卡連接埠，預設值為0(未啟用)*/
     ECR_ElecSVCrdB      VARCHAR(20)            NULL,     /*一卡通，預設值空白代表未設定*/
     ECR_ElecSVCrdBCom   DECIMAL(02)            NULL,     /*一卡通連接埠，預設值為0(未啟用)*/
     ECR_ElecSVCrdC      VARCHAR(20)            NULL,     /*愛金卡，預設值空白代表未設定*/
     ECR_ElecSVCrdCCom   DECIMAL(02)            NULL,     /*愛金卡連接埠，預設值為0(未啟用)*/
     ECR_ElecPay         VARCHAR(20)            NULL,     /*電子支付，預設值空白代表未設定*/
     ECR_ElecPayCom      DECIMAL(02)            NULL,     /*愛金卡連接埠，預設值為0(未啟用)*/
     /*其他*/
     ECR_Drawer          VARCHAR(20)            NULL,     /*錢櫃型態，預設值空白代表未設定*/
     ECR_DrawerCom       DECIMAL(02)            NULL,     /*錢櫃連接埠，預設值為0(未啟用)*/
     ECR_Device1Name     VARCHAR(20)            NULL,     /*週邊裝置1 名稱，預設值空白代表未設定*/
     ECR_Device2Name     VARCHAR(20)            NULL,     /*週邊裝置2 名稱，預設值空白代表未設定*/
     ECR_Device1Com      DECIMAL(02)            NULL,     /*週邊裝置1 連接埠，預設值為0(未啟用)*/
     ECR_Device2Com      DECIMAL(02)            NULL,     /*週邊裝置2 連接埠，預設值為0(未啟用)*/
     ECR_Device3Name     VARCHAR(20)            NULL,     /*週邊裝置3 名稱，預設值空白代表未設定*/
     ECR_Device3Com      DECIMAL(02)            NULL,     /*週邊裝置3 連接埠，預設值為0(未啟用)*/
     ECR_Device4Name     VARCHAR(20)            NULL,     /*週邊裝置4 名稱，預設值空白代表未設定*/
     ECR_Device4Com      DECIMAL(02)            NULL,     /*週邊裝置4 連接埠，預設值為0(未啟用)*/
     ECR_Device5Name     VARCHAR(20)            NULL,     /*週邊裝置5 名稱，預設值空白代表未設定*/
     ECR_Device5Com      DECIMAL(02)            NULL,     /*週邊裝置5 連接埠，預設值為0(未啟用)*/
     ECR_Device6Name     VARCHAR(20)            NULL,     /*週邊裝置6 名稱，預設值空白代表未設定*/
     ECR_Device6Com      DECIMAL(02)            NULL,     /*週邊裝置6 連接埠，預設值為0(未啟用)*/
     ECR_Device7Name     VARCHAR(20)            NULL,     /*週邊裝置7 名稱，預設值空白代表未設定*/
     ECR_Device7Com      DECIMAL(02)            NULL,     /*週邊裝置7 連接埠，預設值為0(未啟用)*/
     ECR_Device8Name     VARCHAR(20)            NULL,     /*週邊裝置8 名稱，預設值空白代表未設定*/
     ECR_Device8Com      DECIMAL(02)            NULL,     /*週邊裝置8 連接埠，預設值為0(未啟用)*/
     ECR_Device9Name     VARCHAR(20)            NULL,     /*週邊裝置9 名稱，預設值空白代表未設定*/
     ECR_Device9Com      DECIMAL(02)            NULL,     /*週邊裝置9 連接埠，預設值為0(未啟用)*/
     ECR_Device10Name    VARCHAR(20)            NULL,     /*週邊裝置10 名稱，預設值空白代表未設定*/
     ECR_Device10Com     DECIMAL(02)            NULL,     /*週邊裝置10 連接埠，預設值為0(未啟用)*/

     CRT_Date            DATETIME               NULL,     /*建立日期*/
     CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
     CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
     UPD_Date            DATETIME               NULL,     /*變更日期*/
     UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
     UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS1002 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS1002_MST')
  CREATE UNIQUE INDEX IDX_POS1002_MST ON POS1002(MID, SYS_StoreNo, ECR_No);

EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'MID', '商戶編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'SYS_StoreNo', '收銀機所屬門市店號';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_No', '收銀機號';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Name', '收銀機名稱';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Type', '機台類型，1=集中機台(統收)、2=專櫃機台(自收)、5=離線機台(不開立業主發票、不使用業主機台)、7=它社機台(開立業主發票、不使用業主機台)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_TLT_No', '機台所屬專櫃編號，專櫃機台(自收)必須設定專櫃編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_TLT_Name', '機台所屬專櫃名稱';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_USR_No', '機台所屬收銀員，集中收銀(統收)必須設定收銀員';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_USR_Name', '機台所屬收銀員姓名';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ActiveDate', '啟用日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ExpireDate', '到期日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_CloseDate', '停用日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Status', '收銀機狀態，A=啟用(預設值)、C=停用、S=強制停用、T=訓練';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Group', '群組，預設為空白(未使用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SubGroup', '次樓別，預設為空白(未使用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_AreaNo', '區域，預設為空白(未使用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_LocNo', '位置編號，設定值來源為POS2002';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'HOS_No', '倉庫編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SAL_Type', '機台用途別，空白=商場收銀機台(預設值)、PKNG=停車場機台、APP=會員APP、CPN=環友票券系統';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ComName', '收銀機電腦名稱';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_IP', '收銀機網路IP';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SrvIP', '收銀機後台主機(POSServer)IP，POS10015.SYS_SrvIP';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SrvName', '收銀機後台主機名稱，POS10015.SYS_SrvName';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'SYS_SRVDDirClt', '前台系統下載目錄，預設值為 /MyPOSData/PosDown';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'SYS_SRVUDirClt', '前台系統上傳目錄，預設值為 /MyPOSData/PosUp';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_TmplNo', '周邊設定模版編號，POS1002TML.ECR_TmplNo新增收銀機設定時會依照輸入的模版編號匯入模版的設定內容，但允許使用者修改匯入後的設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SernoType', '交易序號模式，1=循環使用、2=每日重計(預設值)、3=每月重計';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_GUI_Type', '發票使用類別，00=不開發票、03=二聯式收銀機發票、07=電子發票(預設值)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_TimeTickInvl', '系統對時間隔(秒)，每XXXXXX秒鐘對時一次';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Interval', '上下傳異動檔間隔(秒)預設值為6';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_MaxQty', '單筆交易數量上限，0=不限制、預設值為999999';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_MaxAmt', '單筆交易金額上限，0=不限制、預設值為99999999';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_MaxItemAmt', '單一明細金額上限，0=不限制、預設值為99999999';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_MaxDisc', '單筆交易最大折扣比率限制，0=不限制、預設值為0';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_EdcTimeout', '信用卡刷卡機連線時限(秒)預設值為60';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_EdcSettle', '信用卡刷卡機連動日結(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ForceInput', '是否強制輸入付款金額(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_CustCntEntry', '是否輸入來客數(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_CustTypeEntry', '是否輸入客層數(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ClerkEntry', '是否強制輸入營業員(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ForceMember', '是否強制輸入會員編號(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_BoxReqCode', '開抽屜是否輸入密碼(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SelfReport', '是否執行自我報帳(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SaleRpt1', '是否列印收銀員交班表(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SaleRpt2', '是否列印收銀機財務報表(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SaleRpt3', '是否列印時段銷售報表(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SaleRpt4', '是否列印部門銷售報表(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SaleRpt5', '是否列印單品銷售報表(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SaleRpt6', '是否列印銷貨明細表(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SaleRpt7', '是否列印作廢明細表(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SaleRpt8', '是否列印自我報帳(現額報告)帳條(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SaleRpt9', '是否列印保全現金帳條(現金明細表)(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SaleRpt10', '保留(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_PcashValid', '零用金是否需要認證(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_PickUpValid', '中途取現是否需要認證(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ReprintGUI', '是否允許執行補印發票(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_PrnLogo', '是否列印商標(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Logo1', '商標1(店名)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Logo2', '商標2(地址)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Logo3', '商標3(電話)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Logo4', '商標4(統一編號)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Logo5', '商標5';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Logo6', '商標6';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_VoidTxn', '是否允許作廢交易(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_VoidRstDay', '作廢交易限制天數預設值為0，設定N天的交易才允許執行作廢，若為零則代表不限制';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_CreditNote', '是否允許開立折讓單(Y/N)預設值為N，開立電子發票才可以設定為開立折讓單';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_RestoreVoid', '是否允許回復已作廢交易(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_GUI_PeriodQty', '機台每期電子發票預設配號數量，預設值為50，設定值必須為50的倍數';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_GUI_MinQty', '機台電子發票最小安全存量，預設值為50，設定值必須為50的倍數';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SettleDD', '清機提示日期T=當天(預設值)N=隔天';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SettleHHNN', '清機提示時間-時分預設值為2330';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_KBLevel', '機台鍵盤等級';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_KBType', '鍵盤型態';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Scanner', '掃描器型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ScannerCom', '掃描器連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_MSR', 'MSR型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_MSRCom', 'MSR連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ScrType', '收銀畫面樣式，連結POS1008.TSB_Name';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_CD', '客戶顯示器型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_CDCom', '客戶顯示器連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ExtScr', '收銀外接顯示器名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ExtScrCom', '收銀外接顯示器連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_GUIPrn', '發票印表機型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_GUICom', '發票印表機連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SlipPrn', '菜單印表機型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_SlipPrnCom', '菜單印表機連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_OrderPrn', '訂單印表機型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_OrderPrnCom', '訂單印表機連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_LablePrn', '標籤印表機型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_LablePrnCom', '標籤印表機連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_EDC', '信用卡刷卡機型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_EDCCom', '信用卡刷卡機連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_EDC2', '第二台信用卡刷卡機型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_EDC2Com', '第二台信用卡刷卡機連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_EDC3', '第三台信用卡刷卡機型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_EDC3Com', '第三台信用卡刷卡機連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ElecSVCrdA', '悠遊卡，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ElecSVCrdACom', '悠遊卡連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ElecSVCrdB', '一卡通，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ElecSVCrdBCom', '一卡通連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ElecSVCrdC', '愛金卡，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ElecSVCrdCCom', '愛金卡連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ElecPay', '電子支付，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_ElecPayCom', '愛金卡連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Drawer', '錢櫃型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_DrawerCom', '錢櫃連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device1Name', '週邊裝置1名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device1Com', '週邊裝置1連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device2Name', '週邊裝置2名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device2Com', '週邊裝置2連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device3Name', '週邊裝置3名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device3Com', '週邊裝置3連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device4Name', '週邊裝置4名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device4Com', '週邊裝置4連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device5Name', '週邊裝置5名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device5Com', '週邊裝置5連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device6Name', '週邊裝置6名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device6Com', '週邊裝置6連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device7Name', '週邊裝置7名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device7Com', '週邊裝置7連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device8Name', '週邊裝置8名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device8Com', '週邊裝置8連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device9Name', '週邊裝置9名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device9Com', '週邊裝置9連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device10Name', '週邊裝置10名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'ECR_Device10Com', '週邊裝置10連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'CRT_USR_No', '建立人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'CRT_USR_Name', '建立人員姓名';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'UPD_Date', '變更日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'UPD_USR_No', '變更人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002', 'UPD_USR_Name', '變更人員姓名';


/* POS1002EDC 收銀機EDC設定檔 */
IF OBJECT_ID(N'dbo.POS1002EDC', N'U') IS NULL
BEGIN
CREATE TABLE POS1002EDC
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
	MID                 DECIMAL(19) DEFAULT 0 NOT NULL,  /*商戶編號*/
    SYS_StoreNo         VARCHAR(10)        NOT NULL,     /*收銀機所屬門市店號 POS1001.SYS_StoreNo*/
    ECR_No              VARCHAR(10)        NOT NULL,     /*收銀機號*/
    EDC_No              VARCHAR(08)        NOT NULL,     /*信用卡刷卡機代碼*/
    EDC_BegDate         DATE               NOT NULL,     /*啟用日期*/
    EDC_EdnDate         DATE               NOT NULL,     /*停用日期*/
    EDC_Status          VARCHAR(02)        NOT NULL,     /*信用卡刷卡機狀態，A=啟用、C=停用*/
    EDC_IP1             VARCHAR(20)            NULL,     /*第一台信用卡刷卡機IP*/
    EDC_IP2             VARCHAR(20)            NULL,     /*第二台信用卡刷卡機IP*/
    EDC_IP3             VARCHAR(20)            NULL,     /*第三台信用卡刷卡機IP*/
    EDC_TmID1           VARCHAR(08)            NULL,     /*第一台信用卡刷卡機端末機代碼*/
    EDC_TmID2           VARCHAR(08)            NULL,     /*第二台信用卡刷卡機端末機代碼*/
    EDC_TmID3           VARCHAR(08)            NULL,     /*第三台信用卡刷卡機端末機代碼*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS1002EDC PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS1002EDC_MST')
  CREATE UNIQUE INDEX IDX_POS1002EDC_MST ON POS1002EDC (MID, SYS_StoreNo, ECR_No, EDC_No, EDC_BegDate);

EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'MID', '商戶編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'SYS_StoreNo', '收銀機所屬門市店號';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'ECR_No', '收銀機號';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'EDC_No', '信用卡刷卡機代碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'EDC_BegDate', '啟用日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'EDC_EdnDate', '停用日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'EDC_Status', '信用卡刷卡機狀態，A=啟用、C=停用';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'EDC_IP1', '第一台信用卡刷卡機IP';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'EDC_IP2', '第二台信用卡刷卡機IP';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'EDC_IP3', '第三台信用卡刷卡機IP';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'EDC_TmID1', '第一台信用卡刷卡機端末機代碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'EDC_TmID2', '第二台信用卡刷卡機端末機代碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'EDC_TmID3', '第三台信用卡刷卡機端末機代碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'CRT_USR_No', '建立人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'CRT_USR_Name', '建立人員姓名';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'UPD_Date', '變更日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'UPD_USR_No', '變更人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002EDC', 'UPD_USR_Name', '變更人員姓名';


/*POS1002TML 收銀機週邊設定模版檔 */
IF OBJECT_ID(N'dbo.POS1002TML', N'U') IS NULL
BEGIN
CREATE TABLE POS1002TML
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
	MID                 DECIMAL(19) DEFAULT 0 NOT NULL,  /*商戶編號*/
    ECR_TmplNo          VARCHAR(20)        NOT NULL,     /*模版編號 (ET000001)*/
    ECR_TmplDesc        NVARCHAR(255)      NOT NULL,     /*模版備註 (統收機台預設設定)*/
    ECR_TmplStatus      VARCHAR(02)        NOT NULL,     /*模版狀態，A=啟用(預設值)，C=停用*/
    ECR_TmplBegDate     DATETIME           NOT NULL,     /*模版有效啟始日期，YYYY/MM/DD*/
    ECR_TmplEndDate     DATETIME           NOT NULL,     /*模版有效截止日期，YYYY/MM/DD*/
    /*收銀設定*/
    ECR_SernoType       VARCHAR(01)        NOT NULL,     /*交易序號模式 1=循環使用 2=每日重計(預設值) 3=每月重計*/
    ECR_GUI_Type        VARCHAR(02)        NOT NULL,     /*發票使用類別 00=不開發票 03=二聯式收銀機發票 07=電子發票(預設值) */
    ECR_TimeTickInvl    DECIMAL(06)        NOT NULL,     /*系統對時間隔(秒)，每 XXXXXX 秒鐘對時一次*/
    ECR_Interval        DECIMAL(06)        NOT NULL,     /*上下傳異動檔間隔(秒) 預設值為6*/
    ECR_MaxQty          DECIMAL(10,2)      NOT NULL,     /*單筆交易數量上限 0=不限制 預設值為999999*/
    ECR_MaxAmt          DECIMAL(10,2)      NOT NULL,     /*單筆交易金額上限 0=不限制 預設值為99999999*/
    ECR_MaxItemAmt      DECIMAL(10,2)      NOT NULL,     /*單一明細金額上限 0=不限制 預設值為99999999*/
    ECR_MaxDisc         DECIMAL(10,2)      NOT NULL,     /*單筆交易最大折扣比率限制 0=不限制 預設值為0*/
    ECR_EdcTimeout      DECIMAL(06)        NOT NULL,     /*信用卡刷卡機連線時限(秒)預設值為60*/
    ECR_EdcSettle       CHAR(01)           NOT NULL,     /*信用卡刷卡機連動日結(Y/N) 預設值為Y*/
    ECR_ForceInput      CHAR(01)           NOT NULL,     /*是否強制輸入付款金額 預設值為N*/
    ECR_CustCntEntry    CHAR(01)           NOT NULL,     /*是否輸入來客數(Y/N) 預設值為N*/
    ECR_CustTypeEntry   CHAR(01)           NOT NULL,     /*是否輸入客層數(Y/N) 預設值為N*/
    ECR_ClerkEntry      CHAR(01)           NOT NULL,     /*是否強制輸入營業員(Y/N) 預設值為N*/
    ECR_ForceMember     CHAR(01)           NOT NULL,     /*是否強制輸入會員編號(Y/N) 預設值為N*/
    ECR_SettleDD        VARCHAR(02)        NOT NULL,     /*清機提示日期 T=當天(預設值) N=隔天*/
    ECR_SettleHHNN      VARCHAR(04)        NOT NULL,     /*清機提示時間-時分 預設值為2330*/
    ECR_VoidTxn         CHAR(01)           NOT NULL,     /*是否允許作廢交易(Y/N) 預設值為Y*/
    ECR_VoidRstDay      DECIMAL(04)        NOT NULL,     /*作廢交易限制天數 預設值為0，設定N天的交易才允許執行作廢，若為零則代表不限制*/
    ECR_CreditNote      CHAR(01)           NOT NULL,     /*是否允許開立折讓單(Y/N) 預設值為N，開立電子發票才可以設定為開立折讓單*/
	ECR_RestoreVoid     CHAR(01)  DEFAULT 'N' NOT NULL,     /*是否允許回復已作廢交易(Y/N) 預設值為N*/
    ECR_GUI_PeriodQty   DECIMAL(08)            NULL,     /*機台每期電子發票預設配號數量，預設值為50，設定值必須為50的倍數*/
    ECR_GUI_MinQty      DECIMAL(08)            NULL,     /*機台電子發票最小安全存量，預設值為50，設定值必須為50的倍數*/

    /*報表設定*/
    ECR_SelfReport      CHAR(01)           NOT NULL,     /*是否執行自我報帳(Y/N) 預設值為Y*/
    ECR_SaleRpt1        CHAR(01)           NOT NULL,     /*是否列印收銀員交班表(Y/N) 預設值為Y*/
    ECR_SaleRpt2        CHAR(01)           NOT NULL,     /*是否列印收銀機財務報表(Y/N) 預設值為Y*/
    ECR_SaleRpt3        CHAR(01)           NOT NULL,     /*是否列印時段銷售報表(Y/N) 預設值為Y*/
    ECR_SaleRpt4        CHAR(01)           NOT NULL,     /*是否列印部門銷售報表(Y/N) 預設值為Y*/
    ECR_SaleRpt5        CHAR(01)           NOT NULL,     /*是否列印單品銷售報表(Y/N) 預設值為Y*/
    ECR_SaleRpt6        CHAR(01)           NOT NULL,     /*是否列印銷貨明細表(Y/N) 預設值為Y*/
    ECR_SaleRpt7        CHAR(01)           NOT NULL,     /*是否列印作廢明細表(Y/N) 預設值為Y*/
    ECR_SaleRpt8        CHAR(01)           NOT NULL,     /*是否列印自我報帳(現額報告)帳條(Y/N) 預設值為Y*/
    ECR_SaleRpt9        CHAR(01)           NOT NULL,     /*是否列印保全現金帳條(現金明細表)(Y/N) 預設值為Y*/
    ECR_SaleRpt10       CHAR(01)           NOT NULL,     /*保留 預設值為N*/
    ECR_PcashValid      CHAR(01)           NOT NULL,     /*零用金是否需要認證(Y/N) 預設值為N*/
    ECR_PickUpValid     CHAR(01)           NOT NULL,     /*中途取現是否需要認證(Y/N) 預設值為N*/
    ECR_ReprintGUI      CHAR(01)           NOT NULL,     /*是否允許執行補印發票(Y/N) 預設值為N*/

    ECR_PrnLogo         CHAR(01)               NULL,     /*是否列印商標(Y/N) 預設值為Y*/
    ECR_Logo1           VARCHAR(100)           NULL,     /*商標1 (門市名稱)*/
    ECR_Logo2           VARCHAR(100)           NULL,     /*商標2 (門市地址)*/
    ECR_Logo3           VARCHAR(100)           NULL,     /*商標3 (門市電話)*/
    ECR_Logo4           VARCHAR(100)           NULL,     /*商標4 (門市統一編號)*/
    ECR_Logo5           VARCHAR(100)           NULL,     /*商標5*/
    ECR_Logo6           VARCHAR(100)           NULL,     /*商標6*/

    /*周邊設定*/
    /*輸入*/
    ECR_KBLevel         VARCHAR(06)            NULL,     /*機台鍵盤等級*/
    ECR_KBType          VARCHAR(06)            NULL,     /*鍵盤型態*/
    ECR_Scanner         VARCHAR(20)            NULL,     /*掃描器型態，預設值空白代表未設定*/
    ECR_ScannerCom      DECIMAL(02)            NULL,     /*掃描器連接埠，預設值為0(未啟用)*/
    ECR_MSR             VARCHAR(20)            NULL,     /*MSR型態，預設值空白代表未設定*/
    ECR_MSRCom          DECIMAL(02)            NULL,     /*MSR連接埠，預設值為0(未啟用)*/
    /*顯示*/
    ECR_ScrType         VARCHAR(20)            NULL,     /*收銀畫面樣式，連結 POS1008.TSB_Name*/
    ECR_CD              VARCHAR(20)            NULL,     /*客戶顯示器型態，預設值空白代表未設定*/
    ECR_CDCom           DECIMAL(02)            NULL,     /*客戶顯示器連接埠，預設值為0(未啟用)*/
    ECR_ExtScr          VARCHAR(20)            NULL,     /*收銀外接顯示器名稱，預設值空白代表未設定*/
    ECR_ExtScrCom       DECIMAL(02)            NULL,     /*收銀外接顯示器連接埠，預設值為0(未啟用)*/
    /*列印*/
    ECR_GUIPrn          VARCHAR(20)            NULL,     /*發票印表機型態，預設值空白代表未設定*/
    ECR_GUICom          DECIMAL(02)            NULL,     /*發票印表機連接埠，預設值為0(未啟用)*/
    ECR_SlipPrn         VARCHAR(20)            NULL,     /*收據印表機型態，預設值空白代表未設定*/
    ECR_SlipPrnCom      DECIMAL(02)            NULL,     /*收據印表機連接埠，預設值為0(未啟用)*/
    ECR_OrderPrn        VARCHAR(20)            NULL,     /*訂單印表機型態，預設值空白代表未設定*/
    ECR_OrderPrnCom     DECIMAL(02)            NULL,     /*訂單印表機連接埠，預設值為0(未啟用)*/
    ECR_LablePrn        VARCHAR(20)            NULL,     /*標籤印表機型態，預設值空白代表未設定*/
    ECR_LablePrnCom     DECIMAL(02)            NULL,     /*標籤印表機連接埠，預設值為0(未啟用)*/
    /*信用卡*/
    ECR_EDC             VARCHAR(20)            NULL,     /*信用卡刷卡機型態，預設值空白代表未設定*/
    ECR_EDCCom          DECIMAL(02)            NULL,     /*信用卡刷卡機連接埠，預設值為0(未啟用)*/
    ECR_EDC2            VARCHAR(20)            NULL,     /*第二台信用卡刷卡機型態，預設值空白代表未設定*/
    ECR_EDC2Com         DECIMAL(02)            NULL,     /*第二台信用卡刷卡機連接埠，預設值為0(未啟用)*/
    ECR_EDC3            VARCHAR(20)            NULL,     /*第三台信用卡刷卡機型態，預設值空白代表未設定*/
    ECR_EDC3Com         DECIMAL(02)            NULL,     /*第三台信用卡刷卡機連接埠，預設值為0(未啟用)*/
    /*電子票證、電子支付*/
    ECR_ElecSVCrdA      VARCHAR(20)            NULL,     /*悠遊卡，預設值空白代表未設定*/
    ECR_ElecSVCrdACom   DECIMAL(02)            NULL,     /*悠遊卡連接埠，預設值為0(未啟用)*/
    ECR_ElecSVCrdB      VARCHAR(20)            NULL,     /*一卡通，預設值空白代表未設定*/
    ECR_ElecSVCrdBCom   DECIMAL(02)            NULL,     /*一卡通連接埠，預設值為0(未啟用)*/
    ECR_ElecSVCrdC      VARCHAR(20)            NULL,     /*愛金卡，預設值空白代表未設定*/
    ECR_ElecSVCrdCCom   DECIMAL(02)            NULL,     /*愛金卡連接埠，預設值為0(未啟用)*/
    ECR_ElecPay         VARCHAR(20)            NULL,     /*電子支付，預設值空白代表未設定*/
    ECR_ElecPayCom      DECIMAL(02)            NULL,     /*愛金卡連接埠，預設值為0(未啟用)*/
    /*其他*/
    ECR_Drawer          VARCHAR(20)            NULL,     /*錢櫃型態，預設值空白代表未設定*/
    ECR_DrawerCom       DECIMAL(02)            NULL,     /*錢櫃連接埠，預設值為0(未啟用)*/
    ECR_Device1Name     VARCHAR(20)            NULL,     /*週邊裝置1 名稱，預設值空白代表未設定*/
    ECR_Device1Com      DECIMAL(02)            NULL,     /*週邊裝置1 連接埠，預設值為0(未啟用)*/
    ECR_Device2Name     VARCHAR(20)            NULL,     /*週邊裝置2 名稱，預設值空白代表未設定*/
    ECR_Device2Com      DECIMAL(02)            NULL,     /*週邊裝置2 連接埠，預設值為0(未啟用)*/
    ECR_Device3Name     VARCHAR(20)            NULL,     /*週邊裝置3 名稱，預設值空白代表未設定*/
    ECR_Device3Com      DECIMAL(02)            NULL,     /*週邊裝置3 連接埠，預設值為0(未啟用)*/
    ECR_Device4Name     VARCHAR(20)            NULL,     /*週邊裝置4 名稱，預設值空白代表未設定*/
    ECR_Device4Com      DECIMAL(02)            NULL,     /*週邊裝置4 連接埠，預設值為0(未啟用)*/
    ECR_Device5Name     VARCHAR(20)            NULL,     /*週邊裝置5 名稱，預設值空白代表未設定*/
    ECR_Device5Com      DECIMAL(02)            NULL,     /*週邊裝置5 連接埠，預設值為0(未啟用)*/
    ECR_Device6Name     VARCHAR(20)            NULL,     /*週邊裝置6 名稱，預設值空白代表未設定*/
    ECR_Device6Com      DECIMAL(02)            NULL,     /*週邊裝置6 連接埠，預設值為0(未啟用)*/
    ECR_Device7Name     VARCHAR(20)            NULL,     /*週邊裝置7 名稱，預設值空白代表未設定*/
    ECR_Device7Com      DECIMAL(02)            NULL,     /*週邊裝置7 連接埠，預設值為0(未啟用)*/
    ECR_Device8Name     VARCHAR(20)            NULL,     /*週邊裝置8 名稱，預設值空白代表未設定*/
    ECR_Device8Com      DECIMAL(02)            NULL,     /*週邊裝置8 連接埠，預設值為0(未啟用)*/
    ECR_Device9Name     VARCHAR(20)            NULL,     /*週邊裝置9 名稱，預設值空白代表未設定*/
    ECR_Device9Com      DECIMAL(02)            NULL,     /*週邊裝置9 連接埠，預設值為0(未啟用)*/
    ECR_Device10Name    VARCHAR(20)            NULL,     /*週邊裝置10 名稱，預設值空白代表未設定*/
    ECR_Device10Com     DECIMAL(02)            NULL,     /*週邊裝置10 連接埠，預設值為0(未啟用)*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS1002TML PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS1002TML_MST')
  CREATE UNIQUE INDEX IDX_POS1002TML_MST ON POS1002TML(MID, ECR_TmplNo);

EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'MID', '商戶編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_TmplNo', '模版編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_TmplDesc', '模版備註';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_TmplStatus', '模版狀態，A=啟用(預設值)，C=停用';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_TmplBegDate', '模版有效啟始日期，YYYY/MM/DD';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_TmplEndDate', '模版有效截止日期，YYYY/MM/DD';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_SernoType', '交易序號模式1=循環使用2=每日重計(預設值)3=每月重計';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_GUI_Type', '發票使用類別00=不開發票03=二聯式收銀機發票07=電子發票(預設值';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_TimeTickInvl', '系統對時間隔(秒)，每XXXXXX秒鐘對時一次';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Interval', '上下傳異動檔間隔(秒)預設值為6';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_MaxQty', '單筆交易數量上限，0=不限制，預設值為999999';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_MaxAmt', '單筆交易金額上限，0=不限制，預設值為99999999';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_MaxItemAmt', '單一明細金額上限，0=不限制，預設值為99999999';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_MaxDisc', '單筆交易最大折扣比率限制，0=不限制，預設值為0';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_EdcTimeout', '信用卡刷卡機連線時限(秒)，預設值為60';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_EdcSettle', '信用卡刷卡機連動日結(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_ForceInput', '是否強制輸入付款金額，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_CustCntEntry', '是否輸入來客數(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_CustTypeEntry', '是否輸入客層數(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_ClerkEntry', '是否強制輸入營業員(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_ForceMember', '是否強制輸入會員編號(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_SettleDD', '清機提示日期，T=當天(預設值)，N=隔天';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_SettleHHNN', '清機提示時間-時分，預設值為2330';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_VoidTxn', '是否允許作廢交易(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_VoidRstDay', '作廢交易限制天數，預設值為0，設定N天的交易才允許執行作廢，若為零則代表不限制';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_CreditNote', '是否允許開立折讓單(Y/N)，預設值為N，開立電子發票才可以設定為開立折讓單';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_RestoreVoid', '是否允許回復已作廢交易(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_GUI_PeriodQty', '機台每期電子發票預設配號數量，預設值為50，設定值必須為50的倍數';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_GUI_MinQty', '機台電子發票最小安全存量，預設值為50，設定值必須為50的倍數';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_SelfReport', '是否執行自我報帳(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_SaleRpt1', '是否列印收銀員交班表(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_SaleRpt2', '是否列印收銀機財務報表(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_SaleRpt3', '是否列印時段銷售報表(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_SaleRpt4', '是否列印部門銷售報表(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_SaleRpt5', '是否列印單品銷售報表(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_SaleRpt6', '是否列印銷貨明細表(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_SaleRpt7', '是否列印作廢明細表(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_SaleRpt8', '是否列印自我報帳(現額報告)帳條(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_SaleRpt9', '是否列印保全現金帳條(現金明細表)(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_SaleRpt10', '保留預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_PcashValid', '零用金是否需要認證(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_PickUpValid', '中途取現是否需要認證(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_ReprintGUI', '是否允許執行補印發票(Y/N)，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_PrnLogo', '是否列印商標(Y/N)，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Logo1', '商標1(店名)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Logo2', '商標2(地址)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Logo3', '商標3(電話)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Logo4', '商標4(統一編號)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Logo5', '商標5';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Logo6', '商標6';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_KBLevel', '機台鍵盤等級';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_KBType', '鍵盤型態';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Scanner', '掃描器型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_ScannerCom', '掃描器連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_MSR', 'MSR型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_MSRCom', 'MSR連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_ScrType', '收銀畫面樣式，連結POS1008.TSB_Name';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_CD', '客戶顯示器型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_CDCom', '客戶顯示器連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_ExtScr', '收銀外接顯示器名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_ExtScrCom', '收銀外接顯示器連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_GUIPrn', '發票印表機型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_GUICom', '發票印表機連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_SlipPrn', '菜單印表機型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_SlipPrnCom', '菜單印表機連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_OrderPrn', '訂單印表機型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_OrderPrnCom', '訂單印表機連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_LablePrn', '標籤印表機型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_LablePrnCom', '標籤印表機連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_EDC', '信用卡刷卡機型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_EDCCom', '信用卡刷卡機連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_EDC2', '第二台信用卡刷卡機型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_EDC2Com', '第二台信用卡刷卡機連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_EDC3', '第三台信用卡刷卡機型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_EDC3Com', '第三台信用卡刷卡機連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_ElecSVCrdA', '悠遊卡，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_ElecSVCrdACom', '悠遊卡連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_ElecSVCrdB', '一卡通，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_ElecSVCrdBCom', '一卡通連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_ElecSVCrdC', '愛金卡，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_ElecSVCrdCCom', '愛金卡連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_ElecPay', '電子支付，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_ElecPayCom', '愛金卡連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Drawer', '錢櫃型態，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_DrawerCom', '錢櫃連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device1Name', '週邊裝置1名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device1Com', '週邊裝置1連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device2Name', '週邊裝置2名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device2Com', '週邊裝置2連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device3Name', '週邊裝置3名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device3Com', '週邊裝置3連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device4Name', '週邊裝置4名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device4Com', '週邊裝置4連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device5Name', '週邊裝置5名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device5Com', '週邊裝置5連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device6Name', '週邊裝置6名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device6Com', '週邊裝置6連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device7Name', '週邊裝置7名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device7Com', '週邊裝置7連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device8Name', '週邊裝置8名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device8Com', '週邊裝置8連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device9Name', '週邊裝置9名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device9Com', '週邊裝置9連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device10Name', '週邊裝置10名稱，預設值空白代表未設定';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'ECR_Device10Com', '週邊裝置10連接埠，預設值為0(未啟用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'CRT_USR_No', '建立人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'CRT_USR_Name', '建立人員姓名';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'UPD_Date', '變更日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'UPD_USR_No', '變更人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002TML', 'UPD_USR_Name', '變更人員姓名';


/*POS1002SCH 收銀機設定排程檔 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS1002SCH')
BEGIN
CREATE TABLE POS1002SCH
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
	MID                 DECIMAL(19) DEFAULT 0 NOT NULL,  /*商戶編號*/
    ECR_SchNo           VARCHAR(20)        NOT NULL,     /*排程編號，編號規則 ESC + 建檔日期YYMMDD + 流水號4碼，例如 ESC2410010001*/
    ECR_SchDate         DATETIME           NOT NULL,     /*設定啟用日期*/
    ECR_SchStatus       VARCHAR(02)        NOT NULL,     /*排程狀態，A=啟用(預設值)、C=取消*/

    SYS_StoreNo         VARCHAR(10)        NOT NULL,     /*收銀機所屬門市店號*/
    ECR_No              VARCHAR(10)        NOT NULL,     /*收銀機號*/
    ORG_ECR_TLT_No      VARCHAR(12)            NULL,     /*原機台所屬專櫃編號*/
    ECR_TLT_No          VARCHAR(12)            NULL,     /*機台所屬專櫃編號，若為空白則代表不修改*/
    ORG_ECR_USR_No      VARCHAR(16)            NULL,     /*機台所屬收銀員*/
    ECR_USR_No          VARCHAR(16)            NULL,     /*機台所屬收銀員，若為空白則代表不修改*/
    ORG_ECR_SrvIP       VARCHAR(20)            NULL,     /*原收銀機後台主機IP*/
    ECR_SrvIP           VARCHAR(20)            NULL,     /*收銀機後台主機IP，若為空白則代表不修改*/
    ORG_ECR_ComName     VARCHAR(64)            NULL,     /*原收銀機電腦名稱*/
    ECR_ComName         VARCHAR(64)            NULL,     /*收銀機電腦名稱*/
    ORG_ECR_IP          VARCHAR(20)            NULL,     /*原收銀機網路IP*/
    ECR_IP              VARCHAR(20)            NULL,     /*收銀機網路IP*/
    ORG_ECR_TmplNo      VARCHAR(20)            NULL,     /*原模版編號*/
    ECR_TmplNo          VARCHAR(20)            NULL,     /*新模版編號，若為空白則代表不修改*/
    ORG_ECR_Status      VARCHAR(02)            NULL,     /*原收銀機狀態*/
    ECR_Status          VARCHAR(02)            NULL,     /*收銀機狀態，若為空白則代表不修改*/

    ECR_SchFinTime      DATETIME               NULL,     /*異動作業完成時間*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS1002SCH PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS1002SCH_MST')
  CREATE UNIQUE INDEX IDX_POS1002SCH_MST ON POS1002SCH(MID, ECR_SchNo);

EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ID', '流水號，自動編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ECR_SchNo', '排程編號，編號規則 ESC + 建檔日期YYMMDD + 流水號4碼，例如 ESC2410010001';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ECR_SchDate', '設定啟用日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ECR_SchStatus', '排程狀態，A=啟用(預設值)、C=取消';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'SYS_StoreNo', '收銀機所屬門市店號';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ECR_No', '收銀機號';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ORG_ECR_TLT_No', '原機台所屬專櫃編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ECR_TLT_No', '機台所屬專櫃編號，若為空白則代表不修改';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ORG_ECR_USR_No', '機台所屬收銀員';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ECR_USR_No', '機台所屬收銀員，若為空白則代表不修改';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ORG_ECR_SrvIP', '原收銀機後台主機IP';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ECR_SrvIP', '收銀機後台主機IP，若為空白則代表不修改';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ORG_ECR_ComName', '原收銀機電腦名稱';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ECR_ComName', '收銀機電腦名稱';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ORG_ECR_IP', '原收銀機網路IP';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ECR_IP', '收銀機網路IP';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ORG_ECR_TmplNo', '原模版編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ECR_TmplNo', '新模版編號，若為空白則代表不修改';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ORG_ECR_Status', '原收銀機狀態';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ECR_Status', '收銀機狀態，若為空白則代表不修改';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'ECR_SchFinTime', '異動作業完成時間';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'CRT_USR_No', '建立人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'CRT_USR_Name', '建立人員姓名';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'UPD_Date', '變更日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'UPD_USR_No', '變更人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS1002SCH', 'UPD_USR_Name', '變更人員姓名';


/*POS1002GRM 收銀機群組主檔 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS1002GRM')
BEGIN
CREATE TABLE POS1002GRM
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
	MID                 DECIMAL(19) DEFAULT 0 NOT NULL,  /*商戶編號*/
    ECR_GrpNo           VARCHAR(20)        NOT NULL,     /*機台群組編號，系統自動給號，規則 EGP + 建檔日期YYMMDD + 流水號4碼，例如，EGP2410010001*/
    ECR_GrpName         NVARCHAR(64)       NOT NULL,     /*機台群組名稱*/
    ECR_GrpDesc         NVARCHAR(255)          NULL,     /*機台群組備註*/
    ECR_DtlLimit        CHAR(01)               NULL,     /*是否限制機台條件(是否比對POS1002GRD)、0=不限制、1=符合明細設定的機台才列入群組、2=不符合明細設定的機台才列入群組*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS1002GRM PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS1002GRM_MST')
  CREATE UNIQUE INDEX IDX_POS1002GRM_MST ON POS1002GRM(MID, ECR_GrpNo);


/*POS1002GRD 收銀機群組明細檔 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS1002GRD')
BEGIN
CREATE TABLE POS1002GRD
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
	MID                 DECIMAL(19) DEFAULT 0 NOT NULL,  /*商戶編號*/
    ECR_GrpNo           VARCHAR(20)        NOT NULL,     /*機台群組編號*/
    ECR_GrpSeqNo        DECIMAL(06)        NOT NULL,     /*機台群組序號*/
    ECR_No              VARCHAR(10)            NULL,     /*收銀機號 POS1002.ECR_No*/
    ECR_Type            VARCHAR(02)            NULL,     /*機台類型 POS1002.ECR_Type*/
    TLT_No              VARCHAR(12)            NULL,     /*專櫃編號*/

    BUILDING_No         CHAR(01)               NULL,     /*場館代碼*/
    FLOOR_No            VARCHAR(02)            NULL,     /*樓層代碼*/
    AREA_No             VARCHAR(02)            NULL,     /*區域代碼*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS1002GRD PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS1002GRD_MST')
  CREATE UNIQUE INDEX IDX_POS1002GRD_MST ON POS1002GRD(MID, ECR_GrpNo, ECR_GrpSeqNo);


/*POS1003  收銀機狀態檔 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS1003')
BEGIN
CREATE TABLE POS1003
(
    ECR_No              VARCHAR(10)         NOT NULL,       /*收銀機代碼*/
    USR_No              VARCHAR(16)             NULL,       /*作業中的收銀員代碼*/
    TXN_NextNo          DECIMAL(06)             NULL,       /*下一個可使用交易序號*/
    GUI_BegNo           VARCHAR(10)             NULL,       /*起始發票號碼*/
    GUI_NextNo          VARCHAR(10)             NULL,       /*下一個可使用發票號碼*/
    GUI_EndNo           VARCHAR(10)             NULL,       /*最後一個發票號碼*/
    ERS_OnlineMode      VARCHAR(1)          NOT NULL,       /*連線狀態*/
    ERS_Mode            VARCHAR(1)          NOT NULL,       /*收銀模式*/
    ERS_Status          VARCHAR(1)          NOT NULL,       /*POS 狀態*/
    ERS_Normal          VARCHAR(1)          NOT NULL,       /*是否正常結束*/
    ERS_BussDate        DATETIME                NULL,       /*營業日期*/
    TXN_NextOther       DECIMAL(06)             NULL,       /*下一個可使用非交易序號*/
    GUI_SerNo           VARCHAR(06)             NULL,       /*發票號碼序號*/
    USR_Class           VARCHAR(02)             NULL,       /*收銀班別*/
    MEB_No              VARCHAR(20)             NULL,       /*會員編號*/
    COM_No              VARCHAR(10)             NULL,       /*總公司分店編號*/
    USR_Level           VARCHAR(06)             NULL,       /*權限等級*/
    ERS_FtpUsrId        VARCHAR(30)             NULL,       /*FTP登入使用者代碼*/
    ERS_FtpUsrPwd       VARCHAR(30)             NULL,       /*FTP登入使用者密碼*/
    ECR_KBType          VARCHAR(2)              NULL,       /*鍵盤型態*/
    ERS_ExtData         VARCHAR(30)             NULL,       /*備註*/
	TLT_No              VARCHAR(12)             NULL,       /*專櫃編號*/
	MMT_No              VARCHAR(08)             NULL,       /*商場代號(未使用)*/

    CONSTRAINT PK_POS1003 PRIMARY KEY CLUSTERED (ECR_No)
)
END


/*POS1004M 鍵盤設定主檔 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS1004M')
BEGIN
CREATE TABLE POS1004M
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    MID                 DECIMAL(19) DEFAULT 0 NOT NULL,  /*商戶編號*/
    ECR_KBType          VARCHAR(06)        NOT NULL,     /*鍵盤型態，預設值為TCHBTN，代表收銀畫面的功能鍵，PCKB=PC鍵盤*/
    USR_Level           VARCHAR(06)        NOT NULL,     /*鍵盤權限等級*/
    ECR_KBDesc          NVARCHAR(255)          NULL,     /*鍵盤備註*/
    TSB_Name            VARCHAR(20)            NULL,     /*收銀畫面名稱，若為觸控畫面鍵盤是則需設定對應的收銀畫面POS1008.TSB_Name*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS1004M PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS1004M_MST')
  CREATE UNIQUE INDEX IDX_POS1004M_MST ON POS1004M(ECR_KBType, USR_Level);


/*POS1004 鍵盤設定明細檔 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS1004')
BEGIN
CREATE TABLE POS1004
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    MID                 DECIMAL(19) DEFAULT 0 NOT NULL,  /*商戶編號*/
    ECR_KBType          VARCHAR(06)        NOT NULL,     /*鍵盤型態，預設值為TCHBTN，代表收銀畫面的功能鍵*/
    USR_Level           VARCHAR(06)        NOT NULL,     /*鍵盤權限等級*/
    KB_ScanCode         VARCHAR(04)        NOT NULL,     /*Scan Code*/
    KB_Func             VARCHAR(04)            NULL,     /*功能代碼*/
    KB_Arg1             VARCHAR(20)            NULL,     /*參數(1)*/
    KB_Arg2             VARCHAR(20)            NULL,     /*參數(2)*/
    KB_Arg3             VARCHAR(20)            NULL,     /*參數(3)*/
    KB_Display1         NVARCHAR(20)           NULL,     /*按鍵顯示(第一行)*/
    KB_Display2         NVARCHAR(20)           NULL,     /*按鍵顯示(第二行)*/
    KB_Font             VARCHAR(20)        NOT NULL,     /*顯示字型*/
    KB_Size             DECIMAL(06)        NOT NULL,     /*顯示字型大小*/
    KB_Fonttyped        VARCHAR(03)        NOT NULL,     /*顯示字型(粗體/斜體/底線)*/
    KB_Style            CHAR(01)           NOT NULL,     /*按鍵型狀*/
    KB_Switch           CHAR(01)           NOT NULL,     /*ON/OFF*/
    KB_Width            DECIMAL(10,2)      NOT NULL,     /*寬度*/
    KB_Height           DECIMAL(10,2)      NOT NULL,     /*高度*/
    KB_Merge            VARCHAR(04)        NOT NULL,     /*合併鍵的 Scan Code*/
    KB_Color            VARCHAR(30)            NULL,     /*顏色*/
    KB_FontColor        VARCHAR(30)            NULL,     /*字型顏色*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS1004 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS1004_MST')
  CREATE UNIQUE INDEX IDX_POS1004_MST ON POS1004(ECR_KBType, USR_Level, KB_ScanCode);


/*POS1005 時段設定檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS1005')
BEGIN
CREATE TABLE POS1005
(
    TMS_No              VARCHAR(2)          NOT NULL,   /*時段編號*/
    TMS_BegTime         DATETIME            NOT NULL,   /*開始時間HHNN*/
    TMS_EndTime         DATETIME            NOT NULL,   /*結束時間HHNN*/

    CONSTRAINT PK_POS1005 PRIMARY KEY CLUSTERED (TMS_No, TMS_BegTime)
)
END


/*POS1006 付款別設定檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS1006')
BEGIN
CREATE TABLE POS1006
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
	MID                 DECIMAL(19) DEFAULT 0 NOT NULL,  /*商戶編號*/
    PAY_No              VARCHAR(02)        NOT NULL,     /*付款別編號*/
                                                         /*  07=會員折抵 */
                                                         /*  10=現金 */
                                                         /*  12=聯信紅利 */
                                                         /*  14=中信紅利 */
                                                         /*  20=禮券 */
                                                         /*  24=禮券餘代卡  */
                                                         /*  25=提貨單餘代卡  */
														 /*  25=提貨單餘代卡  */
														 /*  26=品牌已開票券(視同現金、可找零)*/
														 /*  27=品牌未開票券(視同現金、可找零)*/
                                                         /*  30=貴賓提貨單(應收帳款)  */
                                                         /*  41=聯信連線*/
                                                         /*  42=聯信離線*/
                                                         /*  43=中信連線*/
                                                         /*  44=中信離線*/
                                                         /*  52=一卡通*/
                                                         /*  55=LINE Pay */
                                                         /*  62=商品提貨單 */
                                                         /*  71=商品抵用券 */
                                                         /*  72=外來提貨單(抵用券) */
                                                         /*  73=外來禮券(抵用券) */
                                                         /*  74=活動券(自營) */
                                                         /*  75=折價券(由櫃位自行發行的折價券，不開發票)*/
                                                         /*  76=現抵，由櫃位*/
                                                         /*  77=感熱紙抵用券 */
                                                         /*  78=APP抵用券*/
                                                         /*  79=APP提貨單*/
                                                         /*  81=中信-停車場 */
                                                         /*  82=一卡通-停車場 */
                                                         /*  83=LINE Pay-停車場 */
                                                         /*  21=APP禮券 */
                                                         /*  53=悠遊卡 */
                                                         /*  56=一卡通錢包 iPASS MONEY */
                                                         /*  57=台灣Pay */
                                                         /*  58=南紡錢包 */
                                                         /*  59=即享券 */
                                                         /*  60=喜客券 */
                                                         /*  22=外來提貨單-高夢 */
                                                         /*  23=外來禮券-高夢 */
    PAY_Name            NVARCHAR(20)       NOT NULL,     /*付款別名稱*/
    PAY_TaxType         CHAR(01)           NOT NULL,     /*稅別，0=未稅、1=已稅*/
    PAY_Type            VARCHAR(02)        NOT NULL,     /*付款別型態，0=信用卡、1=現金、2=非信用卡、5=銷退單、6=禮券、7=分期付款、8=金融卡、A=應收帳款、B=抵用券、C=紅利點數、E=悠遊卡、F=餘額卡、I=一卡通、G=中獎發票代兌、M=第三方支付*/
    PAY_Ref             CHAR(01)           NOT NULL,     /*是否輸入參考號Y/N*/
    PAY_BegCrdNo        VARCHAR(20)            NULL,     /*起始號碼*/
    PAY_EndCrdNo        VARCHAR(20)            NULL,     /*終止號碼*/
    PAY_OpenBox         CHAR(01)           NOT NULL,     /*是否開抽屜Y/N*/
    PAY_OverPay         CHAR(01)           NOT NULL,     /*是否可溢收Y/N，X=不可溢收也不可找零、A=付款金額必須等於銷售總額*/
    PAY_CDDisplay       NVARCHAR(20)           NULL,     /*客戶顯示器顯示文字*/
    PAY_LimitValue      DECIMAL(10,2)          NULL,     /*最小面額*/
    PAY_MaxLimit        DECIMAL(10,2)          NULL,     /*最大面額，若為現金付款，則找零金額不可大於最大面額*/
    PAY_PrnInvoice      CHAR(01)               NULL,     /*是否開發票，Y=開立發票、N=後開發票、Z=已開發票*/
    PAY_LimitType       CHAR(01)               NULL,     /*付款限定種類[未使用]，0=不限定、1=符合限定的商品才可使用、2=符合限定的商品不可使用*/
    PAY_OnlyOrgPrice    CHAR(1)                NULL,     /*原價銷售Y/N[未使用] */
    PAY_ChangeMax       DECIMAL(10,2)          NULL,     /*找零最大金額*/
    CUR_Code            VARCHAR(04)            NULL,     /*幣別代碼*/
    PAY_DispSeq         DECIMAL(04)            NULL,     /*畫面顯示排序*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS1006 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS1006_MST')
  CREATE UNIQUE INDEX IDX_POS1006_MST ON POS1006(MID, PAY_No);

EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'PAY_No', '付款別編號，07=會員折抵、10=現金、12=聯信紅利、14=中信紅利、20=禮券、24=禮券餘代卡、25=提貨單餘代卡、30=貴賓提貨單(應收帳款)、41=聯信連線、42=聯信離線、43=中信連線、44=中信離線、52=一卡通、55=LINEPay、62=商品提貨單、71=商品抵用券、72=外來提貨單(抵用券)、73=外來禮券(抵用券)、74=活動券(自營)、75=折價券(由櫃位自行發行的折價券，不開發票)、76=現抵、77=感熱紙抵用券、78=APP抵用券、79=APP提貨單、81=中信-停車場、82=一卡通-停車場、83=LINEPay-停車場、=APP禮券、=悠遊卡、=一卡通錢包、=台灣Pay、=南紡錢包、=即享券、=喜客券、外來提貨單-高夢、外來禮券-高夢、';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'PAY_Name', '付款別名稱';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'PAY_TaxType', '稅別，0=未稅、1=已稅';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'PAY_Type', '付款別型態，0=信用卡、1=現金、2=非信用卡、5=銷退單、6=禮券、7=分期付款、8=金融卡、A=應收帳款、B=抵用券、C=紅利點數、E=悠遊卡、F=餘額卡、I=一卡通、G=中獎發票代兌、M=第三方支付';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'PAY_Ref', '是否輸入參考號Y/N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'PAY_BegCrdNo', '起始號碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'PAY_EndCrdNo', '終止號碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'PAY_OpenBox', '是否開抽屜Y/N';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'PAY_OverPay', '是否可溢收Y/N，X=不可溢收也不可找零、A=付款金額必須等於銷售總額';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'PAY_CDDisplay', '客戶顯示器顯示文字';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'PAY_LimitValue', '最小面額';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'PAY_MaxLimit', '最大面額，若為現金付款，則找零金額不可大於最大面額';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'PAY_PrnInvoice', '是否開發票，Y=開立發票、N=後開發票、Z=已開發票';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'PAY_LimitType', '付款限定種類[未使用]，0=不限定、1=符合限定的商品才可使用、2=符合限定的商品不可使用';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'PAY_OnlyOrgPrice', '原價銷售Y/N[未使用]';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'PAY_ChangeMax', '找零最大金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'CUR_Code', '幣別代碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'PAY_DispSeq', '畫面顯示排序';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'CRT_USR_No', '建立人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'CRT_USR_Name', '建立人員姓名';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'UPD_Date', '變更日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'UPD_USR_No', '變更人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS1006', 'UPD_USR_Name', '變更人員姓名';


/*POS1007 收銀功能代碼檔 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS1007')
BEGIN
CREATE TABLE POS1007
(
    KB_Func             VARCHAR(04)        NOT NULL,     /*功能代碼*/
    KB_Desc             NVARCHAR(30)       NOT NULL,     /*功能說明*/
    KB_Stage            VARCHAR(01)        NOT NULL,     /*交易流程狀態*/
    KB_CheckArg1        CHAR(01)           NOT NULL,     /*是否必須輸入參數1*/
    KB_CheckArg2        CHAR(01)           NOT NULL,     /*是否必須輸入參數2*/
    KB_CheckArg3        CHAR(01)           NOT NULL,     /*是否必須輸入參數3*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS1007 PRIMARY KEY CLUSTERED (KB_Func)
)
END


/*POS1008 螢幕按鍵設定檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS1008')
BEGIN
CREATE TABLE POS1008
(
    TSB_Name            VARCHAR(20)        NOT NULL,     /*收銀畫面名稱*/
    TSB_Enable          CHAR(01)           NOT NULL,     /*是否使用觸控式按鍵Y/N，預設值為Y*/
    TSB_Direct          VARCHAR(04)        NOT NULL,     /*按鍵延伸方向，VERT=垂直延伸(預設值)，HORI=水平延伸*/
    TSB_XCount          DECIMAL(04)        NOT NULL,     /*X軸按鍵個數*/
    TSB_YCount          DECIMAL(04)        NOT NULL,     /*Y軸按鍵個數*/
    TSB_Height          DECIMAL(6,2)       NOT NULL,     /*按鍵高度*/
    TSB_Width           DECIMAL(6,2)       NOT NULL,     /*按鍵寬度*/
    TSB_VertInterval    DECIMAL(04)        NOT NULL,     /*按鍵垂直間距*/
    TSB_HoriInterval    DECIMAL(04)        NOT NULL,     /*按鍵水平間距*/

     CONSTRAINT PK_POS1008 PRIMARY KEY CLUSTERED (TSB_Name)
)
END

DELETE FROM POS1008 WHERE TSB_Name = 'SCR09_1024';
INSERT INTO POS1008 (TSB_Name, TSB_Enable, TSB_Direct, TSB_XCount, TSB_YCount, TSB_Height, TSB_Width, TSB_VertInterval, TSB_HoriInterval) VALUES ('SCR09_1024', 'Y', 'VERT', 8, 5, 50, 100, 0, 0);



/* POS1009 系統參數設定檔 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS1009')
BEGIN
CREATE TABLE POS1009
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    MID                 DECIMAL(19) DEFAULT 0 NOT NULL,  /*商戶編號*/
    SYS_StoreNo         VARCHAR(10)        NOT NULL,     /*店號，預設值為 POS1001.SYS_StoreNo*/
    ECR_No              VARCHAR(10)        NOT NULL,     /*收銀機號，預設值為 ALL 代表不限定機號*/
    ARG_Type            VARCHAR(20)            NULL,     /*參數類別 EINV=電子發票相關*/
    ARG_No              VARCHAR(30)        NOT NULL,     /*參數代號*/
    ARG_Data            NVARCHAR(200)      NOT NULL,     /*參數內容*/
    ARG_Desc            NVARCHAR(255)          NULL,     /*參數描述*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS1009 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS1009_MST')
  CREATE UNIQUE INDEX IDX_POS1009_MST ON POS1009(MID, SYS_StoreNo, ECR_No, ARG_No);


/*POS1013 收銀機即時狀態檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS1013')
BEGIN
CREATE TABLE POS1013
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    MID                 DECIMAL(19) DEFAULT 0 NOT NULL,  /*商戶編號*/
	STO_No              VARCHAR(10)        NOT NULL,     /*門市店號，預設值為 POS1001.SYS_StoreNo*/
    ECR_No              VARCHAR(10)        NOT NULL,     /*收銀機號*/
    EOS_IP              VARCHAR(20)            NULL,     /*收銀機IP*/
    USR_No              VARCHAR(16)            NULL,     /*作業中的收銀員代碼*/
    EOS_Class           VARCHAR(02)            NULL,     /*班別*/
    EOS_Status          VARCHAR(02)            NULL,     /*收銀機即時狀態，0=暫停交易、1=登出、2=完成清帳、3=交易中、4=完成交班、5=關機*/
    EOS_Date            DATETIME               NULL,     /*營業日期，YYYY/MM/DD*/
    EOS_SetupCash       DECIMAL(10,2)          NULL,     /*零用金*/
    EOS_CurrCash        DECIMAL(10,2)          NULL,     /*抽屜現金*/
    EOS_ReturnCash      DECIMAL(10,2)          NULL,     /*繳大鈔*/
    EOS_Msg             NVARCHAR(255)          NULL,     /*收銀機回傳通報訊息*/
    EOS_MAC             VARCHAR(50)            NULL,     /*收銀機 MAC*/
    EOS_UpdateDate      DATETIME               NULL,     /*更新日期*/
    USR_Name            NVARCHAR(60)           NULL,     /*收銀員姓名*/
    TLT_No              VARCHAR(12)            NULL,     /*機台所屬專櫃編號*/
    TLT_Name            NVARCHAR(60)           NULL,     /*機台所屬專櫃名稱*/
    EOS_FreeGUIQty      DECIMAL(08)            NULL,     /*機台剩餘可開立發票張數*/
	ECR_Type            VARCHAR(02)            NULL,     /*機台類型，1=集中機台(統收)、2=專櫃機台(自收)、5=離線機台(不開立業主發票、不使用業主機台)、7=它社機台(開立業主發票、不使用業主機台)*/

    CONSTRAINT PK_POS1013 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS1013_MST')
  CREATE UNIQUE INDEX IDX_POS1013_MST ON POS1013(MID, STO_No, ECR_No);

EXEC [dbo].[spUpdateColumnDesc] 'POS1013', 'STO_No', '收銀機所屬門市店號';
EXEC [dbo].[spUpdateColumnDesc] 'POS1013', 'ECR_No', '收銀機號';
EXEC [dbo].[spUpdateColumnDesc] 'POS1013', 'EOS_IP', '收銀機IP';
EXEC [dbo].[spUpdateColumnDesc] 'POS1013', 'USR_No', '作業中的收銀員代碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS1013', 'EOS_Class', '班別';
EXEC [dbo].[spUpdateColumnDesc] 'POS1013', 'EOS_Status', '收銀機即時狀態，0=暫停交易、1=登出、2=完成清帳、3=交易中、4=完成交班、5=關機';
EXEC [dbo].[spUpdateColumnDesc] 'POS1013', 'EOS_Date', '營業日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS1013', 'EOS_SetupCash', '零用金';
EXEC [dbo].[spUpdateColumnDesc] 'POS1013', 'EOS_CurrCash', '抽屜現金';
EXEC [dbo].[spUpdateColumnDesc] 'POS1013', 'EOS_ReturnCash', '繳大鈔';
EXEC [dbo].[spUpdateColumnDesc] 'POS1013', 'EOS_Msg', '收銀機回傳通報訊息';
EXEC [dbo].[spUpdateColumnDesc] 'POS1013', 'EOS_MAC', '收銀機 MAC';
EXEC [dbo].[spUpdateColumnDesc] 'POS1013', 'EOS_UpdateDate', '更新日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS1013', 'USR_Name', '收銀員姓名';
EXEC [dbo].[spUpdateColumnDesc] 'POS1013', 'TLT_No', '機台所屬專櫃編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS1013', 'TLT_Name', '機台所屬專櫃名稱';
EXEC [dbo].[spUpdateColumnDesc] 'POS1013', 'EOS_FreeGUIQty', '機台剩餘可開立發票張數';


/* POS1013EDC 刷卡機即時狀態檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS1013EDC')
BEGIN
CREATE TABLE POS1013EDC
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    MID                 DECIMAL(19) DEFAULT 0 NOT NULL,  /*商戶編號*/
    STO_No              VARCHAR(10)        NOT NULL,     /*分店編號*/
    ECR_No              VARCHAR(10)        NOT NULL,     /*收銀機號*/
	EDC_No              VARCHAR(08)        NOT NULL,     /*信用卡刷卡機代碼*/
    EDC_IP              VARCHAR(20)            NULL,     /*信用卡刷卡機 IP，若為空白則代表未設定*/
    EDC_TmID            VARCHAR(08)            NULL,     /*信用卡刷卡機端末機代碼*/
    EDC_Status          VARCHAR(02)            NULL,     /*信用卡刷卡機狀態*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/

    CONSTRAINT PK_POS1013EDC PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS1013EDC_MST')
  CREATE UNIQUE INDEX IDX_POS1013EDC_MST ON POS1013EDC(MID, STO_No, ECR_No, EDC_No);


/*POS1017 發票範圍設定檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS1017')
BEGIN
CREATE TABLE POS1017
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    MID                 DECIMAL(19) DEFAULT 0 NOT NULL,  /*商戶編號*/
    GUI_YYMM            VARCHAR(06)        NOT NULL,     /*發票年月 YYYYMM (西元年單數月)*/
    GUI_SerNo           DECIMAL(06)        NOT NULL,     /*序號*/
    GUI_Track           VARCHAR(02)        NOT NULL,     /*發票字軌*/
    GUI_BegNo           VARCHAR(08)        NOT NULL,     /*發票起始號碼*/
    GUI_EndNo           VARCHAR(08)        NOT NULL,     /*發票結束號碼*/
    GUI_TotQty          DECIMAL(08)        NOT NULL,     /*發票張數*/
    GUI_AssignQty       DECIMAL(08)        NOT NULL,     /*發票號碼已分配張數*/
    GUI_Status          VARCHAR(02)        NOT NULL,     /*發票號碼狀態，00=未使用、01=使用中、02=己用完、03=暫停使用*/
    GUI_Type            VARCHAR(02)            NULL,     /*發票類別 01=三聯式 02=二聯式 03=二聯式收銀機發票 04=特種稅額 05=電子計算機發票 06=三聯式收銀機發票 07=電子發票(預設值)*/
    GUI_VERIFY1         VARCHAR(16)            NULL,     /*設定確認人員一*/
    GUI_VERIFY1_Name    NVARCHAR(20)           NULL,     /*設定確認人員一姓名*/
    GUI_VERIFY2         VARCHAR(16)            NULL,     /*設定確認人員二，需經過兩位使用者確認後才可啟動配號機制*/
    GUI_VERIFY2_Name    NVARCHAR(20)           NULL,     /*設定確認人員二姓名*/
    GUI_File            VARCHAR(64)            NULL,     /*匯入檔案名稱*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

     CONSTRAINT PK_POS1017 PRIMARY KEY (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS1017_MST')
  CREATE UNIQUE INDEX IDX_POS1017_MST ON POS1017(MID, GUI_YYMM, GUI_SerNo);


/*POS10171 分店發票範圍設定檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS10171')
BEGIN
CREATE TABLE POS10171
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    MID                 DECIMAL(19) DEFAULT 0 NOT NULL,  /*商戶編號*/
    STO_No              VARCHAR(10)        NOT NULL,     /*分店編號*/
    GUI_YYMM            VARCHAR(06)        NOT NULL,     /*發票年月 YYYYMM (西元年單數月)*/
    GUI_SerNo           DECIMAL(06)        NOT NULL,     /*序號*/
    GUI_Track           VARCHAR(02)        NOT NULL,     /*發票字軌*/
    GUI_BegNo           VARCHAR(08)        NOT NULL,     /*發票起始號碼*/
    GUI_EndNo           VARCHAR(08)        NOT NULL,     /*發票結束號碼*/
    GUI_TotQty          DECIMAL(08)        NOT NULL,     /*發票張數*/
    GUI_AssignQty       DECIMAL(08)        NOT NULL,     /*發票號碼已分配張數*/
    GUI_Status          VARCHAR(02)        NOT NULL,     /*發票號碼狀態 00=未使用 01=使用中 02=己用完 03=暫停使用*/
    GUI_ProcStatus      VARCHAR(02)            NULL,     /*是否完成上傳*/
    GUI_ProcDate        DATETIME               NULL,     /*上傳日期*/
    GUI_Type            VARCHAR(02)            NULL,     /*發票類別 01=三聯式 02=二聯式 03=二聯式收銀機發票 04=特種稅額 05=電子計算機發票 06=三聯式收銀機發票 07=電子發票*/
    STO_Uniform         VARCHAR(10)            NULL,     /*門市統一編號(賣方統編)*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS10171 PRIMARY KEY (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS10171_MST')
  CREATE UNIQUE INDEX IDX_POS10171_MST ON POS10171(MID, STO_No, GUI_YYMM, GUI_SerNo);


/*POS10172 社福團體代碼檔*/
/*電子發票開放資料Open API服務 受捐贈機關或團體捐贈碼清單/DonateCodeList*/
/*https://dataset.einvoice.nat.gov.tw/ods/portal/api/v1/DonateCodeList?limit=2000&offset=0*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS10172')
BEGIN
CREATE TABLE POS10172
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    SSG_No              VARCHAR(20)        NOT NULL,     /*社福團體代碼*/
    SSG_Type            VARCHAR(02)        NOT NULL,     /*代碼類型，0=愛心碼、1=與營業人配合之社福團體*/
    SSG_Name            NVARCHAR(60)           NULL,     /*社福團體名稱*/
    SSG_Uniform         VARCHAR(08)            NULL,     /*社福團體統一編號*/
    SSG_City            NVARCHAR(08)           NULL,     /*社福團體縣市*/
    SSG_ShortName       NVARCHAR(16)           NULL,     /*社福團體簡稱*/
    CRT_Date            DATETIME               NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS10172 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS10172_MST')
  CREATE UNIQUE INDEX IDX_POS10172_MST ON POS10172(SSG_No);


/*POS1018 發票設定明細檔 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS1018')
BEGIN
CREATE TABLE POS1018
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    MID                 DECIMAL(19) DEFAULT 0 NOT NULL,  /*商戶編號*/
    STO_No              VARCHAR(10)        NOT NULL,     /*分店編號*/
    GUI_YYMM            VARCHAR(06)        NOT NULL,     /*發票年月 YYYYMM (西元年單數月)*/
    ECR_No              VARCHAR(10)        NOT NULL,     /*收銀機號*/
    SER_NOS             VARCHAR(06)        NOT NULL,     /*發票號碼序號*/
	GUI_Status          VARCHAR(02)            NULL,     /*發票狀態，00=未使用、01=使用中、02=己用完、03=暫停使用、04=已鎖定*/
    GUI_TRACK           VARCHAR(02)            NULL,     /*發票字軌*/
    GUI_SNOS            VARCHAR(08)            NULL,     /*發票起始號*/
    GUI_ENOS            VARCHAR(08)            NULL,     /*發票終止號*/
    NEXT_SNOS           VARCHAR(08)            NULL,     /*下一個發票號碼*/
    USED_NOS            DECIMAL(08)            NULL,     /*已用張數*/
    TOT_NOS             DECIMAL(08)            NULL,     /*全部張數*/
    FREE_NOS            DECIMAL(08)            NULL,     /*未用張數*/
    REMARK              VARCHAR(10)            NULL,     /*備註*/
    STO_Uniform         VARCHAR(10)            NULL,     /*門市統一編號(賣方統編)*/
    GUI_Type            VARCHAR(02)            NULL,     /*發票類別，02=二聯式、07=電子發票(預設值)*/
    GUI_DownDate        DATETIME               NULL,     /*發票下傳日期時間 YYYY/MM/DD HH:NN:SS*/
    GUI_DownUsrNo       VARCHAR(08)            NULL,     /*發票下傳人員*/
	GUI_Down_UsrName    NVARCHAR(20)           NULL,     /*發票下傳人員姓名*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS1018 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS1018_MST')
  CREATE UNIQUE INDEX IDX_POS1018_MST ON POS1018(MID, STO_No, GUI_YYMM, ECR_No, SER_NOS);


/*POS1027M 收銀菜單主檔*/
IF OBJECT_ID(N'dbo.POS1027M', N'U') IS NULL
BEGIN
CREATE TABLE POS1027M
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    MID                 DECIMAL(19) DEFAULT 0 NOT NULL,   /*商戶編號*/
    STO_No              VARCHAR(10)        NOT NULL,      /*分店編號，POS1001.SYS_StoreNo*/
    SBM_Type            VARCHAR(06)        NOT NULL,      /*菜單類別(1=一般菜單、2=員工菜單)*/
    TLT_No              VARCHAR(12)        NOT NULL,      /*專櫃編號，TLTTALENT.TLT_No*/
    SBM_BegDate         DATETIME           NOT NULL,      /*有效啟始日期*/
    SBM_EndDate         DATETIME           NOT NULL,      /*有效結束日期*/
    TLT_Name            NVARCHAR(60)           NULL,      /*專櫃名稱*/

    CRT_Date            DATETIME               NULL,      /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,      /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,      /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,      /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,      /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,      /*變更人員姓名*/

    CONSTRAINT PK_POS1017M PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS1027M_MST')
  CREATE UNIQUE INDEX IDX_POS1027M_MST ON POS1027M(MID, STO_No, SBM_Type, TLT_No, SBM_BegDate);


/*POS10271 收銀菜單明細檔*/
IF OBJECT_ID(N'dbo.POS10271', N'U') IS NULL
BEGIN
CREATE TABLE POS10271
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
	MID                 DECIMAL(19) DEFAULT 0 NOT NULL,   /*商戶編號*/
    STO_No              VARCHAR(10)        NOT NULL,      /*分店編號，POS1001.SYS_StoreNo*/
    SBM_Type            VARCHAR(06)        NOT NULL,      /*菜單類別(1=一般菜單、2=員工菜單)*/
    TLT_No              VARCHAR(12)        NOT NULL,      /*專櫃編號*/
    SBM_BegDate         DATETIME           NOT NULL,      /*有效啟始日期*/
    SBM_EndDate         DATETIME           NOT NULL,      /*有效結束日期*/
    SBM_SeqNo           DECIMAL(06)        NOT NULL,      /*菜單序號*/
    PLU_MagNo           VARCHAR(20)        NOT NULL,      /*商品貨號*/
    PLU_No              VARCHAR(20)        NOT NULL,      /*商品條碼*/
    PLU_Name            NVARCHAR(60)       NOT NULL,      /*商品名稱(收銀系統顯示)*/
    PLU_PrnName         NVARCHAR(60)       NOT NULL,      /*商品列印名稱(菜單按鍵顯示名稱)*/
    PLU_FixPrc          DECIMAL(12,2)      NOT NULL,      /*商品定價*/
    PLU_SalePrc         DECIMAL(12,2)      NOT NULL,      /*商品售價*/
    SBM_BtnNo           DECIMAL(06)        NOT NULL,      /*菜單按鍵序號，同一個按鍵序號可能為多筆，以菜單序號 SBM_SeqNo 較大優先*/

    CRT_Date            DATETIME               NULL,      /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,      /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,      /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,      /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,      /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,      /*變更人員姓名*/

    CONSTRAINT PK_POS10271 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS10271_MST')
  CREATE UNIQUE INDEX IDX_POS10271_MST ON POS10271(MID, STO_No, SBM_Type, TLT_No, SBM_BegDate, SBM_SeqNo);


/*POS2001 收銀員設定檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS2001')
BEGIN
CREATE TABLE POS2001
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
	MID                 DECIMAL(19) DEFAULT 0 NOT NULL,   /*商戶編號*/
    USR_No              VARCHAR(16)        NOT NULL,     /*收銀員編號*/
    USR_Name            NVARCHAR(60)       NOT NULL,     /*收銀員姓名*/
    USR_Passwd          VARCHAR(20)        NOT NULL,     /*密碼*/
    USR_Level           VARCHAR(06)        NOT NULL,     /*收銀鍵盤等級(編號)*/
    USR_Auth            DECIMAL(06)        NOT NULL,     /*收銀員授權等級，預設值為0*/

    USR_JobStatus       VARCHAR(02)        NOT NULL,     /*收銀員(在職)狀態，J=在職(預設值)、Q=離職*/
    USR_Class           VARCHAR(02)        NOT NULL,     /*收銀員等級，R=一般(預設值)、M=店長、S=系統管理者*/
    USR_RegType         VARCHAR(02)        NOT NULL,     /*收銀員區分，2=獨立收銀(預設值)、1=集中收銀*/
    USR_TLT_No          VARCHAR(12)            NULL,     /*收銀員所屬櫃編*/
    USR_TLT_Name        NVARCHAR(60)           NULL,     /*收銀員所屬專櫃名稱*/

    USR_OnJobDate       DATE                   NULL,     /*啟用(到職)日期，YYYY/MM/DD*/
    USR_QuitDate        DATE                   NULL,     /*停用(離職)日期，YYYY/MM/DD*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)            NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)           NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)            NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)           NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS2001 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS2001_MST')
  CREATE UNIQUE INDEX IDX_POS2001_MST ON POS2001(MID, USR_No);

EXEC [dbo].[spUpdateColumnDesc] 'POS2001', 'USR_No', '收銀員編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS2001', 'USR_Name', '收銀員姓名';
EXEC [dbo].[spUpdateColumnDesc] 'POS2001', 'USR_Passwd', '密碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS2001', 'USR_Level', '收銀鍵盤等級(編號)';
EXEC [dbo].[spUpdateColumnDesc] 'POS2001', 'USR_Auth', '收銀員授權等級，預設值為0';
EXEC [dbo].[spUpdateColumnDesc] 'POS2001', 'USR_JobStatus', '收銀員(在職)狀態，J=在職(預設值)、Q=離職';
EXEC [dbo].[spUpdateColumnDesc] 'POS2001', 'USR_Class', '收銀員等級，R=一般(預設值)、M=店長、S=系統管理者';
EXEC [dbo].[spUpdateColumnDesc] 'POS2001', 'USR_RegType', '收銀員區分，2=獨立收銀(預設值)、1=集中收銀';
EXEC [dbo].[spUpdateColumnDesc] 'POS2001', 'USR_TLT_No', '收銀員所屬櫃編';
EXEC [dbo].[spUpdateColumnDesc] 'POS2001', 'USR_TLT_Name', '收銀員所屬專櫃名稱';
EXEC [dbo].[spUpdateColumnDesc] 'POS2001', 'USR_OnJobDate', '啟用(到職)日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS2001', 'USR_QuitDate', '停用(離職)日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS2001', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS2001', 'CRT_USR_No', '建立人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS2001', 'CRT_USR_Name', '建立人員姓名';
EXEC [dbo].[spUpdateColumnDesc] 'POS2001', 'UPD_Date', '變更日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS2001', 'UPD_USR_No', '變更人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS2001', 'UPD_USR_Name', '變更人員姓名';


/*POS2002 店位基本資料檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS2002')
BEGIN
CREATE TABLE POS2002
(
     id                  DECIMAL(19,0) identity(1,1) NOT NULL,
	 MID                 DECIMAL(19) DEFAULT 0 NOT NULL,   /*商戶編號*/
     Location_No         VARCHAR(10)          NOT NULL,      /*店位代碼-館別(1)+樓層(2)+區域(1)+流水編號(3)*/
     Location_Name       NVARCHAR(30)             NULL,      /*店位說明*/
     Org_ID              VARCHAR(20)              NULL,      /*組織代碼(SYS3100)*/
     Building_No         CHAR(01)             NOT NULL,      /*館別代碼(SYS3800)*/
     Floor_No            VARCHAR(02)          NOT NULL,      /*樓層代碼(SYS3900)*/
     Area_No             VARCHAR(02)          NOT NULL,      /*區域代碼(SYS3A00)*/
     GROSS_SPACE         DECIMAL(7,3) DEFAULT 0   NULL,      /*簽約坪數*/
     NET_SPACE           DECIMAL(7,3) DEFAULT 0   NULL,      /*營業坪數*/
     LOCATION_Status     CHAR(01)             NOT NULL,      /*使用狀態 0=空位 1=使用中 2=保留 3=停用 */
     Purpose_no          VARCHAR(02)          NOT NULL,      /*用途代碼(SYS3F00)*/
     Draw_X              VARCHAR(255)             NULL,      /*X 軸*/
     Draw_Y              VARCHAR(255)             NULL,      /*Y 軸*/
     CRT_Date            DATETIME                 NULL,      /*建立日期*/
     CRT_USR_No          VARCHAR(16)              NULL,      /*建立人員*/
     CRT_USR_Name        NVARCHAR(20)             NULL,      /*建立人員姓名*/
     UPD_Date            DATETIME                 NULL,      /*變更日期*/
     UPD_USR_No          VARCHAR(16)              NULL,      /*變更人員*/
     UPD_USR_Name        NVARCHAR(20)             NULL,      /*變更人員姓名*/

     constraint PK_POS2002 primary key clustered (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS2002_MST')
  CREATE UNIQUE INDEX IDX_POS2002_MST ON POS2002(MID, LOCATION_No);



/*POS2004 商品主檔(收銀系統專用與後台系統的欄位數量有差異)*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS2004')
BEGIN
CREATE TABLE POS2004
(
    PLU_MagNo           VARCHAR(20)         NOT NULL,       /*商品管理編號*/
    PLU_No              VARCHAR(20)         NOT NULL,       /*國際條碼*/

    PLU_OrgPLUNo        VARCHAR(30)             NULL,       /*廠商貨號*/
    PLU_Name            NVARCHAR(60)            NULL,       /*商品名稱*/
    PLU_PrnName         NVARCHAR(40)            NULL,       /*列印名稱*/
    PLU_EngName         VARCHAR(100)            NULL,       /*英文名稱*/
    CAT_LNo             VARCHAR(6)          NOT NULL,       /*大分類代碼 POS2003*/
    CAT_MNo             VARCHAR(6)              NULL,       /*中分類代碼 POS20031*/
    CAT_SNo             VARCHAR(6)              NULL,       /*小分類代碼 POS20032*/
    VEN_No              VARCHAR(16)             NULL,       /*廠商編號*/
    PLU_TaxType         CHAR(01)            NOT NULL,       /*售價稅別:0免稅,1應稅*/
    PLU_Unit            VARCHAR(02)             NULL,       /*單位代碼*/
    PLU_Spec            NVARCHAR(30)            NULL,       /*規格*/
    PLU_FixPrc          DECIMAL(10, 2)          NULL,       /*定價*/
    PLU_SalePrc         DECIMAL(10, 2)      NOT NULL,       /*售價*/
    PLU_MemPrc          DECIMAL(10, 2)          NULL,       /*會員價*/
    PLU_BatPrc          DECIMAL(10, 2)          NULL,       /*批發*/
    PLU_Cost            DECIMAL(12, 4)          NULL,       /*成本*/
    PLU_OpenPrc         CHAR(01)            NOT NULL,       /*開放售價Y/N*/
    PLU_Status          CHAR(01)            NOT NULL,       /*商品狀態:0一般*/
    PLU_Type            VARCHAR(02)         NOT NULL,       /*商品類別:1一般商品,2生鮮商品,6組合商品,8專櫃,B禮券,F:折讓*/
    PLU_Disc            CHAR(01)                NULL,       /*是否可折扣(Y/N)*/
    PLU_PageNum         VARCHAR(08)             NULL,       /*棚割編號*/
    PLU_LocNo           DECIMAL(04,1)           NULL,       /*棚割序號*/
    PLU_BoxQty          DECIMAL(04)             NULL,       /*包裝入數(裝箱入數)*/
    PLU_StockTaxType    CHAR(01)                NULL,       /*進價稅別:0免稅,1應稅*/
    PLU_OrderPrc        DECIMAL(10,2)           NULL,       /*進價*/
    PLU_OrderPrcRate    DECIMAL(10,2)           NULL,       /*進價折數*/
    PLU_SafeQty         DECIMAL(10,4)           NULL,       /*安全存量*/
    PLU_LastStockDate   DATE                    NULL,       /*最後進貨日期*/
    TLT_No              VARCHAR(12)             NULL,       /*專櫃編號*/
    PLU_TaxRate         DECIMAL(7,4)            NULL,       /*稅率*/
    PLU_StopSale        CHAR(01)                NULL,       /*停止銷售註記(Y/N)*/
    PLU_StopSaleDate    DATE                    NULL,       /*停止銷售日期*/

    PLU_MemPrc2         DECIMAL(10,2)           NULL,       /*特價*/
    PLU_MemPrc3         DECIMAL(10,2)           NULL,       /*VIP價*/
    MAM_No              VARCHAR(12)             NULL,       /*促銷編號*/
    MAM_Condition       DECIMAL(08)             NULL,       /*促銷數量(條件數量)*/
    MAM_TotAmt          DECIMAL(10,2)           NULL,       /*促銷總額(條件金額)*/
    MAM_CombNo          VARCHAR(20)             NULL,       /*組合編號*/
    MAM_CombGrp         VARCHAR(06)             NULL,       /*組合群組項次*/
    MAM_Method          CHAR(01)                NULL,       /*促銷方式*/
    MAM_UnitPrc         DECIMAL(10,2)           NULL,       /*促銷單價-POS售價*/
    MAM_ChangeNo        VARCHAR(14)             NULL,       /*變價單號*/
    MAM_Quart           DECIMAL(10,2)           NULL,       /*會員贈扣點數*/
    MAM_TotQuart        DECIMAL(10,2)           NULL,       /*總會員贈扣點數*/
    MAM_AddPrc          DECIMAL(10,2)           NULL,       /*符合促銷條件後,優惠價格*/
    MAM_AddQty          DECIMAL(08)             NULL,       /*可買M個額外商品,優惠數量*/
    MAM_AddPLU_No       VARCHAR(20)             NULL,       /*額外商品編號/優惠商品編號*/ --欄位改20
    MAM_MemCondition    DECIMAL(08)             NULL,       /*會員促銷數量*/
    MAM_MemTotAmt       DECIMAL(10,2)           NULL,       /*會員促銷總額*/
    MAM_MemUnitPrc      DECIMAL(10,2)           NULL,       /*會員促銷單價*/
    MAM_MaxCondition    DECIMAL(08)             NULL,       /*限購組數*/
    MAM_DiscAmt         DECIMAL(10,2)           NULL,       /*優惠價*/
    MAM_DiscType        CHAR(01)                NULL,       /*優惠方式 Y:優惠價/N:折扣%*/
    MAM_PLU_MagNo       VARCHAR(20)             NULL,       /*促銷條碼貨號(憑券使用)*/
    MAM_BegDate         DATE                    NULL,       /*開始日期*/
    MAM_EndDate         DATE                    NULL,       /*結束日期*/
    MAM_ActiveDate      DATE                    NULL,       /*變價啟動日期*/
    MAM_FirstActiveDate DATE                    NULL,       /*第一次變價啟動日期*/
    MAM_RecoverDate     DATE                    NULL,       /*變價回復日期*/

    PLU_Attribute       CHAR(01)                NULL,       /*商品型態 1一般、2進口、3買斷、4試銷、5寄賣*/ --南紡 商品型態 1一般、2進口、3買斷、4試銷、5寄賣
    PLU_Source          CHAR(01)                NULL,       /*來源別(1:自製,2:OEM,3:外購,4:自行進口,5:代工,6:煙酒)*/
    PLU_IsStock         CHAR(01)                NULL,       /*是否計算庫存(Y:是 N:否)*/ --欄位名稱改
    PLU_ReadyDay        DECIMAL(04)             NULL,       /*備貨天數*/
    PLU_MinOrder        DECIMAL(08)             NULL,       /*最小訂量(不使用)*/ --南紡會使用 最小訂購量
    PLU_StockType       CHAR(01)                NULL,       /*庫存類別(0:一般 1:標準用量 2:自動轉換(沒用到) 3:子母商品 4:手動轉換)*/

    MAM_OrdPrcBegDate   DATE                    NULL,       /*進價促銷開始日期*/
    MAM_OrdPrcEndDate   DATE                    NULL,       /*進價促銷結束日期*/
    MAM_OrderPrc        DECIMAL(10,2)           NULL,       /*促銷進價*/

    CRT_Date            DATETIME                NULL,       /*建立日期*/
    CRT_USR_No          VARCHAR(16)             NULL,       /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)            NULL,       /*建立人員姓名*/
    UPD_Date            DATETIME                NULL,       /*變更日期*/
    UPD_USR_No          VARCHAR(16)             NULL,       /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)            NULL,       /*變更人員姓名*/

	 CONSTRAINT PK_POS2004 PRIMARY KEY CLUSTERED (PLU_MagNo)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS2004_PLU_No')
  CREATE INDEX IDX_POS2004_PLU_No ON POS2004 (PLU_No);

EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_MagNo', '商品管理編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_No', '國際條碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_OrgPLUNo', '廠商貨號';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_Name', '商品名稱';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_PrnName', '列印名稱';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_EngName', '英文名稱';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'CAT_LNo', '大分類代碼 POS2003';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'CAT_MNo', '中分類代碼 POS20031';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'CAT_SNo', '小分類代碼 POS20032';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'VEN_No', '廠商編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_TaxType', '售價稅別:0免稅,1應稅';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_Unit', '單位代碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_Spec', '規格';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_FixPrc', '定價';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_SalePrc', '售價';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_MemPrc', '會員價';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_BatPrc', '批發';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_Cost', '成本';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_OpenPrc', '開放售價Y/N';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_Status', '商品狀態:0一般';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_Type', '商品類別:1一般商品,2生鮮商品,6組合商品,8專櫃,B禮券,F:折讓';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_Disc', '是否可折扣(Y/N)';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_PageNum', '棚割編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_LocNo', '棚割序號';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_BoxQty', '包裝入數(裝箱入數)';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_StockTaxType', '進價稅別:0免稅,1應稅';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_OrderPrc', '進價';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_OrderPrcRate', '進價折數';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_SafeQty', '安全存量';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_LastStockDate', '最後進貨日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'TLT_No', '專櫃編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_TaxRate', '稅率';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_StopSale', '停止銷售註記(Y/N)';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_StopSaleDate', '停止銷售日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_MemPrc2', '特價';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_MemPrc3', 'VIP價';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_No', '促銷編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_Condition', '促銷數量(條件數量)';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_TotAmt', '促銷總額(條件金額)';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_CombNo', '組合編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_CombGrp', '組合群組項次';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_Method', '促銷方式';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_UnitPrc', '促銷單價-POS售價';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_ChangeNo', '變價單號';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_Quart', '會員贈扣點數';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_TotQuart', '總會員贈扣點數';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_AddPrc', '符合促銷條件後,優惠價格';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_AddQty', '可買M個額外商品,優惠數量';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_AddPLU_No', '額外商品編號/優惠商品編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_MemCondition', '會員促銷數量';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_MemTotAmt', '會員促銷總額';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_MemUnitPrc', '會員促銷單價';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_MaxCondition', '限購組數';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_DiscAmt', '優惠價';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_DiscType', '優惠方式 Y:優惠價/N:折扣%';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_PLU_MagNo', '促銷條碼貨號(憑券使用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_BegDate', '開始日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_EndDate', '結束日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_ActiveDate', '變價啟動日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_FirstActiveDate', '第一次變價啟動日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_RecoverDate', '變價回復日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_Attribute', '商品型態 1一般、2進口、3買斷、4試銷、5寄賣';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_Source', '來源別(1:自製,2:OEM,3:外購,4:自行進口,5:代工,6:煙酒)';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_IsStock', '是否計算庫存(Y:是 N:否)';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_ReadyDay', '備貨天數';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_MinOrder', '最小訂量(不使用)';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'PLU_StockType', '庫存類別(0:一般 1:標準用量 2:自動轉換(沒用到) 3:子母商品 4:手動轉換)';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_OrdPrcBegDate', '進價促銷開始日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_OrdPrcEndDate', '進價促銷結束日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'MAM_OrderPrc', '促銷進價';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'CRT_USR_No', '建立人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'CRT_USR_Name', '建立人員姓名';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'UPD_Date', '變更日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'UPD_USR_No', '變更人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS2004', 'UPD_USR_Name', '變更人員姓名';



/*POS2005 商品條碼資料*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS2005')
BEGIN
CREATE TABLE POS2005
(
    PLU_No              VARCHAR(20)         NOT NULL,       /*國際條碼*/
    PLU_MagNo           VARCHAR(20)         NOT NULL,       /*商品管理編號*/

    CRT_Date            DATETIME                NULL,       /*建立日期*/
    CRT_USR_No          VARCHAR(16)             NULL,       /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)            NULL,       /*建立人員姓名*/
    UPD_Date            DATETIME                NULL,       /*變更日期*/
    UPD_USR_No          VARCHAR(16)             NULL,       /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)            NULL,       /*變更人員姓名*/

	 CONSTRAINT PK_POS2005 PRIMARY KEY CLUSTERED (PLU_No)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS2005_PLU_MagNo')
  CREATE INDEX IDX_POS2005_PLU_MagNo ON POS2005 (PLU_MagNo);

EXEC [dbo].[spUpdateColumnDesc] 'POS2005', 'PLU_MagNo', '商品管理編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS2005', 'PLU_No', '國際條碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS2005', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS2005', 'CRT_USR_No', '建立人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS2005', 'CRT_USR_Name', '建立人員姓名';
EXEC [dbo].[spUpdateColumnDesc] 'POS2005', 'UPD_Date', '變更日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS2005', 'UPD_USR_No', '變更人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS2005', 'UPD_USR_Name', '變更人員姓名';


/*TLTTALENT 專櫃主檔(收銀系統專用與後台系統的欄位有差異)*/
IF OBJECT_ID(N'dbo.TLTTALENT', N'U') IS NULL
BEGIN
CREATE TABLE TLTTALENT
(
    MID                 DECIMAL(19) DEFAULT 0 NOT NULL,    /*商戶編號*/
    Talent_ID           DECIMAL(19,0)       NOT NULL,       /*專櫃合約編號系統 ID*/

    Apply_No            VARCHAR(12)         NOT NULL,       /*申請設櫃編號*/
    Approved_Date       DATETIME                NULL,       /*核准日期*/
    Approved_UserNo     VARCHAR(16)             NULL,       /*核准人員*/
    Approved_User_Name  NVARCHAR(20)            NULL,       /*核准人員姓名*/

    TLT_OpenFlag        CHAR(01) DEFAULT '1' NOT NULL,      /*營業狀態，0=閉店/撤櫃、1=營業中、2=合約結束、9=核准時合約尚未開始*/
    Contract_No         VARCHAR(12)         NOT NULL,       /*專櫃合約編號*/
    Contract_SubNo      DECIMAL(04)         NOT NULL,       /*專櫃合約附號*/
    /*基本資料*/
    TLT_No              VARCHAR(12)         NOT NULL,       /*專櫃編號*/
    TLT_ShortName       NVARCHAR(30)            NULL,       /*專櫃簡稱*/
    TLT_Name            NVARCHAR(100)       NOT NULL,       /*品牌(專櫃名稱)*/
    VEN_Uniform         VARCHAR(10)         NOT NULL,       /*廠商統一編號(POS2013)*/
    VEN_Name            NVARCHAR(100)       NOT NULL,       /*廠商名稱(POS2013.VEN_Name)*/
    /*洽談階段資訊*/
    Paper_Type          VARCHAR(02)             NULL,       /*營業型態(SYS1000.T101)*/
    ORG_ID              VARCHAR(20)         NOT NULL,       /*組織代碼*/

    BUS_Type            VARCHAR(02)         NOT NULL,       /*大分類代碼(tltbustype)*/
    BUS_Class           VARCHAR(02)         NOT NULL,       /*中分類代碼(tltbusclass)*/
    BUS_SClass          VARCHAR(02)             NULL,       /*小分類(tltbussclass)*/

    TLT_BDate           DATETIME                NULL,       /*合約起始日期*/
    TLT_EDate           DATETIME                NULL,       /*合約終止日期*/
    TLT_Contract_BDate  DATETIME                NULL,       /*正式營運起始日期*/
    TLT_Contract_EDate  DATETIME                NULL,       /*正式營運終止日期*/
    /*商務條件*/
    TLT_Kind            CHAR(01)                NULL,       /*專櫃櫃別，1=正櫃、2=臨時櫃、3=特賣會、4=虛擬櫃 */
    Deco_Type           CHAR(01)                NULL,       /*裝璜方式，1=統設統裝(A統)、2=統設自裝、3=自設統裝、4=自設自裝*/
    TLT_Term_Type       CHAR(02)            NOT NULL,       /*抽成別，1=固定租金、2=底租抽成取高者、3=一般抽成、4=包底抽成、5=階梯式抽成、6=包底加階梯*/
    EDC_YN              CHAR(01)                NULL,       /*是否使用業主商店代號-保留欄位, 但不使用*/
    Machine_ID          VARCHAR(13)             NULL,       /*業主商店代號-目前沒有資料, 保留欄位但不使用*/
    TLT_CType_Mtotal    CHAR(01)                NULL,       /*包底類別，1=年包、2=月包、0=期間包*/
    RECE_YN             CHAR(01) DEFAULT 'N'    NULL,       /*是否開立業主發票(Y:是 N:否)*/
    POS_YN              CHAR(01) DEFAULT 'N'    NULL,       /*是否使用業主收銀機(Y:是 N:否)*/
    CASH_YN             CHAR(01) DEFAULT 'N'    NULL,       /*是否為業主收現(Y:是 N:否)*/
    COMM_YN             CHAR(01) DEFAULT 'N'    NULL,       /*是否為抽成(Y:是 N:否)*/
    MONEY_Type          char(2)                 NULL,       /*結帳方式，10=十日結、15=半月結、30=月結*/
    Store_Way           CHAR(01)                NULL,       /*配合方式，1=專櫃、2=自營*/
    VIP_YN              CHAR(01)                NULL,       /*是否配合聯名卡(Y:是 N:否)*/

    CRT_Date            DATETIME                NULL,       /*建立日期*/
    CRT_USR_No          VARCHAR(16)             NULL,       /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)            NULL,       /*建立人員姓名*/
    UPD_Date            DATETIME                NULL,       /*變更日期*/
    UPD_USR_No          VARCHAR(16)             NULL,       /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)            NULL,       /*變更人員姓名*/

    CONSTRAINT PK_TLTTALENT PRIMARY KEY CLUSTERED (MID, Talent_ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_TLTTALENT_TLT_No')
  CREATE INDEX IDX_TLTTALENT_TLT_No ON TLTTALENT (TLT_No);

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_TLTTALENT_Contract_No')
  CREATE INDEX IDX_TLTTALENT_Contract_No ON TLTTALENT (TLT_No, Contract_No, Contract_SubNo);

EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'MID', '商戶編號';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'Talent_ID', '專櫃合約編號系統 ID';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'Apply_No', '申請設櫃編號';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'Approved_Date', '核准日期';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'Approved_UserNo', '核准人員';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'Approved_User_Name', '核准人員姓名';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'TLT_OpenFlag', '營業狀態，0=閉店/撤櫃、1=營業中、2=合約結束、9=核准時合約尚未開始';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'Contract_No', '專櫃合約編號';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'Contract_SubNo', '專櫃合約附號';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'TLT_No', '專櫃編號';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'TLT_ShortName', '專櫃簡稱';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'TLT_Name', '品牌(專櫃名稱)';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'VEN_Uniform', '廠商統一編號(POS2013)';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'VEN_Name', '廠商名稱(POS2013.VEN_Name)';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'Paper_Type', '營業型態(SYS1000.T101)';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'ORG_ID', '組織代碼';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'BUS_Type', '大分類代碼(tltbustype)';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'BUS_Class', '中分類代碼(tltbusclass)';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'BUS_SClass', '小分類(tltbussclass)';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'TLT_BDate', '合約起始日期';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'TLT_EDate', '合約終止日期';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'TLT_Contract_BDate', '正式營運起始日期';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'TLT_Contract_EDate', '正式營運終止日期';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'TLT_Kind', '專櫃櫃別，1=正櫃、2=臨時櫃、3=特賣會、4=虛擬櫃';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'Deco_Type', '裝璜方式，1=統設統裝(A統)、2=統設自裝、3=自設統裝、4=自設自裝';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'TLT_Term_Type', '抽成別，1=固定租金、2=底租抽成取高者、3=一般抽成、4=包底抽成、5=階梯式抽成、6=包底加階梯';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'EDC_YN', '是否使用業主商店代號-保留欄位, 但不使用';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'Machine_ID', '業主商店代號-目前沒有資料, 保留欄位但不使用';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'TLT_CType_Mtotal', '包底類別，1=年包、2=月包、0=期間包';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'RECE_YN', '是否開立業主發票(Y:是 N:否)';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'POS_YN', '是否使用業主收銀機(Y:是 N:否)';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'CASH_YN', '是否為業主收現(Y:是 N:否)';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'COMM_YN', '是否為抽成(Y:是 N:否)';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'MONEY_Type', '結帳方式，10=十日結、15=半月結、30=月結';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'Store_Way', '配合方式，1=專櫃、2=自營';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'VIP_YN', '是否配合聯名卡(Y:是 N:否)';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'CRT_USR_No', '建立人員';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'CRT_USR_Name', '建立人員姓名';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'UPD_Date', '變更日期';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'UPD_USR_No', '變更人員';
EXEC [dbo].[spUpdateColumnDesc] 'TLTTALENT', 'UPD_USR_Name', '變更人員姓名';


/*TLTTALENT_CHARGEM 專櫃抽成主檔*/
IF OBJECT_ID(N'dbo.TLTTALENT_CHARGEM', N'U') IS NULL
BEGIN
CREATE TABLE TLTTALENT_CHARGEM
(
    MID                 DECIMAL(19) DEFAULT 0 NOT NULL,     /*商戶編號*/
    Talent_ID           DECIMAL(19,0)       NOT NULL,       /*專櫃合約編號系統 ID*/
    TLT_ID              CHAR(1)             NOT NULL,       /*抽成類別(0-9)*/
    TLT_ID_Desc         NVARCHAR(30)            NULL,       /*抽成類別名稱*/
    CAG_BDate           DATETIME            NOT NULL,       /*日期起日*/
    CAG_EDate           DATETIME            NOT NULL,       /*日期迄日*/
    CAG_TaxType         CHAR(1)             NOT NULL,       /*課稅別 0=免稅 1=應稅  */

    CRT_Date            DATETIME                NULL,       /*建立日期*/
    CRT_USR_No          VARCHAR(16)             NULL,       /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)            NULL,       /*建立人員姓名*/
    UPD_Date            DATETIME                NULL,       /*變更日期*/
    UPD_USR_No          VARCHAR(16)             NULL,       /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)            NULL,       /*變更人員姓名*/

	CONSTRAINT PK_TLTTALENT_CHARGEM PRIMARY KEY CLUSTERED (MID, Talent_ID, TLT_ID)
)
END


/*TLTTALENT_CHARGED 專櫃抽成明細檔*/
IF OBJECT_ID(N'dbo.TLTTALENT_CHARGED', N'U') IS NULL
BEGIN
CREATE TABLE TLTTALENT_CHARGED
(
    MID                 DECIMAL(19) DEFAULT 0 NOT NULL,     /*商戶編號*/
    Talent_ID           DECIMAL(19,0)       NOT NULL,       /*專櫃合約編號系統 ID*/
    TLT_ID              CHAR(1)             NOT NULL,       /*抽成類別(0-9)*/
    CAG_BarCode         CHAR(3)             NOT NULL,       /*折數(SYS1000.T101)*/
    TLT_BDate           DATETIME            NOT NULL,       /*抽成起始日期*/
    TLT_EDate           DATETIME            NOT NULL,       /*抽成終止日期*/
    CAG_Charge_Rate     DECIMAL(8,6)        NOT NULL,       /*抽成比率*/

    CRT_Date            DATETIME                NULL,       /*建立日期*/
    CRT_USR_No          VARCHAR(16)             NULL,       /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)            NULL,       /*建立人員姓名*/
    UPD_Date            DATETIME                NULL,       /*變更日期*/
    UPD_USR_No          VARCHAR(16)             NULL,       /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)            NULL,       /*變更人員姓名*/

	CONSTRAINT PK_TLTTALENT_CHARGED PRIMARY KEY CLUSTERED (MID, Talent_ID, TLT_ID, CAG_BarCode, TLT_BDate)
)
END


/*POS5001 通告檔 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS5001')
BEGIN
CREATE TABLE POS5001
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    STO_No              VARCHAR(10)         NOT NULL,     /*門市店號 POS1001.SYS_StoreNo*/
    NOT_DateTime        DATETIME            NOT NULL,     /*通告日期時間(YYYY/MM/DD HH:NN:SS)*/
    NOT_Type            VARCHAR(06) DEFAULT '000000' NOT NULL,     /*通告顯示種類，固定為000000 */
    ECR_No              VARCHAR(10) DEFAULT 'XXXXXX' NOT NULL,     /*收銀機號，固定為XXXXXX */
    NOT_BegDateTime     DATETIME            NOT NULL,     /*有效開始時間*/
    NOT_EndDateTime     DATETIME            NOT NULL,     /*有效結束時間*/
    NOT_Desc            NVARCHAR(255)           NULL,     /*通告內容*/
    NOT_Status          VARCHAR(02)             NULL,     /*通告狀態 A=已生效(預設值) D=已刪除*/
    NOT_Remark          NVARCHAR(60)            NULL,     /*通告備註*/
    NOT_DispRt          CHAR(01)                NULL,     /*即時顯示 Y/N*/
    NOT_DispSpd         CHAR(01)                NULL,     /*暫停時顯示 Y/N*/
    NOT_DispBtn         CHAR(01)                NULL,     /*按下功能鍵顯示 Y/N*/
    NOT_DispCd          CHAR(01)                NULL,     /*客顯器顯示 Y/N*/
    NOT_Prn             CHAR(01)                NULL,     /*銷貨明細表列印 Y/N*/
    NOT_DtlLimit        CHAR(01)                NULL,     /*是否限制播放條件(比對POS50012)，0=不限制(預設值)、1=符合明細設定的機台才播放、2=不符合明細設定的機台才播放*/

    CRT_Date            DATETIME                NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)             NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)            NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME                NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)             NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)            NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS5001 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS5001_MST')
  CREATE INDEX IDX_POS5001_MST ON POS5001 (STO_No, NOT_DateTime, NOT_Type, ECR_No);

EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'STO_No', '門市店號POS1001.SYS_StoreNo';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'NOT_DateTime', '通告日期時間(YYYY/MM/DD HH:NN:SS)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'NOT_Type', '通告顯示種類，固定為000000';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'ECR_No', '收銀機號，固定為XXXXXX';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'NOT_BegDateTime', '有效開始時間'
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'NOT_EndDateTime', '有效結束時間'
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'NOT_Desc', '通告內容'
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'NOT_Status', '通告狀態A=已生效(預設值)D=已刪除'
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'NOT_Remark', '通告備註'
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'NOT_DispRt', '即時顯示Y/N'
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'NOT_DispSpd', '暫停時顯示Y/N'
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'NOT_DispBtn', '按下功能鍵顯示Y/N'
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'NOT_DispCd', '客顯器顯示Y/N'
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'NOT_Prn', '銷貨明細表列印Y/N'
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'NOT_DtlLimit', '是否限制播放條件(比對POS50012)，0=不限制(預設值)、1=符合明細設定的機台才播放、2=不符合明細設定的機台才播放'
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'CRT_USR_No', '建立人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'CRT_USR_Name', '建立人員姓名';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'UPD_Date', '變更日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'UPD_USR_No', '變更人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001', 'UPD_USR_Name', '變更人員姓名';



/*POS5001D 通告設定明細檔(多筆)*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS5001D')
BEGIN
CREATE TABLE POS5001D
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    STO_No              VARCHAR(06)         NOT NULL,      /*門市店號 POS1001.SYS_StoreNo*/
    NOT_DateTime        DATETIME            NOT NULL,      /*通告產生日期時間*/
    NOT_Type            VARCHAR(06) DEFAULT '000000' NOT NULL,      /*通告顯示種類 POS5001.NOT_Type*/
    NOT_SeqNo           DECIMAL(06)         NOT NULL,      /*通告序號*/
    ECR_No              VARCHAR(10)             NULL,      /*收銀機號 POS1002.ECR_No*/
    ECR_Type            VARCHAR(02)             NULL,      /*機台類型 POS1002.ECR_Type*/
    ECR_GrpNo           VARCHAR(20)             NULL,      /*機台群組編號 POS1002GRM.ECR_GrpNo*/
    TLT_No              VARCHAR(12)             NULL,      /*專櫃編號*/
    BUILDING_No         VARCHAR(02)             NULL,      /*場館代碼*/
    FLOOR_No            VARCHAR(02)             NULL,      /*樓層代碼*/
    AREA_No             VARCHAR(02)             NULL,      /*區域代碼*/

    CRT_Date            DATETIME                NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)             NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)            NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME                NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)             NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)            NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS50013 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS5001D_MST')
  CREATE INDEX IDX_POS5001D_MST ON POS5001D (STO_No, NOT_DateTime, NOT_Type, NOT_SeqNo);

EXEC [dbo].[spUpdateColumnDesc] 'POS5001D', 'STO_No', '門市店號POS1001.SYS_StoreNo';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001D', 'NOT_DateTime', '通告日期時間(YYYY/MM/DD HH:NN:SS)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001D', 'NOT_Type', '通告顯示種類，固定為000000';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001D', 'NOT_SeqNo', '通告序號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001D', 'ECR_No', '收銀機號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001D', 'ECR_Type', '機台類型 POS1002.ECR_Type';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001D', 'ECR_GrpNo', '機台群組編號 POS1002GRM.ECR_GrpNo';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001D', 'TLT_No', '專櫃編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001D', 'BUILDING_No', '場館代碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001D', 'FLOOR_No', '樓層代碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001D', 'AREA_No', '區域代碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001D', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001D', 'CRT_USR_No', '建立人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001D', 'CRT_USR_Name', '建立人員姓名';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001D', 'UPD_Date', '變更日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001D', 'UPD_USR_No', '變更人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS5001D', 'UPD_USR_Name', '變更人員姓名';


/*POS50011 廣告資訊設定檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS50011')
BEGIN
CREATE TABLE POS50011
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    STO_No              VARCHAR(06)         NOT NULL,      /*門市店號 POS1001.SYS_StoreNo*/
    NOT_No              VARCHAR(20)         NOT NULL,      /*廣告案號，編號規則 NTM + 廣告日期YYMMDD + 流水號4碼，例如 MTN2401010001 */
    NOT_Date            DATETIME            NOT NULL,      /*廣告日期*/
    NOT_BegDate         DATETIME            NOT NULL,      /*有效開始日期時間*/
    NOT_EndDate         DATETIME            NOT NULL,      /*有效結束日期時間*/
    NOT_Status          CHAR(01)            NOT NULL,      /*狀態 0=未確認(未審核) 1=已確認(已審核) 2=已刪除*/
    NOT_Priority        DECIMAL(02)         NOT NULL,      /*優先順序，預設值為0(在同一段時間的優先順序9-0, 9最優先)*/
    NOT_File            NVARCHAR(200)       NOT NULL,      /*媒體檔案名稱*/
    NOT_Note            NVARCHAR(255)           NULL,      /*備註*/
    NOT_PlayTime        DECIMAL(06)             NULL,      /*媒體檔播放秒數，預設值為30*/
    NOT_DtlLimit        CHAR(01)                NULL,      /*是否限制播放條件，POS50012*/
                                                           /*  0=不限制(預設值)*/
                                                           /*  1=符合明細設定的機台才播放*/
                                                           /*  2=不符合明細設定的機台才播放*/

    NOT_AprvDate        DATETIME                NULL,      /*核准日期 YYYY/MM/DD*/
    NOT_AprvUsrNo       VARCHAR(08)             NULL,      /*核准人員*/
    NOT_AprvUsrName     NVARCHAR(20)            NULL,      /*核准人員姓名*/
    NOT_DelDate         DATETIME                NULL,      /*刪除日期 YYYY/MM/DD*/
    NOT_DelUsrNo        VARCHAR(08)             NULL,      /*刪除人員*/
    NOT_DelUsrName      NVARCHAR(20)            NULL,      /*刪除人員姓名*/

    CRT_Date            DATETIME                NULL,      /*建立日期*/
    CRT_USR_No          VARCHAR(16)             NULL,      /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)            NULL,      /*建立人員姓名*/
    UPD_Date            DATETIME                NULL,      /*變更日期*/
    UPD_USR_No          VARCHAR(16)             NULL,      /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)            NULL,      /*變更人員姓名*/

    CONSTRAINT PK_POS50011 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS50011_MST')
  CREATE INDEX IDX_POS50011_MST ON POS50011 (STO_No, NOT_No);


/*POS50012 廣告資訊設定明細檔(多筆)*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS50012')
BEGIN
CREATE TABLE POS50012
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    STO_No              VARCHAR(06)         NOT NULL,      /*門市店號 POS1001.SYS_StoreNo*/
    NOT_No              VARCHAR(20)         NOT NULL,      /*通告編號*/
    NOT_SeqNo           DECIMAL(06)         NOT NULL,      /*通告序號*/
    NOT_Status          CHAR(01)            NOT NULL,      /*狀態 0=未確認 1=已確認 2=已刪除*/
    ECR_No              VARCHAR(10)             NULL,      /*收銀機號 POS1002.ECR_No*/
    ECR_Type            VARCHAR(02)             NULL,      /*機台類型 POS1002.ECR_Type*/
    ECR_GrpNo           VARCHAR(20)             NULL,      /*機台群組編號 POS1002GRM.ECR_GrpNo*/
    TLT_No              VARCHAR(12)             NULL,      /*專櫃編號*/
    BUILDING_No         VARCHAR(02)             NULL,      /*場館代碼*/
    FLOOR_No            VARCHAR(02)             NULL,      /*樓層代碼*/
    AREA_No             VARCHAR(02)             NULL,      /*區域代碼*/

    CRT_Date            DATETIME                NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)             NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)            NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME                NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)             NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)            NULL,     /*變更人員姓名*/

    CONSTRAINT PK_POS50012 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS50012_MST')
  CREATE INDEX IDX_POS50012_MST ON POS50012 (STO_No, NOT_No, NOT_SeqNo);


/*POS3001 收銀員交班檔 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS3001')
BEGIN
CREATE TABLE POS3001
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    SYS_StoreNo         VARCHAR(10)        NOT NULL,     /*門市店號*/
    TXN_Date            DATE               NOT NULL,     /*交易日期*/
    USR_No              VARCHAR(16)        NOT NULL,     /*收銀員編號*/
    ECR_No              VARCHAR(10)        NOT NULL,     /*收銀機號*/
    SLU_Class           VARCHAR(02)        NOT NULL,     /*班別*/
    SLU_Mode            VARCHAR(02)        NOT NULL,     /*交易模式*/
    SLU_ClassFin        CHAR(01)           NOT NULL,     /*是否已交班*/
    TLT_No              VARCHAR(12)            NULL,     /*專櫃編號*/
    SLU_SerNo           DECIMAL(06)            NULL,     /*交班序號*/
    SLU_TxnBegNo        DECIMAL(06)        NOT NULL,     /*交易開始序號*/
    SLU_TxnEndNo        DECIMAL(06)        NOT NULL,     /*交易結束序號*/
    SLU_GUIBegNo        VARCHAR(10)        NOT NULL,     /*發票開始號碼*/
    SLU_GUIEndNo        VARCHAR(10)        NOT NULL,     /*發票結束號碼*/
    SLU_TxnBegTime      DATETIME           NOT NULL,     /*交易開始時間*/
    SLU_TxnEndTime      DATETIME               NULL,     /*交易結束時間*/
    SLU_SaleCustCnt     DECIMAL(08)        NOT NULL,     /*銷售客次*/
    SLU_SaleQty         DECIMAL(08)        NOT NULL,     /*銷售總數量*/
    SLU_SaleAmt         DECIMAL(14,4)      NOT NULL,     /*銷售總額*/
    SLU_SaleTax         DECIMAL(14,4)      NOT NULL,     /*應稅銷售總額*/
    SLU_SaleNoTax       DECIMAL(14,4)      NOT NULL,     /*免稅銷售總額*/
    SLU_SaleZeroTax     DECIMAL(14,4)      NOT NULL,     /*零稅銷售總額*/
    SLU_TotTax          DECIMAL(14,4)      NOT NULL,     /*總稅額*/
    SLU_RjtCustCnt      DECIMAL(08)        NOT NULL,     /*退貨客次*/
    SLU_RjtQty          DECIMAL(08)        NOT NULL,     /*退貨總數量*/
    SLU_RjtAmt          DECIMAL(14,4)      NOT NULL,     /*退貨總金額*/
    SLU_RjtTax          DECIMAL(14,4)      NOT NULL,     /*應稅退貨總額*/
    SLU_RjtNoTax        DECIMAL(14,4)      NOT NULL,     /*免稅退貨總額*/
    SLU_RjtZeroTax      DECIMAL(14,4)      NOT NULL,     /*零稅退貨總額*/
    SLU_RjtTotTax       DECIMAL(14,4)      NOT NULL,     /*退貨總稅額*/
    SLU_VoidCustCnt     DECIMAL(08)        NOT NULL,     /*作廢客次*/
    SLU_VoidQty         DECIMAL(08)        NOT NULL,     /*作廢總數量*/
    SLU_VoidAmt         DECIMAL(14,4)      NOT NULL,     /*作廢總額*/
    SLU_VoidTax         DECIMAL(14,4)      NOT NULL,     /*應稅作廢總額*/
    SLU_VoidNoTax       DECIMAL(14,4)      NOT NULL,     /*免稅作廢總額*/
    SLU_VoidZeroTax     DECIMAL(14,4)      NOT NULL,     /*零稅作廢總額*/
    SLU_VoidTotTax      DECIMAL(14,4)      NOT NULL,     /*作廢總稅額*/
    SLU_OverCustCnt     DECIMAL(08)        NOT NULL,     /*溢收客次*/
    SLU_OverQty         DECIMAL(08)        NOT NULL,     /*溢收總數量*/
    SLU_OverAmt         DECIMAL(14,4)      NOT NULL,     /*溢收總額*/
    SLU_DiscSCnt        DECIMAL(08)        NOT NULL,     /*人工折扣次數*/
    SLU_DiscSAmt        DECIMAL(14,4)      NOT NULL,     /*人工折扣總額*/
    SLU_DiscMCnt        DECIMAL(08)        NOT NULL,     /*自動折扣次數*/
    SLU_DiscMAmt        DECIMAL(14,4)      NOT NULL,     /*自動折扣總額*/
    SLU_DiscTCnt        DECIMAL(08)        NOT NULL,     /*總合折扣次數*/
    SLU_DiscTAmt        DECIMAL(14,4)      NOT NULL,     /*總合折扣總額*/
    SLU_CashCnt         DECIMAL(08)        NOT NULL,     /*中途取現次數*/
    SLU_CashAmt         DECIMAL(14,4)      NOT NULL,     /*中途取現總額*/
    SLU_ModiCnt         DECIMAL(08)        NOT NULL,     /*更正次數*/
    SLU_ModiAmt         DECIMAL(14,4)      NOT NULL,     /*更正總額*/
    SLU_CancelCnt       DECIMAL(08)        NOT NULL,     /*交易取消次數*/
    SLU_ChangeCnt       DECIMAL(08)        NOT NULL,     /*退換次數*/
    SLU_OpenBoxCnt      DECIMAL(08)        NOT NULL,     /*開抽屜次數*/
    SLU_DisRecCnt1      DECIMAL(08)        NOT NULL,     /*代收１次數*/
    SLU_DisRecCnt2      DECIMAL(08)        NOT NULL,     /*代收２次數*/
    SLU_DisRecCnt3      DECIMAL(08)        NOT NULL,     /*代收３次數*/
    SLU_DisRecCnt4      DECIMAL(08)        NOT NULL,     /*代收４次數*/
    SLU_DisRecCnt5      DECIMAL(08)        NOT NULL,     /*代收５次數*/
    SLU_DisRecAmt1      DECIMAL(14,4)      NOT NULL,     /*代收總額*/
    SLU_DisRecAmt2      DECIMAL(14,4)      NOT NULL,     /*代售總額*/
    SLU_DisRecAmt3      DECIMAL(14,4)      NOT NULL,     /*代收３總額*/
    SLU_DisRecAmt4      DECIMAL(14,4)      NOT NULL,     /*娛樂稅總額*/
    SLU_DisRecAmt5      DECIMAL(14,4)      NOT NULL,     /*健康捐總額*/
    SLU_DisPayCnt1      DECIMAL(08)        NOT NULL,     /*代支１次數*/
    SLU_DisPayCnt2      DECIMAL(08)        NOT NULL,     /*代支２次數*/
    SLU_DisPayCnt3      DECIMAL(08)        NOT NULL,     /*代支３次數*/
    SLU_DisPayCnt4      DECIMAL(08)        NOT NULL,     /*代支４次數*/
    SLU_DisPayCnt5      DECIMAL(08)        NOT NULL,     /*代支５次數*/
    SLU_DisPayAmt1      DECIMAL(14,4)      NOT NULL,     /*代支１總額*/
    SLU_DisPayAmt2      DECIMAL(14,4)      NOT NULL,     /*代支２總額*/
    SLU_DisPayAmt3      DECIMAL(14,4)      NOT NULL,     /*代支３總額*/
    SLU_DisPayAmt4      DECIMAL(14,4)      NOT NULL,     /*代支４總額*/
    SLU_DisPayAmt5      DECIMAL(14,4)      NOT NULL,     /*代支５總額*/
    SLU_DiscCnt1        DECIMAL(08)        NOT NULL,     /*折扣１次數*/
    SLU_DiscCnt2        DECIMAL(08)        NOT NULL,     /*折扣２次數*/
    SLU_DiscCnt3        DECIMAL(08)        NOT NULL,     /*折扣３次數*/
    SLU_DiscAmt1        DECIMAL(14,4)      NOT NULL,     /*折扣１總額*/
    SLU_DiscAmt2        DECIMAL(14,4)      NOT NULL,     /*折扣２總額*/
    SLU_DiscAmt3        DECIMAL(14,4)      NOT NULL,     /*折扣３總額*/
    SLU_LetCnt1         DECIMAL(08)        NOT NULL,     /*折讓１次數*/
    SLU_LetCnt2         DECIMAL(08)        NOT NULL,     /*折讓２次數*/
    SLU_LetCnt3         DECIMAL(08)        NOT NULL,     /*折讓３次數*/
    SLU_LetAmt1         DECIMAL(14,4)      NOT NULL,     /*折讓１總額*/
    SLU_LetAmt2         DECIMAL(14,4)      NOT NULL,     /*折讓２總額*/
    SLU_LetAmt3         DECIMAL(14,4)      NOT NULL,     /*折讓３總額*/
    SLU_DubCnt1         DECIMAL(08)        NOT NULL,     /*加成１次數*/
    SLU_DubCnt2         DECIMAL(08)        NOT NULL,     /*加成２次數*/
    SLU_DubCnt3         DECIMAL(08)        NOT NULL,     /*加成３次數*/
    SLU_DubAmt1         DECIMAL(14,4)      NOT NULL,     /*加成１總額*/
    SLU_DubAmt2         DECIMAL(14,4)      NOT NULL,     /*加成２總額*/
    SLU_DubAmt3         DECIMAL(14,4)      NOT NULL,     /*加成３總額*/
    SLU_TDiscCnt1       DECIMAL(08)        NOT NULL,     /*小計折扣１次數*/
    SLU_TDiscCnt2       DECIMAL(08)        NOT NULL,     /*小計折扣２次數*/
    SLU_TDiscCnt3       DECIMAL(08)        NOT NULL,     /*小計折扣３次數*/
    SLU_TDiscAmt1       DECIMAL(14,4)      NOT NULL,     /*小計折扣１總額*/
    SLU_TDiscAmt2       DECIMAL(14,4)      NOT NULL,     /*小計折扣２總額*/
    SLU_TDiscAmt3       DECIMAL(14,4)      NOT NULL,     /*小計折扣３總額*/
    SLU_TLetCnt1        DECIMAL(08)        NOT NULL,     /*小計折讓１次數*/
    SLU_TLetCnt2        DECIMAL(08)        NOT NULL,     /*小計折讓２次數*/
    SLU_TLetCnt3        DECIMAL(08)        NOT NULL,     /*小計折讓３次數*/
    SLU_TLetAmt1        DECIMAL(14,4)      NOT NULL,     /*小計折讓１總額*/
    SLU_TLetAmt2        DECIMAL(14,4)      NOT NULL,     /*小計折讓２總額*/
    SLU_TLetAmt3        DECIMAL(14,4)      NOT NULL,     /*小計折讓３總額*/
    SLU_TDubCnt1        DECIMAL(08)        NOT NULL,     /*小計加成１次數*/
    SLU_TDubCnt2        DECIMAL(08)        NOT NULL,     /*小計加成２次數*/
    SLU_TDubCnt3        DECIMAL(08)        NOT NULL,     /*小計加成３次數*/
    SLU_TDubAmt1        DECIMAL(14,4)      NOT NULL,     /*小計加成１總額*/
    SLU_TDubAmt2        DECIMAL(14,4)      NOT NULL,     /*小計加成２總額*/
    SLU_TDubAmt3        DECIMAL(14,4)      NOT NULL,     /*小計加成３總額*/
    SLU_CashOnDraw      DECIMAL(14,4)      NOT NULL,     /*抽屜現金*/
    SLU_ChangeCashCnt   DECIMAL(08)        NOT NULL,     /*零用金次數*/
    SLU_ChangeCashAmt   DECIMAL(14,4)      NOT NULL,     /*零用金總額*/
    SLU_PreOrderCnt     DECIMAL(08)            NULL,     /*預收銷售次數，預設值為0*/
    SLU_PreOrderAmt     DECIMAL(14,4)          NULL,     /*預收銷售金額，預設值為0*/
    SLU_GetOrderCnt     DECIMAL(08)            NULL,     /*預收取貨次數，預設值為0*/
    SLU_GetOrderAmt     DECIMAL(14,4)          NULL,     /*預收取貨金額，預設值為0*/
    SLU_GUICnt          DECIMAL(08)        NOT NULL,     /*發票開立張數，預設值為0，統計在該班別開立過的發票張數，無論該筆發票是否作廢，皆需計入*/
    SLU_VoidGUICnt      DECIMAL(08)        NOT NULL,     /*作廢發票張數，預設值為0*/
    SLU_RefundGUICnt    DECIMAL(08)            NULL,     /*折讓單開立客次，預設值為0*/
    SLU_RefundGUIQty    DECIMAL(08)            NULL,     /*折讓單開立張數，預設值為0*/
    SLU_RefundGUIAmt    DECIMAL(14,4)          NULL,     /*折讓單開立總額*/
    SLU_RefundGUITax    DECIMAL(14,4)          NULL,     /*折讓單開立應稅銷售總額*/
    SLU_RefundGUINoTax  DECIMAL(14,4)          NULL,     /*折讓單開立免稅銷售總額*/
    SLU_RefundGUIZeroTax DECIMAL(14,4)         NULL,     /*折讓單開立零稅銷售總額*/
    SLU_RefVoidGUICnt   DECIMAL(08)            NULL,     /*折讓單作廢客次*/
    SLU_RefVoidGUIQty   DECIMAL(08)            NULL,     /*折讓單作廢張數，預設值為0*/
    SLU_RefVoidGUIAmt   DECIMAL(14,4)          NULL,     /*折讓單作廢總額*/
    SLU_RefVoidGUITax   DECIMAL(14,4)          NULL,     /*折讓單作廢應稅銷售總額*/
    SLU_RefVoidGUINoTax DECIMAL(14,4)          NULL,     /*折讓單作廢免稅銷售總額*/
    SLU_RefVoidGUIZeroTax DECIMAL(14,4)        NULL,     /*折讓單作廢零稅銷售總額*/
    SLU_RefVoidTotTax   DECIMAL(14,4)      NOT NULL,     /*折讓單作廢總稅額*/
    SLU_PayCnt1         DECIMAL(08)        NOT NULL,     /*付款０１筆數*/
    SLU_PayCnt2         DECIMAL(08)        NOT NULL,     /*付款０２筆數*/
    SLU_PayCnt3         DECIMAL(08)        NOT NULL,     /*付款０３筆數*/
    SLU_PayCnt4         DECIMAL(08)        NOT NULL,     /*付款０４筆數*/
    SLU_PayCnt5         DECIMAL(08)        NOT NULL,     /*信用０卡筆數*/
    SLU_PayCnt6         DECIMAL(08)        NOT NULL,     /*付款０６筆數*/
    SLU_PayCnt7         DECIMAL(08)        NOT NULL,     /*付款０７筆數*/
    SLU_PayCnt8         DECIMAL(08)        NOT NULL,     /*付款０８筆數*/
    SLU_PayCnt9         DECIMAL(08)        NOT NULL,     /*付款０９筆數*/
    SLU_PayCnt10        DECIMAL(08)        NOT NULL,     /*付款１０筆數*/
    SLU_PayCnt11        DECIMAL(08)        NOT NULL,     /*付款１１筆數*/
    SLU_PayCnt12        DECIMAL(08)        NOT NULL,     /*付款１２筆數*/
    SLU_PayCnt13        DECIMAL(08)        NOT NULL,     /*付款１３筆數*/
    SLU_PayCnt14        DECIMAL(08)        NOT NULL,     /*付款１４筆數*/
    SLU_PayCnt15        DECIMAL(08)        NOT NULL,     /*付款１５筆數*/
    SLU_PayCnt16        DECIMAL(08)        NOT NULL,     /*付款１６筆數*/
    SLU_PayCnt17        DECIMAL(08)        NOT NULL,     /*付款１７筆數*/
    SLU_PayCnt18        DECIMAL(08)        NOT NULL,     /*付款１８筆數*/
    SLU_PayCnt19        DECIMAL(08)        NOT NULL,     /*付款１９筆數*/
    SLU_PayCnt20        DECIMAL(08)        NOT NULL,     /*付款２０筆數*/
    SLU_PayCnt21        DECIMAL(08)            NULL,     /*付款２１筆數*/
    SLU_PayCnt22        DECIMAL(08)            NULL,     /*付款２２筆數*/
    SLU_PayCnt23        DECIMAL(08)            NULL,     /*付款２３筆數*/
    SLU_PayCnt24        DECIMAL(08)            NULL,     /*付款２４筆數*/
    SLU_PayCnt25        DECIMAL(08)            NULL,     /*付款２５筆數*/
    SLU_PayCnt26        DECIMAL(08)            NULL,     /*付款２６筆數*/
    SLU_PayCnt27        DECIMAL(08)            NULL,     /*付款２７筆數*/
    SLU_PayCnt28        DECIMAL(08)            NULL,     /*付款２８筆數*/
    SLU_PayCnt29        DECIMAL(08)            NULL,     /*付款２９筆數*/
    SLU_PayCnt30        DECIMAL(08)            NULL,     /*付款３０筆數*/
    SLU_PayCnt31        DECIMAL(08)            NULL,     /*付款３１筆數*/
    SLU_PayCnt32        DECIMAL(08)            NULL,     /*付款３２筆數*/
    SLU_PayCnt33        DECIMAL(08)            NULL,     /*付款３３筆數*/
    SLU_PayCnt34        DECIMAL(08)            NULL,     /*付款３４筆數*/
    SLU_PayCnt35        DECIMAL(08)            NULL,     /*付款３５筆數*/
    SLU_PayCnt36        DECIMAL(08)            NULL,     /*付款３６筆數*/
    SLU_PayCnt37        DECIMAL(08)            NULL,     /*付款３７筆數*/
    SLU_PayCnt38        DECIMAL(08)            NULL,     /*付款３８筆數*/
    SLU_PayCnt39        DECIMAL(08)            NULL,     /*付款３９筆數*/
    SLU_PayCnt40        DECIMAL(08)            NULL,     /*付款４０筆數*/
    SLU_PayCnt41        DECIMAL(08)            NULL,     /*付款４１筆數*/
    SLU_PayCnt42        DECIMAL(08)            NULL,     /*付款４２筆數*/
    SLU_PayCnt43        DECIMAL(08)            NULL,     /*付款４３筆數*/
    SLU_PayCnt44        DECIMAL(08)            NULL,     /*付款４４筆數*/
    SLU_PayCnt45        DECIMAL(08)            NULL,     /*付款４５筆數*/
    SLU_PayCnt46        DECIMAL(08)            NULL,     /*付款４６筆數*/
    SLU_PayCnt47        DECIMAL(08)            NULL,     /*付款４７筆數*/
    SLU_PayCnt48        DECIMAL(08)            NULL,     /*付款４８筆數*/
    SLU_PayCnt49        DECIMAL(08)            NULL,     /*付款４９筆數*/
    SLU_PayCnt50        DECIMAL(08)            NULL,     /*付款５０筆數*/
    SLU_PayCnt51        DECIMAL(08)            NULL,     /*付款５１筆數*/
    SLU_PayCnt52        DECIMAL(08)            NULL,     /*付款５２筆數*/
    SLU_PayCnt53        DECIMAL(08)            NULL,     /*付款５３筆數*/
    SLU_PayCnt54        DECIMAL(08)            NULL,     /*付款５４筆數*/
    SLU_PayCnt55        DECIMAL(08)            NULL,     /*付款５５筆數*/
    SLU_PayCnt56        DECIMAL(08)            NULL,     /*付款５６筆數*/
    SLU_PayCnt57        DECIMAL(08)            NULL,     /*付款５７筆數*/
    SLU_PayCnt58        DECIMAL(08)            NULL,     /*付款５８筆數*/
    SLU_PayCnt59        DECIMAL(08)            NULL,     /*付款５９筆數*/
    SLU_PayCnt60        DECIMAL(08)            NULL,     /*付款６０筆數*/
    SLU_PayCnt61        DECIMAL(08)            NULL,     /*付款６１筆數*/
    SLU_PayCnt62        DECIMAL(08)            NULL,     /*付款６２筆數*/
    SLU_PayCnt63        DECIMAL(08)            NULL,     /*付款６３筆數*/
    SLU_PayCnt64        DECIMAL(08)            NULL,     /*付款６４筆數*/
    SLU_PayCnt65        DECIMAL(08)            NULL,     /*付款６５筆數*/
    SLU_PayCnt66        DECIMAL(08)            NULL,     /*付款６６筆數*/
    SLU_PayCnt67        DECIMAL(08)            NULL,     /*付款６７筆數*/
    SLU_PayCnt68        DECIMAL(08)            NULL,     /*付款６８筆數*/
    SLU_PayCnt69        DECIMAL(08)            NULL,     /*付款６９筆數*/
    SLU_PayCnt70        DECIMAL(08)            NULL,     /*付款７０筆數*/
    SLU_PayCnt71        DECIMAL(08)            NULL,     /*付款７１筆數*/
    SLU_PayCnt72        DECIMAL(08)            NULL,     /*付款７２筆數*/
    SLU_PayCnt73        DECIMAL(08)            NULL,     /*付款７３筆數*/
    SLU_PayCnt74        DECIMAL(08)            NULL,     /*付款７４筆數*/
    SLU_PayCnt75        DECIMAL(08)            NULL,     /*付款７５筆數*/
    SLU_PayCnt76        DECIMAL(08)            NULL,     /*付款７６筆數*/
    SLU_PayCnt77        DECIMAL(08)            NULL,     /*付款７７筆數*/
    SLU_PayCnt78        DECIMAL(08)            NULL,     /*付款７８筆數*/
    SLU_PayCnt79        DECIMAL(08)            NULL,     /*付款７９筆數*/
    SLU_PayCnt80        DECIMAL(08)            NULL,     /*付款８０筆數*/
    SLU_PayCnt81        DECIMAL(08)            NULL,     /*付款８１筆數*/
    SLU_PayCnt82        DECIMAL(08)            NULL,     /*付款８２筆數*/
    SLU_PayCnt83        DECIMAL(08)            NULL,     /*付款８３筆數*/
    SLU_PayCnt84        DECIMAL(08)            NULL,     /*付款８４筆數*/
    SLU_PayCnt85        DECIMAL(08)            NULL,     /*付款８５筆數*/
    SLU_PayCnt86        DECIMAL(08)            NULL,     /*付款８６筆數*/
    SLU_PayCnt87        DECIMAL(08)            NULL,     /*付款８７筆數*/
    SLU_PayCnt88        DECIMAL(08)            NULL,     /*付款８８筆數*/
    SLU_PayCnt89        DECIMAL(08)            NULL,     /*付款８９筆數*/
    SLU_PayCnt90        DECIMAL(08)            NULL,     /*付款９０筆數*/
    SLU_PayCnt91        DECIMAL(08)            NULL,     /*付款９１筆數*/
    SLU_PayCnt92        DECIMAL(08)            NULL,     /*付款９２筆數*/
    SLU_PayCnt93        DECIMAL(08)            NULL,     /*付款９３筆數*/
    SLU_PayCnt94        DECIMAL(08)            NULL,     /*付款９４筆數*/
    SLU_PayCnt95        DECIMAL(08)            NULL,     /*付款９５筆數*/
    SLU_PayCnt96        DECIMAL(08)            NULL,     /*付款９６筆數*/
    SLU_PayCnt97        DECIMAL(08)            NULL,     /*付款９７筆數*/
    SLU_PayCnt98        DECIMAL(08)            NULL,     /*付款９８筆數*/
    SLU_PayCnt99        DECIMAL(08)            NULL,     /*付款９９筆數*/
    SLU_PayCnt100       DECIMAL(08)            NULL,     /*付款１００筆數*/
    SLU_PayAmt1         DECIMAL(14,4)      NOT NULL,     /*付款０１總額*/
    SLU_PayAmt2         DECIMAL(14,4)      NOT NULL,     /*付款０２總額*/
    SLU_PayAmt3         DECIMAL(14,4)      NOT NULL,     /*付款０３總額*/
    SLU_PayAmt4         DECIMAL(14,4)      NOT NULL,     /*付款０４總額*/
    SLU_PayAmt5         DECIMAL(14,4)      NOT NULL,     /*信用０卡總額*/
    SLU_PayAmt6         DECIMAL(14,4)      NOT NULL,     /*付款０６總額*/
    SLU_PayAmt7         DECIMAL(14,4)      NOT NULL,     /*付款０７總額*/
    SLU_PayAmt8         DECIMAL(14,4)      NOT NULL,     /*付款０８總額*/
    SLU_PayAmt9         DECIMAL(14,4)      NOT NULL,     /*付款０９總額*/
    SLU_PayAmt10        DECIMAL(14,4)      NOT NULL,     /*付款１０總額*/
    SLU_PayAmt11        DECIMAL(14,4)      NOT NULL,     /*付款１１總額*/
    SLU_PayAmt12        DECIMAL(14,4)      NOT NULL,     /*付款１２總額*/
    SLU_PayAmt13        DECIMAL(14,4)      NOT NULL,     /*付款１３總額*/
    SLU_PayAmt14        DECIMAL(14,4)      NOT NULL,     /*付款１４總額*/
    SLU_PayAmt15        DECIMAL(14,4)      NOT NULL,     /*付款１５總額*/
    SLU_PayAmt16        DECIMAL(14,4)      NOT NULL,     /*付款１６總額*/
    SLU_PayAmt17        DECIMAL(14,4)      NOT NULL,     /*付款１７總額*/
    SLU_PayAmt18        DECIMAL(14,4)      NOT NULL,     /*付款１８總額*/
    SLU_PayAmt19        DECIMAL(14,4)      NOT NULL,     /*付款１９總額*/
    SLU_PayAmt20        DECIMAL(14,4)      NOT NULL,     /*付款２０總額*/
    SLU_PayAmt21        DECIMAL(14,4)          NULL,     /*付款２１總額*/
    SLU_PayAmt22        DECIMAL(14,4)          NULL,     /*付款２２總額*/
    SLU_PayAmt23        DECIMAL(14,4)          NULL,     /*付款２３總額*/
    SLU_PayAmt24        DECIMAL(14,4)          NULL,     /*付款２４總額*/
    SLU_PayAmt25        DECIMAL(14,4)          NULL,     /*付款２５總額*/
    SLU_PayAmt26        DECIMAL(14,4)          NULL,     /*付款２６總額*/
    SLU_PayAmt27        DECIMAL(14,4)          NULL,     /*付款２７總額*/
    SLU_PayAmt28        DECIMAL(14,4)          NULL,     /*付款２８總額*/
    SLU_PayAmt29        DECIMAL(14,4)          NULL,     /*付款２９總額*/
    SLU_PayAmt30        DECIMAL(14,4)          NULL,     /*銷貨退回總額*/
    SLU_PayAmt31        DECIMAL(14,4)          NULL,     /*付款３１總額*/
    SLU_PayAmt32        DECIMAL(14,4)          NULL,     /*付款３２總額*/
    SLU_PayAmt33        DECIMAL(14,4)          NULL,     /*付款３３總額*/
    SLU_PayAmt34        DECIMAL(14,4)          NULL,     /*付款３４總額*/
    SLU_PayAmt35        DECIMAL(14,4)          NULL,     /*付款３５總額*/
    SLU_PayAmt36        DECIMAL(14,4)          NULL,     /*付款３６總額*/
    SLU_PayAmt37        DECIMAL(14,4)          NULL,     /*付款３７總額*/
    SLU_PayAmt38        DECIMAL(14,4)          NULL,     /*付款３８總額*/
    SLU_PayAmt39        DECIMAL(14,4)          NULL,     /*付款３９總額*/
    SLU_PayAmt40        DECIMAL(14,4)          NULL,     /*付款４０總額*/
    SLU_PayAmt41        DECIMAL(14,4)          NULL,     /*付款４１總額*/
    SLU_PayAmt42        DECIMAL(14,4)          NULL,     /*付款４２總額*/
    SLU_PayAmt43        DECIMAL(14,4)          NULL,     /*付款４３總額*/
    SLU_PayAmt44        DECIMAL(14,4)          NULL,     /*付款４４總額*/
    SLU_PayAmt45        DECIMAL(14,4)          NULL,     /*付款４５總額*/
    SLU_PayAmt46        DECIMAL(14,4)          NULL,     /*付款４６總額*/
    SLU_PayAmt47        DECIMAL(14,4)          NULL,     /*付款４７總額*/
    SLU_PayAmt48        DECIMAL(14,4)          NULL,     /*付款４８總額*/
    SLU_PayAmt49        DECIMAL(14,4)          NULL,     /*付款４９總額*/
    SLU_PayAmt50        DECIMAL(14,4)          NULL,     /*付款５０總額*/
    SLU_PayAmt51        DECIMAL(14,4)          NULL,     /*付款５１總額*/
    SLU_PayAmt52        DECIMAL(14,4)          NULL,     /*付款５２總額*/
    SLU_PayAmt53        DECIMAL(14,4)          NULL,     /*付款５３總額*/
    SLU_PayAmt54        DECIMAL(14,4)          NULL,     /*付款５４總額*/
    SLU_PayAmt55        DECIMAL(14,4)          NULL,     /*付款５５總額*/
    SLU_PayAmt56        DECIMAL(14,4)          NULL,     /*付款５６總額*/
    SLU_PayAmt57        DECIMAL(14,4)          NULL,     /*付款５７總額*/
    SLU_PayAmt58        DECIMAL(14,4)          NULL,     /*付款５８總額*/
    SLU_PayAmt59        DECIMAL(14,4)          NULL,     /*付款５９總額*/
    SLU_PayAmt60        DECIMAL(14,4)          NULL,     /*付款６０總額*/
    SLU_PayAmt61        DECIMAL(14,4)          NULL,     /*付款６１總額*/
    SLU_PayAmt62        DECIMAL(14,4)          NULL,     /*付款６２總額*/
    SLU_PayAmt63        DECIMAL(14,4)          NULL,     /*付款６３總額*/
    SLU_PayAmt64        DECIMAL(14,4)          NULL,     /*付款６４總額*/
    SLU_PayAmt65        DECIMAL(14,4)          NULL,     /*付款６５總額*/
    SLU_PayAmt66        DECIMAL(14,4)          NULL,     /*付款６６總額*/
    SLU_PayAmt67        DECIMAL(14,4)          NULL,     /*付款６７總額*/
    SLU_PayAmt68        DECIMAL(14,4)          NULL,     /*付款６８總額*/
    SLU_PayAmt69        DECIMAL(14,4)          NULL,     /*付款６９總額*/
    SLU_PayAmt70        DECIMAL(14,4)          NULL,     /*付款７０總額*/
    SLU_PayAmt71        DECIMAL(14,4)          NULL,     /*付款７１總額*/
    SLU_PayAmt72        DECIMAL(14,4)          NULL,     /*付款７２總額*/
    SLU_PayAmt73        DECIMAL(14,4)          NULL,     /*付款７３總額*/
    SLU_PayAmt74        DECIMAL(14,4)          NULL,     /*付款７４總額*/
    SLU_PayAmt75        DECIMAL(14,4)          NULL,     /*付款７５總額*/
    SLU_PayAmt76        DECIMAL(14,4)          NULL,     /*付款７６總額*/
    SLU_PayAmt77        DECIMAL(14,4)          NULL,     /*付款７７總額*/
    SLU_PayAmt78        DECIMAL(14,4)          NULL,     /*付款７８總額*/
    SLU_PayAmt79        DECIMAL(14,4)          NULL,     /*付款７９總額*/
    SLU_PayAmt80        DECIMAL(14,4)          NULL,     /*付款８０總額*/
    SLU_PayAmt81        DECIMAL(14,4)          NULL,     /*付款８１總額*/
    SLU_PayAmt82        DECIMAL(14,4)          NULL,     /*付款８２總額*/
    SLU_PayAmt83        DECIMAL(14,4)          NULL,     /*付款８３總額*/
    SLU_PayAmt84        DECIMAL(14,4)          NULL,     /*付款８４總額*/
    SLU_PayAmt85        DECIMAL(14,4)          NULL,     /*付款８５總額*/
    SLU_PayAmt86        DECIMAL(14,4)          NULL,     /*付款８６總額*/
    SLU_PayAmt87        DECIMAL(14,4)          NULL,     /*付款８７總額*/
    SLU_PayAmt88        DECIMAL(14,4)          NULL,     /*付款８８總額*/
    SLU_PayAmt89        DECIMAL(14,4)          NULL,     /*付款８９總額*/
    SLU_PayAmt90        DECIMAL(14,4)          NULL,     /*付款９０總額*/
    SLU_PayAmt91        DECIMAL(14,4)          NULL,     /*付款９１總額*/
    SLU_PayAmt92        DECIMAL(14,4)          NULL,     /*付款９２總額*/
    SLU_PayAmt93        DECIMAL(14,4)          NULL,     /*付款９３總額*/
    SLU_PayAmt94        DECIMAL(14,4)          NULL,     /*付款９４總額*/
    SLU_PayAmt95        DECIMAL(14,4)          NULL,     /*付款９５總額*/
    SLU_PayAmt96        DECIMAL(14,4)          NULL,     /*付款９６總額*/
    SLU_PayAmt97        DECIMAL(14,4)          NULL,     /*付款９７總額*/
    SLU_PayAmt98        DECIMAL(14,4)          NULL,     /*付款９８總額*/
    SLU_PayAmt99        DECIMAL(14,4)          NULL,     /*付款９９總額*/
    SLU_PayAmt100       DECIMAL(14,4)          NULL,     /*付款１００總額*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/

    CONSTRAINT PK_POS3001 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS3001_MST')
  CREATE INDEX IDX_POS3001_MST ON POS3001 (SYS_StoreNo, TXN_Date, USR_No, ECR_No, SLU_Class);


/*POS3002 收銀機財務日檔 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS3002')
BEGIN
CREATE TABLE POS3002
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    SYS_StoreNo         VARCHAR(10)        NOT NULL,     /*門市店號*/
    TXN_Date            DATE               NOT NULL,     /*交易日期*/
    ECR_No              VARCHAR(10)        NOT NULL,     /*收銀機號*/
    TLT_No              VARCHAR(12)            NULL,     /*專櫃編號*/
    SLE_TxnBegTime      DATETIME           NOT NULL,     /*交易開始時間*/
    SLE_TxnEndTime      DATETIME               NULL,     /*交易結束時間*/
    SLE_GUIBegNo        VARCHAR(10)        NOT NULL,     /*發票開始號碼*/
    SLE_GUIEndNo        VARCHAR(10)        NOT NULL,     /*發票結束號碼*/
    SLE_TxnBegNo        DECIMAL(06)        NOT NULL,     /*交易開始序號*/
    SLE_TxnEndNo        DECIMAL(06)        NOT NULL,     /*交易結束序號*/
    SLE_ShiftCnt        VARCHAR(02)        NOT NULL,     /*班別數量，預設值為1*/
    SLE_SaleCustCnt     DECIMAL(08)        NOT NULL,     /*銷售客次*/
    SLE_SaleQty         DECIMAL(08)        NOT NULL,     /*銷售總數量*/
    SLE_SaleAmt         DECIMAL(14,4)      NOT NULL,     /*銷售總額*/
    SLE_SaleTax         DECIMAL(14,4)      NOT NULL,     /*應稅銷售總額*/
    SLE_SaleNoTax       DECIMAL(14,4)      NOT NULL,     /*免稅銷售總額*/
    SLE_SaleZeroTax     DECIMAL(14,4)      NOT NULL,     /*零稅銷售總額*/
    SLE_TotTax          DECIMAL(14,4)      NOT NULL,     /*總稅額*/
    SLE_RjtCustCnt      DECIMAL(08)        NOT NULL,     /*退貨客次*/
    SLE_RjtQty          DECIMAL(08)        NOT NULL,     /*退貨總數量*/
    SLE_RjtAmt          DECIMAL(14,4)      NOT NULL,     /*退貨總金額*/
    SLE_RjtTax          DECIMAL(14,4)      NOT NULL,     /*應稅退貨總額*/
    SLE_RjtNoTax        DECIMAL(14,4)      NOT NULL,     /*免稅退貨總額*/
    SLE_RjtZeroTax      DECIMAL(14,4)      NOT NULL,     /*零稅退貨總額*/
    SLE_RjtTotTax       DECIMAL(14,4)      NOT NULL,     /*退貨總稅額*/
    SLE_VoidCustCnt     DECIMAL(08)        NOT NULL,     /*作廢客次*/
    SLE_VoidQty         DECIMAL(08)        NOT NULL,     /*作廢總數量*/
    SLE_VoidAmt         DECIMAL(14,4)      NOT NULL,     /*作廢總額*/
    SLE_VoidTax         DECIMAL(14,4)      NOT NULL,     /*應稅作廢總額*/
    SLE_VoidNoTax       DECIMAL(14,4)      NOT NULL,     /*免稅作廢總額*/
    SLE_VoidZeroTax     DECIMAL(14,4)      NOT NULL,     /*零稅作廢總額*/
    SLE_VoidTotTax      DECIMAL(14,4)      NOT NULL,     /*作廢總稅額*/
    SLE_OverCustCnt     DECIMAL(08)        NOT NULL,     /*溢收客次*/
    SLE_OverQty         DECIMAL(08)        NOT NULL,     /*溢收總數量*/
    SLE_OverAmt         DECIMAL(14,4)      NOT NULL,     /*溢收總額*/
    SLE_DiscSCnt        DECIMAL(08)        NOT NULL,     /*人工折扣次數*/
    SLE_DiscSAmt        DECIMAL(14,4)      NOT NULL,     /*人工折扣總額*/
    SLE_DiscMCnt        DECIMAL(08)        NOT NULL,     /*組合折扣次數*/
    SLE_DiscMAmt        DECIMAL(14,4)      NOT NULL,     /*組合折扣總額*/
    SLE_DiscTCnt        DECIMAL(08)        NOT NULL,     /*總合折扣次數*/
    SLE_DiscTAmt        DECIMAL(14,4)      NOT NULL,     /*總合折扣總額*/
    SLE_CashCnt         DECIMAL(08)        NOT NULL,     /*中途取現次數*/
    SLE_CashAmt         DECIMAL(14,4)      NOT NULL,     /*中途取現總額*/
    SLE_ModiCnt         DECIMAL(08)        NOT NULL,     /*更正次數*/
    SLE_ModiAmt         DECIMAL(14,4)      NOT NULL,     /*更正總額*/
    SLE_CancelCnt       DECIMAL(08)        NOT NULL,     /*交易取消次數*/
    SLE_ChangeCnt       DECIMAL(08)        NOT NULL,     /*退換次數*/
    SLE_OpenBoxCnt      DECIMAL(08)        NOT NULL,     /*開抽屜次數*/
    SLE_DisRecCnt1      DECIMAL(08)        NOT NULL,     /*代收１次數*/
    SLE_DisRecCnt2      DECIMAL(08)        NOT NULL,     /*代收２次數*/
    SLE_DisRecCnt3      DECIMAL(08)        NOT NULL,     /*代收３次數*/
    SLE_DisRecCnt4      DECIMAL(08)        NOT NULL,     /*代收４次數*/
    SLE_DisRecCnt5      DECIMAL(08)        NOT NULL,     /*代收５次數*/
    SLE_DisRecAmt1      DECIMAL(14,4)      NOT NULL,     /*代收總額*/
    SLE_DisRecAmt2      DECIMAL(14,4)      NOT NULL,     /*代售總額*/
    SLE_DisRecAmt3      DECIMAL(14,4)      NOT NULL,     /*代收３總額*/
    SLE_DisRecAmt4      DECIMAL(14,4)      NOT NULL,     /*娛樂稅總額*/
    SLE_DisRecAmt5      DECIMAL(14,4)      NOT NULL,     /*健康捐總額*/
    SLE_DisPayCnt1      DECIMAL(08)        NOT NULL,     /*代支１次數*/
    SLE_DisPayCnt2      DECIMAL(08)        NOT NULL,     /*代支２次數(未使用)*/
    SLE_DisPayCnt3      DECIMAL(08)        NOT NULL,     /*代支３次數(未使用)*/
    SLE_DisPayCnt4      DECIMAL(08)        NOT NULL,     /*代支４次數(未使用)*/
    SLE_DisPayCnt5      DECIMAL(08)        NOT NULL,     /*代支５次數(未使用)*/
    SLE_DisPayAmt1      DECIMAL(14,4)      NOT NULL,     /*代支１總額*/
    SLE_DisPayAmt2      DECIMAL(14,4)      NOT NULL,     /*代支２總額(未使用)*/
    SLE_DisPayAmt3      DECIMAL(14,4)      NOT NULL,     /*代支３總額(未使用)*/
    SLE_DisPayAmt4      DECIMAL(14,4)      NOT NULL,     /*代支４總額(未使用)*/
    SLE_DisPayAmt5      DECIMAL(14,4)      NOT NULL,     /*代支５總額(未使用)*/
    SLE_DiscCnt1        DECIMAL(08)        NOT NULL,     /*折扣１次數*/
    SLE_DiscCnt2        DECIMAL(08)        NOT NULL,     /*折扣２次數*/
    SLE_DiscCnt3        DECIMAL(08)        NOT NULL,     /*折扣３次數*/
    SLE_DiscAmt1        DECIMAL(14,4)      NOT NULL,     /*折扣１總額*/
    SLE_DiscAmt2        DECIMAL(14,4)      NOT NULL,     /*折扣２總額*/
    SLE_DiscAmt3        DECIMAL(14,4)      NOT NULL,     /*折扣３總額*/
    SLE_LetCnt1         DECIMAL(08)        NOT NULL,     /*折讓１次數*/
    SLE_LetCnt2         DECIMAL(08)        NOT NULL,     /*折讓２次數*/
    SLE_LetCnt3         DECIMAL(08)        NOT NULL,     /*折讓３次數*/
    SLE_LetAmt1         DECIMAL(14,4)      NOT NULL,     /*折讓１總額*/
    SLE_LetAmt2         DECIMAL(14,4)      NOT NULL,     /*折讓２總額*/
    SLE_LetAmt3         DECIMAL(14,4)      NOT NULL,     /*折讓３總額*/
    SLE_DubCnt1         DECIMAL(08)        NOT NULL,     /*加成１次數*/
    SLE_DubCnt2         DECIMAL(08)        NOT NULL,     /*加成２次數*/
    SLE_DubCnt3         DECIMAL(08)        NOT NULL,     /*加成３次數*/
    SLE_DubAmt1         DECIMAL(14,4)      NOT NULL,     /*加成１總額*/
    SLE_DubAmt2         DECIMAL(14,4)      NOT NULL,     /*加成２總額*/
    SLE_DubAmt3         DECIMAL(14,4)      NOT NULL,     /*加成３總額*/
    SLE_TDiscCnt1       DECIMAL(08)        NOT NULL,     /*小計折扣１次數*/
    SLE_TDiscCnt2       DECIMAL(08)        NOT NULL,     /*小計折扣２次數*/
    SLE_TDiscCnt3       DECIMAL(08)        NOT NULL,     /*小計折扣３次數*/
    SLE_TDiscAmt1       DECIMAL(14,4)      NOT NULL,     /*小計折扣１總額*/
    SLE_TDiscAmt2       DECIMAL(14,4)      NOT NULL,     /*小計折扣２總額*/
    SLE_TDiscAmt3       DECIMAL(14,4)      NOT NULL,     /*小計折扣３總額*/
    SLE_TLetCnt1        DECIMAL(08)        NOT NULL,     /*小計折讓１次數*/
    SLE_TLetCnt2        DECIMAL(08)        NOT NULL,     /*小計折讓２次數*/
    SLE_TLetCnt3        DECIMAL(08)        NOT NULL,     /*小計折讓３次數*/
    SLE_TLetAmt1        DECIMAL(14,4)      NOT NULL,     /*小計折讓１總額*/
    SLE_TLetAmt2        DECIMAL(14,4)      NOT NULL,     /*小計折讓２總額*/
    SLE_TLetAmt3        DECIMAL(14,4)      NOT NULL,     /*小計折讓３總額*/
    SLE_TDubCnt1        DECIMAL(08)        NOT NULL,     /*小計加成１次數*/
    SLE_TDubCnt2        DECIMAL(08)        NOT NULL,     /*小計加成２次數*/
    SLE_TDubCnt3        DECIMAL(08)        NOT NULL,     /*小計加成３次數*/
    SLE_TDubAmt1        DECIMAL(14,4)      NOT NULL,     /*小計加成１總額*/
    SLE_TDubAmt2        DECIMAL(14,4)      NOT NULL,     /*小計加成２總額*/
    SLE_TDubAmt3        DECIMAL(14,4)      NOT NULL,     /*小計加成３總額*/
    SLE_ChangeCashCnt   DECIMAL(08)        NOT NULL,     /*零用金次數*/
    SLE_ChangeCashAmt   DECIMAL(14,4)      NOT NULL,     /*零用金總額*/
    SLE_PreOrderCnt     DECIMAL(08)        NOT NULL,     /*預收銷售次數，預設值為0*/
    SLE_PreOrderAmt     DECIMAL(14,4)      NOT NULL,     /*預收銷售金額，預設值為0*/
    SLE_GetOrderCnt     DECIMAL(08)        NOT NULL,     /*預收取貨次數，預設值為0*/
    SLE_GetOrderAmt     DECIMAL(14,4)      NOT NULL,     /*預收取貨金額，預設值為0*/
    SLE_GUICnt          DECIMAL(08)        NOT NULL,     /*發票開立張數，預設值為0，統計在該日期開立過的發票張數，無論該筆發票是否作廢，皆需計入*/
    SLE_VoidGUICnt      DECIMAL(08)        NOT NULL,     /*作廢發票張數，預設值為0*/
    SLE_RefundGUICnt    DECIMAL(08)            NULL,     /*折讓單開立客次*/
    SLE_RefundGUIQty    DECIMAL(08)            NULL,     /*折讓單開立張數*/
    SLE_RefundGUIAmt    DECIMAL(14,4)          NULL,     /*折讓單開立總額*/
    SLE_RefundGUITax    DECIMAL(14,4)          NULL,     /*折讓單開立應稅銷售總額*/
    SLE_RefundGUINoTax  DECIMAL(14,4)          NULL,     /*折讓單開立免稅銷售總額*/
    SLE_RefundGUIZeroTax DECIMAL(14,4)         NULL,     /*折讓單開立零稅銷售總額*/
    SLE_RefVoidGUICnt   DECIMAL(08)            NULL,     /*折讓單作廢客次*/
    SLE_RefVoidGUIQty   DECIMAL(08)            NULL,     /*折讓單作廢張數*/
    SLE_RefVoidGUIAmt   DECIMAL(14,4)          NULL,     /*折讓單作廢總額*/
    SLE_RefVoidGUITax   DECIMAL(14,4)          NULL,     /*折讓單作廢應稅銷售總額*/
    SLE_RefVoidGUINoTax DECIMAL(14,4)          NULL,     /*折讓單作廢免稅銷售總額*/
    SLE_RefVoidGUIZeroTax DECIMAL(14,4)        NULL,     /*折讓單作廢零稅銷售總額*/
    SLE_RefVoidTotTax   DECIMAL(14,4)      NOT NULL,     /*折讓單作廢總稅額*/
    SLE_PayCnt1         DECIMAL(08)        NOT NULL,     /*付款０１筆數*/
    SLE_PayCnt2         DECIMAL(08)        NOT NULL,     /*付款０２筆數*/
    SLE_PayCnt3         DECIMAL(08)        NOT NULL,     /*付款０３筆數*/
    SLE_PayCnt4         DECIMAL(08)        NOT NULL,     /*付款０４筆數*/
    SLE_PayCnt5         DECIMAL(08)        NOT NULL,     /*信用０卡筆數*/
    SLE_PayCnt6         DECIMAL(08)        NOT NULL,     /*付款０６筆數*/
    SLE_PayCnt7         DECIMAL(08)        NOT NULL,     /*付款０７筆數*/
    SLE_PayCnt8         DECIMAL(08)        NOT NULL,     /*付款０８筆數*/
    SLE_PayCnt9         DECIMAL(08)        NOT NULL,     /*付款０９筆數*/
    SLE_PayCnt10        DECIMAL(08)        NOT NULL,     /*付款１０筆數*/
    SLE_PayCnt11        DECIMAL(08)        NOT NULL,     /*付款１１筆數*/
    SLE_PayCnt12        DECIMAL(08)        NOT NULL,     /*付款１２筆數*/
    SLE_PayCnt13        DECIMAL(08)        NOT NULL,     /*付款１３筆數*/
    SLE_PayCnt14        DECIMAL(08)        NOT NULL,     /*付款１４筆數*/
    SLE_PayCnt15        DECIMAL(08)        NOT NULL,     /*付款１５筆數*/
    SLE_PayCnt16        DECIMAL(08)        NOT NULL,     /*付款１６筆數*/
    SLE_PayCnt17        DECIMAL(08)        NOT NULL,     /*付款１７筆數*/
    SLE_PayCnt18        DECIMAL(08)        NOT NULL,     /*付款１８筆數*/
    SLE_PayCnt19        DECIMAL(08)        NOT NULL,     /*付款１９筆數*/
    SLE_PayCnt20        DECIMAL(08)        NOT NULL,     /*付款２０筆數*/
    SLE_PayCnt21        DECIMAL(08)            NULL,     /*付款２１筆數*/
    SLE_PayCnt22        DECIMAL(08)            NULL,     /*付款２２筆數*/
    SLE_PayCnt23        DECIMAL(08)            NULL,     /*付款２３筆數*/
    SLE_PayCnt24        DECIMAL(08)            NULL,     /*付款２４筆數*/
    SLE_PayCnt25        DECIMAL(08)            NULL,     /*付款２５筆數*/
    SLE_PayCnt26        DECIMAL(08)            NULL,     /*付款２６筆數*/
    SLE_PayCnt27        DECIMAL(08)            NULL,     /*付款２７筆數*/
    SLE_PayCnt28        DECIMAL(08)            NULL,     /*付款２８筆數*/
    SLE_PayCnt29        DECIMAL(08)            NULL,     /*付款２９筆數*/
    SLE_PayCnt30        DECIMAL(08)            NULL,     /*付款３０筆數*/
    SLE_PayCnt31        DECIMAL(08)            NULL,     /*付款３１筆數*/
    SLE_PayCnt32        DECIMAL(08)            NULL,     /*付款３２筆數*/
    SLE_PayCnt33        DECIMAL(08)            NULL,     /*付款３３筆數*/
    SLE_PayCnt34        DECIMAL(08)            NULL,     /*付款３４筆數*/
    SLE_PayCnt35        DECIMAL(08)            NULL,     /*付款３５筆數*/
    SLE_PayCnt36        DECIMAL(08)            NULL,     /*付款３６筆數*/
    SLE_PayCnt37        DECIMAL(08)            NULL,     /*付款３７筆數*/
    SLE_PayCnt38        DECIMAL(08)            NULL,     /*付款３８筆數*/
    SLE_PayCnt39        DECIMAL(08)            NULL,     /*付款３９筆數*/
    SLE_PayCnt40        DECIMAL(08)            NULL,     /*付款４０筆數*/
    SLE_PayCnt41        DECIMAL(08)            NULL,     /*付款４１筆數*/
    SLE_PayCnt42        DECIMAL(08)            NULL,     /*付款４２筆數*/
    SLE_PayCnt43        DECIMAL(08)            NULL,     /*付款４３筆數*/
    SLE_PayCnt44        DECIMAL(08)            NULL,     /*付款４４筆數*/
    SLE_PayCnt45        DECIMAL(08)            NULL,     /*付款４５筆數*/
    SLE_PayCnt46        DECIMAL(08)            NULL,     /*付款４６筆數*/
    SLE_PayCnt47        DECIMAL(08)            NULL,     /*付款４７筆數*/
    SLE_PayCnt48        DECIMAL(08)            NULL,     /*付款４８筆數*/
    SLE_PayCnt49        DECIMAL(08)            NULL,     /*付款４９筆數*/
    SLE_PayCnt50        DECIMAL(08)            NULL,     /*付款５０筆數*/
    SLE_PayCnt51        DECIMAL(08)            NULL,     /*付款５１筆數*/
    SLE_PayCnt52        DECIMAL(08)            NULL,     /*付款５２筆數*/
    SLE_PayCnt53        DECIMAL(08)            NULL,     /*付款５３筆數*/
    SLE_PayCnt54        DECIMAL(08)            NULL,     /*付款５４筆數*/
    SLE_PayCnt55        DECIMAL(08)            NULL,     /*付款５５筆數*/
    SLE_PayCnt56        DECIMAL(08)            NULL,     /*付款５６筆數*/
    SLE_PayCnt57        DECIMAL(08)            NULL,     /*付款５７筆數*/
    SLE_PayCnt58        DECIMAL(08)            NULL,     /*付款５８筆數*/
    SLE_PayCnt59        DECIMAL(08)            NULL,     /*付款５９筆數*/
    SLE_PayCnt60        DECIMAL(08)            NULL,     /*付款６０筆數*/
    SLE_PayCnt61        DECIMAL(08)            NULL,     /*付款６１筆數*/
    SLE_PayCnt62        DECIMAL(08)            NULL,     /*付款６２筆數*/
    SLE_PayCnt63        DECIMAL(08)            NULL,     /*付款６３筆數*/
    SLE_PayCnt64        DECIMAL(08)            NULL,     /*付款６４筆數*/
    SLE_PayCnt65        DECIMAL(08)            NULL,     /*付款６５筆數*/
    SLE_PayCnt66        DECIMAL(08)            NULL,     /*付款６６筆數*/
    SLE_PayCnt67        DECIMAL(08)            NULL,     /*付款６７筆數*/
    SLE_PayCnt68        DECIMAL(08)            NULL,     /*付款６８筆數*/
    SLE_PayCnt69        DECIMAL(08)            NULL,     /*付款６９筆數*/
    SLE_PayCnt70        DECIMAL(08)            NULL,     /*付款７０筆數*/
    SLE_PayCnt71        DECIMAL(08)            NULL,     /*付款７１筆數*/
    SLE_PayCnt72        DECIMAL(08)            NULL,     /*付款７２筆數*/
    SLE_PayCnt73        DECIMAL(08)            NULL,     /*付款７３筆數*/
    SLE_PayCnt74        DECIMAL(08)            NULL,     /*付款７４筆數*/
    SLE_PayCnt75        DECIMAL(08)            NULL,     /*付款７５筆數*/
    SLE_PayCnt76        DECIMAL(08)            NULL,     /*付款７６筆數*/
    SLE_PayCnt77        DECIMAL(08)            NULL,     /*付款７７筆數*/
    SLE_PayCnt78        DECIMAL(08)            NULL,     /*付款７８筆數*/
    SLE_PayCnt79        DECIMAL(08)            NULL,     /*付款７９筆數*/
    SLE_PayCnt80        DECIMAL(08)            NULL,     /*付款８０筆數*/
    SLE_PayCnt81        DECIMAL(08)            NULL,     /*付款８１筆數*/
    SLE_PayCnt82        DECIMAL(08)            NULL,     /*付款８２筆數*/
    SLE_PayCnt83        DECIMAL(08)            NULL,     /*付款８３筆數*/
    SLE_PayCnt84        DECIMAL(08)            NULL,     /*付款８４筆數*/
    SLE_PayCnt85        DECIMAL(08)            NULL,     /*付款８５筆數*/
    SLE_PayCnt86        DECIMAL(08)            NULL,     /*付款８６筆數*/
    SLE_PayCnt87        DECIMAL(08)            NULL,     /*付款８７筆數*/
    SLE_PayCnt88        DECIMAL(08)            NULL,     /*付款８８筆數*/
    SLE_PayCnt89        DECIMAL(08)            NULL,     /*付款８９筆數*/
    SLE_PayCnt90        DECIMAL(08)            NULL,     /*付款９０筆數*/
    SLE_PayCnt91        DECIMAL(08)            NULL,     /*付款９１筆數*/
    SLE_PayCnt92        DECIMAL(08)            NULL,     /*付款９２筆數*/
    SLE_PayCnt93        DECIMAL(08)            NULL,     /*付款９３筆數*/
    SLE_PayCnt94        DECIMAL(08)            NULL,     /*付款９４筆數*/
    SLE_PayCnt95        DECIMAL(08)            NULL,     /*付款９５筆數*/
    SLE_PayCnt96        DECIMAL(08)            NULL,     /*付款９６筆數*/
    SLE_PayCnt97        DECIMAL(08)            NULL,     /*付款９７筆數*/
    SLE_PayCnt98        DECIMAL(08)            NULL,     /*付款９８筆數*/
    SLE_PayCnt99        DECIMAL(08)            NULL,     /*付款９９筆數*/
    SLE_PayCnt100       DECIMAL(08)            NULL,     /*付款１００筆數*/
    SLE_PayAmt1         DECIMAL(14,4)      NOT NULL,     /*付款０１總額*/
    SLE_PayAmt2         DECIMAL(14,4)      NOT NULL,     /*付款０２總額*/
    SLE_PayAmt3         DECIMAL(14,4)      NOT NULL,     /*付款０３總額*/
    SLE_PayAmt4         DECIMAL(14,4)      NOT NULL,     /*付款０４總額*/
    SLE_PayAmt5         DECIMAL(14,4)      NOT NULL,     /*信用０卡總額*/
    SLE_PayAmt6         DECIMAL(14,4)      NOT NULL,     /*付款０６總額*/
    SLE_PayAmt7         DECIMAL(14,4)      NOT NULL,     /*付款０７總額*/
    SLE_PayAmt8         DECIMAL(14,4)      NOT NULL,     /*付款０８總額*/
    SLE_PayAmt9         DECIMAL(14,4)      NOT NULL,     /*付款０９總額*/
    SLE_PayAmt10        DECIMAL(14,4)      NOT NULL,     /*付款１０總額*/
    SLE_PayAmt11        DECIMAL(14,4)      NOT NULL,     /*付款１１總額*/
    SLE_PayAmt12        DECIMAL(14,4)      NOT NULL,     /*付款１２總額*/
    SLE_PayAmt13        DECIMAL(14,4)      NOT NULL,     /*付款１３總額*/
    SLE_PayAmt14        DECIMAL(14,4)      NOT NULL,     /*付款１４總額*/
    SLE_PayAmt15        DECIMAL(14,4)      NOT NULL,     /*付款１５總額*/
    SLE_PayAmt16        DECIMAL(14,4)      NOT NULL,     /*付款１６總額*/
    SLE_PayAmt17        DECIMAL(14,4)      NOT NULL,     /*付款１７總額*/
    SLE_PayAmt18        DECIMAL(14,4)      NOT NULL,     /*付款１８總額*/
    SLE_PayAmt19        DECIMAL(14,4)      NOT NULL,     /*付款１９總額*/
    SLE_PayAmt20        DECIMAL(14,4)      NOT NULL,     /*付款２０總額*/
    SLE_PayAmt21        DECIMAL(14,4)          NULL,     /*付款２１總額*/
    SLE_PayAmt22        DECIMAL(14,4)          NULL,     /*付款２２總額*/
    SLE_PayAmt23        DECIMAL(14,4)          NULL,     /*付款２３總額*/
    SLE_PayAmt24        DECIMAL(14,4)          NULL,     /*付款２４總額*/
    SLE_PayAmt25        DECIMAL(14,4)          NULL,     /*付款２５總額*/
    SLE_PayAmt26        DECIMAL(14,4)          NULL,     /*付款２６總額*/
    SLE_PayAmt27        DECIMAL(14,4)          NULL,     /*付款２７總額*/
    SLE_PayAmt28        DECIMAL(14,4)          NULL,     /*付款２８總額*/
    SLE_PayAmt29        DECIMAL(14,4)          NULL,     /*付款２９總額*/
    SLE_PayAmt30        DECIMAL(14,4)          NULL,     /*銷貨退回總額*/
    SLE_PayAmt31        DECIMAL(14,4)          NULL,     /*付款３１總額*/
    SLE_PayAmt32        DECIMAL(14,4)          NULL,     /*付款３２總額*/
    SLE_PayAmt33        DECIMAL(14,4)          NULL,     /*付款３３總額*/
    SLE_PayAmt34        DECIMAL(14,4)          NULL,     /*付款３４總額*/
    SLE_PayAmt35        DECIMAL(14,4)          NULL,     /*付款３５總額*/
    SLE_PayAmt36        DECIMAL(14,4)          NULL,     /*付款３６總額*/
    SLE_PayAmt37        DECIMAL(14,4)          NULL,     /*付款３７總額*/
    SLE_PayAmt38        DECIMAL(14,4)          NULL,     /*付款３８總額*/
    SLE_PayAmt39        DECIMAL(14,4)          NULL,     /*付款３９總額*/
    SLE_PayAmt40        DECIMAL(14,4)          NULL,     /*付款４０總額*/
    SLE_PayAmt41        DECIMAL(14,4)          NULL,     /*付款４１總額*/
    SLE_PayAmt42        DECIMAL(14,4)          NULL,     /*付款４２總額*/
    SLE_PayAmt43        DECIMAL(14,4)          NULL,     /*付款４３總額*/
    SLE_PayAmt44        DECIMAL(14,4)          NULL,     /*付款４４總額*/
    SLE_PayAmt45        DECIMAL(14,4)          NULL,     /*付款４５總額*/
    SLE_PayAmt46        DECIMAL(14,4)          NULL,     /*付款４６總額*/
    SLE_PayAmt47        DECIMAL(14,4)          NULL,     /*付款４７總額*/
    SLE_PayAmt48        DECIMAL(14,4)          NULL,     /*付款４８總額*/
    SLE_PayAmt49        DECIMAL(14,4)          NULL,     /*付款４９總額*/
    SLE_PayAmt50        DECIMAL(14,4)          NULL,     /*付款５０總額*/
    SLE_PayAmt51        DECIMAL(14,4)          NULL,     /*付款５１總額*/
    SLE_PayAmt52        DECIMAL(14,4)          NULL,     /*付款５２總額*/
    SLE_PayAmt53        DECIMAL(14,4)          NULL,     /*付款５３總額*/
    SLE_PayAmt54        DECIMAL(14,4)          NULL,     /*付款５４總額*/
    SLE_PayAmt55        DECIMAL(14,4)          NULL,     /*付款５５總額*/
    SLE_PayAmt56        DECIMAL(14,4)          NULL,     /*付款５６總額*/
    SLE_PayAmt57        DECIMAL(14,4)          NULL,     /*付款５７總額*/
    SLE_PayAmt58        DECIMAL(14,4)          NULL,     /*付款５８總額*/
    SLE_PayAmt59        DECIMAL(14,4)          NULL,     /*付款５９總額*/
    SLE_PayAmt60        DECIMAL(14,4)          NULL,     /*付款６０總額*/
    SLE_PayAmt61        DECIMAL(14,4)          NULL,     /*付款６１總額*/
    SLE_PayAmt62        DECIMAL(14,4)          NULL,     /*付款６２總額*/
    SLE_PayAmt63        DECIMAL(14,4)          NULL,     /*付款６３總額*/
    SLE_PayAmt64        DECIMAL(14,4)          NULL,     /*付款６４總額*/
    SLE_PayAmt65        DECIMAL(14,4)          NULL,     /*付款６５總額*/
    SLE_PayAmt66        DECIMAL(14,4)          NULL,     /*付款６６總額*/
    SLE_PayAmt67        DECIMAL(14,4)          NULL,     /*付款６７總額*/
    SLE_PayAmt68        DECIMAL(14,4)          NULL,     /*付款６８總額*/
    SLE_PayAmt69        DECIMAL(14,4)          NULL,     /*付款６９總額*/
    SLE_PayAmt70        DECIMAL(14,4)          NULL,     /*付款７０總額*/
    SLE_PayAmt71        DECIMAL(14,4)          NULL,     /*付款７１總額*/
    SLE_PayAmt72        DECIMAL(14,4)          NULL,     /*付款７２總額*/
    SLE_PayAmt73        DECIMAL(14,4)          NULL,     /*付款７３總額*/
    SLE_PayAmt74        DECIMAL(14,4)          NULL,     /*付款７４總額*/
    SLE_PayAmt75        DECIMAL(14,4)          NULL,     /*付款７５總額*/
    SLE_PayAmt76        DECIMAL(14,4)          NULL,     /*付款７６總額*/
    SLE_PayAmt77        DECIMAL(14,4)          NULL,     /*付款７７總額*/
    SLE_PayAmt78        DECIMAL(14,4)          NULL,     /*付款７８總額*/
    SLE_PayAmt79        DECIMAL(14,4)          NULL,     /*付款７９總額*/
    SLE_PayAmt80        DECIMAL(14,4)          NULL,     /*付款８０總額*/
    SLE_PayAmt81        DECIMAL(14,4)          NULL,     /*付款８１總額*/
    SLE_PayAmt82        DECIMAL(14,4)          NULL,     /*付款８２總額*/
    SLE_PayAmt83        DECIMAL(14,4)          NULL,     /*付款８３總額*/
    SLE_PayAmt84        DECIMAL(14,4)          NULL,     /*付款８４總額*/
    SLE_PayAmt85        DECIMAL(14,4)          NULL,     /*付款８５總額*/
    SLE_PayAmt86        DECIMAL(14,4)          NULL,     /*付款８６總額*/
    SLE_PayAmt87        DECIMAL(14,4)          NULL,     /*付款８７總額*/
    SLE_PayAmt88        DECIMAL(14,4)          NULL,     /*付款８８總額*/
    SLE_PayAmt89        DECIMAL(14,4)          NULL,     /*付款８９總額*/
    SLE_PayAmt90        DECIMAL(14,4)          NULL,     /*付款９０總額*/
    SLE_PayAmt91        DECIMAL(14,4)          NULL,     /*付款９１總額*/
    SLE_PayAmt92        DECIMAL(14,4)          NULL,     /*付款９２總額*/
    SLE_PayAmt93        DECIMAL(14,4)          NULL,     /*付款９３總額*/
    SLE_PayAmt94        DECIMAL(14,4)          NULL,     /*付款９４總額*/
    SLE_PayAmt95        DECIMAL(14,4)          NULL,     /*付款９５總額*/
    SLE_PayAmt96        DECIMAL(14,4)          NULL,     /*付款９６總額*/
    SLE_PayAmt97        DECIMAL(14,4)          NULL,     /*付款９７總額*/
    SLE_PayAmt98        DECIMAL(14,4)          NULL,     /*付款９８總額*/
    SLE_PayAmt99        DECIMAL(14,4)          NULL,     /*付款９９總額*/
    SLE_PayAmt100       DECIMAL(14,4)          NULL,     /*付款１００總額*/

    CRT_Date            DATETIME               NULL,     /*建立日期*/
    UPD_Date            DATETIME               NULL,     /*變更日期*/

    CONSTRAINT PK_POS3002 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS3002_MST')
  CREATE UNIQUE INDEX IDX_POS3002_MST ON POS3002 (SYS_StoreNo, TXN_Date, ECR_No);


/*POS3005 單品日銷售檔 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS3005')
BEGIN
CREATE TABLE POS3005
(
     ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
     SYS_StoreNo         VARCHAR(10)        NOT NULL,     /*店號*/
     TXN_Date            DATE               NOT NULL,     /*交易日期*/
     ECR_No              VARCHAR(10)        NOT NULL,     /*收銀機代碼*/
     PLU_No              VARCHAR(20)        NOT NULL,     /*商品條碼*/
     SLP_SaleCustCnt     DECIMAL(08)        NOT NULL,     /*銷售客次*/
     SLP_SaleQty         DECIMAL(08)        NOT NULL,     /*銷售總數量*/
     SLP_SaleAmt         DECIMAL(14,4)      NOT NULL,     /*銷售總額*/
     SLP_RjtCustCnt      DECIMAL(08)        NOT NULL,     /*退貨客次*/
     SLP_RjtQty          DECIMAL(08)        NOT NULL,     /*退貨總數量*/
     SLP_RjtAmt          DECIMAL(14,4)      NOT NULL,     /*退貨總金額*/
     SLP_VoidCustCnt     DECIMAL(08)        NOT NULL,     /*作廢客次*/
     SLP_VoidQty         DECIMAL(08)        NOT NULL,     /*作廢總數量*/
     SLP_VoidAmt         DECIMAL(14,4)      NOT NULL,     /*作廢總額*/

     CONSTRAINT PK_POS3005 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS3005_MST')
  CREATE UNIQUE INDEX IDX_POS3005_MST ON POS3005 (SYS_StoreNo, TXN_Date, ECR_No, PLU_No);


/*POS3006 發票開立統計檔 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS3006')
BEGIN
CREATE TABLE POS3006
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    SYS_StoreNo         VARCHAR(10)        NOT NULL,     /*門市店號*/
    ECR_No              VARCHAR(10)        NOT NULL,     /*收銀機號*/
    TXN_Date            DATE               NOT NULL,     /*交易日期*/
    GUI_BegNo           VARCHAR(10)        NOT NULL,     /*起始發票號碼*/
    GUI_UsedEndNo       VARCHAR(10)            NULL,     /*已使用的最後一個發票號碼*/

     CONSTRAINT PK_POS3006 PRIMARY KEY CLUSTERED (ID)
)
END


IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS3006_MST')
  CREATE UNIQUE INDEX IDX_POS3006_MST ON POS3006 (SYS_StoreNo, ECR_No, TXN_Date, GUI_BegNo);


/*POS30061 發票列印記錄檔 */
IF OBJECT_ID(N'dbo.POS30061', N'U') IS NULL
BEGIN
CREATE TABLE POS30061
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
	MID                 DECIMAL(19) DEFAULT 0 NOT NULL,    /*商戶編號*/
    SYS_StoreNo         VARCHAR(10)        NOT NULL,        /*門市店號*/
    TXN_Date            DATE               NOT NULL,        /*交易日期*/
    ECR_No              VARCHAR(10)        NOT NULL,        /*收銀機號*/
    TXN_No              DECIMAL(08)        NOT NULL,        /*交易序號*/
    TXN_GUINo           VARCHAR(10)        NOT NULL,        /*發票號碼*/
    TXN_SeqNo           DECIMAL(06)        NOT NULL,        /*項次*/
    TXN_Time            DATETIME               NULL,        /*交易時間*/
    GUI_PrnData         NVARCHAR(50)           NULL,        /*發票列印內容*/
    GUI_Desc            VARCHAR(20)            NULL,        /*備註*/
    TLT_No              VARCHAR(12)            NULL,        /*專櫃編號*/

    CONSTRAINT PK_POS30061 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS30061_MST')
  CREATE UNIQUE INDEX IDX_POS30061_MST ON POS30061 (MID, SYS_StoreNo, TXN_Date, ECR_No, TXN_No, TXN_GUINo, TXN_SeqNo);


/*POS3006D 發票狀態異動檔 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS3006D')
BEGIN
CREATE TABLE POS3006D
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    GUI_YYMM            VARCHAR(06)        NOT NULL,        /*發票年月 YYYYMM (西元年單數月)*/
    TXN_GUINo           VARCHAR(10)        NOT NULL,        /*發票號碼*/
    TXN_UpdTime         DATETIME           NOT NULL,        /*發票異動時間*/
    TXN_UpdDate         DATETIME           NOT NULL,        /*發票異動營業日期*/
    TXN_UpdEcrNo        VARCHAR(06)        NOT NULL,        /*發票異動收銀機號*/
    TXN_UpdShiftNo      VARCHAR(02)        NOT NULL,        /*發票異動班別*/
    TXN_UpdType         VARCHAR(04)        NOT NULL,        /*發票異動類型，C5=作廢、C6=作廢回覆、D4=開立折讓單、D5=作廢折讓單*/

    SYS_StoreNo         VARCHAR(10)            NULL,        /*門市店號*/
    TXN_Date            DATE                   NULL,        /*交易日期*/
    ECR_No              VARCHAR(10)            NULL,        /*收銀機號*/
    TXN_No              DECIMAL(08)            NULL,        /*交易序號*/
    TLT_No              VARCHAR(12)            NULL,        /*專櫃編號*/

    CONSTRAINT PK_POS3006D PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS3006D_MST')
  CREATE UNIQUE INDEX IDX_POS3006D_MST ON POS3006D (GUI_YYMM, TXN_GUINo, TXN_UpdTime);


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

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS5006_MST')
  CREATE UNIQUE INDEX IDX_POS5006_MST ON POS5006 (MID, SYS_StoreNo, TXN_Date, ECR_No, TXN_No);

EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'SYS_StoreNo', '門市店號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_Date', '交易日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'ECR_No', '收銀機號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_No', '交易序號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_Time', '交易時間';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'USR_No', '收銀員號碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_Uniform', '統一編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_MemCard', '會員卡號碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_GUIPaper', '發票聯數，2=二聯式、3=三聯式、N=免開發票、E=電子發票、R=退貨(不開立折讓單)、C=折讓單';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_GUIBegNo', '起始發票號碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_GUIEndNo', '結束發票號碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_GUICnt', '發票號碼張數';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotQty', '總數量';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotDisc', '折扣總額(負數)，TXN_TotDiscS + TXN_TotDiscM + TXN_TotDiscT + TXN_TotDiscP + TXN_TotDiscD + TXN_TotRebateS + TXN_TotRebateT + TXN_PayScoreAmt';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotDiscS', '總人工折扣(負數)，POS5007.TXN_DiscS 的加總';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotDiscM', '總組合折扣(負數)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotDiscT', '總總合折扣(負數)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotDiscP', '總促銷折扣(負數)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotDiscD', '類別折扣總額(負數)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotRebateS', '總單項折讓(負數)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotRebateT', '總小計折讓(負數)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotMinusAmt', '折價券扣減總額(負數)，POS5007.TXN_MINUS_GM_Amt 的加總';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotSaleAmt', '總銷售金額=總應稅銷售金額+總免稅銷售金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotSaleTax', '總應稅銷售金額=總未稅銷售金額+總稅額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotSaleNoTax', '總免稅銷售金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotNet', '總未稅銷售金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotTax', '總稅額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotGUI', '總發票金額=總發票應稅金額+總發票免稅金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotGUISaleTax', '總發票應稅金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotGUISaleNoTax', '總發票免稅金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotHaveTax', '總已稅金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotOver', '總溢收金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotHealthAmt', '總健康捐金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotExtraAmt', '代收代售銷售總額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_DtlCnt', '明細項數';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_PayCnt', '付款項數';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_CustCnt', '來客數';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_EntryDT', '補輸入日期，YYYY/MM/DD';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_Mode', '交易模式，R=收銀、E=補輸入、T=訓練、P=事後登錄';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_Status', '交易狀態，N=正常交易、C=交易取消、D=發票作廢、E=隔日發票作廢';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_VIP', '外交官交易，Y=是、N=否';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_ShiftNo', '班別';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotPayAmt', '總付款金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_PreOrderNo', '預購單號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'ORG_SYS_StoreNo', '原始店號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'ORG_TXN_Date', '原始交易日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'ORG_ECR_No', '原始收銀機號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'ORG_TXN_No', '原始交易序號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'ORG_TXN_GUINo', '原始交易發票號碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_VoidStoreNo', '發票作廢店號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_VoidDT', '發票作廢日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_VoidEcrNo', '發票作廢收銀機號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_VoidTxnNo', '發票作廢交易序號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_VoidTime', '發票作廢時間';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_VoidShiftNo', '發票作廢班別';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_VoidUsrNo', '發票作廢人員號碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TakeVoidDT', '取貨作廢日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_Ret_No', '折讓單號，若為開立折讓單則需記錄折讓單號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TaxType', '交易稅別，0=免稅、1=應稅、2=零稅';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_Ret_PrnNo', '銷退單號，若為退貨交易且不開立折讓單則需記錄銷退單號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_Desc', '交易註記';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_CustType', '交易客層';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_OrgTime', '原始交易時間';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_SaleNoteNo', '銷貨單號，SA + 交易日期YYMMDD + 機號 + 流水號6碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_Sales', '銷貨員';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_MemID', '會員識別碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'MEB_Type', '會員卡別';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_VIP_Disc', '[未使用]';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotScore', '交易會員積點[未使用]';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotScoreAmt', '交易會員積點金額[未使用]';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotPayScore', '會員點數扣抵(負項)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotPayScoreAmt', '會員點數扣抵金額(負項)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_PrintTimes', '列印次數';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_GUI_Flag', '發票註記';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_GUIItemCnt', '發票列印項數，POS30061的筆數';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_GUIVehicle', '電子發票共通載具編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_GUIRemark', '電子發票隨機碼4碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'STO_Uniform', '本店統一編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_GUILoveCode', '電子發票愛心碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_GUI_CarrType', '電子發票載具類別，悠遊載具卡=1K0001、手機條碼=3J0002、自然人憑證=CQ0001、一卡通載具=1H0001、信用卡載具=EK0002、#=取消載具';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_GUI_CarrId', '電子發票載具ID隱碼，CarrierId2載具隱碼id 信用卡=信用卡加密卡號50碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_GUI_CarrIdEx', '電子發票載具ID顯碼，CarrierId1載具顯碼id 信用卡=刷卡日期(民國年月日7碼)刷卡金額(右靠左補0共10碼)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TLT_No', '專櫃編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'Contract_No', '專櫃合約編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'Contract_SubNo', '專櫃合約附號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'Talent_ID', '專櫃合約編號系統 ID';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_PkngUID', '停車票卡、車牌';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'SAL_Type', '交易來源別，空白=收銀機(預設值)、POS=收銀機、APP=會員APP系統、PKNG=停車管理系統、CPN=環友票券系統';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_PreOrder', '預售註記，Y=是、N=否';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'ECR_LocNo', '店位代碼，POS2002.Location_No';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TaxFreeCertNo', '免稅證證號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'TXN_TotTaxAlwnc', '備抵總稅額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'PRM_TLT_No', '修正前-專櫃編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'PRM_Talent_ID', '修正前-專櫃合約編號系統 ID';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS5006', 'UPD_Date', '變更日期';


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

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS5007_MST')
  CREATE UNIQUE INDEX IDX_POS5007_MST ON POS5007 (MID, SYS_StoreNo, TXN_Date, ECR_No, TXN_No, TXN_Item)

EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'SYS_StoreNo', '門市店號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_Date', '交易日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'ECR_No', '收銀機機號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_No', '交易序號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_Item', '項次';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_Time', '交易時間';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_GUINo', '發票號碼，不開發票時固定為「0000000000」';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PLU_MagNo', '商品管理編號(商品貨號)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PLU_No', '國際條碼(商品條碼)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'VEN_No', '廠商編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'CAT_LNo', '大分類編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'CAT_MNo', '中分類編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'CAT_SNo', '小分類編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_Qty', '數量';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PLU_FixPrc', '定價';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PLU_SalePrc', '售價';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_Disc', '折扣總額(負數)，TXN_DiscS + TXN_DiscM + TXN_DiscT + TXN_DiscP + TXN_DiscD + TXN_RebateS + TXN_RebateT + TXN_PayScoreAmt';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_DiscS', '人工折扣(負數)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_DiscM', '會員折扣(負數)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_DiscT', '總合折扣(負數)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_DiscP', '促銷折扣(負數)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_DiscD', '類別折扣(負數)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_RebateS', '單項折讓(負數)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_RebateT', '小計折讓(負數)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_MINUS_GM_Amt', '折價券扣減銷項金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_Coup_Disc_Amt', '折價券金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_SaleAmt', '銷售金額=應稅銷售金額+免稅銷售金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_SaleTax', '應稅銷售金額=未稅銷售金額+稅額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_SaleNoTax', '免稅銷售金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_Net', '未稅銷售金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_Tax', '稅額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_HealthAmt', '健康捐金額=健康捐單價X數量';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_ExtraAmt', '代收代售銷售金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PLU_TaxType', '稅別，0=免稅、1=應稅';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'MAM_No', '促銷編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'MAM_Condition', '促銷數量';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'MAM_TotAmt', '促銷總價';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'MAM_CombNo', '組合編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'MAM_CombGrp', '組合群組';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'MAM_Method', '促銷方式';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_Ref', '參考號碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_AuthNo', '授權編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_AuthReason', '授權原因';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_Mode', '交易模式(同POS5006)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_Status', '交易狀態(同POS5006)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'MAM_UnitPrc', '促銷單價';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PLU_Disc', '是否可折扣(Y/N)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_Ret_Cod', '退貨原因，0=預設退貨、X=系統折價券、Y=被更正、Z=更正、S=銷退';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_Except_Sta', '例外註記，N=正常、P=更改售價、F=強制輸入、G=自帶價格條碼、#=更正';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PLU_Type', '商品類別';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PLU_Name', '商品名稱';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PLU_Set_Code', '組合商品類別';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PLU_Gift', '[未使用]';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PLU_Source', '是否為自製品-未使用，0=其他、1=自製、2=OEM、3=外購、4=自行進口、5=代工、6=煙酒';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_ActualPrc', '實際售價';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_Type', '銷售類別';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_DiscMebDiv', '會員折扣分攤金額(負數)[未使用]';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'MAS_No', '會員活動編號[未使用]';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_DownMarginAmt', '會員積分扣抵扣減銷項金額[未使用]';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_PayScoreAmt', '會員積分扣抵金額[未使用]';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_PayScore', '會員積分扣抵[未使用]';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_UseSalePrc', '是否使用原價(Y/N)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'MAM_UseScore', '扣抵點數[未使用]';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'MAM_DoScore', '是否計算點數(Y/N)[未使用]';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'MAM_MultiScore', '計算積點金額倍數[未使用]';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'MAM_GiftScore', '贈送積點[未使用]';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PLU_Health', '是否有健康捐(Y/N)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PLU_HealthPrc', '健康捐單價';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PLU_HealthBegDate', '健康捐有效開始日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PLU_HealthEndDate', '健康捐有效結束日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PLU_TaxRate', '稅率';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TLT_No', '專櫃編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'Contract_No', '專櫃合約編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'Contract_SubNo', '專櫃合約附號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'Talent_ID', '專櫃合約編號系統 ID';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TLT_ID', '分類抽成類別，TLTTALENT_CHARGEM.TLT_ID';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_DiscCode', '專櫃折數代碼，預設值為000，代表正品';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PRM_PLU_MagNo', '修正前-商品管理編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PRM_TLT_No', '修正前-專櫃編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PRM_Talent_ID', '修正前-專櫃合約編號系統 ID';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PRM_TLT_ID', '修正前-分類抽成類別，TLTTALENT_CHARGEM.TLT_ID';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'PRM_TXN_DiscCode', '修正前-專櫃折數代碼，預設值專櫃折數代碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'UPD_Date', '變更日期';


/*POS5008 銷售付款明細檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS5008')
BEGIN
CREATE TABLE POS5008
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    MID                 DECIMAL(19) DEFAULT 0 NOT NULL,    /*商戶編號*/
    SYS_StoreNo         VARCHAR(10)        NOT NULL,       /*門市店號*/
    TXN_Date            DATE               NOT NULL,       /*交易日期*/
    ECR_No              VARCHAR(10)        NOT NULL,       /*收銀機號*/
    TXN_No              DECIMAL(08)        NOT NULL,       /*交易序號*/
    TXN_Item            DECIMAL(06)        NOT NULL,       /*項次*/
    TXN_Time            DATETIME           NOT NULL,       /*交易時間*/
    PAY_No              VARCHAR(02)        NOT NULL,       /*付款編號，POS1006.PAY_No*/
    TXN_PayDesc         VARCHAR(100)           NULL,       /*付款註記*/
    TXN_PayAmt          DECIMAL(14,4)      NOT NULL,       /*付款金額*/
    TXN_Mode            CHAR(01)           NOT NULL,       /*交易模式*/
    TXN_Status          CHAR(01)           NOT NULL,       /*交易狀態*/
    PAY_TaxType         CHAR(01)           NOT NULL,       /*付款稅別，0=未稅、1=已稅*/
    TXN_OverAmt         DECIMAL(14,4)          NULL,       /*溢收金額*/
    TXN_CouponNo        VARCHAR(50)            NULL,       /*券號*/
    PAY_Type            VARCHAR(02)            NULL,       /*付款別型態，POS1006.PAY_Type*/
    TXN_Point           DECIMAL(14,4)          NULL,       /*使用點數(以付款type區分是何種點數)*/
    CRD_No              VARCHAR(20)            NULL,       /*付款卡號*/
    CRD_Type            VARCHAR(06)            NULL,       /*付款信用卡卡別，V=VISA、M=MASTER、J=JCB、A=AE、D=DINVER、S=銀聯卡、O=其他*/
    EDC_HostID          VARCHAR(06)            NULL,       /*授權銀行代碼*/
    EDC_MerID           VARCHAR(20)            NULL,       /*特店代號*/
    EDC_TmID            VARCHAR(20)            NULL,       /*端末機號*/
    EDC_BnkNo           VARCHAR(06)            NULL,       /*收單銀行代碼，956=聯合信用卡中心、822=中國信託*/
    BNK_No              VARCHAR(06)            NULL,       /*信用卡發卡銀行代碼*/
    TERM_No             DECIMAL(04)            NULL,       /*期別，0=一般，其餘為分期的期數*/
    EDC_ApprovalCode    VARCHAR(12)            NULL,       /*信用卡交易授權碼*/
    EDC_ExpireDate      VARCHAR(08)            NULL,       /*信用卡到期日*/
    EDC_RcptNo          VARCHAR(24)            NULL,       /*簽單序號*/
    EDC_RRN             VARCHAR(64)            NULL,       /*銀行交易序號*/
    TXN_TaxAlwnc        DECIMAL(14,4)          NULL,       /*備抵稅額*/
    EDC_InstHeadAmt     DECIMAL(10,2)          NULL,       /*分期付款-首期金額*/
    EDC_InstEachAmt     DECIMAL(10,2)          NULL,       /*分期付款-每期金額*/
    TXN_BalBeforePay    DECIMAL(10,2)          NULL,       /*交易前餘額*/
    TXN_BalAfterPay     DECIMAL(10,2)          NULL,       /*交易後餘額*/
    TXN_AutoloadAmt     DECIMAL(10,2)          NULL,       /*自動加值金額*/
    VOU_Check           CHAR(01)               NULL,       /*有價券兌回方式，1=連線、2=離線、3=大宗兌回*/

	PRM_PAY_No          VARCHAR(02)            NULL,       /*修正前-付款編號，POS1006.PAY_No*/

    CRT_Date            DATETIME               NULL,       /*建立日期*/
    UPD_Date            DATETIME               NULL,       /*變更日期*/

    CONSTRAINT PK_POS5008 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS5008_MST')
  CREATE UNIQUE INDEX IDX_POS5008_MST ON POS5008 (MID, SYS_StoreNo, TXN_Date, ECR_No, TXN_No, TXN_Item)

EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'MID', '商戶編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'SYS_StoreNo', '門市店號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'TXN_Date', '交易日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'ECR_No', '收銀機號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'TXN_No', '交易序號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'TXN_Item', '項次';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'TXN_Time', '交易時間';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'PAY_No', '付款編號，POS1006.PAY_No';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'TXN_PayDesc', '付款註記';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'TXN_PayAmt', '付款金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'TXN_Mode', '交易模式';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'TXN_Status', '交易狀態';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'PAY_TaxType', '付款稅別，0=未稅、1=已稅';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'TXN_OverAmt', '溢收金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'TXN_CouponNo', '券號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'PAY_Type', '付款別型態，POS1006.PAY_Type';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'TXN_Point', '使用點數(以付款type區分是何種點數)';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'CRD_No', '付款卡號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'CRD_Type', '付款信用卡卡別，V=VISA、M=MASTER、J=JCB、A=AE、D=DINVER、S=銀聯卡、O=其他';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'EDC_HostID', '授權銀行代碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'EDC_MerID', '特店代號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'EDC_TmID', '端末機號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'EDC_BnkNo', '收單銀行代碼，956=聯合信用卡中心、822=中國信託';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'BNK_No', '信用卡發卡銀行代碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'TERM_No', '期別，0=一般，其餘為分期的期數';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'EDC_ApprovalCode', '信用卡交易授權碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'EDC_ExpireDate', '信用卡到期日';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'EDC_RcptNo', '簽單序號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'EDC_RRN', '銀行交易序號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'TXN_TaxAlwnc', '備抵稅額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'EDC_InstHeadAmt', '分期付款-首期金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'EDC_InstEachAmt', '分期付款-每期金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'TXN_BalBeforePay', '交易前餘額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'TXN_BalAfterPay', '交易後餘額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'TXN_AutoloadAmt', '自動加值金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'VOU_Check', '有價券兌回方式，1=連線、2=離線、3=大宗兌回';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'PRM_PAY_No', '修正前-付款編號，POS1006.PAY_No';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS5008', 'UPD_Date', '變更日期';


/*POS3012 交易紀錄檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS3012')
BEGIN
CREATE TABLE POS3012
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
	MID                 DECIMAL(19) DEFAULT 0 NOT NULL,    /*商戶編號*/
    SYS_StoreNo         VARCHAR(10)         NOT NULL,       /*門市店號*/
    ECR_No              VARCHAR(10)         NOT NULL,       /*收銀機代碼*/
    TXN_Date            DATE                NOT NULL,       /*交易日期*/
    TXN_No              DECIMAL(08)         NOT NULL,       /*交易序號*/
    TXN_DType           VARCHAR(10)         NOT NULL,       /*資料型態，C4=銷貨交易 C5=作廢交易*/
    TXN_ProcStatus      VARCHAR(02)         NOT NULL,       /*處理狀態*/
    TXN_Time            DATETIME            NOT NULL,       /*作業時間*/
    TXN_RType           VARCHAR(20)             NULL,       /*作業類型*/

    CRT_Date            DATETIME                NULL,       /*建立日期*/
    UPD_Date            DATETIME                NULL,       /*變更日期*/

    CONSTRAINT PK_POS3012 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS3012_MST')
  CREATE UNIQUE INDEX IDX_POS3012_MST ON POS3012 (MID, SYS_StoreNo, TXN_Date, ECR_No, TXN_No, TXN_DType)


/*POS3017 即時銷售禮券明細檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS3017')
BEGIN
CREATE TABLE POS3017
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    SYS_StoreNo         VARCHAR(10)         NOT NULL,       /*門市店號*/
    TXN_Date            DATE                NOT NULL,       /*交易日期*/
    ECR_No              VARCHAR(10)         NOT NULL,       /*收銀機號*/
    TXN_No              DECIMAL(08)         NOT NULL,       /*交易序號*/
    CPN_No              VARCHAR(30)         NOT NULL,       /*票券號碼或交易操作代碼，PKNGDSC=停車折抵*/
    TXN_Item            DECIMAL(06)         NOT NULL,       /*交易項次*/
    CPN_Status          VARCHAR(02)         NOT NULL,       /*操作類型，2=禮券銷售、3=禮券兌回、N=其他*/
    TXN_Mode            CHAR(01)            NOT NULL,       /*交易模式*/
    TXN_Status          CHAR(01)            NOT NULL,       /*交易狀態*/
    USR_No              VARCHAR(16)         NOT NULL,       /*收銀員號碼*/
    CPN_Amt             DECIMAL(14,4)           NULL,       /*禮券金額*/
    CPN_Qty             DECIMAL(10,2)           NULL,       /*禮券數量*/
    TXN_Time            DATETIME                NULL,       /*交易時間*/
    CPN_Desc            VARCHAR(50)             NULL,       /*禮券備註*/
    CPN_Code1           VARCHAR(30)             NULL,       /*代碼1*/
    CPN_Code2           VARCHAR(30)             NULL,       /*代碼2*/
    CPN_Code3           VARCHAR(30)             NULL,       /*代碼3*/
    CPN_Code4           VARCHAR(30)             NULL,       /*代碼4*/
    CPN_Code5           VARCHAR(30)             NULL,       /*代碼5*/

    CONSTRAINT PK_POS3017 PRIMARY KEY CLUSTERED (ID)

)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS3017_MST')
  CREATE UNIQUE INDEX IDX_POS3017_MST ON POS3017 (SYS_StoreNo, TXN_Date, ECR_No, TXN_No, CPN_No, TXN_Item)

/*  有價券兌回紀錄
POS3017.SYS_StoreNo = POS5006.SYS_StoreNo
POS3017.TXN_Date = POS5006.TXN_Date
POS3017.ECR_No = POS5006.ECR_No
POS3017.TXN_No = POS5006.TXN_No
POS3017.TXN_Item = POS5008.TXN_Item
POS3017.TXN_Status = POS5006.TXN_Status
POS3017.TXN_Mode = POS5006.TXN_Mode
POS3017.CPN_Status = 3
POS3017.CPN_No = 有價券券號
POS3017.CPN_Desc = 空白
POS3017.CPN_Qty = 1
POS3017.CPN_Amt = 有價券兌回金額
POS3017.TXN_Time = 連線時間
POS3017.CPN_Code1 = 空白
POS3017.CPN_Code2 = 空白
POS3017.CPN_Code3 = 空白
POS3017.CPN_Code4 = 空白
POS3017.CPN_Code5 = 空白
*/

/*  停車折抵連線紀錄
POS3017.SYS_StoreNo = POS5006.SYS_StoreNo
POS3017.TXN_Date = POS5006.TXN_Date
POS3017.ECR_No = POS5006.ECR_No
POS3017.TXN_No = POS5006.TXN_No
POS3017.TXN_Item = 流水號
POS3017.TXN_Status = POS5006.TXN_Status
POS3017.TXN_Mode = POS5006.TXN_Mode
POS3017.CPN_Status = N
POS3017.CPN_No = PKNGDSC
POS3017.CPN_Desc = 車牌
POS3017.CPN_Qty = 折抵時數
POS3017.CPN_Amt = 消費金額
POS3017.TXN_Time = 連線時間
POS3017.CPN_Code1 = 會員卡號
POS3017.CPN_Code2 = 信用卡卡號
POS3017.CPN_Code3 = 空白
POS3017.CPN_Code4 = 連線回應ID
POS3017.CPN_Code5 = 作廢註記
*/


/*POS3021 發票列印活動說明檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS3021')
BEGIN
CREATE TABLE POS3021
(
     ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
     SYS_StoreNo         VARCHAR(10)         NOT NULL,     /*門市店號*/
     TXN_Date            DATE                NOT NULL,     /*交易日期*/
     ECR_No              VARCHAR(10)         NOT NULL,     /*收銀機號*/
     TXN_No              DECIMAL(08)         NOT NULL,     /*交易序號*/
     TXN_Item            DECIMAL(06)         NOT NULL,     /*項次*/
     TXN_ProgNo          VARCHAR(20)         NOT NULL,     /*活動編號*/
     TXN_ProgDesc        VARCHAR(832)        NOT NULL,     /*活動說明*/
     TXN_Time            DATETIME            NOT NULL,     /*交易時間*/
     TXN_Ret_No          VARCHAR(20)             NULL,     /*退貨單號*/

     CONSTRAINT PK_POS3021 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS3021_MST')
  CREATE INDEX IDX_POS3021_MST ON POS3021 (SYS_StoreNo, TXN_Date, ECR_No, TXN_No, TXN_Item)


/*POS70011 信用卡 BIN 碼檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS70011')
BEGIN
CREATE TABLE POS70011
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    CRD_BinCode         VARCHAR(16)         NOT NULL,      /*信用卡 BIN 碼*/
    BNK_No              VARCHAR(06)         NOT NULL,      /*發卡銀行代碼*/
	CRD_Type            VARCHAR(06)         NOT NULL,      /*信用卡卡別，V=VISA、M=MASTER、J=JCB、A=AE、D=DINVER、S=銀聯卡、O=其他*/
	CRD_GUI_CarrType    VARCHAR(06)             NULL,      /*電子發票載具類別、信用卡=EK0002*/
	CRD_Desc            NVARCHAR(30)            NULL,      /*備註*/

    CRT_Date            DATETIME                NULL,      /*建立日期*/
    CRT_USR_No          VARCHAR(16)             NULL,      /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)            NULL,      /*建立人員姓名*/
    UPD_Date            DATETIME                NULL,      /*變更日期*/
    UPD_USR_No          VARCHAR(16)             NULL,      /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)            NULL,      /*變更人員姓名*/

    CONSTRAINT PK_POS70011 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS70011_MST')
  CREATE INDEX IDX_POS70011_MST ON POS70011 (CRD_BinCode)



/*POS7004 非銷售資料記錄檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS7004')
BEGIN
CREATE TABLE POS7004
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    SYS_StoreNo         VARCHAR(10)        NOT NULL,        /*門市店號*/
    TXN_Date            DATE               NOT NULL,        /*交易日期*/
    ECR_No              VARCHAR(10)        NOT NULL,        /*收銀機號*/
    TXN_No              DECIMAL(08)        NOT NULL,        /*交易序號*/
    FNS_Class           VARCHAR(02)        NOT NULL,        /*操作班別*/
    FNS_DateTime        DATETIME           NOT NULL,        /*操作日期時間*/
    USR_No              VARCHAR(16)        NOT NULL,        /*收銀員編號*/
    TLT_No              VARCHAR(12)            NULL,        /*專櫃編號*/
    FNS_Flag            VARCHAR(06)        NOT NULL,        /*方式，0=登入、1=開錢櫃、2=零用金、3=繳大鈔、4=關機清帳、5=授權、6=登出、8=變更密碼、9=開機、PKG=停車折抵、PKG#=強制停車折抵*/
    FNS_Qty             DECIMAL(10,2)      NOT NULL,        /*數量，未輸入數量的操作則固定為零*/
    FNS_Amount          DECIMAL(10,2)      NOT NULL,        /*金額，未輸入金額的操作則固定為零*/
    FNS_Data            VARCHAR(50)            NULL,        /*非銷售資料*/
    FNS_Info            VARCHAR(64)            NULL,        /*操作資訊*/

    CONSTRAINT PK_POS7004 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS7004_MST')
  CREATE UNIQUE INDEX IDX_POS7004_MST ON POS7004 (SYS_StoreNo, TXN_Date, ECR_No, TXN_No);

EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'SYS_StoreNo', '門市店號POS1001.SYS_StoreNo';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'TXN_Date', '交易日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'ECR_No', '收銀機號POS1001.ECR_No';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'TXN_No', '交易序號';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'FNS_Class', '操作班別';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'FNS_DateTime', '操作日期時間';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'USR_No', '收銀員編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'TLT_No', '專櫃編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'FNS_Flag', '方式，0=登入、1=開錢櫃、2=零用金、3=繳大鈔、4=關機清帳、5=授權、6=登出、8=變更密碼、9=開機、PKG=停車折抵、PKG#=強制停車折抵';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'FNS_Qty', '數量，未輸入數量的操作則固定為零';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'FNS_Amount', '金額，未輸入金額的操作則固定為零';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'FNS_Data', '非銷售資料';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'FNS_Info', '操作資訊';


/*  強制停車折抵紀錄
POS7004.SYS_StoreNo = POS51001.SYS_StoreNo
POS7004.TXN_Date = POS1003.TXN_Date
POS7004.ECR_No = POS1001.ECR_No
POS7004.TXN_No = POS1003.TXN_NextOther
POS7004.FNS_Class = POS1003.USR_Class
POS7004.FNS_DateTime = GETDATE()
POS7004.USR_No = POS1003.USR_No
POS7004.FNS_Flag = 'PKG#'
POS7004.FNS_Qty = 折抵時數
POS7004.FNS_Amount = 折抵時數對應金額
POS7004.FNS_Data = 車牌號碼
POS7004.FNS_Info = 空白

*/

/*ECS3008 電子支付交易檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'ECS3008')
BEGIN
CREATE TABLE ECS3008
(
     ID                     DECIMAL(19) IDENTITY(1,1) NOT NULL, /*ID*/
     SYS_StoreNo            VARCHAR(10)         NOT NULL,      /*店號*/
     TXN_Date               DATE                NOT NULL,      /*交易日期*/
     ECR_No                 VARCHAR(10)         NOT NULL,      /*收銀機代碼*/
     TXN_No                 DECIMAL(08)         NOT NULL,      /*交易序號 POS5006.TXN_No*/
     ECS_TXN_No             DECIMAL(06)         NOT NULL,      /*付款交易序號*/
     GPAY_ORDER_NO          VARCHAR(32)         NOT NULL,      /*交易單號*/
     TXN_Item               DECIMAL(06)         NOT NULL,      /*項次(POS5008.TXN_Item)*/
     TXN_Time               DATETIME            NOT NULL,      /*交易時間 YYYY/MM/DD HH:NN:SS*/
     USR_No                 VARCHAR(16)         NOT NULL,      /*操作人員代碼*/
     TXN_SendDate           DATETIME            NOT NULL,      /*帳務日期 YYYY/MM/DD 若為購物則為 TXN_Date 若為退貨則為 TXN_VoidDT*/
     TXN_VoidDT             DATE                    NULL,      /*發票作廢日期*/
     TXN_Mode               CHAR(01)            NOT NULL,      /*交易模式，R=收銀、E=補輸入*/
     TXN_Status             CHAR(01)            NOT NULL,      /*交易狀態，N=正常交易、C=交易取消、D=當日發票作廢、E=隔日發票作廢*/

     GPAY_TxnType           VARCHAR(04)         NOT NULL,      /*交易類型 Transaction Type*/
                                                               /*O(rder)=購貨交易*/
                                                               /*R(eturn)=退貨交易*/
                                                               /*X=取消交易*/
                                                               /*C=查詢交易*/
     GPAY_ProductName       VARCHAR(64)             NULL,      /*商品名稱(購買的第一個商品品名後加上 ...等N件), 用在平台會傳到手機上顯示用*/
     GPAY_UserPayNo         VARCHAR(128)        NOT NULL,      /*購買人購買的載具編號(QR CODE) */
     GPAY_PayType           VARCHAR(16)         NOT NULL,      /*付款種類 LINE=LINE Pay*/
                                                               /*        LINEPTS=LINE Points*/
                                                               /*        EDENRED=宜睿智慧*/
                                                               /*        JKOS=街口錢包*/
                                                               /*        TWNPAY=台灣Pay*/
                                                               /*        EZCARD=悠遊卡*/
                                                               /*        IPASS=一卡通*/
                                                               /*        IPSMNY=iPASS MONEY*/
     GPAY_ReCheckId         VARCHAR(64)             NULL,      /*重新確認交易代碼(若是Order時，本欄位為空白)*/
     GPAY_ErpInfo           VARCHAR(1024)           NULL,      /*ERP相關資訊，非必填*/
     GPAY_Version           VARCHAR(08)             NULL,      /**/
     GPAY_MultiClient       VARCHAR(24)             NULL,      /*取用多重設定檔，非必填*/

     GPAY_BoxStatus         VARCHAR(16)             NULL,      /*支付平台回傳代碼，0000=成功、9999=失敗*/
     GPAY_BoxDesc           VARCHAR(128)            NULL,      /*支付平台回傳訊息*/
     GPAY_ReturnStatus      VARCHAR(16)             NULL,      /*支付機構回傳代碼*/
     GPAY_ReturnDesc        VARCHAR(128)            NULL,      /*支付機構回傳說明*/
     GPAY_PayInfo           VARCHAR(1024)           NULL,      /*支付機構回傳資訊*/
     GPAY_Amount            DECIMAL(10,2)           NULL,      /*本次交易金額*/
     TLT_No                 VARCHAR(20)             NULL,      /*專櫃編號*/
     ECS_RspnTime           DATETIME                NULL,      /*支付平台回應時間，YYYY/MM/DD HH:NN:SS*/
     GPAY_ClientId          VARCHAR(32)             NULL,      /*端末機代碼*/
     ECS_PayTime            DATETIME                NULL,      /*支付機構實際付款日期時間，YYYY/MM/DD HH:NN:SS*/

     /*以下為對帳程式寫入*/
     ReportDate             DATETIME                NULL,      /*讀取好付對帳的時間-由對帳程式寫入*/
     ClearFlag              VARCHAR(01)             NULL,      /*帳款旗標, 0=正常(PayInfo.PayStatus=Pay(付款成功) Refund(退款成功)) 1=例外交易(PayInfo.PayStatus=Check(待確認)) N=不清分*/
     STORE_FEE_RATE         DECIMAL(8,4)            NULL,      /*銀行手續費率, 例如: 0.8*/
     RECONCILE_TIME         DATETIME                NULL,      /*對帳時間 PayInfo.MakeDate */
     SETTLEMENT_TIME        DATETIME                NULL,      /*結算時間 PayInfo.SettleDate */
     APPROPRIATION_TIME     DATETIME                NULL,      /*撥款時間 PayInfo.SettleDate */

     ECS_PreBalance         DECIMAL(10,2)           NULL,      /*交易前餘額*/
     ECS_Balance            DECIMAL(10,2)           NULL,      /*交易後餘額*/
     ECS_AutoloadAmt        DECIMAL(10,2)           NULL,      /*自動加值金額*/

	PAY_No                VARCHAR(02)             NULL,     /*付款編號，POS5008.PAY_No*/
     ECS_CrdNo              VARCHAR(20)             NULL,      /*卡號*/
     MEB_No                 VARCHAR(20)             NULL,      /*會員編號*/
     ECS_StoID              VARCHAR(20)             NULL,      /*特店代號*/
     ECS_PrmRstAmt          DECIMAL(14,4)           NULL,      /*不可折抵金額(菸品)*/
     ECS_PointAmt           DECIMAL(14,4)           NULL,      /*點數折抵金額*/
     ECS_WalletID           VARCHAR(20)             NULL,      /*支付錢包代號*/
     ECS_WalletPayNo        VARCHAR(08)             NULL,      /*錢包支付代號*/
     ECS_WalletPayType      VARCHAR(08)             NULL,      /*錢包支付類別*/
     MMT_No                 VARCHAR(08)             NULL,      /*商場代號(未使用)*/
     ECS_ExpireDate         DATETIME                NULL,      /*到期日期*/
     ECS_InstPeriod         INTEGER                 NULL,      /*分期期數*/
     ECS_GUI_CarrType       VARCHAR(06)             NULL,      /*電子發票載具類別 悠遊卡=1K0001 共通性載具手機條碼=3J0002 自然人憑證=CQ0001 一卡通=1H0001 信用卡=EK0002*/
     ECS_GUI_CarrId         VARCHAR(64)             NULL,      /*電子發票載具ID*/

     CONSTRAINT PK_ECS3008 PRIMARY KEY clustered (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_ECS3008_MST')
  CREATE UNIQUE INDEX IDX_ECS3008_MST ON ECS3008 (SYS_StoreNo, TXN_Date, ECR_No, TXN_No, ECS_TXN_No);

EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'SYS_StoreNo', '店號';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'TXN_Date', '交易日期';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ECR_No', '收銀機號';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'TXN_No', '交易序號';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ECS_TXN_No', '付款交易序號';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'GPAY_ORDER_NO', '交易單號';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'TXN_Item', '項次(POS5008.TXN_Item)';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'TXN_Time', '交易時間 YYYY/MM/DD HH:NN:SS';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'USR_No', '操作人員代碼';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'TXN_SendDate', '帳務日期 YYYY/MM/DD 若為購物則為 TXN_Date，若為退貨則為 TXN_VoidDT';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'TXN_VoidDT', '發票作廢日期';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'TXN_Mode', '交易模式，R=收銀、E=補輸入';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'TXN_Status', '交易狀態，N=正常交易、C=交易取消、D=當日發票作廢、E=隔日發票作廢';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'GPAY_TxnType', '交易類型，O=購貨交易、R=退貨交易、X=取消交易、C=查詢交易';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'GPAY_ProductName', '商品名稱';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'GPAY_UserPayNo', '付款條碼';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'GPAY_PayType', '付款種類 (LINE=LINE Pay, LINEPTS=LINE Points, EDENRED=宜睿智慧, JKOS=街口錢包, TWNPAY=台灣Pay, EZCARD=悠遊卡, IPASS=一卡通, IPSMNY=iPASS MONEY)';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'GPAY_ReCheckId', '重新確認交易代碼(若是Order時，本欄位為空白)';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'GPAY_ErpInfo', 'ERP相關資訊，非必填';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'GPAY_Version', '版本號';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'GPAY_MultiClient', '取用多重設定檔，非必填';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'GPAY_BoxStatus', '支付狀態代碼，0000=成功，9999=失敗';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'GPAY_BoxDesc', '支付平台回傳訊息';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'GPAY_ReturnStatus', '支付機構回傳代碼';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'GPAY_ReturnDesc', '支付機構回傳說明';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'GPAY_PayInfo', '支付機構回傳資訊';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'GPAY_Amount', '本次交易金額';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'TLT_No', '專櫃編號';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ECS_RspnTime', '好付回應的時間-由POS寫入 YYYY/MM/DD HH:NN:SS';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'GPAY_ClientId', '端末機代碼，特定交易非必填';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ECS_PayTime', '支付機構實際付款日期時間 YYYY/MM/DD HH:NN:SS';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ReportDate', '對帳日期';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ClearFlag', '帳款旗標, 0=正常(PayInfo.PayStatus=Pay(付款成功) Refund(退款成功)) 1=例外交易(PayInfo.PayStatus=Check(待確認)) N=不清分';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'STORE_FEE_RATE', '銀行手續費率, 例如: 0.8';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'RECONCILE_TIME', '對帳時間 PayInfo.MakeDate';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'SETTLEMENT_TIME', '結算時間 PayInfo.SettleDate';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'APPROPRIATION_TIME', '撥款時間 PayInfo.SettleDate';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ECS_PreBalance', '交易前餘額';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ECS_Balance', '交易後餘額';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ECS_AutoloadAmt', '自動加值金額';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ECS_CrdNo', '卡號';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'MEB_No', '會員編號';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ECS_StoID', '特店代號';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ECS_PrmRstAmt', '不可折抵金額(菸品)';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ECS_PointAmt', '點數折抵金額';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ECS_WalletID', '支付錢包代號';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ECS_WalletPayNo', '錢包支付代號';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ECS_WalletPayType', '錢包支付類別';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'MMT_No', '商場代號(未使用)';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ECS_ExpireDate', '到期日期';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ECS_InstPeriod', '分期期數';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ECS_GUI_CarrType', '電子發票載具類別，悠遊卡=1K0001、共通性載具手機條碼=3J0002、自然人憑證=CQ0001、一卡通=1H0001、信用卡=EK0002';
EXEC [dbo].[spUpdateColumnDesc] 'ECS3008', 'ECS_GUI_CarrId', '電子發票載具ID';


/*POS6104 宜睿智慧-即享券每日對帳檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS6104')
BEGIN
CREATE TABLE POS6104
(
     ID                    DECIMAL(19,0) IDENTITY(1,1) NOT NULL,      /*ID*/
     EDNR_File             VARCHAR(64)         NOT NULL,     /*每日對帳檔名稱 [merchant code]yyyyMMdd_result.csv */
     EDNR_Date             DATE                NOT NULL,     /*檔案日期*/
     EDNR_ProcDate         DATETIME                NULL,     /*處理日期*/
     EDNR_SeqNo            DECIMAL(08)         NOT NULL,     /*項次*/
     EDNR_ProdType         VARCHAR(02)             NULL,     /*商品種類 01=單次使用商品券、單次使用面額券、多次使用商品券 02=多次使用面額券(餘額型)*/
     EDNR_VoucherNum       VARCHAR(20)             NULL,     /*券號 ECS3008.GPAY_UserPayNo */
     EDNR_ProdName         VARCHAR(50)             NULL,     /*商品名稱 ECS3008.GPAY_PayInfo */
     EDNR_ExtProdCode      VARCHAR(50)             NULL,     /*商品代碼 ExternalProductCode ECS3008.GPAY_MultiClient */
     EDNR_MerchantCode     VARCHAR(50)             NULL,     /*商店代碼 */
     EDNR_TranShop         VARCHAR(50)             NULL,     /*核銷店點編號 ECS3008.GPAY_ClientId */
     EDNR_TranAmt          DECIMAL(12)             NULL,     /* TranAmount */
     EDNR_ResultType       VARCHAR(50)             NULL,     /*交易結果 ResultType Success/Fail */
     EDNR_ProcessType      VARCHAR(50)             NULL,     /*交易種類 Redemption/ReverseRedemption */
     EDNR_TranDate         DATETIME                NULL,     /*交易時間 yyyy/mm/dd hh:mm:ss */
     EDNR_TerminalSSN      VARCHAR(50)             NULL,     /*收銀機台交易序號 ECS3008.GPAY_ORDER_NO */
     EDNR_TranCode         VARCHAR(50)             NULL,     /*宜睿交易序號 ECS3008.GPAY_ReCheckId */
     EDNR_BizDay           DATE                    NULL,     /*交易歸屬營業日期 yyyy/MM/dd */
     EDNR_Response         VARCHAR(10)             NULL,     /*回覆核對結果 Success/Fail */

     SYS_StoreNo           VARCHAR(10)             NULL,     /*交易店號 ECS3008.SYS_StoreNo*/
     TXN_Date              DATE                    NULL,     /*交易日期 ECS3008.TXN_Date*/
     ECR_No                VARCHAR(10)             NULL,     /*收銀機號 ECS3008.ECR_No*/
     TXN_No                DECIMAL(08)             NULL,     /*交易序號 ECS3008.TXN_No*/
     ECS_TXN_No            DECIMAL(06)             NULL,     /*付款交易序號 ECS3008.ECS_TXN_No*/
	 PAY_No                VARCHAR(02)             NULL,     /*付款編號，POS5008.PAY_No*/
     GPAY_Amount           DECIMAL(10,2)           NULL,     /*交易金額*/
	 TXN_OverAmt	       DECIMAL(10,2)           NULL,     /*溢收金額，若為單次使用商品券、單次使用面額券，付款金額低於即享券面額時，會產生溢收金額*/

     EDNR_TXN_Date         DATE                    NULL,     /*帳務日期  若交易種類為兌換則為 POS5006.TXN_Date，若交易種類為取消兌換則為 POS5006.TXN_VoidDT */
     EDNR_ECR_No           VARCHAR(10)             NULL,     /*帳務機號  若交易種類為兌換則為 POS5006.ECR_No，若交易種類為取消兌換則為 POS5006.TXN_VoidEcrNo */
     EDNR_USR_No           VARCHAR(16)             NULL,     /*帳務收銀員編號  若交易類型為兌換則為 POS5006.USR_No，若交易類型為取消兌換則為 POS5006.TXN_VoidUsrNo */
     TLT_No                VARCHAR(12)             NULL,     /*專櫃編號*/
     Contract_No           VARCHAR(20)             NULL,     /*專櫃合約編號*/
     Contract_SubNo        VARCHAR(04)             NULL,     /*專櫃合約附號*/
	 Talent_ID             DECIMAL(19,0)           NULL,     /*專櫃合約編號系統 ID*/
	 EDNR_BSN_Date         DATE                    NULL,     /*交易完成日，交易時間中屬於日期的部分，YYYY/MM/DD*/

     EDNR_Check            VARCHAR(02)             NULL,     /*比對備註 Y=比對正確 N=未比對*/

	 VouNo                 VARCHAR(12)             NULL,	 /*傳票編號*/

     CRT_Date              DATETIME                NULL,     /*建立日期*/
     CRT_USR_No            VARCHAR(16)             NULL,     /*建立人員*/
     UPD_Date              DATETIME                NULL,     /*變更日期*/
     UPD_USR_No            VARCHAR(16)             NULL,     /*變更人員*/

     CONSTRAINT PK_POS6104 PRIMARY KEY CLUSTERED (ID)
)
END

EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'ID', '自動編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_File', '每日對帳檔名稱 [merchant code]yyyyMMdd_result.csv';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_Date', '檔案日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_ProcDate', '處理日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_SeqNo', '項次';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_ProdType', '商品種類 01=單次使用商品券、單次使用面額券、多次使用商品券 02=多次使用面額券(餘額型)';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_VoucherNum', '券號 ECS3008.GPAY_UserPayNo';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_ProdName', '商品名稱 ECS3008.GPAY_PayInfo';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_ExtProdCode', '商品代碼 ExternalProductCode ECS3008.GPAY_MultiClient';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_MerchantCode', '商店代碼';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_TranShop', '核銷店點編號 ECS3008.GPAY_ClientId';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_TranAmt', '交易金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_ResultType', '交易結果 ResultType Success/Fail';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_ProcessType', '交易種類 Redemption/ReverseRedemption';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_TranDate', '交易時間 yyyy/MM/dd hh:mm:ss';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_TerminalSSN', '收銀機台交易序號 ECS3008.GPAY_ORDER_NO';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_TranCode', '宜睿交易序號 ECS3008.GPAY_ReCheckId';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_BizDay', '交易歸屬營業日期 yyyy/MM/dd';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_Response', '回覆核對結果 Success/Fail';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'SYS_StoreNo', '交易店號 ECS3008.SYS_StoreNo';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'TXN_Date', '交易日期 ECS3008.TXN_Date';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'ECR_No', '收銀機號 ECS3008.ECR_No';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'TXN_No', '交易序號 ECS3008.TXN_No';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'ECS_TXN_No', '付款交易序號 ECS3008.ECS_TXN_No';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'PAY_No', '付款編號，POS5008.PAY_No';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'GPAY_Amount', '交易金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'TXN_OverAmt', '溢收金額，若為單次使用商品券、單次使用面額券，付款金額低於即享券面額時，會產生溢收金額';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_TXN_Date', '帳務日期，若交易種類為兌換則為 POS5006.TXN_Date，若交易種類為取消兌換則為 POS5006.TXN_VoidDT';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_ECR_No', '帳務機號，若交易種類為兌換則為 POS5006.ECR_No，若交易種類為取消兌換則為 POS5006.TXN_VoidEcrNo';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_USR_No', '帳務收銀員編號，若交易類型為兌換則為 POS5006.USR_No，若交易類型為取消兌換則為 POS5006.TXN_VoidUsrNo';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'TLT_No', '專櫃編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'Contract_No', '專櫃合約編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'Contract_SubNo', '專櫃合約附號';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'Talent_ID', '專櫃合約編號系統 ID';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_BSN_Date', '交易完成日，交易時間中屬於日期的部分，YYYY/MM/DD';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'EDNR_Check', '比對備註 Y=比對正確 N=未比對';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'VouNo', '傳票編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'CRT_USR_No', '建立人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'UPD_Date', '變更日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS6104', 'UPD_USR_No', '變更人員';


/*POS6107 PayEasy 對帳檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS6107')
BEGIN
CREATE TABLE POS6107
(
     ID                    NUMERIC(19,0) IDENTITY(1,1) NOT NULL,      /*ID*/
     PYEZ_File             VARCHAR(64)         NOT NULL,     /*對帳檔名稱 *.csv*/
     PYEZ_Date             DATE                NOT NULL,     /*檔案日期*/
     PYEZ_ProcDate         DATETIME                NULL,     /*處理日期*/
     PYEZ_SeqNo            NUMERIC(08)         NOT NULL,     /*項次*/

     PYEZ_WebName          VARCHAR(64)             NULL,     /*銷售網站名稱                           */
     PYEZ_OrderNo          VARCHAR(32)             NULL,     /*訂單編號                               */
     PYEZ_Code             VARCHAR(16)             NULL,     /*兌換票券的代碼(含-，共15碼)            */
     PYEZ_OrdStatus        VARCHAR(256)            NULL,     /*訂單狀態敘述(貨到)                     */
     PYEZ_OrdTotValue      NUMERIC(19)             NULL,     /*訂單金額                               */
     PYEZ_EtxStatus        VARCHAR(256)            NULL,     /*核銷狀態敘述(未使用、已核銷)           */
     PYEZ_Time             DATETIME                NULL,     /*首次核銷執行時間格式為yyyyMMdd HH:mm:ss*/
     PYEZ_Store            VARCHAR(512)            NULL,     /*核銷店家名稱*/
     PYEZ_StoreId          VARCHAR(32)             NULL,     /*核銷店家編號*/
     PYEZ_ProNo            DECIMAL(19)             NULL,     /*商品流水號*/
     PYEZ_ProQc            VARCHAR(128)            NULL,     /*商品原始碼*/
     PYEZ_ProName          VARCHAR(256)            NULL,     /*商品名稱*/
     PYEZ_IteQty           DECIMAL(19)             NULL,     /*數量*/
     PYEZ_ItePayment       DECIMAL(19)             NULL,     /*單價*/
     PYEZ_ProCValue        DECIMAL(09)             NULL,     /*成本*/
     PYEZ_Remark           VARCHAR(256)            NULL,     /*核銷序號(由POS機提供Unique Key)*/
     PYEZ_Amt              DECIMAL(19)             NULL,     /*核銷金額*/
     PYEZ_VerifyDate       DATETIME                NULL,     /*核銷執行時間格式為 yyyyMMdd HH:mm:ss*/
     PYEZ_RevVerifyDate    DATETIME                NULL,     /*逆核銷執行時間格式為 yyyyMMdd HH:mm:ss */
	 PYEZ_ActAmt           DECIMAL(19)             NULL,     /*實際核銷金額，若為當日逆核銷則實際核銷金額為零，若為隔日逆核銷則實際核銷金額為負值*/

     SYS_StoreNo           VARCHAR(10)             NULL,     /*交易店號 ECS3008.SYS_StoreNo*/
     TXN_Date              DATE                    NULL,     /*交易日期 ECS3008.TXN_Date*/
     ECR_No                VARCHAR(10)             NULL,     /*收銀機號 ECS3008.ECR_No*/
     TXN_No                DECIMAL(08)             NULL,     /*交易序號 ECS3008.TXN_No*/
     ECS_TXN_No            DECIMAL(06)             NULL,     /*付款交易序號 ECS3008.ECS_TXN_No*/
	 PAY_No                VARCHAR(02)             NULL,     /*付款編號，POS5008.PAY_No*/
     TLT_No                VARCHAR(12)             NULL,     /*專櫃編號*/
     Contract_No           VARCHAR(20)             NULL,     /*專櫃合約編號*/
     Contract_SubNo        VARCHAR(04)             NULL,     /*專櫃合約附號*/
	 Talent_ID             DECIMAL(19,0)           NULL,      /*專櫃合約編號系統 ID*/

     PYEZ_TXN_Date         DATE                    NULL,     /*帳務日期  若交易種類為付款則為 POS5006.TXN_Date，若交易種類為退款則為 POS5006.TXN_VoidDT */
     PYEZ_ECR_No           VARCHAR(10)             NULL,     /*帳務機號  若交易種類為付款則為 POS5006.ECR_No，若交易種類為退款則為 POS5006.TXN_VoidEcrNo */
     PYEZ_USR_No           VARCHAR(16)             NULL,     /*帳務收銀員編號  若交易類型為付款則為 POS5006.USR_No，若交易類型為退款則為 POS5006.TXN_VoidUsrNo */
     PYEZ_Check            VARCHAR(02)             NULL,     /*比對備註 Y=比對正確 N=未比對*/
     PYEZ_TXN_Type         VARCHAR(08)             NULL,     /*交易類型  付款=沒有逆核銷時間  退款=當日作廢，核銷與逆核銷日期相同，實際核銷金額為零  隔日退款=隔日作廢，核銷與逆核銷日期不同，實際核銷金額為負值*/
	 PYEZ_BSN_Date         DATE                    NULL,     /*交易完成日，PYEZ_Time 中屬於日期的部分，YYYY/MM/DD*/

     ACC_ExportDate        VARCHAR(08)             NULL,      /*傳票轉出日期*/
     ACC_Export_USR_No     VARCHAR(16)             NULL,      /*傳票轉出人員*/
     VouNo                 VARCHAR(12)             NULL,	   /*傳票編號*/

     CRT_Date              DATETIME                NULL,     /*建立日期*/
     CRT_USR_No            VARCHAR(16)             NULL,     /*建立人員*/
     UPD_Date              DATETIME                NULL,     /*變更日期*/
     UPD_USR_No            VARCHAR(16)             NULL,     /*變更人員*/

     CONSTRAINT PK_POS6107 PRIMARY KEY CLUSTERED (ID)
)
END


/*POS6111 LINE Pay 交易銷帳明細檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS6111')
BEGIN
CREATE TABLE POS6111
(
    ID                    DECIMAL(19) IDENTITY(1,1) NOT NULL,      /*ID*/
    LNP_File              VARCHAR(80)         NOT NULL,     /*檔案名稱 Settlement_YOURMerchantID_FYYYYMMDD000000_TYYYYMMDD235959.csv*/
    LNP_Date              DATE                NOT NULL,     /*檔案日期*/
    LNP_ProcDate          DATETIME                NULL,     /*處理日期*/
    LNP_SeqNo             DECIMAL(08)         NOT NULL,     /*項次*/

    LNP_trx_seq           VARCHAR(19)         NOT NULL,     /*LINE Pay交易號碼*/
    LNP_orgn_trx_seq      VARCHAR(19)         NOT NULL,     /*LINE Pay原始交易號碼*/
    LNP_pay_method        VARCHAR(21)             NULL,     /*付款方式*/
                                                            /*  PAYMETHOD_CREDIT_CARD*/
                                                            /*  BALANCE */
    LNP_user_type         VARCHAR(20)             NULL,     /*跨境支付類型，預設為空*/
    LNP_trx_ymd           DATE                    NULL,     /*交易日 YYYYMMDD*/
    LNP_trx_ymdt          DATETIME                NULL,     /*交易日 YYYYMMDDHHNNSS*/
    LNP_scheduled_ymd     DATE                    NULL,     /*撥款日 YYYYMMDD*/
    LNP_item_amount       DECIMAL(25,9)           NULL,     /*產品價格*/
    LNP_discount_amount   DECIMAL(25,9)           NULL,     /*折扣金額*/
    LNP_point_amount      DECIMAL(25,9)           NULL,     /*點數兌換金額*/
    LNP_pay_amount        DECIMAL(25,9)           NULL,     /*交易金額*/
    LNP_fee_amount        DECIMAL(25,9)           NULL,     /*手續費 */
    LNP_tax_amount        DECIMAL(25,9)           NULL,     /*手續費稅額*/
    LNP_total_fee_amount  DECIMAL(25,9)           NULL,     /*手續費合計(含稅)*/
    LNP_scheduled_amount  DECIMAL(25,9)           NULL,     /*單筆交易金額減掉手續費後的金額*/
    LNP_trx_type          VARCHAR(23)             NULL,     /*交易類別*/
                                                             /*  PAYMENT=交易*/
                                                             /*  PAYMENT_CANCEL=取消交易*/
                                                             /*  PARTIAL_CANCEL=部分取消*/
                                                             /*  PAYMENT_CANCEL_REGISTER=取消授權*/
                                                             /*  PARTIAL_CANCEL_REGISTER=取消部分授權*/
    LNP_pay_status        VARCHAR(27)             NULL,     /*請款狀態*/
                                                             /*  CAPTURE=請款*/
                                                             /*  REFUND=退款*/
                                                             /*  PT_REFUND=部分退款*/
    LNP_capture_type      VARCHAR(14)             NULL,     /*請款方式*/
                                                             /*  AUTO_CAPTURE=自動*/
                                                             /*  MANUAL_CAPTURE=手動*/
    LNP_merchant_id       VARCHAR(18)             NULL,     /*商家帳號*/
    LNP_device_id         VARCHAR(20)             NULL,     /*裝置號碼*/
    LNP_order_no          VARCHAR(100)            NULL,     /*商家訂單號碼*/
    LNP_capture_ymdt      DATETIME                NULL,     /*請款日包括時分秒 YYYYMMDDHHNNSS*/
    LNP_capture_ymd       DATETIME                NULL,     /*請款日 YYYYMMDD*/
    LNP_item_name         NVARCHAR(64)            NULL,     /*商品名稱，帳務檔欄位長度為4000個字元，只取前面64個字元*/
    LNP_currency          VARCHAR(03)             NULL,     /*貨幣*/

    SYS_StoreNo           VARCHAR(06)             NULL,     /*交易店號 POS5006.SYS_StoreNo*/
    TXN_Date              DATE                    NULL,     /*交易日期 POS5006.TXN_Date*/
    ECR_No                VARCHAR(10)             NULL,     /*收銀機號 POS5006.ECR_No*/
    TXN_No                DECIMAL(08)             NULL,     /*交易序號 POS5006.TXN_No*/
    ECS_TXN_No            DECIMAL(06)             NULL,     /*ECS3008.ECS_TXN_No*/
	PAY_No                VARCHAR(02)             NULL,     /*付款編號，POS5008.PAY_No*/
    TLT_No                VARCHAR(12)             NULL,     /*專櫃編號*/
    Contract_No           VARCHAR(20)             NULL,     /*專櫃合約編號*/
    Contract_SubNo        VARCHAR(04)             NULL,     /*專櫃合約附號*/
	Talent_ID             DECIMAL(19,0)           NULL,     /*專櫃合約編號系統 ID*/

    LNP_TXN_Date          DATE                    NULL,     /*帳務日期  若請款狀態為「CAPTURE=請款」則為 POS5006.TXN_Date，若請款狀態為「REFUND=退款」則為 POS5006.TXN_VoidDT */
    LNP_ECR_No            VARCHAR(10)             NULL,     /*帳務機號  若請款狀態為「CAPTURE=請款」則為 POS5006.ECR_No，若請款狀態為「REFUND=退款」則為 POS5006.TXN_VoidEcrNo */
    LNP_USR_No            VARCHAR(16)             NULL,     /*帳務收銀員編號  若請款狀態為「CAPTURE=請款」則為 POS5006.USR_No，若請款狀態為「REFUND=退款」則為 POS5006.TXN_VoidUsrNo */
    LNP_Check             VARCHAR(02)             NULL,     /*比對備註 Y=比對正確 N=未比對 */

    ACC_ExportDate        VARCHAR(08)             NULL,      /*傳票轉出日期*/
    ACC_Export_USR_No     VARCHAR(16)             NULL,      /*傳票轉出人員*/
    VouNo                 VARCHAR(12)             NULL,       /*傳票編號*/

    CRT_Date            DATETIME                NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)             NULL,     /*建立人員*/
    UPD_Date            DATETIME                NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)             NULL,     /*變更人員*/

    CONSTRAINT PK_POS6111 PRIMARY KEY CLUSTERED (ID)
)
END


/*POS6112 iPASS Money 交易銷帳明細檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS6112')
BEGIN
CREATE TABLE POS6112
(
    ID                    DECIMAL(19) IDENTITY(1,1) NOT NULL,      /*ID*/
    IPM_File              VARCHAR(80)         NOT NULL,     /*檔案名稱 iPASS_Settlement_YOURMerchantID_F20180820000000_T20180820235959.csv*/
    IPM_Date              DATE                NOT NULL,     /*檔案日期*/
    IPM_ProcDate          DATETIME                NULL,     /*處理日期*/
    IPM_SeqNo             DECIMAL(08)         NOT NULL,     /*項次*/

    IPM_trx_seq           VARCHAR(19)         NOT NULL,     /*LINE Pay交易號碼*/
    IPM_orgn_trx_seq      VARCHAR(19)         NOT NULL,     /*LINE Pay原始交易號碼*/
    IPM_pay_method        VARCHAR(21)             NULL,     /*付款方式*/
                                                             /*  PAYMETHOD_CREDIT_CARD*/
                                                             /*  BALANCE */
    IPM_user_type         VARCHAR(20)             NULL,     /*跨境支付類型，預設為空*/
    IPM_trx_ymd           DATE                    NULL,     /*交易日 YYYYMMDD*/
    IPM_trx_ymdt          DATETIME                NULL,     /*交易日 YYYYMMDDHHNNSS*/
    IPM_scheduled_ymd     DATE                    NULL,     /*撥款日 YYYYMMDD*/
    IPM_item_amount       DECIMAL(25,9)           NULL,     /*產品價格*/
    IPM_discount_amount   DECIMAL(25,9)           NULL,     /*折扣金額*/
    IPM_point_amount      DECIMAL(25,9)           NULL,     /*點數兌換金額*/
    IPM_pay_amount        DECIMAL(25,9)           NULL,     /*交易金額*/
    IPM_fee_amount        DECIMAL(25,9)           NULL,     /*手續費 */
    IPM_tax_amount        DECIMAL(25,9)           NULL,     /*手續費稅額*/
    IPM_total_fee_amount  DECIMAL(25,9)           NULL,     /*手續費合計(含稅)*/
    IPM_scheduled_amount  DECIMAL(25,9)           NULL,     /*單筆交易金額減掉手續費後的金額*/
    IPM_trx_type          VARCHAR(23)             NULL,     /*交易類別*/
                                                             /*  PAYMENT=交易*/
                                                             /*  PAYMENT_CANCEL=取消交易*/
                                                             /*  PARTIAL_CANCEL=部分取消*/
                                                             /*  PAYMENT_CANCEL_REGISTER=取消授權*/
                                                             /*  PARTIAL_CANCEL_REGISTER=取消部分授權*/
    IPM_pay_status        VARCHAR(27)             NULL,     /*請款狀態*/
                                                             /*  CAPTURE=請款*/
                                                             /*  REFUND=退款*/
                                                             /*  PT_REFUND=部分退款*/
    IPM_capture_type      VARCHAR(14)             NULL,     /*請款方式*/
                                                             /*  AUTO_CAPTURE=自動*/
                                                             /*  MANUAL_CAPTURE=手動*/
    IPM_merchant_id       VARCHAR(18)             NULL,     /*商家帳號*/
    IPM_device_id         VARCHAR(20)             NULL,     /*裝置號碼*/
    IPM_order_no          VARCHAR(100)            NULL,     /*商家訂單號碼*/
    IPM_capture_ymdt      DATETIME                NULL,     /*請款日包括時分秒 YYYYMMDDHHNNSS*/
    IPM_capture_ymd       DATE                    NULL,     /*請款日 YYYYMMDD*/
    IPM_item_name         NVARCHAR(64)            NULL,     /*商品名稱，帳務檔欄位長度為4000個字元，只取前面64個字元*/
    IPM_currency          VARCHAR(03)             NULL,     /*貨幣*/

    SYS_StoreNo           VARCHAR(06)             NULL,     /*交易店號，POS5006.SYS_StoreNo*/
    TXN_Date              DATE                    NULL,     /*交易日期，POS5006.TXN_Date*/
    ECR_No                VARCHAR(10)             NULL,     /*收銀機號，POS5006.ECR_No*/
    TXN_No                DECIMAL(08)             NULL,     /*交易序號，POS5006.TXN_No*/
    ECS_TXN_No            DECIMAL(06)             NULL,     /*ECS3008.ECS_TXN_No*/
	PAY_No                VARCHAR(02)             NULL,     /*付款編號，POS5008.PAY_No*/
    TLT_No                VARCHAR(12)             NULL,     /*專櫃編號*/
    Contract_No           VARCHAR(20)             NULL,     /*專櫃合約編號*/
    Contract_SubNo        VARCHAR(04)             NULL,     /*專櫃合約附號*/
	Talent_ID             DECIMAL(19,0)           NULL,     /*專櫃合約編號系統 ID*/

    IPM_TXN_Date          DATE                    NULL,     /*帳務日期  若請款狀態為「CAPTURE=請款」則為 POS5006.TXN_Date，若請款狀態為「REFUND=退款」則為 POS5006.TXN_VoidDT */
    IPM_ECR_No            VARCHAR(10)             NULL,     /*帳務機號  若請款狀態為「CAPTURE=請款」則為 POS5006.ECR_No，若請款狀態為「REFUND=退款」則為 POS5006.TXN_VoidEcrNo */
    IPM_USR_No            VARCHAR(16)             NULL,     /*帳務收銀員編號  若請款狀態為「CAPTURE=請款」則為 POS5006.USR_No，若請款狀態為「REFUND=退款」則為 POS5006.TXN_VoidUsrNo */
    IPM_Check             VARCHAR(02)             NULL,     /*比對備註 Y=比對正確 N=未比對*/

    ACC_ExportDate        VARCHAR(08)             NULL,      /*傳票轉出日期*/
    ACC_Export_USR_No     VARCHAR(16)              NULL,      /*傳票轉出人員*/
    VouNo                 VARCHAR(12)             NULL,       /*傳票編號*/

    CRT_Date            DATETIME                NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)             NULL,     /*建立人員*/
    UPD_Date            DATETIME                NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)             NULL,     /*變更人員*/

     CONSTRAINT PK_POS6112 PRIMARY KEY CLUSTERED (ID)
)
END

/*POS6115 街口支付店家撥款檔(R檔) 參考 https://open-doc.jkos.com/?docs=%e7%b7%9a%e4%b8%8b%e4%ba%a4%e6%98%93pos/api%e5%88%97%e8%a1%a8/%e5%ba%97%e5%ae%b6%e6%92%a5%e6%ac%be%e6%aa%94r%e6%aa%94 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS6115')
BEGIN
CREATE TABLE POS6115
(
    ID                    DECIMAL(19) IDENTITY(1,1) NOT NULL,      /*ID*/
    JKP_File              VARCHAR(64)         NOT NULL,     /*檔案名稱 M_ReimburseReport_{（店家統編）}_{檔案產生日期（yyyyMMdd）}_R_P.csv M_ReimburseReport_22555003_20190708_R_P.csv */
    JKP_Date              DATE                NOT NULL,     /*檔案日期*/
    JKP_ProcDate          DATETIME                NULL,     /*處理日期*/
    JKP_SeqNo             DECIMAL(08)         NOT NULL,     /*項次*/

    JKP_PayDate           DATETIME                NULL,     /*預計撥款日期 YYYY/MM/DD*/
    JKP_TxnTime           DATETIME                NULL,     /*交易完成時間「TransactionTime」 YYYY/MM/DD HH:NN:SS*/
    JKP_StoreID           VARCHAR(36)             NULL,     /*店舖代碼 StoreID*/
    JKP_StoreName         VARCHAR(70)             NULL,     /*商店名稱*/
    JKP_TxnAct            VARCHAR(02)             NULL,     /*交易行為  1=支付 3=點餐 5=外送*/
    JKP_TxnType           VARCHAR(02)             NULL,     /*交易類別  J=付款 K=退款*/
    JKP_PurchaseNo        VARCHAR(50)             NULL,     /*街口訂單編號「PurchaseNo」*/
    JKP_MerTradeNo        VARCHAR(50)             NULL,     /*廠商訂單編號「MerchantTradeNo」，從街口發起退款無序號時補空白*/
    JKP_BaseAmt           DECIMAL(10,2)           NULL,     /*訂單金額，付款／退款交易的訂單金額「BaseAmount」兩位小數（含小數點），數值不加 +／-訂單金額只會有整數，所以小數點為 .00*/
    JKP_DeliveryFee       DECIMAL(10,2)           NULL,     /*街口配送費， 外送付款／退款交易且為街口配送時，會另計街口配送費「DeliveryFee」，非此類型交易補空白兩位小數（含小數點），數值不加 +／-訂單金額只會有整數，所以小數點為 .00*/
    JKP_CpnStoRedeem      DECIMAL(10,2)           NULL,     /*店家街口券折抵金額，付款／退款交易使用店家街口券的折抵金額「CouponStoreRedeem」折抵金額由店家負擔，未使用店家街口券時補空白兩位小數（含小數點），數值不加 +／-訂單金額只會有整數，所以小數點為 .00*/
    JKP_CpnJKORedeem      DECIMAL(10,2)           NULL,     /*官方街口券折抵金額，付款／退款交易使用街口街口券的折抵金額「CouponJKORedeem」折抵金額由街口負擔，未使用街口街口券時補空白兩位小數（含小數點），數值不加 +／-訂單金額只會有整數，所以小數點為 .00*/
    JKP_Redeem            DECIMAL(10,2)           NULL,     /*街口幣折抵金額，付款/退款交易的街口幣折抵金額「Redeem」兩位小數（含小數點），數值不加 +／-折抵金額只會有整數，所以小數點為 .00*/
    JKP_PayAmt            DECIMAL(10,2)           NULL,     /*支付金額，付款／退款交易扣除折抵後的金額「PayAmount」（如有街口配送費時會加上）訂單金額 – 店家／官方街口券折抵 – 街口幣折抵 + 街口配送費兩位小數（含小數點），數值不加 +／-支付金額只會有整數，所以小數點為 .00*/
    JKP_StoRebateAmt      DECIMAL(10,2)           NULL,     /*店家街口幣回饋，由店家承擔的街口幣回饋金額，無回饋時補空白兩位小數（含小數點），數值不加 +／-店家街口幣回饋只會有整數，所以小數點為 .00。*/
    JKP_ActPayAmt         DECIMAL(10,2)           NULL,     /*支付請款金額，支付金額 – 支付手續費 – 店家街口幣回饋 – 點餐／外送服務費 – 街口配送費兩位小數（含小數點），數值不加 +／-*/
    JKP_Fee               DECIMAL(10,2)           NULL,     /*支付手續費，（支付金額 – 街口配送費）x 支付費率兩位小數（含小數點），數值不加 +／-*/
    JKP_ServiceCharge     DECIMAL(10,2)           NULL,     /*點餐/外送服務費，點餐／外送交易另外收取的服務費訂單金額 x 點餐／外送費率非點餐／外送交易補空白兩位小數（含小數點），數值不加 +／-*/
    JKP_RedeemPayAmt      DECIMAL(10,2)           NULL,     /*街口幣折抵請款金額，街口幣折抵金額 – 街口幣折抵手續費兩位小數（含小數點），數值不加 +／-*/
    JKP_RedeemFee         DECIMAL(10,2)           NULL,     /*街口幣折抵手續費，街口幣折抵金額 x 街口幣折抵費率。兩位小數（含小數點），數值不加 +／-*/
    JKP_CpnJKOPayAmt      DECIMAL(10,2)           NULL,     /*官方街口券折抵請款金額，官方街口券折抵金額 – 官方街口券折抵手續費兩位小數（含小數點），數值不加 +／-*/
    JKP_CpnJKOFee         DECIMAL(10,2)           NULL,     /*官方街口券折抵手續費，官方街口券折抵金額 x 官方街口券折抵費率兩位小數（含小數點），數值不加 +／-*/
    SYS_StoreNo           VARCHAR(06)             NULL,     /*交易店號 POS5006.SYS_StoreNo*/
    TXN_Date              DATE                    NULL,     /*交易日期 POS5006.TXN_Date*/
    ECR_No                VARCHAR(06)             NULL,     /*收銀機號 POS5006.ECR_No*/
    TXN_No                DECIMAL(08)             NULL,     /*交易序號 POS5006.TXN_No*/
    ECS_TXN_No            DECIMAL(06)             NULL,     /*付款序號 ECS3008.ECS_TXN_No*/
	PAY_No                VARCHAR(02)             NULL,     /*付款編號 POS5008.PAY_No*/
    TLT_No                VARCHAR(12)             NULL,     /*專櫃編號*/
    Contract_No           VARCHAR(20)             NULL,     /*專櫃合約編號*/
    Contract_SubNo        VARCHAR(04)             NULL,     /*專櫃合約附號*/
	Talent_ID             DECIMAL(19,0)           NULL,     /*專櫃合約編號系統 ID*/

    JKP_TXN_Date          DATE                    NULL,     /*帳務日期*/
    JKP_ECR_No            VARCHAR(06)             NULL,     /*帳務機號*/
    JKP_USR_No            VARCHAR(16)             NULL,     /*帳務收銀員編號*/
    JKP_Check             VARCHAR(02)             NULL,     /*比對備註 Y=比對正確 N=未比對*/
    JKP_BSN_Date          DATE                    NULL,     /*交易完成日期 JKP_TxnTime 日期的部分*/

    ACC_ExportDate        VARCHAR(08)             NULL,      /*傳票轉出日期*/
    ACC_Export_USR_No     VARCHAR(16)             NULL,      /*傳票轉出人員*/
    VouNo                 VARCHAR(12)            NULL,       /*傳票編號*/

    CRT_Date              DATETIME                NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)              NULL,     /*建立人員*/
    UPD_Date              DATETIME                NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)              NULL,     /*變更人員*/

    CONSTRAINT PK_POS6115 PRIMARY KEY CLUSTERED (ID)
)
END


/*POS6117 一卡通扣值交易比對結果明細檔(EVCR)(EVCR) */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS6117')
BEGIN
CREATE TABLE POS6117
(
    ID                    DECIMAL(19) IDENTITY(1,1) NOT NULL,      /*ID*/
    IPS_File              VARCHAR(64)         NOT NULL,     /*檔案名稱*/
    IPS_Date              DATE                NOT NULL,     /*檔案日期(清算日期)*/
    IPS_ProcDate          DATETIME                NULL,     /*處理日期*/
    IPS_SeqNo             DECIMAL(08)         NOT NULL,     /*項次*/

    IPS_EVCRTraceNo       VARCHAR(08)         NOT NULL,     /*紀錄編號*/
    IPS_EVTIFN            VARCHAR(50)             NULL,     /*DVTI 檔名       */
    IPS_EVTITraceNo       VARCHAR(08)             NULL,     /*DVTI 紀錄流水號 */
    IPS_CardSerialNo      VARCHAR(24)         NOT NULL,     /*卡號(CSN)       */
    IPS_CardManufactureNo VARCHAR(02)             NULL,     /*廠商批號(MSN)   */
    IPS_TxnType           VARCHAR(02)         NOT NULL,     /*交易類型        */
    IPS_CardType          VARCHAR(06)         NOT NULL,     /*卡片種類        */
    IPS_KRTCTxnSeqNo      VARCHAR(02)         NOT NULL,     /*卡片交易序號(TSN)*/
    IPS_EquipmentType     VARCHAR(08)         NOT NULL,     /*交易設備種類    */
    IPS_EquipmentId       VARCHAR(08)         NOT NULL,     /*交易設備編號(POS id)*/
    IPS_RWid              VARCHAR(08)         NOT NULL,     /*交易讀寫器編號  */
    IPS_TxnTime           DATETIME            NOT NULL,     /*交易時間 YYYY/MM/DD HH:NN:SS  */
    IPS_ShopId            VARCHAR(06)         NOT NULL,     /*店舖編號        */
    IPS_POS_TSN           VARCHAR(10)         NOT NULL,     /*收銀機交易序號  */
    IPS_BalanceBeforeTxn  DECIMAL(08)         NOT NULL,     /*交易前卡片餘額  */
    IPS_TxnAmt            DECIMAL(08)         NOT NULL,     /*交易總金額      */
    IPS_BalanceAfterTxn   DECIMAL(08)         NOT NULL,     /*交易後卡片餘額  */
    IPS_PaymentType       VARCHAR(02)         NOT NULL,     /*付款方式        */
    IPS_OperatorId        VARCHAR(08)         NOT NULL,     /*操作人員代碼    */
    IPS_APIVersion        VARCHAR(04)             NULL,     /*API 版號        */
    IPS_OperationDate     DATETIME                NULL,     /*營運(會計)日期  */
    IPS_TxnCompareResult  VARCHAR(04)         NOT NULL,     /*總檢查結果      */
    IPS_SAM_ID            VARCHAR(16)             NULL,     /*SAM_ID          */
    IPS_Flag              VARCHAR(01)             NULL,     /*帳款旗標 0=正常 1=例外交易 N=不清分*/
    IPS_SaleAmt           DECIMAL(08)         NOT NULL,     /*一般商品交易金額*/
    IPS_CollectionAmt     DECIMAL(08)         NOT NULL,     /*代收金額        */
    IPS_ConsignmentAmt    DECIMAL(08)         NOT NULL,     /*代售金額        */
    IPS_PayDate           DATETIME                NULL,     /*預計撥款日期  */
    IPS_SettleDate        DATETIME                NULL,     /*清分日期  */

    SYS_StoreNo           VARCHAR(10)             NULL,     /*交易店號 POS5006.SYS_StoreNo*/
    TXN_Date              DATE                    NULL,     /*交易日期 POS5006.TXN_Date*/
    ECR_No                VARCHAR(10)             NULL,     /*收銀機號 POS5006.ECR_No*/
    TXN_No                DECIMAL(08)             NULL,     /*交易序號 POS5006.TXN_No*/
    ECS_TXN_No            DECIMAL(06)             NULL,     /*付款序號 ECS3006.ECS_TXN_No*/
    TXN_Item              DECIMAL(06)             NULL,     /*交易序號 ECS3006.TXN_Item*/
	PAY_No                VARCHAR(02)             NULL,     /*付款編號，POS5008.PAY_No*/
    MMT_No                VARCHAR(08)             NULL,     /*商場代號(未使用)*/
    TLT_No                VARCHAR(12)             NULL,     /*專櫃編號*/
    Contract_No           VARCHAR(20)             NULL,     /*專櫃合約編號*/
    Contract_SubNo        VARCHAR(04)             NULL,     /*專櫃合約附號*/
	Talent_ID             DECIMAL(19,0)           NULL,      /*專櫃合約編號系統 ID*/


    IPS_TXN_Date          DATE                    NULL,     /*帳務日期 YYYY-MM-DD*/
    IPS_ECR_No            VARCHAR(10)             NULL,     /*帳務機號*/
    IPS_USR_No            VARCHAR(16)             NULL,     /*帳務收銀員編號*/
    IPS_Check             VARCHAR(02)             NULL,     /*比對備註 Y=比對正確 N=未比對*/
    IPS_BSN_Date          DATE                    NULL,     /*交易時間 YYYY-MM-DD*/

    ACC_ExportDate        VARCHAR(8)              NULL,     /*傳票轉出日期*/
    ACC_Export_USR_No     VARCHAR(16)             NULL,     /*傳票轉出人員*/
    VouNo                 VARCHAR(12)             NULL,     /*傳票編號*/

    CRT_Date              DATETIME                NULL,     /*建立日期*/
    CRT_USR_No            VARCHAR(16)             NULL,     /*建立人員*/
    UPD_Date              DATETIME                NULL,     /*變更日期*/
    UPD_USR_No            VARCHAR(16)             NULL,     /*變更人員*/

    CONSTRAINT PK_POS6117 PRIMARY KEY CLUSTERED (ID)
)
END


/*POS6118 聯信特店MIS LOG檔案 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS6118')
BEGIN
CREATE TABLE POS6118
(
    ID                    DECIMAL(19) IDENTITY(1,1) NOT NULL,      /*ID*/
    NCML_File             VARCHAR(64)         NOT NULL,     /*檔案名稱，ATS_MISLOG_DXXX_YYYYMMDD.TXT*/
    NCML_Date             DATE                NOT NULL,     /*檔案日期(清算日期)*/
    NCML_ProcDate         DATETIME                NULL,     /*處理日期*/
    NCML_SeqNo            DECIMAL(08)         NOT NULL,     /*項次*/

    NCML_FileVer          VARCHAR(02)             NULL,     /*檔案規格版本編號*/
    NCML_Source           VARCHAR(02)             NULL,     /*資料來源，預設值=空白、NC=NCCC收單交易系統(信用卡、銀聯卡、Smart Pay)、DC=DCC FES、ES=電子票證模組(ATS)、DN=大來卡(非DFS)轉接模組(ATS)*/
	NCML_MerID            VARCHAR(15)             NULL,     /*特店代號(左靠右補空白)*/
	NCML_TmID             VARCHAR(08)             NULL,     /*端末機代號(左靠有補空白)*/
	NCML_BatNo            VARCHAR(06)             NULL,     /*批次號碼(右靠左補0)*/
	NCML_BatCloseDate     DATE                    NULL,     /*批次結帳日期(YYYY/MM/DD)*/
	NCML_PayType          CHAR(01)                NULL,     /*支付卡類別(區分一般信用卡、銀聯卡、Smart Pay及電子票證)，N=一般信用卡(含VISA、Master Card、JCB、U Card、Amex、Discover)、C=銀聯卡、S=Smart Pay、E=電子票證*/
    NCML_PayCrdType       VARCHAR(02)             NULL,     /*支付卡別簡碼*/
    NCML_PayScanType      CHAR(01)                NULL,     /*過卡方式標記*/
    NCML_BnkNo            VARCHAR(03)             NULL,     /*發卡行之金融機構代碼、國內信用卡=填入金融機構代碼、國外信用卡=固定值999、銀聯卡=固定值999、Smart Pay及電子票證=空白*/
    NCML_CrdNo            VARCHAR(32)             NULL,     /*卡號(左靠右補空白)，一般信用卡(V/M/J/A/D/U)、銀聯卡及Smart Pay (保留前6後4為明碼，其餘以*遮掩)、悠遊卡(T0200)：卡號從後往前算第5,6,7碼遮掩、一卡通：遮掩卡號末2碼、愛金卡：遮掩卡號9-12碼*/
	NCML_TxnDate          DATE                    NULL,     /*交易日期(YYYYMMDD)*/
	NCML_TxnTime          DATETIME                NULL,     /*交易時間(hhmmss)*/
    NCML_TxnType          VARCHAR(02)             NULL,     /*交易別，若POS6118.NCML_PayType為N、C、S則00=一般交易(含交易補登、分期付款及紅利扣抵)、02=預先授權完成、03=郵購、04=退貨(含分期付款及紅利扣抵)，若POS6118.NCML_PayType為E則00=電票購貨、04=電票退貨、30=電票現金加值(含悠遊卡社福卡現金加值)、32=電票取消加值(電票的取消交易不能正、負相抵)、10=電票自動加值*/
	NCML_TxnAmt           DECIMAL(12,2)           NULL,     /*交易金額*/
	NCML_TxnBatNo         VARCHAR(06)             NULL,     /*交易批號(同簽單之批號)，右靠左補0*/
	NCML_RcptNo           VARCHAR(06)             NULL,     /*交易序號(同簽單之調閱編號)*/
	NCML_RRN              VARCHAR(12)             NULL,     /*端末機Retrieval Reference Number (左靠右補空白)*/
	NCML_StoID            VARCHAR(18)             NULL,     /*櫃號或部類碼(左靠右補空白)*/
	NCML_StoIDEx          VARCHAR(32)             NULL,     /*櫃號或部類碼擴充欄位(左靠右補空白)*/
	NCML_ApprovalCode     VARCHAR(06)             NULL,     /*授權碼(左靠右補空白)*/
	NCML_ElecSig          CHAR(01)                NULL,     /*電子簽單標記，預設值=空白、Y=電子簽單、N或空白=紙本簽單*/
	NCML_CrdTxnFg         CHAR(01)                NULL,     /*信用卡分期或紅利標記，預設值=空白、I=分期付款(內含手續費)、E=分期付款(外加手續費)、1=紅利扣抵(全額扣抵)、2=紅利扣抵(部分扣抵)*/
    NCML_TermNo           DECIMAL(02)             NULL,     /*信用卡分期期數，0=一般，其餘為分期的期數*/
	NCML_DownPayAmt       DECIMAL(12,2)           NULL,     /*信用卡首期金額*/
	NCML_InstalPayAmt     DECIMAL(12,2)           NULL,     /*信用卡每期金額*/
	NCML_InstalPayFee     DECIMAL(12,2)           NULL,     /*信用卡分期手續費*/
	NCML_RebateBonus      DECIMAL(10)             NULL,     /*信用卡紅利扣抵點數*/
    NCML_RebateAmt        DECIMAL(12,2)           NULL,     /*信用卡紅利扣抵金額*/
	NCML_CurCode          VARCHAR(03)             NULL,     /*DCC交易之外幣幣別代碼*/
	NCML_CurExgRate       DECIMAL(06,4)           NULL,     /*DCC交易之外幣匯率*/
	NCML_CurPayAmt        DECIMAL(12,2)           NULL,     /*DCC交易之外幣交易金額*/
    NCML_BalBeforeTxn     DECIMAL(12,2)           NULL,     /*電子票證交易前餘額*/
	NCML_BalAfterTxn      DECIMAL(12,2)           NULL,     /*電子票證交易後餘額*/
	NCML_AutoloadAmt      DECIMAL(10,2)           NULL,     /*電子票證自動加值金額*/

    SYS_StoreNo           VARCHAR(10)             NULL,     /*交易店號 POS5006.SYS_StoreNo*/
    TXN_Date              DATE                    NULL,     /*交易日期 POS5006.TXN_Date*/
    ECR_No                VARCHAR(10)             NULL,     /*收銀機號 POS5006.ECR_No*/
    TXN_No                DECIMAL(08)             NULL,     /*交易序號 POS5006.TXN_No*/
    TXN_Item              DECIMAL(06)             NULL,     /*交易序號 POS5008.TXN_Item*/
	PAY_No                VARCHAR(02)             NULL,     /*付款編號，POS5008.PAY_No*/
    MMT_No                VARCHAR(08)             NULL,     /*商場代號(未使用)*/
    TLT_No                VARCHAR(12)             NULL,     /*專櫃編號*/
    Contract_No           VARCHAR(20)             NULL,     /*專櫃合約編號*/
    Contract_SubNo        VARCHAR(04)             NULL,     /*專櫃合約附號*/
	Talent_ID             DECIMAL(19,0)           NULL,      /*專櫃合約編號系統 ID*/

    NCML_TXN_Date         DATE                    NULL,     /*帳務日期 YYYY-MM-DD*/
    NCML_ECR_No           VARCHAR(10)             NULL,     /*帳務機號*/
    NCML_USR_No           VARCHAR(16)             NULL,     /*帳務收銀員編號*/
    NCML_Check            VARCHAR(02)             NULL,     /*比對備註 Y=比對正確 N=未比對*/
    NCML_BSN_Date         DATE                    NULL,     /*支付完成日期，即為 POS6118.NCML_TxnDate*/

    ACC_ExportDate        VARCHAR(08)             NULL,     /*傳票轉出日期*/
    ACC_Export_USR_No     VARCHAR(16)             NULL,     /*傳票轉出人員*/
    VouNo                 VARCHAR(12)             NULL,     /*傳票編號*/

    CRT_Date              DATETIME                NULL,     /*建立日期*/
    CRT_USR_No            VARCHAR(16)             NULL,     /*建立人員*/
    UPD_Date              DATETIME                NULL,     /*變更日期*/
    UPD_USR_No            VARCHAR(16)             NULL,     /*變更人員*/

    CONSTRAINT PK_POS6118 PRIMARY KEY CLUSTERED (ID)
)
END


/*POS6119 中信信用卡帳務檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS6119')
BEGIN
CREATE TABLE POS6119
(
    ID                    DECIMAL(19) IDENTITY(1,1) NOT NULL,      /*ID*/
    CTBC_File             VARCHAR(64)         NOT NULL,     /*檔案名稱*/
    CTBC_Date             DATE                NOT NULL,     /*檔案日期(清算日期)*/
    CTBC_ProcDate         DATETIME                NULL,     /*處理日期*/
    CTBC_SeqNo            DECIMAL(08)         NOT NULL,     /*項次*/

	CTBC_DataType         CHAR(01)            NOT NULL,     /*資料型態，C=一般交易、I=分期交易、R=紅利交易*/
    CTBC_TxnTime          DATETIME            NOT NULL,     /*交易時間，YYYY/MM/DD HH:NN:SS*/
    CTBC_CrdNo            VARCHAR(19)         NOT NULL,     /*卡號(左靠右補空白)，NCCC U card: 前補9000，後補0*/
	CTBC_MerID            VARCHAR(15)         NOT NULL,     /*商店代號*/
	CTBC_TmID             VARCHAR(08)         NOT NULL,     /*端末機代號*/
	CTBC_TxnCode          VARCHAR(02)         NOT NULL,     /*交易類別碼，01=正向交易、02=負向交易*/
    CTBC_TxnAmt           DECIMAL(12,2)       NOT NULL,     /*交易金額*/
	CTBC_ApprovalCode     VARCHAR(06)             NULL,     /*授權碼*/
	CTBC_ExpireYYMM       VARCHAR(04)             NULL,     /*卡片有效日期，YYMM，固定值0000*/
	CTBC_PayScanType      CHAR(01)                NULL,     /*卡片交易模式，M=人工輸入卡號、S=信用卡刷卡、C=晶片卡刷卡、P=非接觸式卡PayPass、W=非接觸式卡VisaWave、U=CUP卡*/
	CTBC_BatNo            VARCHAR(06)             NULL,     /*批次號碼(結帳批號)*/
	CTBC_StoID            VARCHAR(18)             NULL,     /*櫃號*/

	CTBC_InstalTblID      VARCHAR(02)             NULL,     /*分期-Table ID*/
	CTBC_InstalFeeType    CHAR(01)                NULL,     /*分期-收費方式，1=分期付款內含分期手續費、2=分期付款外加分期手續費*/
	CTBC_InstalPayType    CHAR(01)                NULL,     /*分期-延後付款方式，1=無延後付款、2=延後付款、3=彈性付款*/
	CTBC_TermNo           DECIMAL(02)             NULL,     /*分期-期數*/
	CTBC_InstalOrgTmID    VARCHAR(08)             NULL,     /*分期-退貨原交易端末代號*/
	CTBC_InstalOrgRRN     VARCHAR(12)             NULL,     /*分期-退貨原交易序號*/
	CTBC_InstalSetDate    DATE                    NULL,     /*分期-手續費設定日期*/
	CTBC_InstalPayFee     DECIMAL(12,2)           NULL,     /*分期-手續費總額*/
	CTBC_InstalCharge     CHAR(01)                NULL,     /*分期-手續費收取方式*/
	CTBC_InstalAmt        DECIMAL(12,2)           NULL,     /*分期-總金額*/
	CTBC_DownPayAmt       DECIMAL(12,2)           NULL,     /*分期-首期金額*/
	CTBC_InstalPayAmt     DECIMAL(12,2)           NULL,     /*分期-每期金額*/
	CTBC_DownPayMonth     DECIMAL(02)             NULL,     /*分期-首期金額幾個月後入帳*/
	CTBC_InstalReject     VARCHAR(03)             NULL,     /*分期-拒絕原因*/
	CTBC_FlexTermNoF      DECIMAL(02)             NULL,     /*分期-彈性付款前期期數*/
	CTBC_FlexTermNoL      DECIMAL(02)             NULL,     /*分期-彈性付款後期期數*/
	CTBC_FlexInstalPay    DECIMAL(12,2)           NULL,     /*分期-彈性付款前期每期金額*/

	CTBC_RebateTblID      VARCHAR(02)             NULL,     /*紅利-Table ID*/
	CTBC_OrgAmt           DECIMAL(12,2)           NULL,     /*紅利-原始消費金額*/
	CTBC_RebateAmt        DECIMAL(12,2)           NULL,     /*紅利-本次折抵金額*/
	CTBC_ActPayAmt        DECIMAL(12,2)           NULL,     /*紅利-本次實付金額*/
	CTBC_RebateBonus      DECIMAL(11)             NULL,     /*紅利-本次兌換點數*/
	CTBC_Bonus            DECIMAL(11)             NULL,     /*紅利-本次賺取點數*/
	CTBC_BalBonus         DECIMAL(11)             NULL,     /*紅利-目前點數餘額*/
    CTBC_RebateCode       VARCHAR(02)             NULL,     /*紅利-產品代碼*/

	CTBC_CupTblID         VARCHAR(02)             NULL,     /*CUP-Table ID*/
	CTBC_CupTxnNo         VARCHAR(06)             NULL,     /*CUP-交易序號*/
	CTBC_CupSettleMMDD    VARCHAR(04)             NULL,     /*CUP-交易清算日，MMDD*/
	CTBC_CupSendMMDD      VARCHAR(04)             NULL,     /*CUP-交易傳輸日期，MMDD*/
    CTBC_CupSendTime      VARCHAR(06)             NULL,     /*CUP-交易傳輸時間，HHNNSS*/
	CTBC_CupOrgTxnMMDD    VARCHAR(04)             NULL,     /*CUP-原交易日期，MMDD*/
    CTBC_CupOrgTmID       VARCHAR(08)             NULL,     /*CUP-原端末機代號*/
    CTBC_CupOrgRRN        VARCHAR(12)             NULL,     /*CUP-原交易序號，RRN*/

    SYS_StoreNo           VARCHAR(10)             NULL,     /*交易店號 POS5006.SYS_StoreNo*/
    TXN_Date              DATE                    NULL,     /*交易日期 POS5006.TXN_Date*/
    ECR_No                VARCHAR(10)             NULL,     /*收銀機號 POS5006.ECR_No*/
    TXN_No                DECIMAL(08)             NULL,     /*交易序號 POS5006.TXN_No*/
    TXN_Item              DECIMAL(06)             NULL,     /*交易序號 POS5008.TXN_Item*/
	PAY_No                VARCHAR(02)             NULL,     /*付款編號，POS5008.PAY_No*/
    MMT_No                VARCHAR(08)             NULL,     /*商場代號(未使用)*/
    TLT_No                VARCHAR(12)             NULL,     /*專櫃編號*/
    Contract_No           VARCHAR(20)             NULL,     /*專櫃合約編號*/
    Contract_SubNo        VARCHAR(04)             NULL,     /*專櫃合約附號*/
	Talent_ID             DECIMAL(19,0)           NULL,     /*專櫃合約編號系統 ID*/

    CTBC_TXN_Date         DATE                    NULL,     /*帳務日期，YYYY/MM/DD*/
    CTBC_ECR_No           VARCHAR(10)             NULL,     /*帳務機號*/
    CTBC_USR_No           VARCHAR(16)             NULL,     /*帳務收銀員編號*/
    CTBC_Check            VARCHAR(02)             NULL,     /*比對備註，Y=比對正確、N=未比對*/
    CTBC_BSN_Date         DATE                    NULL,     /*交易時間屬於日期的部分*/

    ACC_ExportDate        VARCHAR(08)             NULL,     /*傳票轉出日期*/
    ACC_Export_USR_No     VARCHAR(16)             NULL,     /*傳票轉出人員*/
    VouNo                 VARCHAR(12)             NULL,     /*傳票編號*/

    CRT_Date              DATETIME                NULL,     /*建立日期*/
    CRT_USR_No            VARCHAR(16)             NULL,     /*建立人員*/
    UPD_Date              DATETIME                NULL,     /*變更日期*/
    UPD_USR_No            VARCHAR(16)             NULL,     /*變更人員*/

    CONSTRAINT PK_POS6119 PRIMARY KEY CLUSTERED (ID)
)
END


/*POS6119P 中信信用卡帳務檔-停車場*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS6119P')
BEGIN
CREATE TABLE POS6119P
(
    ID                    DECIMAL(19) IDENTITY(1,1) NOT NULL,      /*ID*/
    CTBC_File             VARCHAR(64)         NOT NULL,     /*檔案名稱*/
    CTBC_Date             DATE                NOT NULL,     /*檔案日期(清算日期)*/
    CTBC_ProcDate         DATETIME                NULL,     /*處理日期*/
    CTBC_SeqNo            DECIMAL(08)         NOT NULL,     /*項次*/

    CTBC_CrdNo            VARCHAR(19)         NOT NULL,     /*卡號(左靠右補空白)，NCCC U card: 前補9000，後補0*/
    CTBC_TxnDate          DATE                NOT NULL,     /*交易日，YYYY/MM/DD*/
	CTBC_TxnAmt           DECIMAL(12,2)       NOT NULL,     /*交易金額*/
	CTBC_ApprovalCode     VARCHAR(06)             NULL,     /*授權碼*/
	CTBC_TxnType          VARCHAR(02)             NULL,     /*交易類型*/
    CTBC_BusDate          DATE                    NULL,     /*帳務日，YYYY/MM/DD*/
	CTBC_PayDate          DATE                    NULL,     /*撥款日，YYYY/MM/DD*/
	CTBC_EcID             VARCHAR(08)             NULL,     /*EC代碼*/
	CTBC_TmID             VARCHAR(08)             NULL,     /*端末機代號*/
	CTBC_RebateAmt        DECIMAL(12,2)           NULL,     /*紅利折抵金額*/
	CTBC_RebateBonus      DECIMAL(11)             NULL,     /*紅利折抵點數*/
	CTBC_RebateCode       VARCHAR(06)             NULL,     /*產品別*/
	CTBC_CupTxnTime       DATETIME                NULL,     /*銀聯卡日期時間*/
    CTBC_CupSettleDate    DATE                    NULL,     /*銀聯卡清算日*/
	CTBC_CupTraceNo       VARCHAR(12)             NULL,     /*銀聯卡追蹤碼*/
	CTBC_CupRcptNo        VARCHAR(06)             NULL,     /*簽單序號後六碼*/
	CTBC_CurCode          VARCHAR(03)             NULL,     /*DCC交易之外幣幣別代碼*/
	CTBC_CurExgRate       DECIMAL(06,4)           NULL,     /*DCC交易之外幣匯率*/
	CTBC_CurPayAmt        DECIMAL(12,2)           NULL,     /*DCC交易之外幣交易金額*/
	CTBC_BnkType          VARCHAR(04)             NULL,     /*發卡銀行類別，自行或他行*/

    SYS_StoreNo           VARCHAR(10)             NULL,     /*交易店號 POS5006.SYS_StoreNo*/
    TXN_Date              DATE                    NULL,     /*交易日期 POS5006.TXN_Date*/
    ECR_No                VARCHAR(10)             NULL,     /*收銀機號 POS5006.ECR_No*/
	PAY_No                VARCHAR(02)             NULL,     /*付款編號，POS5008.PAY_No*/
    MMT_No                VARCHAR(08)             NULL,     /*商場代號(未使用)*/
    TLT_No                VARCHAR(12)             NULL,     /*專櫃編號*/
    Contract_No           VARCHAR(20)             NULL,     /*專櫃合約編號*/
    Contract_SubNo        VARCHAR(04)             NULL,     /*專櫃合約附號*/
	Talent_ID             DECIMAL(19,0)           NULL,     /*專櫃合約編號系統 ID*/

    CTBC_TXN_Date         DATE                    NULL,     /*帳務日期，YYYY/MM/DD*/
    CTBC_ECR_No           VARCHAR(10)             NULL,     /*帳務機號*/
    CTBC_USR_No           VARCHAR(16)             NULL,     /*帳務收銀員編號*/
    CTBC_Check            VARCHAR(02)             NULL,     /*比對備註，Y=比對正確、N=未比對*/
    CTBC_BSN_Date         DATE                    NULL,     /*交易時間屬於日期的部分*/

    ACC_ExportDate        VARCHAR(08)             NULL,     /*傳票轉出日期*/
    ACC_Export_USR_No     VARCHAR(16)             NULL,     /*傳票轉出人員*/
    VouNo                 VARCHAR(12)             NULL,     /*傳票編號*/

    CRT_Date              DATETIME                NULL,     /*建立日期*/
    CRT_USR_No            VARCHAR(16)             NULL,     /*建立人員*/
    UPD_Date              DATETIME                NULL,     /*變更日期*/
    UPD_USR_No            VARCHAR(16)             NULL,     /*變更人員*/

    CONSTRAINT PK_POS6119P PRIMARY KEY CLUSTERED (ID)
)
END


/*POS6120 台新入金機匯入記錄明細檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS6120')
BEGIN
CREATE TABLE POS6120
(
    ID                    DECIMAL(19) IDENTITY(1,1) NOT NULL,      /*ID*/
    TSDP_File             VARCHAR(64)         NOT NULL,     /*檔案名稱*/
    TSDP_Date             DATE                NOT NULL,     /*檔案日期(清算日期)*/
    TSDP_ProcDate         DATETIME                NULL,     /*處理日期*/
    TSDP_SeqNo            DECIMAL(08)         NOT NULL,     /*項次*/

    TSDP_Item             DECIMAL(06)         NOT NULL,     /*當日序號*/
	TSDP_BusDate          DATE                NOT NULL,     /*帳務日期，YYYY/MM/DD*/
	TSDP_DepositAmt       DECIMAL(12,2)       NOT NULL,     /*存入金額*/
	TSDP_VirAcntNo        VARCHAR(16)             NULL,     /*虛擬帳號*/
	TSDP_PayChannel       VARCHAR(04)             NULL,     /*繳款通路*/
    TSDP_PayTime          DATETIME            NOT NULL,     /*繳款時間，YYYY/MM/DD HH:NN:SS*/
	TSDP_StoCode          VARCHAR(04)             NULL,     /*門市代碼*/

    SYS_StoreNo           VARCHAR(10)             NULL,     /*交易店號 POS5006.SYS_StoreNo*/
    TXN_Date              DATE                    NULL,     /*交易日期 POS5006.TXN_Date*/
    ECR_No                VARCHAR(10)             NULL,     /*收銀機號 POS5006.ECR_No*/
	PAY_No                VARCHAR(02)             NULL,     /*付款編號，POS5008.PAY_No*/
    MMT_No                VARCHAR(08)             NULL,     /*商場代號(未使用)*/
    TLT_No                VARCHAR(12)             NULL,     /*專櫃編號*/
    Contract_No           VARCHAR(20)             NULL,     /*專櫃合約編號*/
    Contract_SubNo        VARCHAR(04)             NULL,     /*專櫃合約附號*/
	Talent_ID             DECIMAL(19,0)           NULL,      /*專櫃合約編號系統 ID*/

    TSDP_TXN_Date         DATE                    NULL,     /*帳務日期 YYYY-MM-DD*/
    TSDP_ECR_No           VARCHAR(10)             NULL,     /*帳務機號*/
    TSDP_USR_No           VARCHAR(16)             NULL,     /*帳務收銀員編號*/
    TSDP_Check            VARCHAR(02)             NULL,     /*比對備註 Y=比對正確 N=未比對*/
    TSDP_BSN_Date         DATE                    NULL,     /*繳款時間屬於日期的部分*/

    ACC_ExportDate        VARCHAR(08)             NULL,     /*傳票轉出日期*/
    ACC_Export_USR_No     VARCHAR(16)             NULL,     /*傳票轉出人員*/
    VouNo                 VARCHAR(12)             NULL,     /*傳票編號*/

    CRT_Date              DATETIME                NULL,     /*建立日期*/
    CRT_USR_No            VARCHAR(16)             NULL,     /*建立人員*/
    UPD_Date              DATETIME                NULL,     /*變更日期*/
    UPD_USR_No            VARCHAR(16)             NULL,     /*變更人員*/

    CONSTRAINT PK_POS6120 PRIMARY KEY CLUSTERED (ID)
)
END


/*POS8011H 電子發票資料處理歷史檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS8011H')
BEGIN
CREATE TABLE POS8011H
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    SYS_StoreNo         VARCHAR(10)         NOT NULL,      /*店號*/
    TXN_Date            DATE                NOT NULL,      /*交易日期*/
    ECR_No              VARCHAR(10)         NOT NULL,      /*收銀機號*/
    TXN_No              DECIMAL(08)         NOT NULL,      /*交易序號*/
    TXN_GUINo           VARCHAR(16)         NOT NULL,      /*發票號碼*/
    EXP_Type            VARCHAR(06)         NOT NULL,      /*轉出種類 C0401 C0501 C0701 D0401 D0501*/
    EXP_Time            DATETIME            NOT NULL,      /*異動時間*/
    EXP_Flag            VARCHAR(06)         NOT NULL,      /*註記 P=前置作業 E=產生MIG檔 U=上傳 V=驗證 X=其他*/
    EXP_RspnCode        VARCHAR(12)             NULL,      /*回應代碼*/
    EXP_RspnMsg         NVARCHAR(255)           NULL,      /*回應訊息*/
    TXN_Ret_No          VARCHAR(20)             NULL,      /*折讓單號*/

    CONSTRAINT PK_POS8011H PRIMARY KEY (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS8011H_TXN_No')
  CREATE INDEX IDX_POS8011H_TXN_No ON POS8011H (SYS_StoreNo, TXN_Date, ECR_No, TXN_No);

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS8011H_TXN_GUINo')
  CREATE INDEX IDX_POS8011H_TXN_GUINo ON POS8011H (TXN_GUINo);


/*POS80054 資料轉出設定檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS80054')
BEGIN
CREATE TABLE POS80054
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    EXP_Date            DATE                NOT NULL,      /*異動日期*/
    EXP_Type            VARCHAR(20)         NOT NULL,      /*轉出資料檔*/
                                                           /*    POS1018 POS5001 POS2018 POS2021 POS2023 POS2031 POS2033 POS2036*/
    EXP_Time            DATETIME            NOT NULL,      /*異動時間*/
    SYS_StoreNo         VARCHAR(10)         NOT NULL,      /*異動店號，由何處異動資料，如總公司或某分店*/
    EXP_StoreNo         VARCHAR(10)         NOT NULL,      /*單據店號，檔案要傳到哪一家門市*/
    EXP_DocNo           VARCHAR(100)        NOT NULL,      /*鍵值編號*/
                                                           /*    POS1018=POS1018.STO_No ; POS1018.GUI_YYMM ; POS1018.POS_NOS ; POS1018.SER_NOS*/
                                                           /*    POS5001=POS5001.STO_No ; POS5001.NOT_DateTime ; POS5001.NOT_Type ; POS5001.ECR_No*/
                                                           /*    POS2018=POS2018.ODM_No ; POS2018.SYS_StoreNo*/
                                                           /*    POS2021=POS2021.MVM_No ; POS2021.SYS_StoreNo*/
                                                           /*    POS2023=POS2023.SPM_No ; POS2023.SYS_StoreNo*/
                                                           /*    POS2031=POS2031.RJM_No ; POS2031.SYS_StoreNo*/
                                                           /*    POS2033=POS2033.PST_No ; POS2033.STO_No*/
                                                           /*    POS2036=POS2036.TNM_No ; POS2036.SYS_StoreNo*/
    EXP_Status          VARCHAR(01)         NOT NULL,      /*轉出狀態 N=未轉 Y=已轉*/
    EXP_DataFlag        VARCHAR(08)         NOT NULL,      /*資料註記，
                                                                       S2H=門市上傳總部異動檔
                                                                       SPH=門市上傳總部異動檔，先刪除後新增
                                                                       SDH=門市上傳總部刪除檔
                                                                       H2S=總部下傳門市異動檔
                                                                       HPS=總部下傳門市異動檔，先刪除後新增
                                                                       HDS=總部下傳門市刪除檔
                                                                       S2P=門市下傳前台異動檔
                                                                       SPP=門市下傳前台異動檔，先刪除後新增
                                                                       SDP=門市下傳前台刪除檔
                                                            */
    EXP_Desc            NVARCHAR(40)            NULL,      /*備註*/
    EXP_FinishTime      DATETIME                NULL,      /*轉出時間*/
    EXP_FinishFile      VARCHAR(200)            NULL,      /*轉出檔名*/
    CRT_Date            DATETIME                NULL,      /*建立日期*/
    CRT_USR_No          VARCHAR(16)             NULL,      /*建立人員*/
    UPD_Date            DATETIME                NULL,      /*變更日期*/
    UPD_USR_No          VARCHAR(16)             NULL,      /*變更人員*/

    EXP_EcrLst          VARCHAR(2048)           NULL,      /*收銀機台清單，若為多選機號，機號與機號之間以分號隔開，若為機號區間，起迄機號之間以減號隔開*/

    CONSTRAINT PK_POS80054 PRIMARY KEY (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS80054_MST')
  CREATE INDEX IDX_POS80054_MST ON POS80054 (EXP_Date, EXP_Type, EXP_Time, SYS_StoreNo, EXP_StoreNo, EXP_DocNo);

EXEC [dbo].[spUpdateColumnDesc] 'POS80054', 'ID', '流水號，自動編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS80054', 'EXP_Date', '異動日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS80054', 'EXP_Type', '轉出資料檔';
EXEC [dbo].[spUpdateColumnDesc] 'POS80054', 'EXP_Time', '異動時間';
EXEC [dbo].[spUpdateColumnDesc] 'POS80054', 'SYS_StoreNo', '異動店號，由何處異動資料，如總公司或某分店';
EXEC [dbo].[spUpdateColumnDesc] 'POS80054', 'EXP_StoreNo', '單據店號，檔案要傳到哪一家門市';
EXEC [dbo].[spUpdateColumnDesc] 'POS80054', 'EXP_DocNo', '鍵值編號，依轉出資料檔不同對應不同欄位';
EXEC [dbo].[spUpdateColumnDesc] 'POS80054', 'EXP_Status', '轉出狀態，N=未轉、Y=已轉';
EXEC [dbo].[spUpdateColumnDesc] 'POS80054', 'EXP_DataFlag', '資料註記，包含S2H、SPH、SDH、H2S、HPS、HDS、S2P、SPP、SDP等';
EXEC [dbo].[spUpdateColumnDesc] 'POS80054', 'EXP_Desc', '備註';
EXEC [dbo].[spUpdateColumnDesc] 'POS80054', 'EXP_FinishTime', '轉出時間';
EXEC [dbo].[spUpdateColumnDesc] 'POS80054', 'EXP_FinishFile', '轉出檔名';
EXEC [dbo].[spUpdateColumnDesc] 'POS80054', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS80054', 'CRT_USR_No', '建立人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS80054', 'UPD_Date', '變更日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS80054', 'UPD_USR_No', '變更人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS80054', 'EXP_EcrLst', '收銀機台清單，多選機號用分號隔開，區間用減號隔開';


/*POS80055 資料轉出設定紀錄檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS80055')
BEGIN
CREATE TABLE POS80055
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    EXP_Date            DATE                NOT NULL,      /*異動日期*/
    EXP_Type            VARCHAR(20)         NOT NULL,      /*轉出資料檔*/
                                                           /*    POS1018 POS5001 POS2018 POS2021 POS2023 POS2031 POS2033 POS2036*/
    EXP_Time            DATETIME            NOT NULL,      /*異動時間*/
    SYS_StoreNo         VARCHAR(10)         NOT NULL,      /*異動店號，由何處異動資料，如總公司或某分店*/
    EXP_StoreNo         VARCHAR(10)         NOT NULL,      /*單據店號，檔案要傳到哪一家門市*/
    EXP_DocNo           VARCHAR(100)        NOT NULL,      /*鍵值編號*/
                                                           /*    POS1018=POS1018.STO_No ; POS1018.GUI_YYMM ; POS1018.POS_NOS ; POS1018.SER_NOS*/
    EXP_Status          CHAR(01)            NOT NULL,      /*轉出狀態，N=未轉 Y=已轉*/
    EXP_DataFlag        VARCHAR(08)         NOT NULL,      /*資料註記
                                                                       S2H=門市上傳總部異動檔
                                                                       SPH=門市上傳總部異動檔，先刪除後新增
                                                                       SDH=門市上傳總部刪除檔
                                                                       H2S=總部下傳門市異動檔
                                                                       HPS=總部下傳門市異動檔，先刪除後新增
                                                                       HDS=總部下傳門市刪除檔
                                                                       S2P=門市下傳前台異動檔
                                                                       SPP=門市下傳前台異動檔，先刪除後新增
                                                                       SDP=門市下傳前台刪除檔
                                                           */
    EXP_Desc            NVARCHAR(40)            NULL,      /*備註*/
    EXP_FinishTime      DATETIME                NULL,      /*轉出時間*/
    EXP_FinishFile      VARCHAR(200)            NULL,      /*轉出檔名*/
    CRT_Date            DATETIME                NULL,      /*建立日期*/
    CRT_USR_No          VARCHAR(16)             NULL,      /*建立人員*/
    UPD_Date            DATETIME                NULL,      /*變更日期*/
    UPD_USR_No          VARCHAR(16)             NULL,      /*變更人員*/

    EXP_EcrLst          VARCHAR(2048)           NULL,      /*收銀機台清單，若為多選機號，機號與機號之間以分號隔開，若為機號區間，起迄機號之間以減號隔開*/

    CONSTRAINT PK_POS80055 PRIMARY KEY (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS80055_MST')
  CREATE INDEX IDX_POS80055_MST ON POS80055 (EXP_Date, EXP_Type, EXP_Time, SYS_StoreNo, EXP_StoreNo, EXP_DocNo);

EXEC [dbo].[spUpdateColumnDesc] 'POS80055', 'ID', '流水號，自動編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS80055', 'EXP_Date', '異動日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS80055', 'EXP_Type', '轉出資料檔';
EXEC [dbo].[spUpdateColumnDesc] 'POS80055', 'EXP_Time', '異動時間';
EXEC [dbo].[spUpdateColumnDesc] 'POS80055', 'SYS_StoreNo', '異動店號，由何處異動資料，如總公司或某分店';
EXEC [dbo].[spUpdateColumnDesc] 'POS80055', 'EXP_StoreNo', '單據店號，檔案要傳到哪一家門市';
EXEC [dbo].[spUpdateColumnDesc] 'POS80055', 'EXP_DocNo', '鍵值編號，依轉出資料檔不同對應不同欄位';
EXEC [dbo].[spUpdateColumnDesc] 'POS80055', 'EXP_Status', '轉出狀態，N=未轉、Y=已轉';
EXEC [dbo].[spUpdateColumnDesc] 'POS80055', 'EXP_DataFlag', '資料註記，包含S2H、SPH、SDH、H2S、HPS、HDS、S2P、SPP、SDP等';
EXEC [dbo].[spUpdateColumnDesc] 'POS80055', 'EXP_Desc', '備註';
EXEC [dbo].[spUpdateColumnDesc] 'POS80055', 'EXP_FinishTime', '轉出時間';
EXEC [dbo].[spUpdateColumnDesc] 'POS80055', 'EXP_FinishFile', '轉出檔名';
EXEC [dbo].[spUpdateColumnDesc] 'POS80055', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS80055', 'CRT_USR_No', '建立人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS80055', 'UPD_Date', '變更日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS80055', 'UPD_USR_No', '變更人員';
EXEC [dbo].[spUpdateColumnDesc] 'POS80055', 'EXP_EcrLst', '收銀機台清單，多選機號用分號隔開，區間用減號隔開';


/*SYS1001 程式執行記錄檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'SYS1001')
BEGIN
CREATE TABLE SYS1001
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    EXE_Name            VARCHAR(30)        NOT NULL,     /*程式執行檔名稱*/
    EXE_BegRunTime      DATETIME               NULL,     /*執行開始時間*/
    EXE_EndRunTime      DATETIME               NULL,     /*執行結束時間*/
    EXE_Status          CHAR(01)               NULL,     /*執行狀態，B=執行中、E=執行結束*/
    EXE_USR_No          VARCHAR(16)            NULL,     /*執行人員*/
    EXE_ComputerName    VARCHAR(30)            NULL,     /*電腦名稱*/
    EXE_UserName        NVARCHAR(30)           NULL,     /*登入使用者*/
    EXE_IPAddress       VARCHAR(30)            NULL,     /*電腦IP位址*/
    EXE_Dir             VARCHAR(200)           NULL,     /*執行檔所在目錄*/

    CONSTRAINT PK_SYS1001 PRIMARY KEY CLUSTERED (EXE_Name)
);


/*SYS1002 程式版本檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'SYS1002')
BEGIN
CREATE TABLE SYS1002
(
    VER_System          VARCHAR(20)         NOT NULL,      /*系統名稱*/
    VER_File            VARCHAR(30)         NOT NULL,      /*檔案名稱*/
    VER_Version         VARCHAR(20)         NOT NULL,      /*程式版本*/
    VER_Program         VARCHAR(20)             NULL,      /*程式名稱*/
    VER_FileDate        DATETIME                NULL,      /*檔案日期時間*/
    VER_FileSize        DECIMAL(08)             NULL,      /*檔案大小*/
    VER_UpdateDate      DATETIME                NULL,      /*更新版本時間*/
    VER_Remark          NVARCHAR(60)            NULL,      /*備註*/

    CONSTRAINT PK_SYS1002 PRIMARY KEY CLUSTERED (VER_System, VER_File)
)
END


/*SYS1003 程式版本歷史檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'SYS1003')
BEGIN
CREATE TABLE SYS1003
(
    VER_System          VARCHAR(20)         NOT NULL,      /*系統名稱*/
    VER_File            VARCHAR(30)         NOT NULL,      /*檔案名稱*/
    VER_Version         VARCHAR(20)         NOT NULL,      /*程式版本*/
    VER_Program         VARCHAR(20)             NULL,      /*程式名稱*/
    VER_FileDate        DATETIME                NULL,      /*檔案日期時間*/
    VER_FileSize        DECIMAL(08)             NULL,      /*檔案大小*/
    VER_UpdateDate      DATETIME                NULL,      /*更新版本時間*/
    VER_Remark          NVARCHAR(60)            NULL,      /*備註*/

    CONSTRAINT PK_SYS1003 PRIMARY KEY CLUSTERED (VER_System, VER_File, VER_Version)
)
END


/*SYS1004 程式版本檢查檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'SYS1004')
BEGIN
CREATE TABLE SYS1004
(
    STO_No              VARCHAR(10)         NOT NULL,       /*分店編號*/
    ECR_No              VARCHAR(10)         NOT NULL,       /*收銀機號*/
    VER_ComputerName    VARCHAR(30)         NOT NULL,       /*電腦名稱*/
    VER_System          VARCHAR(20)         NOT NULL,       /*系統名稱*/
    VER_File            VARCHAR(30)         NOT NULL,       /*檔案名稱*/
    VER_Version         VARCHAR(20)         NOT NULL,       /*程式版本*/
    VER_Program         VARCHAR(20)             NULL,       /*程式名稱*/
    VER_FileDate        DATETIME                NULL,       /*檔案日期時間*/
    VER_FileSize        DECIMAL(08)             NULL,       /*檔案大小*/
    VER_CheckDate       DATETIME                NULL,       /*檢查版本時間*/
    VER_New             CHAR(1)                 NULL,       /*是否最新版本(Y/N)*/

    CONSTRAINT PK_SYS1004 PRIMARY KEY CLUSTERED (STO_No, ECR_No, VER_ComputerName, VER_System, VER_File)
)
END


/*SYS1007 系統記錄檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'SYS1007')
BEGIN
CREATE TABLE SYS1007
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    STO_No              VARCHAR(10)         NOT NULL,      /*分店編號*/
    ECR_No              VARCHAR(10)         NOT NULL,      /*收銀機號*/
    VER_ComputerName    VARCHAR(30)         NOT NULL,      /*電腦名稱*/
    VER_System          VARCHAR(20)         NOT NULL,      /*系統名稱*/
    VER_File            VARCHAR(30)         NOT NULL,      /*檔案名稱*/
    LOG_FileName        VARCHAR(50)         NOT NULL,      /*記錄檔名*/
    LOG_Date            DATETIME            NOT NULL,      /*記錄時間*/
    LOG_SeqNo           DECIMAL(06)         NOT NULL,      /*序號*/
    EXE_USR_No          VARCHAR(16)             NULL,      /*執行人員*/
    EXE_UserName        NVARCHAR(30)            NULL,      /*登入使用者*/
    EXE_IPAddress       VARCHAR(30)             NULL,      /*電腦IP位址*/
    CRT_Date            DATETIME                NULL,      /*建立日期*/
    CRT_USR_No          VARCHAR(16)             NULL,      /*建立人員*/
    UPD_Date            DATETIME                NULL,      /*變更日期*/
    UPD_USR_No          VARCHAR(16)             NULL,      /*變更人員*/
    LOG_Desc            NVARCHAR(255)           NULL,      /*記錄內容*/

    CONSTRAINT PK_SYS1007 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_SYS1007_MST')
CREATE INDEX IDX_SYS1007_MST ON SYS1007(STO_No, ECR_No, VER_ComputerName, VER_System, VER_File, LOG_FileName, LOG_Date, LOG_SeqNo);


/*SYS1007P 實收處理作業系統記錄檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'SYS1007P')
BEGIN
CREATE TABLE SYS1007P
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    STO_No              VARCHAR(10)         NOT NULL,      /*分店編號*/
    EXE_IPAddress       VARCHAR(30)         NOT NULL,      /*電腦IP位址*/
    LOG_System          VARCHAR(20)         NOT NULL,      /*系統名稱*/
    VER_File            VARCHAR(30)         NOT NULL,      /*檔案名稱*/
    LOG_FileName        VARCHAR(50)         NOT NULL,      /*記錄檔名*/
    LOG_Time            DATETIME            NOT NULL,      /*記錄時間*/
    EXE_USR_No          VARCHAR(16)             NULL,      /*執行人員*/
    EXE_UserName        NVARCHAR(30)            NULL,      /*登入使用者*/
    CRT_Date            DATETIME                NULL,      /*建立日期*/
    CRT_USR_No          VARCHAR(16)             NULL,      /*建立人員*/
    LOG_Desc            NVARCHAR(255)           NULL,      /*記錄內容*/

    CONSTRAINT PK_SYS1007P PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_SYS1007P_MST')
CREATE INDEX IDX_SYS1007P_MST ON SYS1007P(STO_No, EXE_IPAddress, VER_System, VER_File, LOG_FileName, LOG_Date, LOG_SeqNo);



/*DSC2010 停車折抵時數設定檔 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'DSC2010')
BEGIN
CREATE TABLE DSC2010
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
    PKNG_SeqNo          DECIMAL(06)         NOT NULL,     /*序號、流水號，自動給號*/
    PKNG_SaleAmt        DECIMAL(10,2)       NOT NULL,     /*消費金額，不可重複*/
    PKNG_DiscHour       DECIMAL(04,1)       NOT NULL,     /*停車折抵時數*/
    PKNG_Status         VARCHAR(02)         NOT NULL,     /*狀態 A=生效(預設值) D=刪除*/

    CRT_Date            DATETIME                NULL,     /*建立日期*/
    CRT_USR_No          VARCHAR(16)             NULL,     /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)            NULL,     /*建立人員姓名*/
    UPD_Date            DATETIME                NULL,     /*變更日期*/
    UPD_USR_No          VARCHAR(16)             NULL,     /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)            NULL,     /*變更人員姓名*/

    CONSTRAINT PK_DSC2010 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_DSC2010_MST') /*鍵值設定*/
  CREATE UNIQUE INDEX IDX_DSC2010_MST ON DSC2010 (PKNG_SeqNo);

EXEC [dbo].[spUpdateColumnDesc] 'DSC2010', 'PKNG_SeqNo', '序號、流水號，自動給號';
EXEC [dbo].[spUpdateColumnDesc] 'DSC2010', 'PKNG_SaleAmt', '消費金額，不可重複';
EXEC [dbo].[spUpdateColumnDesc] 'DSC2010', 'PKNG_DiscHour', '停車折抵時數';
EXEC [dbo].[spUpdateColumnDesc] 'DSC2010', 'PKNG_Status', '狀態，A=生效(預設值)、D=刪除';
EXEC [dbo].[spUpdateColumnDesc] 'DSC2010', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'DSC2010', 'CRT_USR_No', '建立人員';
EXEC [dbo].[spUpdateColumnDesc] 'DSC2010', 'CRT_USR_Name', '建立人員姓名';
EXEC [dbo].[spUpdateColumnDesc] 'DSC2010', 'UPD_Date', '變更日期';
EXEC [dbo].[spUpdateColumnDesc] 'DSC2010', 'UPD_USR_No', '變更人員';
EXEC [dbo].[spUpdateColumnDesc] 'DSC2010', 'UPD_USR_Name', '變更人員姓名';


/*DEFTBL 表格定義檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'DEFTBL')
BEGIN
CREATE TABLE DEFTBL
(
    TBL_ID              VARCHAR(20)         NOT NULL,      /*檔案名稱*/
    TBL_Name            NVARCHAR(60)            NULL,      /*檔案說明*/
    TBL_Remark          NVARCHAR(255)           NULL,      /*檔案備註*/
    TBL_Same            VARCHAR(20)             NULL,      /*相同結構的檔案名稱*/
    TBL_FullDnPos       CHAR(01)                NULL,      /*是否整檔下傳至收銀機台，Y/N，預設值為N*/
    TBL_FullDnSto       CHAR(01)                NULL,      /*是否整檔下傳至門市，Y/N，預設值為N*/

    CONSTRAINT PK_DEFTBL PRIMARY KEY CLUSTERED (TBL_ID)
)
END

EXEC [dbo].[spUpdateColumnDesc] 'DEFTBL', 'TBL_ID', '檔案名稱';
EXEC [dbo].[spUpdateColumnDesc] 'DEFTBL', 'TBL_Name', '檔案說明';
EXEC [dbo].[spUpdateColumnDesc] 'DEFTBL', 'TBL_Remark', '檔案備註';
EXEC [dbo].[spUpdateColumnDesc] 'DEFTBL', 'TBL_Same', '相同結構的檔案名稱';
EXEC [dbo].[spUpdateColumnDesc] 'DEFTBL', 'TBL_FullDnPos', '是否整檔下傳至收銀機台，Y/N，預設值為N';
EXEC [dbo].[spUpdateColumnDesc] 'DEFTBL', 'TBL_FullDnSto', '是否整檔下傳至門市，Y/N，預設值為N';


/*DEFFLD 欄位定義檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'DEFFLD')
BEGIN
CREATE TABLE DEFFLD
(
    TBL_ID              VARCHAR(20)         NOT NULL,      /*檔案名稱*/
    FLD_Item            DECIMAL(6,2)        NOT NULL,      /*欄位序號*/
    FLD_ID              VARCHAR(40)         NOT NULL,      /*欄位名稱*/
    FLD_Name            NVARCHAR(60)            NULL,      /*欄位說明*/
    FLD_Type            VARCHAR(12)         NOT NULL,      /*欄位型態，CHAR=字元、NUM=數值、DT=日期時間(YYYY/MM/DD HH:NN:SS)、DATE=日期(YYYY/MM/DD)*/
    FLD_Len             VARCHAR(10)             NULL,      /*欄位長度*/
    FLD_Null            CHAR(01)            NOT NULL,      /*可否為空值*/
    FLD_Remark          NVARCHAR(255)           NULL,      /*欄位備註*/
    FLD_EnCode          CHAR(01)                NULL,      /*是否編碼，Y/N，預設值為N*/

    CONSTRAINT PK_DEFFLD PRIMARY KEY CLUSTERED (TBL_ID, FLD_ITEM)
)
END

EXEC [dbo].[spUpdateColumnDesc] 'DEFFLD', 'TBL_ID', '檔案名稱';
EXEC [dbo].[spUpdateColumnDesc] 'DEFFLD', 'FLD_Item', '欄位序號';
EXEC [dbo].[spUpdateColumnDesc] 'DEFFLD', 'FLD_ID', '欄位名稱';
EXEC [dbo].[spUpdateColumnDesc] 'DEFFLD', 'FLD_Name', '欄位說明';
EXEC [dbo].[spUpdateColumnDesc] 'DEFFLD', 'FLD_Type', '欄位型態，CHAR=字元、NUM=數值、DT=日期時間(YYYY/MM/DD HH:NN:SS)、DATE=日期(YYYY/MM/DD)';
EXEC [dbo].[spUpdateColumnDesc] 'DEFFLD', 'FLD_Len', '欄位長度';
EXEC [dbo].[spUpdateColumnDesc] 'DEFFLD', 'FLD_Null', '可否為空值';
EXEC [dbo].[spUpdateColumnDesc] 'DEFFLD', 'FLD_Remark', '欄位備註';
EXEC [dbo].[spUpdateColumnDesc] 'DEFFLD', 'FLD_EnCode', '是否編碼，Y/N，預設值為N';


/*DEFKEY 鍵值定義檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'DEFKEY')
BEGIN
CREATE TABLE DEFKEY
(
    TBL_ID              VARCHAR(20)         NOT NULL,      /*檔案名稱*/
    KEY_ID              VARCHAR(100)            NULL,      /*主檔鍵值欄位*/
    KEY_Fields          VARCHAR(128)        NOT NULL,      /*鍵值欄位*/
    KEY_PRI             CHAR(01)            NOT NULL,      /*是否為主要鍵值，Y/N，預設值為Y*/

    CONSTRAINT PK_DEFKEY PRIMARY KEY CLUSTERED (TBL_ID)
)
END

EXEC [dbo].[spUpdateColumnDesc] 'DEFKEY', 'TBL_ID', '檔案名稱';
EXEC [dbo].[spUpdateColumnDesc] 'DEFKEY', 'KEY_ID', '主檔鍵值欄位';
EXEC [dbo].[spUpdateColumnDesc] 'DEFKEY', 'KEY_Fields', '鍵值欄位';
EXEC [dbo].[spUpdateColumnDesc] 'DEFKEY', 'KEY_PRI', '是否為主要鍵值，Y/N，預設值為Y';


/*POS5035 傳輸記錄檔*/
IF OBJECT_ID(N'dbo.POS5035', N'U') IS NULL
BEGIN
CREATE TABLE POS5035
(
    ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
	MID                 DECIMAL(19) DEFAULT 0 NOT NULL,    /*商戶編號*/
    STO_No              VARCHAR(10)          NOT NULL,     /*門市店號*/
    TSL_BegDatetime     DATETIME             NOT NULL,     /*開始傳輸日期時間*/
    TSL_Type            CHAR(1)              NOT NULL,     /*檔案類型，U=上傳、D=下傳*/
    TSL_FileName        NVARCHAR(96)         NOT NULL,     /*檔案名稱*/
    TSL_EndDatetime     DATETIME                 NULL,     /*完成傳輸日期時間*/
    TSL_Result          CHAR(1)              NOT NULL,     /*傳輸結果，Y=成功、N=失敗*/
    TSL_STO_No          VARCHAR(10)              NULL,     /*檔案來源門市店號*/
    TSL_ECR_No          VARCHAR(10)              NULL,     /*檔案來源收銀機號*/
    TSL_Desc            NVARCHAR(256)            NULL,     /*說明*/

    CONSTRAINT PK_POS5035 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_POS5035_MST')
  CREATE UNIQUE INDEX IDX_POS5035_MST ON POS5035 (MID, STO_No, TSL_BegDatetime, TSL_Type, TSL_FileName)

/*POS5038 交易序號編號檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS5038')
BEGIN
CREATE TABLE POS5038
(
    SYS_StoreNo         VARCHAR(10)         NOT NULL,    /*門市店號*/
    ECR_No              VARCHAR(10)         NOT NULL,    /*收銀機號*/
    TXN_SerialDate      DATETIME            NOT NULL,    /*日期*/
    TXN_SerialNo        DECIMAL(08)         NOT NULL,    /*序號*/

    CONSTRAINT PK_POS5038 PRIMARY KEY CLUSTERED (SYS_StoreNo, ECR_No, TXN_SerialDate)
)
END

EXEC [dbo].[spUpdateColumnDesc] 'POS5038', 'SYS_StoreNo', '門市店號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5038', 'ECR_No', '收銀機號';
EXEC [dbo].[spUpdateColumnDesc] 'POS5038', 'TXN_SerialDate', '日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS5038', 'TXN_SerialNo', '序號';


/*IMG1001 圖檔設定主檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'IMG1001')
BEGIN
CREATE TABLE IMG1001
(
    ID                  DECIMAL(10) IDENTITY(1,1) NOT NULL,
    IMG_Type            VARCHAR(16)         NOT NULL,      /*圖檔類別*/
    IMG_SeqNo           VARCHAR(30)         NOT NULL,      /*圖檔序號*/
    IMG_Path            NVARCHAR(30)        NOT NULL,      /*圖檔路徑，IMAGES~/圖檔類別/yyMM*/
    IMG_File            NVARCHAR(255)       NOT NULL,      /*圖檔檔名*/

    IMG_Remark          NVARCHAR(255)            NULL,      /*備註*/
    CRT_Date            DATETIME                 NULL,      /*建立日期*/
    CRT_USR_No          VARCHAR(16)              NULL,      /*建立人員*/
    CRT_USR_Name        NVARCHAR(20)             NULL,      /*建立人員姓名*/
    UPD_Date            DATETIME                 NULL,      /*變更日期*/
    UPD_USR_No          VARCHAR(16)              NULL,      /*變更人員*/
    UPD_USR_Name        NVARCHAR(20)             NULL,      /*變更人員姓名*/

    CONSTRAINT PK_IMG1001 PRIMARY KEY CLUSTERED (ID)
)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_IMG1001_MST')
  CREATE INDEX IDX_IMG1001_MST ON IMG1001 (IMG_Type, IMG_SeqNo, IMG_Path, IMG_File)

EXEC [dbo].[spUpdateColumnDesc] 'IMG1001', 'IMG_Type', '圖檔類別';
EXEC [dbo].[spUpdateColumnDesc] 'IMG1001', 'IMG_SeqNo', '圖檔序號';
EXEC [dbo].[spUpdateColumnDesc] 'IMG1001', 'IMG_Path', '圖檔路徑，IMAGES~/圖檔類別/yyMM';
EXEC [dbo].[spUpdateColumnDesc] 'IMG1001', 'IMG_File', '圖檔檔名';
EXEC [dbo].[spUpdateColumnDesc] 'IMG1001', 'IMG_Remark', '備註';
EXEC [dbo].[spUpdateColumnDesc] 'IMG1001', 'CRT_Date', '建立日期';
EXEC [dbo].[spUpdateColumnDesc] 'IMG1001', 'CRT_USR_No', '建立人員';
EXEC [dbo].[spUpdateColumnDesc] 'IMG1001', 'CRT_USR_Name', '建立人員姓名';
EXEC [dbo].[spUpdateColumnDesc] 'IMG1001', 'UPD_Date', '變更日期';
EXEC [dbo].[spUpdateColumnDesc] 'IMG1001', 'UPD_USR_No', '變更人員';
EXEC [dbo].[spUpdateColumnDesc] 'IMG1001', 'UPD_USR_Name', '變更人員姓名';


/*
POS2004 對應圖檔
IMG1001.IMG_Type = 'POS2004'
IMG1001.IMG_SeqNo = POS2004.PLU_MagNo
IMG1001.IMG_File = 檔案上傳時間(YYMMDDHHNNSSZZZ)_檔案名稱
IMG1001.CRT_Date = 檔案上傳時間 YYYY/MM/DD HH:NN:SS
檔案URL= BaseURL/IMAGES/POS2004/YYMM/YYMMDDHHNNSSZZZ_檔案名稱

POS50011 對應圖檔
IMG1001.IMG_Type = 'POS50011'
IMG1001.IMG_SeqNo = POS50011.NOT_No
IMG1001.IMG_File = 檔案上傳時間(YYMMDDHHNNSSZZZ)_檔案名稱
IMG1001.CRT_Date = 檔案上傳時間 YYYY/MM/DD HH:NN:SS
檔案URL= BaseURL/IMAGES/POS50011/YYMM/檔案上傳時間(YYMMDDHHNNSSZZZ)_檔案名稱

ALTER TABLE TableName ALTER COLUMN ColumnName 欄位類型及長度 COLLATE 定序格式;

*/


/*SYS3000 組織階層設定檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'SYS3000')
BEGIN
CREATE TABLE SYS3000
(
     ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
     group_no            NVARCHAR(02)         NOT NULL,      /*階層代碼*/
     group_name          NVARCHAR(30)         NOT NULL,      /*階層名稱*/
     upgroup             CHAR(01)             NOT NULL,      /*上層組織 0=全公司 1=室/部 2=Team 3=樓/組*/
     CRT_Date            DATETIME                 NULL,      /*建立日期*/
     CRT_USR_No          VARCHAR(16)              NULL,      /*建立人員*/
     UPD_Date            DATETIME                 NULL,      /*變更日期*//
     UPD_USR_No          VARCHAR(16)              NULL,      /*變更人員*/
     stop_flag           CHAR(01)                 NULL,      /*是否停用 Y=停用 */

     CONSTRAINT PK_SYS3000 primary key clustered (group_no)
)
END


/*SYS3300 組織明細設定檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'SYS3000')
BEGIN
CREATE TABLE SYS3300
(
     ID                  DECIMAL(19) IDENTITY(1,1) NOT NULL,
     group_no            VARCHAR(02)          NOT NULL,      /*階層代碼-SYS3000*/
     section_no          VARCHAR(06)          NOT NULL,      /*組織代碼*/
     section_name        NVARCHAR(60)         NOT NULL,      /*組織名稱*/
     upgroup_no          VARCHAR(02)          NOT NULL,      /*上層階層代碼*/
     upsection_no        VARCHAR(06)          NOT NULL,      /*上層組織代碼*/

     CRT_Date            DATETIME                 NULL,      /*建立日期*/
     CRT_USR_No          VARCHAR(16)              NULL,      /*建立人員*/
     UPD_Date            DATETIME                 NULL,      /*變更日期*/
     UPD_USR_No          VARCHAR(16)              NULL,      /*變更人員*/
     stop_flag           CHAR(01)                 NULL,      /*是否停用，Y=停用*/

     CONSTRAINT PK_SYS3300 primary key clustered (group_no, section_no)
)
END

/*SYS3800 館別代碼檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'SYS3800')
BEGIN
CREATE TABLE SYS3800
(
     id                  DECIMAL(19,0) identity(1,1) NOT NULL,
     building_no         CHAR(01)             NOT NULL,      /*館別代碼*/
     building_desc       NVARCHAR(20)         NOT NULL,      /*館別名稱*/
     CRT_Date            DATETIME                 NULL,      /*建立日期*/
     CRT_USR_No          VARCHAR(16)              NULL,      /*建立人員*/
     CRT_USR_Name        NVARCHAR(20)             NULL,      /*建立人員姓名*/
     UPD_Date            DATETIME                 NULL,      /*變更日期*/
     UPD_USR_No          VARCHAR(16)              NULL,      /*變更人員*/
     UPD_USR_Name        NVARCHAR(20)             NULL,      /*變更人員姓名*/

     CONSTRAINT PK_SYS3800 primary key clustered (building_no)
)
END


/*SYS3900 樓層代碼檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'SYS3900')
BEGIN
CREATE TABLE SYS3900
(
     id                  DECIMAL(19,0) identity(1,1) NOT NULL,
     floor_no            VARCHAR(02)          NOT NULL,      /*樓層代碼*/
     floor_desc          NVARCHAR(20)         NOT NULL,      /*樓層名稱*/
     CRT_Date            DATETIME                 NULL,      /*建立日期*/
     CRT_USR_No          VARCHAR(16)              NULL,      /*建立人員*/
     CRT_USR_Name        NVARCHAR(20)             NULL,      /*建立人員姓名*/
     UPD_Date            DATETIME                 NULL,      /*變更日期*/
     UPD_USR_No          VARCHAR(16)              NULL,      /*變更人員*/
     UPD_USR_Name        NVARCHAR(20)             NULL,      /*變更人員姓名*/

     constraint PK_SYS3900 primary key clustered (floor_no)
)
END


/*SYS3A00 區域代碼檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'SYS3A00')
BEGIN
CREATE TABLE SYS3A00
(
     id                  DECIMAL(19,0) identity(1,1) NOT NULL,
     area_no             VARCHAR(02)          NOT NULL,      /*區域代碼*/
     area_desc           NVARCHAR(20)         NOT NULL,      /*區域名稱*/
     CRT_Date            DATETIME                 NULL,      /*建立日期*/
     CRT_USR_No          VARCHAR(16)              NULL,      /*建立人員*/
     CRT_USR_Name        NVARCHAR(20)             NULL,      /*建立人員姓名*/
     UPD_Date            DATETIME                 NULL,      /*變更日期*/
     UPD_USR_No          VARCHAR(16)              NULL,      /*變更人員*/
     UPD_USR_Name        NVARCHAR(20)             NULL,      /*變更人員姓名*/

     constraint PK_SYS3A00 primary key clustered (area_no)
)
END


/*SYS3F00 用途代碼檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'SYS3F00')
BEGIN
CREATE TABLE SYS3F00
(
     id                  DECIMAL(19,0) identity(1,1) not null,
     Purpose_no          VARCHAR(02)          NOT NULL,      /*用途代碼*/
     purpose_desc        NVARCHAR(20)         NOT NULL,      /*用途名稱*/
     CRT_Date            DATETIME                 NULL,      /*建立日期*/
     CRT_USR_No          VARCHAR(16)              NULL,      /*建立人員*/
     CRT_USR_Name        NVARCHAR(20)             NULL,      /*建立人員姓名*/
     UPD_Date            DATETIME                 NULL,      /*變更日期*/
     UPD_USR_No          VARCHAR(16)              NULL,      /*變更人員*/
     UPD_USR_Name        NVARCHAR(20)             NULL,      /*變更人員姓名*/

     constraint PK_SYS3F00 primary key clustered (Purpose_no)
)
END


/*API2002 API系統執行記錄檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'API2002')
BEGIN
CREATE TABLE API2002
(
    ID                  DECIMAL(19,0) IDENTITY(1,1) NOT NULL,
    API_SYS             VARCHAR(32)         NOT NULL,      /*系統名稱*/
    API_FUNC            VARCHAR(64)         NOT NULL,      /*函式名稱*/
    API_ReqTime         DATETIME            NOT NULL,      /*呼叫時間，YYYY/MM/DD HH:NN:SS*/
    API_RspnTime        DATETIME                NULL,      /*回應時間，YYYY/MM/DD HH:NN:SS*/
    API_CltIP           VARCHAR(32)             NULL,      /*客戶端主機IP*/
	API_ExecSec         DECIMAL(12,4)           NULL,      /*執行時間(秒)*/
    API_RspnCode        VARCHAR(16)             NULL,      /*回應代碼*/
    API_RspnMsg         NVARCHAR(512)           NULL,      /*回應訊息*/
    API_ReqData         NVARCHAR(MAX)           NULL,      /*傳入電文*/
	API_RspnData        NVARCHAR(MAX)           NULL,      /*回傳電文*/

    CONSTRAINT PK_API2002 PRIMARY KEY CLUSTERED (ID)
)
END


IF EXISTS (SELECT A.name
             FROM sysobjects A
                  JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5007'
              AND B.name = 'TXN_Type' /*銷售類別*/
              AND B.prec < 4)
  ALTER TABLE POS5007 ALTER COLUMN TXN_Type            VARCHAR(04)            NULL
EXEC [dbo].[spUpdateColumnDesc] 'POS5007', 'TXN_Type', '銷售類別';


EXEC [dbo].[spUpdateColumnDesc] 'POS1008', 'TSB_Name', '收銀畫面名稱';
EXEC [dbo].[spUpdateColumnDesc] 'POS1008', 'TSB_Enable', '是否使用觸控式按鍵Y/N，預設值為Y';
EXEC [dbo].[spUpdateColumnDesc] 'POS1008', 'TSB_Direct', '按鍵延伸方向，VERT=垂直延伸(預設值)，HORI=水平延伸';
EXEC [dbo].[spUpdateColumnDesc] 'POS1008', 'TSB_XCount', 'X軸按鍵個數';
EXEC [dbo].[spUpdateColumnDesc] 'POS1008', 'TSB_YCount', 'Y軸按鍵個數';
EXEC [dbo].[spUpdateColumnDesc] 'POS1008', 'TSB_Height', '按鍵高度';
EXEC [dbo].[spUpdateColumnDesc] 'POS1008', 'TSB_Width', '按鍵寬度';
EXEC [dbo].[spUpdateColumnDesc] 'POS1008', 'TSB_VertInterval', '按鍵垂直間距';
EXEC [dbo].[spUpdateColumnDesc] 'POS1008', 'TSB_HoriInterval', '按鍵水平間距';

EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'SYS_StoreNo ', '門市店號';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'TXN_Date    ', '交易日期';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'ECR_No      ', '收銀機號';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'TXN_No      ', '交易序號';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'FNS_Class   ', '操作班別';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'FNS_DateTime', '操作日期時間';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'USR_No      ', '收銀員編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'TLT_No      ', '專櫃編號';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'FNS_Flag    ', '方式，0=登入、1=開錢櫃、2=零用金、3=繳大鈔、4=關機清帳、5=授權、6=登出、8=變更密碼、9=開機、PKG=停車折抵、PKG#=強制停車折抵';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'FNS_Qty     ', '數量，未輸入數量的操作則固定為零';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'FNS_Amount  ', '金額，未輸入金額的操作則固定為零';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'FNS_Data    ', '非銷售資料';
EXEC [dbo].[spUpdateColumnDesc] 'POS7004', 'FNS_Info    ', '操作資訊';


/*2025-04-29*/
IF EXISTS (SELECT A.name
             FROM sysobjects A
                  JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002EDC'
              AND B.name = 'ECR_TLT_No')
ALTER TABLE POS1002EDC DROP COLUMN ECR_TLT_No;

IF EXISTS (SELECT A.name
             FROM sysobjects A
                  JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002EDC'
              AND B.name = 'ECR_TLT_Name')
ALTER TABLE POS1002EDC DROP COLUMN ECR_TLT_Name;

/*2025-04-30*/
IF EXISTS (SELECT A.name
             FROM sysobjects A
                  JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002'
              AND B.name = 'ECR_CashD1Com')
ALTER TABLE POS1002 DROP COLUMN ECR_CashD1Com;

IF EXISTS (SELECT A.name
             FROM sysobjects A
                  JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002TML'
              AND B.name = 'ECR_CashD1Com')
ALTER TABLE POS1002TML DROP COLUMN ECR_CashD1Com;

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                      JOIN syscolumns B ON (A.id = B.id)
                WHERE A.name = 'POS1002'
                  AND B.name = 'ECR_DrawerCom')
ALTER TABLE POS1002 ADD ECR_DrawerCom       DECIMAL(02)            NULL;

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002TML'
              AND B.name = 'ECR_DrawerCom')
ALTER TABLE POS1002TML ADD ECR_DrawerCom       DECIMAL(02)            NULL;

/*2025-05-02*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1017'
              AND B.name = 'GUI_VERIFY1_Name') /*設定確認人員一姓名*/
ALTER TABLE POS1017 ADD GUI_VERIFY1_Name    NVARCHAR(20)           NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1017'
              AND B.name = 'GUI_VERIFY2_Name') /*設定確認人員二姓名*/
ALTER TABLE POS1017 ADD GUI_VERIFY2_Name    NVARCHAR(20)           NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002'
              AND B.name = 'SYS_SrvNo')
ALTER TABLE POS1002 ADD SYS_SrvNo           VARCHAR(08)            NULL;

/*2025-05-04*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5006'
              AND B.name = 'ECR_LocNo')
ALTER TABLE POS5006 ADD ECR_LocNo           VARCHAR(10)            NULL;

/*2025-05-06*/
IF EXISTS (SELECT A.name
             FROM sysobjects A
                  JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS80054'
              AND B.name = 'EXP_DataFlag'
              AND B.prec < 8)
  ALTER TABLE POS80054 ALTER COLUMN EXP_DataFlag        VARCHAR(08)         NOT NULL

IF EXISTS (SELECT A.name
             FROM sysobjects A
                  JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS80055'
              AND B.name = 'EXP_DataFlag'
              AND B.prec < 8)
  ALTER TABLE POS80055 ALTER COLUMN EXP_DataFlag        VARCHAR(08)         NOT NULL

/*2025-05-09*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002'
              AND B.name = 'ECR_RestoreVoid') /*是否允許回復已作廢交易(Y/N)，預設值為N*/
ALTER TABLE POS1002 ADD ECR_RestoreVoid     CHAR(01) DEFAULT 'N'           NOT NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002TML'
              AND B.name = 'ECR_RestoreVoid') /*是否允許回復已作廢交易(Y/N)，預設值為N*/
ALTER TABLE POS1002TML ADD ECR_RestoreVoid     CHAR(01) DEFAULT 'N'          NOT NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002'
              AND B.name = 'ECR_MSR') /*MSR型態，預設值空白代表未設定*/
ALTER TABLE POS1002 ADD ECR_MSR             VARCHAR(20)            NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002'
              AND B.name = 'ECR_MSRCom') /*MSR連接埠，預設值為0(未啟用)*/
ALTER TABLE POS1002 ADD ECR_MSRCom          DECIMAL(02)            NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002'
              AND B.name = 'ECR_OrderPrn') /*訂單印表機型態，預設值空白代表未設定*/
ALTER TABLE POS1002 ADD ECR_OrderPrn        VARCHAR(20)            NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002'
              AND B.name = 'ECR_OrderPrnCom') /*訂單印表機連接埠，預設值為0(未啟用)*/
ALTER TABLE POS1002 ADD ECR_OrderPrnCom     DECIMAL(02)            NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002TML'
              AND B.name = 'ECR_MSR') /*MSR型態，預設值空白代表未設定*/
ALTER TABLE POS1002TML ADD ECR_MSR             VARCHAR(20)            NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002TML'
              AND B.name = 'ECR_MSRCom') /*MSR連接埠，預設值為0(未啟用)*/
ALTER TABLE POS1002TML ADD ECR_MSRCom          DECIMAL(02)            NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002TML'
              AND B.name = 'ECR_OrderPrn') /*訂單印表機型態，預設值空白代表未設定*/
ALTER TABLE POS1002TML ADD ECR_OrderPrn        VARCHAR(20)            NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002TML'
              AND B.name = 'ECR_OrderPrnCom') /*訂單印表機連接埠，預設值為0(未啟用)*/
ALTER TABLE POS1002TML ADD ECR_OrderPrnCom     DECIMAL(02)            NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002'
              AND B.name = 'ECR_SrvName') /*收銀機後台主機名稱，POS10015.SYS_SrvName*/
ALTER TABLE POS1002 ADD ECR_SrvName         NVARCHAR(40)           NULL

/*2025-05-17*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5006'
              AND B.name = 'TXN_TaxFreeCertNo') /*免稅證證號*/
ALTER TABLE POS5006 ADD TXN_TaxFreeCertNo   VARCHAR(10)            NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5007'
              AND B.name = 'TXN_Disc') /*折扣總額(負數)，TXN_DiscS + TXN_DiscM + TXN_DiscT + TXN_DiscP + TXN_DiscD + TXN_RebateS + TXN_RebateT + TXN_PayScoreAmt */
ALTER TABLE POS5007 ADD TXN_Disc            DECIMAL(12,4) DEFAULT 0 NOT NULL

/*2025-05-19*/
IF EXISTS (SELECT A.name
             FROM sysobjects A
                  JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5007'
              AND B.name = 'TXN_VIP')
ALTER TABLE POS5007 DROP COLUMN TXN_VIP

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS2004'
              AND B.name = 'PLU_StopSale') /*停止銷售註記(Y/N)*/
ALTER TABLE POS2004 ADD PLU_StopSale        CHAR(01)                NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS2004'
              AND B.name = 'PLU_StopSaleDate') /*停止銷售日期*/
ALTER TABLE POS2004 ADD PLU_StopSaleDate    DATE                    NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS2004'
              AND B.name = 'PLU_Disc') /*是否可折扣(Y/N)*/
ALTER TABLE POS2004 ADD PLU_Disc            CHAR(01)                NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'DEFTBL'
              AND B.name = 'TBL_FullDnPos') /*是否整檔下傳至收銀機台，Y/N，預設值為N*/
ALTER TABLE DEFTBL ADD TBL_FullDnPos       CHAR(01)                NULL;

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'DEFTBL'
              AND B.name = 'TBL_FullDnSto') /*是否整檔下傳至門市，Y/N，預設值為N*/
ALTER TABLE DEFTBL ADD TBL_FullDnSto       CHAR(01)                NULL;

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'DEFFLD'
              AND B.name = 'FLD_EnCode') /*是否編碼，Y/N，預設值為N*/
ALTER TABLE DEFFLD ADD FLD_EnCode          CHAR(01)                NULL;



/*2025-06-02*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002'
              AND B.name = 'SYS_SRVDDirClt') /*前台系統下載目錄，預設值為 /PosDown*/
ALTER TABLE POS1002 ADD SYS_SRVDDirClt      VARCHAR(60)            NULL;

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1002'
              AND B.name = 'SYS_SRVUDirClt') /*前台系統上傳目錄，預設值為 /PosUp*/
ALTER TABLE POS1002 ADD SYS_SRVUDirClt      VARCHAR(60)            NULL;


/*2025/06/12*/
IF EXISTS (SELECT A.name
             FROM sysindexes A
            WHERE A.name = 'IDX_IMG1001_MST')
  DROP INDEX IDX_IMG1001_MST ON IMG1001
ALTER TABLE IMG1001 ALTER COLUMN IMG_Path            NVARCHAR(30)        NOT NULL
ALTER TABLE IMG1001 ALTER COLUMN IMG_File            NVARCHAR(255)       NOT NULL
IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_IMG1001_MST')
  CREATE INDEX IDX_IMG1001_MST ON IMG1001 (IMG_Type, IMG_SeqNo, IMG_Path, IMG_File)


IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5007'
              AND B.name = 'ACT_DiscCode') /*歸屬專櫃折數代碼，預設值專櫃折數代碼*/
ALTER TABLE POS5007 ADD ACT_DiscCode        VARCHAR(06)            NULL

/*2025/06/18*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5006'
              AND B.name = 'MID') /*商戶編號*/
ALTER TABLE POS5006 ADD MID                 DECIMAL(19) DEFAULT 0 NOT NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5007'
              AND B.name = 'MID') /*商戶編號*/
ALTER TABLE POS5007 ADD MID                 DECIMAL(19) DEFAULT 0 NOT NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5008'
              AND B.name = 'MID') /*商戶編號*/
ALTER TABLE POS5008 ADD MID                 DECIMAL(19) DEFAULT 0 NOT NULL

IF EXISTS (SELECT A.name
             FROM sysobjects A
                  JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5007'
              AND B.name = 'PLU_Name' /*商品名稱*/
              AND B.prec < 60)
  ALTER TABLE POS5007 ALTER COLUMN PLU_Name            NVARCHAR(60)            NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5008'
              AND B.name = 'EDC_InstHeadAmt') /*分期付款-首期金額*/
ALTER TABLE POS5008 ADD EDC_InstHeadAmt     DECIMAL(10,2)          NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5008'
              AND B.name = 'EDC_InstEachAmt') /*分期付款-每期金額*/
ALTER TABLE POS5008 ADD EDC_InstEachAmt     DECIMAL(10,2)          NULL

/*2025-06-21*/
IF EXISTS (SELECT A.name
             FROM sysobjects A
                  JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5008'
              AND B.name = 'EDC_RRN' /*銀行交易序號*/
              AND B.prec < 64)
  ALTER TABLE POS5008 ALTER COLUMN EDC_RRN             VARCHAR(64)            NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                      JOIN syscolumns B ON (A.id = B.id)
                WHERE A.name = 'POS10015'
                  AND B.name = 'MID')
BEGIN
  IF EXISTS (SELECT A.name
               FROM sysindexes A
              WHERE A.name = 'IDX_POS10015_MST')
    DROP INDEX IDX_POS10015_MST ON POS10015
  ALTER TABLE POS10015 ADD MID                 DECIMAL(19,0) DEFAULT 0 NOT NULL
  CREATE UNIQUE INDEX IDX_POS10015_MST ON POS10015 (MID, SYS_StoreNo, SYS_SrvNo)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                      JOIN syscolumns B ON (A.id = B.id)
                WHERE A.name = 'POS1002'
                  AND B.name = 'MID')
BEGIN
  IF EXISTS (SELECT A.name
               FROM sysindexes A
              WHERE A.name = 'IDX_POS1002_MST')
    DROP INDEX IDX_POS1002_MST ON POS1002
  ALTER TABLE POS1002 ADD MID                 DECIMAL(19,0) DEFAULT 0 NOT NULL
  CREATE UNIQUE INDEX IDX_POS1002_MST ON POS1002 (MID, SYS_StoreNo, ECR_No)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                      JOIN syscolumns B ON (A.id = B.id)
                WHERE A.name = 'POS1002EDC'
                  AND B.name = 'MID')
BEGIN
  IF EXISTS (SELECT A.name
               FROM sysindexes A
              WHERE A.name = 'IDX_POS1002EDC_MST')
    DROP INDEX IDX_POS1002EDC_MST ON POS1002EDC
  ALTER TABLE POS1002EDC ADD MID                 DECIMAL(19,0) DEFAULT 0 NOT NULL
  CREATE UNIQUE INDEX IDX_POS1002EDC_MST ON POS1002EDC (MID, SYS_StoreNo, ECR_No, EDC_No, EDC_BegDate)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                      JOIN syscolumns B ON (A.id = B.id)
                WHERE A.name = 'POS1002TML'
                  AND B.name = 'MID')
BEGIN
  IF EXISTS (SELECT A.name
               FROM sysindexes A
              WHERE A.name = 'IDX_POS1002TML_MST')
    DROP INDEX IDX_POS1002TML_MST ON POS1002TML
  ALTER TABLE POS1002TML ADD MID                 DECIMAL(19,0) DEFAULT 0 NOT NULL
  CREATE UNIQUE INDEX IDX_POS1002TML_MST ON POS1002TML (MID, SYS_StoreNo, ECR_No, EDC_No, EDC_BegDate)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                      JOIN syscolumns B ON (A.id = B.id)
                WHERE A.name = 'POS1002SCH'
                  AND B.name = 'MID')
BEGIN
  IF EXISTS (SELECT A.name
               FROM sysindexes A
              WHERE A.name = 'IDX_POS1002SCH_MST')
    DROP INDEX IDX_POS1002SCH_MST ON POS1002SCH
  ALTER TABLE POS1002SCH ADD MID                 DECIMAL(19,0) DEFAULT 0 NOT NULL
  CREATE UNIQUE INDEX IDX_POS1002SCH_MST ON POS1002SCH (MID, SYS_StoreNo, ECR_No, EDC_No, EDC_BegDate)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                      JOIN syscolumns B ON (A.id = B.id)
                WHERE A.name = 'POS3012'
                  AND B.name = 'MID')
BEGIN
  IF EXISTS (SELECT A.name
               FROM sysindexes A
              WHERE A.name = 'IDX_POS3012_MST')
    DROP INDEX IDX_POS3012_MST ON POS3012
  ALTER TABLE POS3012 ADD MID                 DECIMAL(19,0) DEFAULT 0 NOT NULL
  CREATE UNIQUE INDEX IDX_POS3012_MST ON POS3012 (MID, SYS_StoreNo, TXN_Date, ECR_No, TXN_No, TXN_DType)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                      JOIN syscolumns B ON (A.id = B.id)
                WHERE A.name = 'POS30061'
                  AND B.name = 'MID')
BEGIN
  IF EXISTS (SELECT A.name
               FROM sysindexes A
              WHERE A.name = 'IDX_POS30061_MST')
    DROP INDEX IDX_POS30061_MST ON POS30061
  ALTER TABLE POS30061 ADD MID                 DECIMAL(19,0) DEFAULT 0 NOT NULL
  CREATE UNIQUE INDEX IDX_POS30061_MST ON POS30061 (MID, SYS_StoreNo, TXN_Date, ECR_No, TXN_No, TXN_GUINo, TXN_SeqNo)
END

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5008'
              AND B.name = 'TXN_BalBeforePay') /*交易前餘額*/
ALTER TABLE POS5008 ADD TXN_BalBeforePay    DECIMAL(10,2)          NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5008'
              AND B.name = 'TXN_BalAfterPay') /*交易後餘額*/
ALTER TABLE POS5008 ADD TXN_BalAfterPay     DECIMAL(10,2)          NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5008'
              AND B.name = 'TXN_AutoloadAmt') /*自動加值金額*/
ALTER TABLE POS5008 ADD TXN_AutoloadAmt     DECIMAL(10,2)          NULL

/*2025-06-25*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5008'
              AND B.name = 'VOU_Check') /*有價券兌回方式，1=連線、2=離線、3=大宗兌回*/
ALTER TABLE POS5008 ADD VOU_Check           CHAR(01)               NULL

/*2025-06-30*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS1013'
              AND B.name = 'ECR_Type') /*機台類型，1=集中機台(統收)、2=專櫃機台(自收)、5=離線機台(不開立業主發票、不使用業主機台)、7=它社機台(開立業主發票、不使用業主機台)*/
ALTER TABLE POS1013 ADD ECR_Type            VARCHAR(02)            NULL

/*2025-07-04*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5006'
              AND B.name = 'PRM_TLT_No') /*修正前-專櫃編號*/
ALTER TABLE POS5006 ADD PRM_TLT_No          VARCHAR(12)            NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5006'
              AND B.name = 'PRM_Talent_ID') /*修正前-專櫃合約編號系統 ID*/
ALTER TABLE POS5006 ADD PRM_Talent_ID       DECIMAL(19,0)          NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5007'
              AND B.name = 'PRM_PLU_MagNo') /*修正前-商品管理編號*/
ALTER TABLE POS5007 ADD PRM_PLU_MagNo       VARCHAR(20)            NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5007'
              AND B.name = 'PRM_TLT_No') /*修正前-專櫃編號*/
ALTER TABLE POS5007 ADD PRM_TLT_No          VARCHAR(12)            NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5007'
              AND B.name = 'PRM_Talent_ID') /*修正前-專櫃合約編號系統 ID*/
ALTER TABLE POS5007 ADD PRM_Talent_ID       DECIMAL(19,0)          NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5007'
              AND B.name = 'PRM_TLT_ID') /*修正前-分類抽成類別，TLTTALENT_CHARGEM.TLT_ID*/
ALTER TABLE POS5007 ADD PRM_TLT_ID          CHAR(01)               NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5007'
              AND B.name = 'PRM_TXN_DiscCode') /*修正前-專櫃折數代碼，預設值專櫃折數代碼*/
ALTER TABLE POS5007 ADD PRM_TXN_DiscCode    VARCHAR(06)            NULL

IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                   JOIN syscolumns B ON (A.id = B.id)
            WHERE A.name = 'POS5008'
              AND B.name = 'PRM_PAY_No') /*修正前-付款編號，POS1006.PAY_No*/
ALTER TABLE POS5008 ADD PRM_PAY_No          VARCHAR(02)            NULL




