import { SharedDropdownService } from '@shared/services/shared-dropdown.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { Tls2d010Service } from '../../../service/api/tls/tls2d010.service'; // ★ 引入 Service
import { DropDownListService, IDropdownItem, IAPS1003Request, IAPS1003Item } from './../../../service/utility/dropDownList.service';
import { formatAmount } from '@shared/componentkit/table2/table2.model';
import { format } from 'crypto-js';
@Component({
  selector: 'app-tls2d010',
  templateUrl: './tls2d010.component.html',
  styleUrls: ['./tls2d010.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonComponent,
    MultiSelectComponent,
    CalendarComponent,
    DropdownComponent,
    TableComponent,
    TranslateModule
  ]
})
export class TLS2D010Component extends BasicQueryPageComponent<any> implements OnInit {
  currentCreateType: 'normal' | 'counter' = 'counter';
  queryForm = this.formBuilder.group({
    tlt_noList: [[]], // 專櫃編號
    CAP_ItemList: [[]],
    AccNoList: [[]], // 會計科目代號
    org_idList: [[] as number[]], // 組織
    tpy_date: [], // 扣款年月
    pod_noList: [], // 維護日
    CRT_USR_No: [this.authService.currentUserValue?.user_No],
    GUI_FLAG: [''],
    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }])
  });

  columns: any[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'CAP_Item', header: '扣款項目', visible: true },
    { field: 'CAP_Name', header: '扣款名稱', visible: true },
    { field: 'AccNo', header: '會計科目代號', visible: true },
    { field: 'org_id', header: '組織代號', visible: true },
    { field: 'Org_Name', header: '組織名稱', visible: true },
    { field: 'pod_desc', header: '活動名稱', visible: true },
    {
      field: 'tpy_date',
      header: '扣款日期',
      visible: true,
      format: (value: string | Date) => {
        if (!value) return '';
        const d = typeof value === 'string' ? new Date(value) : value;
        if (isNaN(d.getTime())) return '';
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
    },
    { field: 'GUI_FLAG', header: '是否開立發票', visible: true, format: (value: string) => value === 'Y' ? '是' : value === 'N' ? '否' : '' },
    { field: 'tpy_net', header: '扣款(未稅)', visible: true, format: formatAmount },
    { field: 'remarks', header: '備註', visible: true },
  ];

  totalRecords = 0;
  data: any[] = [];
  AccNoOptions: IDropdownItem[] = [];
  tlt_noOptions: IDropdownItem[] = [];
  org_idOptions: IDropdownItem[] = [];
  CAP_ItemOptions: IAPS1003Item[] = [];
  CRT_USR_NoOptions: IDropdownItem[] = [];
  pod_noOptions: any[] = [];

  get f() {
    return this.queryForm.controls;
  }

  constructor(
    router: Router,
    private route: ActivatedRoute,
    private tls2d010Service: Tls2d010Service,
    private dropDownListService: DropDownListService,
    public sharedDropdownService: SharedDropdownService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2D010', '/TLS/TLS2D010CRU', this.queryForm, (form) => this.onSubmit(form));
    // 查專櫃下拉
    this.dropDownListService.queryTLTTALENTDropDownList().subscribe((res) => {
      this.tlt_noOptions = (res?.Data || []).map((item: any) => ({
        value: item.talent_id,
        label: `${item.tlt_no}-${item.tlt_name}`,
        No: item.tlt_no,
        Name: item.tlt_name
      }));
    });

    this.dropDownListService.queryAPS1003DropDownList({ cap_typeList: [] }) // 參數照 interface
      .subscribe((res) => {
        this.CAP_ItemOptions = (res?.Data || []).map((item: any) => ({
          CAP_Item: item.CAP_Item, // 扣款項目代碼
          CAP_Name: item.CAP_Name, // 顯示名稱
          value: item.CAP_Item,    // 綁定值
          label: `${item.CAP_Item}-${item.CAP_Name}`, // 顯示文字
          No: item.CAP_Item,       // 必須的屬性
          Name: item.CAP_Name,     // 必須的屬性
          AccNo: item.AccNo,       // 會計科目
          GUI_FLAG: item.GUI_FLAG, // 是否開立發票
          CAP_TaxType: item.CAP_TaxType, // 課稅別
          CAP_Type: item.CAP_Type,       // 扣款類型
        }));
      });

    this.dropDownListService.queryGLS1005_DropDownList().subscribe((res) => {
      this.AccNoOptions = (res?.Data || []).map((item: any) => ({
        value: item.No,
        label: `${item.No}-${item.Name}`,
        No: item.No,
        Name: item.Name
      }));
    });
    this.dropDownListService.querySYS3100_DropDownList().subscribe(
      (res) => {
        this.org_idOptions = (res?.Data || []).map((item: any) => ({
          value: item.No,                // 綁定值
          label: `${item.No}-${item.Name}`, // 顯示文字
          No: item.No,
          Name: item.Name
        }));
      },
    );
    this.dropDownListService.queryTBLUSER_DropDownList().subscribe((res) => {
      this.CRT_USR_NoOptions = (res?.Data || []).map((item: any) => ({
        value: item.No,               // 綁定值
        label: `${item.No}-${item.Name}`, // 顯示文字
        No: item.No,
        Name: item.Name
      }));
    });
    this.dropDownListService.getActivityOptions({ mid: 0, str_no: '10', pod_type: [], pod_status: '' }).subscribe((res) => {
      this.pod_noOptions = (res?.Data || []).map((item: any) => ({
        value: item.pod_no,
        label: `${item.pod_no}-${item.pod_desc}`
      }));
    });
  }

  onSubmit(frm: FormGroup) {
    const payload = { ...frm.value };
    // 若 tpy_date 有值且為 Date，轉成 yyyy-MM-dd 字串
    if (payload.tpy_date instanceof Date) {
      const yyyy = payload.tpy_date.getFullYear();
      const mm = String(payload.tpy_date.getMonth() + 1).padStart(2, '0');
      const dd = String(payload.tpy_date.getDate()).padStart(2, '0');
      payload.tpy_date = `${yyyy}-${mm}-${dd}`;
    }
    this.loading = true;
    this.tls2d010Service.queryTLS2D010(payload).subscribe({
      next: (res) => {
        this.data = res?.Data || [];
        this.totalRecords = res?.Total || this.data.length;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  setCounterType(row: any) {
    return { ...row, type: 'counter' };
  }
}
