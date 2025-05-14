import { FunsrightInfo, PermissionsInfo } from '../../models/system/funsrightInfo';
import { CRUDStatus } from '../../enum/CRUDstatus';

export class BasicCrupageComponent {
  // Page No
  // ----------------------------------------------------------------
  ProgNo = '900001';
  // 權限
  // ----------------------------------------------------------------
  funInfo?: FunsrightInfo;
  addPermission = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  editPermission = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  // ----------------------------------------------------------------
  crudstatus: CRUDStatus = CRUDStatus.Read;
  formTitle = '';
  accordionTabCss = 'create-accordionTab';
  showConfirm = false;
  submitted = false;
  // ----------------------------------------------------------------
  get isFormEditable(): boolean {
    return (this.crudstatus === CRUDStatus.Create && this.canAdd()) ||
      (this.crudstatus === CRUDStatus.Edit && this.canEdit());
  }

  get isFormCreateable(): boolean {
    return (this.crudstatus === CRUDStatus.Create && this.canAdd());
  }
  // ----------------------------------------------------------------
  canAdd(): boolean {
    return true
  }

  canEdit(): boolean {
    return true
  }
}
