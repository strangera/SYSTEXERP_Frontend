import { CRUDStatus } from './../../../../shared/models/system/CRUDstatus';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CrudModeService {
  // 接收 crudstatus 並提供模式判斷
  private crudstatus: CRUDStatus = CRUDStatus.Edit; // 預設為 Edit，可根據需要修改

  // 設置當前 CRUD 狀態
  setCrudStatus(status: CRUDStatus): void {
    this.crudstatus = status;
  }

  // 取得當前 CRUD 狀態
  getCrudStatus(): CRUDStatus {
    return this.crudstatus;
  }

  // 判斷是否為唯讀模式
  get isReadOnlyMode(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  // 判斷是否為編輯模式
  get isEditMode(): boolean {
    return this.crudstatus === CRUDStatus.Edit;
  }

  // 判斷是否為新增模式
  get isCreateMode(): boolean {
    return this.crudstatus === CRUDStatus.Create;
  }
}
