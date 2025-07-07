import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption } from '../../../shared/models/sys/sysb000.module';
import { Fin11010Service } from '../../../service/api/fin/fin11010.service';

// 定義設定狀態枚舉
export enum SettingStatus {
  未確認 = '未確認',
  使用中 = '使用中',
  已過期 = '已過期'
}

// 定義 AddButton 介面
interface AddButton {
  label: string;
  icon: string;
  action: (rowData: any) => void;
  disabled: (rowData: any) => boolean;
}

//1.1.1.1 營業人申報設定 CRU
@Component({
  selector: 'app-fin11010-cru',
  templateUrl: './fin11010-cru.component.html',
  styleUrl: './fin11010-cru.component.scss'
})
export class FIN11010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [null],
    company_no: ['', [Validators.required, Validators.maxLength(8)]], // 公司代號(統一編號)
    business_name: ['', [Validators.required, Validators.maxLength(60)]], // 營業人名稱
    tax_no: ['', [Validators.required, Validators.maxLength(9)]], // 稅籍編號
    owner_name: ['', [Validators.required, Validators.maxLength(12)]], // 負責人姓名
    address: ['', [Validators.required]], // 營業地址
    main_code: ['', [Validators.maxLength(8)]], // 總繳代號
    total_company_no: ['', [Validators.maxLength(8)]], // 總公司統編
    deduct_type: ['', Validators.required], // 是否採直接扣抵法
    declare_method: ['', Validators.required], // 自行或委託辦理申報註記
    agent_name: ['', [Validators.required, Validators.maxLength(12)]], // 代理申報人姓名
    agent_phone: ['', Validators.required], // 代理申報人電話
    agent_license_no: ['', [Validators.maxLength(50)]], // 代理申報人證書(登錄)字號
    declare_month_start: [this.getCurrentMonth(), Validators.required], // 申報年月起
    status: ['未確認'], // 狀態
  });

  mainCodeOptions: apiOption[] = [];
  deductTypeOptions: apiOption[] = [
    { No: 'Y', Name: '是', Label: '是' },
    { No: 'N', Name: '否', Label: '否' }
  ];
  declareMethodOptions: apiOption[] = [
    { No: 'A', Name: '自行申報', Label: '自行申報' },
    { No: 'B', Name: '委託辦理', Label: '委託辦理' }
  ];

  // 表格資料
  recentlyCreatedData: any = null;

  // 表格欄位
  recentColumns = [
    { field: 'company_no', header: '公司代號(統一編號)', visible: true },
    { field: 'business_name', header: '營業人名稱', visible: true },
    { field: 'tax_no', header: '稅籍編號', visible: true },
    { field: 'owner_name', header: '負責人姓名', visible: true },
    { field: 'address', header: '營業地址', visible: true },
    { field: 'main_code', header: '總繳代號', visible: true },
    { field: 'deduct_type', header: '是否採直接扣抵法', visible: true },
    { field: 'total_company_no', header: '總公司統編', visible: true },
    { field: 'declare_method', header: '自行或委託辦理申報註記', visible: true },
    { field: 'agent_name', header: '(代理)申報人姓名', visible: true },
    { field: 'agent_phone', header: '(代理)申報人電話', visible: true },
    { field: 'agent_license_no', header: '代理申報人證書(登錄)字號', visible: true },
    { field: 'declare_month_start', header: '申報年月起', visible: true },
    { field: 'review_date', header: '審核日期', visible: true },
    { field: 'reviewer', header: '審核人員', visible: true },
    { field: 'setting_status', header: '設定狀態', visible: true }
  ];

  // 新增按鈕配置
  addButton: AddButton[] = [
    {
      label: '審核',
      icon: 'pi pi-check-circle text-green-500',
      action: (rowData: any) => { this.onReview(rowData); },
      disabled: (rowData: any) => rowData?.setting_status !== SettingStatus.未確認
    },
    {
      label: '反審核',
      icon: 'pi pi-undo text-orange-500',
      action: (rowData: any) => { this.onUnreview(rowData); },
      disabled: (rowData: any) => rowData?.setting_status !== SettingStatus.使用中
    }
  ];

  constructor(private fin11010Service: Fin11010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11010', this.dataForm);
    if (this.crudstatus === 'Create') {
      this.fin11010Service.getLatestSetting().subscribe(r => {
        // 填入資料，指定狀態與申報年月起
        if (r) {
          this.dataForm.patchValue(r);
          // 以下欄位設不可編輯
          this.setReadOnlyFields();
        }
      });

      // 載入最近新增的資料
      this.fin11010Service.getLatestSetting().subscribe((data) => {
        this.recentlyCreatedData = data;
      });
    }
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;
    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }
    const formValue = frm.getRawValue();
    if (this.crudstatus === 'Create') {
      this.fin11010Service.insertFIN11010(formValue).subscribe(() => {
        this.messageService.successBubble('新增成功');
        this.dataForm.reset();
      });
    }
    this.messageService.unblockUi();
    this.submitted = false;
  }

  loadOptions() {
    this.fin11010Service.getMainCodeOptions().subscribe((response) => {
      this.mainCodeOptions = response.Data.map((item: apiOption) => ({
        No: item.No,
        Name: item.Name,
        Label: `${item.No}-${item.Name}`,
      }));
    });
  }

  setReadOnlyFields() {
    this.dataForm.get('company_no')?.disable();
    this.dataForm.get('business_name')?.disable();
    this.dataForm.get('tax_no')?.disable();
    this.dataForm.get('main_code')?.disable();
    this.dataForm.get('declare_method')?.disable();
    this.dataForm.get('main_code')?.disable();
  }

  getCurrentMonth(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份從0開始，所以要加1
    return `${year}-${month}`;
  }

  // 審核功能
  onReview(data: any) {
    this.messageService.confirm({
      header: '是否執行審核',
      accept: () => {
        this.messageService.blockUi();
        this.fin11010Service.reviewFIN11010(data.id).subscribe((response) => {
          if (response.Status === '0000') {
            this.messageService.successBubble(response.Message);
            // 更新表格資料
            if (this.recentlyCreatedData) {
              this.recentlyCreatedData = {
                ...this.recentlyCreatedData,
                ...response.Data
              };
            }
          }
          this.messageService.unblockUi();
        });
      }
    });
  }

  // 反審核功能
  onUnreview(data: any) {
    this.messageService.confirm({
      header: '是否執行反審核',
      accept: () => {
        this.messageService.blockUi();
        this.fin11010Service.unreviewFIN11010(data.id).subscribe((response) => {
          if (response.Status === '0000') {
            this.messageService.successBubble(response.Message);
            // 更新表格資料
            if (this.recentlyCreatedData) {
              this.recentlyCreatedData = {
                ...this.recentlyCreatedData,
                ...response.Data
              };
            }
          }
          this.messageService.unblockUi();
        });
      }
    });
  }
}