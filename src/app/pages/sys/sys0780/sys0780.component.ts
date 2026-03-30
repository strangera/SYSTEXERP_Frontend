import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QuerySYS0780Request, QuerySYS0780Response, Sys0780Service } from '@service/api/sys/sys0780.service';
import { Sys5000SubModuleItem } from '@service/utility/dropdown-api.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { DropdownApiService } from './../../../service/utility/dropdown-api.service';


@Component({
  selector: 'app-sys0780',
  templateUrl: './sys0780.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    ButtonComponent,
    TranslateModule,
    AsyncPipe,
    ButtonModule
  ],
})
// 作業權限申請表
export class SYS0780Component extends BasicQueryPageComponent<QuerySYS0780Response> implements OnInit {
  queryForm = this.formBuilder.group({
    // user_No: [this.authService.currentUserValue?.user_No || null],
    prog_no: [null as Sys5000SubModuleItem | null],
    ...createPaginationConfig([]),
  });
  lastQueryBody: QuerySYS0780Request | null = null;
  data: QuerySYS0780Response[] = [];
  totalRecords = 0
  // userNoOptions = this.dropdown.queryTblUser();
  subModuleNoOptions = this.dropdown.querySys5000SubModuleNoGroup();

  constructor(
    public readonly sys0780Service: Sys0780Service,
    private readonly dropdown: DropdownApiService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('SYS0780');
  }
  // onSubmit(frm: FormGroup) {
  //   this.handleSubmit(frm, () => {
  //     const requestBody: QuerySYS0780Request = {
  //       ...frm.getRawValue(),
  //       pageIndex: frm.value.pageIndex,
  //       pageSize: frm.value.pageSize,
  //       SortBy: frm.value.SortBy,
  //     }
  //     this.sys0780Service.querySYS0780(requestBody).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((response) => {
  //       this.lastQueryBody = requestBody;
  //       this.data = response.Data;
  //       this.totalRecords = response.TotalCount || response.Data.length;
  //     });
  //   });
  // }
  showPermissionReport() {
    const formValue = this.queryForm.getRawValue();

    // 1. 驗證必填項
    if (!formValue.prog_no) {
      this.messageService.errorBubble('請選擇主系統項目代號/名稱');
      return;
    }

    // 2. 組裝參數 (根據你的需求，可能需要傳送 user_No, prog_no 等)
    const queryParams = new URLSearchParams({
      // userNo: formValue.user_No || '',
      progNo: formValue.prog_no.No || '',
      // 如果有其他需要傳給報表的參數可以在此增加
    }).toString();

    // 3. 設定路徑 (reports/sys/sys0780Report)
    // 使用 window.location.origin 確保在不同環境（開發/正式）都能抓到正確的基底網址
    const reportUrl = `${window.location.origin}/reports/sys/sys0780report?${queryParams}`;

    // 4. 開啟新分頁
    // '_blank' 表示開啟新分頁
    window.open(reportUrl, '_blank');
  }
}
