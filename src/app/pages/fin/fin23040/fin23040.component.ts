import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin23040Service, QueryFIN23040Type1Response } from '@service/api/fin/fin23040.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { formatAmount, ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize, forkJoin } from 'rxjs';
import { InputTextComponent } from 'src/app/shared/components/input-text/input-text.component';
import { TableReportComponent } from 'src/app/shared/components/table-report/table-report.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

@Component({
  selector: 'app-fin23040',
  templateUrl: './fin23040.component.html',
  standalone: true,
  imports: [TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, TranslateModule, InputTextComponent]
})
export class FIN23040Component extends BasicQueryPageComponent<QueryFIN23040Type1Response> implements OnInit {
  public readonly fin23040Service = inject(Fin23040Service);

  queryForm = this.formBuilder.group({
    Type: [1, [Validators.required]], // 查詢頁面固定為 1
    REDEEM_NO: [null as string | null, [Validators.maxLength(16)]],
    PREP_NO: [null as string | null, [Validators.maxLength(16)]],
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'PREP_NO', order: 1 }]],
  });

  data: QueryFIN23040Type1Response[] = [];
  selectedItems: QueryFIN23040Type1Response[] = [];
  totalRecords = 0;
  lastQuery: unknown = null;

  // 固定為 Type 1 的欄位結構
  columns: ReportColumn[] = [
    { field: 'redeeM_NO', header: '核銷單號', align: 'left' },
    { field: 'preP_NO', header: '預支單號', align: 'left' },
    { field: 'redeemAmt', header: '核銷金額', format: formatAmount, align: 'right' },
    { field: 'yn', header: '可否刪修', align: 'center', width: '90px' },
  ];

  ngOnInit(): void {
    this.initializePage('FIN23040', 'fin/fin23040cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin23040Service.queryFIN23040(frm.value).pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this),
      ).subscribe(res => {
        // 本頁固定查詢 Type=1，回傳資料一律為 QueryFIN23040Type1Response 結構
        this.data = (res.Data ?? []) as QueryFIN23040Type1Response[];
        this.totalRecords = res.TotalCount;
        this.lastQuery = frm.value;
        this.selectedItems = [];
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  /**
     * 透過此方法卡控該列資料是否允許被勾選
     * 只有當 yn 等於 'Y' 的項目才能勾選
     */
  isRowSelectable = (event: { data: QueryFIN23040Type1Response }) => {
    return event.data?.yn === 'Y';
  };
  /**
   * 點擊刪除按鈕事件
   */
  onDelete() {
    if (this.selectedItems.length === 0) return;
    const storeNo = this.authService.currentUserValue?.SYS_StoreNo || '10';
    this.messageService.confirm({
      header: `刪除確認`,
      message: `確定要刪除選取的資料嗎？`,
      accept: () => {
        this.loading = true;

        // 產生批次刪除的 Observable 陣列
        const deleteTasks = this.selectedItems.map(item =>
          this.fin23040Service.voidFIN23040({
            stO_No: storeNo,
            preP_NO: item.preP_NO,
            redeeM_NO: item.redeeM_NO
          })
        );

        // 同步執行批次刪除
        forkJoin(deleteTasks).pipe(
          finalize(() => this.loading = false),
          untilDestroyed(this)
        ).subscribe(res => {
          this.messageService.successBubble('刪除成功');
          // 重新整理列表
          if (this.lastQuery) {
            this.onSubmit(this.queryForm);
          }
        });
      }
    });
  }
}