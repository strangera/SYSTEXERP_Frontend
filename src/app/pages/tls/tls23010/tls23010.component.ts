import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransactionTypeService } from '../../../service/basic/transaction-type.service';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TransactionSubTypeService } from '../../../service/basic/transaction-sub-type.service';
import { CarrierTypeService } from '../../../service/basic/carrier-type.service';
import { TLS23010Service } from '../../../service/API/tls/tls23010.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Tls11010Service } from '../../../service/API/tls/tls11010.service';
import { FloorService } from '../../../service/basic/floor.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
interface MainData {
  SYS_StoreNo: string;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  [key: string]: any; // 允許其他欄位存在
}

const now = new Date();

//型態別報表
@Component({
  selector: 'app-tls23010',
  templateUrl: './tls23010.component.html',
  styleUrls: ['./tls23010.component.scss'],
})
export class TLS23010Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    TXN_DateStart: [new Date('2020-01-01') as Date, [Validators.required]],

    TXN_DateEnd: [new Date(), [Validators.required]],   // 銷售日期迄
    ECR_No: [''],                 // 收銀機代號
    TXN_No_Start: [null],        // 交易序號(起)
    TXN_No_End: [null],          // 交易序號(迄)
    TLT_No: [''],                // 專櫃編號
    TXN_GUIBegNo: [''],          // 發票起始號碼
    TXN_GUIEndNo: [''],          // 發票結束號碼
    TXN_Status: [''],            // 狀態旗標
    USR_No: [''],                // 收銀員編號
    TXN_PreOrderNo: [''],        // 預售/訂金編號
    TXN_PkngUID: [''],           // 停車卡號
    TXN_MemCard: [''],           // 會員卡號
    TXN_Uniform: [''],           // 統一編號
    TXN_GUILoveCode: [''],       // 愛心碼
    TXN_GUI_CarrType: [''],      // 載具種類
    TXN_GUI_CarrId: [''],        // 載具號碼
    rece_yn: [''],               // 是否開立業主發票 (s=是/否)
    cash_yn: [''],               // 是否為業主收現 (s=是/否)
    tlt_building: [''],          // 館別
    tlt_floor: [''],             // 樓層
    org_id: [''],                // 組織代碼
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }])
  });

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
  // 下拉選單選項
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  transactionTypeOptions: any[] = [];
  statusFlagOptions: any[] = [];
  whetherOptions: any[] = [];
  transactionSubTypeOptions: any[] = [];
  carrierTypeOptions: any[] = [];
  checkTotalAmount = [
    { value: 1, label: '是' },
    { value: 2, label: '否' },
  ];

  columns: any[] = [
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
        {
    field: 'TXN_Time',
    header: '交易時間',
    visible: true,
    format: (val: string) => {
      const date = new Date(`1970-01-01T${val}`);
      return isNaN(date.getTime())
        ? val
        : `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true }, // 非 POS5006 欄位，UI 顯示用
    { field: 'TXN_Uniform', header: '統一編號', visible: true },
    { field: 'TXN_GUIBegNoFirstNo', header: '字軌', visible: true }, // 假設為字軌顯示
    { field: 'TXN_GUIBegNo', header: '起始發票號碼', visible: true },
    { field: 'TXN_GUIEndNo', header: '結束發票號碼', visible: true },
    { field: 'TXN_TotGUI', header: '總發票金額', visible: true },
    { field: 'TXN_TotSaleAmt', header: '總銷售金額', visible: true },
    { field: 'TXN_TotOver', header: '總溢收金額', visible: true },
    {
      field: 'TXN_Status',
      header: '交易狀態',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.statusFlagOptions)
    },
    { field: 'TXN_TotPayAmt', header: '總付款金額', visible: true },
    { field: 'TXN_TaxFreeCertNo', header: '免稅證證號', visible: true },

    { field: 'USR_No', header: '收銀員號碼', visible: true },
    { field: 'TXN_PreOrderNo', header: '預購單號', visible: true },
    { field: 'ORG_TXN_Date', header: '原始交易日期', visible: true },
    { field: 'ORG_ECR_No', header: '原始收銀機號', visible: true },
    { field: 'ORG_TXN_No', header: '原始交易序號', visible: true },
    { field: 'TXN_PkngUID', header: '停車票卡/車牌', visible: true },
    { field: 'TXN_MemID', header: '會員識別碼', visible: true },
    { field: 'TXN_TotDisc', header: '折扣總額', visible: true },
    {
      field: 'TXN_DonateType',
      header: '捐贈狀態',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.whetherOptions)
    },
    { field: 'TXN_GUILoveCode', header: '電子發票愛心碼', visible: true },
    { field: 'TXN_GUIRemark', header: '電子發票隨機碼', visible: true },
    {
      field: 'TXN_GUI_CarrType',
      header: '電子發票載具類別',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.carrierTypeOptions)
    },
    { field: 'TXN_GUI_CarrId', header: '電子發票載具ID隱碼', visible: true },
    {
      field: 'TXN_PrintGUI',
      header: '電子發票是否列印', //是從 **POS5006.TXN_PrintTimes** 計算出來的結果。
      visible: true,
      format: (val: any) => this.getYesNoLabel(val)
    }
  ];


   mainColumns: any[] = [
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
        {
    field: 'TXN_Time',
    header: '交易時間',
    visible: true,
    format: (val: string) => {
      const date = new Date(`1970-01-01T${val}`);
      return isNaN(date.getTime())
        ? val
        : `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true }, // 非 POS5006 欄位，UI 顯示用
    { field: 'TXN_Uniform', header: '統一編號', visible: true },
    { field: 'TXN_GUIBegNoFirstNo', header: '字軌', visible: true }, // 假設為字軌顯示
    { field: 'TXN_GUIBegNo', header: '起始發票號碼', visible: true },
    { field: 'TXN_GUIEndNo', header: '結束發票號碼', visible: true },
    { field: 'TXN_TotGUI', header: '總發票金額', visible: true },
    { field: 'TXN_TotSaleAmt', header: '總銷售金額', visible: true },
    { field: 'TXN_TotOver', header: '總溢收金額', visible: true },
    {
      field: 'TXN_Status',
      header: '交易狀態',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.statusFlagOptions)
    },
    { field: 'TXN_TotPayAmt', header: '總付款金額', visible: true },
    { field: 'TXN_TaxFreeCertNo', header: '免稅證證號', visible: true },

    { field: 'USR_No', header: '收銀員號碼', visible: true },
    { field: 'TXN_PreOrderNo', header: '預購單號', visible: true },
    { field: 'ORG_TXN_Date', header: '原始交易日期', visible: true },
    { field: 'ORG_ECR_No', header: '原始收銀機號', visible: true },
    { field: 'ORG_TXN_No', header: '原始交易序號', visible: true },
    { field: 'TXN_PkngUID', header: '停車票卡/車牌', visible: true },
    { field: 'TXN_MemID', header: '會員識別碼', visible: true },
    { field: 'TXN_TotDisc', header: '折扣總額', visible: true },
    {
      field: 'TXN_DonateType',
      header: '捐贈狀態',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.whetherOptions)
    },
    { field: 'TXN_GUILoveCode', header: '電子發票愛心碼', visible: true },
    { field: 'TXN_GUIRemark', header: '電子發票隨機碼', visible: true },
    {
      field: 'TXN_GUI_CarrType',
      header: '電子發票載具類別',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.carrierTypeOptions)
    },
    { field: 'TXN_GUI_CarrId', header: '電子發票載具ID隱碼', visible: true },
    {
      field: 'TXN_PrintGUI',
      header: '電子發票是否列印', //是從 **POS5006.TXN_PrintTimes** 計算出來的結果。
      visible: true,
      format: (val: any) => this.getYesNoLabel(val)
    }
  ];
  detailColumns: any[]=[
      
    { field: 'TXN_Date', header: '交易日期', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    {
      field: 'TXN_No',
      header: '交易序號',
      visible: true,
    },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'PAY_Type', header: '付款別型態', visible: true }, //POS1006.PAY_Type
    { field: 'CRD_Type', header: '付款信用卡卡別', visible: true }, //V=VISA、M=MASTER、J=JCB、A=AE、D=DINVER、S=銀聯卡*/
    { field: 'CRD_No', header: '付款卡號', visible: true },
    { field: 'TERM_No', header: '期別', visible: true }, //0=一般，其餘為分期的期數
    { field: 'TXN_PayAmt', header: '付款金額', visible: true },
  ];
// 展開式表格的載入狀態
  expandLoading = false;
  //data為detailColumns 的data的data

  getYesNoLabel(value: any): string {
    return value === 'Y' ? '是' : value === 'N' ? '否' : value;
  }

  constructor(
    private tls23010Service: TLS23010Service,
    private transactionTypeService: TransactionTypeService,
    private statusFlagService: StatusFlagService,
    private whetherService: WhetherService,
    private transactionSubTypeService: TransactionSubTypeService,
    private carrierTypeService: CarrierTypeService,
    private tls11010Service: Tls11010Service,
    private floorService: FloorService,

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23010', '', this.queryForm, (f) => this.onSubmit(f));
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.transactionTypeService.getTransactionTypes().subscribe(data => this.transactionTypeOptions = data);
    this.statusFlagService.getStatusFlags().subscribe(data => this.statusFlagOptions = data);
    this.whetherService.getWhetherOptions().subscribe(data => this.whetherOptions = data);
    this.transactionSubTypeService.getTransactionSubType().subscribe(data => this.transactionSubTypeOptions = data);
    this.carrierTypeService.getCarrierType().subscribe(data => this.carrierTypeOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe((res) => (this.BUILDING_NO_Options = res));
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = res?.map((x: any) => ({
        label: x.label,                                 // 給 table 用
        formLabel: `${x.value} - ${x.label}`,           // 給下拉選單用
        value: x.value,
      })) || [];
    });
  }

onSubmit(form: FormGroup): void {
  if (this.loading) return;

  this.handleSubmit(form, () => {
    const formValue = { ...form.value };
    this.loading = true;
    this.messageService.blockUi();

    for (const key in formValue) {
      if (formValue[key] === '') {
        formValue[key] = null;
      }
    }

    this.tls23010Service.queryTLS23010(formValue).subscribe({
      next: (res) => {
        if (res.Status === '0000') {
          // ✅ 加入 id 組合鍵處理 SYS_StoreNo 門市店號
this.data = (res.Data || []).map((item: MainData) => ({
  ...item,
  id: `${item.SYS_StoreNo}_${item.TXN_Date}_${item.ECR_No}_${item.TXN_No}`
}));

          this.totalRecords = res.TotalCount || this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, formValue);
          this.messageService.successBubble('查詢成功');
        } else {
          this.data = [];
          this.totalRecords = 0;
          this.messageService.errorBubble('查詢失敗');
        }
      },
      error: () => {
        this.messageService.errorBubble('查詢錯誤');
        this.loading = false;
        this.messageService.unblockUi();
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

  loadDetail(rowData: any) {
  const request = {
    SYS_StoreNo: rowData.SYS_StoreNo,
    TXN_Date: rowData.TXN_Date,
    ECR_No: rowData.ECR_No,
    TXN_No: rowData.TXN_No,
  };

  this.expandLoading = true;
  this.tls23010Service.queryTLS23010Detail(request).subscribe({
    next: (res) => {
      if (res.Status === '0000') {
        rowData.details = res.Data || [];
      } else {
        rowData.details = [];
        this.messageService.errorBubble('明細資料載入失敗');
      }
    },
    error: () => {
      rowData.details = [];
      this.messageService.errorBubble('明細資料載入錯誤');
    },
    complete: () => {
      this.expandLoading = false;
    }
  });
}

}
