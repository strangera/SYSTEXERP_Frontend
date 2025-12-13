import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { finalize, map, Observable } from 'rxjs';
import { CPM11010Service } from '../../../service/api/cpm/cpm11020.service';
import { CPM11040Data, CPM11040Service } from '../../../service/api/cpm/cpm11040.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatDate } from '../../../shared/componentkit/table/table.model';

//5.1.1.5 設備歸還作業
@Component({
  selector: 'app-cpm11040',
  templateUrl: './cpm11040.component.html',
  styleUrl: './cpm11040.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, CalendarComponent, InputTextComponent, DropdownComponent, TableComponent, DialogComponent, TranslateModule, AsyncPipe]
})
export class CPM11040Component extends BasicQueryPageComponent<CPM11040Data> implements OnInit {
  // 歸還對話框
  returnDialogVisible = false;
  returnSubmitted = false;

  // 歸還表單
  returnForm = this.formBuilder.group({
    LoanNo: ['', [Validators.required, Validators.maxLength(14)]], // 歸還編號
    ReturnDate: [new Date(), [Validators.required]], // 歸還日期
    ReturnTime: ['', [Validators.required]], // 歸還時間
    ServiceId: [''], // 出借編號
    ServiceCode: [''], // 服務台位置編號
    LoanDate: [''], // 出借日期
    UserName: [''], // 姓名
    LoanPhone: [''], // 連絡電話
    CertType: [''], // 證件類型
    DeviceName: [''], // 設備名稱
  });

  queryForm = this.formBuilder.group({
    LoanNo: ['', [Validators.maxLength(14)]], // 借記/歸還編號
    ServiceId: [null], // 服務中心位置編號
    LoanDateStart: [null], // 出借日期 - 起
    LoanDateEnd: [null], // 出借日期 - 迄
    ReturnDateStart: [null], // 歸還日期 - 起
    ReturnDateEnd: [null], // 歸還日期 - 迄
    UserName: ['', [Validators.maxLength(20)]], // 借用人姓名
    LoanPhone: ['', [Validators.maxLength(20)]], // 連絡電話
    CertType: [null], // 證件類型
    CertNo: ['', [Validators.maxLength(20)]], // 證件編號
    DeviceID: ['', [Validators.maxLength(10)]], // 設備編號
    DeviceName: [null], // 設備名稱
    LoanUserName: ['', [Validators.maxLength(10)]], // 出借處理人員
    ...createPaginationConfig([{ field: 'LoanDate', order: -1 }]), // 分頁和排序參數
  });

  totalRecords = 0;
  data: CPM11040Data[] = [];
  selectedItems: CPM11040Data[] = [];

  // 服務中心位置下拉選項 - 從 API 載入
  serviceOptions: Observable<{ label: string; value: string }[]> = this.cpm11010Service.queryCPM10010().pipe(
    map(response =>
      response.Data.map(item => ({
        label: `${item.Service_Id} - ${item.Service_Name}`,
        value: item.Service_Id
      }))
    )
  );

  // 設備下拉選項 - 從 API 載入
  deviceOptions: Observable<{ label: string; value: string }[]> = this.cpm11010Service.queryDeviceListCPM11020().pipe(
    map(response =>
      response.Data.map(item => ({
        label: `${item.Device_id} - ${item.Device_Name}`,
        value: item.Device_id
      }))
    )
  );

  // 證件類型選項 (可能需要從後端API獲取，這裡先使用靜態選項)
  certTypeOptions = [
    { label: '身分證', value: '1' },
    { label: '健保卡', value: '2' },
    { label: '駕照', value: '3' },
    { label: '護照', value: '4' },
    { label: '其他', value: '5' },
  ];

  columns: Column[] = [
    { field: 'LoanNo', header: '借記編號', visible: true },
    { field: 'LoanDate', header: '出借日期', visible: true, format: formatDate },
    { field: 'LoanTime', header: '出借時間', visible: true },
    { field: 'ReturnDate', header: '歸還日期', visible: true, format: formatDate },
    { field: 'ReturnTime', header: '歸還時間', visible: true },
    { field: 'UserName', header: '借用人姓名', visible: true },
    { field: 'LoanPhone', header: '連絡電話', visible: true },
    { field: 'CertTypeName', header: '證件類型', visible: true },
    { field: 'CertNo', header: '證件編號', visible: true },
    { field: 'DeviceID', header: '設備編號', visible: true },
    { field: 'DeviceName', header: '設備名稱', visible: true },
    { field: 'ServiceName', header: '服務中心', visible: true },
    { field: 'LoanUserName', header: '出借處理人員', visible: true },
    { field: 'LoanStatus', header: '出借狀態', visible: true },
  ];

  constructor(
    private readonly cpm11040Service: CPM11040Service,
    private readonly cpm11010Service: CPM11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11040', undefined, this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.cpm11040Service.queryCPM11040(frm.value)
        .pipe(
          finalize(() => this.loading = false),
          untilDestroyed(this)
        )
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        });
    });
  }

  onDelete(selectedItems: CPM11040Data[]) {
    this.confirmationService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料？`,
      accept: () => {
        const idList = selectedItems.map(item => item.ID);
        this.cpm11040Service.deleteCPM11040({ IdList: idList })
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this.messageService.successBubble('刪除成功');
            this.onSubmit(this.queryForm);
          });
      }
    });
  }

  // 開啟歸還對話框
  onReturn() {
    this.returnDialogVisible = true;
    this.returnSubmitted = false;
    this.returnForm.reset({
      ReturnDate: new Date(),
      ReturnTime: ''
    });
  }

  // 查詢鈕 - 根據歸還編號查詢資料
  onQueryReturn() {
    const loanNo = this.returnForm.get('LoanNo')?.value;
    if (!loanNo) {
      this.messageService.warnBubble('請輸入歸還編號');
      return;
    }

    this.loading = true;
    this.messageService.blockUi();

    // 使用查詢 API 根據 LoanNo 查詢資料
    this.cpm11040Service.queryCPM11040({
      LoanNo: loanNo,
      PageSize: 1,
      PageIndex: 1
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.messageService.unblockUi();
        }),
        untilDestroyed(this)
      )
      .subscribe(response => {
        if (response.Data && response.Data.length > 0) {
          const data = response.Data[0];
          this.returnForm.patchValue({
            ServiceId: data.LoanNo,
            ServiceCode: data.ServiceName,
            LoanDate: data.LoanDate,
            UserName: data.UserName,
            LoanPhone: data.LoanPhone,
            CertType: data.CertTypeName,
            DeviceName: data.DeviceName
          });
          this.messageService.successBubble('查詢成功');
        } else {
          this.messageService.warnBubble('查無資料');
        }
      });
  }

  // 確認歸還
  onConfirmReturn() {
    this.returnSubmitted = true;

    if (this.returnForm.invalid) {
      this.messageService.warnBubble('請填寫必填欄位');
      return;
    }

    // TODO: 實作歸還 API 呼叫
    this.loading = true;
    this.messageService.blockUi();

    // 這裡需要根據後端 API 實作歸還邏輯
    // 目前先顯示成功訊息並關閉對話框
    setTimeout(() => {
      this.loading = false;
      this.messageService.unblockUi();
      this.messageService.successBubble('歸還成功');
      this.returnDialogVisible = false;
      this.onSubmit(this.queryForm); // 重新查詢列表
    }, 1000);
  }

  // 取消歸還
  onCancelReturn() {
    this.returnDialogVisible = false;
    this.returnForm.reset();
    this.returnSubmitted = false;
  }
}
