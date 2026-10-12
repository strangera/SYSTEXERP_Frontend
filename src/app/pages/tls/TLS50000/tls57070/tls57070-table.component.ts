import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { ButtonModule } from 'primeng/button';

import {
  Tls57070DataItem,
  Tls57070Service
} from '@service/api/tls/tls57070.service';

import {
  ColumnGroup,
  ReportColumn
} from '@shared/components/table-report/table-report.model';

import {
  TableReportComponent
} from '@shared/components/table-report/table-report.component';

@Component({
  selector: 'app-tls57070-table',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableReportComponent
  ],
  templateUrl: './tls57070-table.component.html',
  styleUrls: ['./tls57070-table.component.scss']
})
export class Tls57070TableComponent {

  @Input() data: Tls57070DataItem[] = [];

  @Output() dataChange =
    new EventEmitter<Tls57070DataItem[]>();

  @Input() columns: ReportColumn[] = [];

  @Input() totalRecords = 0;

  @Input() footerData: any;

  @Input() subTotalData: any;

  @Input() columnGroup: ColumnGroup[] = [];

  @Input() groupRowsBy = '';

  @Input() lastQueryBody: any;

  @Input() loading = false;

  @Input() btnLoading = false;

  @Output() exportPDF = new EventEmitter<void>();

  @Output() exportXLSX = new EventEmitter<void>();

  readonly itemSize = 30;

  constructor(
    public readonly tls57070Service: Tls57070Service
  ) {
  }
}