// !!! 不使用
import { FunsrightInfo } from '../../models/system/funsrightInfo';
import { NavigationExtras, Router } from '@angular/router';
import { CRUDStatus } from '../../models/system/CRUDstatus';
import { UserInfo } from '../../models/system/userInfo';

export class BasicQpageComponent {
  // Page No
  // ----------------------------------------------------------------
  ProgNo = '900001';
  cruPage = '';
  user?: UserInfo | null;
  // 權限
  // ----------------------------------------------------------------
  funInfo?: FunsrightInfo;
  // 查詢
  // ----------------------------------------------------------------
  loading = false;
  submitted = false;
  // 權限
  // ----------------------------------------------------------------
  canQuery(): boolean {
    return true
    // return true;
  }
  canAdd(): boolean {
    return true
    // return true;
  }
  canEdit(): boolean {
    return true
    // return true;
  }
  // 傳送的資料
  // ----------------------------------------------------------------
  navigateWithState(router: Router, crudstatus: CRUDStatus, rowdata?: any, pageroute?: string) {
    const extras: NavigationExtras = {
      state: {
        crudstatus: crudstatus,
        rowdata: rowdata,
      },
    };

    router.navigate([pageroute], extras);
  }
}
