import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Sys0780Service } from '@service/api/sys/sys0780.service';
import { Sys5000SubModuleItem } from '@service/utility/dropdown-api.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { NavigationHelperService } from 'src/app/reports/services/navigation-helper.service';
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
export class SYS0780Component extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    // user_No: [this.authService.currentUserValue?.user_No || null],
    prog_no: [null as Sys5000SubModuleItem | null],
    ...createPaginationConfig([]),
  });
  // lastQueryBody: QuerySYS0780Request | null = null;
  // data: QuerySYS0780Response[] = [];
  totalRecords = 0
  // userNoOptions = this.dropdown.queryTblUser();
  subModuleNoOptions = this.dropdown.querySys5000SubModuleNoGroup();

  constructor(
    public readonly sys0780Service: Sys0780Service,
    private readonly dropdown: DropdownApiService,
    private readonly navHelper: NavigationHelperService
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

    // 使用 navHelper，它會自動處理 base-href
    this.navHelper.openInNewTab('reports/sys/sys0780report', {
      progNo: formValue.prog_no.No || ''
    });
  }
}
