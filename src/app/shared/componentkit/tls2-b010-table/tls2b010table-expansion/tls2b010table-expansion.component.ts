import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Column, expandAnimation } from '../tls2b010table.model';
import { TableModule } from 'primeng/table';
import { PrimeTemplate, SortMeta } from 'primeng/api';
import { NgFor, NgIf, CommonModule } from '@angular/common';

@Component({
  selector: 'app-tls2b010table-expansion',
  templateUrl: './tls2b010table-expansion.component.html',
  styleUrl: './tls2b010table-expansion.component.scss',
  animations: [expandAnimation],
  standalone: true,
  imports: [TableModule, PrimeTemplate, NgFor, NgIf, CommonModule],
})
export class tls2b010tableExpansionComponent implements OnInit, OnChanges {
  @Input() expansionDataKey = 'id';
  @Input() expansionColumns: Column[] = [];
  @Input() rowData: any;

  // 既有：多欄位排序
  @Input() expansionMultiSortMeta?: SortMeta[];

  // 新增：單欄位排序（為了相容父元件的 [expansionSortField]/[expansionSortOrder] 綁定）
  @Input() expansionSortField?: string;
  @Input() expansionSortOrder: number = 1; // 放寬型別

  @Input() showPaginator = false;
  @Input() rows = 20;
  @Input() rowsPerPageOptions = [20, 40, 60, 80, 100];
  @Input() scrollHeight = '300px';
  

  localRowData: any[] = [];
  isExpanded = false;
  totalRecords = 0;
  first = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.ensureSortMeta();
    this.hydrateRows();
    this.isExpanded = true;
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rowData'] || changes['expansionDataKey']) {
      this.hydrateRows();
    }
    if (changes['expansionSortField'] || changes['expansionSortOrder'] || changes['expansionMultiSortMeta']) {
      this.ensureSortMeta();
    }
  }
  private ensureSortMeta() {
  const order: 1 | -1 = this.expansionSortOrder === -1 ? -1 : 1; // 正規化
  this.expansionMultiSortMeta = this.expansionMultiSortMeta?.length
    ? this.expansionMultiSortMeta
    : [{ field: this.expansionSortField ?? this.expansionDataKey, order }];
}

 

  private hydrateRows(): void {
    this.localRowData = this.rowData?.[this.expansionDataKey] ?? [];
    this.totalRecords = this.localRowData.length;
  }

  getFilterColumns(columns: Column[]): Column[] {
    return columns.filter((col) => !col.hidden);
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }
}
