import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { TranslateService } from '@ngx-translate/core';
import { Sysb800DropdownService } from '../../../service/api/sys/sysb800-dropdown.service';
import { Sysb900DropdownService } from '../../../service/api/sys/sysb900-dropdown.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Bas1000Service } from '../../../service/api/sys/bas1000.service';
import { debounceTime } from 'rxjs';

// 資料模型：分類項目
interface CategoryItem {
  id: number;
  bus_type: string; //大分類代碼
  bus_type_name: string; //大分類名稱
  bus_class: string; //中分類(中分類)代碼
  bus_class_name: string; //中分類(中分類)名稱
  bus_sclass: string; //小分類代碼
  bus_sclass_name: string; //小分類名稱
  bus_sclass_desc: string; //備註
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

@Component({
  selector: 'app-sysb920.cru',
  templateUrl: './sysb920.cru.component.html',
  styleUrl: './sysb920.cru.component.scss'
})
// 小分類維護作業 CRU
export class SYSB920CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit {
  optionsBig: { value: string, label: string }[] = [];
  optionsMid: { value: string, label: string }[] = [];
  dataForm = this.formBuilder.nonNullable.group({
    id: [0], // ID
    bus_sclass: ['', [Validators.maxLength(2)]], // 小分類代碼
    bus_sclass_name: ['', [Validators.maxLength(40)]], // 小分類名稱
    bus_type: [''], // 大分類代碼
    bus_class: [''], // 中分類代碼
    bus_sclass_desc: ['', [Validators.maxLength(200)]], // 備註
  });
  //
  industryTypeOptions: any[] = [];
  productTypeOptions: any[] = [];
  // ----------------------------------------------------------------
  constructor(
    private translate: TranslateService,
    private apiService: Bas1000Service,
    private Sysb800DropdownService: Sysb800DropdownService,
    private Sysb900DropdownService: Sysb900DropdownService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // this.ProgNo = '410009';
    this.initializePage('SYSB920', this.dataForm);
    this.Sysb800DropdownService.getSystemTypes().subscribe({
      next: (response) => {
        this.optionsBig = response;
      },
      error: (error) => {
        console.error('獲取大分類代碼失敗:', error);
        this.messageService.errorBubble('無法載入大分類代碼，請稍後重試');
      }
    });


    // // 監聽 變化，動態載入中分類代碼
    // this.dataForm.controls.bus_type.valueChanges.pipe(debounceTime(300)).subscribe(busType => {
    //   if (busType) {
    //     this.Sysb900DropdownService.getSystemTypesByBustype(busType).subscribe({
    //       next: (response) => {
    //         this.optionsMid = response;
    //         const currentData = this.dataForm.controls.bus_type.value;
    //         if (currentData && !response.find(opt => opt.value === currentData)) {
    //           this.dataForm.controls.bus_type.setValue('');
    //         }
    //       },
    //       error: (error) => {
    //         console.error('獲取中分類代碼失敗:', error);
    //         this.messageService.errorBubble('無法載入中分類代碼，請稍後重試');
    //         this.optionsMid = [];
    //         this.dataForm.controls.bus_class.setValue('');
    //       }
    //     });
    //   } else {
    //     this.optionsMid = [];
    //     this.dataForm.controls.bus_class.setValue('');
    //   }
    // });
  }

  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // 待實現：調用 API 進行新增
            this.apiService.insertSYSB920(frm.value).subscribe((response: any) => {
              this.messageService.successBubble('新增成功');
              this.onCancel(); // 新增成功後返回查詢頁面
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // 待實現：調用 API 進行更新
            this.apiService.updateSYSB920(frm.value).subscribe((response: any) => {
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
}
