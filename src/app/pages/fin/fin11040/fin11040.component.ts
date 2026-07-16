import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { Fin11040Service, TDS1008Data, TDS1008Req } from '../../../service/api/fin/fin11040.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { columns } from './fin11040.model';
@Component({
  selector: 'app-fin11040',
  templateUrl: './fin11040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
//1.1.1.4 銷項品項資料設定
export class FIN11040Component extends BasicQueryPageComponent<TDS1008Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    INV_ItemNo: ['', [Validators.maxLength(2), this.validationService.alphanumericValidator]], // 品項代號
    INV_ItemName: ['', [Validators.maxLength(30)]], // 品項名稱
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'INV_ItemNo', order: 1 }]],
  });
  public readonly tableData = signal<TDS1008Data[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly lastQueryBody = signal<TDS1008Req | null>(null);
  selectedRows: TDS1008Data[] = [];
  columns = columns;
  constructor(
    public fin11040Service: Fin11040Service,
    private validationService: ValidationService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN11040', '/FIN/FIN11040cru', this.queryForm, (form) => this.onSubmit(form));
  }
  queryFunction = (body: TDS1008Req) => {
    return this.fin11040Service.queryFIN11040(body).pipe(
      finalize(() => this.loading = false),
      untilDestroyed(this)
    );
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      this.fin11040Service.queryFIN11040(frm.value).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.tableData.set(res.Data);
        this.totalRecords.set(res.TotalCount || 0);
        this.lastQueryBody.set(frm.value);
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  onDelete(selectedRows: TDS1008Data[]) {
    this.messageService.confirm({
      header: `刪除確認`,
      message: `確定要刪除選取的資料嗎？`,
      accept: () => {
        const idList = selectedRows.map(row => row.ID);
        this.fin11040Service.deleteFIN11040({ idList }).pipe(untilDestroyed(this)).subscribe(res => {
          this.onSubmit(this.queryForm);
          this.selectedRows = [];
          this.messageService.successBubble(res.Message);
        });
      }
    });
  }
}
