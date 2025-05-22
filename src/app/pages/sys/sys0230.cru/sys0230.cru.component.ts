import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormArray, FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { KeyValue } from '@angular/common';
import { TreeNode } from 'primeng/api';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { tblUser } from '../../../shared/models/sys/sysb000.module';

interface Column {
  field: string;
  header: string;
}
// 4-2-2-2 角色之使用者設定維護
@Component({
  selector: 'app-sys0230.cru',
  templateUrl: './sys0230.cru.component.html',
  styleUrl: './sys0230.cru.component.scss',
})
// 角色之使用者設定維護 CRU
export class SYS0230CRUComponent extends BasicCruPageComponent<tblUser>
  implements OnInit {

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [], // ID
    Role_No: ['', [Validators.required, Validators.maxLength(10)]], // 角色代號
    Role_Name: ['', [Validators.required, Validators.maxLength(30)]], // 角色名稱
    Description: ['', [Validators.maxLength(50)]], // 角色註記
  });
  // ----------------------------------------------------------------
  constructor(
    private translate: TranslateService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('SYS0230', this.dataForm);
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // this.sys0210Service.createRole(frm.value).subscribe(() => {
            //   this.messageService.successBubble('新增成功');
            //   this.onCancel(); // 新增成功後返回查詢頁面
            // });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            console.log('frm.value', frm.value);
            // this.sys0210Service.updateRole(frm.value).subscribe(() => {
            //   this.messageService.successBubble('更新成功');
            //   this.onCancel(); // 更新成功後返回查詢頁面
            // });
          }
          break;
      }
    });
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單

  }
  // demo
  // ----------------------------------------------------------------
  files: TreeNode[] = [
    {
      key: '0',
      data: {
        name: '全公司',
        code: '100000',
        count: '0(3)'
      },
      children: [
        {
          key: '0-0',
          data: {
            name: '阮湘晴',
            code: '	0900000001',
          },
        },
        {
          key: '0-1',
          data: {
            name: 'sandy',
            code: 'sandy',

          }
        },
        {
          key: '0-2',
          data: {
            name: '李律民',
            code: 'turn000001',

          }
        }
      ]
    },
    {
      key: '1',
      data: {
        name: '行政服務部',
        code: '107000',
        count: '0(2)'
      },
      children: [
        {
          key: '1-0',
          data: {
            name: '林東賢',
            code: '2014000138',
          }
        },
        {
          key: '1-1',
          data: {
            name: '	陳秋莉',
            code: '	2015000184',
          }
        }
      ]
    },
  ];

  selectionKeys = {}; /* {
    '0-0': {
        partialChecked: false,
        checked: true
    }
  };*/

  cols: Column[] = [
    { field: 'name', header: '部門名稱' },
    { field: 'code', header: '代碼' },
    { field: 'count', header: '使用者數目(部門總人數)' }
  ];
}
