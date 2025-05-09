import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Shared
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption, option, Sysb400m } from '../module/sysb000.module';
import { Sysb400Service } from '../../../service/api/sys/sysb400.service';
import { Sysb300Service } from '../../../service/api/sys/sysb300.service';

@Component({
  selector: 'app-sysb400.cru',
  templateUrl: './sysb400.cru.component.html',
  styleUrl: './sysb400.cru.component.scss',
})
// 組織碼設定作業 CRU
export class SYSB400CRUComponent
  extends BasicCruPageComponent<Sysb400m>
  implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [], // ID
    org_id: ['', [Validators.required, Validators.maxLength(20)]], // 組織代碼
    org_name: ['', [Validators.required, Validators.maxLength(40)]], // 組織名稱
    p_org_id: ['', [Validators.required, Validators.maxLength(20)]], // 上層組織代碼
    level_id: ['', [Validators.required, Validators.maxLength(2)]], // 組織階層代碼
    p_level_id: ['', [Validators.required, Validators.maxLength(2)]], // 上層組織階層代碼
    p_level_name: ['', [Validators.required, Validators.maxLength(40)]], // 上層組織階層名稱
    stop_flag: ['N', [Validators.required, Validators.maxLength(1)]], // 是否停用
  });
  showConfirm = false;

  upgroup_Options: apiOption[] = [];
  org_Option: apiOption[] = [];
  whetherOptions: option[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  // ----------------------------------------------------------------

  constructor(
    private sysb400Service: Sysb400Service,
    private sysb300Service: Sysb300Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB400', this.dataForm);
    this.loadOptions();
  }

  loadOptions() {
    // 組織階層列表
    this.sysb300Service.querySYSB300_DropDownList({}).subscribe((response) => {
      this.upgroup_Options = response.Data.map((item: apiOption) => ({
        No: item.No,
        Name: item.Name,
        Label: item.No + ' ' + item.Name,
      }));
      console.log('組織階層', this.upgroup_Options);
    });

    const query_org = {
      level_id: '',
      org_id: '',
      org_name: '',

      //分頁查詢
      pageSize: 1000,
      pageIndex: 0,
      SortBy: [{ field: 'org_id', order: 1 }],
    };

    this.sysb400Service.querySYSB400(query_org).subscribe((response) => {
      this.org_Option = response.Data.map((item: Sysb400m) => ({
        No: item.org_id,
        Name: item.org_name,
        Label: item.org_id + ' ' + item.org_name,
      }));
      console.log('組織代碼 查詢結果', this.org_Option);
    });
  }

  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.sysb400Service.insertSYSB400(frm.value).subscribe(() => {
              this.messageService.successBubble('新增成功');
              this.onCancel(); // 新增成功後返回查詢頁面
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            console.log('frm.value', frm.value);
            // this.sysb400Service.updateSYSB400(frm.value).subscribe(() => {
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
}
