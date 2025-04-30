import { option } from './../module/sysb000.module';
import { Sysb300Service } from './../../../service/sysb/sysb300.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';

@Component({
  selector: 'app-sysb300.cru',
  templateUrl: './sysb300.cru.component.html',
  styleUrl: './sysb300.cru.component.scss',
})
// 組織階層設定作業 CRU
export class SYSB300CRUComponent<Sysb300m>
  extends BasicCrupageComponent
  implements OnInit
{
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // SYS3000 組織階層設定檔
    id: [],
    level_id: ['', [Validators.required, Validators.maxLength(2)]], // 組織階層代碼
    level_name: ['', [Validators.required, Validators.maxLength(30)]], // 組織階層名稱
    p_level_id: [, [Validators.maxLength(2)]], // 上層組織階層代碼(空白代表第一層)
  });
  //
  upgroup_Options: option[] = [
    { value: '', label: '全公司' },
    { value: '10', label: '室/部' },
    { value: '20', label: 'Team' },
    { value: '30', label: '樓/組' },
  ];

  allquery: Sysb300m[] = [];

  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private sysb300Service: Sysb300Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '410003';
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------

    // ----------------------------------------------------------------
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    };

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.crudstatus = CRUDStatus.Edit;
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      // 讀檔
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }
  }
  // ----------------------------------------------------------------
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    //檢查使否已有上層組織
    const query = {
      level_id: '',
      level_name: '',
      p_level_id: '',
    };

    this.sysb300Service.querySYSB300(query).subscribe((response) => {
      this.allquery = response.Data;
      const hasEmptypLevel = this.allquery.some(
        (item: any) => item.p_level_id === '',
      );
      const hasSameLevel = this.allquery.some(
        (item: any) => item.level_id === this.dataForm.controls.level_id.value,
      );
      console.log('上層組織階層存在 空白的單位', hasEmptypLevel);

      if (hasEmptypLevel && this.dataForm.controls.p_level_id.value == '') {
        this.messageService.errorBubble(
          '已有上層組織階層為空白的單位，因此上層組織階層為必填欄位，請選擇上層組織階層',
        );
      } else if (hasSameLevel && this.crudstatus == CRUDStatus.Create) {
        this.messageService.errorBubble(
          '不可新增相同的組織階層代碼，請重新輸入',
        );
      } else {
        switch (this.crudstatus) {
          case CRUDStatus.Create:
            if (this.canAdd()) {
              const insert = {
                level_id: this.dataForm.controls.level_id.value,
                level_name: this.dataForm.controls.level_name.value,
                p_level_id: this.dataForm.controls.p_level_id.value,
              };

              console.log('insert', insert);
              this.sysb300Service.insertSYSB300(insert).subscribe(() => {
                this.messageService.successBubble('新增成功');
                this.onCancel();
              });
            }
            break;
          case CRUDStatus.Edit:
            if (this.canEdit()) {
              const update = {
                id: this.dataForm.controls.id.value,
                level_id: this.dataForm.controls.level_id.value,
                level_name: this.dataForm.controls.level_name.value,
                p_level_id: this.dataForm.controls.p_level_id.value,
              };

              console.log('update', update);
              this.sysb300Service.updateSYSB300(update).subscribe(() => {
                this.messageService.successBubble('更新成功');
                this.onCancel();
              });
            }
            break;
        }
      }
    });

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onCancel() {
    this.router.navigate(['/SYSB000/SYSB300']);
  }
}
