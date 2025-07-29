import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TLS12050Service } from '../../../service/api/tls/tls12050.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-tls12050',
  templateUrl: './tls12050.component.html',
  styleUrls: ['./tls12050.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    DropdownComponent,
    ReactiveFormsModule,
    AccordionModule,
    TranslateModule,
    MultiSelectComponent,
    NgIf
  ],
})
export class TLS12050Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm: FormGroup = this.fb.group({
    category: [],
    floor: [],
    statusList: []
  });

  dropdown1 = [
    { label: 'A1', value: 'A1' },
    { label: 'A2', value: 'A2' }
  ];

  dropdown2 = [
    { label: 'B1', value: 'B1', CNT: 10 },
    { label: 'F1', value: 'F1', CNT: 20 },
    { label: 'F2', value: 'F2', CNT: 15 },
    { label: 'F3', value: 'F3', CNT: 25 },
    { label: 'F4', value: 'F4', CNT: 30 },
    { label: 'F5', value: 'F5', CNT: 18 },
    { label: 'F6', value: 'F6', CNT: 22 },
  ];

  dropdown3 = [
    { label: '閒置（未使用）', value: 'idle' },
    { label: '洽談中（要約書）', value: 'negotiating' },
    { label: '營運中（合約）', value: 'operating' },
    { label: '停用', value: 'disabled' }
  ];

  // 動態綁定欄位
  selectedImage!: string;
  selectedFloor = '';
  selectedFloorCNT = 0;

  idlePercent = 0;
  negotiationPercent = 0;
  operationPercent = 0;
  outofServicePercent = 0;

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private validationService: ValidationService,
    private tls12050Service: TLS12050Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS12050', 'tls/tls12050', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
    this.queryForm.get('floor')?.valueChanges.subscribe((floorCode: string) => {
      this.selectedFloor = this.dropdown2.find(f => f.value === floorCode)?.label ?? floorCode;
    });
    this.queryForm.get('floor')?.valueChanges.subscribe((floorCode: string) => {
      if (!floorCode) {
        return;
      }
      const selected = this.dropdown2.find(f => f.value === floorCode);
      this.selectedFloor = selected?.label ?? '';
      this.selectedImage = 'floor-' + floorCode.toLowerCase() + '.jpg';
      this.selectedFloorCNT = selected?.CNT ?? 0;
    });


  }

  onSubmit(form: FormGroup): void {
    if (form.valid) {
      const value = form.value;

      const payload = {
        PageSize: 999,
        PageIndex: 1,
        OrderBy: '',
        Offset: 0,
        SortBy: [{ field: 'tlt_no', order: 1 }],
        select_library: value.category,
        select_Floor: value.floor
      };

      this.loading = true;

      this.tls12050Service.queryTLS12050(payload).subscribe({
        next: (res: any) => {
          const stat = res.Data?.[0];

          const total = stat?.All_Count ?? 0;

          // 圖片檔名（只傳檔名，不含路徑）
          this.selectedImage = stat?.FloorImage ?? '';

          // 樓層文字（從 dropdown2 的 label 找）
          const floorItem = this.dropdown2.find(f => f.value === value.floor);
          this.selectedFloor = floorItem?.label ?? value.floor ?? '';
          this.selectedFloorCNT = total;

          // 狀態百分比
          this.idlePercent = total ? +(stat.Idle * 100 / total).toFixed(2) : 0;
          this.operationPercent = total ? +(stat.In_Operation * 100 / total).toFixed(2) : 0;
          this.negotiationPercent = total ? +(stat.Under_Negotiation * 100 / total).toFixed(2) : 0;
          this.outofServicePercent = total ? +(stat.Outof_Service * 100 / total).toFixed(2) : 0;

          this.loading = false;
        },
        error: (err: any) => {
          console.error('查詢 TLS12050 發生錯誤', err);
          this.loading = false;
        }
      });
    }
  }
  onImageSelect(event: any): void {
    console.log('Image selected:', event);

  }
  onStatusChange(event: any): void {
    const current = event.value || [];

    if (current.includes('all')) {
      const allRealOptions = this.dropdown3
        .filter(opt => opt.value !== 'all')
        .map(opt => opt.value);
      this.queryForm.get('statusList')?.setValue(allRealOptions);
    } else {
      this.queryForm.get('statusList')?.setValue(current);
    }
  }

  loadOptions(): void {
    // 如果 dropdown 要動態載入，可放這裡
  }
}

