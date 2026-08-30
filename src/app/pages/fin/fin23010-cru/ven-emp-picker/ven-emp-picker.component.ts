import { Component, DestroyRef, EventEmitter, Input, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { FIN23010Service, QueryVenEmpFIN23010Response } from '@service/api/fin/fin23010.service';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

export enum VenEmpPickedType {
  Vendor = 1,
  Employee = 2,
}

export interface VenEmpPicked {
  /** 員工編號 */
  code: string;
  type: VenEmpPickedType;
  /** 員工名稱 */
  venName: string;
  payType: string | null;
  payTypeName: string | null;
  bnkNo: string | null;
  bnkAccNo: string | null;
  bnkAccountName: string | null;
  /** 票據抬頭 */
  checkTitle: string | null;
  /** 統一編號/身分證字號 */
  venUniform: string | null;
}

/**
 * FIN23010 暫付款申請作業 - 「申請員工」彈窗選擇
 */
@Component({
  selector: 'app-fin23010-ven-emp-picker',
  standalone: true,
  templateUrl: './ven-emp-picker.component.html',
  imports: [DialogModule, InputTextModule, FormsModule, TableModule],
})
export class VenEmpPickerComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() selected = new EventEmitter<VenEmpPicked>();

  private readonly finService = inject(FIN23010Service);
  private readonly destroyRef = inject(DestroyRef);

  keyword = '';
  loading = false;
  hasSearched = false;
  rows: QueryVenEmpFIN23010Response[] = [];
  private readonly keyword$ = new Subject<string>();

  constructor() {
    this.keyword$.pipe(
      debounceTime(300),
      switchMap(keyword => {
        this.loading = true;
        return this.finService.queryVenEmpFIN23010({
          Keyword: keyword || null,
          VenEmpType: 'E', // 固定查詢員工 (E)
        });
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: res => {
        this.rows = res.Data ?? [];
        this.hasSearched = true;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onShow(): void {
    this.keyword = '';
    this.hasSearched = false;
    this.rows = [];
    this.search();
  }

  onKeywordChange(): void {
    this.search();
  }

  private search(): void {
    this.keyword$.next(this.keyword.trim());
  }

  pick(row: QueryVenEmpFIN23010Response): void {
    if (!row.VenNo) return;
    this.selected.emit({
      code: row.VenNo,
      type: VenEmpPickedType.Employee,
      venName: row.VenName ?? '',
      payType: row.PayType,
      payTypeName: row.PayTypeName,
      bnkNo: row.BnkNo,
      bnkAccNo: row.BnkAccNo,
      bnkAccountName: row.BnkAccountName,
      checkTitle: row.CheckTitle,
      venUniform: row.VenUniform,
    });
    this.close();
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}