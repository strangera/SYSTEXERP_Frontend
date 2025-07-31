@echo off
chcp 65001 >nul
echo 🚀 開始建置 Angular 專案...
call ng build --configuration production --base-href /tsrdweb/

if %errorlevel% neq 0 (
    echo ❌ Build 失敗，停止部署。
    pause
    exit /b %errorlevel%
)

echo ✅ 建置完成，開始複製檔案到 \\10.3.11.2\tsrdweb ...
xcopy /E /Y /I "dist\tsrderp-frontend\browser" "\\10.3.11.2\tsrdweb"

if %errorlevel% neq 0 (
    echo ❌ 複製失敗！
    pause
    exit /b %errorlevel%
)

echo 🎉 ✅ 部署完成！
echo.
echo 📌 可以關閉視窗或按任意鍵結束。
pause >nul
exit /b 0
