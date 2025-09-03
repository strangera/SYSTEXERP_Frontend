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

@Component({
  selector: 'app-tls44020',
  templateUrl: './tls44020.component.html',
  styleUrls: ['./tls44020.component.scss'],
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
export class TLS44020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm: FormGroup = this.fb.group({});
  items: MenuItem[] = [];
  activeItem: MenuItem | undefined;

  data: any[] = [
    { ECR_LocNo: 'B1A01', TLT_No: '000001', TLT_Name: '米卡莎·阿卡曼', EOS_Status: '關機' },
    { ECR_LocNo: 'B1A02', TLT_No: '000002', TLT_Name: '阿爾敏·亞魯雷特', EOS_Status: '離線' },
    { ECR_LocNo: 'B1A03', TLT_No: '000003', TLT_Name: '萊納·布朗', EOS_Status: '交易中' },
    { ECR_LocNo: 'B1A04', TLT_No: '000004', TLT_Name: '亞妮', EOS_Status: '離線' },
    { ECR_LocNo: 'B1A05', TLT_No: '000005', TLT_Name: '艾連葉卡', EOS_Status: '關機' },
    { ECR_LocNo: 'B1A06', TLT_No: '000006', TLT_Name: '咪吉葉卡', EOS_Status: '登出' },
    { ECR_LocNo: 'B1A07', TLT_No: '000007', TLT_Name: '炭治郎', EOS_Status: '交易中' },
    { ECR_LocNo: 'B1A11', TLT_No: '000008', TLT_Name: '亞妮', EOS_Status: '登出' },
    { ECR_LocNo: 'B1A12', TLT_No: '000009', TLT_Name: '米卡莎·阿卡曼', EOS_Status: '交易中' },
    { ECR_LocNo: 'B1A13', TLT_No: '000010', TLT_Name: '阿爾敏·亞魯雷特', EOS_Status: '離線' },
    { ECR_LocNo: 'B1A14', TLT_No: '000002', TLT_Name: '亞妮', EOS_Status: '離線' },
    { ECR_LocNo: 'B1A15', TLT_No: '000003', TLT_Name: '萊納·布朗', EOS_Status: '關機' },
    { ECR_LocNo: 'B1A16', TLT_No: '000004', TLT_Name: '阿爾敏·亞魯雷特', EOS_Status: '離線' },
    { ECR_LocNo: 'B1A17', TLT_No: '000004', TLT_Name: '米卡莎·阿卡曼', EOS_Status: '離線', },
    { ECR_LocNo: 'B1A18', TLT_No: '000002', TLT_Name: '亞妮', EOS_Status: '離線', },
    { ECR_LocNo: 'B1A19', TLT_No: '000003', TLT_Name: '萊納·布朗', EOS_Status: '交易中', },
    { ECR_LocNo: 'B1A20', TLT_No: '000005', TLT_Name: '艾連葉卡', EOS_Status: '關機', },
    { ECR_LocNo: 'B1A21', TLT_No: '000006', TLT_Name: '咪吉葉卡', EOS_Status: '離線', },
    { ECR_LocNo: 'B1A22', TLT_No: '000007', TLT_Name: '炭治郎', EOS_Status: '交易中', },
    { ECR_LocNo: 'B1A19', TLT_No: '000003', TLT_Name: '萊納·布朗', EOS_Status: '交易中', },
    { ECR_LocNo: 'B1A06', TLT_No: '000006', TLT_Name: '咪吉葉卡', EOS_Status: '登出' },
    { ECR_LocNo: 'B1A07', TLT_No: '000007', TLT_Name: '炭治郎', EOS_Status: '交易中' },
    { ECR_LocNo: 'B1A11', TLT_No: '000008', TLT_Name: '亞妮', EOS_Status: '登出' },
    { ECR_LocNo: 'B1A12', TLT_No: '000009', TLT_Name: '米卡莎·阿卡曼', EOS_Status: '交易中' },
    { ECR_LocNo: 'B1A13', TLT_No: '000010', TLT_Name: '阿爾敏·亞魯雷特', EOS_Status: '離線' },
    { ECR_LocNo: 'B1A14', TLT_No: '000002', TLT_Name: '亞妮', EOS_Status: '關機' },
    { ECR_LocNo: 'B1A15', TLT_No: '000003', TLT_Name: '萊納·布朗', EOS_Status: '交易中' },
    { ECR_LocNo: 'B1A16', TLT_No: '000004', TLT_Name: '阿爾敏·亞魯雷特', EOS_Status: '離線' },
    { ECR_LocNo: 'B1A17', TLT_No: '000004', TLT_Name: '米卡莎·阿卡曼', EOS_Status: '關機', },
    { ECR_LocNo: 'B1A18', TLT_No: '000002', TLT_Name: '亞妮', EOS_Status: '交易中', },
    { ECR_LocNo: 'B1A19', TLT_No: '000003', TLT_Name: '萊納·布朗', EOS_Status: '交易中', },
    { ECR_LocNo: 'B1A20', TLT_No: '000005', TLT_Name: '艾連葉卡', EOS_Status: '關機', },
  ];

  globalFilter = '';
  filteredData: any[] = [];

  // DataView layout 切換用
  layout: 'list' | 'grid' = 'grid';

  // 分頁用
  rows = 15;   // 每頁筆數
  first = 0;   // 起始 index
  pagedData: any[] = []; // 當前頁顯示的資料

  constructor(private fb: FormBuilder) {
    super();
  }

getStatusIcon(status: string): string {
  switch (status) {
    case '關機': return 'pi pi-desktop';
    case '離線': return 'pi pi-sign-out';
    case '交易中': return 'pi pi-sync';
    default: return 'pi pi-question-circle';
  }
}

getStatusColor(status: string): string {
  switch (status) {
    case '關機': return '#6c757d';
    case '離線': return '#dc3545';
    case '交易中': return '#28a745';
    default: return '#6c757d';
  }
}


  ngOnInit() {
    this.initializePage('TLS44020', '/TLS/TLS44020cru', this.queryForm, (form) => this.onSubmit(form));
    this.items = [
      { label: '全部' },
      { label: '連線機台' },
      { label: '離線機台' }
    ];
    this.activeItem = this.items[0];
    this.filteredData = this.data;
    this.updatePagedData();
  }

  onSubmit(form: FormGroup) {
    console.log('查詢條件', form.value);
  }

  onTabChange(item: MenuItem) {
    this.activeItem = item;

    if (item.label?.includes('全部')) {
      this.filteredData = [...this.data];
    } else if (item.label?.includes('連線')) {
      this.filteredData = this.data.filter(d => d.EOS_Status === '開機' || d.EOS_Status === '交易中');
    } else if (item.label?.includes('離線')) {
      this.filteredData = this.data.filter(d => d.EOS_Status === '離線' || d.EOS_Status === '登出');
    }

    this.first = 0;
    this.updatePagedData();
  }

  /** 搜尋框篩選 */
  applyFilter() {
    const keyword = this.globalFilter?.toLowerCase().trim();
    if (!keyword) {
      this.filteredData = [...this.data];
    } else {
      this.filteredData = this.data.filter(row =>
        (row.ECR_LocNo?.toLowerCase().includes(keyword)) ||
        (row.TLT_No?.toLowerCase().includes(keyword)) ||
        (row.TLT_Name?.toLowerCase().includes(keyword)) ||
        (row.EOS_Status?.toLowerCase().includes(keyword)) ||
        (row.Store?.toLowerCase().includes(keyword)) ||
        (row.Floor?.toLowerCase().includes(keyword)) ||
        (row.Area?.toLowerCase().includes(keyword)) ||
        (row.ECR_IP?.toLowerCase().includes(keyword))
      );
    }
    this.first = 0; // 搜尋後回到第一頁
    this.updatePagedData();
  }

  // DataView layout 切換
  onLayoutChange(event: any) {
    this.layout = event as 'list' | 'grid';
  }

  // 分頁事件
  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePagedData();
  }

  // 更新顯示用的分頁資料
  updatePagedData() {
    this.pagedData = this.filteredData.slice(this.first, this.first + this.rows);
  }
}
