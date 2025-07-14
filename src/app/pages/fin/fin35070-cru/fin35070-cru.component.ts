import { Component } from '@angular/core';
import { TreeNode, PrimeTemplate } from 'primeng/api';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { NgClass } from '@angular/common'; // 使用 PrimeNG 的 TreeNode 類型

@Component({
    selector: 'app-fin35070-cru',
    templateUrl: './fin35070-cru.component.html',
    styleUrls: ['./fin35070-cru.component.scss'],
    standalone: true,
    imports: [OrganizationChartModule, PrimeTemplate, NgClass]
})
export class FIN35070CRUComponent {
  data: TreeNode<any>[] = []; // 初始化為空數組
  selectedNode: TreeNode<any> | null = null; // 用來存儲當前選中的節點
  nodeLevels: Map<string, number> = new Map(); // 確保 nodeLevels 已初始化

  constructor() {
    this.data = this.constructTreeWithLevels(); // 初始化數據並設置層級
  }

  // 構建樹狀結構並設置每個節點的層級
  constructTreeWithLevels(): TreeNode<any>[] {
    const nodes: TreeNode<any>[] = [{
      label: '[100000] 全公司',
      expanded: false,
      data: { name: '全公司' },
      children: [
        {
          label: '[101000] 經營企劃部(停用)',
          expanded: false,
          data: { name: '[101000] 經營企劃部(停用)' },
          children: [
            { label: '[101100] 行政Team(停用)', data: { name: '[101100] 行政Team(停用)' } },
            { label: '[101200] 公關Team(停用)', data: { name: '[101200] 公關Team(停用)' } },
            { label: '[101300] 營企Team(停用)', data: { name: '[101300] 營企Team(停用)' } },
            { label: '[101400] 電子商務team(停用)', data: { name: '[101400] 電子商務team(停用)' } },
            { label: '[101500] 外商Team(停用)', data: { name: '[101500] 外商Team(停用)' } },
            { label: '[101700] 品牌代理小組(停用)', data: { name: '[101700] 品牌代理小組(停用)' } }
          ]
        },
        {
          label: '[102000] 營運部',
          expanded: false,
          data: { name: '[102000] 營運部' },
          children: [
            {
              label: '[102100] 時尚Team',
              expanded: false,
              data: { name: '[102100] 時尚Team' },
              children: [
                { label: '[102110] 1F', data: { name: '[102110] 1F' } },
                { label: '[102130] 化妝品', data: { name: '[102130] 化妝品' } }
              ]
            },
            {
              label: '[102200] 休閒Team',
              expanded: false,
              data: { name: '[102200] 休閒Team' },
              children: [
                { label: '[102210] 3F', data: { name: '[102210] 3F' } },
                { label: '[102220] 居家生活組(停用)', data: { name: '[102220] 居家生活組(停用)' } },
                { label: '[102230] 親子娛樂組(停用)', data: { name: '[102230] 親子娛樂組(停用)' } }
              ]
            },
            {
              label: '[102300] 餐飲Team',
              expanded: false,
              data: { name: '[102300] 餐飲Team' },
              children: [
                { label: '[102310] 餐廳/輕食組', data: { name: '[102310] 餐廳/輕食組' } },
                { label: '[102320] 美食街/食品料組', data: { name: '[102320] 美食街/食品料組' } },
                { label: '[102330] 品牌經營組', data: { name: '[102330] 品牌經營組' } }
              ]
            },
            {
              label: '[102400] 流行Team',
              expanded: false,
              data: { name: '[102400] 流行Team' },
              children: [
                { label: '[102120] 2F', data: { name: '[102120] 2F' } }
              ]
            },
            { label: '[102500] 特販Team', expanded: false, data: { name: '[102500] 特販Team' } },
            {
              label: '[102600] 生活Team',
              expanded: false,
              data: { name: '[102600] 生活Team' },
              children: [
                { label: '[102610] 居家生活組', data: { name: '[102610] 居家生活組' } },
                { label: '[102620] 親子娛樂組', data: { name: '[102620] 親子娛樂組' } }
              ]
            },
            { label: '[102700] 營運支援Team', expanded: false, data: { name: '[102700] 營運支援Team' } }
          ]
        },
        {
          label: '[103000] 行銷部',
          expanded: false,
          data: { name: '[103000] 行銷部' },
          children: [
            {
              label: '[103100] 會員Team',
              expanded: false,
              data: { name: '[103100] 會員Team' },
              children: [
                { label: '[103110] 檔期企劃組(停用)', data: { name: '[103110] 檔期企劃組(停用)' } },
                { label: '[103120] 會員經營組(停用)', data: { name: '[103120] 會員經營組(停用)' } }
              ]
            },
            {
              label: '[103200] 顧客關係Team(停用)',
              expanded: false,
              data: { name: '[103200] 顧客關係Team(停用)' },
              children: [
                { label: '[103210] 廣宣陳列組(停用)', data: { name: '[103210] 廣宣陳列組(停用)' } },
                { label: '[103220] 活動企劃組(停用)', data: { name: '[103220] 活動企劃組(停用)' } }
              ]
            },
            { label: '[103300] 活動Team', expanded: false, data: { name: '[103300] 活動Team' } },
            { label: '[103400] 廣宣Team', expanded: false, data: { name: '[103400] 廣宣Team' } },
            { label: '[103500] 企劃Team', expanded: false, data: { name: '[103500] 企劃Team' } }
          ]
        },
        {
          label: '[104000] 財務部',
          expanded: false,
          data: { name: '[104000] 財務部' },
          children: [
            {
              label: '[104100] 會計Team',
              expanded: false,
              data: { name: '[104100] 會計Team' },
              children: [
                { label: '[104110] 總帳/稅務組(停用)', data: { name: '[104110] 總帳/稅務組(停用)' } },
                { label: '[104120] 專櫃/自營組(停用)', data: { name: '[104120] 專櫃/自營組(停用)' } },
                { label: '[104130] 成本結轉/匯整分析組(停用)', data: { name: '[104130] 成本結轉/匯整分析組(停用)' } }
              ]
            },
            {
              label: '[104200] 財務Team',
              expanded: false,
              data: { name: '[104200] 財務Team' },
              children: [
                { label: '[104210] 授信/資金組(停用)', data: { name: '[104210] 授信/資金組(停用)' } },
                { label: '[104220] 有價券/營收組(停用)', data: { name: '[104220] 有價券/營收組(停用)' } },
                { label: '[104230] 出納/銀行組(停用)', data: { name: '[104230] 出納/銀行組(停用)' } }
              ]
            }
          ]
        },
        {
          label: '[105000] 技術服務部',
          expanded: false,
          data: { name: '[105000] 技術服務部' },
          children: [
            { label: '[105100] 物管Team(停用)', data: { name: '[105100] 物管Team(停用)' } },
            { label: '[105200] 總務Team(停用)', data: { name: '[105200] 總務Team(停用)' } },
            { label: '[105300] 資訊整合Team', data: { name: '[105300] 資訊整合Team' } },
            { label: '[105400] 機電Team', data: { name: '[105400] 機電Team' } },
            { label: '[105500] 裝修管理Team', data: { name: '[105500] 裝修管理Team' } }
          ]
        },
        {
          label: '[106000] 總經理室',
          expanded: false,
          data: { name: '[106000] 總經理室' },
          children: [
            { label: '[101600] 個資小組', data: { name: '[101600] 個資小組' } },
            { label: '[106100] 電子商務事業組(停用)', data: { name: '[106100] 電子商務事業組(停用)' } },
            { label: '[106200] 品牌經營事業組(停用)', data: { name: '[106200] 品牌經營事業組(停用)' } },
            { label: '[106300] 公關組', data: { name: '[106300] 公關組' } },
            { label: '[106400] 秘書室(停用)', data: { name: '[106400] 秘書室(停用)' } },
            { label: '[106500] 採購組(停用)', data: { name: '[106500] 採購組(停用)' } }
          ]
        }
      ]
    }];

    // 設置層級
    this.setNodeLevels(nodes, 0); 
    return nodes;
  }

  // 遞歸設置每個節點的層級，並存儲在 nodeLevels 中
  setNodeLevels(nodes: TreeNode<any>[], level: number) {
    nodes.forEach(node => {
      if (node.label) {
        this.nodeLevels.set(node.label, level); // 將層級存儲在 Map 中
      }
      if (node.children) {
        this.setNodeLevels(node.children, level + 1); // 遞歸設置子節點的層級
      }
    });
  }

  // 當選擇節點時觸發
  onNodeSelect(event: { node: TreeNode<any> }) {
    const level = this.nodeLevels.get(event.node.label ?? '') ?? 0; // 確保 level 有值，預設為 0
    if (level === 3) {
      console.log('Cannot select fourth-level node.');
      return; // 阻止選中第四層節點
    }

    // 設置為當前選中的節點
    this.selectedNode = event.node;

    // 反轉 expanded 狀態
    event.node.expanded = !event.node.expanded;

    console.log('Selected node:', event.node.label, 'Level:', level);
  }
}