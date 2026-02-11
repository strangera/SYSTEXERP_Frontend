import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Bas1000Service } from '../../../service/api/sys/bas1000.service';
import { Sysb900DropdownService } from '../../../service/api/sys/sysb900-dropdown.service';
import { Sysb800DropdownService } from '../../../service/api/sys/sysb800-dropdown.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextareaComponent } from '../../../shared/componentkit/input-textarea/input-textarea.component';
import { NgIf } from '@angular/common';
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
  styleUrl: './sysb920.cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, InputTextareaComponent, NgIf, TranslateModule]
})
// 小分類維護作業 CRU
export class SYSB920CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit {
  optionsBig: { value: string, label: string }[] = [];
  optionsMid: { value: string, label: string }[] = [];
  dataForm = this.formBuilder.nonNullable.group({
    id: [0], // ID
    bus_sclass: ['', [Validators.required, Validators.maxLength(2)]], // 小分類代碼
    bus_sclass_name: ['', [Validators.required, Validators.maxLength(40)]], // 小分類名稱
    bus_type: ['', [Validators.required]], // 大分類代碼
    bus_class: ['', [Validators.required]], // 中分類代碼
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
    this.initializePage('SYSB920', this.dataForm);

    // 載入大分類選項
    this.Sysb800DropdownService.getSystemTypes().subscribe({
      next: (response) => {
        this.optionsBig = response;

        // 檢查 bus_type 是否有初始值（例如編輯模式）
        const initialBusType = this.dataForm.controls.bus_type.value;
        if (initialBusType) {
          this.loadMidCategories(initialBusType);
        }
      },
      error: (error) => {
        console.error('獲取大分類代碼失敗:', error);
        this.messageService.errorBubble('無法載入大分類代碼，請稍後重試');
      }
    });

    // 監聽 bus_type 變化
    this.dataForm.controls.bus_type.valueChanges.pipe(debounceTime(300)).subscribe(busType => {
      if (busType) {
        this.loadMidCategories(busType);
      } else {
        this.optionsMid = [];
        this.dataForm.controls.bus_class.setValue('');
      }
    });
  }

  private loadMidCategories(busType: string): void {
    this.Sysb900DropdownService.getSystemTypesByBustype([busType]).subscribe({
      next: (response) => {
        this.optionsMid = response;
        if (response.length === 0) {
          this.messageService.warnBubble('無可用中分類選項，請選擇其他大分類');
          this.dataForm.controls.bus_class.setValue('');
        } else {
          // 檢查當前 bus_class 是否有效
          const currentBusClass = this.dataForm.controls.bus_class.value;
          if (currentBusClass && !response.find(opt => opt.value === currentBusClass)) {
            this.dataForm.controls.bus_class.setValue('');
            this.messageService.warnBubble('當前中分類無效，已重置');
          }
        }
      },
      error: (error) => {
        console.error('獲取中分類代碼失敗:', error);
        this.messageService.errorBubble('無法載入中分類代碼，請稍後重試');
        this.optionsMid = [];
        this.dataForm.controls.bus_class.setValue('');
      }
    });
  }
  onSubmit(frm: FormGroup) {
    const formValue = frm.getRawValue();
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // 待實現：調用 API 進行新增
            this.apiService.insertSYSB920(formValue).subscribe((response: any) => {
              this.messageService.successBubble('新增成功');
              this.dataForm.reset();
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // 待實現：調用 API 進行更新
            this.apiService.updateSYSB920(formValue).subscribe((response: any) => {
              this.messageService.successBubble('更新成功');
              this.onCancel();
            });
          }
          break;
      }
    });
  }
}
