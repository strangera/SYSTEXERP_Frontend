import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataViewModule } from 'primeng/dataview';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { NgFor } from '@angular/common';

interface InventoryStatus {
  label: string;
  value: string;
}
export interface Product {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  inventoryStatus?: InventoryStatus;
  category?: string;
  image?: string;
  rating?: number;
}

@Component({
  selector: 'app-tls44010',
  templateUrl: './tls44010.component.html',
  styleUrl: './tls44010.component.scss',
  standalone: true,
  imports: [DataViewModule, PrimeTemplate, Button, InputGroupAddonModule, InputTextModule, DropdownModule, TableModule, NgFor]
})

export class TLS44010Component {

  products: Product[] = [];

  sortOrder: number = 0;

  sortField: string = '';

  sourceCities: any[] = [];

  targetCities: any[] = [];

  orderCities: any[] = [];

  selectedImage: string = 'Screen.png';

  dropdown3 = [
    { label: '第1頁', value: '1' },

  ];

  ngOnInit() {

    this.products = [
      { name: '全部', code: '108', image: 'logo.webp' },
      { name: '樓層B1', code: '1', image: 'logo.webp' },
      { name: '樓層B2', code: '5', image: 'logo.webp' },
      { name: '樓層B3', code: '10', image: 'logo.webp' },
      { name: '樓層B4', code: '8', image: 'logo.webp' },
      { name: '樓層F1', code: '11', image: 'logo.webp' },
      { name: '樓層F2', code: '0', image: 'logo.webp' },
      { name: '樓層F3', code: '1', image: 'logo.webp' },
      { name: '樓層F4', code: '5', image: 'logo.webp' },
      { name: '樓層F5', code: '10', image: 'logo.webp' },
      { name: '樓層F6', code: '8', image: 'logo.webp' },
      { name: '樓層F7', code: '11', image: 'logo.webp' },
      { name: '樓層F8', code: '0', image: 'logo.webp' },
      { name: '樓層F9', code: '1', image: 'logo.webp' },
      { name: '樓層F10', code: '5', image: 'logo.webp' },
      { name: '樓層F11', code: '10', image: 'logo.webp' },
      { name: '樓層F12', code: '8', image: 'logo.webp' },
      { name: '樓層F13', code: '11', image: 'logo.webp' },
    ];

  }

  constructor(
    private router: Router
  ) {
  }

  goToNextPage() {
    this.router.navigate(['/TLS4000/TLS44010CRU']);
  }

  onRowSelect(event: any) {
    const selectedItem = event.name;
    // 導航到下一頁並將選中的資料作為參數傳遞
    this.router.navigate(['/TLS4000/TLS44010CRU'], { state: { selectedItem } });
  }

  displayDialog: boolean = false;  // 控制 dialog 顯示的變數

  showDialog() {
    this.displayDialog = true;  // 設定變數為 true，顯示 dialog
  }

  closeDialog() {
    this.displayDialog = false;  // 設定變數為 false，關閉 dialog
  }
}
