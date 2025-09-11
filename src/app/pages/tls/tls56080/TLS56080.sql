-------------------------------------------------同業調撥
/*STORETRADEM 同業調撥主檔*/
DROP TABLE STORETRADEM;
create table STORETRADEM
(
    id                   NUMERIC(19,0) IDENTITY(1,1) NOT NULL,
    MID                  numeric(19,0)        DEFAULT 0 not null, /*商戶編號*/
    TRD_No               nvarchar(16)         not null,      /*同業調撥編號:TRYYYYMMDDSSSS*/
    SYS_StoreNo          VARCHAR(10)          not null,      /*公司編號/店號*/
    HOS_No               VARCHAR (10)         not null ,     /*倉庫代碼*/
    VEN_No               VARCHAR (16)             null,      /*廠商編號*/
    LOGO_No              VARCHAR (4)              null ,     /*品牌代碼*/

    TRD_Status           char(1)              not null,      /*同業調撥狀態:1=已申請 2=已確認 3=已審核 7=已結案 9=已作廢*/
	TRD_Reason           char(1)                  null,      /*調撥原因：１＝庫存過高　２＝同業調貨　３＝同業缺貨　４＝其它  ５＝特殊*/
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



/*STORETRADED 同業調撥明細檔*/
DROP TABLE STORETRADED;
create table STORETRADED
(
    id                  NUMERIC(19,0) IDENTITY(1,1) NOT NULL,
    MID                 numeric(19,0)        DEFAULT 0 not null, /*商戶編號*/
    TRD_No               nvarchar(16)         not null,      /*同業調撥編號:TRYYYYMMDDSSSS*/
    SYS_StoreNo          VARCHAR(10)          not null,      /*公司編號/店號*/
    HOS_No               VARCHAR (10)         not null ,     /*倉庫代碼*/
    TRD_SeqNo           numeric(4)           not null,      /*項次*/
    PLU_MagNo           varchar (20)         not null ,     /*商品管理編號*/
    PLU_No              varchar (20)             null ,     /*國際條碼*/
    PLU_Unit            varchar(2)               null,      /*單位代碼*/
    PLU_BoxQty          numeric(4)               null,      /*裝箱入數*/
    PLU_Name            nvarchar(60)             null,      /*商品名稱*/
	TRD_Type            char(1)              not null,      /*調入/調出:0調出,1調入*/
    PLU_SalePrc         numeric(14, 4)           null,      /*售單價*/
    TRD_Qty             numeric(10, 2)           null,      /*調撥數量*/
    TRD_Amt             numeric(14, 4)           null,      /*小計金額 售單價*數量 */
    TRD_Remark          nvarchar(200)            null,      /*備註*/

    CRT_Date             datetime                null ,     /*建立日期*/
    CRT_USR_No           varchar (16)            null ,     /*建立人員*/
    CRT_USR_Name         nvarchar (20)           null ,     /*建立人員姓名*/
    UPD_Date             datetime                null ,     /*變更日期*/
    UPD_USR_No           varchar (16)            null ,     /*變更人員*/
    UPD_USR_Name         nvarchar (20)           null ,     /*變更人員姓名*/

     constraint pk_STORETRADED primary key clustered (id)
);

IF NOT EXISTS (SELECT A.name
                 FROM sysindexes A
                WHERE A.name = 'IDX_STORETRADED_1')
  CREATE UNIQUE INDEX IDX_STORETRADED_1 ON STORETRADED (MID, TRD_No, SYS_StoreNo, HOS_NO, TRD_SeqNo);
