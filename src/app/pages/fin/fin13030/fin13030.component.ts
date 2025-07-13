import { Component, OnInit } from '@angular/core';
import { FIN13030Data, FIN13030QueryRequest, FIN13030Service } from '../../../service/api/fin/fin13030.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ValidationService } from '../../../shared/service/validation.service';
import { DropdownOption } from '../../../shared/models/api/base-api.interface';

@Component({
  selector: 'app-fin13030',
  templateUrl: './fin13030.component.html',
  styleUrl: './fin13030.component.scss'
})
export class FIN13030Component extends BasicQueryPageComponent<FIN13030Data> implements OnInit {
  queryForm = this.formBuilder.group({
    invNoStart: ['', [this.validationService.numberValidator]], // 發票號碼(起)
    invNoEnd: ['', [this.validationService.numberValidator]], // 發票號碼(迄)
    invDateStart: [''], // 發票日期(起)
    invDateEnd: [''], // 發票日期(迄)
    invYmStart: ['', Validators.required], // 資料所屬年月(起)
    invYmEnd: ['', Validators.required], // 資料所屬年月(迄)
    declareYm: ['', Validators.required], // 申報年月
    buyerTaxNo: ['', [Validators.maxLength(10)]], // 買受人統一編號
    goodsName: ['', [Validators.maxLength(20)]], // 貨物或勞務名稱
    goodsQtyStart: ['', [this.validationService.numberValidator]], // 貨物或勞務數量(起)
    goodsQtyEnd: ['', [this.validationService.numberValidator]], // 貨物或勞務數量(迄)
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
    ...createPaginationConfig([{ field: 'invNo', order: -1 }]), // 分頁和排序參數
  });

  totalRecords = 0;
  data: FIN13030Data[] = [];
  selectedItems: FIN13030Data[] = [];
  columns: Column[] = [
    { field: 'invNo', header: '發票號碼', visible: true },
    { field: 'invDate', header: '發票日期', visible: true },
    { field: 'invYm', header: '資料所屬年月', visible: true },
    { field: 'declareYm', header: '申報年月', visible: true },
    { field: 'buyerTaxNo', header: '買受人統一編號', visible: true },
    { field: 'goodsName', header: '貨物或勞務名稱', visible: true },
    { field: 'goodsQty', header: '貨物或勞務數量', visible: true },
    { field: 'exportMethod', header: '外銷方式', visible: true },
    { field: 'docNo', header: '證明文件號碼', visible: true },
    { field: 'docName', header: '證明文件名稱', visible: true },
    { field: 'exportNo', header: '出口報單號碼', visible: true },
    { field: 'exportType', header: '出口報單類別', visible: true },
    { field: 'nonCustomsAmt', header: '非經海關出口金額', visible: true },
    { field: 'customsAmt', header: '經海關出口金額', visible: true },
    { field: 'exportDate', header: '輸出或結匯日期', visible: true },
    { field: 'remark', header: '備註', visible: true },
  ];

  exportMethodOptions: DropdownOption[] = [];
  exportTypeOptions: DropdownOption[] = [];

  constructor(
    private fin13030Service: FIN13030Service,
    private validationService: ValidationService,) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13030', 'fin/fin13030cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin13030Service.queryFIN13030(frm.getRawValue())
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  loadOptions() {
    // 載入外銷方式選項
    this.fin13030Service.getExportMethodOptions().subscribe(response => {
      this.exportMethodOptions = response.Data
    });

    // 載入出口報單類別選項
    this.fin13030Service.getExportTypeOptions().subscribe(response => {
      this.exportTypeOptions = response.Data
    });
  }
}