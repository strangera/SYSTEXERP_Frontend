import { Component } from '@angular/core';
import { FIN13030Data, FIN13030Service } from '../../../service/api/fin/fin13030.service';
import { FormGroup, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { DropdownOption } from '../../../shared/componentkit/dropdown/dropdown.model';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-fin13030-cru',
  templateUrl: './fin13030-cru.component.html',
  styleUrl: './fin13030-cru.component.scss'
})
export class FIN13030CRUComponent extends BasicCruPageComponent<FIN13030Data> {
  dataForm = this.formBuilder.group({
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
  exportMethodOptions: DropdownOption[] = [];
  exportTypeOptions: DropdownOption[] = [];

  constructor(private fin13030Service: FIN13030Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13030', this.dataForm);
    this.loadOptions();
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

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 處理提交邏輯 (呼叫 insert 或 update)
      // 將null 轉換為 undefined
      const formValue = Object.fromEntries(
        Object.entries(this.dataForm.value).map(([k, v]) => [k, v === null ? undefined : v])
      );
      const request$ = this.isFormCreateable
        ? this.fin13030Service.insertFIN13030(formValue)
        : this.fin13030Service.updateFIN13030(formValue);

      request$.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe({
        next: () => {
          this.messageService.successBubble(this.isFormCreateable ? '新增成功' : '修改成功');
          if (this.isFormCreateable) {
            this.dataForm.reset();
          } else {
            this.onCancel();
          }
        }
      });

    })
  }
}
