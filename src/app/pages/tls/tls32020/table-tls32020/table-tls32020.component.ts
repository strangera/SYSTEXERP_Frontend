
import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Input,
    ViewChild
} from '@angular/core';

import { TableReportComponent } from '@shared/components/table-report/table-report.component';

import {
    ColumnGroup,
    ReportColumn
} from '@shared/components/table-report/table-report.model';

@Component({
    selector: 'app-table-tls32020',
    standalone: true,
    imports: [
        CommonModule,
        TableReportComponent
    ],
    templateUrl: './table-tls32020.component.html',
styles: [`
  :host ::ng-deep
  .tls32020-report app-table-report
  button:has(.pi-file):not(:has(.p-button-label)) {
    display: none !important;
  }
`],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TableTLS32020Component {

    @ViewChild(TableReportComponent)
    private tableReport?: TableReportComponent;

    @Input() data: any[] = [];
    @Input() columns: ReportColumn[] = [];
    @Input() totalRecords = 0;
    @Input() loading = false;

    @Input() dataKey = 'talent_id';
    @Input() lazy = false;

    @Input() columnGroup?: ColumnGroup[];
    @Input() topColumnGroup?: ColumnGroup[];

    @Input() footerData: any;
    @Input() subTotalData: any;
    @Input() lastQueryBody: any;
    @Input() groupRowsBy?: string;

    @Input() showSubTotalGroupValue = false;

    @Input() showManage = false;
    @Input() showEdit = false;
    @Input() showDetail = false;
    @Input() showDelete = false;

    /**
     * 取得目前齒輪勾選的欄位物件。
     * 直接讀取共用 Table 的 selectedColumns，
     * 不需要修改共用元件。
     */
    getSelectedColumns(): ReportColumn[] {
        if (!this.tableReport) {
            return [];
        }

        return [...this.tableReport.selectedColumns];
    }

    /**
     * 取得匯出欄位 Field 清單。
     * 保留齒輪設定的欄位順序。
     */
    getExportColumnFields(): string[] {
        const selectedColumns = this.tableReport?.selectedColumns ?? [];

        console.log('齒輪選取欄位：', selectedColumns);

        return selectedColumns.map(col => col.field);
    }
}
