import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
// Shared
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
//

//3.1.5.3  財產目錄
@Component({
  selector: 'app-ass15030',
  templateUrl: './ass15030.component.html',
  styleUrl: './ass15030.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, RadiobuttonComponent, DropdownComponent, CalendarRangeComponent, CalendarComponent, CheckboxModule, ButtonComponent, TableComponent, TranslateModule]
})
export class ASS15030Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    paperType: [1, []], // 報表型態
    accountcode: [], // 會計科目代碼
    //
    bigCategoryCode: [], // 大分類編號
    midCategoryCode: [], // 中分類編號
    smlCategoryCode: [], // 小分類編號
    keeperUnit: [], // 保管單位
    //
    purchaseDateFrom: [], // 購入日期
    purchaseDateTo: [], // 購入日期
    entryDateFrom: [], // 入帳日期
    entryDateTo: [], // 入帳日期
    //
    itemCode: [], // 品項編號
    baseYYMM: [], // 基準日
    showReceiveAmount: [,], // 是否顯示取得金額為0
    showScrapData: [,], // 是否顯示當期報廢、變賣資料
    reportStyle: [], // 報表樣式
  });
  // 下拉資料多個呈現
  // ----------------------------------------------------------------
  roles: any[] = [
    { id: 1, roleCode: 'ADMIN', roleName: 'Administrator' },
    { id: 2, roleCode: 'USER', roleName: 'User' },
    { id: 3, roleCode: 'GUEST', roleName: 'Guest' },
  ];
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    // { 'name': 'Emily', 'age': 28, 'email': 'emily@example.com', 'city': 'Kaohsiung' },
    // { 'name': 'Michael', 'age': 31, 'email': 'michael@example.com', 'city': 'Taipei' },
    // { 'name': 'Sarah', 'age': 24, 'email': 'sarah@example.com', 'city': 'Tainan' },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'col1', header: '品項編號', visible: true },
    { field: 'col2', header: '品項名稱', visible: true },
    { field: 'col3', header: '保管單位', visible: true },

    { field: 'col4', header: '取得價格合計', visible: true },
    { field: 'col5', header: '異動價格合計', visible: true },
    { field: 'col6', header: '異動後價格合計', visible: true },
    { field: 'col7', header: '預留殘值合計', visible: true },

    { field: 'col8', header: '本期折舊金額合計', visible: true },
    { field: 'col9', header: '累計折舊金額合計', visible: true },
    { field: 'col10', header: '未折舊金額合計', visible: true },

    // { field: 'col11', header: '備註', visible: true },

    // { field: 'col12', header: '購入金額', visible: true },
    // { field: 'col13', header: '驗收單號', visible: true },

    // { field: 'col14', header: '入帳日期', visible: true },
    // { field: 'col15', header: '條件篩選', visible: true },
    // { field: 'col16', header: '顯示筆數', visible: true },

    // { field: 'col17', header: '報廢日期前之帳面價值', visible: true },
    // { field: 'col18', header: '報廢損失', visible: true },

    // { field: 'col19', header: '工廠地址', visible: true },
    // { field: 'col20', header: '工廠電話', visible: true },
    // { field: 'col21', header: '工廠傳真', visible: true },

    // { field: 'col22', header: '送貨方式', visible: true },
    // { field: 'col23', header: '退貨處理方式', visible: true },
    // { field: 'col24', header: '廠商送貨期限', visible: true },

    // { field: 'col25', header: '附註', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  propertyCodeOptions: any[] = [
    { value: 1, label: '1A23230000001000001' },
    { value: 2, label: '1A23230000002000001' },
    { value: 3, label: '1A23230000003000001' },
    { value: 4, label: '1A23230000004000001' },
    { value: 5, label: '1A23230000005000001' },
  ];
  paperTypeOptions: any[] = [
    { value: 1, label: '折舊前試算' },
    { value: 2, label: '拋轉後' },
  ];
  AccountcodeOptions: any[] = [
    { value: 1, label: '1501' },
    { value: 2, label: '150101' },
    { value: 3, label: '1511' },
    { value: 4, label: '151101' },
    { value: 5, label: '1512' },
    { value: 6, label: '151201' },
    { value: 7, label: '1521' },
    { value: 8, label: '152101' },
    { value: 9, label: '1522' },
    { value: 10, label: '152201' },
  ];
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
  organizationOptions: any[] = [];
  itemCodeOptions: any[] = [];
  reportStyleOptions: any[] = [
    { value: 1, label: '彙總' },
    { value: 2, label: '明細' },
  ];

  //
  constructor(
    private formBuilder: FormBuilder,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310034';

    // ----------------------------------------------------------------
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
  // ----------------------------------------------------------------
  onCreate() {
    if (this.canAdd()) {
      this.navigateWithState(this.router, CRUDStatus.Create, null, this.cruPage);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(this.router, CRUDStatus.Edit, data, this.cruPage);
    }
  }

  onDetail(data: any) {
    this.navigateWithState(this.router, CRUDStatus.Read, data, this.cruPage);
  }
}
