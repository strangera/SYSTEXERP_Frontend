import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Shared
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption, option, Sysb400m } from '../../../shared/models/sys/sysb000.module';
import { Sysb400Service } from '../../../service/API/sys/sysb400.service';
import { Sysb300Service } from '../../../service/API/sys/sysb300.service';

// 組織碼設定作業(包含level)
export interface orgOption {
  No: string;
  Name: string;
  Level?: string;// 組織階層代碼
  Label?: string;
}

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
    org_id: ['', [Validators.required, Validators.maxLength(6)]], // 組織代碼
    org_name: ['', [Validators.required, Validators.maxLength(40)]], // 組織名稱
    p_org_id: ['', [Validators.required, Validators.maxLength(20)]], // 上層組織代碼
    level_id: ['', [Validators.required, Validators.maxLength(2)]], // 組織階層代碼
    p_level_id: ['', [Validators.required, Validators.maxLength(2)]], // 上層組織階層代碼
    p_level_name: ['', [Validators.maxLength(40)]], // 上層組織階層名稱
    stop_flag: ['N', [Validators.required, Validators.maxLength(1)]], // 是否停用
  });
  showConfirm = false;

  raw_org_Option: orgOption[] = []; // 原始資料（永不變動）
  upgroup_Options: apiOption[] = [];
  filtered_p_level_Options: apiOption[] = [];   //依據組織階層代碼 動態變化的 上層組織階層代碼
  org_Option: orgOption[] = [];
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

    // 初始讀取頁面就確認p_level_id的選項
    if (this.dataForm.controls.level_id.value == '' || this.dataForm.controls.level_id.value == null) {
      this.dataForm.controls.p_level_id.disable();
      this.dataForm.controls.p_level_id.setValue('');
    }

    // 監聽組織階層代碼的變化 (決定p_level_id代碼的選項)
    this.dataForm.controls.level_id.valueChanges.subscribe((levelId) => {
      this.handleLevelIdChange(levelId);
    });

    // 監聽組織階層代碼的變化 (決定上p_org_id的選項)
    this.dataForm.controls.p_level_id.valueChanges.subscribe((pLevelId) => {
      if (pLevelId) {
        this.dataForm.controls.p_org_id.enable();
      } else {
        this.dataForm.controls.p_org_id.disable();
        this.dataForm.controls.p_org_id.setValue('');
      }
    });
  }

  // 上層階層內容選項控制
  handleLevelIdChange(levelId: string) {
    console.log('上層階層代碼', levelId);
    if (!levelId) {
      this.filtered_p_level_Options = [];
      this.dataForm.controls.p_level_id.disable();
      this.dataForm.controls.p_level_id.setValue('');
      return;
    }

    // 假設上層階層的編碼比下層小，例如：10 是最上層，20 是中層，30 是底層
    this.filtered_p_level_Options = this.upgroup_Options.filter(
      // (item) => item.No < levelId
      (item) => item.No === (parseInt(levelId, 10) - 10).toString()
    );

    // 先定義 filteredNos
    const filteredNos = this.filtered_p_level_Options.map(item => item.No);

    // 每次都從原始 orgOption 做篩選（避免累積過濾）
    this.org_Option = this.raw_org_Option.filter(item =>
      item.Level && filteredNos.includes(item.Level)
    );

    if (this.filtered_p_level_Options.length > 0) {
      this.dataForm.controls.p_level_id.enable();
    } else {
      this.dataForm.controls.p_level_id.disable();
      this.dataForm.controls.p_level_id.setValue('');
    }
  }

  loadOptions() {
    // 組織階層列表
    this.sysb300Service.querySYSB300_DropDownList({}).subscribe((response) => {
      this.upgroup_Options = response.Data.map((item: apiOption) => ({
        No: item.No,
        Name: item.Name,
        Label: item.No + '-' + item.Name,
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
        Level: item.level_id,
        Label: item.org_id + '-' + item.org_name,
      }));
      this.raw_org_Option = response.Data.map((item: Sysb400m) => ({
        No: item.org_id,
        Name: item.org_name,
        Level: item.level_id,
        Label: item.org_id + '-' + item.org_name,
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
            this.sysb400Service.updateSYSB400(frm.value).subscribe(() => {
              this.messageService.successBubble('更新成功');
              this.onCancel(); // 更新成功後返回查詢頁面
            });
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
