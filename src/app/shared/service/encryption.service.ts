import { Injectable } from "@angular/core";
import * as CryptoJS from 'crypto-js';
import { environment } from "../../../environments/environment";
import { formatDate } from "@angular/common";

@Injectable({
  providedIn: "root"
})
export class EncryptionService {
  // 3DES 加密
  encryptTripleDES(str: string, key: string = environment.PasswordKey, iv: string = environment.PasswordIV): string {
    const keyHex = CryptoJS.enc.Utf8.parse(key);
    const ivHex = CryptoJS.enc.Utf8.parse(iv);
    const encrypted = CryptoJS.TripleDES.encrypt(str, keyHex, {
      iv: ivHex,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.toString();
  }
  getPassword(no: string, password: string) {
    const date = new Date();
    const utc_nowtime = formatDate(date, 'yyyyMMddhhmmss', 'zh-Hant-TW');
    const now = { "utc_nowtime": utc_nowtime };
    const key = `${no}${now.utc_nowtime}${environment.PasswordKey}`.substring(0, 16);
    password = this.encryptTripleDES(password as string, key, now.utc_nowtime);
    return password;
  }
  // 3DES 解密
  decryptTripleDES(encrypted: string, key: string = environment.PasswordKey, iv: string = environment.PasswordIV): string {
    const keyHex = CryptoJS.enc.Utf8.parse(key);
    const ivHex = CryptoJS.enc.Utf8.parse(iv);
    const decrypted = CryptoJS.TripleDES.decrypt(encrypted, keyHex, {
      iv: ivHex,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
