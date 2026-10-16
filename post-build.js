const fs = require('fs');
const path = require('path');

// 從命令行參數獲取配置名稱和目標 URL
const configName = process.argv[2];
const rewriteUrl = process.argv[3];

// 確保輸出路徑與 angular.json 中的一致
// 修正點：加上 'browser' 子目錄
const baseOutputPath = 'dist/tsrderp-frontend';
const outputPath = path.join(baseOutputPath, 'browser');

if (!configName || !rewriteUrl) {
  console.error('Usage: node post-build.js <configName> <rewriteUrl>');
  process.exit(1);
}

const templateFileName = 'web.config.template';
const finalFileName = 'web.config';

// 修正點：使用新的 outputPath
const templatePath = path.join(__dirname, outputPath, templateFileName);
const targetPath = path.join(__dirname, outputPath, finalFileName);

try {
  // 1. 讀取模板內容
  let content = fs.readFileSync(templatePath, 'utf8');

  // 2. 替換佔位符
  content = content.replace('@@IIS_REWRITE_URL@@', rewriteUrl);

  // 3. 寫入最終的 web.config
  fs.writeFileSync(targetPath, content, 'utf8');

  // 4. 移除模板檔案
  fs.unlinkSync(templatePath);

  console.log(`[${configName}] web.config 已成功生成!`);
  console.log(`檔案位置: ${targetPath}`);
} catch (error) {
  console.error('生成 web.config 失敗:', error.message);
  console.error(`請確認 ${templatePath} 檔案是否存在。`);
  process.exit(1);
}

// 依打包版本替換 index.html 的 favicon（src/index.html 預設為南紡的 favicon.ico）
const faviconMap = {
  'tsrdweb-systex': 'systex-favicon.ico',
};
const favicon = faviconMap[configName];
if (favicon) {
  const indexPath = path.join(__dirname, outputPath, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');
  if (!html.includes('href="favicon.ico"')) {
    console.error(`[${configName}] index.html 找不到 href="favicon.ico"，favicon 替換失敗`);
    process.exit(1);
  }
  fs.writeFileSync(indexPath, html.replace('href="favicon.ico"', `href="${favicon}"`), 'utf8');
  console.log(`[${configName}] index.html favicon 已替換為 ${favicon}`);
}
