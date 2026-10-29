import { Component, DestroyRef, inject, model, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TLS26040DetailData, TLS26040Service } from '@service/api/tls/tls26040.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { NotificationService } from '@shared/components/notification-message/notification.service';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs';
import { formatToSixDigits } from '../../../others/component/table/table.model';

@Component({
  selector: 'app-tls26040-batch-revert-dialog',
  templateUrl: './tls26040-batch-revert-dialog.component.html',
  standalone: true,
  imports: [DialogModule, ReactiveFormsModule, InputTextComponent, ButtonComponent, TableReportComponent],
})
export class TLS26040BatchRevertDialogComponent {
  private readonly service = inject(TLS26040Service);
  private readonly messageService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  visible = model(false);
  reverted = output<void>();

  queryForm = inject(FormBuilder).group({
    batch_no: ['', [Validators.required, Validators.maxLength(12)]], // 批號
  });

  submitted = false;
  loading = false;
  data: TLS26040DetailData[] = [];
  footerData: { TXN_TotSaleAmt: number } | null = null;
  queriedBatchNo = ''; // 實際查詢的批號，還原時以此為準（避免查詢後又改輸入框）

  columns: ReportColumn[] = [
    { field: 'TXN_Date', header: '預售日期', visible: true, format: formatDate },
    { field: 'TLT_No', header: '專櫃編號', visible: true, align: 'left' },
    { field: 'tlt_name', header: '專櫃名稱', visible: true, align: 'left' },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true, format: formatToSixDigits },
    { field: 'TXN_TotSaleAmt', header: '金額', visible: true, format: formatAmount, align: 'right' },
  ];

  onQuery(): void {
    this.submitted = true;
    if (this.queryForm.invalid) return;
    const batchNo = this.queryForm.getRawValue().batch_no?.trim() ?? '';
    this.loading = true;
    this.service.queryTLS26040Detail({ batch_no: batchNo })
      .pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.data = res.Data ?? [];
        this.queriedBatchNo = this.data.length ? batchNo : '';
        this.footerData = this.data.length
          ? { TXN_TotSaleAmt: this.data.reduce((sum, r) => sum + (Number(r.TXN_TotSaleAmt) || 0), 0) }
          : null;
        if (!this.data.length) this.messageService.warnBubble('查無此批號資料');
      });
  }

  onRevert(): void {
    if (!this.queriedBatchNo) return;
    this.messageService.confirm({
      header: `是否確認整批還原批號 ${this.queriedBatchNo}？`,
      accept: () => {
        this.loading = true;
        this.service.revertBatchTLS26040({ batch_no: this.queriedBatchNo })
          .pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.messageService.successBubble('批號還原成功');
            this.reverted.emit();
            this.visible.set(false);
          });
      }
    });
  }

  onHide(): void {
    this.queryForm.reset({ batch_no: '' });
    this.submitted = false;
    this.data = [];
    this.footerData = null;
    this.queriedBatchNo = '';
  }
}
