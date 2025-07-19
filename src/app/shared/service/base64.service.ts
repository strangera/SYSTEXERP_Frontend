import { Injectable } from "@angular/core";
import { Base64 } from "js-base64";

@Injectable({
  providedIn: "root"
})
export class Base64Service {

  static encode(str: string): string {
    return Base64.encode(str);
  }

  static decode(str: string): string {
    if (Base64Service.isBase64(str)) {
      return Base64.decode(str);
    }
    return str;
  }

  private static isBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  }
}
