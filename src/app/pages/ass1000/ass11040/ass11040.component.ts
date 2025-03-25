import { ItemUnitService } from './../../../service/basic/item-unit.service';
import { PostageChargeService } from './../../../service/basic/postage-charge.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
//

//3.1.1.4 品項資料維護作業 
@Component({
  selector: 'app-ass11040',
  templateUrl: './ass11040.component.html',
  styleUrl: './ass11040.component.scss'
})
export class ASS11040Component extends BasicQpageComponent implements OnInit{
  //
  bigCategoryCodeOptions: any[]=[
    { value: 1, label: 'A/裝潢工程' },
    { value: 2, label: 'B/其他工程' },
    { value: 3, label: 'C/電腦及電子零件產品' },
    { value: 4, label: 'D/電力及照明系統' },
    { value: 5, label: 'E/家電家具設備' },
    { value: 6, label: 'F/機消空電水零配件' },
    { value: 7, label: 'G/辦公及營運庶務' },
    { value: 8, label: 'K/印刷品(非廣告行銷)' },
  ];
  midCategoryCodeOptions: any[]=[
    { value: 23, label: '室內裝潢工程' },
    { value: 24, label: '室內裝潢備品' },
    { value: 21, label: '弱電系統' },
    { value: 22, label: '房屋和建築設備' },
    { value: 23, label: '停車場設備' },
    { value: 24, label: '其他工程' },
    { value: 25, label: '機電消防工程' },
    { value: 22, label: '電子產品及零件' },
  ];
  itemCategoryOptions: any[]=[
    { value: 1, label: '資產' },
    { value: 2, label: '列管品' },
    { value: 3, label: '耗材' },
    { value: 4, label: '房屋和建築設備' },
    { value: 5, label: '其他資產(無形)' },
    { value: 6, label: '不領用之耗材' },
  ];
  itemUnitOptions: any[]=[];
  packageUnitOptions: any[]=[
    { value: 1, label: '箱' },
    { value: 2, label: '包' },
    { value: 3, label: '袋' },
    { value: 4, label: '束' },
    { value: 5, label: '盒' },
  ];
  warrantyMethodOptions: any[]=[];
  //
  queryForm = this.formBuilder.group({
    itemCode: [, [Validators.maxLength(13)]], // 品項代碼
    itemName: ['', [Validators.maxLength(32)]], // 品項代碼
    bigCategoryCode: [], // 大分類代碼
    midCategoryCode: [], // 中分類代碼
    smlCategoryCode: [], // 小分類代碼
    itemCategory: [], // 品項類別區分
    itemUnit: [], // 基本單位
    packageUnit: [], // 包裝單位
    warrantyMethod: [], // 保固方式
    maintenanceMethod: [], // 保養方式
    illustrate: [, ], // 說明
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
  columns: any[]= [
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
    // 其他欄位
  ];
  // ----------------------------------------------------------------

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private postageChargeService: PostageChargeService,
    private itemUnitService: ItemUnitService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310004';
    this.cruPage = '/ASS1000/ASS11040CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.postageChargeService.getSystemTypes().subscribe(data => {
      this.warrantyMethodOptions = data;
    });
    //
    this.itemUnitService.getItemUnits().subscribe(data => {
      this.itemUnitOptions = data;
    });
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
  categories = [
    {
      label: 'A-裝潢工程',
      value: 'A',
      children: [
        {
          label: '木工裝潢',
          value: 'A1',
          children: [
            { label: '木製家具', value: 'A1-1' },
            { label: '木地板', value: 'A1-2' },
          ],
        },
        {
          label: '油漆裝潢',
          value: 'A2',
          children: [
            { label: '內牆油漆', value: 'A2-1' },
            { label: '外牆油漆', value: 'A2-2' },
          ],
        },
      ],
    },
    {
      label: 'B-其他工程',
      value: 'B',
      children: [
        {
          label: '防水工程',
          value: 'B1',
          children: [
            { label: '屋頂防水', value: 'B1-1' },
            { label: '外牆防水', value: 'B1-2' },
          ],
        },
      ],
    },
  ]; // 大分類資料

  selectedCategory: any = null; // 選中的大分類
  selectedSubCategory: any = null; // 選中的中分類
  selectedSubSubCategory: any = null; // 選中的小分類

  onCategorySelectionChange(event: any): void {
    console.log('選擇結果:', event);
    this.selectedCategory = event.category;
    this.selectedSubCategory = event.subCategory;
    this.selectedSubSubCategory = event.subSubCategory;
  }
}
