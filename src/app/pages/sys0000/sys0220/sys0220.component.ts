import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/service/notification.service';

import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { UserCodeService } from '../../../service/basic/user-code.service';
// 4-2-2-4使用者之角色設定維護
@Component({
  selector: 'app-sys0220',
  templateUrl: './sys0220.component.html',
  styleUrls: ['./sys0220.component.scss'],
})
export class SYS0220Component extends BasicQpageComponent {
  // 查詢
  queryForm = this.formBuilder.group({
    organizationNumber: [, [Validators.required]], // DropDown
  });
  // 選項
  userCodeOptions: any[] = [];
  organizationNumberOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private userCodeService: UserCodeService
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '420005';
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // 加載使用者代碼選項
    this.userCodeService.getUserCode().subscribe((data) => {
      this.userCodeOptions = data;
    });
  }
  data: any[] = [
    {
      code: '900000001',
      name: '阮湘晴',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: '1111111111',
      name: 'TEST調班',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: '2013104001',
      name: '2015104001',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: '2013104002',
      name: '2013104002',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: '2013104003',
      name: '2013104003',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: '2014000023',
      name: '王立範',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: '2015000172',
      name: '江文凱',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: '2017000316',
      name: '鄭明輝',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: '2017000317',
      name: '莊景堯',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: '2021000468',
      name: '李俊瑋',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: 'Candy',
      name: 'Candy',
      companyName: '全公司',
      companyCode: '100000',
    },
    { code: 'IT', name: 'IT', companyName: '全公司', companyCode: '100000' },
    { code: 'RSL', name: 'RSL', companyName: '全公司', companyCode: '100000' },
    {
      code: 'SUPER',
      name: '最高權限使用者',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: 'aaron',
      name: 'aaron',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: 'herbert',
      name: 'herbert',
      companyName: '全公司',
      companyCode: '100000',
    },
    { code: 'ray', name: 'ray', companyName: '全公司', companyCode: '100000' },
    {
      code: 'sandy',
      name: 'sandy',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: 'test0001',
      name: 'test0001',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: 'test123',
      name: 'test',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: 'turn000001',
      name: '李律民',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: 'turn000002',
      name: '項美英',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: 'turn000003',
      name: '羅宇珏',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: 'xcom',
      name: '權限管理者',
      companyName: '全公司',
      companyCode: '100000',
    },
    {
      code: '2013000010',
      name: '余秀娟',
      companyName: '經營企劃部(停用)',
      companyCode: '101000',
    },
    {
      code: '2014000009',
      name: '于秀娟',
      companyName: '經營企劃部(停用)',
      companyCode: '101000',
    },
    {
      code: '2014000091',
      name: '張怡淳',
      companyName: '行政Team(停用)',
      companyCode: '101100',
    },
    {
      code: '2014000140',
      name: '施育霖',
      companyName: '電子商務team(停用)',
      companyCode: '101400',
    },
    {
      code: 'tina',
      name: 'tina',
      companyName: '行政Team(停用)',
      companyCode: '101100',
    },
    {
      code: '2014000091',
      name: '張怡淳',
      companyName: '行政Team(停用)',
      companyCode: '101100',
    },
    {
      code: 'tina',
      name: 'tina',
      companyName: '行政Team(停用)',
      companyCode: '101100',
    },
    {
      code: '2014000140',
      name: '施育霖',
      companyName: '電子商務team(停用)',
      companyCode: '101400',
    },
    {
      code: '1111111110',
      name: 'TEST',
      companyName: '化妝品',
      companyCode: '102130',
    },
    {
      code: '2014000036',
      name: '林嘉文',
      companyName: '餐飲Team',
      companyCode: '102300',
    },
    {
      code: '2014000046',
      name: '李惠玉',
      companyName: '休閒Team',
      companyCode: '102200',
    },
    {
      code: '2014000050',
      name: '胡若珊',
      companyName: '時尚Team',
      companyCode: '102100',
    },
    {
      code: '2014000051',
      name: '張靖妍',
      companyName: '1F',
      companyCode: '102110',
    },
    {
      code: '2014000052',
      name: '張簡雅苓',
      companyName: '3F',
      companyCode: '102210',
    },
    {
      code: '2014000073',
      name: '林慧玲',
      companyName: '化妝品',
      companyCode: '102130',
    },
    {
      code: '2014000102',
      name: '王鈺清',
      companyName: '化妝品',
      companyCode: '102130',
    },
    {
      code: '2014000111',
      name: '吳佩璘',
      companyName: '特販Team',
      companyCode: '102500',
    },
    {
      code: '2014000128',
      name: '熊雅慧',
      companyName: '餐廳/輕食組',
      companyCode: '102310',
    },
    {
      code: '2014000144',
      name: '李浿溱',
      companyName: '化妝品',
      companyCode: '102130',
    },
    {
      code: '2015000185',
      name: '呂蕙羽',
      companyName: '1F',
      companyCode: '102110',
    },
    {
      code: '2015000194',
      name: '陳姮潔',
      companyName: '2F',
      companyCode: '102120',
    },
    {
      code: '2015000222',
      name: '杜玟慧',
      companyName: '親子娛樂組(停用)',
      companyCode: '102230',
    },
    {
      code: '2015000229',
      name: '蔡怡君',
      companyName: '親子娛樂組(停用)',
      companyCode: '102230',
    },
    {
      code: '2016000244',
      name: '陳盈君',
      companyName: '居家生活組(停用)',
      companyCode: '102220',
    },
    // 其他資料略
  ];

  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'code', header: '使用者代碼' , visible: true},
    { field: 'name', header: '使用者名稱', visible: true },
    { field: 'companyCode', header: '組織代碼', visible: true },
    { field: 'companyName', header: '組織名稱', visible: true },
  ];

  searchFields = [
    { field: 'code', placeholder: '使用者代碼' },
    { field: 'name', placeholder: '使用者名稱' },
    { field: 'companyCode', placeholder: '組織代碼' },
    { field: 'companyName', placeholder: '組織名稱' },
  ];

  // 處理選中行的事件
  handleRowSelect(selectedItem: any): void {
    console.log('選中的項目:', selectedItem);
  }
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }
  onNext(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      this.router.navigate(['/SYS0000/SYS0220CRU']);
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitNext(frm: FormGroup) {
    // 查詢邏輯
    this.onNext(frm);
  }
}
