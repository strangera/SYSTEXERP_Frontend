import { DestroyRef, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { FIN23010Service, QueryVenEmpFIN23010Response } from '@service/api/fin/fin23010.service';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

/** 1=廠商 2=員工 (依回傳列資料的 VenFlag 即時判斷：VenFlag==='2' 為員工，其餘為廠商) */
export enum VenEmpPickedType {
  Vendor = 1,
  Employee = 2,
}

export interface VenEmpPicked {
  /** 廠商編號 / 員工編號 */
  code: string;
  type: VenEmpPickedType;
  /** 廠商/員工名稱 */
  venName: string;
  payType: string | null;
  payTypeName: string | null;
  bnkNo: string | null;
  bnkAccNo: string | null;
  bnkAccountName: string | null;
  /** 票據抬頭(僅廠商有意義) */
  checkTitle: string | null;
  /** 統一編號/身分證字號 */
  venUniform: string | null;
}

/**
 * FIN23010 暫付款申請作業 - 「申請廠商/員工」彈窗選擇
 * 廠商與員工實際上共用同一張POS2013主檔(僅VEN_Flag不同)，一支API(queryVenEmpFIN23010)即可查詢兩種類型，
 * 不再分別呼叫DropdownApiService.queryPos2013(廠商)與Sys0110Service.queryUser(員工，SYS0110使用者主檔，
 * 與本作業實際查詢對象不符)。輸入關鍵字debounce後即時查詢，不需查詢按鈕；選定後直接回傳完整回填欄位，
 * 呼叫端不需再另外呼叫queryVenFIN23010/queryEmpFIN23010。
 */
@Component({
  selector: 'app-fin23010-ven-emp-picker',
  standalone: true,
  templateUrl: './ven-emp-picker.component.html',
  imports: [DialogModule, RadioButtonModule, InputTextModule, FormsModule, TableModule],
})
export class VenEmpPickerComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() selected = new EventEmitter<VenEmpPicked>();

  private readonly finService = inject(FIN23010Service);
  private readonly destroyRef = inject(DestroyRef);

  mode: 'vendor' | 'employee' = 'vendor';
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
          VenEmpType: this.mode === 'vendor' ? 'V' : 'E',
        });
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: res => {
        this.rows = res.Data ?? [];
        this.hasSearched = true;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  onShow(): void {
    this.keyword = '';
    this.hasSearched = false;
    this.rows = [];
    this.search();
  }

  onModeChange(): void {
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
      type: row.VenFlag === '2' ? VenEmpPickedType.Employee : VenEmpPickedType.Vendor,
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
