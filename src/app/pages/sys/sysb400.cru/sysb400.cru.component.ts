import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// Shared
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';
import { Sysb300Service } from '../../../service/api/sys/sysb300.service';
import { Sysb400Service } from '../../../service/api/sys/sysb400.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { apiOption, option, Sysb400m } from '../../../shared/models/sys/sysb000.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

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
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    NgIf,
    TranslateModule,
  ],
})
// 組織碼設定作業 CRU
export class SYSB400CRUComponent
  extends BasicCruPageComponent<Sysb400m>
  implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // SYS3100 組織碼設定作業
    id: [], // ID
    org_id: ['', [Validators.required, Validators.maxLength(6), this.validationService.noChineseValidator]], // 組織代碼
    org_name: ['', [Validators.required, Validators.maxLength(40)]], // 組織名稱
    p_org_id: ['', [Validators.required, Validators.maxLength(20), this.validationService.noChineseValidator]], // 上層組織代碼
    level_id: ['', [Validators.required, Validators.maxLength(2)]], // 組織階層代碼
    p_level_id: ['', [Validators.required, Validators.maxLength(2), this.validationService.noChineseValidator]], // 上層組織階層代碼
    p_level_name: ['', [Validators.maxLength(40)]], // 上層組織階層名稱
    stop_flag: ['N', [Validators.required, Validators.maxLength(1)]], // 是否停用
    CanDel: [false], // 是否可刪除
  });
  showConfirm = false;

  isFirstLevelChange = true; // 上層組織變動鎖定

  raw_org_Option: orgOption[] = []; // 原始資料（永不變動）
  upgroup_Options: apiOption[] = [];
  filtered_p_level_Options: apiOption[] = [];   //依據組織階層代碼 動態變化的 上層組織階層代碼
  // 0806新增 組織階層代碼 (篩選)
  filteredUpgroupOptions: apiOption[] = [];
  filteredOptions: apiOption[] = [];
  org_Option: orgOption[] = [];
  whetherOptions: option[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  // ----------------------------------------------------------------

  constructor(
    private sysb400Service: Sysb400Service,
    private sysb300Service: Sysb300Service,
    private validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB400', this.dataForm);
    console.log('表單', this.dataForm.value);
    this.dataForm.get('p_level_id')?.disable(); // 上層組織階層代碼/名稱 不可手動更改

    // 不可點選上層組織代碼
    //新增模式的CanDel設定
    if (this.crudstatus == 'Create') {
      this.dataForm.patchValue({
        CanDel: true
      });
    }

    this.loadOptions();

    // 監聽 [組織階層 level_id] 的變化，自動篩選[上層組織階層]選項
    this.dataForm.controls.level_id.valueChanges.subscribe((levelId) => {
      if (levelId) {
        // 篩選 upgroup_Options：No <= level_id
        this.filteredOptions = this.upgroup_Options.filter(opt => parseInt(opt.No, 10) < parseInt(levelId, 10));

        // console.log('篩選檢查',this.filteredOptions);

        // 如果目前選的 p_level_id 比新的 level_id 大，清空
        const currentPLevel = this.dataForm.controls.p_level_id.value;
        if (currentPLevel && parseInt(currentPLevel, 10) > parseInt(levelId, 10)) {
          this.dataForm.controls.p_level_id.setValue('');
        }

        //選到'全公司'都設null
        if(levelId ==='10'){
          this.dataForm.get('p_level_id')?.setValue('');
          this.dataForm.get('p_org_id')?.setValue('');
          this.dataForm.controls.p_level_id.disable();
          this.dataForm.controls.p_org_id.disable();
        }else{
          this.dataForm.controls.p_level_id.enable();
          this.dataForm.controls.p_org_id.enable();
        }
        
      } else {
        // level_id 清空時，恢復完整選項
        this.filteredOptions = [...this.upgroup_Options];
        this.dataForm.controls.p_level_id.setValue('');
      }
    });

    // 監聽 [上層組織階層(p_level_id)] 的變化，自動篩選 [上層組織(org_Option)]
    this.dataForm.controls.p_level_id.valueChanges.subscribe((pLevelId) => {
      if (pLevelId) {
        // 篩選 org_Option：Level 與 p_level_id 相同
        this.org_Option = this.raw_org_Option.filter(item => item.Level === pLevelId);

        // 啟用上層組織代碼欄位
        this.dataForm.controls.p_org_id.enable();
        if (this.crudstatus === 'Read') {
          this.dataForm.controls.p_org_id.disable();
        }
      } else {
        // p_level_id 清空時，清空 org_Option 與 p_org_id
        this.org_Option = [...this.raw_org_Option];
        this.dataForm.controls.p_org_id.setValue('');
        this.dataForm.controls.p_org_id.disable();
      }

      // ✅ 使用者變更時清空已選擇的 p_org_id
      if (!this.isFirstLevelChange) {
        this.dataForm.get('p_org_id')?.setValue('');
      }
      this.isFirstLevelChange = false;
    });
  }

  loadOptions(): Promise<void> {
    return new Promise((resolve) => {
      let upgroupLoaded = false;
      let orgLoaded = false;

      this.sysb300Service.querySYSB300_DropDownList({}).subscribe((response) => {
        this.upgroup_Options = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        // ✅ 根據 新增模式 忽略「全公司」的項目
        this.filteredUpgroupOptions = this.crudstatus === 'Create'
          ? this.upgroup_Options.filter(opt => opt.No !== '10')
          : [...this.upgroup_Options];

        upgroupLoaded = true;
        if (upgroupLoaded && orgLoaded) resolve();
      });

      const query_org = {
        level_id: '',
        org_id: '',
        org_name: '',
        pageSize: 1000,
        pageIndex: 0,
        SortBy: [{ field: 'org_id', order: 1 }],
      };

      this.sysb400Service.querySYSB400(query_org).subscribe((response) => {
        this.org_Option = this.raw_org_Option = response.Data.map((item: Sysb400m) => ({
          No: item.org_id,
          Name: item.org_name,
          Level: item.level_id,
          Label: item.org_id + '-' + item.org_name,
        }));
        orgLoaded = true;
        if (upgroupLoaded && orgLoaded) resolve();
      });
    });
  }

  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      console.log('送出', formValue);

      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.sysb400Service.insertSYSB400(formValue).subscribe(() => {
              this.messageService.successBubble('新增成功');
              // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
              this.dataForm.reset(); // 重置表單
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.sysb400Service.updateSYSB400(formValue).subscribe(() => {
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
