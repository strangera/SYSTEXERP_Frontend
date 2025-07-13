import { Component } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';

@Component({
    selector: 'app-tls12050',
    templateUrl: './tls12050.component.html',
    styleUrl: './tls12050.component.scss',
    standalone: true,
    imports: [DropdownModule]
})
export class TLS12050Component {
  dropdown1 = [
    { label: 'A1', value: 'A1' },
    { label: 'A2', value: 'A2' }
  ];

  dropdown2 = [
    { label: 'B1', value: 'floor-b1.jpg', CNT: '151' },
    { label: 'F1', value: 'floor-f1.jpg', CNT: '189' },
    { label: 'F2', value: 'floor-f2.jpg', CNT: '142' },
    { label: 'F3', value: 'floor-f3.jpg', CNT: '86' },
    { label: 'F4', value: 'floor-f4.jpg', CNT: '72' },
    { label: 'F5', value: 'floor-f5.jpg', CNT: '101' },
    { label: 'F6', value: 'floor-f5.jpg', CNT: '93' },
  ];

  dropdown3 = [
    { label: '全部', value: 'all' },

  ];

  selectedImage: string = 'floor-b1.jpg';
  selectedFloor: string = 'B1';
  selectedFloorCNT: string = '151';

  onImageSelect(event: any) {
    this.selectedImage = event.value;
    this.selectedFloor = this.dropdown2.find(img => img.value === event.value)?.label || '';
    this.selectedFloorCNT = this.dropdown2.find(img => img.value === event.value)?.CNT || '';
  }

}
