@echo off
chcp 65001 >nul
echo 🚀 開始建置 Angular 專案...
call ng build --configuration production --base-href /TSRDWEB/

if %errorlevel% neq 0 (
    echo ❌ Build 失敗，停止部署。
    pause
    exit /b %errorlevel%
)

echo ✅ 建置完成，準備生成 web.config...

REM 動態產生 web.config 到 dist\tsrderp-frontend\browser
(
    echo ^<?xml version="1.0" encoding="UTF-8"?^>
    echo ^<configuration^>
    echo   ^<system.webServer^>
    echo     ^<rewrite^>
    echo       ^<rules^>
    echo         ^<rule name="Angular Routes" stopProcessing="true"^>
    echo           ^<match url=".*" /^>
    echo           ^<conditions logicalGrouping="MatchAll"^>
    echo             ^<add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" /^>
    echo             ^<add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" /^>
    echo           ^</conditions^>
    echo           ^<action type="Rewrite" url="/TSRDWEB/" /^>
    echo         ^</rule^>
    echo       ^</rules^>
    echo     ^</rewrite^>
    echo     ^<staticContent^>
    echo       ^<mimeMap fileExtension=".webp" mimeType="image/webp" /^>
    echo     ^</staticContent^>
    echo   ^</system.webServer^>
    echo ^</configuration^>
) > "dist\tsrderp-frontend\browser\web.config"

echo 📝 web.config 已產生。

echo ✅ 開始複製檔案到 \\10.3.11.2\tsrdweb ...
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
