import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11040Request, ASS11040Response, Ass11040Service } from '@service/api/ass/ass11040.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
//3.1.1.4 品項資料維護作業
@Component({
  selector: 'app-ass11040',
  templateUrl: './ass11040.component.html',
  standalone: true,
  imports: [InputTextareaComponent, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, InputTextComponent, DropdownComponent, TranslateModule]
})
export class ASS11040Component extends BasicQueryPageComponent<ASS11040Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    itemCode: [null, [Validators.maxLength(13)]], // 品項代碼
    itemName: [null, [Validators.maxLength(32)]], // 品項代碼
    bigCategoryCode: [null], // 大分類代碼
    midCategoryCode: [null], // 中分類代碼
    smlCategoryCode: [null], // 小分類代碼
    itemCategory: [null], // 品項類別區分
    itemUnit: [null], // 基本單位
    packageUnit: [null], // 包裝單位
    warrantyMethod: [null], // 保固方式
    maintenanceMethod: [null], // 保養方式
    illustrate: [null], // 說明
  });
  bigCategoryCodeOptions: any[] = [
    { value: 1, label: 'A/裝潢工程' },
    { value: 2, label: 'B/其他工程' },
    { value: 3, label: 'C/電腦及電子零件產品' },
    { value: 4, label: 'D/電力及照明系統' },
    { value: 5, label: 'E/家電家具設備' },
    { value: 6, label: 'F/機消空電水零配件' },
    { value: 7, label: 'G/辦公及營運庶務' },
    { value: 8, label: 'K/印刷品(非廣告行銷)' },
  ];
  midCategoryCodeOptions: any[] = [
    { value: 23, label: '室內裝潢工程' },
    { value: 24, label: '室內裝潢備品' },
    { value: 21, label: '弱電系統' },
    { value: 22, label: '房屋和建築設備' },
    { value: 23, label: '停車場設備' },
    { value: 24, label: '其他工程' },
    { value: 25, label: '機電消防工程' },
    { value: 22, label: '電子產品及零件' },
  ];
  itemCategoryOptions: any[] = [
    { value: 1, label: '資產' },
    { value: 2, label: '列管品' },
    { value: 3, label: '耗材' },
    { value: 4, label: '房屋和建築設備' },
    { value: 5, label: '其他資產(無形)' },
    { value: 6, label: '不領用之耗材' },
  ];
  itemUnitOptions: any[] = [];
  packageUnitOptions: any[] = [
    { value: 1, label: '箱' },
    { value: 2, label: '包' },
    { value: 3, label: '袋' },
    { value: 4, label: '束' },
    { value: 5, label: '盒' },
  ];
  warrantyMethodOptions: any[] = [];
  data: ASS11040Response[] = [];
  selectedRows: ASS11040Response[] = [];
  totalRecords = 0;
  lastQuery: ASS11040Request | null = null;
  columns: ReportColumn[] = [
    { field: 'col1', header: '品項代碼', visible: true },
    { field: 'col2', header: '品項名稱', visible: true },
    { field: 'col3', header: '大分類代碼', visible: true },
    { field: 'col4', header: '大分類名稱', visible: true },
    { field: 'col5', header: '中分類代碼', visible: true },
    { field: 'col6', header: '中分類名稱', visible: true },
    { field: 'col7', header: '小分類代碼', visible: true },
    { field: 'col8', header: '小分類名稱', visible: true },
    { field: 'col9', header: '品項類別區分', visible: true },
    { field: 'col10', header: '圖示說明', visible: true },
  ];
  // ----------------------------------------------------------------

  constructor(
    public readonly ass11040Service: Ass11040Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('ASS11040', 'ass/ass11040cru', this.queryForm, (form) => this.onSubmit(form));
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.ass11040Service.queryASS11040(frm.getRawValue()).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQuery = frm.getRawValue();
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      })
    })
  }


  onDelete(selectedItems: ASS11040Response[]) {
    this.messageService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料?`,
      accept: () => {
        const idList = selectedItems.map(item => item.id);
        // this.cpm12030Service.deleteASS11040({ idList }).pipe(untilDestroyed(this)).subscribe(() => {
        //     this.messageService.successBubble('刪除成功');
        //     this.onSubmit(this.queryForm);
        //   });
      }
    });
  }
}
