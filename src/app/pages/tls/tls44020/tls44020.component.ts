import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TabMenuModule } from 'primeng/tabmenu';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { MenuItem } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { DataViewModule } from 'primeng/dataview';
import { CommonModule } from '@angular/common';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { ECRNoService } from '@service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TLS44020Service } from '../../../service/api/tls/tls44020.service';
@Component({
  selector: 'app-tls44020',
  templateUrl: './tls44020.component.html',
  styleUrls: ['./tls44020.component.scss'],
  standalone: true,
  imports: [
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
    TooltipModule,
    PaginatorModule,
    MultiSelectComponent,
    DropdownComponent,
    InputTextComponent,
    ButtonComponent
  ]
})
export class TLS44020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    ECR_No: this.formBuilder.control<string[]>([]),
    TLT_No: this.formBuilder.control<string[]>([]),
    tlt_building: this.formBuilder.control<string[]>([]),
    tlt_floor: this.formBuilder.control<string[]>([]),
    area_no: this.formBuilder.control<string[]>([]),
    EDC_IP: this.formBuilder.control<string>(''),
    EDC_Online: this.formBuilder.control<string>(''),
    Day: this.formBuilder.control<number>(0),
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });
  items: MenuItem[] = [];
  activeItem: MenuItem | undefined;

  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];
  buildingNoOptions: IDropdownItem[] = [];
  floorOptions: IDropdownItem[] = [];

  globalFilter = '';
  data: any[] = []; // Add this property to hold the data
  filteredData: any[] = [];

  // DataView layout 切換用
  layout: 'list' | 'grid' = 'grid';

  // 分頁用
  rows = 15;   // 每頁筆數
  first = 0;   // 起始 index
  pagedData: any[] = []; // 當前頁顯示的資料

  constructor(
    private fb: FormBuilder,
    private ECRNoService: ECRNoService,
    private dropDownListService: DropDownListService,
    private counterNameService: CounterNameService,
     private tls44020Service: TLS44020Service
  ) {
    super();
  }
  getBankStatus(row: any, bank: '中信' | '聯信'): '關機' | '離線' | '交易中' {
    const edcKey = bank === '中信' ? 'EDC_Online1' : 'EDC_Online2';

    // 若兩個 EDC 都離線 → 視為關機
    if (row.EDC_Online1 === 'N' && row.EDC_Online2 === 'N') {
      return '關機';
    }

    // 判斷個別 EDC 狀態
    if (row[edcKey] === 'Y') {
      return '交易中';
    } else {
      return '離線';
    }
  }
  isShutdown(row: any): boolean {
    return row.EDC_Online1 === 'N' && row.EDC_Online2 === 'N';
  }

  getEdcStatusClass(status: string): string {
    switch (status) {
      case '交易中': return 'edc-chip success';
      case '離線': return 'edc-chip logout';
      case '關機': return 'edc-chip shutdown'; // chip 其實不會用到，因為用 icon
      default: return 'edc-chip';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case '關機': return 'pi pi-desktop';
      case '離線': return 'pi pi-sign-out';
      case '交易中': return 'pi pi-sync';
      default: return 'pi pi-question-circle';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case '關機': return '#6c757d';
      case '離線': return '#dc3545';
      case '交易中': return '#28a745';
      default: return '#6c757d';
    }
  }


  ngOnInit() {
    this.initializePage('TLS44020', '/TLS/TLS44020cru', this.queryForm, (form) => this.onSubmit(form));
    this.items = [
      { label: '全部' },
      { label: '連線機台' },
      { label: '離線機台' }
    ];
    this.activeItem = this.items[0];
    this.filteredData = this.data;
    this.updatePagedData();
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
    console.log('查詢條件', form.value);

    this.tls44020Service.queryTLS44020(form.value).pipe(untilDestroyed(this)).subscribe({
      next: (res) => {
        console.log('API 回應', res);
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
      this.filteredData = this.data.filter(d => d.EOS_Status === '開機' || d.EOS_Status === '交易中');
    } else if (item.label?.includes('離線')) {
      this.filteredData = this.data.filter(d => d.EOS_Status === '離線' || d.EOS_Status === '登出');
    }

    this.first = 0;
    this.updatePagedData();
  }

  /** 搜尋框篩選 */
  applyFilter() {
    const keyword = this.globalFilter?.toLowerCase().trim();
    if (!keyword) {
      this.filteredData = [...this.data];
    } else {
      this.filteredData = this.data.filter(row =>
        (row.ECR_LocNo?.toLowerCase().includes(keyword)) ||
        (row.TLT_No?.toLowerCase().includes(keyword)) ||
        (row.TLT_Name?.toLowerCase().includes(keyword)) ||
        (row.EOS_Status?.toLowerCase().includes(keyword)) ||
        (row.Store?.toLowerCase().includes(keyword)) ||
        (row.Floor?.toLowerCase().includes(keyword)) ||
        (row.Area?.toLowerCase().includes(keyword)) ||
        (row.ECR_IP?.toLowerCase().includes(keyword))
      );
    }
    this.first = 0; // 搜尋後回到第一頁
    this.updatePagedData();
  }

  // DataView layout 切換
  onLayoutChange(event: any) {
    this.layout = event as 'list' | 'grid';
  }

  // 分頁事件
  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePagedData();
  }

  // 更新顯示用的分頁資料
  updatePagedData() {
    this.pagedData = this.filteredData.slice(this.first, this.first + this.rows);
  }
}
