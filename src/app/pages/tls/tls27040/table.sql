/*POS6118 聯信特店MIS LOG檔案 */
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS6118')
BEGIN
CREATE TABLE POS6118
(
    ID                    DECIMAL(19) IDENTITY(1,1) NOT NULL,      /*ID*/
    MID                   DECIMAL(19) DEFAULT 0 NOT NULL,    /*商戶編號*/
    NCML_File             VARCHAR(64)         NOT NULL,     /*檔案名稱，ATS_MISLOG_DXXX_YYYYMMDD.TXT*/
    NCML_Date             DATE                NOT NULL,     /*檔案日期(請款日、結算日期、清算日期)*/
    NCML_SeqNo            DECIMAL(08)         NOT NULL,     /*項次*/
    NCML_ProcDate         DATETIME                NULL,     /*處理日期*/

    NCML_FileVer          VARCHAR(02)             NULL,     /*檔案規格版本編號*/
    NCML_Source           VARCHAR(02)             NULL,     /*資料來源，預設值=空白、NC=NCCC收單交易系統(信用卡、銀聯卡、Smart Pay)、DC=DCC FES、ES=電子票證模組(ATS)、DN=大來卡(非DFS)轉接模組(ATS)*/
    NCML_MerID            VARCHAR(15)             NULL,     /*特店代號(左靠右補空白)，POS5008.EDC_MerID    */
    NCML_TmID             VARCHAR(08)             NULL,     /*端末機代號(左靠有補空白)，POS5008.EDC_TmID */
    NCML_BatNo            VARCHAR(06)             NULL,     /*批次號碼(右靠左補0)*/
    NCML_BatCloseDate     DATE                    NULL,     /*批次結帳日期(撥款日、入帳日)(YYYY/MM/DD)*/
    NCML_PayType          CHAR(01)                NULL,     /*支付卡類別(區分一般信用卡、銀聯卡、Smart Pay及電子票證)，N=一般信用卡(含VISA、Master Card、JCB、U Card、Amex、Discover)、C=銀聯卡、S=Smart Pay、E=電子票證*/
    NCML_PayCrdType       VARCHAR(02)             NULL,     /*支付卡別簡碼，UC=U Card、VS=VISA、MC=Master Card、JB=JCB、UP=銀聯卡、AE=Amex、DF=Discover、EC=電子票證-悠遊卡、IP=電子票證-一卡通、IC=電子票證-愛金卡*/


    NCML_PayScanType      CHAR(01)                NULL,     /*過卡方式標記*/
    NCML_BnkNo            VARCHAR(03)             NULL,     /*發卡行之金融機構代碼、國內信用卡=填入金融機構代碼、國外信用卡=固定值999、銀聯卡=固定值999、Smart Pay及電子票證=空白*/
    NCML_CrdNo            VARCHAR(32)             NULL,     /*卡號(左靠右補空白)，一般信用卡(V/M/J/A/D/U)、銀聯卡及Smart Pay (保留前6後4為明碼，其餘以*遮掩)、悠遊卡(T0200)：卡號從後往前算第5,6,7碼遮掩、一卡通：遮掩卡號末2碼、愛金卡：遮掩卡號9-12碼*/
    NCML_TxnDate          DATE                    NULL,     /*交易日期(銷售日)(YYYY/MM/DD)*/
    NCML_TxnTime          DATETIME                NULL,     /*交易時間(YYYY/MM/DD HH:NN:SS)，包含NCML_TxnDate*/
    NCML_TxnType          VARCHAR(02)             NULL,     /*交易別，若POS6118.NCML_PayType為N、C、S則00=一般交易(含交易補登、分期付款及紅利扣抵)、02=預先授權完成、03=郵購、04=退貨(含分期付款及紅利扣抵)，若POS6118.NCML_PayType為E則00=電票購貨、04=電票退貨、30=電票現金加值(含悠遊卡社福卡現金加值)、32=電票取消加值(電票的取消交易不能正、負相抵)、10=電票自動加值*/
    NCML_TxnAmt           DECIMAL(12,2)           NULL,     /*交易金額*/
    NCML_TxnBatNo         VARCHAR(06)             NULL,     /*交易批號(同簽單之批號)，右靠左補0*/
    NCML_RcptNo           VARCHAR(06)             NULL,     /*交易序號(同簽單之調閱編號)，POS5008.EDC_RcptNo*/
    NCML_RRN              VARCHAR(12)             NULL,     /*端末機Retrieval Reference Number (左靠右補空白)*/
    NCML_StoID            VARCHAR(18)             NULL,     /*櫃號或部類碼(左靠右補空白)，POS5008.TXN_Date(YYMMDD) + POS5008.ECR_No + POS5008.TXN_No*/
    NCML_StoIDEx          VARCHAR(32)             NULL,     /*櫃號或部類碼擴充欄位(左靠右補空白)*/
    NCML_ApprovalCode     VARCHAR(06)             NULL,     /*授權碼(左靠右補空白)，POS5008.EDC_ApprovalCode*/
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

    SYS_StoreNo           VARCHAR(10)             NULL,     /*交易店號 POS5008.SYS_StoreNo*/
    TXN_Date              DATE                    NULL,     /*交易日期 POS5008.TXN_Date*/
    ECR_No                VARCHAR(10)             NULL,     /*收銀機號 POS5008.ECR_No*/
    TXN_No                DECIMAL(08)             NULL,     /*交易序號 POS5008.TXN_No*/
    TXN_Item              DECIMAL(06)             NULL,     /*交易項次 POS5008.TXN_Item*/
    PAY_No                VARCHAR(02)             NULL,     /*付款編號，POS5008.PAY_No*/
    CRD_Type              VARCHAR(06)             NULL,     /*付款信用卡卡別，POS5008.CRD_Type，V=VISA、M=MASTER、J=JCB、A=AE、D=DINERS、S=銀聯卡、O=其他*/
    MMT_No                VARCHAR(08)             NULL,     /*商場代號(未使用)*/
    TLT_No                VARCHAR(12)             NULL,     /*專櫃編號*/
    Contract_No           VARCHAR(20)             NULL,     /*專櫃合約編號*/
    Contract_SubNo        VARCHAR(04)             NULL,     /*專櫃合約附號*/
    Talent_ID             DECIMAL(19,0)           NULL,     /*專櫃合約編號系統 ID*/

    NCML_TXN_Date         DATE                    NULL,     /*銷貨/退貨日期 YYYY-MM-DD*/
    NCML_ECR_No           VARCHAR(10)             NULL,     /*銷貨/退貨機號*/
    NCML_USR_No           VARCHAR(16)             NULL,     /*銷貨/退貨收銀員編號*/
    NCML_Check            VARCHAR(02)             NULL,     /*比對備註，Y=比對正確、N=比對錯誤、M=已修正、A=手動新增*/
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

EXEC [dbo].[spUpdateColumnDesc] 'POS6118', 'NCML_PayCrdType', '支付卡別簡碼，UC=U Card、VS=VISA、MC=Master Card、JB=JCB、UP=銀聯卡、AE=Amex、DF=Discover';
EXEC [dbo].[spUpdateColumnDesc] 'POS6118', 'NCML_Check', '比對備註，Y=比對正確、N=比對錯誤、M=已修正、A=手動新增';


/*POS6119 中信信用卡帳務檔*/
IF NOT EXISTS (SELECT A.name
                 FROM sysobjects A
                WHERE A.name = 'POS6119')
BEGIN
CREATE TABLE POS6119
(
    ID                    DECIMAL(19) IDENTITY(1,1) NOT NULL,      /*ID*/
    MID                   DECIMAL(19) DEFAULT 0 NOT NULL,    /*商戶編號*/
    CTBC_File             VARCHAR(64)         NOT NULL,     /*檔案名稱*/
    CTBC_Date             DATE                NOT NULL,     /*檔案日期(請款日、結算日期、清算日期)*/
    CTBC_ProcDate         DATETIME                NULL,     /*處理日期*/
    CTBC_SeqNo            DECIMAL(08)         NOT NULL,     /*項次*/

    CTBC_DataType         CHAR(01)            NOT NULL,     /*資料型態，C=一般交易、I=分期交易、R=紅利交易*/
    CTBC_TxnTime          DATETIME            NOT NULL,     /*交易時間(銷售日)，YYYY/MM/DD HH:NN:SS*/
    CTBC_CrdNo            VARCHAR(19)             NULL,     /*卡號(左靠右補空白)，NCCC U card: 前補9000，後補0*/
    CTBC_MerID            VARCHAR(15)             NULL,     /*商店代號，POS5008.EDC_MerID*/
    CTBC_TmID             VARCHAR(08)         NOT NULL,     /*端末機代號，POS5008.EDC_TmID*/
    CTBC_TxnCode          VARCHAR(02)         NOT NULL,     /*交易類別碼，01=正向交易、02=負向交易*/
    CTBC_TxnAmt           DECIMAL(12,2)       NOT NULL,     /*交易金額*/
    CTBC_ApprovalCode     VARCHAR(06)             NULL,     /*授權碼，POS5008.EDC_ApprovalCode*/
    CTBC_ExpireYYMM       VARCHAR(04)             NULL,     /*卡片有效日期，YYMM，固定值0000，POS5008.EDC_ExpireDate*/
    CTBC_PayScanType      CHAR(01)                NULL,     /*卡片交易模式，M=人工輸入卡號、S=信用卡刷卡、C=晶片卡刷卡、P=非接觸式卡PayPass、W=非接觸式卡VisaWave、U=CUP卡*/
    CTBC_BatNo            VARCHAR(06)             NULL,     /*批次號碼(結帳批號)*/
    CTBC_StoID            VARCHAR(18)             NULL,     /*櫃號，POS5008.TXN_Date(YYMMDD) + POS5008.ECR_No + POS5008.TXN_No*/
	CTBC_PayDate          DATE                    NULL,     /*撥款日(入帳日)，YYYY/MM/DD，因為帳務檔未提供此欄位值所以固定為空值*/

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

    SYS_StoreNo           VARCHAR(10)             NULL,     /*交易店號，POS5006.SYS_StoreNo*/
    TXN_Date              DATE                    NULL,     /*交易日期，POS5006.TXN_Date*/
    ECR_No                VARCHAR(10)             NULL,     /*收銀機號，POS5006.ECR_No*/
    TXN_No                DECIMAL(08)             NULL,     /*交易序號，POS5006.TXN_No*/
    TXN_Item              DECIMAL(06)             NULL,     /*交易項次，POS5008.TXN_Item*/
    PAY_No                VARCHAR(02)             NULL,     /*付款編號，POS5008.PAY_No*/
    CRD_Type              VARCHAR(06)             NULL,     /*付款信用卡卡別，POS5008.CRD_Type，V=VISA、M=MASTER、J=JCB、A=AE、D=DINERS、S=銀聯卡、O=其他*/
    MMT_No                VARCHAR(08)             NULL,     /*商場代號(未使用)*/
    TLT_No                VARCHAR(12)             NULL,     /*專櫃編號，POS5006.TLT_No*/
    Contract_No           VARCHAR(20)             NULL,     /*專櫃合約編號，POS5006.Contract_No*/
    Contract_SubNo        VARCHAR(04)             NULL,     /*專櫃合約附號，POS5006.Contract_SubNo*/
    Talent_ID             DECIMAL(19,0)           NULL,     /*專櫃合約編號系統 ID，POS5006.Talent_ID*/

    CTBC_TXN_Date         DATE                    NULL,     /*銷貨/退貨日期，YYYY/MM/DD*/
    CTBC_ECR_No           VARCHAR(10)             NULL,     /*銷貨/退貨機號*/
    CTBC_USR_No           VARCHAR(16)             NULL,     /*銷貨/退貨收銀員編號*/
    CTBC_Check            VARCHAR(02)             NULL,     /*比對備註，Y=比對正確、N=比對錯誤、M=已修正、A=手動新增*/

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
    MID                 DECIMAL(19) DEFAULT 0 NOT NULL,     /*商戶編號*/
    CTBC_File             VARCHAR(64)         NOT NULL,     /*檔案名稱，*.xls*/
    CTBC_Date             DATE                NOT NULL,     /*檔案日期(請款日、結算日期、清算日期)*/
    CTBC_ProcDate         DATETIME                NULL,     /*處理日期*/
    CTBC_SeqNo            DECIMAL(08)         NOT NULL,     /*項次*/

    CTBC_CrdNo            VARCHAR(19)             NULL,     /*卡號(左靠右補空白)，NCCC U card: 前補9000，後補0*/
    CTBC_TxnDate          DATE                NOT NULL,     /*交易日(銷售日)，YYYY/MM/DD*/
    CTBC_TxnAmt           DECIMAL(12,2)       NOT NULL,     /*交易金額*/
    CTBC_ApprovalCode     VARCHAR(06)             NULL,     /*授權碼*/
    CTBC_TxnType          VARCHAR(02)             NULL,     /*交易類型，40=請款、41=退款*/
    CTBC_BusDate          DATE                    NULL,     /*帳務日，YYYY/MM/DD*/
    CTBC_PayDate          DATE                    NULL,     /*撥款日(入帳日)，YYYY/MM/DD*/
    CTBC_EcID             VARCHAR(08)             NULL,     /*EC代碼*/
    CTBC_TmID             VARCHAR(08)             NULL,     /*端末機代號*/
    CTBC_RebateAmt        DECIMAL(12,2)           NULL,     /*紅利折抵金額*/
    CTBC_RebateBonus      DECIMAL(11)             NULL,     /*紅利折抵點數*/
    CTBC_RebateCode       VARCHAR(06)             NULL,     /*產品別*/
    CTBC_CupTxnTime       DATETIME                NULL,     /*銀聯卡日期時間，帳務excel檔欄位的「銀聯卡日期」+「銀聯卡時間」*/
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
    TXN_No                DECIMAL(08)             NULL,     /*交易序號 POS5006.TXN_No*/
    TXN_Item              DECIMAL(06)             NULL,     /*交易項次 POS5008.TXN_Item*/
    PAY_No                VARCHAR(02)             NULL,     /*付款編號，POS5008.PAY_No*/
    CRD_Type              VARCHAR(06)             NULL,     /*付款信用卡卡別，POS5008.CRD_Type，V=VISA、M=MASTER、J=JCB、A=AE、D=DINERS、S=銀聯卡、O=其他*/
    MMT_No                VARCHAR(08)             NULL,     /*商場代號(未使用)*/
    TLT_No                VARCHAR(12)             NULL,     /*專櫃編號*/
    Contract_No           VARCHAR(20)             NULL,     /*專櫃合約編號*/
    Contract_SubNo        VARCHAR(04)             NULL,     /*專櫃合約附號*/
    Talent_ID             DECIMAL(19,0)           NULL,     /*專櫃合約編號系統 ID*/

    CTBC_TXN_Date         DATE                    NULL,     /*銷貨/退貨日期，YYYY/MM/DD*/
    CTBC_ECR_No           VARCHAR(10)             NULL,     /*銷貨/退貨機號*/
    CTBC_USR_No           VARCHAR(16)             NULL,     /*銷貨/退貨收銀員編號*/
    CTBC_Check            VARCHAR(02)             NULL,     /*比對備註，Y=比對正確、N=比對錯誤、M=已修正、A=手動新增*/
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
