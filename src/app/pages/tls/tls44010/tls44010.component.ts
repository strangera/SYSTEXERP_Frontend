import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ECRNoService } from '@service/basic/queryPOS1002.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TLS44010Service } from '../../../service/api/tls/tls44010.service';
import { CounterNameService } from '../../../service/basic/queryTLTTALENT.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls44010',
  templateUrl: './tls44010.component.html',
  styleUrls: ['./tls44010.component.scss'],
  standalone: true,
  imports: [
    ButtonComponent,
    FormsModule,
    ReactiveFormsModule,
    TabMenuModule,
    TranslateModule,
    ButtonModule,
    TableModule,
    AccordionModule,
    CommonModule,
    MenubarComponent,
    InputTextModule,
    DataViewModule,
    DropdownComponent,
    MultiSelectComponent,
    InputTextComponent,
    PaginatorModule
  ]
})
export class TLS44010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    ECR_No: this.formBuilder.control<string[]>([]),
    TLT_No: this.formBuilder.control<string[]>([]),
    tlt_building: this.formBuilder.control<string[]>([]),
    tlt_floor: this.formBuilder.control<string[]>([]),
    area_no: this.formBuilder.control<string[]>([]),
    EOS_IP: this.formBuilder.control<string>(''),
    EOS_Online: this.formBuilder.control<string>(''),
    Day: this.formBuilder.control<number>(0),
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  items: MenuItem[] = [];
  activeItem: MenuItem | undefined;

  data: any[] = [];
  filteredData: any[] = [];
  pagedData: any[] = [];

  globalFilter = '';
  layout: 'list' | 'grid' = 'grid';

  rows = 15;
  first = 0;
  // loading = false;
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];
  buildingNoOptions: IDropdownItem[] = [];
  floorOptions: IDropdownItem[] = [];
  constructor(
    private fb: FormBuilder,
    private ECRNoService: ECRNoService,
    private dropDownListService: DropDownListService,
    private counterNameService: CounterNameService,
    private tls44010Service: TLS44010Service
  ) {
    super();
  }

  ngOnInit() {
    this.initializePage('TLS44010', '/TLS/TLS44010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          No: x.value,              // 編號
          Name: x.label,            // 名稱
          formLabel: `${x.value} - ${x.label}`, // 下拉顯示
          value: x.value            // 存值
        })) || [];
    });
    //館別
    this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.buildingNoOptions = res.Data.map(x => ({ label: x.Name, value: x.No, Name: x.Name, No: x.No }));
    });


    this.items = [
      { label: '全部' },
      { label: '連線機台' },
      { label: '離線機台' }
    ];
    this.activeItem = this.items[0];

    this.onSubmit(this.queryForm);
  }
  loadDropdownOptions() {

    this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.floorOptions = res.Data.map(item => ({
        ...item,
        label: item.Name,
        value: item.No
      }));
    });
  }

  onSubmit(form: FormGroup) {
    this.loading = true;

    // 取出表單值
    const rawValue = form.value;

    // 轉換需要陣列的欄位
    const payload = {
      ...rawValue,
      PageSize: rawValue.PageSize ?? 20,
      PageIndex: rawValue.PageIndex ?? 1,
      OrderBy: rawValue.OrderBy ?? '',
      Offset: rawValue.Offset ?? 0,

      // 確保是陣列
      ECR_No: Array.isArray(rawValue.ECR_No)
        ? rawValue.ECR_No
        : rawValue.ECR_No
          ? [rawValue.ECR_No]
          : [],
      TLT_No: Array.isArray(rawValue.TLT_No)
        ? rawValue.TLT_No
        : rawValue.TLT_No
          ? [rawValue.TLT_No]
          : [],
      tlt_building: Array.isArray(rawValue.tlt_building)
        ? rawValue.tlt_building
        : rawValue.tlt_building
          ? [rawValue.tlt_building]
          : [],
      tlt_floor: Array.isArray(rawValue.tlt_floor)
        ? rawValue.tlt_floor
        : rawValue.tlt_floor
          ? [rawValue.tlt_floor]
          : [],
      area_no: Array.isArray(rawValue.area_no)
        ? rawValue.area_no
        : rawValue.area_no
          ? [rawValue.area_no]
          : []
    };

    this.tls44010Service.queryTLS44010(payload).subscribe({
      next: (res) => {
        this.data = res?.Data || [];
        this.filteredData = [...this.data];
        this.first = 0;
        this.updatePagedData();
      },
      error: (err) => {
        console.error('查詢失敗', err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }


  onTabChange(item: MenuItem) {
    this.activeItem = item;
    if (item.label?.includes('全部')) {
      this.filteredData = [...this.data];
    } else if (item.label?.includes('連線')) {
      this.filteredData = this.data.filter(d => d.EOS_Online === 'Y'); // 線上
    } else if (item.label?.includes('離線')) {
      this.filteredData = this.data.filter(d => d.EOS_Online === 'N'); // 離線
    }
    this.first = 0;
    this.updatePagedData();
  }

  applyFilter() {
    const keyword = this.globalFilter?.toLowerCase().trim();
    if (!keyword) {
      this.filteredData = [...this.data];
    } else {
      this.filteredData = this.data.filter(row =>
        (row.ECR_LocNo?.toLowerCase().includes(keyword)) ||
        (row.ECR_No?.toLowerCase().includes(keyword)) ||
        (row.TLT_No?.toLowerCase().includes(keyword)) ||
        (row.TLT_Name?.toLowerCase().includes(keyword)) ||
        (row.ECR_Status?.toLowerCase().includes(keyword)) ||
        (row.EOS_Online?.toLowerCase().includes(keyword))
      );
    }
    this.first = 0;
    this.updatePagedData();
  }

  onLayoutChange(event: any) {
    this.layout = event as 'list' | 'grid';
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePagedData();
  }

  updatePagedData() {
    this.pagedData = this.filteredData.slice(this.first, this.first + this.rows);
  }

  // 根據 ECR_Status (0~5) 顯示 icon
  getStatusIcon(status: string | null): string {
    switch (status) {
      case '0': return 'pi pi-pause';        // 暫停交易
      case '1': return 'pi pi-sign-out';     // 登出
      case '2': return 'pi pi-wallet';       // 完成清帳
      case '3': return 'pi pi-sync';         // 交易中
      case '4': return 'pi pi-users';        // 完成交班
      case '5': return 'pi pi-power-off';    // 關機
      default: return 'pi pi-question-circle';
    }
  }

  // 根據 ECR_Status (0~5) 顯示顏色
  getStatusColor(status: string | null): string {
    switch (status) {
      case '0': return '#fd7e14'; // 暫停交易 = 橘
      case '1': return '#dc3545'; // 登出 = 紅
      case '2': return '#6f42c1'; // 完成清帳 = 紫
      case '3': return '#28a745'; // 交易中 = 綠
      case '4': return '#0d6efd'; // 完成交班 = 藍
      case '5': return '#6c757d'; // 關機 = 灰
      default: return '#6c757d';
    }
  }
}
