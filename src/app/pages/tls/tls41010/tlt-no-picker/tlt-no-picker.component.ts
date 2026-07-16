import { ChangeDetectionStrategy, Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TLTTALENTActiveContractItem } from '../../../../service/utility/dropdown-api.model';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { InputTextComponent } from '../../../../shared/components/input-text/input-text.component';
import { TableReportComponent } from '../../../../shared/components/table-report/table-report.component';
import { ReportColumn } from '../../../../shared/components/table-report/table-report.model';

/**
 * 專櫃編號選擇器（查詢頁 tls41010 / 新增編輯頁 tls41010-cru 共用）
 *
 * - 主輸入框可直接手動輸入專櫃代號，沿用 app-input-text 內建的 showButton/buttonLabel（比照
 *   fin24020-cru 既有「查詢」按鈕的用法），label / 必填紅字星號 / 錯誤訊息 / 按鈕對齊皆由 app-input-text
 *   自己排版，不額外包 flex 容器，避免跟其他欄位對不齊
 * - 按鈕開啟 app-dialog，內含即時（前端記憶體）篩選的 app-table-report 清單
 * - 點選清單某列 → 將該列「專櫃代號(No)」寫回 FormControl 並關閉彈窗
 *   （欄位最終只會顯示代號本身，不會顯示「代號 - 名稱」的組合文字）
 */
@Component({
  selector: 'app-tlt-no-picker',
  templateUrl: './tlt-no-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    DialogComponent,
    InputTextComponent,
    TableReportComponent,
  ],
})
export class TltNoPickerComponent {
  @Input() label = '專櫃編號';
  @Input() controlName = 'ECR_TLT_No';
  @Input() control = new FormControl();
  @Input() submitted = false;

  /** 彈窗清單欄位設定（查詢頁 7 欄 / 新增頁 11 欄，由外部頁面傳入） */
  @Input() columns: ReportColumn[] = [];

  /** 彈窗寬度（新增頁欄位較多，由外部頁面傳入較寬的值） */
  @Input() dialogWidth = '960px';

  /**
   * 使用者實際點選的那一整筆合約資料。
   * 同一專櫃(No)現在可能同時存在「目前生效中」與「尚未生效的新營運區間」多筆合約(以 talent_id 區分)，
   * 外部頁面應改用這筆資料直接帶入表單欄位，不要再用專櫃代號(No)回頭去 CounterOptions 裡 find(可能挑到錯的那一筆)。
   */
  @Output() rowSelect = new EventEmitter<TLTTALENTActiveContractItem>();

  /** 下拉資料來源：queryTltTalentActiveContract() 回傳的專櫃合約清單（已全部載入記憶體） */
  private readonly _options = signal<TLTTALENTActiveContractItem[]>([]);
  @Input() set options(value: TLTTALENTActiveContractItem[] | null) {
    this._options.set(value ?? []);
  }
  get options(): TLTTALENTActiveContractItem[] {
    return this._options();
  }

  readonly dialogVisible = signal(false);
  readonly filterText = signal('');
  /**
   * 表格延後掛載旗標：p-dialog 開啟動畫尚未結束前容器寬高還沒定案，
   * 若這時就掛載 app-table-report(內部有 virtualScroll) 量測到的視窗尺寸會是錯的，導致清單看起來空白。
   * 因此改成等 app-dialog 的 (show)（對應 p-dialog 的 onShow，動畫完全結束才觸發）之後才掛載表格。
   */
  readonly tableReady = signal(false);

  /** 依「專櫃代號」或「專櫃名稱」做 contains 篩選（不分大小寫），純前端記憶體運算，不打 API */
  readonly filteredOptions = computed(() => {
    const keyword = this.filterText().trim().toLowerCase();
    const list = this._options();
    if (!keyword) return list;
    return list.filter(item =>
      (item.No ?? '').toLowerCase().includes(keyword) ||
      (item.Name ?? '').toLowerCase().includes(keyword)
    );
  });

  openDialog(): void {
    this.filterText.set('');
    this.tableReady.set(false);
    this.dialogVisible.set(true);
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
    this.filterText.set('');
    this.tableReady.set(false);
  }

  onFilterInput(event: Event): void {
    this.filterText.set((event.target as HTMLInputElement).value);
  }

  /** 點選清單某列：把專櫃代號(No)寫回 FormControl(不帶名稱)，同時把整筆資料 emit 出去讓外部精確帶入 */
  selectRow(row: TLTTALENTActiveContractItem): void {
    this.rowSelect.emit(row);
    this.control.setValue(row.No);
    this.control.markAsDirty();
    this.closeDialog();
  }
}
