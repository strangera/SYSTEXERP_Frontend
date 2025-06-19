import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { monthOptions } from '../fin11200/fin11200.model';
import { SystemOptionsService } from '../../../service/system/sys1000.service';
import { SystemOption } from '../../../shared/models/sys/sys1000.model';
import { IAPS2001 } from './fin12010.model';

@Component({
  selector: 'app-fin12010',
  templateUrl: './fin12010.component.html',
})
//1.1.2.1 電子式發票各系統配號維護
export class FIN12010Component extends BasicQueryPageComponent<IAPS2001> implements OnInit {
  queryForm = this.formBuilder.group({
    GUI_YY: [null], // 發票年月
    GUI_MM: [null], // 發票年月
    GUI_Track: ['', [Validators.maxLength(2)]], // 字軌
    GUI_No_start: [null, [Validators.maxLength(8), Validators.max(99999999)]], // 發票號碼(起)
    GUI_No_end: [null, [Validators.maxLength(8), Validators.max(99999999)]], // 發票號碼(迄)
    usageType: [[]], // 使用別
    ...createPaginationConfig([{ field: 'id', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  monthOptions = monthOptions;
  data: IAPS2001[] = [];
  columns: Column[] = [
    { field: 'col1', header: '發票年月', visible: true },
    { field: 'col2', header: '字軌', visible: true },
    { field: 'col3', header: '發票號碼(起)', visible: true },
    { field: 'col4', header: '發票號碼(迄)', visible: true },
    { field: 'col5', header: 'NEXT發票配號號碼', visible: true },
    { field: 'col6', header: '使用別', visible: true },
    { field: 'col7', header: '使用狀態', visible: true },
  ];
  usageTypeOptions: SystemOption[] = SystemOptionsService.getOptions('T205');
  constructor(
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('FIN12010', '/FIN/FIN12010CRU', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
}
