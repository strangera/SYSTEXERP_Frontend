import { Component, Input, OnInit } from '@angular/core';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { FormControl } from '@angular/forms';
import { TreeNode } from 'primeng/api';

interface CustomTreeNode extends TreeNode {
  cols?: { field: string, header: string }[];
  children?: CustomTreeNode[];
}

@Component({
  selector: 'app-tree-dialog',
  templateUrl: './tree-dialog.component.html',
  styleUrl: './tree-dialog.component.scss'
})
export class TreeDialogComponent extends BasicKitComponent implements OnInit {
  @Input() label = '';
  @Input() controlName = '';
  @Input() control = new FormControl;
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() visible = true;
  @Input() disabled: boolean | undefined;
  // header
  cities = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
  ];
  selectedCity: any | undefined;
  justifyOptions: any[] = [
    { label: '第一層' },
    { label: '第二層' },
    { label: '第三層' },
  ];
  // tree
  nodes: CustomTreeNode[] = [
    {
      key: '1',
      label: 'Components In-Depth',
      children: [
        { key: '1-2', label: 'Hooks' },
        {
          key: '1-3', label: 'Attribute Directives',
          children: [
            {
              key: '1-3-0', label: 'Data 1',
              cols: [
                { field: 'code', header: 'Code' },
                { field: 'name', header: 'Name' },
                { field: 'category', header: 'Category' },
                { field: 'quantity', header: 'Quantity' }
              ],
              data: [
                { id: '1001', code: 'f230fh0g3', name: 'Bamboo Watch', category: 'Accessories' },
                { id: '1002', code: 'f230fh0g3', name: 'Bamboo Watch', category: 'Accessories' },
                { id: '1003', code: 'f230fh0g3', name: 'Bamboo Watch', category: 'Accessories' },
              ]
            },
          ]
        }
      ]
    },
  ];

  ngOnInit(): void {
    if (this.disabled) {
      this.control.disable({ emitEvent: false });
    }
    this.updateControlState(this.control);
    this.selectedCity = this.cities[0];
  }

  onInputMouseUp() {
    this.visible = true;
  }
}
