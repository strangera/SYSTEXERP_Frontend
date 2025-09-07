import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TabMenuModule } from 'primeng/tabmenu';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { MenuItem } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { DataViewModule } from 'primeng/dataview';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { PaginatorModule } from 'primeng/paginator';
import { TLS44010Service } from '../../../service/api/tls/tls44010.service';

@Component({
  selector: 'app-tls44010',
  templateUrl: './tls44010.component.html',
  styleUrls: ['./tls44010.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TabMenuModule,
    TranslateModule,
    ButtonModule,
    TableModule,
    AccordionModule,
    CommonModule,
    MenubarComponent,
    InputTextModule,
    DataViewModule,
    PaginatorModule
  ]
})
export class TLS44010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm: FormGroup = this.fb.group({});
  items: MenuItem[] = [];
  activeItem: MenuItem | undefined;

  data: any[] = [];
  filteredData: any[] = [];
  pagedData: any[] = [];

  globalFilter = '';
  layout: 'list' | 'grid' = 'grid';

  rows = 15;
  first = 0;
  // loading = false;

  constructor(
    private fb: FormBuilder,
    private tls44010Service: TLS44010Service
  ) {
    super();
  }

  ngOnInit() {
    this.initializePage('TLS44010', '/TLS/TLS44010cru', this.queryForm, (form) => this.onSubmit(form));

    this.items = [
      { label: '全部' },
      { label: '連線機台' },
      { label: '離線機台' }
    ];
    this.activeItem = this.items[0];

    this.onSubmit(this.queryForm);
  }

  onSubmit(form: FormGroup) {
    this.loading = true;
    this.tls44010Service.queryTLS44010(form.value).subscribe({
      next: (res) => {
        this.data = res?.Data || [];
        this.filteredData = [...this.data];
        this.first = 0;
        this.updatePagedData();
      },
      error: (err) => {
        console.error('查詢失敗', err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onTabChange(item: MenuItem) {
    this.activeItem = item;
    if (item.label?.includes('全部')) {
      this.filteredData = [...this.data];
    } else if (item.label?.includes('連線')) {
      this.filteredData = this.data.filter(d => d.EOS_Online === '1'); // 線上
    } else if (item.label?.includes('離線')) {
      this.filteredData = this.data.filter(d => d.EOS_Online === '0'); // 離線
    }
    this.first = 0;
    this.updatePagedData();
  }

  applyFilter() {
    const keyword = this.globalFilter?.toLowerCase().trim();
    if (!keyword) {
      this.filteredData = [...this.data];
    } else {
      this.filteredData = this.data.filter(row =>
        (row.ECR_LocNo?.toLowerCase().includes(keyword)) ||
        (row.ECR_No?.toLowerCase().includes(keyword)) ||
        (row.TLT_No?.toLowerCase().includes(keyword)) ||
        (row.TLT_Name?.toLowerCase().includes(keyword)) ||
        (row.ECR_Status?.toLowerCase().includes(keyword)) ||
        (row.EOS_Online?.toLowerCase().includes(keyword))
      );
    }
    this.first = 0;
    this.updatePagedData();
  }

  onLayoutChange(event: any) {
    this.layout = event as 'list' | 'grid';
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePagedData();
  }

  updatePagedData() {
    this.pagedData = this.filteredData.slice(this.first, this.first + this.rows);
  }

  // 根據 ECR_Status (0~5) 顯示 icon
  getStatusIcon(status: string | null): string {
    switch (status) {
      case '0': return 'pi pi-pause';        // 暫停交易
      case '1': return 'pi pi-sign-out';     // 登出
      case '2': return 'pi pi-wallet';       // 完成清帳
      case '3': return 'pi pi-sync';         // 交易中
      case '4': return 'pi pi-users';        // 完成交班
      case '5': return 'pi pi-power-off';    // 關機
      default:  return 'pi pi-question-circle';
    }
  }

  // 根據 ECR_Status (0~5) 顯示顏色
  getStatusColor(status: string | null): string {
    switch (status) {
      case '0': return '#fd7e14'; // 暫停交易 = 橘
      case '1': return '#dc3545'; // 登出 = 紅
      case '2': return '#6f42c1'; // 完成清帳 = 紫
      case '3': return '#28a745'; // 交易中 = 綠
      case '4': return '#0d6efd'; // 完成交班 = 藍
      case '5': return '#6c757d'; // 關機 = 灰
      default:  return '#6c757d';
    }
  }
}
