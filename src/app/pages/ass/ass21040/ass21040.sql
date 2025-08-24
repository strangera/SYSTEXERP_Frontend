/*ENG2001抄錶明細檔*/
create table ENG2001
(
     id                  numeric(19,0) identity(1,1) NOT NULL,
	 mid                 numeric(19,0)  DEFAULT 0 NOT NULL ,
     SYS_StoreNo         varchar(10)              NOT NULL ,     /*分店編號*/	 	 
	 ENG_YYMM            VARCHAR(6)               NOT NULL ,     /*結算年月*/
     ENG_Type            VARCHAR(3)               NOT NULL ,     /*能源類型：水錶G01、電錶G02、瓦斯錶G03**/
     ENG_MeterNo         VARCHAR(5)               NOT NULL ,     /*錶號*/     
	 ENG_Date            datetime                 NOT NULL ,     /*本次抄錶日*/	 
     ENG_CurrentReading  NUMERIC(14,4)            NOT NULL ,     /*本次抄錶度數*/	 	 
     ENG_Amount          NUMERIC(10)              NOT NULL ,     /*本次結算金額*/
	 ENG_Status          VARCHAR(1)               NOT NULL ,     /*結算狀態: 0:未結算 1:已結算*/     
	 ENG_ImpFileName     NVARCHAR(200)                NULL ,     /*匯入檔案名稱*/
     CRT_Date            datetime                     NULL ,     /*建立日期*/
     CRT_USR_No          varchar(16)                  NULL ,     /*建立人員*/
     CRT_USR_Name        nvarchar(20)                 NULL ,     /*建立人員名稱*/
     UPD_Date            datetime                     NULL ,     /*變更日期*/
     UPD_USR_No          varchar(16)                  NULL ,     /*變更人員*/  
     UPD_USR_Name        nvarchar (20)                NULL ,     /*變更人員名稱*/

     constraint PK_ENG2001 primary key clustered  (id)
);

IF NOT EXISTS (SELECT A.name 
                 FROM sysindexes A 
                WHERE A.name = 'IDX_ENG2001_MST') 
  CREATE UNIQUE INDEX IDX_ENG2001_MST ON ENG2001 (mid, SYS_StoreNo, ENG_YYMM, ENG_Type, ENG_MeterNo, ENG_Date);
  
/*ENG4001能源費用月檔*/
create table ENG4001
(
     id                  numeric(19,0) identity(1,1) NOT NULL,
	 mid                 numeric(19,0)  DEFAULT 0 NOT NULL ,
     SYS_StoreNo         varchar(10)              NOT NULL ,     /*分店編號*/	  
	 ENG_YYMM            VARCHAR(6)               NOT NULL ,     /*結算年月*/	 
     ENG_Type            VARCHAR(3)               NOT NULL ,     /*能源類型：水錶G01、電錶G02、瓦斯錶G03**/	 
     ENG_MeterNo         VARCHAR(5)               NOT NULL ,     /*錶號*/	 
	 TLT_No              varchar(12)              NOT NULL ,     /*專櫃編號*/
     ENG_PriorReading    NUMERIC(14,4)            NOT NULL ,     /*上次抄錶度數*/
     ENG_CurrentReading  NUMERIC(14,4)            NOT NULL ,     /*本次抄錶度數*/	 
     ENG_ENG_Usage       NUMERIC(14,4)            NOT NULL ,     /*本月使用度數*/	      
     ENG_Amount          NUMERIC(10)              NOT NULL ,     /*本次結算金額*/	 	 
     CRT_Date            datetime                     NULL ,     /*建立日期*/	
     CRT_USR_No          varchar(16)                  NULL ,     /*建立人員*/
     CRT_USR_Name        nvarchar(20)                 NULL ,     /*建立人員名稱*/
     UPD_Date            datetime                     NULL ,     /*變更日期*/
     UPD_USR_No          varchar(16)                  NULL ,     /*變更人員*/  
     UPD_USR_Name        nvarchar (20)                NULL ,     /*變更人員名稱*/

     constraint PK_ENG4001 primary key clustered  (id)
);

IF NOT EXISTS (SELECT A.name 
                 FROM sysindexes A 
                WHERE A.name = 'IDX_ENG4001_MST') 
  CREATE UNIQUE INDEX IDX_ENG4001_MST ON ENG4001 (mid, SYS_StoreNo, ENG_YYMM, ENG_Type, ENG_MeterNo, TLT_No);