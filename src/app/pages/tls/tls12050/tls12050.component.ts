import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup,  ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

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
  ],
})
export class TLS12050Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm: FormGroup = this.fb.group({
    category: this.fb.control<string | null>(null),
    floor: this.fb.control<string | null>(null),
    statusList: this.fb.control<string[] | null>([])
  });

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
    { label: 'F6', value: 'floor-f6.jpg', CNT: '93' },
  ];

  dropdown3 = [

    { label: '閒置（未使用）', value: 'idle' },
    { label: '洽談中（要約書）', value: 'negotiating' },
    { label: '營運中（合約）', value: 'operating' },
    { label: '停用', value: 'disabled' }
  ];

  selectedImage = 'floor-b1.jpg';
  selectedFloor = 'B1';
  selectedFloorCNT = '151';
  statusSelection: string[] = [];

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS12050', 'tls/tls12050');
    this.loadOptions();
  }

 onSubmit(form: FormGroup): void {
  if (form.valid) {
    console.log('送出查詢條件：', form.value);

    const selectedFloorValue = form.value.floor;

    if (selectedFloorValue) {
      this.onImageSelect({ value: selectedFloorValue });
    }


  }
}

  onImageSelect(event: any): void {
    const selectedValue = event.value;
    this.selectedImage = selectedValue;
    const selected = this.dropdown2.find(img => img.value === selectedValue);
    this.selectedFloor = selected?.label || '';
    this.selectedFloorCNT = selected?.CNT || '';
  }

onStatusChange(event: any): void {
  const current = event.value || [];

  // 如果包含 "all"，則勾選其他所有非 "all" 的選項
  if (current.includes('all')) {
    const allRealOptions = this.dropdown3
      .filter(opt => opt.value !== 'all')
      .map(opt => opt.value);

    this.queryForm.get('statusList')?.setValue(allRealOptions);


  } else {
    // 正常行為就直接用 event.value
    this.queryForm.get('statusList')?.setValue(current);
  }
}



  loadOptions(): void {
    // 從後端取得 dropdown options
  }
}
