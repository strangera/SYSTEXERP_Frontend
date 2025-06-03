import { Component, OnInit } from '@angular/core';
import { FormGroup, } from '@angular/forms';
import { Role, TreeData } from '../../../shared/models/sys/role.model';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Sys0210Service } from '../../../service/API/sys/sys0210.service';
import { Column } from '../../../shared/componentkit/table/table.model';

// 4.2.3.1 角色系統權限設定 CRU
@Component({
  selector: 'app-sys0310.cru',
  templateUrl: './sys0310.cru.component.html',
  styleUrls: ['./sys0310.cru.component.scss'],
})
// 角色系統權限設定 CRU
export class SYS0310CRUComponent extends BasicCruPageComponent<Role> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    roleCode: [''], // 角色代碼
    roleName: [''], // 角色名稱
    Description: [''], // 查詢條件
  });
  privilegeBehaviorList: TreeData = [];
  selectedItems: TreeData = [];
  columns: Column[] = [
    { field: 'label', header: '權限名稱' }
  ]
  allIndexes: number[] = [];

  constructor(
    private sys0210Service: Sys0210Service
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('SYS0310', this.dataForm);
    this.sys0210Service.queryRolePrivileges({ Role_No: `${this.rowdata?.Role_No}` }).subscribe({
      next: (response) => {
        this.privilegeBehaviorList = response.Data;
      },
      error: (err) => { // 最好也接收錯誤物件以便調試
        console.error('查詢角色權限失敗：', err);
        this.loading = false;
      },
    });
  }
  onSubmit(frm: FormGroup) {
  }
}
