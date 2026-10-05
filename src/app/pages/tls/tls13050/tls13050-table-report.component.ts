import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  SimpleChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { ReportSignatureComponent } from '@shared/biz-components/report-signature/report-signature.component';

import { TableReportCaptionComponent } from '@shared/components/table-report/components/table-report-caption/table-report-caption.component';

import { TableExpansionComponent } from '@shared/components/table-report/components/table-report-expansion/table-report-expansion.component';

import { TableReportComponent } from '@shared/components/table-report/table-report.component';

import { TableReportDataFlowService } from '@shared/components/table-report/services/table-report-data-flow.service';

import { TableReportDragDropService } from '@shared/components/table-report/services/table-report-drag-drop.service';

import { TableReportPermissionService } from '@shared/components/table-report/services/table-report-permission.service';

import { TableReportSelectionService } from '@shared/components/table-report/services/table-report-selection.service';

import { TableReportSubtotalService } from '@shared/components/table-report/services/table-report-subtotal.service';

import { TableReportWidthService } from '@shared/components/table-report/services/table-report-width.service';

@Component({
  selector: 'app-tls13050-table-report',
  standalone: true,

  host: {
    'table-report-id': 'tls13050-table-report',
    '[class.fixed-height]': '!autoHeight'
  },

  imports: [
    ReportSignatureComponent,
    TableExpansionComponent,
    SkeletonModule,
    TableModule,
    CommonModule,
    ImageModule,
    ButtonModule,
    TooltipModule,
    MultiSelectModule,
    FormsModule,
    TableReportCaptionComponent
  ],

  providers: [
    TableReportWidthService,
    TableReportSelectionService,
    TableReportDragDropService,
    TableReportSubtotalService,
    TableReportPermissionService,
    TableReportDataFlowService
  ],

  templateUrl:
    '../../../shared/components/table-report/table-report.component.html',

  styleUrls: [
    '../../../shared/components/table-report/table-report.component.scss'
  ]
})
export class TLS13050TableReportComponent
  extends TableReportComponent {

  private readonly tls13050Cdr =
    inject(ChangeDetectorRef);

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);

    // TLS13050 不使用 virtual scroll，
    // 避免滑到底部時發生反彈 / 重複觸發載入
    this.virtualScrollEnabled = false;

    this.tls13050Cdr.detectChanges();
  }

  override ngAfterViewInit(): void {
    // 再次強制關閉，避免父類別初始化後重新打開
    this.virtualScrollEnabled = false;

    this.tls13050Cdr.detectChanges();
  }
}