import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';

@Component({
  selector: 'app-tls2g040-cru',
  templateUrl: './tls2g040-cru.component.html',
  styleUrls: ['./tls2g040-cru.component.scss'],
})
export class TLS2G040CRUComponent
  extends BasicQpageComponent
  implements OnInit {
  // 定義表單
  queryForm = this.formBuilder.group({
    industryCode: ['', [Validators.required, Validators.maxLength(100)]],
    industryName: ['', [Validators.maxLength(100)]],
    productCode: ['', [Validators.maxLength(100)]],
    productName: ['', [Validators.maxLength(100)]],
    code: ['', [Validators.maxLength(100)]],
    name: ['', [Validators.maxLength(100)]],
    id: ['', [Validators.maxLength(100)]],
  });

  // 定義表格欄位
  columns: any[] = [

    { field: 'industryCode', header: '大分類類別代碼', visible: true },
    { field: 'industryName', header: '大分類類別名稱', visible: true },
    { field: 'productCode', header: '商品類別代碼', visible: true },
    { field: 'productName', header: '商品類別名稱', visible: true },
    { field: 'code', header: '小分類別代碼', visible: true },
    { field: 'name', header: '小分類名稱', visible: true },
  ];

  // 定義篩選欄位
  filterFields: any[] = [
    'industryCode',
    'industryName',
    'productCode',
    'productName',
    'subcategoryCode',
    'subcategoryName',
  ];

  // 定義表格數據
  data = [
    { industryCode: '10', industryName: '物販', productCode: '01', productName: '男女服飾', code: '00', name: '綜合服飾' },
    { industryCode: '10', industryName: '物販', productCode: '07', productName: '嬰童用品', code: '00', name: '兒童資訊軟體' },
    { industryCode: '40', industryName: '服務', productCode: '01', productName: '綜合服務', code: '00', name: '其他' },
    { industryCode: '10', industryName: '物販', productCode: '02', productName: '配件雜貨', code: '00', name: '綜合皮件' },
    { industryCode: '98', industryName: '停車管理', productCode: '01', productName: '虛擬機台', code: '01', name: '虛擬機台' },
    { industryCode: '99', industryName: '服務台', productCode: '01', productName: '虛擬機台', code: '01', name: '虛擬機台' },
    { industryCode: '10', industryName: '物販', productCode: '01', productName: '男女服飾', code: '01', name: '少女裝' },
    { industryCode: '20', industryName: '餐飲', productCode: '04', productName: '美食街', code: '01', name: '西式速食' },
    { industryCode: '20', industryName: '餐飲', productCode: '06', productName: '食品料', code: '01', name: '冰品果汁' },
    { industryCode: '30', industryName: '娛樂', productCode: '06', productName: '娛樂設施', code: '01', name: '視聽娛樂' },
    { industryCode: '10', industryName: '物販', productCode: '05', productName: '運動休閒', code: '01', name: '運動休閒服飾' },
    { industryCode: '10', industryName: '物販', productCode: '06', productName: '家具家飾', code: '01', name: '傢俱' },
    { industryCode: '10', industryName: '物販', productCode: '07', productName: '嬰童用品', code: '01', name: '嬰兒用品' },
    { industryCode: '10', industryName: '物販', productCode: '08', productName: '電器3C', code: '01', name: '家電五金' },
    { industryCode: '10', industryName: '物販', productCode: '09', productName: '美妝保健', code: '01', name: '化妝品' },
    { industryCode: '20', industryName: '餐飲', productCode: '01', productName: '餐廳', code: '01', name: '主題餐廳' },
    { industryCode: '10', industryName: '物販', productCode: '00', productName: '複合店', code: '01', name: '複合店' },
    { industryCode: '20', industryName: '餐飲', productCode: '02', productName: '宴會廳', code: '01', name: '宴會廳' },
    { industryCode: '20', industryName: '餐飲', productCode: '03', productName: '輕食', code: '01', name: '咖啡茶館' },
    { industryCode: '20', industryName: '餐飲', productCode: '05', productName: '超市', code: '01', name: '量販超市' },
    { industryCode: '30', industryName: '娛樂', productCode: '01', productName: '主題樂園', code: '01', name: '主題樂園' },
    { industryCode: '30', industryName: '娛樂', productCode: '02', productName: '健身中心', code: '01', name: '健身美容' },
    { industryCode: '30', industryName: '娛樂', productCode: '03', productName: '遊樂場', code: '01', name: '遊樂場' },
    { industryCode: '30', industryName: '娛樂', productCode: '04', productName: '電影院', code: '01', name: '電影院' },
    { industryCode: '30', industryName: '娛樂', productCode: '05', productName: '親子遊樂設', code: '01', name: '親子遊藝設施' },
    { industryCode: '10', industryName: '物販', productCode: '02', productName: '配件雜貨', code: '01', name: '女用配飾' },
    { industryCode: '10', industryName: '物販', productCode: '03', productName: '精品名品', code: '01', name: '頂級精品' },
    { industryCode: '10', industryName: '物販', productCode: '04', productName: '圖書文藝', code: '01', name: '圖書雜誌' },
    { industryCode: '40', industryName: '服務', productCode: '01', productName: '綜合服務', code: '01', name: '旅遊服務' },
    { industryCode: '30', industryName: '娛樂', productCode: '07', productName: '摩天輪', code: '01', name: '摩天輪' }
  ];

  backsearchplaceholder: string = '模糊查詢:小分類別代碼, 小分類名稱';

  constructor(
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '900001';
  }




  // 提交表單
  onSubmit(frm: FormGroup): void {
    console.log(frm.value); // 輸出表單數據
    this.submitted = true;
    if (frm.valid) {
      console.log('表單驗證成功，提交資料:', frm.value);
    } else {
      console.log('表單驗證失敗');
    }
  }


  searchFields = [
    { field: 'industryCode', placeholder: '輸入大分類類別代碼' },
    { field: 'industryName', placeholder: '輸入大分類類別名稱' },
    { field: 'productCode', placeholder: '輸入商品類別代碼' },
    { field: 'productName', placeholder: '輸入商品類別名稱' },
    { field: 'code', placeholder: '輸入小分類代碼' },
    { field: 'name', placeholder: '輸入小分類名稱' },
  ];

  // 處理選中行的事件
  handleRowSelect(selectedItem: any): void {
    console.log('選中的項目:', selectedItem);
  }
}
