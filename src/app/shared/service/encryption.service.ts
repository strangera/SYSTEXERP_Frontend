import { Injectable } from "@angular/core";
import * as CryptoJS from 'crypto-js';
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class EncryptionService {

  constructor() { }

  // MD5加密
  hashMD5(str: string) : string{
    return CryptoJS.MD5(str).toString();
  }

  // 3DES 加密
  encryptTripleDES(str: string, key: string = environment.PasswordKey , iv: string = environment.PasswordIV): string {
    const keyHex = CryptoJS.enc.Utf8.parse(key);
    const encrypted = CryptoJS.TripleDES.encrypt(str, keyHex, {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.toString();
  }

  //3DES解密
  decryptTripleDES(encrypted: string, key: string = environment.PasswordKey, iv: string = environment.PasswordIV): string {
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var ivHex = CryptoJS.enc.Utf8.parse(iv);
    var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
      keySize: 128 / 4,
      iv: ivHex,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
