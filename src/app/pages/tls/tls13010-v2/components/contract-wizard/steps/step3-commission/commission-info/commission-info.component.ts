/**
 * 專櫃契約書資訊子組件
 * 顯示合約基本資訊（唯讀）
 */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { ExpandableEditTableComponent, ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { ContractInfo } from '../../../../../core/models';

@Component({
  selector: 'app-commission-info',
  standalone: true,
  imports: [
    CommonModule,
    AccordionModule,
    ExpandableEditTableComponent
  ],
  templateUrl: './commission-info.component.html'
})
export class CommissionInfoComponent {
  /** 合約資訊資料 */
  @Input() contractInfoData: ContractInfo[] = [];

  /** 合約資訊欄位定義 */
  @Input() contractInfoColumns: ColumnDef[] = [];

  /** 手風琴是否展開 */
  @Input() expanded = true;

  /** 標題文字 */
  @Input() headerText = '專櫃契約書資訊';
}
