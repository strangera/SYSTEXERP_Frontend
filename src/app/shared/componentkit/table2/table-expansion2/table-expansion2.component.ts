import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Column, expandAnimation } from '../table2.model';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
import { NgFor, NgClass, NgIf } from '@angular/common';

@Component({
    selector: 'app-table-expansion2',
    templateUrl: './table-expansion2.component.html',
    styleUrl: './table-expansion2.component.scss',
    animations: [expandAnimation],
    standalone: true,
    imports: [TableModule, PrimeTemplate, NgFor, NgClass, NgIf]
})
export class TableExpansion2Component implements OnInit {
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
