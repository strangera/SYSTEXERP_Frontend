const fs = require("fs");
const path = require("path");

// 取得當前時間和格式化的日期字串 (例如: 2025/12/05_15:15:00)
const now = new Date();
const formattedDate = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getDate().toString().padStart(2, "0")} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
// 或是使用 Git Commit Hash 來作為版本號 (如果需要的話)
const commitHash = require("child_process")
  .execSync("git rev-parse --short HEAD")
  .toString()
  .trim();

const targetProdFile = path.join(
  __dirname,
  "src",
  "environments",
  "environment.prod.ts",
);

const targetSystexFile = path.join(
  __dirname,
  "src",
  "environments",
  "environment.systex.ts",
);

const versionPlaceholder = "@@BUILD_VERSION@@";
let newVersion = `${formattedDate}`;
newVersion = `${formattedDate}-v${commitHash}`; // 如果使用 Git Commit Hash 來作為版本號
try {
  const filesToUpdate = [targetProdFile, targetSystexFile];
  filesToUpdate.forEach((filePath) => {
    let content = fs.readFileSync(filePath, "utf8");
    // 替換佔位符
    content = content.replace(versionPlaceholder, newVersion);
    fs.writeFileSync(filePath, content, "utf8");
  });

  console.log(`Environment 版本更新為: ${newVersion}`);
} catch (error) {
  console.error("版本寫入失敗:", error.message);
  process.exit(1);
}
