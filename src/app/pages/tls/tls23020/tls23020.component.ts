import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TaxableService } from '../../../service/basic/taxable.service';
import { DiscountService } from '../../../service/basic/discount.service';
import { DeductionbigCategoryService } from '../../../service/basic/deductionbig-category.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { TLS23020Service } from '../../../service/API/tls/tls23020.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { CommissionTypeService } from '../../../service/basic/commission-type.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/API/tls/tls11010.service';
import { TxnStatusService } from '../../../service/basic/txn-status.service';

const now = new Date();

@Component({
  selector: 'app-tls23020',
  templateUrl: './tls23020.component.html',
  styleUrls: ['./tls23020.component.scss']
})
export class TLS23020Component extends BasicQueryPageComponent<any> {
  data: any[] = [];
  totalRecords: number = 0;
  // 表單欄位
  queryForm = this.formBuilder.group({
    TXN_DateStart: [new Date('2020-01-01') as Date, [Validators.required]],            // 交易日期起
    TXN_DateEnd: [now, [Validators.required]],              // 交易日期訖
    ECR_No: [''],                                           // 收銀機機號
    TXN_No_Start: [null, [this.validationService.numberValidator]],  // 交易序號起
    TXN_No_End: [null, [this.validationService.numberValidator]],    // 交易序號訖
    TLT_No: [''],                                           // 專櫃編號
    TXN_GUINo: [''],                                        // 發票號碼
    PLU_SalePrc_Start: [null],                              // 售價起
    PLU_SalePrc_End: [null],                                // 售價訖
    TXN_TaxType: [''],                                      // 稅別
    ORG_TXN_DiscCode: [''],                                 // 原始折扣代碼
    tlt_id: [''],                                           // 分類抽成類別
    PLU_MagNo: [''],                                        // 商品管理編號
    TXN_DiscCode: [''],                                     // 專櫃折數代碼
    IsNoPLU_No: [null],                                     // 是否無條碼商品
    rece_yn: [''],                                          // 是否代收(顯示方式)
    cash_yn: [''],                                          // 是否代售(顯示方式)
    tlt_building: [''],                                     // 所屬大樓
    tlt_floor: [''],                                        // 所屬樓層
    org_id: [''],                                           // 組織代碼
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }])
  });

  // 欄位定義（依後端欄位為主）
  columns = [
    {
      field: 'TXN_Date',
      header: '交易日期',
      visible: true,
      format: (val: string) => {
        const date = new Date(val);
        return isNaN(date.getTime())
          ? val
          : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
      }
    },
    { field: 'ECR_No', header: '收銀機機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true }, // 若無此欄位請移除
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },
    { field: 'PLU_SalePrc', header: '售價', visible: true },
    { field: 'TXN_Net', header: '未稅銷售金額', visible: true },
    { field: 'TXN_Tax', header: '稅額', visible: true },
    { field: 'TXN_Disc', header: '折扣總額', visible: true },

    {
      field: 'tlt_id',
      header: '分類抽成類別',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.commissionTypeOptions)
    },
    {
      field: 'ORG_TXN_DiscCode', header: '原始折數', visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.discountOptions)
    }, // 查無該欄位，請確認是否有誤或應移除
    {
      field: 'TXN_DiscCode', header: '專櫃折數', visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.discountOptions)
    },

    {
      field: 'PLU_TaxType',
      header: '稅別',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.taxableOptions)
    },
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },

    {
      field: 'TXN_Status',
      header: '交易狀態',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.txnStatusOptions)
    },
  ];

  // 下拉選單選項
  taxableOptions: any[] = [];
  discountOptions: any[] = [];
  deductionbigCategoryOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  commissionTypeOptions: any[] = [];
  whetherOptions: any[] = [];
  txnStatusOptions: any[] = [];
  checkTotalAmount = [
    { value: 1, label: '是' },
    { value: 2, label: '否' },
  ];
  OrganizationCodeOptions: any[] = [];
  

  constructor(
    private tls23020Service: TLS23020Service,
    private taxableService: TaxableService,
    private discountService: DiscountService,
    private floorService: FloorService,
    private deductionbigCategoryService: DeductionbigCategoryService,
    private commissionTypeService: CommissionTypeService,
    private tls11010Service: Tls11010Service,


    private whetherService: WhetherService,
    private txnStatusService: TxnStatusService,
    private validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23020', '', this.queryForm, (form) => this.onSubmit(form));
    this.tls11010Service.getBuildingOptions().subscribe((res) => (this.BUILDING_NO_Options = res));
    this.taxableService.getSystemTypes().subscribe(data => this.taxableOptions = data);
    this.discountService.getLocalDiscountOptions().subscribe(data => this.discountOptions = data);
    this.deductionbigCategoryService.getLocalDeductionCategories().subscribe(data => this.deductionbigCategoryOptions = data);
    this.whetherService.getWhetherOptions().subscribe(data => this.whetherOptions = data);
    this.txnStatusService.getTxnStatusOptions().subscribe(data => this.txnStatusOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = res?.map((x: any) => ({
        label: x.label,                                 // 給 table 用
        formLabel: `${x.value} - ${x.label}`,           // 給下拉選單用
        value: x.value,
      })) || [];
    });
    this.commissionTypeService.getCommissionTypes().subscribe((res) => {
      this.commissionTypeOptions = res?.map((x: any) => ({
        label: x.label,                                 // 給 table 用
        formLabel: `${x.value} - ${x.label}`,           // 給下拉選單用
        value: x.value,
      })) || [];
    });
  }

  onSubmit(form: any): void {
    if (this.loading) return;

    this.handleSubmit(form, () => {
      const payload = { ...form.value };

      // 將空字串改為 null
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      this.tls23020Service.queryTLS23020(payload).subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.data = res.Data || [];
            this.totalRecords = res.TotalCount || this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, payload);
            this.messageService.successBubble('查詢成功');
          } else {
            this.data = [];
            this.totalRecords = 0;
            this.messageService.errorBubble('查詢失敗');
          }
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.messageService.errorBubble('查詢錯誤');
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    });
  }
  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }
}
