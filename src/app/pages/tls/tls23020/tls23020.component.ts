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
    TXN_DateStart: [now, [Validators.required]],            // 交易日期起
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


  // 欄位定義
  columns = [
    { field: 'saleDate', header: '銷售日期', visible: true },
    { field: 'cashRegisterStatus', header: '收銀機代號', visible: true },
    { field: 'transactionSequence', header: '交易序號', visible: true },
    { field: 'counterCode', header: '專櫃編號/名稱', visible: true },
    { field: 'invoiceCode', header: '發票號碼', visible: true },
    { field: 'unitPrice', header: '單項售價', visible: true },
    { field: 'untaxedAmount', header: '未稅(免稅)金額', visible: true },
    { field: 'tax', header: '稅額', visible: true },
    { field: 'discountAmount', header: '折扣金額', visible: true },
    { field: 'promotionCategory', header: '商品抽成類別', visible: true },
    { field: 'originalDiscount', header: '原折扣', visible: true },
    { field: 'categoryDiscount', header: '歸類折扣', visible: true },
    { field: 'taxCategory', header: '稅別', visible: true },
    { field: 'itemCode', header: '單品編號', visible: true },
    { field: 'status', header: '狀態', visible: true },
  ];

  // 下拉選單選項
  taxableOptions: any[] = [];
  discountOptions: any[] = [];
  deductionbigCategoryOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  commissionTypeOptions: any[] = [];
  whetherOptions: any[] = [];
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
    this.commissionTypeService.getCommissionTypes().subscribe(data => this.commissionTypeOptions = data);
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = res?.map((x: any) => ({
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
}
