import { Component, DestroyRef, EventEmitter, Input, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TableComponent } from '@others/component/table/table.component';
import { Column, LazyLoadEvent } from '@others/component/table/table.model';
import { UserData } from '@shared/models/sys/user.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FIN55050Service, VendorPickerItem } from '../../../../service/api/fin/fin55050.service';
import { Sys0110Service } from '../../../../service/api/sys/sys0110.service';

const PAGE_SIZE = 30;

const VENDOR_COLUMNS: Column[] = [
  { field: 'VEN_No', header: '廠商編號', style: 'width: 40%' },
  { field: 'VEN_Name', header: '廠商名稱', style: 'width: 60%' },
];

const USER_COLUMNS: Column[] = [
  { field: 'user_No', header: '使用者編號', style: 'width: 40%' },
  { field: 'user_Name', header: '使用者名稱', style: 'width: 60%' },
];

@Component({
  selector: 'app-ven-user-picker',
  templateUrl: './ven-user-picker.component.html',
  standalone: true,
  imports: [DialogModule, RadioButtonModule, InputTextModule, ButtonModule, FormsModule, TableComponent],
})
export class VenUserPickerComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() selected = new EventEmitter<string>();

  private readonly fin55050 = inject(FIN55050Service);
  private readonly sys0110 = inject(Sys0110Service);
  private readonly destroyRef = inject(DestroyRef);

  mode: 'vendor' | 'user' = 'vendor';
  venNo = '';
  venName = '';
  userId = '';
  userName = '';
  loading = false;
  hasSearched = false;

  tableData: VendorPickerItem[] | UserData[] = [];
  totalRecords = 0;
  columns: Column[] = VENDOR_COLUMNS;
  dataKey = 'VEN_No';
  readonly pageSize = PAGE_SIZE;

  onShow(): void {
    this.venNo = '';
    this.venName = '';
    this.userId = '';
    this.userName = '';
    this.tableData = [];
    this.totalRecords = 0;
    this.hasSearched = false;
  }

  onModeChange(): void {
    this.venNo = '';
    this.venName = '';
    this.userId = '';
    this.userName = '';
    this.tableData = [];
    this.totalRecords = 0;
    this.hasSearched = false;
    if (this.mode === 'vendor') {
      this.columns = VENDOR_COLUMNS;
      this.dataKey = 'VEN_No';
    } else {
      this.columns = USER_COLUMNS;
      this.dataKey = 'user_No';
    }
  }

  onSearch(): void {
    this.hasSearched = true;
    if (this.mode === 'vendor') {
      this.fetchVendors(1);
    } else {
      this.fetchUsers(1);
    }
  }

  onLazyLoad(event: LazyLoadEvent): void {
    if (!this.hasSearched) return;
    if (this.mode === 'vendor') {
      this.fetchVendors(event.pageIndex);
    } else {
      this.fetchUsers(event.pageIndex);
    }
  }

  private fetchVendors(pageIndex: number): void {
    this.loading = true;
    this.fin55050.queryVendorPicker({
      VEN_No: this.venNo || undefined,
      VEN_Name: this.venName || undefined,
      PageIndex: pageIndex,
      PageSize: this.pageSize,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.tableData = res.Data ?? [];
          this.totalRecords = res.TotalCount ?? 0;
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
  }

  private fetchUsers(pageIndex: number): void {
    this.loading = true;
    this.sys0110.queryUser({
      user_No: this.userId || undefined,
      user_Name: this.userName || undefined,
      PageIndex: pageIndex,
      PageSize: this.pageSize,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: ApiResponse<UserData[]>) => {
          this.tableData = res.Data ?? [];
          this.totalRecords = res.TotalCount ?? 0;
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
  }

  onPickerDetail(row: VendorPickerItem | UserData): void {
    const code = 'VEN_No' in row ? row.VEN_No : row.user_No;
    this.selected.emit(code);
    this.close();
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
