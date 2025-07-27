import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Column } from '@shared/componentkit/table/table.model';
// import { TLS2A010Service } from '@services/api/tls/tls2a010.service';
import { QueryStateService } from '@shared/service/query-state.service';

@Component({
  selector: 'app-tls2a010',
  templateUrl: './tls2a010.component.html',
  styleUrls: ['./tls2a010.component.scss'],

})
export class TLS2A010Component implements OnInit {
  queryForm!: FormGroup;
  data: any[] = [];
  totalRecords = 0;
  loading = false;
  submitted = false;
  ProgNo = 'TLS2A010';

  // 下拉選單資料
  ECRNoOptions: any[] = [];
  statusOptions: any[] = [];
  floorOptions: any[] = [];
  buildingNoOptions: any[] = [];

  columns: Column[] = [
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'TXN_No', header: '交易序號' },
    { field: 'TXN_Date', header: '銷售日期' },
    { field: 'TXN_Amt', header: '金額' },
    { field: 'status', header: '狀況' },
    { field: 'SYS_DisplayCredit', header: '信用卡卡號' },
    { field: 'FLOOR_NO', header: '樓層' },
    { field: 'building_no', header: '館別' },
  ];

  constructor(
    private fb: FormBuilder,
    private dropDownListService: DropDownListService,
    private tls2a010Service: TLS2A010Service,
    private queryStateService: QueryStateService
  ) {}

  ngOnInit(): void {
    this.queryForm = this.fb.group({
      ECR_No: [null],
      TXN_No: [null],
      TXN_DateStart: [null, Validators.required],
      TXN_DateEnd: [null, Validators.required],
      casherFrom: [null],
      casherTo: [null],
      status: [[]],
      SYS_DisplayCredit: [null],
      FLOOR_NO: [null],
      building_no: [null],
    });

    this.loadDropDownData();
  }

  loadDropDownData(): void {
    this.dropDownListService.getOptions('ECR_No').subscribe(res => this.ECRNoOptions = res);
    this.dropDownListService.getOptions('status').subscribe(res => this.statusOptions = res);
    this.dropDownListService.getOptions('FLOOR_NO').subscribe(res => this.floorOptions = res);
    this.dropDownListService.getOptions('building_no').subscribe(res => this.buildingNoOptions = res);
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) return;

    this.loading = true;
    const formValue = form.value;
    const payload = {
      ...formValue,
      TXN_DateStart: this.formatDate(formValue.TXN_DateStart),
      TXN_DateEnd: this.formatDate(formValue.TXN_DateEnd),
    };

    this.tls2a010Service.query(payload).subscribe({
      next: (res) => {
        this.data = res.Data ?? [];
        this.totalRecords = res.TotalCount ?? 0;
        this.loading = false;
        this.queryStateService.setQueryState(this.ProgNo, form.value);
      },
      error: (err) => {
        console.error('查詢失敗', err);
        this.loading = false;
      }
    });
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const offset = date.getTimezoneOffset();
    const localTime = new Date(date.getTime() - offset * 60000);
    return localTime.toISOString().split('T')[0]; // 轉為 YYYY-MM-DD
  }
}
