import { Component } from '@angular/core';
import { TLS23010Service } from '../../../service/API/tls/tls23010.service';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TXN_SubtypeService } from '../../../service/basic/TXN_Subtype.service';
import { CarrierTypeService } from '../../../service/basic/carrier-type.service';
import { finalize } from 'rxjs/operators';
import { Location } from '@angular/common';


@Component({
  selector: 'app-tls23010-cru',
  templateUrl: './tls23010-cru.component.html',
  styleUrls: ['./tls23010-cru.component.scss']
})
export class TLS23010CRUComponent {
  loading = true;
  progressValue = 10; // ✅ 初始設為 10%
  data: any[] = [];
  columns: any[] = [
    {
      field: 'TXN_Date',
      header: '銷售日期',
      visible: true,
      format: (val: string) => {
        const date = new Date(val);
        return isNaN(date.getTime())
          ? val
          : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
      }
    },
    // {
    //   field: 'TXN_Time',
    //   header: '銷售時間',
    //   visible: true,
    //   format: (val: string) => {
    //     const date = new Date(val);
    //     if (isNaN(date.getTime())) return val;

    //     const yyyy = date.getFullYear();
    //     const MM = (date.getMonth() + 1).toString().padStart(2, '0');
    //     const dd = date.getDate().toString().padStart(2, '0');
    //     const HH = date.getHours().toString().padStart(2, '0');
    //     const mm = date.getMinutes().toString().padStart(2, '0');

    //     return `${yyyy}/${MM}/${dd} ${HH}:${mm}`;
    //   }
    // },
    { field: 'ECR_No', header: '機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true, style: 'text-right' },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' }, // 非 POS5006 欄位，UI 顯示用
    // { field: 'SYS_StoreNo', header: '店號', visible: false },


    { field: 'TXN_Uniform', header: '統一編號', visible: true },
    { field: 'TXN_GUIBegNoFirstNo', header: '字軌', visible: true }, // 假設為字軌顯示
    { field: 'TXN_GUIBegNo', header: '起始發票號碼', visible: true },
    { field: 'TXN_GUIEndNo', header: '結束發票號碼', visible: true },
    {
      field: 'TXN_TotGUI', header: '發票金額', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    {
      field: 'TXN_TotSaleAmt',
      header: '銷售金額',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    {
      field: 'TXN_TotOver', header: '溢收金額', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    }, {
      field: 'TXN_FlagStatus',
      header: '狀態旗標',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.statusFlagOptions)
    },
    {
      field: 'TXN_Status',
      header: '交易型態',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.txnStatusOptions)
    },
    {
      field: 'TXN_Subtype',
      header: '交易附屬型態',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.transactionSubTypeOptions)
    },
    {
      field: 'TXN_TotPayAmt', header: '訂金實收', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    { field: 'TXN_TaxFreeCertNo', header: '外交官免稅卡號', visible: true },
    { field: 'TXN_Time', header: '起始時間', visible: true }, { field: 'TXN_Time', header: '結束時間', visible: true },

    { field: 'USR_No', header: '收銀員', visible: true, style: 'text-left' },
    { field: 'TXN_PreOrderNo', header: '預售/訂金單號', visible: true },
    { field: 'ORG_TXN_Date', header: '原交易日期', visible: true },
    { field: 'ORG_ECR_No', header: '原收銀機號', visible: true },
    { field: 'ORG_TXN_No', header: '原交易序號', visible: true },
    { field: 'TXN_PkngUID', header: '停車車牌', visible: true },
    { field: 'TXN_MemID', header: '會員卡號', visible: true },
    {
      field: 'TXN_TotDisc', header: '折扣/讓金額', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    {
      field: 'TXN_YN',
      header: '銷貨清單列印狀態',
      visible: true,
      format: () => '是'
    },

    {
      field: 'TXN_DonateType',
      header: '捐贈狀態',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.whetherOptions)
    },
    { field: 'TXN_GUILoveCode', header: '捐贈社福團體代碼', visible: true },
    { field: 'TXN_GUIRemark', header: '防偽隨機碼', visible: true },
    {
      field: 'TXN_GUI_CarrType',
      header: '載具種類',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.carrierTypeOptions)
    },
    { field: 'TXN_GUI_CarrId', header: '共通性載具號碼', visible: true },
    {
      field: 'TXN_PrintGUI',
      header: '電子發票是否列印', //是從 **POS5006.TXN_PrintTimes** 計算出來的結果。
      visible: true,
      format: (val: any) => this.getYesNoLabel(val)
    },
    {
      field: 'TXN_PrintGUI',
      header: '信用卡別',
      visible: true,
      format: (val: any) => this.getYesNoLabel(val)
    },
    {
      field: 'TXN_PrintGUI',
      header: '號碼',
      visible: true,
      format: (val: any) => this.getYesNoLabel(val)
    },
    {
      field: 'TXN_PrintGUI',
      header: '分期期數',
      visible: true,
      format: (val: any) => this.getYesNoLabel(val)
    },
    {
      field: 'TXN_PrintGUI',
      header: '金額',
      visible: true,
      format: (val: any) => this.getYesNoLabel(val)
    },

  ];

  pageSize = 1000;
  statusFlagOptions: any[] = [];
  txnStatusOptions: any[] = [];
  transactionSubTypeOptions: any[] = [];
  whetherOptions: any[] = [];
  carrierTypeOptions: any[] = [];

  constructor(
    private tls23010Service: TLS23010Service,
    private statusFlagService: StatusFlagService,
    private whetherService: WhetherService,
    private txnSubtypeService: TXN_SubtypeService,
    private location: Location,// ✅ 新增
    private carrierTypeService: CarrierTypeService
  ) {
    const state = history.state;
    const queryFormValue = state?.queryFormValue;
    this.pageSize = state?.pageSize || 1000;

    // 初始化選項資料
    this.statusFlagService.getStatusFlags().subscribe(res => this.statusFlagOptions = res);
    this.whetherService.getWhetherOptions().subscribe(res => this.whetherOptions = res);
    this.txnSubtypeService.getTXNSubtype().subscribe(res => this.transactionSubTypeOptions = res);
    this.carrierTypeService.getCarrierType().subscribe(res => this.carrierTypeOptions = res);

    if (queryFormValue) {
      Object.keys(queryFormValue).forEach((k) => {
        if (queryFormValue[k] === '') queryFormValue[k] = null;
      });

      this.tls23010Service.queryTLS23010(queryFormValue).pipe(
        finalize(() => this.loading = false)
      ).subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.data = res.Data || [];
          } else {
            this.data = [];
          }
        },
        error: () => {
          this.data = [];
          this.loading = false;

        }
      });

    } else {
      this.loading = false;
    }
  }

  getYesNoLabel(value: any): string {
    return value === 'Y' ? '是' : value === 'N' ? '否' : value;
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }
  goBack() {
    this.location.back(); // ✅ 回上一頁
  }
  async ngOnInit(): Promise<void> {
    const state = history.state;
    const queryFormValue = state?.queryFormValue;
    this.pageSize = state?.pageSize || 1000;

    if (queryFormValue) {
      Object.keys(queryFormValue).forEach((k) => {
        if (queryFormValue[k] === '') queryFormValue[k] = null;
      });

      this.tls23010Service.queryTLS23010({
        ...queryFormValue,
        pageSize: this.pageSize
      }).pipe(
        finalize(() => {
          this.loading = false;
          this.progressValue = 100;
        })
      ).subscribe(async (res) => {
        if (res.Status === '0000' && Array.isArray(res.Data)) {
          const allData = res.Data as any[];
          const total = allData.length;
          this.data = [];

          for (let i = 0; i < total; i++) {
            this.data.push(allData[i]);
            this.progressValue = Math.floor(((i + 1) / total) * 100);

            // 讓 Angular 有機會畫出進度
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        } else {
          this.data = [];
        }
      }, () => {
        this.data = [];
        this.loading = false;
      });
    } else {
      this.loading = false;
    }
  }



} 
