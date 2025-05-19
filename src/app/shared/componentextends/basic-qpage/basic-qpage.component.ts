import { FunsrightInfo, PermissionsInfo } from '../../models/system/funsrightInfo';
import { HasPermissionsValue } from '../../directive/has-permission.directive';
import { NavigationExtras, Router } from '@angular/router';
import { CRUDStatus } from '../../models/system/CRUDstatus';
import { ReportHead } from '../../models/ReportHead';
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
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  // 查詢
  // ----------------------------------------------------------------
  loading = false;
  submitted = false;
  reportHead: ReportHead = { outputvisible: true };   //報表表頭(預設匯出顯示資料)
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
