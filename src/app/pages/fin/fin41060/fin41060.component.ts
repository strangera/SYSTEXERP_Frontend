import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AddButton, createPaginationConfig } from '@others/component/table/table.model';
import { FIN41060Service } from '@service/api/fin/fin41060.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { ReportColumn } from 'src/app/shared/components/table-report/table-report.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { FIN41060QueryRow, FIN41060UpdateData, QueryFIN41060Request } from './fin41060.model';

@Component({
  selector: 'app-fin41060',
  templateUrl: './fin41060.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class FIN41060Component extends BasicQueryPageComponent<FIN41060QueryRow> implements OnInit {
  queryForm = this.formBuilder.group({
    Org_ID: [null as string | null],
    Budget_Version: [null as string | null],
    Budget_Year: [null as string | null],
    Audit_Status: [null as string | null],
    ...createPaginationConfig(),
  });
  private readonly defaultPageSize = 100;
  orgIdOptions: IDropdownItem[] = [];

  auditStatusOptions = [
    { value: 'Y', label: '已審核' },
    { value: 'N', label: '未審核' },
  ];

  data: FIN41060QueryRow[] = [];
  totalRecords = 0;
  lastQueryBody: QueryFIN41060Request | null = null;
  queryFIN41060Fn = (body: QueryFIN41060Request) => this.fin41060Service.queryFIN41060(body);

  columns: ReportColumn[] = [
    { field: 'Org_ID', header: '部門代號', visible: true, width: '200px' },
    { field: 'Org_Name', header: '部門名稱', visible: true, width: '200px' },
    { field: 'Budget_Year', header: '年度', visible: true, width: '150px' },
    { field: 'Budget_Version', header: '版本', visible: true, width: '150px' },
    { field: 'Audit_Status_NM', header: '審核狀態', visible: true, width: '150px' },
  ];

  btnLoading = false;

  // 功能說明：若需要完成部門審核則按下【審核】鍵，若是已經審核的預算需要還原，則可按下【反審核】鍵
  addButton: AddButton[] = [
    {
      label: '審核',
      icon: 'pi pi-check-circle text-green-500',
      action: (rowData: FIN41060QueryRow) => this.onApprove(rowData),
      disabled: (rowData: FIN41060QueryRow) => rowData.Audit_Status_NM === '是' || !this.hasPermission(this.Actions.Audit),
    },
    {
      label: '反審核',
      icon: 'pi pi-undo text-orange-500',
      action: (rowData: FIN41060QueryRow) => this.onAntiApprove(rowData),
      disabled: (rowData: FIN41060QueryRow) => rowData.Audit_Status_NM !== '是' || !this.hasPermission(this.Actions.AntiAudit),
    },
  ];

  constructor(
    public readonly fin41060Service: FIN41060Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN41060', 'fin/fin41060cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOrgIdOptions();

    console.log('權限', this.hasPermission(this.Actions.Query), this.hasPermission(this.Actions.AntiAudit));
  }

  private loadOrgIdOptions(): void {
    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.orgIdOptions = (res.Data || []).map((item) => ({
          ...item,
          label: `${item.No}-${item.Name}`,
          value: item.No,
        }));
      });
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();
      console.log('onSubmit raw:', raw);
      const payload: QueryFIN41060Request = {
        Org_ID: raw.Org_ID ?? null,
        Budget_Version: raw.Budget_Version ?? null,
        Budget_Year: raw.Budget_Year ?? null,
        Audit_Status: raw.Audit_Status ?? null,
        PageSize: this.defaultPageSize,
        PageIndex: raw.PageIndex,
        SortBy: raw.SortBy,
      };

      this.fin41060Service
        .queryFIN41060(payload)
        .pipe(
          untilDestroyed(this),
          finalize(() => (this.loading = false)),
        )
        .subscribe((response) => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.lastQueryBody = payload;
          this.queryStateService.setQueryState(this.ProgNo, raw);
        });
    });
  }

  onApprove(rowData: FIN41060QueryRow): void {
    this.runAudit(rowData, 'Y', '審核');
  }

  onAntiApprove(rowData: FIN41060QueryRow): void {
    this.runAudit(rowData, 'N', '反審核');
  }

  private runAudit(rowData: FIN41060QueryRow, action: 'Y' | 'N', label: string): void {
    this.messageService.confirm({
      header: `確認${label}`,
      message: `是否確認${label}此筆資料？`,
      accept: () => {
        this.btnLoading = true;
        this.fin41060Service
          .updateFIN41060({
            Org_ID: rowData.Org_ID,
            Budget_Year: rowData.Budget_Year,
            Budget_Version: rowData.Budget_Version,
            Action: action,
          })
          .pipe(
            finalize(() => (this.btnLoading = false)),
            untilDestroyed(this),
          )
          .subscribe({
            next: (res: { Status: string; Message?: string; Data: FIN41060UpdateData }) => {
              if (res.Status === '0000') {
                const msg = res.Message ?? res.Data?.ErrMsg ?? `${label}成功`;
                this.messageService.successBubble(msg);
                this.onSubmit(this.queryForm);
              }
            },
          });
      },
    });
  }
}
