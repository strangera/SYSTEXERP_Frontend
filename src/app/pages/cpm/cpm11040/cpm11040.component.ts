import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { finalize, map, Observable } from 'rxjs';
import { CPM11010Service } from '../../../service/api/cpm/cpm11020.service';
import { CPM11040Data, CPM11040Service } from '../../../service/api/cpm/cpm11040.service';
import { getSYS1000Options } from '../../../service/system/sys1000.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../others/component/table/table.component';
import { Column, createPaginationConfig, formatDate, formatTimeHHMM } from '../../../others/component/table/table.model';

//5.1.1.5 設備歸還作業
@Component({
  selector: 'app-cpm11040',
  templateUrl: './cpm11040.component.html',
  styleUrl: './cpm11040.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, InputTextComponent, DropdownComponent, TableComponent, TranslateModule, AsyncPipe]
})
export class CPM11040Component extends BasicQueryPageComponent<CPM11040Data> implements OnInit {
  queryForm = this.formBuilder.group({
    LoanNo: ['', [Validators.maxLength(14)]], // 借記/歸還編號
    ServiceId: [null], // 服務中心位置編號
    LoanDateStart: [new Date()], // 出借日期 - 起
    LoanDateEnd: [new Date()], // 出借日期 - 迄
    ReturnDateStart: [null], // 歸還日期 - 起
    ReturnDateEnd: [null], // 歸還日期 - 迄
    UserName: ['', [Validators.maxLength(20)]], // 借用人姓名
    LoanPhone: ['', [Validators.maxLength(20)]], // 連絡電話
    CertType: [null], // 證件類型
    CertNo: ['', [Validators.maxLength(20)]], // 證件編號
    DeviceID: ['', [Validators.maxLength(10)]], // 設備編號
    DeviceName: [null], // 設備名稱
    LoanUserName: [null], // 出借處理人員
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
        value: item.Device_Name
      }))
    )
  );

  // 出借處理人員下拉選項 - 從 API 載入
  loanUserOptions = this.dropdownApiService.queryTblUser();

  // 證件類型選項 (從 SYS1000 取得)
  certTypeOptions = getSYS1000Options('Cert_Type').map(opt => ({ ...opt, label: `${opt.value}-${opt.label}` }));

  columns: Column[] = [
    { field: 'LoanNo', header: '出借編號', visible: true },
    { field: 'LoanDate', header: '出借日期', visible: true, format: formatDate },
    { field: 'LoanTime', header: '出借時間', visible: true, format: formatTimeHHMM },
    { field: 'ReturnDate', header: '歸還日期', visible: true, format: formatDate },
    { field: 'ReturnTime', header: '歸還時間', visible: true },
    { field: 'UserName', header: '借用人姓名', visible: true },
    { field: 'LoanPhone', header: '連絡電話', visible: true },
    { field: 'CertTypeName', header: '證件類型', visible: true },
    { field: 'CertNo', header: '證件編號', visible: true },
    { field: 'DeviceNames', header: '出借設備', visible: true },
    { field: 'ServiceName', header: '服務中心', visible: true },
    { field: 'LoanUserName', header: '出借處理人員', visible: true },
    { field: 'LoanStatus', header: '出借狀態', visible: true },
  ];

  constructor(
    private readonly cpm11040Service: CPM11040Service,
    private readonly cpm11010Service: CPM11010Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11040', 'cpm/cpm11040cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        LoanDateStart: this.datePipe.transform(frm.value.LoanDateStart, 'yyyy-MM-dd'),
        LoanDateEnd: this.datePipe.transform(frm.value.LoanDateEnd, 'yyyy-MM-dd'),
      }
      this.cpm11040Service.queryCPM11040(body)
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
    this.messageService.confirm({
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

}
