import { NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls51080Service } from '@service/api/tls/tls51080.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { apiOption } from '@shared/models/sys/sysb000.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { POS2034 } from '@shared/models/tls/tls000.model';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';

export interface Label {
  id: number,
  PLU_MagNo: string, // 商品管理碼
  PLU_Name: string,// 商品名稱
  Label_Qty: number // 標籤數量
  PLU_SalePrc: number // 商品售價
  PLU_Unit: string,// 商品單位
  PLU_OrgPLUNo: string,// 廠商貨號
  PLU_No: string,// 國際條碼
}


//3.1.4.1  進貨發票建檔作業 CRU
@Component({
  selector: 'app-ass14010-cru',
  templateUrl: './ass14010-cru.component.html',
  styleUrl: './ass14010-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, NgIf, TableEditComponent, TranslateModule]

})
export class ASS14010CRUComponent extends BasicCruPageComponent<POS2034> implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [null], // 主鍵ID，新增時為null，編輯時為存在的ID
    // POS2034 倉庫設定檔
    STO_No: [{ value: null, disabled: true }], // 公司編號/店號
    HOS_No: ['', [Validators.required, Validators.maxLength(10), this.validationService.numberValidator]], // 倉庫代碼 STO_NO+HOS_NO唯一值
    HOS_NAME: ['', [Validators.required, Validators.maxLength(50)]], // 倉庫名稱
    org_id: ['', [Validators.required, Validators.maxLength(20)]], // 部門編號/分店
    building_no: ['', [Validators.maxLength(1), Validators.required]], // 館別
    HOS_Remark: ['', [Validators.maxLength(100)]], // 備註說明
  });
  //
  SYS3100_Options: apiOption[] = [];
  building_noOptions: apiOption[] = [];
  STO_NoOptions: apiOption[] = [];
  // ---------標籤檔 (label) 編輯表格 至少要一筆-------------------------------------------------------
  labelData: Label[] = [];
  labelColumn: EditColumn[] = [
    { field: 'PLU_No', header: '國際條碼', width: '150px', type: 'input' },
    { field: 'PLU_MagNo', header: '商品管理碼' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'Label_Qty', header: '標籤數量', width: '150px', type: 'inputNumber' },
    { field: 'PLU_SalePrc', header: '商品售價' },
    { field: 'PLU_Unit', header: '商品單位' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
  ];
  // ----------------------------------------------------------------
  constructor(
    private tls51080Service: Tls51080Service,
    private validationService: ValidationService,
    private readonly dropDownListService: DropDownListService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('ASS14010', this.dataForm);
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // const formValue = frm.getRawValue();
            // this.tls51080Service.insertTLS51080(formValue).subscribe(() => {
            //   this.messageService.successBubble('新增成功');
            //   this.dataForm.reset();
            // });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // const formValue = frm.getRawValue();
            // this.tls51080Service.updateTLS51080(formValue).subscribe(() => {
            //   this.onCancel();
            // });
          }
          break;
      }
    });
  }

  // 讀取dopropdown選項
  loadOptions() {
    {
      // 組織代碼 下拉
      this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
        this.SYS3100_Options = res.Data.map(item => ({ ...item, Label: `${item.No} - ${item.Name}`, }));
        console.log('SYS3100_Options', this.SYS3100_Options);
      })

      // 館別 下拉
      this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
        this.building_noOptions = res.Data.map(item => ({ ...item, Label: `${item.No} - ${item.Name}`, }));
        console.log('館別', this.building_noOptions);
      })
    }
  }

  //清除明細內容
  clearSubForm() {
    this.labelData = []; // 清空表格資料
  }
}
