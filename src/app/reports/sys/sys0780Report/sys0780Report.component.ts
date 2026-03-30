import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Sys0780Service } from '@service/api/sys/sys0780.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { Column } from '@shared/componentkit/table/table.model';
import { FileExportService } from '@shared/service/file-export.service';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';

@UntilDestroy()
@Component({
  selector: 'app-sys0780-report',
  templateUrl: './sys0780Report.component.html',
  standalone: true,
  imports: [
    TranslateModule,
    DropdownComponent,
    CalendarComponent,
    MultiSelectComponent,
    ReactiveFormsModule,
    FormsModule,
    AsyncPipe,
    BadgeModule,
    ButtonModule,
    ChipModule,
    CommonModule
  ],
  providers: [DatePipe]
})
export class SYS0780ReportComponent extends BasicCruPageComponent<unknown> implements OnInit {
  private readonly sys0780Service = inject(Sys0780Service);
  private readonly route = inject(ActivatedRoute);
  private readonly datePipe = inject(DatePipe);
  private readonly fileExportService = inject(FileExportService);
  private readonly fb = inject(FormBuilder);
  private readonly dropdown = inject(DropdownApiService);

  readonly isLoading = signal(false);
  readonly isPdfExporting = signal(false);
  readonly isXlsxExporting = signal(false);

  readonly queryForm = this.fb.group({
    APPLY_DATE: [new Date(), [Validators.required]],
    prog_no: [{ value: null as string | null, disabled: true }], // 明確型別
    org_no: [null as string | null, [Validators.required]],
    role_no: [null as string | null, [Validators.required]],
    user_NoList: [[] as string[], [Validators.required]], // 初始值設為空陣列，型別為 string[]
    user_No: [this.authService.currentUserValue?.user_No || (null as string | null), [Validators.required]],
  });
  subModuleNoOptions$ = this.dropdown.querySys5000SubModuleNo();
  orgIdOptions$ = this.dropdown.querySys3100();
  tblRoleOptions$ = this.dropdown.queryTblRole();
  tblUserOptions$ = this.dropdown.queryTblUser();

  // data: GroupedSYS0780Detail[] = [];
  totalRecords = 0;
  // lastQuery: QuerySYS0780Request | null = null;

  readonly columns: Column[] = [];
  ngOnInit(): void {
    this.initParamSubscription();
  }

  onSubmit(frm: FormGroup) { }

  /** 解析 QueryParams 並轉換日期格式 */
  private initParamSubscription(): void {
    this.route.queryParams.subscribe(params => {
      const progNoParam = params['progno'];
      if (progNoParam && typeof progNoParam === 'string') {
        // 確保是字串再轉大寫
        this.queryForm.patchValue({ prog_no: progNoParam.toUpperCase() });
      }
    });
  }
  /** 根據 Value 取得 Label 用於顯示 Chip */
  getUserLabel(userId: string): string {
    // 使用 type casting 處理 Observable 的私有值存取（或是建議從 service 訂閱到的變數中找）
    const options = (this.tblUserOptions$ as any)._value || [];
    const found = options.find((opt: any) => opt.value === userId);
    return found ? found.label : userId;
  }

  /** 移除單一人員 */
  removeUser(userId: string): void {
    // 使用 Optional Chaining 並給予空陣列作為預設值
    const currentList = this.queryForm.controls.user_NoList.value || [];
    const newList = currentList.filter(id => id !== userId);

    // 使用 patchValue 更新，這時 newList 類型為 string[]，符合我們在 fb.group 定義的類型
    this.queryForm.patchValue({ user_NoList: newList });
  }
  // ========= 匯出事件 =========
  // onExportPDF(): void {
  //   if (!this.lastQuery) return;
  //   this.fileExportService.executeFileExport(
  //     this.sys0780Service.exportSYS0780PDF(this.lastQuery as any),
  //     '.pdf',
  //     (loading) => this.isPdfExporting.set(loading),
  //   ).subscribe();
  // }

  // onExportXLSX(): void {
  //   if (!this.lastQuery) return;
  //   this.fileExportService.executeFileExport(
  //     this.sys0780Service.exportSYS0780Excel(this.lastQuery as any),
  //     '.xlsx',
  //     (loading) => this.isXlsxExporting.set(loading),
  //   ).subscribe();
  // }
}
