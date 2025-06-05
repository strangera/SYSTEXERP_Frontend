import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS23040Service } from '../../../service/API/tls/tls23040.service';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { TXN_SubtypeService } from '../../../service/basic/TXN_Subtype.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/API/tls/tls11010.service';

import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls23040',
  templateUrl: './tls23040.component.html',
  styleUrls: ['./tls23040.component.scss']
})
export class TLS23040Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    TXN_DateStart: [new Date(), [Validators.required]],
    TXN_DateEnd: [new Date(), [Validators.required]],
    ECR_No: [''],
    TXN_No_Start: [null],
    TXN_No_End: [null],
    TLT_No: [''],
    TXN_Status: [''],
    TXN_PkngUID: [''],
    TXN_MemCard: [''],
    TXN_GUIBegNo: [''],
    tlt_building: [''],
    tlt_floor: [''],
    org_id: [''],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }])
  });

  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    {
      field: 'TXN_Date',
      header: '銷售日期',
      visible: true,
      format: (val: string) => {
        const d = new Date(val);
        return isNaN(d.getTime())
          ? val
          : `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
      }
    },
    { field: 'ECR_No', header: '收銀機代號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'TXN_GUIBegNoFirstNo', header: '發票起號(字軌)', visible: true },
    { field: 'TXN_GUIBegNo', header: '發票號碼(起)', visible: true },
    { field: 'TXN_GUIEndNo', header: '發票號碼(迄)', visible: true },
    {
      field: 'TXN_TotGUI',
      header: '發票總金額',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    {
      field: 'TXN_TotSaleAmt',
      header: '總銷售金額',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    {
      field: 'TXN_Status',
      header: '交易狀態',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.txnStatusOptions)
    },
    { field: 'TXN_TaxFreeCertNo', header: '免稅證號', visible: true },
    { field: 'USR_No', header: '收銀員代號', visible: true },
    { field: 'TXN_PkngUID', header: '車卡號', visible: true },
    {
      field: 'ORG_TXN_Date',
      header: '原交易日期',
      visible: true,
      format: (val: string) => {
        const d = new Date(val);
        return isNaN(d.getTime())
          ? val
          : `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
      }
    },
    { field: 'ORG_ECR_No', header: '原收銀機代號', visible: true },
    { field: 'ORG_TXN_No', header: '原交易序號', visible: true },
    { field: 'TXN_MemCard', header: '會員卡號', visible: true },
    {
      field: 'TXN_TotPayScoreAmt',
      header: '會員積點折抵金額',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    }
  ];

  statusFlagOptions: any[] = [];
  TXN_SubtypeOptions: any[] = [];
  txnStatusOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  WhetherOptions: any[] = [];

  constructor(
    private tls23040Service: TLS23040Service,
    private statusFlagService: StatusFlagService,
    private TXN_SubtypeService: TXN_SubtypeService,
    private txnStatusService: TxnStatusService,
    private floorService: FloorService,
    private tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23040', '', this.queryForm, (form) => this.onSubmit(form));

    this.statusFlagService.getStatusFlags().subscribe(data => this.statusFlagOptions = data);
    this.TXN_SubtypeService.getTXNSubtype().subscribe(data => this.TXN_SubtypeOptions = data);
    this.txnStatusService.getTxnStatusOptions().subscribe(data => this.txnStatusOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = res?.map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];
    });
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (this.loading) return;

    if (form.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      return;
    }

    this.handleSubmit(form, () => {
      const payload = { ...form.value };
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      this.tls23040Service.queryTLS23040(payload).subscribe({
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