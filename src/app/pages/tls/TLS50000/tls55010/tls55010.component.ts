import { DatePipe, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CheckTls55010Data, QueryTLS55010OneMonthResponse, Tls55010DateRequest, Tls55010Service } from '@service/api/tls/tls55010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from "@shared/components/input-text/input-text.component";
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { Column, formatAmount, formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls55010',
  templateUrl: './tls55010.component.html',
  styles: `
  /* 定義進入動畫，讓圖示出現時更平滑 */
.animated {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.fadeIn { animation-name: fadeIn; }

/* 錯誤時的小抖動，提醒使用者注意 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

.shake { animation-name: shake; }
  `,
  standalone: true,
  imports: [NgSwitch, NgSwitchDefault, NgSwitchCase, DropdownComponent, PanelModule, TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, ButtonComponent, TranslateModule, InputTextComponent]
})
export class TLS55010Component extends BasicQueryPageComponent<CheckTls55010Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    TXN_Date: [null as Date | null, Validators.required],
  });
  lastDate?: Tls55010DateRequest;
  data: any = [];
  columns: ReportColumn[] = [
    { field: 'check_content', header: '檢查內容' },
    { field: 'isPassed', header: '是否通過' },
  ];
  cls_date?: string;
  expansionColumns: Column[] = [
    { field: 'cls_date', header: '交易日期' },
    { field: 'check_result', header: '結果說明' },
  ]
  constructor(
    private readonly tls55010Service: Tls55010Service,
    private readonly datePipe: DatePipe,
    private readonly cdr: ChangeDetectorRef
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS55010', '/tls/tls55010cru');
    // 初始化時獲取日期
    this.refreshCloseDate();
    this.data = getSYS1000Options('IMSCLOSE')
      .filter((item: { value: string; label: string }) => item.value !== '3') // 這裡直接過濾
      .map((item: { value: string; label: string }) => ({
        ...item,
        check_content: item.label,
        checkStatus: 'init', // 確保狀態初始化
        details: []
      }));
  }
  /**
   * 查詢日結紀錄方法 (等待後端 API)
   */
  historyLoading = false;
  showHistory = false;
  historyData: QueryTLS55010OneMonthResponse[] = []; // 存放歷史紀錄資料
  // 歷史紀錄的欄位定義
  historyColumns: ReportColumn[] = [
    { field: 'CLS_DATE', header: '關帳日期', visible: true, format: formatDate },
    { field: 'Cls_ExecDate', header: '日關帳鎖定日期', visible: true, format: formatDate },
    { field: 'Lock_USR_No', header: '日關帳鎖定人員', visible: true },
    { field: 'Lock_USR_Name', header: '日關帳鎖定人員姓名', visible: true },
  ];
  onQueryHistory() {
    const txnDate = this.datePipe.transform(this.queryForm.value.TXN_Date, 'yyyy-MM-dd');
    if (!txnDate) {
      this.messageService.warnBubble('請先選擇結帳日期');
      return;
    }

    this.showHistory = true; // 切換到歷史
    this.historyLoading = true;

    const body = {
      TXN_Date: this.datePipe.transform(txnDate, 'yyyy-MM-dd') || '',
    }
    this.tls55010Service.queryTLS55010OneMonth(body).pipe(untilDestroyed(this), finalize(() => this.historyLoading = false)).subscribe((res) => {
      this.historyData = res.Data.QueryData;
    })
  }
  onQuery(frm: FormGroup) {
    this.showHistory = false; // 關閉歷史紀錄視窗
    this.isConfirmDate = false; // 切換回檢查結果表格

    this.handleSubmit(frm, () => {
      const body = {
        TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd') || '',
      };

      // 1. 初始化狀態：將所有檢查項目的狀態設為 'loading'，並清空先前的細節
      this.data.forEach((item: any) => {
        item.checkStatus = 'loading';
        item.details = [];
      });

      this.messageService.infoBubble('日結檢查中，請稍候...');

      // 開始 API 呼叫
      this.tls55010Service.checkTLS55010(body)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
            // 2. 呼叫結束後，檢查哪些還是 loading 的，代表它們通過了（後端沒回傳錯誤）
            this.data.forEach((item: any) => {
              if (item.checkStatus === 'loading') {
                item.checkStatus = 'success';
              }
            });
            this.cdr.detectChanges(); // 強制觸發畫面更新，確保動畫流暢
          })
        )
        .subscribe({
          next: (res) => {
            this.messageService.successBubble(res.Message);

            // 3. 建立 Map 方便快速索引檢查項目
            const checkItemMap = new Map<string, any>();
            this.data.forEach((item: any) => {
              checkItemMap.set(String(item.value), item);
            });

            // 4. 根據後端回傳的 Data (錯誤列表) 更新特定項目的狀態為 'error'
            if (res.Data && Array.isArray(res.Data)) {
              res.Data.forEach((error: any) => {
                const stepCode = String(error.step_num);
                const targetItem = checkItemMap.get(stepCode);

                if (targetItem) {
                  targetItem.checkStatus = 'error';
                  // 填充展開表格需要的明細資料
                  targetItem.details.push({
                    cls_date: error.cls_date,
                    check_result: error.check_result,
                    mid: error.mid,
                    master_key: error.master_key
                  });
                }
              });
            }
          },
          error: (err) => {
            this.data.forEach((item: any) => (item.checkStatus = 'error'));
          }
        });
    });
  }
  insertLoading = false;
  // 宣告是否確定日期變數
  isConfirmDate = false;
  onSubmit(frm: FormGroup) {
    this.showHistory = false; // 關閉歷史
    this.handleSubmit(frm, () => {
      // 1. 前端初步卡控：檢查日期是否為 最近關帳日 + 1 day
      if (this.cls_date) {
        const lastDate = new Date(this.cls_date);
        const targetDate = new Date(lastDate);
        targetDate.setDate(lastDate.getDate() + 1);
        const selectedDate = new Date(frm.value.TXN_Date);

        if (selectedDate.toDateString() !== targetDate.toDateString()) {
          this.messageService.warnBubble(`日結日期錯誤！最近關帳日為 ${this.cls_date}，今日僅能日結 ${targetDate.toLocaleDateString()}。`);
          this.loading = false;
          return;
        }
      }

      this.loading = false;
      this.insertLoading = true;
      const body = {
        TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd') || '',
      }
      this.messageService.infoBubble('日結中,請稍候...');
      this.tls55010Service.insertTLS55010(body).pipe(untilDestroyed(this), finalize(() => this.insertLoading = false)).subscribe((res) => {
        this.messageService.successBubble(res.Message);
        this.isConfirmDate = true;
        this.lastDate = body.TXN_Date as unknown as Tls55010DateRequest;
        this.refreshCloseDate();
        this.dataForm.patchValue(res.Data.Data._gls6001);
        this.data2 = res.Data.Data._gls6002s.map((item: any) => ({
          ...item,
          DAccAmt: item.AccDC === 'D' ? item.AccAmt : 0,
          CAccAmt: item.AccDC === 'C' ? item.AccAmt : 0,
        }));
        this.footerData2 = [
          {
            DAccAmt: this.data2.reduce((sum, item) => sum + (item.DAccAmt || 0), 0),
            CAccAmt: this.data2.reduce((sum, item) => sum + (item.CAccAmt || 0), 0),
          },
        ]
      });
    });
  }
  queryLoading = false;
  onQueryVou(frm: FormGroup) {
    this.showHistory = false; // 關閉歷史
    this.handleSubmit(frm, () => {
      this.loading = false;
      this.queryLoading = true;
      const body = {
        TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd') || '',
      }
      this.tls55010Service.queryTLS55010(body).pipe(untilDestroyed(this), finalize(() => this.queryLoading = false)).subscribe((res) => {
        this.isConfirmDate = true;
        if (!res.Data) {
          this.messageService.warnBubble('查無資料');
          this.data2 = [];
          this.footerData2 = [];
          this.dataForm.reset();
          return;
        }
        this.messageService.successBubble(res.Message);
        this.dataForm.patchValue(res.Data.Data._gls6001);
        this.data2 = res.Data.Data._gls6002s.map((item: any) => ({
          ...item,
          DAccAmt: item.AccDC === 'D' ? item.AccAmt : 0,
          CAccAmt: item.AccDC === 'C' ? item.AccAmt : 0,
        }));
        this.footerData2 = [
          {
            DAccAmt: this.data2.reduce((sum, item) => sum + (item.DAccAmt || 0), 0),
            CAccAmt: this.data2.reduce((sum, item) => sum + (item.CAccAmt || 0), 0),
          },
        ]
      });
    });
  }
  dataForm = this.formBuilder.nonNullable.group({
    VouNo: [{ value: null as string | null, disabled: true }],
    VouType: [{ value: null as string | null, disabled: true }],
    VouDate: [{ value: null as string | null, disabled: true }],
    SrcSheetType: [{ value: null as string | null, disabled: true }],
    SrcSheetNo: [{ value: null as string | null, disabled: true }],
    PostFlag: [{ value: null as string | null, disabled: true }],
    INV_YN: [{ value: null as string | null, disabled: true }],
    Remark: [{ value: null as string | null, disabled: true }],
    CRT_Date: [{ value: null as string | null, disabled: true }],
    CRT_USR_No: [{ value: null as string | null, disabled: true }],
    CRT_USR_Name: [{ value: null as string | null, disabled: true }],
    UPD_Date: [{ value: null as string | null, disabled: true }],
    UPD_USR_No: [{ value: null as string | null, disabled: true }],
    UPD_USR_Name: [{ value: null as string | null, disabled: true }],
  });
  VouTypeOptions = getSYS1000Options('VouType');
  PostFlagOptions = getSYS1000Options('PostFlag');
  columns2: ReportColumn[] = [
    { field: 'SerNo', header: '序號', align: 'left' },
    { field: 'AccNo', header: '科目代號', align: 'left' },
    { field: 'ACCCNAME', header: '科目名稱', align: 'left' },
    { field: 'NoteDesc', header: '摘要', align: 'left' },
    { field: 'DAccAmt', header: '借方金額', format: formatAmount, isTotal: true, align: 'right' },
    { field: 'CAccAmt', header: '貸方金額', format: formatAmount, isTotal: true, align: 'right' },
    { field: 'ORG_ID', header: '組織編號', align: 'left' },
    { field: 'DetailNo', header: '廠商編號', align: 'left' },
    { field: 'VEN_NAME', header: '廠商名稱', align: 'left' },
    { field: 'ProjectNo', header: '活動代號', align: 'left' },
    { field: 'PTA', header: '立沖代號' },
  ]
  data2: any[] = []
  footerData2: any = {};
  reverseLoading = false;
  // 反日節方法
  onReverse(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = false;
      const body = {
        TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd') || '',
      }
      this.reverseLoading = true;
      this.messageService.infoBubble('反日結中,請稍候...');
      this.tls55010Service.unLockTLS55010(body).pipe(untilDestroyed(this), finalize(() => this.reverseLoading = false)).subscribe((res) => {
        this.messageService.successBubble(res.Message);
        this.dataForm.reset();
        this.data2 = [];
        this.refreshCloseDate();
      });
    });
  }

  /**
 * 從後端獲取最新關帳日，並同步更新表單結帳日期為 關帳日 + 1
 */
  private refreshCloseDate(): void {
    this.tls55010Service.getTLS55010Date().pipe(untilDestroyed(this)).subscribe((res) => {
      if (res?.Data?.CLS_DATE) {
        this.cls_date = res.Data.CLS_DATE;

        // 計算下一天
        const closeDate = new Date(res.Data.CLS_DATE);
        closeDate.setDate(closeDate.getDate() + 1);

        // 更新表單日期
        this.queryForm.patchValue({ TXN_Date: closeDate });

        // 如果有涉及 ChangeDetection 也可以手動觸發一下
        this.cdr.detectChanges();
      }
    });
  }
}
