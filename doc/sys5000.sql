-- 1. 加入行為
-- 1. 設定變數
DECLARE @InputCode NVARCHAR(20) = NULL;  -- 沒給值，自動加 10
DECLARE @InputName NVARCHAR(400) = '匯出範本';
DECLARE @StartSort INT;
DECLARE @NewCode NVARCHAR(20);
-- 2. 卡控：檢查是否有重複的名稱 (function_desc)
IF EXISTS (SELECT 1 FROM tblBehaviorType WHERE function_desc = @InputName)
BEGIN
    PRINT '警告：名稱「' + @InputName + '」已存在，取消寫入。';
END
ELSE
BEGIN
    -- 3. 同時抓取目前的 sort 最大值與 function_code 最大值
    SELECT
        @StartSort = ISNULL(MAX(CAST(sort AS INT)), 0),
        @NewCode = ISNULL(MAX(CAST(function_code AS INT)), 0)
    FROM tblBehaviorType;
    -- 4. 判斷 function_code：有給就用給的，沒給就目前的 +10
    SET @NewCode = ISNULL(@InputCode, CAST(@NewCode + 10 AS NVARCHAR(20)));
    -- 5. 執行寫入
    INSERT INTO tblBehaviorType (
        function_code,
        function_desc,
        sort,
        CRT_Date,
        CRT_USR_No,
        CRT_USR_Name
    )
    VALUES (
        @NewCode,
        @InputName,
        @StartSort + 1,
        GETDATE(),
        '2400215',
        N'Leo'
    );
    PRINT '成功：名稱「' + @InputName + '」已新增，Code 為 ' + @NewCode;
END
----------------------------------------------------------------
-- 2. 作業新增行為
INSERT INTO tblPrivilegeBehavior (
    prog_no,
    function_code,
    IsEnable,
    CRT_Date,
    CRT_USR_No,
    CRT_USR_Name
)
VALUES
    ('tls52040', '110', 'Y', GETDATE(), '2400215', N'Leo');
----------------------------------------------------------------
-- 3. 新增作業
INSERT INTO SYS5000 (
    prog_no,
    prog_id,
    prog_name,
    prog_up,
    module_no,
    sub_module_no,
    prog_ispage,
    prog_stopflag,
    prog_sort
)
VALUES (
    'TLS51140',
    '25100',
    N'自營專櫃收銀扣庫維護作業',
    'TLS51000',
    'TLS',
    'TLS50000',
    'Y',
    'N',
    50.6192
);
