/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TableCaptionComponent } from '@others/component/table/table-caption/table-caption.component';
import { ButtonModule } from 'primeng/button';
import { Table, TableColumnReorderEvent, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { BasicPrintDataComponent } from 'src/app/others/componentextends/basic-print/basic-print-data.component';
import { expandAnimation, formatAmount2, ReportColumn, TableQueryPayload } from './tls2f010-table-report.model';

@Component({
  selector: 'app-tls2f010-table-report',
  host: { 'table-report-id': 'app-tls2f010-table-report' },
  standalone: true,
  imports: [TableModule, CommonModule, ButtonModule, TooltipModule, FormsModule, TableCaptionComponent],
  templateUrl: './tls2f010-table-report.component.html',
  styleUrls: ['./tls2f010-table-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [expandAnimation]
})
export class TLS2F010TableReportComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('dt') public dt!: Table;
  @Input({ required: true }) totalRecords = 0;
  @Input({ required: true }) data: any[] = [];
  @Input({ required: true }) columns: ReportColumn[] = [];
  virtualData: any = [];
  selectedColumns: ReportColumn[] = [];
  @Input() tableKey = this.route.snapshot.url[this.route.snapshot.url.length - 1].path;
  @Input() loading = false;
  @Input() showRadioButton = false;
  @Input() selectedItem: any = null;
  @Output() selectionChange = new EventEmitter<any>();
  @Input() extraFooterData: any;
  @Input() autoHeight = false;

  constructor(
    private readonly route: ActivatedRoute,
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.virtualData = [];
      if (this.data.length !== 0) {
        if (this.dt) {
          this.dt.virtualScroll = false;
        }
        this.cdr.detectChanges();
        if (this.data.length < 30) {
          this.virtualData = this.data;
          this.dt.virtualScroll = false;
          this.dt.scrollHeight = this.autoHeight ? undefined as any : '450px';
        } else {
          this.dt.virtualScroll = true;
          this.dt.scrollHeight = this.autoHeight ? undefined as any : '450px';
          this.virtualData = Array.from({ length: this.data.length });
          this.cdr.detectChanges();
          this.virtualData = this.data;
        }
      }
    }
  }
  private rawLabelMap: Record<string, string> = {
    UnPostedAmt_NoTax: '未登錄餘額(免稅)',
    UnPostedAmt_WithTax: '未登錄餘額(含稅)',
  };
  private formatValue(v: any): any {
    if (v === null || v === undefined || v === '') return '';
    const num = Number(v);
    if (!isNaN(num)) return formatAmount2(num);
    return String(v);
  }
  public getExtraFooterArray(): { label: string; value: any }[] {
    const d = this.extraFooterData;
    if (!d) return [];
    if (Array.isArray(d)) {
      return d.map((x: any) => {
        if (x && typeof x === 'object' && ('label' in x || 'value' in x)) {
          const rawLabel = x.label ?? '';
          const mappedLabel = this.rawLabelMap[rawLabel] ?? rawLabel;
          return { label: mappedLabel, value: this.formatValue(x.value ?? '') };
        }
        const rawLabel = String(x?.label ?? '');
        return { label: this.rawLabelMap[rawLabel] ?? rawLabel, value: this.formatValue(x?.value ?? x) };
      });
    }
    if (typeof d === 'object') {
      return Object.keys(d).map(k => ({ label: this.rawLabelMap[k] ?? k, value: this.formatValue(d[k]) }));
    }
    return [{ label: '', value: this.formatValue(d) }];
  }
  onSingleSelectionChange(item: any) {
    this.selectedItem = item ?? null;
    this.selectionChange.emit(this.selectedItem);
  }
  customSort(event: TableQueryPayload) {
    this.data.sort((data1, data2) => {
      for (const sortMeta of event.multiSortMeta!) {
        const value1 = data1[sortMeta.field];
        const value2 = data2[sortMeta.field];
        let result = 0;
        if (value1 == null && value2 != null) result = -1;
        else if (value1 != null && value2 == null) result = 1;
        else if (value1 == null && value2 == null) result = 0;
        else if (typeof value1 === 'string' && typeof value2 === 'string')
          result = value1.localeCompare(value2, undefined, { numeric: true, sensitivity: 'base' });
        else
          result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
        if (result !== 0) {
          return sortMeta.order * result;
        }
      }
      return 0;
    });
    this.virtualData = this.data;
    this.cdr.markForCheck();
  }
  trackByFn(index: number) {
    return index;
  }
  onColReorder(event: TableColumnReorderEvent) {
    this.columns = event.columns as ReportColumn[];
    this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  }
}
