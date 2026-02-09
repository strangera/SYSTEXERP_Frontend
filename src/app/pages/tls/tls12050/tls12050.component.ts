import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ImageModule } from 'primeng/image';
import { environment } from 'src/environments/environment';
import { TLS12050Service } from '../../../service/api/tls/tls12050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';


@Component({
  selector: 'app-tls12050',
  templateUrl: './tls12050.component.html',
  styleUrls: ['./tls12050.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    DropdownComponent,
    ReactiveFormsModule,
    AccordionModule,
    TranslateModule,
    NgIf,
    ImageModule
  ],
})
export class TLS12050Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.fb.group({
    building_no: ['A'],
    FLOOR_NO: ['1F'],
  });

  dropdown1 = [
    { label: 'A1', value: 'A' },
    { label: 'A2', value: 'B' }
  ];

  dropdown2 = [
    { label: 'B1', value: 'B1' },
    { label: '1F', value: '1F' },
    { label: '2F', value: '2F' },
    { label: '3F', value: '3F' },
    { label: '4F', value: '4F' },
    { label: '5F', value: '5F' },
    { label: '6F', value: '6F' },
  ];

  blank = environment.ApiUrl + '/images/blank.jpg';
  selectedImage?: string; // 圖片 URL
  selectedFloor = ''; // 選擇的樓層
  selectedbuilding_no = ''; // 選擇的館別
  All_Count = 0; // 選擇的樓層數量

  Idle = '';
  Under_Negotiation = '';
  In_Operation = '';
  Outof_Service = '';

  statsList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private tls12050Service: TLS12050Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS12050', 'tls/tls12050cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
    this.queryForm.get('building_no')?.valueChanges.subscribe(() => {
      this.triggerImageUpdate();
    });

    this.queryForm.get('FLOOR_NO')?.valueChanges.subscribe(() => {
      this.triggerImageUpdate();
    });
    this.triggerImageUpdate();
  }
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.blank; // 請替換成你自己的預設圖路徑
  }
  triggerImageUpdate(): void {
    const category = this.queryForm.get('building_no')?.value;
    const floor = this.queryForm.get('FLOOR_NO')?.value;
    if (category && floor) {
      this.fetchImageAndStats(this.queryForm);
    }
  }
  fetchImageAndStats(frm: FormGroup): void {
    this.tls12050Service.queryTLS12050(frm.getRawValue()).subscribe({
      next: (res) => {
        const stat = res.Data?.[0];
        const imgPath = stat?.Image_Url ? (environment.ApiUrl + '/' + stat.Image_Url) : this.blank;
        this.selectedImage = imgPath;
        this.selectedFloor = frm.get('FLOOR_NO')?.value;
        this.selectedbuilding_no = frm.get('building_no')?.value;
        this.All_Count = stat?.All_Count ?? 0;

        const total = stat?.All_Count ?? 0;
        this.Idle = this.calculatePercent(stat?.Idle ?? 0, total);
        this.Under_Negotiation = this.calculatePercent(stat?.Under_Negotiation ?? 0, total);
        this.In_Operation = this.calculatePercent(stat?.In_Operation ?? 0, total);
        this.Outof_Service = this.calculatePercent(stat?.Outof_Service ?? 0, total);

      },
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
          this.statsList = res.Data ?? [];
          this.loading = false;
        },
      });
    }
  }

  private calculatePercent(value: number, total: number): string {
    if (!total || total === 0) return '0%';
    const percent = (value / total) * 100;
    return percent.toFixed(1) + '%';
  }

  onStatusChange(event: any): void {
    // const current = event.value || [];

    // if (current.includes('all')) {
    //   const allRealOptions = this.dropdown3
    //     .filter(opt => opt.value !== 'all')
    //     .map(opt => opt.value);
    //   this.queryForm.get('statusList')?.setValue(allRealOptions);
    // } else {
    //   this.queryForm.get('statusList')?.setValue(current);
    // }
  }

  loadOptions(): void {
    // 如果 dropdown 要動態載入，可放這裡
  }
  get selectedBuildingLabel(): string {
    return this.dropdown1.find(opt => opt.value === this.selectedbuilding_no)?.label ?? this.selectedbuilding_no;
  }

}

