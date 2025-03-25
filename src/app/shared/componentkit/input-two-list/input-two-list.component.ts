import { Component, Input, OnInit } from '@angular/core';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { FormControl } from '@angular/forms';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-input-two-list',
  templateUrl: './input-two-list.component.html',
  styleUrls: ['./input-two-list.component.scss']
})
export class InputTwoListComponent extends BasicKitComponent implements OnInit {
  @Input() parentLabel: string = '';
  @Input() subLabel: string = '';
  @Input() controlName: string = '';
  @Input() control: FormControl = new FormControl;
  @Input() submitted: boolean = false;

  visible: boolean = false;
  selectedValueID: number = 0;
  selectedValueMajor: string = '';
  selectedValueMinor: string = '';
  selectedItem: any = null;

  visible2: boolean = false;
  selectedSubValueID: number = 0;
  selectedSubValueMajor: string = '';
  selectedSubValueMinor: string = '';
  selectedSubItem: any = null;

  mainlistdata = [
    { id: 1, name: '專櫃營運管理', code: 'SYS2000' },
    { id: 2, name: '資材管理系統', code: 'SYSA000' },
    { id: 3, name: 'test1', code: 'test1' },
    { id: 4, name: 'test2', code: 'test2' },
    { id: 5, name: 'test3', code: 'test3' },
    { id: 6, name: 'test4', code: 'test4' },
    { id: 7, name: 'test5', code: 'test5' },
    { id: 8, name: 'test6', code: 'test6' },
    { id: 9, name: 'test7', code: 'test7' },
    { id: 10, name: 'test8', code: 'test8' },
    { id: 11, name: 'test9', code: 'test9' },
    { id: 12, name: 'test10', code: 'test10' },
    { id: 13, name: 'test11', code: 'test11' },
    { id: 14, name: 'test12', code: 'test12' },
    { id: 15, name: 'test13', code: 'test13' },
    { id: 16, name: 'test14', code: 'test14' },
    { id: 17, name: 'test15', code: 'test15' },
    { id: 18, name: 'test16', code: 'test16' },
    { id: 19, name: 'test17', code: 'test17' },
    { id: 20, name: 'test18', code: 'test18' },
    { id: 21, name: 'test19', code: 'test19' },
    { id: 22, name: 'test20', code: 'test20' },
    { id: 23, name: 'test21', code: 'test21' },
    { id: 24, name: 'test22', code: 'test22' },
    { id: 25, name: 'test23', code: 'test23' },
    { id: 26, name: 'test24', code: 'test24' },
    { id: 27, name: 'test25', code: 'test25' },
    { id: 28, name: 'test26', code: 'test26' },
    { id: 29, name: 'test27', code: 'test27' },
    { id: 30, name: 'test28', code: 'test28' },
  ];

  sublistdata = [
    {
      type: '專櫃營運管理',
      code: 'SYS2000',
      systems: [
        { name: '專櫃營運1', code: 'a1' },
        { name: '專櫃營運2', code: 'a2' }
      ]
    },
    {
      type: '資材管理系統',
      code: 'SYSA000',
      systems: [
        { name: '資材管理1', code: 'b1' },
        { name: '資材管理2', code: 'b2' }
      ]
    },
  ];

  filteredParent: any[] = []; // 輸入父查詢結果

  ngOnInit(): void {
    this.checkRequiredValidator(this.control);
    this.setPlaceholder('輸入文字', this.control);
    this.checkIntLengthValidator(this.control);
  }

  showDialog() {
    this.visible = true;
    this.filteredParent = [...this.mainlistdata]; // 初始過濾
  }

  showSubDialog() {
    const selectedSublist = this.sublistdata.find(item => item.code === this.selectedItem.code);
    this.filteredParent = selectedSublist ? selectedSublist.systems : []; // 過濾子系統
    this.visible2 = true;
  }

  onRowSelect(event: any) {
    this.selectedItem = event.data;
    this.selectedValueID = this.selectedItem.id;
    this.selectedValueMajor = this.selectedItem.code;
    this.selectedValueMinor = this.selectedItem.name;
    this.visible = false;

    this.selectedSubValueID = 0;
    this.selectedSubValueMajor = '';
    this.selectedSubValueMinor = '';
  }

  clearSubInputs(clearAll: boolean = false) {
    if (clearAll) {
      this.selectedValueID = 0;
      this.selectedValueMajor = '';
      this.selectedValueMinor = '';
      this.selectedItem = null;

      this.selectedSubValueID = 0;
      this.selectedSubValueMajor = '';
      this.selectedSubValueMinor = '';
      this.selectedSubItem = null;
      this.filteredParent = [];

    } else {
      this.selectedSubValueID = 0;
      this.selectedSubValueMajor = '';
      this.selectedSubValueMinor = '';
      this.selectedSubItem = null;
    }
  }

  onRowSelectSub(event: any) {
    this.selectedSubItem = event.data;
    this.selectedSubValueID = this.selectedSubItem.code;
    this.selectedSubValueMajor = this.selectedSubItem.code;
    this.selectedSubValueMinor = this.selectedSubItem.name;
    this.visible2 = false;
  }
  
  onGlobalFilter(table: Table, event: Event) {
    const searchValue = (event.target as HTMLInputElement).value;
    this.filteredParent = this.mainlistdata.filter(item => 
      item.code.includes(searchValue) || item.name.includes(searchValue)
    );
  }

  onGlobalFilterSub(table: Table, event: Event) {
    const searchValue = (event.target as HTMLInputElement).value;
    this.filteredParent = this.filteredParent.filter(item => 
      item.code.includes(searchValue) || item.name.includes(searchValue)
    );
  }
}
