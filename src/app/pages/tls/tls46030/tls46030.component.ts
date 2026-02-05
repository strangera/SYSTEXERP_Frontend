import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Tls46030Service } from '@service/api/tls/tls46030.service';
import { ECRNoService } from '@service/basic/queryPOS1002.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { Column, formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { ValidationService } from '../../../shared/service/validation.service';
// 2.4.6.4  收銀機異動排程維護
@Component({
  selector: 'app-tls46030',
  templateUrl: './tls46030.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, DropdownComponent, AccordionModule, FormsModule, ReactiveFormsModule, MultiSelectComponent, TableComponent, CalendarRangeComponent, TranslateModule, InputTextComponent]
})
export class TLS46030Component extends BasicQueryPageComponent<any> implements OnInit {

  ECR_FLD_IDOptions: any[] = [];
  queryForm = this.formBuilder.group({
    ECR_SchNo: [''], // 排程編號
    ECR_SchDate_Start: [null], // 設定啟用日期(起)
    ECR_SchDate_End: [null], // 設定啟用日期(訖)
    ECR_SchStatus: [null], // 排程狀態
    ECR_No: [''], // 收銀機編號
    ECR_SchFinTime_Start: [null], // 排程作業完成時間(起)
    ECR_SchFinTime_End: [null], // 排程作業完成時間(訖)
    ECR_FLD_ID: [''], // 異動類型
    ...createPaginationConfig([{ field: 'ECR_SchNo', order: 1 }]),
    pageSize: [30],
  });
  expansionRowsPerPageOptions: number[] = [30, 60, 90, 120, 150];

  selectedItems: any[] = [];
  data: any[] = [];
  totalRecords = 0;
  ECRNoOptions: any[] = [];
  ECR_SchStatus_Options = [
    { label: '啟用', value: 'A' },
    { label: '取消', value: 'C' },  // 取消
    { label: '執行完畢', value: 'F' },  // 執行完畢
  ];
  // 狀態代碼對照表
  statusMap: Record<string, string> = {
    A: '啟用',
    C: '取消',
    F: '執行完畢'
  };
  columns: Column[] = [
    { field: 'ECR_SchNo', header: '排程編號' },
    { field: 'ECR_SchDate', header: '設定啟用日期', format: formatDate },
    {
      field: 'ECR_SchStatus',
      header: '排程狀態',
      format: (value: string) => this.statusMap[value] || value
    },
    { field: 'ECR_No', header: '收銀機號' },
    {
      field: 'ECR_FLD_ID',
      header: '異動類型',
      format: (value: string) => {
        const option = this.ECR_FLD_IDOptions.find(opt => opt.value === value);
        return option ? option.label : value;
      }
    },
    { field: 'ECR_FLD_NewVal', header: '新機台內容' },
    { field: 'ECR_FLD_OrgVal', header: '原機台內容' },
    { field: 'ECR_SchFinTime', header: '異動作業完成時間', format: formatDate },
  ];

  constructor(
    private ECRNoService: ECRNoService,
    private validationService: ValidationService,
    private dropDownListService: DropDownListService,
    private tls46030Service: Tls46030Service

  ) {
    super();
  }


  ngOnInit(): void {
    this.initializePage('TLS46030', 'TLS/TLS46030cru', this.queryForm, (form) => this.onSubmit(form));
    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });

    // 串 SYS1000 下拉選單
    const params = { SYS_Type: 'ECR_FLD_ID' };
    this.dropDownListService.querySYS1000_DropDownList(params).subscribe(res => {
      if (res && res.Data) {
        this.ECR_FLD_IDOptions = res.Data.map(item => ({
          label: `${item.Name}`,
          value: item.No
        }));
      }
    });

  }

  onSubmit(frm: FormGroup) {
    const frmValue = frm.value as any;

    const payload = {
      PageSize: frmValue.pageSize ?? 10,
      PageIndex: frmValue.pageIndex ?? 1,
      OrderBy: '',
      Offset: 0,
      SortBy: frmValue.SortBy ?? [{ field: 'ECR_SchNo', order: 1 }],
      ECR_SchNo: frmValue.ECR_SchNo ?? '',
      ECR_SchDate_Start: frmValue.ECR_SchDate_Start ?? null,
      ECR_SchDate_End: frmValue.ECR_SchDate_End ?? null,
      ECR_SchStatus: frmValue.ECR_SchStatus ?? '',
      ECR_No: frmValue.ECR_No ?? '',
      ECR_SchFinTime_Start: frmValue.ECR_SchFinTime_Start ?? null,
      ECR_SchFinTime_End: frmValue.ECR_SchFinTime_End ?? null,
      ECR_FLD_ID: frmValue.ECR_FLD_ID ?? '',
    };

    this.tls46030Service.queryTLS46030(payload).subscribe({
      next: (res) => {
        this.data = res?.Data || [];
        this.totalRecords = res?.TotalCount ?? this.data.length;
      },

    });
  }


}
