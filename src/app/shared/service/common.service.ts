import { HttpBackend, HttpClient, } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, } from 'rxjs';
import { formatDate, registerLocaleData } from '@angular/common';
import zhHant from '@angular/common/locales/zh-Hant';
import { environment } from '../../../environments/environment';
registerLocaleData(zhHant, 'zh-Hant-TW');

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  BaseUrl = environment.BaseUrl;
  constructor(
    private httpBackend: HttpBackend,
  ) { }

  // get IP Address
  getIPAddress(): Observable<any> {
    const newHttpClient = new HttpClient(this.httpBackend);
    return newHttpClient.get("http://api.ipify.org/?format=json");
    //return new Observable<any>(); // github docs pages
  }
  // get NOW
  getNOW(): any {
    const date = new Date();
    const utc_nowtime = formatDate(date, 'yyyyMMddhhmmss', 'zh-Hant-TW');
    return { "utc_nowtime": utc_nowtime };
  }
}
