-- ==============================================================================
-- 參數組：Status (狀態) - 修正為 檢查 SYS_Type 是否存在
-- ==============================================================================
DECLARE @Status_SYS_Type NVARCHAR(50) = 'Status';
DECLARE @Status_CRT_USR_No NVARCHAR(50) = 'SYSTEX';
DECLARE @Status_CRT_USR_Name NVARCHAR(100) = N'Leo';
DECLARE @Status_InsertCount INT = 0;

-- 步驟一：定義並集中要插入的多組參數
DECLARE @ParamsToInsert TABLE (
    SYS_Code NVARCHAR(50),
    SYS_Name NVARCHAR(100),
    SYS_Sort DECIMAL(18, 2)
);

--  Status 參數配置區塊
INSERT INTO @ParamsToInsert (SYS_Code, SYS_Name, SYS_Sort) VALUES
('0', N'未繳票', 1.00),
('1', N'已繳票', 2.00),
('2', N'已退票', 3.00),
('3', N'封存', 4.00);
--------------------------------------

-- 步驟二：執行預檢查 (僅檢查 SYS_Type 是否已存在)
-- 只要找到任何一筆 SYS_Type = 'Status' 的記錄，就認為已存在。
IF NOT EXISTS (
    SELECT 1
    FROM SYS1000
    -- 假設資料庫定序已滿足您對大小寫的需求，這裡只比對 SYS_Type
    WHERE SYS_Type = @Status_SYS_Type
)
BEGIN
    -- 檢查通過：該 SYS_Type 尚未存在，執行完整插入
    INSERT INTO SYS1000 (SYS_Type, SYS_Code, SYS_Name, SYS_Sort, CRT_Date, CRT_USR_No, CRT_USR_Name, UPD_Date, UPD_USR_No, UPD_USR_Name)
    SELECT @Status_SYS_Type, P.SYS_Code, P.SYS_Name, P.SYS_Sort, GETDATE(), @Status_CRT_USR_No, @Status_CRT_USR_Name, NULL, NULL, NULL
    FROM @ParamsToInsert AS P;

    SET @Status_InsertCount = @@ROWCOUNT;

    -- 回應訊息 (操作結果)
    SELECT N'成功插入新的系統參數' AS Result_Type, @Status_SYS_Type AS SYS_Type, @Status_InsertCount AS Inserted_Count, N'成功插入 ' + CAST(@Status_InsertCount AS NVARCHAR(10)) + N' 筆新記錄。' AS Message;
END
ELSE
BEGIN
    -- 檢查失敗：該 SYS_Type 已存在，跳過整個批次插入
    -- 回應訊息 (操作結果)
    SELECT
        N'跳過全部插入' AS Result_Type,
        @Status_SYS_Type AS SYS_Type,
        0 AS Inserted_Count,
        N'系統參數 ' + @Status_SYS_Type + N' 已存在於 SYS1000 中，跳過所有插入操作。' AS Message;
END

-- ==============================================================================
-- 步驟四：驗證查詢 (不論成功或失敗，皆顯示最終數據)
-- ==============================================================================
SELECT
    '--- 驗證查詢結果 ---' AS Verification_Header,
    SYS_Type,
    SYS_Code,
    SYS_Name,
    SYS_Sort,
    CRT_Date,
    CRT_USR_Name
FROM SYS1000
WHERE SYS_Type = @Status_SYS_Type
ORDER BY SYS_Sort, SYS_Code;

GO
