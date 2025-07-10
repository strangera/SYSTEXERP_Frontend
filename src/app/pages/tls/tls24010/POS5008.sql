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
