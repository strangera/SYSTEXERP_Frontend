import { Component, OnInit } from '@angular/core';
import { FIN13030Data, FIN13030QueryRequest, FIN13030Service } from '../../../service/api/fin/fin13030.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { DropdownOption } from '../../../shared/componentkit/dropdown/dropdown.model';

@Component({
  selector: 'app-fin13030',
  templateUrl: './fin13030.component.html',
  styleUrl: './fin13030.component.scss'
})
export class FIN13030Component extends BasicQueryPageComponent<FIN13030Data> implements OnInit {
  queryForm = this.formBuilder.group({
    invNoStart: [''], // 發票號碼(起)
    invNoEnd: [''], // 發票號碼(迄)
    invDateStart: [''], // 發票日期(起)
    invDateEnd: [''], // 發票日期(迄)
    invYmStart: [''], // 資料所屬年月(起)
    invYmEnd: [''], // 資料所屬年月(迄)
    declareYm: [''], // 申報年月
    buyerTaxNo: ['', [Validators.maxLength(10)]], // 買受人統一編號
    goodsName: ['', [Validators.maxLength(20)]], // 貨物或勞務名稱
    goodsQtyStart: [''], // 貨物或勞務數量(起)
    goodsQtyEnd: [''], // 貨物或勞務數量(迄)
    exportMethod: [''], // 外銷方式
    docNo: ['', [Validators.maxLength(10)]], // 證明文件號碼
    docName: ['', [Validators.maxLength(20)]], // 證明文件名稱
    exportNo: ['', [Validators.maxLength(10)]], // 出口報單號碼
    exportType: [''], // 出口報單類別
    nonCustomsAmtStart: [''], // 非經海關出口金額(起)
    nonCustomsAmtEnd: [''], // 非經海關出口金額(迄)
    customsAmtStart: [''], // 經海關出口金額(起)
    customsAmtEnd: [''], // 經海關出口金額(迄)
    exportDateStart: [''], // 輸出或結匯日期(起)
    exportDateEnd: [''], // 輸出或結匯日期(迄)
    remark: ['', [Validators.maxLength(100)]], // 備註
    ...createPaginationConfig([{ field: 'invNoStart', order: -1 }]), // 分頁和排序參數
  });

  totalRecords = 0;
  data: FIN13030Data[] = [];
  selectedItems: FIN13030Data[] = [];
  columns: Column[] = [
    { field: 'invNoStart', header: '發票號碼(起)', visible: true },
    { field: 'invNoEnd', header: '發票號碼(迄)', visible: true },
    { field: 'invDateStart', header: '發票日期(起)', visible: true },
    { field: 'invDateEnd', header: '發票日期(迄)', visible: true },
    { field: 'invYmStart', header: '資料所屬年月(起)', visible: true },
    { field: 'invYmEnd', header: '資料所屬年月(迄)', visible: true },
    { field: 'declareYm', header: '申報年月', visible: true },
    { field: 'buyerTaxNo', header: '買受人統一編號', visible: true },
    { field: 'goodsName', header: '貨物或勞務名稱', visible: true },
    { field: 'goodsQtyStart', header: '貨物或勞務數量(起)', visible: true },
    { field: 'goodsQtyEnd', header: '貨物或勞務數量(迄)', visible: true },
    { field: 'exportMethod', header: '外銷方式', visible: true },
    { field: 'docNo', header: '證明文件號碼', visible: true },
    { field: 'docName', header: '證明文件名稱', visible: true },
    { field: 'exportNo', header: '出口報單號碼', visible: true },
    { field: 'exportType', header: '出口報單類別', visible: true },
    { field: 'nonCustomsAmtStart', header: '非經海關出口金額(起)', visible: true },
    { field: 'nonCustomsAmtEnd', header: '非經海關出口金額(迄)', visible: true },
    { field: 'customsAmtStart', header: '經海關出口金額(起)', visible: true },
    { field: 'customsAmtEnd', header: '經海關出口金額(迄)', visible: true },
    { field: 'exportDateStart', header: '輸出或結匯日期(起)', visible: true },
    { field: 'exportDateEnd', header: '輸出或結匯日期(迄)', visible: true },
    { field: 'remark', header: '備註', visible: true },
  ];

  exportMethodOptions: DropdownOption[] = [];
  exportTypeOptions: DropdownOption[] = [];

  constructor(private fin13030Service: FIN13030Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13030', 'fin/fin13030cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin13030Service.queryFIN13030(frm.value as FIN13030QueryRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        });
    });
  }

  loadOptions() {
    // 假資料，實際應從服務取得
    this.exportMethodOptions = [
      { label: '外銷貨物', value: '1' },
      { label: '外銷勞務', value: '2' },
      { label: '免稅商店', value: '3' }
    ];
    this.exportTypeOptions = [
      { label: '一般出口', value: 'A' },
      { label: '特種出口', value: 'B' }
    ];
  }
}