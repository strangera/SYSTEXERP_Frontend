import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { SortMeta } from 'primeng/api';


interface ItemCol {
  col1: string; // 品項編號
  col2: string; // 品項名稱
  col3: number; // 使用別
}

@Component({
  selector: 'app-fin11030',
  templateUrl: './fin11030.component.html',
  styleUrl: './fin11030.component.scss'
})
//1.1.1.3 銷項品項資料設定
export class FIN11030Component extends BasicQueryPageComponent<ItemCol> implements OnInit {
  queryForm = this.formBuilder.group({
    itemSerialnumber: ['', [Validators.maxLength(3), Validators.required]], // 品項編號
    itemName: ['', [Validators.maxLength(10)]], // 品項名稱
    //分頁查詢
    pageSize: [10],
    pageIndex: [0],
    SortBy: [[{ field: 'itemSerialnumber', order: 1 }] as SortMeta[]],
  });
  // 表格
  data: ItemCol[] = [];
  columns: Column[] = [
    { field: 'col1', header: '品項編號', visible: true },
    { field: 'col2', header: '品項名稱', visible: true },
    { field: 'col3', header: '使用別', visible: true },
  ];
  constructor() {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN11030', '/FIN/FIN11030CRU'); // 初始化頁面
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log(frm.value);

      this.data = [
        { col1: '123', col2: 'itemName1', col3: 1 },
        { col1: '124', col2: 'itemName1', col3: 2 },
        { col1: '124', col2: 'itemName2', col3: 3 }
      ];
      console.log(this.data);

      this.loading = false;
    });
  }
}
