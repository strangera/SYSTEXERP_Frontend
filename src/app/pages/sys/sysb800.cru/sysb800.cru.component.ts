import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { TranslateService } from '@ngx-translate/core';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Bas1000Service } from '../../../service/api/sys/bas1000.service';

interface CategoryItem {
  id: number;
  bus_type: string;
  bus_type_name: string;
  bus_type_desc: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

@Component({
  selector: 'app-sysb800.cru',
  templateUrl: './sysb800.cru.component.html',
  styleUrl: './sysb800.cru.component.scss'
})
// 業種基本資料維護作業 CRU
export class SYSB800CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    bus_type: ['', [Validators.required, Validators.maxLength(2)]], // 業種代號
    bus_type_name: ['', [Validators.required, Validators.maxLength(40)]], // 業種名稱
    bus_type_desc: ['',], // 備註
  });



  constructor(
    private translate: TranslateService,
    private apiService: Bas1000Service,
    //
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // this.ProgNo = '410007';
    this.initializePage('SYSB800', this.dataForm);

  }

  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // 待實現：調用 API 進行新增
            this.apiService.insertSYSB800(frm.value).subscribe((response: any) => {
              this.messageService.successBubble('新增成功');
              this.onCancel(); // 新增成功後返回查詢頁面
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // 待實現：調用 API 進行更新
            this.apiService.updateSYSB800(frm.value).subscribe((response: any) => {
              this.messageService.successBubble('更新成功');
              this.onCancel(); // 更新成功後返回查詢頁面
            });
          }
          break;
      }
    });
  }

  // 修改：submitForm 調用父類 handleSubmit
  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }
}
