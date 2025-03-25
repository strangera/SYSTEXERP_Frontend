import { Component, Input, OnInit } from '@angular/core';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { FormControl } from '@angular/forms';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-input-three-dialog',
  templateUrl: './input-three-dialog.component.html',
  styleUrls: ['./input-three-dialog.component.scss']
})
export class InputThreeDialogComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() controlName: string = '';
  @Input() control: FormControl = new FormControl();
  @Input() submitted: boolean = false;
  visible: boolean = false;
  selectedValueID: number = 0;
  selectedValueType: string = '';
  selectedValueMajor: string = '';
  selectedValueMinor: string = '';
  selectedItem: any = null;
  selectedType: any = null;
  selectedSystem: any = null;

  // 層級結構的資料json
  categories = [
    {
      type: '金融類別',
      code: 'CASH001',
      systems: [
        {
          name: '票據系統',
          code: 'SYSU000',
          names: [
            { name: '票據管理子系統1', code: 'a1' },
            { name: '票據管理子系統2', code: 'a2' },
            { name: '票據測試1', code: 'test1' }
          ]
        },
        {
          name: '禮券系統',
          code: 'SYSV000',
          names: [
            { name: '禮券管理子系統1', code: 'b1' },
            { name: '禮券測試2', code: 'test2' }
          ]
        }
      ]
    },
    {
      type: '管理類別',
      code: 'MANA001',
      systems: [
        {
          name: '營運系統',
          code: 'SYSA000',
          names: [
            { name: '營運管理子系統1', code: 'c1' }
          ]
        }
      ]
    }
  ];

  filteredCategories: any[] = this.categories;
  filteredSystems: any[] = [];
  filteredNames: any[] = [];
  searchResults: any[] = []; // 輸入文字的查詢結果

  ngOnInit(): void {
    this.checkRequiredValidator(this.control);
    this.setPlaceholder('輸入文字', this.control);
    this.checkIntLengthValidator(this.control);
  }

  showDialog() {
    this.visible = true;
    this.selectedType = null; // 重置選擇的類別
    this.selectedSystem = null; // 重置選擇的系統
    this.filteredSystems = []; // 清空過濾後的系統資料
    this.filteredNames = []; // 清空過濾後的名稱資料
  }

  onTypeSelect(event: any) {
    this.selectedType = event.data;
    this.filteredSystems = this.selectedType.systems;
    this.selectedSystem = null; // 重置系統選擇
    this.filteredNames = []; // 重置名稱選擇
  }

  onSystemSelect(event: any) {
    this.selectedSystem = event.data;
    this.filteredNames = this.selectedSystem.names; // 根據所選系統過濾名稱資料
  }

  onRowSelect(event: any) {
    this.selectedItem = event.data;
    this.selectedValueID = this.selectedItem.id;
    this.selectedValueType = this.selectedType?.type || ''; // 確保安全存取
    this.selectedValueMajor = this.selectedSystem?.name || ''; // 確保安全存取
    this.selectedValueMinor = this.selectedItem.name; // 顯示選擇的名稱
    this.visible = false;
  }

  // 更新過濾的系統和名稱
  updateFilteredData(searchValue: string) {
    this.filteredSystems = [];
    this.filteredNames = [];

    this.categories.forEach(category => {
      category.systems.forEach(system => {
        if (system.code.includes(searchValue)) { // 若系統 code 包含搜尋字串
          this.filteredSystems.push(system);
        }
        system.names.forEach(name => {
          if (name.code.includes(searchValue)) { // 若名稱 name 包含搜尋字串
            this.filteredNames.push(name);
          }
        });
      });
    });
  }

  // 末端查詢的邏輯(僅限code)
  getEndQueryResults(searchValue: string): any[] {
    const results:any[] = [];

    this.categories.forEach(category => {
      category.systems.forEach(system => {
          // 檢查系統名稱和代碼
          if (system.name.includes(searchValue) || system.code.includes(searchValue)) {
              results.push({ category: category.type, system: system.name, name: system.name, code: system.code }); // 添加系統
          }

          system.names.forEach(name => {
              // 檢查名稱的代碼和名稱
              if (name.code.includes(searchValue) || name.name.includes(searchValue)) {
                  results.push({ category: category.type, system: system.name, name: name.name, code: name.code });
              }
          });
      });
    });

    // 更新 filteredCategories
    this.updateFilteredCategories(results);

    return results;
  }

  // 過濾符合條件的類別(階級最上層)
  updateFilteredCategories(results: any[]): void {
    this.filteredCategories = [];

    results.forEach(result => {
      // 根據 result.category 過濾符合的類別
      const matchedCategory = this.categories.find(category => category.type === result.category);

      if (matchedCategory && !this.filteredCategories.includes(matchedCategory)) {
        // 如果類別尚未在 filteredCategories 中，將其加入
        this.filteredCategories.push(matchedCategory);
      }
    });
}

  //先做末端查詢(比較簡單，全域查詢之後再做)
  onGlobalFilter(table: Table, event: Event) {
    const searchValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(searchValue, 'contains');

    this.searchResults = this.getEndQueryResults(searchValue);
    console.log('搜尋結果', this.searchResults);

    // 清空過濾的系統和名稱
    this.filteredSystems = [];
    this.filteredNames = [];

    // 如果有符合的資料，則更新選擇的項目並推送到過濾列表
    if (this.searchResults.length > 0) {
      this.searchResults.forEach((result: { category: string; system: string; name: string; code: string }) => {
        // 更新選擇的類別和系統
        this.selectedType = this.categories.find(category => category.type === result.category);
        this.selectedSystem = this.selectedType?.systems.find((system: { name: string }) => system.name === result.system);

        // 推送符合的名稱到過濾名稱列表
        const matchedName = this.selectedSystem?.names.find((name: { name: string }) => name.name === result.name);
        if (matchedName) {
          this.filteredSystems.push(this.selectedSystem);
          this.filteredNames.push(matchedName);
        }

        // 設置選擇的項目
        this.selectedItem = matchedName; // 選擇的名稱
        this.selectedValueID = this.selectedItem?.code; // 使用名稱的 code 作為 ID
        this.selectedValueType = this.selectedType?.type || '';
        this.selectedValueMajor = this.selectedSystem?.name || '';
        this.selectedValueMinor = this.selectedItem?.name || '';
      });
    }
  }

  // 清除所有輸入內容
  clearAllInputs(): void {
    this.selectedValueID = 0; // 重置選擇的 ID
    this.selectedValueType = ''; // 重置選擇的類別
    this.selectedValueMajor = ''; // 重置選擇的系統
    this.selectedValueMinor = ''; // 重置選擇的名稱
    this.selectedItem = null; // 清空選擇的項目
    this.selectedType = null; // 清空選擇的類別
    this.selectedSystem = null; // 清空選擇的系統
    this.filteredSystems = []; // 清空過濾的系統
    this.filteredNames = []; // 清空過濾的名稱
    this.filteredCategories = this.categories; // 清空過濾的類別，恢復為原始類別
    this.control.setValue(''); // 清空表單控件的值
  }

  // 從名稱回到系統
  goBackToSystems(): void {
    this.selectedSystem = null; // 清空選擇的系統
    this.filteredNames = []; // 清空過濾的名稱
    this.filteredSystems = this.selectedType?.systems || []; // 根據選擇的類別恢復過濾的系統
  }

  // 從系統回到類別
  goBackToCategories(): void {
    this.selectedType = null; // 清空選擇的類別
    this.selectedSystem = null; // 清空選擇的系統
    this.filteredSystems = []; // 清空過濾的系統
    this.filteredNames = []; // 清空過濾的名稱
    this.filteredCategories = this.categories; // 恢復原始類別
  }
}
