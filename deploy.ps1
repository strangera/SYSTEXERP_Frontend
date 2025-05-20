# 建置
# 設定變數
$projectPath = "C:\Users\2400215.SYSTEX\Desktop\TSRDERP_Frontend" # Angular 專案路徑
$buildPath = "$projectPath\dist\tsrderp-frontend\browser" # Build 產物目錄
$zipFile = "$buildPath.zip"                # 壓縮後的檔案

# 進入 Angular 專案資料夾
cd $projectPath

# 1️⃣ 確保 build 沒有錯誤
Write-Host "🏗️ Building Angular Project..."
ng build --base-href="/TSRDWEB/" --deploy-url="/TSRDWEB/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build Failed!" -ForegroundColor Red
    exit 1
}

# 2️⃣ 壓縮 build 產物，儲存在桌面
Write-Host "📦 Compressing build files..."
Compress-Archive -Path "$buildPath\*" -DestinationPath "$projectPath\TSRDERP_Frontend.zip" -Force
Write-Host "✅ Compress completed"
