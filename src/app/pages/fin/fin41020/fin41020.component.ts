import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../../shared/components/notification-message/notification.service';

import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DeleteFIN41020Request, FIN41020Data, FIN41020Service } from '@service/api/fin/fin41020.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

@Component({
  selector: 'app-fin41020',
  templateUrl: './fin41020.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, ButtonComponent, TranslateModule, TableReportComponent]
})
export class FIN41020Component extends BasicQueryPageComponent<FIN41020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    ORG_ID: ['', [Validators.required]], //部門代碼
    AccNo: ['', [Validators.required]], //會計科目
    BudgetYear: [], //年 (YYYY)
    BudgetVersion: [], //版本
  });

  // Dropdown options
  ORG_ID_Options = signal<{ label: string; value: string }[]>([]);
  AccNoOptions = signal<{ label: string; value: string }[]>([]);

  // Table data
  data: FIN41020Data[] = [];
  selectedItems: FIN41020Data[] = [];
  public readonly totalRecords = signal<number>(0);

  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'OrgId', header: '部門代號', visible: true },
    { field: 'BudgetYear', header: '年', visible: true },
    { field: 'BudgetVersion', header: '版本', visible: true },
    { field: 'AccNo', header: '會計科目', visible: true },
    { field: 'TotalAmount', header: '金額', visible: true },
  ]
  constructor(
    private notificationService: NotificationService,
    private fin41020Service: FIN41020Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '140002';
    this.initializePage('FIN41020', '/fin/fin41020cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
  }

  onSubmit(form: FormGroup) {
    console.log(form.value);

    this.handleSubmit(form, () => {
      this.fin41020Service.queryFIN41020(form.value)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords.set(response.TotalCount);
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });

  }

  // 刪除
  onDelete(selectedItems: FIN41020Data[]) {
    this.messageService.confirm({
      header: '刪除確認',
      message: `是否確認刪除 ${selectedItems.length} 筆資料？`,
      accept: () => {
        const deleteRequest: DeleteFIN41020Request = {
          Items: selectedItems.map(item => ({
            ORG_ID: item.OrgId,
            BudgetYear: item.BudgetYear,
            BudgetVersion: item.BudgetVersion
          }))
        }
        this.fin41020Service.deleteFIN41020(deleteRequest)
          .pipe(untilDestroyed(this))
          .subscribe(response => {
            if (response.Status !== "0000") {
              this.messageService.errorBubble(response.Data.ErrMsg || '刪除失敗');
            }
            else {
              this.messageService.successBubble(response.Data.ErrMsg || '刪除成功');
            }
            this.onSubmit(this.queryForm);
          })
      }
    });
  }


  /** 載入下拉選單選項 */
  private loadDropdownOptions(): void {
    // 部門代號
    this.fin41020Service.querySYS3100_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.ORG_ID_Options.set(options);
      },
    });

    // 會計科目 (1=明細)
    this.fin41020Service.queryGLS1005_DropDownList('1').subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.AccNoOptions.set(options);
      },
    });

  }
}
