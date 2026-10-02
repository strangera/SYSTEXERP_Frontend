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
  selector: 'app-tls32060-table-report',
  standalone: true,

  host: {
    'table-report-id': 'tls32060-table-report',
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
export class TLS32060TableReportComponent
  extends TableReportComponent {

  private readonly tls32060Cdr =
    inject(ChangeDetectorRef);

  override ngOnChanges(changes: SimpleChanges): void {

    super.ngOnChanges(changes);

    this.virtualScrollEnabled = false;

    this.tls32060Cdr.detectChanges();
  }

  override ngAfterViewInit(): void {

    this.virtualScrollEnabled = false;

    this.tls32060Cdr.detectChanges();
  }
}