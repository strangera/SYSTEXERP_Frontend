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
    selector: 'app-ass15040-table-report',
    standalone: true,

    host: {
        'table-report-id': 'ass15040-table-report',
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

    templateUrl: './ass15040-table-report.component.html',

    styleUrls: [
        '../../../shared/components/table-report/table-report.component.scss'
    ]
})
export class ASS15040TableReportComponent
    extends TableReportComponent {

    private readonly ass15040Cdr =
        inject(ChangeDetectorRef);

    override ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);

        // 此報表直接一次載入完整資料，
        // 避免小計列在 virtual scroll 下出現渲染位置問題
        this.virtualScrollEnabled = false;

        this.ass15040Cdr.detectChanges();
    }

    override ngAfterViewInit(): void {
        this.virtualScrollEnabled = false;

        this.ass15040Cdr.detectChanges();
    }

    isSubtotalRow(rowData: any): boolean {
        return rowData?.STYPE_NAME === '小計';
    }

    /**
     * 項次～購入日期：
     * __ITEM_NO
     * ASSET_ID
     * GOODS_ID
     * GOODS_NAME
     * EXP_YEAR
     * GET_DATE
     *
     * 共 6 欄
     */
    getSubtotalColspan(columns: any[]): number {
        const getDateIndex =
            columns.findIndex(col => col.field === 'GET_DATE');

        return getDateIndex >= 0
            ? getDateIndex + 1
            : 1;
    }
}