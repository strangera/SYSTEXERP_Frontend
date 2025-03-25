import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-category-selector',
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.scss']
})
export class CategorySelectorComponent {
  @Input() categories: any[] = []; // 大分類的資料
  @Input() placeholder: string = '請選擇'; // 預設提示文字
  @Output() selectionChange = new EventEmitter<any>(); // 輸出選擇的結果

  selectedCategory: any = null; // 當前選中的大分類
  selectedSubCategory: any = null; // 當前選中的中分類
  selectedSubSubCategory: any = null; // 當前選中的小分類

  // 更新選擇的值
  onCategoryChange(): void {
    this.selectedSubCategory = null;
    this.selectedSubSubCategory = null;
    this.emitSelection();
  }

  onSubCategoryChange(): void {
    this.selectedSubSubCategory = null;
    this.emitSelection();
  }

  onSubSubCategoryChange(): void {
    this.emitSelection();
  }

  // 發送選擇的結果
  private emitSelection(): void {
    this.selectionChange.emit({
      category: this.selectedCategory,
      subCategory: this.selectedSubCategory,
      subSubCategory: this.selectedSubSubCategory
    });
  }
}
