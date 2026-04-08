import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS16010Data } from '@service/api/ass/ass16010.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

@Component({
  selector: 'app-ass16010',
  templateUrl: './ass16010.component.html',
  styleUrl: './ass16010.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, TableComponent, TranslateModule]
})
export class ASS16010Component extends BasicQueryPageComponent<ASS16010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    inventoryNo: [],   // 盤點單號
    ...createPaginationConfig([])
  });

  data: ASS16010Data[] = [];
  selectedItems: ASS16010Data[] = [];
  totalRecords = 0;

  columns: Column[] = [
    { field: 'inventoryNo', header: '盤點單號', visible: true },
    { field: 'inventoryDate', header: '盤點日期', visible: true }
  ];

  constructor(
    private notificationService: NotificationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '310040';
    this.initializePage('ASS16010', '/ass/ass16010cru', this.queryForm, (form) => this.onSubmit(form));
  }

  inventoryNoOptions = [
    { label: '202201001', value: '20220101' },
    { label: '202201002', value: '20220102' },
    { label: '202201003', value: '20220103' },
    { label: '202201004', value: '20220104' },
    { label: '202201005', value: '20220105' }
  ]

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    // 查詢假資料
    this.data = [
      { inventoryNo: '202201001', inventoryDate: '2022/01/01' },
      { inventoryNo: '202201002', inventoryDate: '2022/01/02' },
      { inventoryNo: '202201003', inventoryDate: '2022/01/03' },
      { inventoryNo: '202201004', inventoryDate: '2022/01/04' },
      { inventoryNo: '202201005', inventoryDate: '2022/01/05' }
    ];

    this.loading = false;
    this.notificationService.unblockUi();
  }

  // onDelete(selectedItems: ASS16010Data[]) {
  //     this.messageService.confirm({
  //       header: `是否確認刪除 ${selectedItems.length} 筆資料？`,
  //       accept: () => {
  //         const idList = selectedItems.map(item => item.ID);
  //         this.ass16010Service.deleteASS16010({ idList })
  //           .pipe(untilDestroyed(this))
  //           .subscribe(() => {
  //             this.messageService.successBubble('刪除成功');
  //             this.onSubmit(this.queryForm);
  //           });
  //       }
  //     });
  //   }

  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }
}
