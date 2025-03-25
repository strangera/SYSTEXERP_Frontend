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

//3.1.1.3 小分類維護作業 
@Component({
  selector: 'app-ass11030',
  templateUrl: './ass11030.component.html',
  styleUrl: './ass11030.component.scss'
})
export class ASS11030Component extends BasicQpageComponent implements OnInit{
  //
  bigCategoryCodeOptions: any[]=[
    { value: 'A', label: 'A/裝潢工程' },
    { value: 'B', label: 'B/其他工程' },
    { value: 'C', label: 'C/電腦及電子零件產品' },
    { value: 'D', label: 'D/電力及照明系統' },
    { value: 'E', label: 'E/家電家具設備' },
    { value: 'F', label: 'F/機消空電水零配件' },
    { value: 'G', label: 'G/辦公及營運庶務' },
    { value: 'H', label: 'K/印刷品(非廣告行銷)' },
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
  //
  queryForm = this.formBuilder.group({
    smlCategoryCode: [, [Validators.maxLength(2)]], // 小分類代碼
    smlCategoryName: ['', [Validators.maxLength(32)]], // 小分類名稱
    midCategoryCode: [], // 中分類代碼
    midCategoryName: ['', [Validators.maxLength(40)]], // 中分類名稱
    bigCategoryCode: [], // 大分類代碼
    bigCategoryName: ['', [Validators.maxLength(40)]], // 大分類名稱
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
    { 'smlCategoryCode': 23, 'smlCategoryName': '工區裝潢(分樓層)', 'midCategoryCode': 23, 'bigCategoryCode': 'A' },
    { 'smlCategoryCode': 24, 'smlCategoryName': '專櫃裝潢補貼款(分品牌)', 'midCategoryCode': 23, 'bigCategoryCode': 'B' },
    // 其他資料
  ];
  columns: any[]= [
    { field: 'smlCategoryCode', header: '小分類代碼', visible: true },
    { field: 'smlCategoryName', header: '小分類名稱', visible: true },
    { field: 'midCategoryCode', header: '中分類代碼', visible: true },
    { field: 'bigCategoryCode', header: '大分類代碼', visible: true },
    { field: 'illustrate', header: '說明', visible: false },
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
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310003';
    this.cruPage = '/ASS1000/ASS11030CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
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
