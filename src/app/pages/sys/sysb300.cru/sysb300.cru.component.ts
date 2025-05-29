import { apiOption, Sysb300m } from '../../../shared/models/sys/sysb000.module';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Shared
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Sysb300Service } from '../../../service/API/sys/sysb300.service';

@Component({
  selector: 'app-sysb300.cru',
  templateUrl: './sysb300.cru.component.html',
  styleUrl: './sysb300.cru.component.scss',
})
// 組織階層設定作業 CRU
export class SYSB300CRUComponent
  extends BasicCruPageComponent<Sysb300m>
  implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // SYS3000 組織階層設定檔
    id: [],
    level_id: ['', [Validators.required, Validators.maxLength(2)]], // 組織階層代碼
    level_name: ['', [Validators.required, Validators.maxLength(30)]], // 組織階層名稱
    p_level_id: ['', [Validators.maxLength(2)]], // 上層組織代碼/名稱(空白代表第一層)
    CanDel: [], // 是否可刪除
  });
  //
  upgroup_Options: apiOption[] = [];
  allquery: Sysb300m[] = [];

  // ----------------------------------------------------------------
  constructor(private sysb300Service: Sysb300Service) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('SYSB300', this.dataForm);
    this.loadOptions();

    console.log('dataform', this.dataForm.value);
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

      //分頁查詢
      pageSize: 1000,
      pageIndex: 0,
      SortBy: [{ field: 'level_id', order: 1 }],
    };

    this.sysb300Service.querySYSB300(query).subscribe((response) => {
      this.allquery = response.Data;
      const hasEmptypLevel = this.allquery.some(
        (item: Sysb300m) => item.p_level_id === '',
      );
      const hasSameLevel = this.allquery.some(
        (item: Sysb300m) =>
          item.level_id === this.dataForm.controls.level_id.value,
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
              console.log('insert', frm.value);
              this.sysb300Service.insertSYSB300(frm.value).subscribe(() => {
                this.messageService.successBubble('新增成功');
                // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
                this.dataForm.reset(); // 重置表單
              });
            }
            break;
          case CRUDStatus.Edit:
            if (this.canEdit()) {
              console.log('update', frm.value);
              this.sysb300Service.updateSYSB300(frm.value).subscribe(() => {
                this.messageService.successBubble('更新成功');
                this.onCancel(); // 儲存後，會返回列表
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
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }

  // 讀取dopropdown選項
  loadOptions() {
    {
      this.sysb300Service
        .querySYSB300_DropDownList({})
        .subscribe((response) => {
          this.upgroup_Options = response.Data.map((item: apiOption) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + '-' + item.Name,
          }));
        });
    }
  }
}
