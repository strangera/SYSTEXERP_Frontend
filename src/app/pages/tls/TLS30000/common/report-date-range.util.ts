import { FormControl, FormGroup, Validators } from '@angular/forms';
import { yesterday } from '@shared/models/system/query-form.model';

/**
 * 「報表日期類型切換」共用邏輯（日/週/月/半年/年/區間 6 種模式）。
 *
 * 適用範圍：tls31020/tls31030/tls31040/tls31050/tls31060/tls31070 這六支「各XX之營業報表」
 * 查詢頁，原本各自複製一份幾乎逐行相同的 dateForm 定義 + onReportTypeChange/setReadOnlyFields/
 * queryEvent/syncDateToQueryForm/onClearDate 邏輯，現在共用邏輯抽到這裡，dateForm 本身、
 * queryWeek()（呼叫 TLS26050Service）、以及頁面自己的結果狀態清空仍留在各頁面。
 *
 * 呼叫端寫法（沿用各頁面原本的方法名稱與呼叫時機，只是方法本體改呼叫這裡的共用函式）：
 * ```ts
 * reportTypeOptions = REPORT_DATE_TYPE_OPTIONS;
 * halfyearOptions = REPORT_HALFYEAR_OPTIONS;
 * EventIDOptions: ReportEventDateOption[] = [
 *   { value: '1', label: '活動1', TXN_DateS: null, TXN_DateE: null },
 *   { value: '2', label: '活動2', TXN_DateS: null, TXN_DateE: null },
 * ];
 *
 * onReportTypeChange(event: any) { applyReportDateTypeValidators(this.dateForm, event); }
 * setReadOnlyFields() { disableComputedReportDateFields(this.dateForm); }
 * queryEvent(event: any) { applyEventDateRange(this.dateForm, this.EventIDOptions, event); }
 * private syncDateToQueryForm() {
 *   const { start, end } = computeReportDateRange(this.dateForm);
 *   if (start) this.queryForm.get('TXN_DateS')?.setValue(start);
 *   if (end) this.queryForm.get('TXN_DateE')?.setValue(end);
 * }
 * onClearDate() {
 *   resetReportDateForm(this.dateForm);
 *   // ...頁面各自清空 data/totalRecords/footer 等查詢結果狀態...
 *   this.setReadOnlyFields();
 *   this.syncDateToQueryForm();
 * }
 * ```
 *
 * 保留的既存不一致（刻意原封不動抽出，不順手修正）：
 * `applyReportDateTypeValidators` 的 switch 有 case '7'（活動區間）會設必填驗證，但
 * `computeReportDateRange` 沒有對應 case '7' 的日期回填邏輯，且 `REPORT_DATE_TYPE_OPTIONS`
 * 本身也只到 '6'（UI 選不到 '7'）——這是原始 6 份程式碼共同就有的死分支，這裡只做等價抽取，
 * 不在重構時順便補上，避免變成沒人記錄原因的行為變更。
 */

export const REPORT_DATE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '1', label: '日營業報表' },
  { value: '2', label: '週營業報表' },
  { value: '3', label: '月營業報表' },
  { value: '4', label: '半年營業報表' },
  { value: '5', label: '年營業報表' },
  { value: '6', label: '區間營業報表' },
];

export const REPORT_HALFYEAR_OPTIONS: { value: string; label: string }[] = [
  { value: '1', label: '上半年' },
  { value: '2', label: '下半年' },
];

export interface ReportDateFormControls {
  reportType: FormControl<string>;
  onedatedd: FormControl<Date>;
  onedateyy: FormControl<Date>;
  weeks: FormControl<string>;
  startdate: FormControl<Date | null>;
  enddate: FormControl<Date | null>;
  onedatemm: FormControl<Date | null>;
  halfyear_onedateyy: FormControl<Date>;
  halfyear: FormControl<string>;
  year_onedateyy: FormControl<Date>;
  sad_startdate: FormControl<Date | null>;
  sad_enddate: FormControl<Date | null>;
  eventID: FormControl<null>;
  event_startdate: FormControl<Date | null>;
  event_enddate: FormControl<Date | null>;
}

export type ReportDateForm = FormGroup<ReportDateFormControls>;

export interface ReportEventDateOption {
  value: string;
  label: string;
  TXN_DateS: Date | null;
  TXN_DateE: Date | null;
}

/** 依 reportType 切換各日期欄位的必填驗證（原 onReportTypeChange 內容）。 */
export function applyReportDateTypeValidators(dateForm: ReportDateForm, reportType: string): void {
  Object.keys(dateForm.controls).forEach((key) => {
    if (key !== 'reportType') dateForm.get(key)?.clearValidators();
  });

  switch (reportType) {
    case '1':
      dateForm.get('onedatedd')?.setValidators([Validators.required]);
      break;
    case '2':
      dateForm.get('onedateyy')?.setValidators([Validators.required]);
      dateForm.get('weeks')?.setValidators([Validators.required]);
      dateForm.get('startdate')?.setValidators([Validators.required]);
      dateForm.get('enddate')?.setValidators([Validators.required]);
      break;
    case '3':
      dateForm.get('onedatemm')?.setValidators([Validators.required]);
      break;
    case '4':
      dateForm.get('halfyear_onedateyy')?.setValidators([Validators.required]);
      break;
    case '5':
      dateForm.get('year_onedateyy')?.setValidators([Validators.required]);
      break;
    case '6':
      dateForm.get('sad_startdate')?.setValidators([Validators.required]);
      dateForm.get('sad_enddate')?.setValidators([Validators.required]);
      break;
    case '7':
      dateForm.get('event_startdate')?.setValidators([Validators.required]);
      dateForm.get('event_enddate')?.setValidators([Validators.required]);
      break;
  }

  Object.keys(dateForm.controls).forEach((key) => {
    dateForm.get(key)?.updateValueAndValidity();
  });
}

/** 「區間」「活動區間」的起訖日欄位維持唯讀（值由週次查詢/活動下拉連動帶入，不給使用者直接打字）。 */
export function disableComputedReportDateFields(dateForm: ReportDateForm): void {
  dateForm.controls.startdate.disable();
  dateForm.controls.enddate.disable();
  dateForm.controls.event_startdate.disable();
  dateForm.controls.event_enddate.disable();
}

/** 依選擇的活動代碼，把對應的起訖日帶入 dateForm（原 queryEvent 內容）。 */
export function applyEventDateRange(
  dateForm: ReportDateForm,
  eventOptions: ReportEventDateOption[],
  eventValue: string,
): void {
  dateForm.controls.event_startdate.setValue(
    eventOptions.find((x) => x.value === eventValue)?.TXN_DateS ?? null,
  );
  dateForm.controls.event_enddate.setValue(
    eventOptions.find((x) => x.value === eventValue)?.TXN_DateE ?? null,
  );
}

/** 依目前 reportType 與各日期欄位的值，算出這次查詢要用的起訖日（原 syncDateToQueryForm 的計算部分）。 */
export function computeReportDateRange(dateForm: ReportDateForm): { start: Date | null; end: Date | null } {
  const reportType = dateForm.get('reportType')?.value;
  let start: Date | null = null;
  let end: Date | null = null;

  switch (reportType) {
    case '1':
      start = dateForm.get('onedatedd')?.value ?? null;
      end = start;
      break;
    case '2':
      start = dateForm.get('startdate')?.value ?? null;
      end = dateForm.get('enddate')?.value ?? null;
      break;
    case '3': {
      const onedatemm = dateForm.get('onedatemm')?.value as Date | null;
      if (onedatemm) {
        start = new Date(onedatemm.getFullYear(), onedatemm.getMonth(), 1);
        end = new Date(onedatemm.getFullYear(), onedatemm.getMonth() + 1, 0);
      }
      break;
    }
    case '4': {
      const dateValue = dateForm.get('halfyear_onedateyy')?.value as Date | string;
      const year = dateValue instanceof Date ? dateValue.getFullYear() : Number(dateValue);
      const half = String(dateForm.get('halfyear')?.value);
      if (year) {
        if (half === '1') {
          start = new Date(year, 0, 1);
          end = new Date(year, 5, 30);
        } else if (half === '2') {
          start = new Date(year, 6, 1);
          end = new Date(year, 11, 31);
        }
      }
      break;
    }
    case '5': {
      const dateValue = dateForm.get('year_onedateyy')?.value as Date | string;
      const year = dateValue instanceof Date ? dateValue.getFullYear() : Number(dateValue);
      if (year) {
        start = new Date(year, 0, 1);
        end = new Date(year, 11, 31);
      }
      break;
    }
    case '6':
      start = dateForm.get('sad_startdate')?.value ?? null;
      end = dateForm.get('sad_enddate')?.value ?? null;
      break;
  }

  return { start, end };
}

/**
 * 重置 dateForm 回預設狀態（原 onClearDate 裡跟日期表單本身有關的那半段）。
 * 呼叫端自己的 onClearDate() 仍需自行清空查詢結果狀態（data/totalRecords/footer...），
 * 這裡只負責 dateForm。
 */
export function resetReportDateForm(dateForm: ReportDateForm): void {
  dateForm.reset({
    reportType: '1',
    onedatedd: yesterday,
  } as Partial<{ [K in keyof ReportDateFormControls]: ReportDateFormControls[K]['value'] }>);
}
