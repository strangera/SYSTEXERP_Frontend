import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount, formatDate } from '@shared/componentkit/table-report/table-report.model';
import { formatTxnNo } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { TLS2A060Service } from 'src/app/service/api/tls/tls2a060.service';
import { DropDownListService, IDropdownItem } from 'src/app/service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS2A060Data, TLS2A060Query, TLS2A060footerData } from './tls2a060.model';
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

@Component({
  selector: 'app-tls2a060',
  styleUrls: ['./tls2a060.component.scss'],
  templateUrl: './tls2a060.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    TranslateModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarComponent,
    Button,
    NgIf,
    TooltipModule,
    DropdownRangeComponent,
    DatePipe,
    TableReportComponent,
    TableEditComponent,
    DialogComponent
  ],
})
export class TLS2A060Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_Date: [yesterday, Validators.required],
    Floor_No: [''],
    ECR_No_Start: [''],
    ECR_No_End: [''],
    Building_No: [''],
    TXN_GUIPaper: [''],
  });
  checkStatusOptions: any[] = [
    { label: '已繳回', value: '1' },
    { label: '發票未繳回', value: '6' },
  ];
  columns: EditColumn[] = [
    { field: 'TLT_No', header: '專櫃編號', textAlign: 'center' },
    { field: 'tlt_name', header: '櫃位名稱', textAlign: 'center' },
    { field: 'INV_GUIType', header: '發票格式', textAlign: 'center' },
    { field: 'TXN_GUINo', header: '發票號碼', textAlign: 'center', },
    { field: 'TXN_Date', header: '銷售日期', textAlign: 'center', format: formatDate },
    { field: 'ECR_No', header: '收銀機號', textAlign: 'center', },
    { field: 'TXN_No', header: '交易序號', textAlign: 'center', format: formatTxnNo },
    { field: 'void_TXN_Date', header: '作廢日期', textAlign: 'center', format: formatDate },
    { field: 'void_ECR_No', header: '作廢機台', textAlign: 'center', },
    { field: 'void_TXN_No', header: '作廢交易序號', textAlign: 'center', },
    { field: 'TXN_SaleAmt', header: '付款金額', textAlign: 'right', format: formatAmount },
    {
      field: 'check_status', header: '審核狀態', type: 'dropdown', optionLabel: 'label', optionValue: 'value',
      width: '150px',
      options: () => this.checkStatusOptions,
    },
    {
      field: 'check_remark', header: '備註', type: 'input', textAlign: 'left', maxLength: 100, width: '200px',
      validate: [
        (value, _, __, ___, header) => {
          if (!value) return { isValid: true, errorMessage: [] };
          const limit = 100;
          const isValid = value.toString().length <= limit;
          return {
            isValid,
            errorMessage: isValid ? [] : [`${header}最多 ${limit} 個字`],
          };
        },
      ],
    },
  ];
  historyRequestBody: TLS2A060Query | null = null;
  ECR_Options: { label: string; value: string }[] = [];
  floorOptions: IDropdownItem[] = [];
  buildingNoOptions: IDropdownItem[] = [];
  ECRNoOptions: IDropdownItem[] = [];
  TXNGUIPaperOptions = getSYS1000Options('TXN_GUIPaper').filter(opt => opt.value === 'E' || opt.value === 'C');
  selectedItems: any[] = [];
  data: TLS2A060Data[] = [];
  footerData: TLS2A060footerData[] = [];
  totalRecords = 0;
  isClose = false; // 判斷當日是否已關帳，已關帳則不能審核，disable卡控

  constructor(
    private dropDownListService: DropDownListService,
    public readonly TLS2A060Service: TLS2A060Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2A060', 'TLS/TLS2A060cru', this.queryForm, (form) => this.onSubmit(form));
    this.dropDownListService.queryPOS1002_DropDownList().subscribe((data) => {
      this.ECRNoOptions = (data.Data || []).map((x: any) => ({ No: x.No, Name: `${x.No}-${x.Name}` }));
    });
    this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.floorOptions = res.Data.map(item => ({ ...item, label: item.Name, value: item.No }));
    });
    this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.buildingNoOptions = res.Data.map(x => ({ label: x.Name, value: x.No, Name: x.Name, No: x.No }));
    });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        SortBy: null,
      }
      this.TLS2A060Service.queryTLS2A060(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.totalRecords = res.TotalCount || 0;
        this.data = res.Data?.mainData || [];
        this.footerData = res.Data?.totalData?.[0] || [];
        this.historyRequestBody = body;
        if (this.data.length > 0) {
          // 資料都是同一天取第一筆判斷當日已關帳則不能審核，要disable
          this.isClose = this.data[0].isClose === 'Y';
        } else {
          // 無資料時也disable審核按鈕，避免誤操作
          this.isClose = true;
        }
      })
    })
  }

  onCheck(): void {
    this.handleSubmit(this.queryForm, () => {
      const body = {
        selectList: this.data,
      }
      this.TLS2A060Service.insertTLS2A060(body).pipe(finalize(() => this.loading = false)).subscribe({
        next: () => {
          this.messageService.successBubble('審核成功');
          this.onSubmit(this.queryForm);
        },
      });
    })
  }

  /* 讓後端只更新有被編輯的資料，提高效能 */
  onCellValueChange(rowData: any) {
    // 已經有 detailId（代表這筆資料已經審核過要走update，而不是新增）
    if (rowData.detailId && rowData.data_status !== 'insert') {
      rowData.data_status = 'update';
    }
  }
}
