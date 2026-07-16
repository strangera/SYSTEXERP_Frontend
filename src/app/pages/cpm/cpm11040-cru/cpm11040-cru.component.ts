/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

import { CPM11030DetailItem, Cpm11030Service } from '../../../service/api/cpm/cpm11030.service';
import { CPM11040Data, CPM11040Service } from '../../../service/api/cpm/cpm11040.service';
import { getSYS1000Options } from '../../../service/system/sys1000.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { TableComponent } from '../../../others/component/table/table.component';
import { Column } from '../../../others/component/table/table.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@UntilDestroy()
@Component({
  selector: 'app-cpm11040-cru',
  templateUrl: './cpm11040-cru.component.html',
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
    TableEditComponent,
  ],
})
export class CPM11040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  readonly CRUD = CRUDStatus;

  dataForm = this.formBuilder.group({
    LoanNo: [null as string | null, [Validators.required]],
    ReturnUserName: [{ value: '', disabled: true }],
    ReturnDate: [{ value: new Date(), disabled: true }, [Validators.required]],
    ReturnTime: [{ value: new Date(), disabled: true }, [Validators.required]],
    ServiceID: [{ value: '', disabled: true }],
    LoanDate: [{ value: null as Date | null, disabled: true }],
    UserName: [{ value: '', disabled: true }],
    LoanPhone: [{ value: '', disabled: true }],
    CertType: [{ value: '', disabled: true }],
  });

  /** 出借設備明細（唯讀顯示） */
  detailItems: CPM11030DetailItem[] = [];
  detailLoading = false;

  detailColumns: EditColumn[] = [
    { field: 'Device_ID', header: '設備代碼' },
    { field: 'Device_Name', header: '設備名稱' },
    { field: 'Qty', header: '數量', type: 'inputNumber', width: '8rem' },
  ];

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
    { field: 'DeviceNames', header: '設備名稱', visible: true },
  ];

  constructor(
    private cpm11040Service: CPM11040Service,
    private cpm11030Service: Cpm11030Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11040', this.dataForm);

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
      // 載入設備明細
      const loanNo = this.rowdata.LoanNo;
      if (loanNo) {
        this.detailLoading = true;
        this.cpm11030Service.queryCPM11030Detail(loanNo)
          .pipe(finalize(() => this.detailLoading = false), untilDestroyed(this))
          .subscribe(res => {
            this.detailItems = (res.Data || []).map((d: any) => ({
              Device_ID: d.Device_ID,
              Device_Name: d.Device_Name,
              Qty: d.Qty,
            }));
            this.dataLoaded = true;
          });
      }
    }

    const currentUser = this.authService.currentUserValue?.user_Name || '';
    this.dataForm.patchValue({ ReturnUserName: currentUser }, { emitEvent: false });
  }

  openLoanDialog(): void {
    this.showLoanDialog = true;
    this.loanQueryForm.reset({ UserName: '', LoanPhone: '', DeviceID: '', pageSize: 30, pageIndex: 1 });
    this.loanDialogData = [];
    this.loanDialogTotalRecords = 0;
    this.loanDialogSelectedItem = null;
    this.onQueryLoan();
  }

  closeLoanDialog(): void {
    this.showLoanDialog = false;
    this.loanDialogData = [];
    this.loanDialogSelectedItem = null;
  }

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
      .pipe(finalize(() => this.loanDialogLoading = false), untilDestroyed(this))
      .subscribe(response => {
        if (response.Data) {
          this.loanDialogData = response.Data;
          this.loanDialogTotalRecords = response.TotalCount ?? 0;
        }
      });
  }

  onLazyLoadLoan(event: { pageSize?: number; pageIndex?: number }): void {
    this.loanQueryForm.patchValue({
      pageSize: event.pageSize ?? 30,
      pageIndex: event.pageIndex ?? 1,
    });
    this.onQueryLoan();
  }

  onLoanRowSelect(event: { data?: CPM11040Data }): void {
    if (event.data) {
      this.loanDialogSelectedItem = event.data;
    }
  }

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
    });

    // 載入設備明細
    this.detailLoading = true;
    this.detailItems = [];
    this.cpm11030Service.queryCPM11030Detail(data.LoanNo)
      .pipe(finalize(() => this.detailLoading = false), untilDestroyed(this))
      .subscribe(res => {
        this.detailItems = (res.Data || []).map(d => ({
          Device_ID: d.Device_ID,
          Device_Name: d.Device_Name,
          Qty: d.Qty,
        }));
        this.dataLoaded = true;
      });
  }

  clearFormData() {
    this.dataForm.patchValue({
      LoanNo: null,
      ServiceID: '',
      LoanDate: null,
      UserName: '',
      LoanPhone: '',
      CertType: '',
    });
    this.detailItems = [];
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

      let formattedDate = '';
      if (returnDate instanceof Date) {
        const yyyy = returnDate.getFullYear();
        const mm = String(returnDate.getMonth() + 1).padStart(2, '0');
        const dd = String(returnDate.getDate()).padStart(2, '0');
        formattedDate = `${yyyy}-${mm}-${dd}`;
      } else {
        formattedDate = returnDate;
      }

      let formattedTime = '';
      if (returnTime instanceof Date) {
        const hh = String(returnTime.getHours()).padStart(2, '0');
        const min = String(returnTime.getMinutes()).padStart(2, '0');
        formattedTime = `${hh}:${min}`;
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
            this.messageService.successBubble('歸還成功');
            this.onCancel();
          },
          error: (error) => {
            const errorMsg = error?.error?.Message || '歸還失敗，請稍後再試';
            this.messageService.errorBubble(errorMsg);
          }
        });
    });
  }

  get isRead(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }
}
