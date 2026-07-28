import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { EDCStatus, QueryTLS44020Response, TLS44020Service } from '../../../service/api/tls/tls44020.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';

// 配置化管理：統一收納状态對應關係，避免 switch case 膨脹
const STATUS_CONFIG: Record<EDCStatus, { class: string; icon: string; color: string }> = {
  '交易中': { class: 'success', icon: 'pi pi-sync', color: '#28a745' },
  '離線': { class: 'logout', icon: 'pi pi-sign-out', color: '#dc3545' },
  '關機': { class: 'shutdown', icon: 'pi pi-desktop', color: '#6c757d' }
};

@Component({
  selector: 'app-tls44020',
  templateUrl: './tls44020.component.html',
  styleUrls: ['./tls44020.component.scss'],
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, TabMenuModule, TranslateModule,
    ButtonModule, TableModule, AccordionModule, CommonModule,
    MenubarComponent, InputTextModule, DataViewModule, TooltipModule,
    MultiSelectComponent, DropdownComponent, InputTextComponent, ButtonComponent, AsyncPipe
  ]
})
export class TLS44020Component extends BasicQueryPageComponent<QueryTLS44020Response> implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dropdownApiService = inject(DropdownApiService);
  private readonly tls44020Service = inject(TLS44020Service);

  queryForm = this.fb.nonNullable.group({
    ECR_No: [null],
    TLT_No: [null],
    tlt_building: [null],
    tlt_floor: [null],
    area_no: [null],
    EDC_IP: [''],
    EDC_Online: [''],
    Day: [0],
  });
  items: MenuItem[] = [{ label: '全部' }, { label: '連線機台' }, { label: '離線機台' }];
  activeItem: MenuItem | undefined = this.items[0];
  ECRNoOptions = this.dropdownApiService.queryPos1002()
  CounterOptions = this.dropdownApiService.queryTltTalent()
  buildingNoOptions = this.dropdownApiService.querySys3800()
  floorOptions = this.dropdownApiService.querySys3900()
  globalFilter = '';
  data: QueryTLS44020Response[] = [];
  filteredData: QueryTLS44020Response[] = [];
  layout: 'list' | 'grid' = 'grid';

  ngOnInit() {
    this.initializePage('TLS44020', '/TLS/TLS44020cru', this.queryForm, (form) => this.onSubmit(form));
    this.onSubmit(this.queryForm);
  }

  /** 解析機台狀態的核心業務邏輯 */
  getBankStatus(row: QueryTLS44020Response, bank: '中信' | '聯信'): EDCStatus {
    const eosStatus = String(row.EOS_Status ?? '').trim();
    const eosOnline = String(row.EOS_Online ?? '').trim();
    // 1. EOS_Status = "5" -> 關機
    if (eosStatus === '5') return '關機';
    // 2. EOS_Online != "1" -> 離線
    if (eosOnline !== '1') return '離線';
    // 3. 判定指定銀行的刷卡機連線狀態
    const edcOnlineVal = bank === '中信' ? row.EDC_Online1 : row.EDC_Online2;
    const edcOnlineStr = String(edcOnlineVal ?? '').trim().toUpperCase();

    if (edcOnlineStr === 'Y' || edcOnlineStr === '1') {
      return '交易中';
    }

    return '離線';
  }

  isShutdown(row: QueryTLS44020Response): boolean {
    return row.EDC_Online1 === 'N' && row.EDC_Online2 === 'N';
  }

  // 善用簡化後的對應物件配置，消滅大量的 switch-case 區塊
  getEdcStatusClass(status: string): string {
    return STATUS_CONFIG[status as EDCStatus]?.class ?? 'edc-chip';
  }

  getStatusIcon(status: string): string {
    return STATUS_CONFIG[status as EDCStatus]?.icon ?? 'pi pi-question-circle';
  }

  getStatusColor(status: string): string {
    return STATUS_CONFIG[status as EDCStatus]?.color ?? '#6c757d';
  }
  /** 計算全機關機台數 */
  getGlobalStatusCount(status: '關機'): number {
    if (!this.filteredData) return 0;
    return this.filteredData.filter(row => this.isShutdown(row)).length;
  }
  /** 分別計算中信、聯信在特定狀態下的機台總數 */
  getBankStatusCount(bank: '中信' | '聯信', status: EDCStatus): number {
    if (!this.filteredData) return 0;
    return this.filteredData.filter(row => !this.isShutdown(row) && this.getBankStatus(row, bank) === status).length;
  }
  onSubmit(form: FormGroup) {
    this.loading = true;
    const rawValue = form.getRawValue(); // 改用 getRawValue 確保取值完整性
    // 封裝安全陣列的小工具函數
    const payload = {
      PageSize: 9999,
      PageIndex: 1,
      Day: rawValue.Day ?? 0,
      ECR_No: rawValue.ECR_No,
      TLT_No: [rawValue.TLT_No],
      tlt_building: [rawValue.tlt_building],
      tlt_floor: [rawValue.tlt_floor],
      area_no: [rawValue.area_no],
      EDC_IP: rawValue.EDC_IP ?? '',
      EDC_Online: rawValue.EDC_Online ?? '',
      EDC_TmID: rawValue.EDC_TmID ?? ''
    };
    this.tls44020Service.queryTLS44020(payload).pipe(finalize(() => this.loading = false)).subscribe((res) => {
      this.data = res.Data;
      this.filterDataByTab(); // 依照當前選取的 Tab 重新過濾資料
    });
  }
  onTabChange(item: MenuItem) {
    this.activeItem = item;
    this.filterDataByTab();
  }
  /** 將 Tab 的過濾邏輯獨立出來，確保按下「查詢」或切換 Tab 時，顯示的行為一致 */
  private filterDataByTab() {
    const label = this.activeItem?.label || '全部';
    if (label.includes('全部')) {
      this.filteredData = [...this.data];
    } else if (label.includes('連線')) {
      this.filteredData = this.data.filter(row =>
        this.getBankStatus(row, '中信') === '交易中' ||
        this.getBankStatus(row, '聯信') === '交易中'
      );
    } else if (label.includes('離線')) {
      this.filteredData = this.data.filter(row =>
        this.getBankStatus(row, '中信') !== '交易中' &&
        this.getBankStatus(row, '聯信') !== '交易中'
      );
    }
    this.applyFilter(); // 同步套用關鍵字過濾
  }
  applyFilter() {
    const keyword = this.globalFilter?.toLowerCase().trim();
    if (!keyword) return;

    this.filteredData = this.filteredData.filter(row =>
      row.ECR_LocNo?.toLowerCase().includes(keyword) ||
      row.TLT_No?.toLowerCase().includes(keyword) ||
      row.TLT_Name?.toLowerCase().includes(keyword) ||
      String(row.EOS_Status ?? '').toLowerCase().includes(keyword) ||
      row.EDC_IP1?.toLowerCase().includes(keyword) ||
      row.EDC_IP2?.toLowerCase().includes(keyword)
    );
  }
}
