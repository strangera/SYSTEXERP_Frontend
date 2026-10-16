import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ImageModule } from 'primeng/image';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { QueryTLS12050Request, TLS12050Detail, TLS12050Service, TLS12050Summary } from '../../../service/api/tls/tls12050.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { formatDate, ReportColumn } from '../tls2f010-cru/tls2f010-table-report.model';


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
    ImageModule,
    TableReportComponent
  ],
})
export class TLS12050Component extends BasicQueryPageComponent<TLS12050Detail> implements OnInit {
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
  columns: ReportColumn[] = [
    { field: 'LOCATION_No', header: '位置', visible: true },
    { field: 'LOCATION_Status_Desc', header: '店位狀態文字', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'ven_no', header: '廠商編號', visible: true },
    { field: 'VEN_Name', header: '廠商名稱', visible: true },
    { field: 'tlt_bdate', header: '合約起日', visible: true, format: formatDate },
    { field: 'tlt_edate', header: '合約迄日', visible: true, format: formatDate },
    { field: 'contract_no', header: '合約編號', visible: true },
    { field: 'contract_subno', header: '版次', visible: true },
  ];
  blank = 'assets/images/blank.jpg';
  selectedImage?: string; // 圖片 URL
  selectedFloor = ''; // 選擇的樓層
  selectedbuilding_no = ''; // 選擇的館別
  All_Count = 0; // 選擇的樓層數量
  data: TLS12050Detail[] = [];
  totalRecords = 0;
  Idle = '';
  Under_Negotiation = '';
  In_Operation = '';
  Outof_Service = '';
  lastQuery: QueryTLS12050Request | null = null;
  statsList: TLS12050Summary[] = [];
  // mouse coordinates relative to image (origin: left-bottom)
  mouseX = 0;
  mouseY = 0;
  // marker (標定) coordinates and visibility
  markerLeft = 0;   // css left (px)
  markerTop = 0;    // css top (px)
  markerBottom = 0; // displayed Y with origin at bottom
  markerVisible = false;

  constructor(
    private readonly fb: FormBuilder,
    public readonly tls12050Service: TLS12050Service,
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

  readonly queryTableData = (payload: QueryTLS12050Request) => {
    const request = this.buildQueryPayload(payload);
    return this.tls12050Service.queryTLS12050Details(request);
  };

  private buildQueryPayload(formValue?: Partial<QueryTLS12050Request>): QueryTLS12050Request {
    const currentValue = this.queryForm.getRawValue();

    return {
      building_no: formValue?.building_no ?? currentValue.building_no ?? '',
      FLOOR_NO: formValue?.FLOOR_NO ?? currentValue.FLOOR_NO ?? '',
      PageSize: formValue?.PageSize ?? formValue?.pageSize ?? 999,
      PageIndex: formValue?.PageIndex ?? formValue?.pageIndex ?? 1,
      OrderBy: formValue?.OrderBy ?? '',
      Offset: formValue?.Offset ?? 0,
      SortBy: formValue?.SortBy ?? [{ field: 'tlt_no', order: 1 }]
    };
  }

  private applySummary(summary: TLS12050Summary | undefined, payload: QueryTLS12050Request, details: TLS12050Detail[]): void {
    const imgPath = summary?.Image_Url ? `${environment.ApiUrl}/${summary.Image_Url}` : this.blank;
    const total = summary?.All_Count ?? 0;

    this.selectedImage = imgPath;
    this.selectedFloor = String(payload.FLOOR_NO ?? '');
    this.selectedbuilding_no = String(payload.building_no ?? '');
    this.All_Count = total;
    this.Idle = this.calculatePercent(summary?.Idle ?? 0, total);
    this.Under_Negotiation = this.calculatePercent(summary?.Under_Negotiation ?? 0, total);
    this.In_Operation = this.calculatePercent(summary?.In_Operation ?? 0, total);
    this.Outof_Service = this.calculatePercent(summary?.Outof_Service ?? 0, total);
    this.data = details;
    this.totalRecords = details.length;
    this.lastQuery = payload;
    this.statsList = summary ? [summary] : [];
  }

  fetchImageAndStats(frm: FormGroup): void {
    const payload = this.buildQueryPayload(frm.getRawValue());

    this.loading = true;
    this.tls12050Service.queryTLS12050Details(payload)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          this.applySummary(res.Summary, payload, res.Data ?? []);
          this.queryStateService.setQueryState(this.ProgNo, payload);
        },
      });
  }

  onSubmit(form: FormGroup): void {
    if (form.valid) {
      this.fetchImageAndStats(form);
    }
  }

  private calculatePercent(value: number, total: number): string {
    if (!total || total === 0) return '0%';
    const percent = (value / total) * 100;
    return percent.toFixed(1) + '%';
  }

  loadOptions(): void {
    // 如果 dropdown 要動態載入，可放這裡
  }
  get selectedBuildingLabel(): string {
    return this.dropdown1.find(opt => opt.value === this.selectedbuilding_no)?.label ?? this.selectedbuilding_no;
  }

  // mouse move handler on image container
  onImageMouseMove(event: MouseEvent, container?: HTMLElement): void {
    const el = container ?? (event.currentTarget as HTMLElement);
    if (!el) return;
    const img = el.querySelector('img') as HTMLImageElement | null;
    const rect = img ? img.getBoundingClientRect() : el.getBoundingClientRect();
    const x = event.clientX - rect.left; // distance from left of img
    const yFromTop = event.clientY - rect.top; // distance from top of img
    const yFromBottom = rect.height - yFromTop; // convert to distance from bottom

    // clamp and round
    this.mouseX = Math.max(0, Math.min(Math.round(x), Math.round(rect.width)));
    this.mouseY = Math.max(0, Math.min(Math.round(yFromBottom), Math.round(rect.height)));
  }

  onImageMouseLeave(): void {
    // optional: clear or keep last coordinate. Here we keep last value.
    // To clear, uncomment next two lines:
    // this.mouseX = 0;
    // this.mouseY = 0;
  }

  // click to set marker coordinate
  onImageClick(event: MouseEvent, container?: HTMLElement): void {
    const el = container ?? (event.currentTarget as HTMLElement);
    if (!el) return;
    const img = el.querySelector('img') as HTMLImageElement | null;
    const rect = img ? img.getBoundingClientRect() : el.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const yFromTop = Math.round(event.clientY - rect.top);
    const yFromBottom = Math.round(rect.height - yFromTop);

    // store both css top/left for positioning and bottom-based Y for display
    this.markerLeft = Math.max(0, Math.min(x, Math.round(rect.width)));
    this.markerTop = Math.max(0, Math.min(yFromTop, Math.round(rect.height)));
    this.markerBottom = Math.max(0, Math.min(yFromBottom, Math.round(rect.height)));
    this.markerVisible = true;
  }

  onImageKeyboardSelect(container: HTMLElement): void {
    const img = container.querySelector('img') as HTMLImageElement | null;
    const rect = img ? img.getBoundingClientRect() : container.getBoundingClientRect();
    const x = Math.round(rect.width / 2);
    const yFromTop = Math.round(rect.height / 2);
    const yFromBottom = Math.round(rect.height - yFromTop);

    this.markerLeft = x;
    this.markerTop = yFromTop;
    this.markerBottom = yFromBottom;
    this.markerVisible = true;
  }

}

