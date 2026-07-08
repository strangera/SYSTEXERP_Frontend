// 用途：從 SYS1000 資料表重新拉取快照，更新 reference/sys1000.json，
// 供人工/Claude 比對「頁面內寫死的下拉選項是否應改用 getSYS1000Options()」使用。
// 此檔案不在 src/assets 內，不會被 ng build 打包進正式產物，純開發輔助工具。
//
// 用法（擇一提供身分，都不提供的話會互動詢問帳號密碼）：
//   1) 已有 AccessToken（從瀏覽器登入後 DevTools > Application > Local Storage > UserInfo.AccessToken 複製）：
//        node sync-sys1000.js --token=<AccessToken>
//        或設定環境變數 TSRD_TOKEN
//
//   2) 提供帳密，腳本自動走登入流程換取 AccessToken（等同在網頁登入一次）：
//        node sync-sys1000.js --code=<員工編號> --password=<密碼>
//        或設定環境變數 TSRD_CODE / TSRD_PASSWORD
//
//   3) 什麼都不帶：直接執行 npm run sync:sys1000，腳本會在終端機互動詢問員工編號與密碼
//      （密碼輸入不回顯），僅用於當次登入，不會寫進任何檔案。
//
//   --url=<ApiUrl> / TSRD_API_URL 可選，不指定時自動讀取 src/environments/environment.ts 目前的 ApiUrl。
//
// 注意：帳密/Token 只存在於當次執行的記憶體中，腳本不會把它們寫進任何檔案或印到 console，
// 若要用環境變數/參數方式提供，不要把帳密寫死在程式碼或 commit 進 git（例如放進 .env 檔要記得加進 .gitignore）。

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

// 與後端 BasicEIP_Core/Security/Const.cs 的 PasswordKey 一致 —
// 兩邊原始碼皆已明碼存放此值，非執行期機密。
const PASSWORD_KEY = '8a9zx@a1231sdl!aafohc.u';

function getArg(name, envName) {
  const prefix = `--${name}=`;
  const fromArgv = process.argv.find((a) => a.startsWith(prefix));
  if (fromArgv) return fromArgv.slice(prefix.length);
  return process.env[envName];
}

// 帳號 + 密碼互動輸入，共用同一個 readline interface 並用 async iterator 逐行讀取
// （用兩次 rl.question() 在非 TTY/管線輸入情境下，第二次呼叫常因 stream 已經 EOF/close
// 而永遠讀不到輸入；async iterator 沒有這個競態問題，TTY 情境下行為也一致）。
// 密碼輸入時（TTY 環境下）不回顯字元。
async function promptCredentials({ needCode, needPassword }) {
  const isTTY = !!process.stdin.isTTY;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: isTTY });
  let muted = false;

  if (isTTY) {
    const originalWrite = rl._writeToOutput.bind(rl);
    rl._writeToOutput = (str) => {
      if (muted && str !== '\r\n' && str !== '\n') return;
      originalWrite(str);
    };
  }

  const lineIterator = rl[Symbol.asyncIterator]();
  const nextLine = async (query) => {
    process.stdout.write(query);
    const { value, done } = await lineIterator.next();
    return done ? '' : value.trim();
  };

  try {
    let code = '';
    let password = '';
    if (needCode) {
      code = await nextLine('員工編號: ');
    }
    if (needPassword) {
      muted = true;
      password = await nextLine('密碼: ');
      muted = false;
      if (isTTY) process.stdout.write('\n');
    }
    return { code, password };
  } finally {
    rl.close();
  }
}

function pad(n, len) {
  return String(n).padStart(len, '0');
}

// 對應 EncryptionService.buildKeyIV 的 yyyyMMddHHmmss（本機時區數值，非 UTC 轉換）
function buildNowTime(date) {
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1, 2) +
    pad(date.getDate(), 2) +
    pad(date.getHours(), 2) +
    pad(date.getMinutes(), 2) +
    pad(date.getSeconds(), 2)
  );
}

// 送給後端 X-TransactionTime 的字串：故意不帶時區資訊，
// 讓 C# DateTime.TryParse 直接保留相同的年月日時分秒數值（Kind=Unspecified），
// 重新格式化成 yyyyMMddHHmmss 後才會跟 buildNowTime() 算出來的值一致。
function buildTransactionHeader(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}T${pad(
    date.getHours(),
    2
  )}:${pad(date.getMinutes(), 2)}:${pad(date.getSeconds(), 2)}`;
}

// 對應 EncryptionService.getPassword() / buildKeyIV()
function encryptPassword(code, password) {
  const now = new Date();
  const nowTime = buildNowTime(now);
  const keyStr = (code + nowTime + PASSWORD_KEY).padEnd(32, ' ').slice(0, 32);
  const ivStr = nowTime.padEnd(16, ' ').slice(0, 16);

  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(keyStr, 'utf8'), Buffer.from(ivStr, 'utf8'));
  const encrypted = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);

  return {
    encryptedPassword: encrypted.toString('base64'),
    transactionTimeHeader: buildTransactionHeader(now),
  };
}

// 對應 AuthService.login()：POST /User/userLogin 換取 AccessToken
async function login(apiUrl, code, password) {
  const { encryptedPassword, transactionTimeHeader } = encryptPassword(code, password);

  const res = await fetch(`${apiUrl}/User/userLogin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-TransactionTime': transactionTimeHeader,
    },
    body: JSON.stringify({ code, password: encryptedPassword, client_ip: '127.0.0.1' }),
  });

  if (!res.ok) {
    throw new Error(`登入 API 回應失敗: HTTP ${res.status}`);
  }

  const body = await res.json();
  if (body.Status !== '0000' || !body.Data?.AccessToken) {
    throw new Error(`登入失敗: ${body.Message || body.Error?.Message || '未知錯誤（帳密或加密金鑰可能不一致）'}`);
  }

  return body.Data.AccessToken;
}

function resolveApiUrl() {
  const explicit = getArg('url', 'TSRD_API_URL');
  if (explicit) return explicit;

  try {
    const envFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'environments', 'environment.ts'), 'utf8');
    const match = envFile.match(/ApiUrl:\s*'([^']+)'/);
    if (match) {
      console.log(`未指定 --url，使用 src/environments/environment.ts 目前作用中的 ApiUrl: ${match[1]}`);
      return match[1];
    }
  } catch {
    // 讀不到就往下用預設值
  }

  console.log('未指定 --url 且無法從 environment.ts 解析，改用預設值 http://localhost:5142');
  return 'http://localhost:5142';
}

async function resolveToken(apiUrl) {
  const explicitToken = getArg('token', 'TSRD_TOKEN');
  if (explicitToken) return explicitToken;

  let code = getArg('code', 'TSRD_CODE');
  let password = getArg('password', 'TSRD_PASSWORD');

  if (!code || !password) {
    console.log('未提供 --token，也未完整提供 --code/--password，改為互動輸入（僅本次執行使用，不會被儲存）:');
    const prompted = await promptCredentials({ needCode: !code, needPassword: !password });
    code = code || prompted.code;
    password = password || prompted.password;
  }

  if (!code || !password) return null;

  console.log('登入取得 AccessToken 中...');
  return login(apiUrl, code, password);
}

const OUTPUT_DIR = path.join(__dirname, 'reference');
const DATA_FILE = path.join(OUTPUT_DIR, 'sys1000.json');
const META_FILE = path.join(OUTPUT_DIR, 'sys1000.meta.json');

async function main() {
  const apiUrl = resolveApiUrl();
  const token = await resolveToken(apiUrl);

  if (!token) {
    console.error('未取得 AccessToken（互動輸入時帳號或密碼為空），請重新執行並輸入帳密，');
    console.error('或改用 --token=<AccessToken>（或環境變數 TSRD_TOKEN）直接帶入既有 token。');
    process.exit(1);
  }

  const res = await fetch(`${apiUrl}/User/queryAllSystemCode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    throw new Error(`API 回應失敗: HTTP ${res.status}`);
  }

  const body = await res.json();
  if (body.Status !== '0000' || !Array.isArray(body.Data)) {
    throw new Error(`API 回應內容異常，Status=${body.Status}`);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(body.Data, null, 2), 'utf8');

  const meta = {
    source: `${apiUrl}/User/queryAllSystemCode`,
    snapshotDate: new Date().toISOString(),
    recordCount: body.Data.length,
    note:
      "此檔案僅供靜態比對「寫死下拉是否對應 SYS1000」使用，非執行期資料源。執行期真實資料來自 SystemDataService（登入後打 /User/queryAllSystemCode，存入 localStorage['SYS1000']）。過時只影響比對判斷的準確度，不影響已轉換程式（呼叫 getSYS1000Options()）的正確性。",
  };
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2), 'utf8');

  console.log(`已更新 ${DATA_FILE}（共 ${body.Data.length} 筆），快照時間 ${meta.snapshotDate}`);
}

main().catch((err) => {
  console.error('同步失敗:', err.message);
  process.exit(1);
});
