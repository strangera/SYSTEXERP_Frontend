import { Component, OnInit } from '@angular/core';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { FormGroup } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { Column } from '../../../shared/componentkit/table/table.model';

interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_MRemark: string | null;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
  CanDel: boolean;
}

interface InventoryItem {
  recruitmentNumber: string;
  counterNumber: string;
  brandName: string;
  vendorId: string;
  vendorName: string;
  versionNumber: string;
  commissionType: string;
  contractStartDate: string;
  contractEndDate: string;
  operationStartDate: string;
  operationEndDate: string;
}

interface GraduatedItems {
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
  F: string;
  G: string;
}


@Component({
  selector: 'app-tls13010-next3',
  templateUrl: './tls13010-next3.component.html',
  styleUrl: './tls13010-next3.component.scss'
})


export class Tls13010Next3Component extends BasicCruPageComponent<CategoryItem> implements OnInit {
  dataForm: FormGroup;

  data: CategoryItem[] = [];// 表格數據和篩選數據

  // 數據
  inventoryItems: InventoryItem[] = [];
  graduatedItems: GraduatedItems[] = [];
  // commissionItems: CommissionItem[] = [];
  columns: Column[] = [// 表格欄位定義
    { field: 'CAT_LNo', header: '大分類代碼', visible: true },
    { field: 'CAT_LName', header: '大分類名稱', visible: true },
    { field: 'CAT_LRemark', header: '備註', visible: true, type: 'html' },
  ];

  stocksColumns: Column[] = [
    { field: 'recruitmentNumber', header: '專櫃招募編號', visible: true },
    { field: 'counterNumber', header: '專櫃編號', visible: true },
    { field: 'brandName', header: '品牌(專櫃)名稱', visible: true },
    { field: 'vendorId', header: '廠商統編', visible: true },
    { field: 'vendorName', header: '廠商名稱', visible: true },
    { field: 'versionNumber', header: '版本編號', visible: true },
    { field: 'commissionType', header: '抽成別', visible: true },
    { field: 'contractStartDate', header: '合約起始日', visible: true },
    { field: 'contractEndDate', header: '合約終止日', visible: true },
    { field: 'operationStartDate', header: '營運起始日', visible: true },
    { field: 'operationEndDate', header: '營運終止日', visible: true },
  ];

  //階梯式抽成欄位
  graduatedColumns: Column[] = [
    { field: 'ischeck', header: '是否新增', visible: true },
    { field: 'A', header: '帳務期別', visible: true },
    { field: 'B', header: '帳務起', visible: true, type: 'date' },
    { field: 'C', header: '帳務迄', visible: true },
    { field: 'D', header: '階梯金額(起值)', visible: true },
    { field: 'E', header: '階梯金額(迄值)', visible: true },
    { field: 'F', header: '抽成率', visible: true },
  ];

  baseTierColumns: Column[] = [
    { field: 'A', header: '帳務期別', visible: true },
    { field: 'B', header: '帳務起', visible: true },
    { field: 'C', header: '帳務迄', visible: true },
    { field: 'D', header: '包底金額', visible: true },
    { field: 'E', header: '階梯金額(起值)', visible: true },
    { field: 'F', header: '階梯金額(迄值)', visible: true },
    { field: 'G', header: '抽成率', visible: true },
  ];
  selectedItems: CategoryItem[] = [];// 多選項目

  constructor(
    private validationService: ValidationService,
    // private apiService: TLS5000Service,
  ) {
    super();
    this.dataForm = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.initializePage('TLS13010', this.dataForm);
    // 初始化庫存數據
    this.inventoryItems = [
      {
        recruitmentNumber: '001',
        counterNumber: 'A123',
        brandName: '品牌A',
        vendorId: '55667788',
        vendorName: '公司A',
        versionNumber: 'v1.0',
        commissionType: '固定',
        contractStartDate: '2021-01-01',
        contractEndDate: '2023-12-31',
        operationStartDate: '2021-02-01',
        operationEndDate: '2023-11-30'
      }
    ];
    this.graduatedItems = [
      {
        A: '001',
        B: 'A123',
        C: '品牌A',
        D: '55667788',
        E: '公司A',
        F: 'v1.0',
        G: '固定',
      }
    ];
  }

  onSubmitNext(): void {
    this.router.navigate(['TLS/TLS13010NEXT4']);
  }
}



