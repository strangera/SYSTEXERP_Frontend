import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { TLS23060Service } from '../../../service/API/tls/tls23060.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TypeService } from '../../../service/basic/type.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/API/tls/tls11010.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { ColumnLabelService } from '../../../service/basic/column-label.service'; // 加入 import
import { of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-tls23060',
  templateUrl: './tls23060.component.html',
  styleUrls: ['./tls23060.component.scss']
})
export class TLS23060Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    TXN_DateStart: [new Date('2020-01-01'), [Validators.required]],
    TXN_DateEnd: [new Date(), [Validators.required]],
    rece_yn: [null],
    ECR_No: [],
    tlt_no: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }])
  });

  data: any[] = [];
  totalRecords = 0;
  showPageSizeDialog = false;
  customPageSize = 1000;

  WhetherOptions: any[] = [];
  typeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];

  constructor(
    private tls23060Service: TLS23060Service,
    private typeService: TypeService,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
    private whetherService: WhetherService,
    private columnLabelService: ColumnLabelService // 加入此行
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23060', 'TLS23060CRU', this.queryForm, (form) => this.onSubmit(form));
    this.whetherService.getWhetherOptions().subscribe(data => this.WhetherOptions = data);
    this.typeService.getTypeOptions().subscribe(data => this.typeOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe(data => {
      this.OrganizationCodeOptions = data?.map(x => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value
      })) || [];
    });
    this.ECRNoService.getECRNo().subscribe(data => {
      this.ECRNoOptions = data?.map(x => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value
      })) || [];
    });
    this.counterNameService.getCounters().subscribe(data => {
      this.CounterOptions = data?.map(x => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value
      })) || [];
    });
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (this.loading || form.invalid) return;

    this.handleSubmit(form, () => {
      const payload = this.cleanFormPayload({ ...form.value });

      this.loading = true;
      this.messageService.blockUi();

      this.tls23060Service.queryTLS23060(payload).pipe(
        timeout(30000),
        catchError(err => {
          this.messageService.errorBubble('查詢失敗');
          this.loading = false;
          this.messageService.unblockUi();
          return of({ Status: '9999', Data: [] });
        })
      ).subscribe({
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
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    });
  }

  goToReportMode(): void {
    this.customPageSize = 1000;
    this.showPageSizeDialog = true;
  }

  confirmPageSizeAndNavigate(): void {
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      this.queryForm.markAllAsTouched();
      return;
    }

    const queryFormValue = this.cleanFormPayload({
      ...this.queryForm.value,
      pageSize: this.customPageSize
    });

    this.loading = true;
    this.messageService.blockUi();

    this.tls23060Service.queryTLS23060(queryFormValue).pipe(
      timeout(30000),
      catchError(() => {
        this.messageService.errorBubble('查詢失敗');
        this.loading = false;
        this.messageService.unblockUi();
        return of({ Status: '9999', Data: [] });
      })
    ).subscribe({
      next: (res) => {
        if (res.Status === '0000') {
          this.queryStateService.setQueryState(this.ProgNo, queryFormValue);
          this.router.navigate(['/TLS/TLS23060CRU'], {
            state: {
              queryFormValue,
              pageSize: this.customPageSize,
              data: res.Data || []
            }
          });
          this.messageService.successBubble('查詢成功');
        } else {
          this.messageService.errorBubble('查詢失敗');
        }
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
        this.showPageSizeDialog = false;
      }
    });
  }

  private cleanFormPayload(payload: any): any {
    for (const key in payload) {
      const val = payload[key];
      if (val === '' || val === null || (Array.isArray(val) && val.length === 0)) {
        payload[key] = null;
      }
    }

    return {
      ...payload,
      pageSize: payload.pageSize ?? 30,
      pageIndex: (payload.pageIndex ?? 1) - 1,
      Offset: 0,
      OrderBy: '',
      SortBy: payload.SortBy ?? [{ field: 'ECR_No', order: 1 }]
    };
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  // 欄位定義與格式（保留所有欄位 + moneyFormat + subtotalFields 全部欄位處理）
  columns: any[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    ...[
      'TXN_TotPayAmt', 'TXN_PayAmt10', 'TXN_PayAmt41', 'TXN_PayAmt42', 'TXN_PayAmt12',
      'TXN_PayAmt81', 'TXN_PayAmt43', 'TXN_PayAmt44', 'TXN_PayAmt14', 'TXN_PayAmt82',
      'TXN_PayAmt52', 'TXN_PayAmt20', 'TXN_PayAmt62', 'TXN_PayAmt77', 'TXN_PayAmt71',
      'TXN_PayAmt30', 'TXN_PayAmt73', 'TXN_PayAmt72', 'TXN_PayAmt74', 'TXN_PayAmt75',
      'TXN_PayAmt76', 'TXN_PayAmt24', 'TXN_PayAmt25', 'TXN_PayAmt07', 'TXN_PayAmt55',
      'TXN_PayAmt83', 'TXN_PayAmt78', 'TXN_PayAmt79', 'TXN_PayAmt21', 'TXN_PayAmt53',
      'TXN_PayAmt56', 'TXN_PayAmt57', 'TXN_PayAmt58', 'TXN_PayAmt59', 'TXN_PayAmt60',
      'TXN_PayAmt22', 'TXN_PayAmt23', 'PreSale_Received', 'PreSale_Checkout',
      'TXN_OverAmt', 'TXN_ReturnAmt', 'TXN_ExchangeAmt', 'TXN_CancelAmt', 'TXN_AgentAmt'
    ].map(field => ({
      field,
      header: this.columnLabelService.getLabel(field),
      visible: true,
      style: 'text-right',
      format: this.moneyFormat.bind(this)
    }))
  ];
}
