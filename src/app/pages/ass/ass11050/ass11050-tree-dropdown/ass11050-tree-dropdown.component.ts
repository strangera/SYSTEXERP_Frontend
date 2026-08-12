import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, input, viewChild } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Tree, TreeModule } from 'primeng/tree';

type Column = { value: string; label: string; };

@Component({
  selector: 'app-tree-dropdown',
  templateUrl: './ass11050-tree-dropdown.component.html',
  styleUrls: ['./ass11050-tree-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TreeModule,
  ],
})
export class ASS11050TreeDropdownComponent {
  private readonly treeComponent = viewChild(Tree);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly members = input<any[]>([], { alias: 'members' }); // 允許外部傳入成員資料
  columns = input<Column[]>([], { alias: 'Columns' }); //Columns前兩欄是父節點，最後一個是末端葉節點
  columnsLength = computed(() => this.columns().length - 1); // 欄位數量
  leaveColumnLabel = input<string>('', { alias: 'LeaveColumnLabel' }); // 子節點顯示名稱
  listTitle = input<string>('階層圖'); // 階層圖名稱

  protected readonly treeData = computed(() => this.buildTreeFromFlatData());

  // 將扁平化資料轉成樹狀(4層或以上)
  private buildTreeFromFlatData(): TreeNode[] {
    const members = this.members();
    const columns = this.columns();
    const columnsLength = columns.length;
    const leaveColumnLabel = this.leaveColumnLabel();

    if (!members.length || !columnsLength) return [];

    const buildRecursive = (data: any[], depth: number): TreeNode[] => {
      const currentKey = columns[depth]?.value;
      if (!currentKey) return [];

      // 顯式定義 grouped 的型別，避免 group 推斷為 unknown
      const grouped: Record<string, any[]> = Object.create(null);
      for (const item of data) {
        const key = item[currentKey];
        (grouped[key] ??= []).push(item);
      }

      return Object.entries(grouped).map(([key, group], index) => {

        if (depth === columnsLength - 1) {
          // 已達最後一層，視為葉節點
          const dataItem = group[0]; // 預設用第一筆資料當作代表，可自訂合併邏輯
          const label = dataItem?.[leaveColumnLabel] || key;

          return {
            key: `${depth}-${index}-${key}`,
            label,
            data: dataItem,
            icon: 'pi pi-user',
            leaf: !0,
            selectable: !1
          };
        }

        return {
          key: `${depth}-${index}-${key}`,
          label: key,
          children: buildRecursive(group, depth + 1),
          icon: 'pi pi-folder',
          selectable: !1 // 這是關鍵
        };
      });
    };

    return buildRecursive(members, 0);
  }


  // 展開樹狀至目標層級（層級從0開始）
  expandToLevel(level: number) {
    // console.log('level', level);
    this.treeData().forEach(node => this.expandToLevelRecursive(node, 0, level - 1));
  }

  // 只能展開到 maxLevel 層，超過就不展開
  private expandToLevelRecursive(node: TreeNode, currentLevel: number, maxLevel: number) {
    node.expanded = currentLevel < maxLevel; // 當前層小於目標層數才展開
    if (node.children) {
      node.children.forEach(child => {
        this.expandToLevelRecursive(child, currentLevel + 1, maxLevel);
      });
    }
  }

  //鍵盤事件
  onKeyDownExpand(event: KeyboardEvent, level: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.expandToLevel(level);
    }
  }

  // 清除：還原篩選文字與展開狀態至初始（全部收合）
  resetFilter(): void {
    this.treeComponent()?.resetFilter();
    this.treeData().forEach(node => this.collapseRecursive(node));
    this.cdr.markForCheck(); // OnPush：清除動作發生在父層事件，需手動標記才會重繪樹狀畫面
  }

  private collapseRecursive(node: TreeNode): void {
    node.expanded = false;
    node.children?.forEach(child => this.collapseRecursive(child));
  }
}
