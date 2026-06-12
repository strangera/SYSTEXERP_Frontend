import { Injectable } from '@angular/core';
import { ReportColumn } from '../table-report.model';

@Injectable()
export class TableReportDragDropService {
  private draggedCol: ReportColumn | null = null;
  private draggedIndex = -1;

  public handleDragStart(event: DragEvent, col: ReportColumn, index: number) {
    this.draggedCol = col;
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  public handleDragOver(event: DragEvent, targetCol: ReportColumn) {
    if (!this.draggedCol) return;
    // 規則判斷：同群組才能互換位置
    const isSameGroup = this.draggedCol.groupField === targetCol.groupField;
    if (isSameGroup) {
      event.preventDefault();
    }
  }

  public handleDrop(
    event: DragEvent,
    targetCol: ReportColumn,
    targetIndex: number,
    columns: ReportColumn[],
    tableKey: string,
    queryState: any
  ): ReportColumn[] {
    event.preventDefault();
    if (!this.draggedCol || this.draggedIndex === -1) return columns;
    if (this.draggedCol.groupField !== targetCol.groupField) return columns;

    const updatedColumns = [...columns];
    // 1. 移出舊位置
    updatedColumns.splice(this.draggedIndex, 1);
    // 2. 塞入新位置
    updatedColumns.splice(targetIndex, 0, this.draggedCol);

    // 記憶排序狀態
    if (queryState) {
      queryState.setQueryState(tableKey + 'Filter', updatedColumns);
    }

    // 重置暫存
    this.draggedCol = null;
    this.draggedIndex = -1;

    return updatedColumns;
  }
}
