import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { TLS41010Service, TLS41010Data } from '../../../service/api/tls/tls41010.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { columns, guiTypeOptions, salTypeOptions, sernoTypeOptions, statusOptions, typeOptions } from './tls41010.model';
import { finalize } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { TLS46020Service } from '../../../service/api/tls/tls46020.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';



@Component({
  selector: 'app-tls41010',
  templateUrl: './tls41010.component.html',
})
export class TLS41010Component extends BasicQueryPageComponent<TLS41010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    ECR_No: ['', [Validators.maxLength(10)]],      // 收銀機號
    ECR_Name: ['', [Validators.maxLength(20)]],
    ECR_TLT_No: ['', [Validators.maxLength(20)]],
    ECR_TLT_Name: ['', [Validators.maxLength(60)]],
    ECR_ActiveDateStart: [null],
    ECR_ActiveDateEnd: [null],
    ECR_CloseDateStart: [null],
    ECR_CloseDateEnd: [null],
    ECR_Status: ['A'],
    ECR_SubGroup: ['', [Validators.maxLength(20)]],
    ECR_LocNo: ['', [Validators.maxLength(10)]],
    ECR_Type: ['', [Validators.maxLength(2)]],
    ECR_SAL_Type: ['', [Validators.maxLength(8)]],
    ECR_GUI_Type: ['07', [Validators.maxLength(2)]],
    ECR_USR_No: ['', [Validators.maxLength(8)]],
    ECR_USR_Name: ['', [Validators.maxLength(20)]],
    ECR_ComName: ['', [Validators.maxLength(64)]],
    ECR_IP: ['', [Validators.maxLength(20)]],
    ECR_SrvIP: ['', [Validators.maxLength(20)]],
    ECR_TmplNo: ['', [Validators.maxLength(8)]],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });
  statusOptions = statusOptions;
  typeOptions = typeOptions;
  guiTypeOptions = guiTypeOptions;
  salTypeOptions = salTypeOptions;
  sernoTypeOptions = sernoTypeOptions;

  data: TLS41010Data[] = [];
  selectedItems: TLS41010Data[] = [];
  totalRecords = 0;
  columns = columns;
  floorOptions: any[] = [];

  constructor(
    private tls41010Service: TLS41010Service,
    private locationOptionsService: LocationOptionsService,
    private tls46020Service: TLS46020Service,
    private tls11010Service: Tls11010Service,
    private http: HttpClient
  ) {
    super();
  }


  ngOnInit(): void {
    this.initializePage('TLS41010', 'TLS/TLS41010cru', this.queryForm, (form) => this.onSubmit(form));
    this.queryForm.get('ECR_SrvIP')?.valueChanges.subscribe((ip) => {
      if (ip) {
        this.callOtherApi(ip);
      }
    });
    this.locationOptionsService.getFloorOptions().subscribe({
      next: (res) => {
        this.floorOptions = res.map((item: any) => ({
          label: item.name || item.FLOOR_NAME || item.label,
          value: item.code || item.FLOOR_NO || item.value
        }));
      },
      error: () => this.messageService.errorBubble('載入樓層選單失敗')
    });
    this.queryForm.get('ECR_TmplNo')?.valueChanges.subscribe((tmplNo) => {
      if (tmplNo) {
        this.callTLS46020Api(tmplNo);
      }
    });
    this.queryForm.get('ECR_LocNo')?.valueChanges.subscribe((locNo) => {
      if (locNo) {
        this.callTls11010Api(locNo);
      }
    });
  }
  callOtherApi(ip: string) {
    const apiUrl = `http://${ip}/TLS0000/TLS4000/queryTLS46010`;
    const requestData = {
      queryKey: 'value'
    };

    this.loading = true;
    this.http.post(apiUrl, requestData).pipe(finalize(() => this.loading = false)).subscribe({
      next: (res) => {
        console.log('呼叫後台主機 API 成功', res);
      },
      error: (err) => {
        console.error('呼叫後台主機 API 失敗', err);
      }
    });
  }
  callTLS46020Api(tmplNo: string) {
    const params = {
      ECR_TmplNo: tmplNo,
      PageSize: 10,
      PageIndex: 1
    };

    this.loading = true;
    this.tls46020Service.queryTLS46020(params).pipe(finalize(() => this.loading = false)).subscribe({
      next: (res) => {
        console.log('查詢 TLS46020 成功', res.Data);
      },
      error: (err) => {
        console.error('查詢 TLS46020 失敗', err);
      }
    });
  }
  callTls11010Api(locNo: string) {
    const payload = {
      ECR_LocNo: locNo,
      PageSize: 10,
      PageIndex: 1
    };

    this.loading = true;
    this.tls11010Service.queryData(payload).pipe(finalize(() => this.loading = false)).subscribe({
      next: (res) => {
        console.log('查詢 TLS11010 成功', res.Data);

      },
      error: (err) => {
        console.error('查詢 TLS11010 失敗', err);
      }
    });
  }




  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      this.tls41010Service.queryTLS41010(frm.value).pipe(finalize(() => this.loading = false)).subscribe((res) => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
      });
    });
  }


  onDelete(data: TLS41010Data | TLS41010Data[]): void {
    const deleteIds = Array.isArray(data) ? data.map((d) => d.id) : [data.id];
    if (deleteIds.length === 0) return;
    this.loading = true;
    this.tls41010Service.deleteTLS41010(deleteIds).pipe(finalize(() => this.loading = false)).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        this.onSubmit(this.queryForm);
      },
    });
  }
}
