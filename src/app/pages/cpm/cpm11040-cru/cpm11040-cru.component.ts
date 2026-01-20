/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { CPM11040Data, CPM11040Service } from '../../../service/api/cpm/cpm11040.service';

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
    DropdownComponent,
    ButtonComponent,
    TranslateModule,
    CalendarComponent,
  ],
})
export class CPM11040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  readonly CRUD = CRUDStatus;

  // 出借編號下拉選項 (只顯示未歸還的)
  loanNoOptions: { label: string; value: string; data: CPM11040Data }[] = [];

  dataForm = this.formBuilder.group({
    // 出借編號 - 下拉選單，必填
    LoanNo: [null as string | null, [Validators.required]],
    // 歸還處理人員 - readonly
    ReturnUserName: [{ value: '', disabled: true }],
    // 歸還日期 - 預設當下，disabled
    ReturnDate: [{ value: new Date(), disabled: true }, [Validators.required]],
    // 歸還時間 - 預設當下，disabled
    ReturnTime: [{ value: new Date(), disabled: true }, [Validators.required]],
    // 以下為查詢後帶入的 readonly 欄位
    ServiceCode: [{ value: '', disabled: true }], // 服務台位置編號
    LoanDate: [{ value: null as Date | null, disabled: true }], // 出借日期
    UserName: [{ value: '', disabled: true }], // 姓名
    LoanPhone: [{ value: '', disabled: true }], // 連絡電話
    CertType: [{ value: '', disabled: true }], // 證件類型
    DeviceName: [{ value: '', disabled: true }], // 設備名稱
  });

  // 是否已選擇資料
  dataLoaded = false;

  constructor(private cpm11040Service: CPM11040Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11040', this.dataForm);

    // 取得當前使用者名稱
    const currentUser = this.authService.currentUserValue?.user_Name || '';
    this.dataForm.patchValue({ ReturnUserName: currentUser }, { emitEvent: false });

    // 載入未歸還的出借記錄
    this.loadLoanNoOptions();
  }

  // 載入出借編號下拉選項
  loadLoanNoOptions() {
    this.loading = true;

    // 使用大的 PageSize 來取得所有資料
    this.cpm11040Service.queryCPM11040({
      PageSize: 9999,
      PageIndex: 1
    })
      .pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this)
      )
      .subscribe(response => {
        if (response.Data) {
          // 只篩選未歸還的記錄 (LoanStatus !== '已歸還')
          this.loanNoOptions = response.Data
            .filter(item => item.LoanStatus !== '已歸還')
            .map(item => ({
              label: `${item.LoanNo}`,
              value: item.LoanNo,
              data: item
            }));
        }
      });
  }

  // 當選擇出借編號時，自動填入相關資料
  onLoanNoChange(selectedLoanNo: string | null) {
    if (!selectedLoanNo) {
      this.clearFormData();
      return;
    }

    // 從選項中找到對應的資料
    const selectedOption = this.loanNoOptions.find(opt => opt.value === selectedLoanNo);
    if (selectedOption) {
      const data = selectedOption.data;

      // 填充表單資料
      this.dataForm.patchValue({
        ServiceCode: data.ServiceName || '',
        LoanDate: data.LoanDate ? new Date(data.LoanDate) : null,
        UserName: data.UserName || '',
        LoanPhone: data.LoanPhone || '',
        CertType: data.CertTypeName || '',
        DeviceName: data.DeviceName || ''
      });
      this.dataLoaded = true;
    }
  }

  // 清除表單資料
  clearFormData() {
    this.dataForm.patchValue({
      ServiceCode: '',
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

      // 格式化日期為 YYYY-MM-DD
      const formattedDate = returnDate instanceof Date
        ? returnDate.toISOString().split('T')[0]
        : returnDate;

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
