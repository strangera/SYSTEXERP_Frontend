import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Column, expandAnimation } from '../table.model';

@Component({
  selector: 'app-table-expansion',
  templateUrl: './table-expansion.component.html',
  styleUrl: './table-expansion.component.scss',
  animations: [expandAnimation]
})
export class TableExpansionComponent implements OnInit {
  @Input() expansionDataKey = '';
  @Input() expansionColumns: Column[] = [];
  @Input() rowData: any;
  @Input() expansionSortField = 'ID';
  @Input() expansionSortOrder = 1;

  localRowData: any[] = [];
  isExpanded = false;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.localRowData = this.rowData[this.expansionDataKey] || [];
      this.isExpanded = true;

      // **強制觸發變更偵測**
      this.cdr.detectChanges();
    });
  }

  getFilterColumns(columns: Column[]): Column[] {
    return columns.filter(col => !col.hidden);
  }
}
