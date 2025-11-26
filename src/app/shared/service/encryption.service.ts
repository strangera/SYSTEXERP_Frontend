import { formatDate } from "@angular/common";
import { Injectable } from "@angular/core";
import CryptoJS from 'crypto-js';
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class EncryptionService {
  buildKeyIV(userID: string, transactionTime: string, constPasswordKey: string) {
    const keyStr = (userID + transactionTime + constPasswordKey).padEnd(32).substring(0, 32);
    const ivStr = transactionTime.padEnd(16).substring(0, 16);
    return {
      key: CryptoJS.enc.Utf8.parse(keyStr),
      iv: CryptoJS.enc.Utf8.parse(ivStr)
    };
  }
  getPassword(no: string, password: string) {
    const date = new Date();
    const utc_nowtime = formatDate(date, 'yyyyMMddhhmmss', 'zh-Hant-TW');
    const { key, iv } = this.buildKeyIV(no, utc_nowtime, environment.PasswordKey);

    const encrypted = CryptoJS.AES.encrypt(password, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString(); // base64
  }
}
