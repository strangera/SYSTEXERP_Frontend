import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { Column, formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { TableComponent } from '../../../others/component/table/table.component';
import { createPaginationConfig } from '../../../others/component/table/table.model';

// 2.4.6.4  收銀機異動排程維護
@Component({
  selector: 'app-tls46040',
  templateUrl: './tls46040.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, DropdownComponent, AccordionModule, FormsModule, ReactiveFormsModule, MultiSelectComponent, TableComponent, CalendarRangeComponent, TranslateModule, InputTextComponent]
})
export class TLS46040Component extends BasicQueryPageComponent<any> implements OnInit {
  ECR_FLD_IDOptions: any[] = [];
  queryForm = this.formBuilder.group({
    ECR_SchNo: [''], // 排程編號
    ECR_SchDateStart: [''], // 設定啟用日期(起)
    ECR_SchDateEnd: [''], // 設定啟用日期(訖)
    ECR_SchStatus: [[]], // 排程狀態
    ECR_No: [''], // 收銀機編號
    ECR_SchFinTimeStart: [''], // 排程作業完成時間(起)
    ECR_SchFinTimeEnd: [''], // 排程作業完成時間(訖)
    ECR_FLD_ID: [[]], // 異動類型
    ...createPaginationConfig([{ field: 'ECR_SchNo', order: 1 }]),
  });
  data: any[] = [];
  totalRecords = 0;
  ECRNoOptions: any[] = [];
  ECR_SchStatus_Options = [
    { label: '啟用', value: 'A' },
    { label: '取消', value: 'C' },  // 取消
    { label: '執行完畢', value: 'F' },  // 執行完畢
  ];
  columns: Column[] = [
    { field: 'ECR_SchNo', header: '排程編號' },
    { field: 'ECR_SchDate', header: '設定啟用日期', format: formatDate },
    { field: 'ECR_SchStatus', header: '排程狀態' },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'ECR_FLD_ID', header: '異動類型' },
    { field: 'ECR_FLD_OrgVal', header: '新機台內容' },
    { field: 'ECR_FLD_NewVal', header: '原機台內容' },
    { field: 'ECR_FLD_CompleteTime', header: '異動作業完成時間', format: formatDate },
  ];

  constructor(
    private readonly dropdownApiService: DropdownApiService,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }


  ngOnInit(): void {
    this.initializePage('TLS46040', 'TLS/TLS46040cru', this.queryForm, (form) => this.onSubmit(form));
    this.dropdownApiService.queryPos1002().subscribe((data) => {
      this.ECRNoOptions = (data ?? []).map((x: any) => ({ value: x.value, label: x.label }));
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
    console.log(frm.value);

  }

}
