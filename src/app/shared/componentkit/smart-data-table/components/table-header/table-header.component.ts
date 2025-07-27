// shared/componentkit/smart-data-table/components/table-header/table-header.component.ts

import { Component, Input, Output, EventEmitter, ContentChild, ElementRef } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';

// PrimeNG 模組
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';

// 本地型別
import { TableConfig } from '../../types/table.types';

@Component({
  selector: 'app-table-header',
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.scss'],
  standalone: true,
  imports: [
    NgIf, NgClass,
    ButtonModule, RippleModule, TooltipModule
  ]
})
export class TableHeaderComponent {

  // ==================== 輸入屬性 ====================

  @Input() config: TableConfig = {};
  @Input() selectedCount: number = 0;
  @Input() isAllExpanded: boolean = false;
  @Input() hasExpandableContent: boolean = false;
  @Input() readonly: boolean = false;
  @Input() loading: boolean = false;

  // ==================== 輸出事件 ====================

  @Output() addClick = new EventEmitter<void>();
  @Output() batchDeleteClick = new EventEmitter<void>();
  @Output() expandAllClick = new EventEmitter<void>();
  @Output() refreshClick = new EventEmitter<void>();

  // ==================== 內容投影 ====================

  @ContentChild('[header-left]', { read: ElementRef }) headerLeft?: ElementRef;
  @ContentChild('[header-right]', { read: ElementRef }) headerRight?: ElementRef;

  // ==================== 事件處理 ====================

  /**
   * 處理新增按鈕點擊
   */
  onAddClick(): void {
    if (this.readonly || this.loading) {
      return;
    }
    this.addClick.emit();
  }

  /**
   * 處理批次刪除按鈕點擊
   */
  onBatchDeleteClick(): void {
    if (this.readonly || this.loading || this.selectedCount === 0) {
      return;
    }
    this.batchDeleteClick.emit();
  }

  /**
   * 處理展開/收合全部按鈕點擊
   */
  onExpandAllClick(): void {
    if (!this.hasExpandableContent) {
      return;
    }
    this.expandAllClick.emit();
  }

  /**
   * 處理重新整理按鈕點擊
   */
  onRefreshClick(): void {
    this.refreshClick.emit();
  }

  // ==================== 顯示邏輯 ====================

  /**
   * 是否顯示新增按鈕
   */
  get showAddButton(): boolean {
    return !this.readonly &&
      this.config.showAddButton !== false;
  }

  /**
   * 是否顯示批次刪除按鈕
   */
  get showBatchDeleteButton(): boolean {
    return !this.readonly &&
      this.config.showBatchDelete !== false;
  }

  /**
   * 是否顯示展開/收合按鈕
   */
  get showExpandButton(): boolean {
    return this.hasExpandableContent &&
      this.config.expandable !== false;
  }

  /**
   * 批次刪除按鈕是否為禁用狀態
   */
  get isBatchDeleteDisabled(): boolean {
    return this.selectedCount === 0 || this.readonly || this.loading;
  }

  /**
   * 展開/收合按鈕的圖示
   */
  get expandButtonIcon(): string {
    return this.isAllExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down';
  }

  /**
   * 展開/收合按鈕的文字
   */
  get expandButtonLabel(): string {
    return this.isAllExpanded ? '收合全部' : '展開全部';
  }

  /**
   * 是否有左側內容
   */
  get hasLeftContent(): boolean {
    return this.showAddButton ||
      this.showBatchDeleteButton ||
      this.hasHeaderLeftContent();
  }

  /**
   * 是否有右側內容
   */
  get hasRightContent(): boolean {
    return this.showExpandButton ||
      this.hasHeaderRightContent();
  }

  /**
   * 是否顯示整個工具列
   */
  get shouldShowHeader(): boolean {
    return this.hasLeftContent || this.hasRightContent;
  }

  /**
   * 檢查是否有自定義左側內容
   */
  hasHeaderLeftContent(): boolean {
    return this.headerLeft?.nativeElement?.children.length > 0;
  }

  /**
   * 檢查是否有自定義右側內容
   */
  hasHeaderRightContent(): boolean {
    return this.headerRight?.nativeElement?.children.length > 0;
  }

  // ==================== 樣式相關 ====================

  /**
   * 取得新增按鈕的樣式類別
   */
  get addButtonClass(): string {
    return 'p-button-rounded p-button-success';
  }

  /**
   * 取得批次刪除按鈕的樣式類別
   */
  get batchDeleteButtonClass(): string {
    const baseClass = 'p-button-rounded p-button-danger';
    return this.isBatchDeleteDisabled ?
      `${baseClass} p-button-outlined` :
      baseClass;
  }

  /**
   * 取得展開按鈕的樣式類別
   */
  get expandButtonClass(): string {
    return 'p-button-text p-button-sm';
  }

  /**
   * 取得工具列容器的樣式類別
   */
  get headerContainerClass(): string {
    let classes = 'table-header-container';

    if (this.loading) {
      classes += ' loading';
    }

    if (this.readonly) {
      classes += ' readonly';
    }

    return classes;
  }
}
