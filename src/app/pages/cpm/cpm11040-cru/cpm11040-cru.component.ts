/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs';

import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column } from '../../../shared/componentkit/table/table.model';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { NgIf } from '@angular/common';
import { CPM11040Data, CPM11040Service } from '../../../service/api/cpm/cpm11040.service';
import { getSYS1000Options } from '../../../service/system/sys1000.service';

@UntilDestroy()
@Component({
  selector: 'app-cpm11040-cru',
  templateUrl: './cpm11040-cru.component.html',
  styleUrls: ['./cpm11040-cru.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,

    ButtonComponent,
    TranslateModule,
    CalendarComponent,
    NgIf,
    DialogModule,
    TableComponent,
  ],
})
export class CPM11040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  readonly CRUD = CRUDStatus;

  dataForm = this.formBuilder.group({
    // 出借編號 - 彈跳選擇，必填
    LoanNo: [null as string | null, [Validators.required]],
    // 歸還處理人員 - readonly
    ReturnUserName: [{ value: '', disabled: true }],
    // 歸還日期 - 預設當下，disabled
    ReturnDate: [{ value: new Date(), disabled: true }, [Validators.required]],
    // 歸還時間 - 預設當下，disabled
    ReturnTime: [{ value: new Date(), disabled: true }, [Validators.required]],
    // 以下為查詢後帶入的 readonly 欄位
    ServiceID: [{ value: '', disabled: true }], // 服務台位置編號
    LoanDate: [{ value: null as Date | null, disabled: true }], // 出借日期
    UserName: [{ value: '', disabled: true }], // 姓名
    LoanPhone: [{ value: '', disabled: true }], // 連絡電話
    CertType: [{ value: '', disabled: true }], // 證件類型
    DeviceName: [{ value: '', disabled: true }], // 設備名稱
  });

  // 是否已選擇資料
  dataLoaded = false;

  // ===== 彈跳選擇框 Dialog =====
  showLoanDialog = false;
  loanDialogLoading = false;
  loanDialogData: CPM11040Data[] = [];
  loanDialogTotalRecords = 0;
  loanDialogSelectedItem: CPM11040Data | null = null;

  loanQueryForm = this.formBuilder.group({
    UserName: [''],
    LoanPhone: [''],
    DeviceID: [''],
    pageSize: [30],
    pageIndex: [1],
  });

  loanDialogColumns: Column[] = [
    { field: 'LoanNo', header: '出借編號', visible: true },
    { field: 'UserName', header: '借用人姓名', visible: true },
    { field: 'LoanPhone', header: '電話', visible: true },
    { field: 'DeviceID', header: '設備號碼', visible: true },
    { field: 'DeviceName', header: '設備名稱', visible: true },
  ];

  constructor(private cpm11040Service: CPM11040Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11040', this.dataForm);

    // 詳情/檢視模式：格式化顯示欄位
    if (this.rowdata) {
      const certType = this.dataForm.getRawValue().CertType;
      if (certType && !certType.includes('-')) {
        const opt = getSYS1000Options('Cert_Type').find(o => o.value === certType);
        if (opt) {
          this.dataForm.patchValue({ CertType: `${opt.value}-${opt.label}` }, { emitEvent: false });
        }
      }
      const serviceID = this.rowdata.ServiceID;
      const serviceName = this.rowdata.ServiceName;
      if (serviceID) {
        this.dataForm.patchValue({ ServiceID: serviceName ? `${serviceID}-${serviceName}` : serviceID }, { emitEvent: false });
      }
    }

    // 取得當前使用者名稱
    const currentUser = this.authService.currentUserValue?.user_Name || '';
    this.dataForm.patchValue({ ReturnUserName: currentUser }, { emitEvent: false });
  }

  // ===== Dialog 開啟/關閉 =====
  openLoanDialog(): void {
    this.showLoanDialog = true;
    this.loanQueryForm.reset({ UserName: '', LoanPhone: '', DeviceID: '', pageSize: 10, pageIndex: 1 });
    this.loanDialogData = [];
    this.loanDialogTotalRecords = 0;
    this.loanDialogSelectedItem = null;
    // 預設查詢一次
    this.onQueryLoan();
  }

  closeLoanDialog(): void {
    this.showLoanDialog = false;
    this.loanDialogData = [];
    this.loanDialogSelectedItem = null;
  }

  // 查詢出借記錄（只查未歸還，server-side 分頁）
  onQueryLoan(): void {
    const formValue = this.loanQueryForm.value;
    this.loanDialogLoading = true;

    this.cpm11040Service.queryCPM11040({
      UserName: formValue.UserName || undefined,
      LoanPhone: formValue.LoanPhone || undefined,
      DeviceID: formValue.DeviceID || undefined,
      OnlyUnreturned: true,
      PageSize: formValue.pageSize ?? 30,
      PageIndex: formValue.pageIndex ?? 1,
    })
      .pipe(
        finalize(() => this.loanDialogLoading = false),
        untilDestroyed(this)
      )
      .subscribe(response => {
        if (response.Data) {
          this.loanDialogData = response.Data;
          this.loanDialogTotalRecords = response.TotalCount ?? 0;
        }
      });
  }

  // 分頁切換時重新查詢
  onLazyLoadLoan(event: { pageSize?: number; pageIndex?: number }): void {
    this.loanQueryForm.patchValue({
      pageSize: event.pageSize ?? 30,
      pageIndex: event.pageIndex ?? 1,
    });
    this.onQueryLoan();
  }

  // 點選 table 列
  onLoanRowSelect(event: { data?: CPM11040Data }): void {
    if (event.data) {
      this.loanDialogSelectedItem = event.data;
    }
  }

  // 確認選擇
  confirmLoanSelection(): void {
    if (!this.loanDialogSelectedItem) {
      this.messageService.warnBubble('請選擇一筆出借記錄');
      return;
    }
    const data = this.loanDialogSelectedItem;
    this.dataForm.patchValue({ LoanNo: data.LoanNo });
    this.fillFormData(data);
    this.showLoanDialog = false;
    this.loanDialogSelectedItem = null;
  }

  // 填充表單資料
  fillFormData(data: CPM11040Data): void {
    this.dataForm.patchValue({
      ServiceID: data.ServiceID && data.ServiceName ? `${data.ServiceID}-${data.ServiceName}` : data.ServiceName || data.ServiceID || '',
      LoanDate: data.LoanDate ? new Date(data.LoanDate) : null,
      UserName: data.UserName || '',
      LoanPhone: data.LoanPhone || '',
      CertType: (() => {
        const opt = getSYS1000Options('Cert_Type').find(o => o.value === data.CertType);
        return opt ? `${opt.value}-${opt.label}` : data.CertType || '';
      })(),
      DeviceName: data.DeviceName || ''
    });
    this.dataLoaded = true;
  }

  // 清除表單資料
  clearFormData() {
    this.dataForm.patchValue({
      LoanNo: null,
      ServiceID: '',
      LoanDate: null,
      UserName: '',
      LoanPhone: '',
      CertType: '',
      DeviceName: ''
    });
    this.dataLoaded = false;
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      if (!this.dataLoaded) {
        this.messageService.warnBubble('請先選擇出借編號');
        return;
      }

      const raw = form.getRawValue();

      const loanNo = raw.LoanNo;
      const returnDate = raw.ReturnDate;
      const returnTime = raw.ReturnTime;

      if (!loanNo || !returnDate || !returnTime) {
        this.messageService.warnBubble('請選擇出借編號');
        return;
      }

      // 格式化日期為 YYYY-MM-DD（使用本地時間，避免 UTC 時差導致日期偏移）
      let formattedDate = '';
      if (returnDate instanceof Date) {
        const yyyy = returnDate.getFullYear();
        const mm = String(returnDate.getMonth() + 1).padStart(2, '0');
        const dd = String(returnDate.getDate()).padStart(2, '0');
        formattedDate = `${yyyy}-${mm}-${dd}`;
      } else {
        formattedDate = returnDate;
      }

      // 格式化時間為 HH:mm
      let formattedTime = '';
      if (returnTime instanceof Date) {
        const hh = String(returnTime.getHours()).padStart(2, '0');
        const mm = String(returnTime.getMinutes()).padStart(2, '0');
        formattedTime = `${hh}:${mm}`;
      } else {
        formattedTime = returnTime;
      }

      this.loading = true;
      this.messageService.blockUi();

      this.cpm11040Service.returnDevice({
        LoanNo: loanNo,
        ReturnDate: formattedDate,
        ReturnTime: formattedTime
      })
        .pipe(
          finalize(() => {
            this.loading = false;
            this.messageService.unblockUi();
          }),
          untilDestroyed(this)
        )
        .subscribe({
          next: () => {
            this.messageService.successBubble('新增成功');
            this.onCancel();
          },
          error: (error) => {
            const errorMsg = error?.error?.Message || '新增失敗，請稍後再試';
            this.messageService.errorBubble(errorMsg);
          }
        });
    });
  }

  get isRead(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }
}
