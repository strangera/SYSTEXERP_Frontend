import { Sysbc00Service } from './../../../service/api/sys/sysbc00.service';
import { Component, OnInit } from '@angular/core';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { FormGroup } from '@angular/forms';
import { Column } from '../../../shared/componentkit/table/table.model';
import { FileSelectEvent } from 'primeng/fileupload';
import { ExcelImportService } from '../../../shared/service/excel-import.service';


@Component({
  selector: 'app-tls21040',
  templateUrl: './tls21040.component.html',
})
export class TLS21040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    bank: [],
    cardType: [],
    cardCategory: [],
    bin: [],
  });
  totalRecords = 0;
  data: any[] = [];
  columns: Column[] = [
    { field: 'bankCode', header: '銀行代碼', visible: true },
    { field: 'bankName', header: '銀行名稱', visible: true },
    { field: 'cardType', header: '卡種', visible: true },
    { field: 'cardCategory', header: '卡別', visible: true },
    { field: 'ntRetrieve', header: '從N碼開始取', visible: true },
    { field: 'retrieve', header: '取N碼', visible: true },
    { field: 'cardIdentifier', header: '卡種識別碼', visible: true },
  ];
  cardTypeOptions: { value: string, label: string }[] = [
    { value: 'A', label: 'AE' },
    { value: 'D', label: '大來' },
    { value: 'J', label: 'JCB' },
    { value: 'M', label: 'MASTER' },
    { value: 'O', label: 'OTHER' },
    { value: 'U', label: 'U' },
    { value: 'V', label: 'VISA' },
  ];
  cardCategoryOptions: { value: string, label: string }[] = [
    { value: 'B', label: '商務卡' },
    { value: 'C', label: '普卡' },
    { value: 'G', label: '金卡' },
    { value: 'I', label: '無限卡' },
    { value: 'O', label: '其他' },
    { value: 'P', label: '白金卡' },
    { value: 'S', label: '御璽、鈦金、晶緻卡' },
    { value: 'T', label: '鈦金卡' },
  ];
  bankOptions: { BNK_No: string, BNK_Name: string }[] = [];
  constructor(
    private sysbc00Service: Sysbc00Service,
    private excelImportService: ExcelImportService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS21040', 'TLS/TLS21040cru', this.queryForm, (form) => this.onSubmit(form));
    this.sysbc00Service.querySYSBC00({}).subscribe((res) => {
      this.bankOptions = res.Data.map(item => ({
        ...item, label: item.BNK_No + ' - ' + item.BNK_Name
      }));
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = false;
      this.data = [
        { bankCode: '001', bankName: '台灣銀行', cardType: 'A', cardCategory: 'B', ntRetrieve: 1, retrieve: 4, cardIdentifier: '1234' },
        { bankCode: '002', bankName: '中國信託', cardType: 'V', cardCategory: 'C', ntRetrieve: 2, retrieve: 3, cardIdentifier: '5678' },
        { bankCode: '003', bankName: '永豐銀行', cardType: 'M', cardCategory: 'G', ntRetrieve: 3, retrieve: 2, cardIdentifier: '9101' },
      ]
    });
  }
  excelColumns: string[] = ['BIN', '銀行名稱', '卡別', '卡種', '生效日期', '終止日期', '銀行機構代碼'];
  onImportExcel(event: FileSelectEvent): void {
    const file = event.files[0];
    this.excelImportService.importExcel(file, this.excelColumns).then(data => {
      console.log('Imported data:', data);
    });
  }
}
