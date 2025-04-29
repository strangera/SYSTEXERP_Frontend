import { Component, Input, OnInit } from '@angular/core';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { FormControl } from '@angular/forms';
import { TreeNode } from 'primeng/api';

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
  nodes: TreeNode[] = [
    {
      key: '0',
      label: 'Introduction',
      children: [
        { key: '0-0', label: 'What is Angular', data: 'https://angular.io', type: 'url' },
        { key: '0-1', label: 'Getting Started', data: 'https://angular.io/guide/setup-local', type: 'url' },
        { key: '0-2', label: 'Learn and Explore', data: 'https://angular.io/guide/architecture', type: 'url' },
        { key: '0-3', label: 'Take a Look', data: 'https://angular.io/start', type: 'url' }
      ]
    },
    {
      key: '1',
      label: 'Components In-Depth',
      children: [
        { key: '1-0', label: 'Component Registration', data: 'https://angular.io/guide/component-interaction', type: 'url' },
        { key: '1-1', label: 'User Input', data: 'https://angular.io/guide/user-input', type: 'url' },
        { key: '1-2', label: 'Hooks', data: 'https://angular.io/guide/lifecycle-hooks', type: 'url' },
        { key: '1-3', label: 'Attribute Directives', data: 'https://angular.io/guide/attribute-directives', type: 'url' }
      ]
    }
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
