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
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TooltipModule } from 'primeng/tooltip';
import { TLS44020Service } from '../../../service/api/tls/tls44020.service';
import { CounterNameService } from '../../../service/basic/queryTLTTALENT.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

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
    MultiSelectComponent,
    DropdownComponent,
    InputTextComponent,
    ButtonComponent,

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
  });
  items: MenuItem[] = [];
  activeItem: MenuItem | undefined;

  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];
  buildingNoOptions: IDropdownItem[] = [];
  floorOptions: IDropdownItem[] = [];

  globalFilter = '';
  data: any[] = [];
  filteredData: any[] = [];

  // DataView layout 切換用
  layout: 'list' | 'grid' = 'grid';

  constructor(
    private fb: FormBuilder,
    private ECRNoService: ECRNoService,
    private dropDownListService: DropDownListService,
    private counterNameService: CounterNameService,
    private tls44020Service: TLS44020Service
  ) {
    super();
  }
  getBankStatus(
    row: any,
    bank: '中信' | '聯信'
  ): '關機' | '離線' | '交易中' {
    const edcKey = bank === '中信' ? 'EDC_Online1' : 'EDC_Online2';
    const eosStatus = row.EOS_Status;
    const eosOnline = row.EOS_Online;
    const edcOnline = row[edcKey];

    const eosStatusStr = eosStatus != null ? String(eosStatus) : '';
    const eosOnlineStr = eosOnline != null ? String(eosOnline) : '';
    const edcOnlineStr = edcOnline != null ? String(edcOnline).toUpperCase() : '';

    // 1. EOS_Status = 5 → 關機（支援數字 5 或字串 "5"）
    if (eosStatus === 5 || eosStatusStr === '5') {
      return '關機';
    }

    // 2. EOS_Status ≠ 5 且 EOS_Online != 1 → 離線（支援 1 / '1'）
    const isEosOnline = eosOnlineStr === '1';
    if (!isEosOnline) {
      return '離線';
    }

    // 3. EOS_Status ≠ 5 且 EOS_Online = 1 且 EDC_Online = 1 / '1' / 'Y' → 交易中
    if (edcOnlineStr === 'Y' || edcOnlineStr === '1') {
      return '交易中';
    }

    // 4. 其他情況 → 離線
    return '離線';
  }

  isShutdown(row: any): boolean {
    return row.EDC_Online1 === 'N' && row.EDC_Online2 === 'N';
  }

  getEdcStatusClass(status: string): string {
    switch (status) {
      case '交易中': return 'edc-chip success';
      case '離線': return 'edc-chip logout';
      case '關機': return 'edc-chip shutdown';
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
    this.loadDropdownOptions();
    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          No: x.value,
          Name: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value
        })) || [];
    });
    // 館別
    this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.buildingNoOptions = res.Data.map(x => ({ label: x.Name, value: x.No, Name: x.Name, No: x.No }));
    });

    // 進入頁面自動查詢，行為與 TLS44010 一致
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

    const rawValue = form.value;

    const payload = {
      PageSize: 9999,  // 設定一個很大的數字來取得所有資料
      PageIndex: 1,
      Day: rawValue.Day ?? 0,

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
          : [],

      EDC_IP: rawValue.EDC_IP ?? '',
      EDC_Online: rawValue.EDC_Online ?? '',
      EDC_TmID: rawValue.EDC_TmID ?? ''
    };

    this.tls44020Service.queryTLS44020(payload).subscribe({
      next: (res) => {
        this.data = res?.Data || [];
        this.filteredData = [...this.data];
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
      this.filteredData = this.data.filter(row =>
        this.getBankStatus(row, '中信') === '交易中' ||
        this.getBankStatus(row, '聯信') === '交易中'
      );
    } else if (item.label?.includes('離線')) {
      this.filteredData = this.data.filter(row => {
        const ct = this.getBankStatus(row, '中信');
        const lt = this.getBankStatus(row, '聯信');
        return ct !== '交易中' && lt !== '交易中';
      });
    }
  }

  applyFilter() {
    const keyword = this.globalFilter?.toLowerCase().trim();
    if (!keyword) {
      this.filteredData = [...this.data];
    } else {
      this.filteredData = this.data.filter(row =>
        (row.ECR_LocNo?.toLowerCase().includes(keyword)) ||
        (row.TLT_No?.toLowerCase().includes(keyword)) ||
        (row.TLT_Name?.toLowerCase().includes(keyword)) ||
        (row.EOS_Status != null && String(row.EOS_Status).toLowerCase().includes(keyword)) ||
        (row.Store?.toLowerCase().includes(keyword)) ||
        (row.Floor?.toLowerCase().includes(keyword)) ||
        (row.Area?.toLowerCase().includes(keyword)) ||
        (row.ECR_IP?.toLowerCase().includes(keyword))
      );
    }
  }

  onLayoutChange(event: any) {
    this.layout = event as 'list' | 'grid';
  }

}
