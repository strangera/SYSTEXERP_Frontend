import { DestroyRef, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Option } from '@service/utility/dropdown-api.model';
import { Sys0110Service } from '@service/api/sys/sys0110.service';
import { UserData } from '@shared/models/sys/user.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';

/** 1=廠商 2=員工 (對應 SP_FIN23010GetById 的 VenEmpType 回顯欄位) */
export enum VenEmpPickedType {
  Vendor = 1,
  Employee = 2,
}

export interface VenEmpPicked {
  /** 廠商編號 / 員工編號 */
  code: string;
  type: VenEmpPickedType;
}

const PAGE_SIZE = 20;

/**
 * FIN23010 暫付款申請作業 - 「申請廠商/員工」彈窗選擇
 * 廠商：走既有 queryPOS2013_DropDownList(全檔)，前端關鍵字篩選(編號/名稱)。
 * 員工：走既有 Sys0110Service.queryUser(後端分頁)。
 * 選定後僅回傳代號+類別，實際欄位帶入由呼叫端另外呼叫 FIN23010Service.queryVenFIN23010 / queryEmpFIN23010 取得。
 */
@Component({
  selector: 'app-fin23010-ven-emp-picker',
  standalone: true,
  templateUrl: './ven-emp-picker.component.html',
  imports: [DialogModule, RadioButtonModule, InputTextModule, ButtonModule, FormsModule, TableModule],
})
export class VenEmpPickerComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() selected = new EventEmitter<VenEmpPicked>();

  private readonly dropdown = inject(DropdownApiService);
  private readonly sys0110 = inject(Sys0110Service);
  private readonly destroyRef = inject(DestroyRef);

  mode: 'vendor' | 'employee' = 'vendor';
  keyword = '';
  loading = false;
  hasSearched = false;

  private vendorOptions: Option[] = [];
  filteredVendors: Option[] = [];

  employees: UserData[] = [];
  totalRecords = 0;
  readonly pageSize = PAGE_SIZE;

  onShow(): void {
    this.keyword = '';
    this.hasSearched = false;
    this.filteredVendors = [];
    this.employees = [];
    this.totalRecords = 0;
    if (this.mode === 'vendor') {
      this.loadVendors();
    }
  }

  onModeChange(): void {
    this.keyword = '';
    this.hasSearched = false;
    this.filteredVendors = [];
    this.employees = [];
    this.totalRecords = 0;
    if (this.mode === 'vendor') {
      this.loadVendors();
    }
  }

  private loadVendors(): void {
    this.loading = true;
    this.dropdown.queryPos2013({ VEN_Flag: '' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: options => {
          this.vendorOptions = options ?? [];
          this.filteredVendors = this.vendorOptions;
          this.hasSearched = true;
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
  }

  onSearch(): void {
    if (this.mode === 'vendor') {
      const kw = this.keyword.trim().toLowerCase();
      this.filteredVendors = !kw
        ? this.vendorOptions
        : this.vendorOptions.filter(v =>
          String(v['VEN_No'] ?? v.value ?? '').toLowerCase().includes(kw) ||
          String(v['Name'] ?? v.label ?? '').toLowerCase().includes(kw) ||
          String(v['ShortName'] ?? '').toLowerCase().includes(kw));
      this.hasSearched = true;
    } else {
      this.fetchEmployees(1);
    }
  }

  onEmployeeLazyLoad(event: TableLazyLoadEvent): void {
    if (!this.hasSearched) return;
    const pageIndex = Math.floor((event.first ?? 0) / this.pageSize) + 1;
    this.fetchEmployees(pageIndex);
  }

  private fetchEmployees(pageIndex: number): void {
    this.hasSearched = true;
    this.loading = true;
    this.sys0110.queryUser({
      user_No: this.keyword || undefined,
      user_Name: this.keyword || undefined,
      PageIndex: pageIndex,
      PageSize: this.pageSize,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.employees = res.Data ?? [];
          this.totalRecords = res.TotalCount ?? this.employees.length;
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
  }

  pickVendor(row: Option): void {
    const code = String(row['VEN_No'] ?? row.value ?? '');
    if (!code) return;
    this.selected.emit({ code, type: VenEmpPickedType.Vendor });
    this.close();
  }

  pickEmployee(row: UserData): void {
    if (!row.user_No) return;
    this.selected.emit({ code: row.user_No, type: VenEmpPickedType.Employee });
    this.close();
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
