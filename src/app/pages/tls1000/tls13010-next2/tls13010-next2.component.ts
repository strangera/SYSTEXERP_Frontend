import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';

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

@Component({
  selector: 'app-tls13010-next2',
  templateUrl: './tls13010-next2.component.html',
  styleUrls: ['./tls13010-next2.component.scss']
})
export class TLS13010Next2Component extends BasicCrupageComponent implements OnInit {
  dataForm: FormGroup;
  selectedRowIndex: number | null = null;

  inventoryItems: InventoryItem[] = [];
  taxTypeOptions: any[] = [
    { label: '應稅', value: 1 },
    { label: '免稅', value: 2 }
  ];
  discounts: Array<{ value: number, label: string }> = [
    { value: 1, label: '正品' },
    { value: 2, label: '95折' },
    { value: 3, label: '90折' },
    { value: 4, label: '85折' },
    { value: 5, label: '80折' },
    { value: 6, label: '75折' },
    { value: 7, label: '70折' },
    { value: 8, label: '65折' },
    { value: 9, label: '60折' },
    { value: 10, label: '55折' },
    { value: 11, label: '50折' },
    { value: 12, label: '特價' }
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    super();
    this.dataForm = this.formBuilder.group({
      newVendor: [],
      factoryCode: [],
      vendorName: [],
      taxId: [],
      paymentMethod: [],
      paymentDays: [],
      items: this.formBuilder.array([])  // 外層 FormArray
    });
  }

  ngOnInit(): void {
    this.ProgNo = '210010';
    this.inventoryItems = [{
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
    }];
    this.addInitialItem();
  }

  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getDiscountSettingItems(index: number): FormArray {
    return this.items.at(index).get('discountSettingItems') as FormArray;
  }

  getAnnualPerformanceItems(index: number): FormArray {
    return this.items.at(index).get('annualPerformanceItems') as FormArray;
  }

  getDiscountLevelItems(index: number): FormArray {
    return this.items.at(index).get('discountLevelItems') as FormArray;
  }

  createOuterItem(contractStartDate: string, contractEndDate: string): FormGroup {
    return this.formBuilder.group({
      commissionType: [],
      commissionTypeName: [],
      taxType: [],
      discountSummary: [],
      transactionAmount: [],
      specialCommission: [],
      discountSettingItems: this.formBuilder.array(Array.from({ length: 10 }, () => this.createDiscountSettingItem(contractStartDate, contractEndDate))),
      annualPerformanceItems: this.formBuilder.array(Array.from({ length: 10 }, () => this.createAnnualPerformanceItem())),
      discountLevelItems: this.formBuilder.array(Array.from({ length: 10 }, () => this.createDiscountLevelItem()))
    });
  }

  createDiscountSettingItem(contractStartDate: string, contractEndDate: string): FormGroup {
    return this.formBuilder.group({
      selected: [],
      discountType: [''],
      startDate: [contractStartDate],
      endDate: [contractEndDate],
      rate: []
    });
  }

  createAnnualPerformanceItem(): FormGroup {
    return this.formBuilder.group({
      selected: [],
      discountAmount: [],
      rate: []
    });
  }

  createDiscountLevelItem(): FormGroup {
    return this.formBuilder.group({
      selected: [],
      discountType: [''],
      startAmount: [],
      endAmount: [],
      rate: []
    });
  }

  addInitialItem(): void {
    const contractStartDate = this.inventoryItems[0]?.contractStartDate || '';
    const contractEndDate = this.inventoryItems[0]?.contractEndDate || '';
    this.items.push(this.createOuterItem(contractStartDate, contractEndDate));
  }

  onAddItem(): void {
    const contractStartDate = this.inventoryItems[0]?.contractStartDate || '';
    const contractEndDate = this.inventoryItems[0]?.contractEndDate || '';
    this.items.push(this.createOuterItem(contractStartDate, contractEndDate));
  }

  addDiscountSettingItem(index: number): void {
    const contractStartDate = this.inventoryItems[0]?.contractStartDate || '';
    const contractEndDate = this.inventoryItems[0]?.contractEndDate || '';
    this.getDiscountSettingItems(index).push(this.createDiscountSettingItem(contractStartDate, contractEndDate));
  }

  addAnnualPerformanceItem(index: number): void {
    this.getAnnualPerformanceItems(index).push(this.createAnnualPerformanceItem());
  }

  addDiscountLevelItem(index: number): void {
    this.getDiscountLevelItems(index).push(this.createDiscountLevelItem());
  }

  removeDiscountSettingItem(outerIndex: number, innerIndex: number): void {
    this.getDiscountSettingItems(outerIndex).removeAt(innerIndex);
  }

  removeAnnualPerformanceItem(outerIndex: number, innerIndex: number): void {
    this.getAnnualPerformanceItems(outerIndex).removeAt(innerIndex);
  }

  removeDiscountLevelItem(outerIndex: number, innerIndex: number): void {
    this.getDiscountLevelItems(outerIndex).removeAt(innerIndex);
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  onSave(index: number): void {
    const discountSummaryControl = this.getFormControl(index, 'discountSummary');
    let formattedItems = '';

    const discountSettingItems = this.getDiscountSettingItems(index);
    const selectedDiscounts = discountSettingItems.controls.filter(item => item.get('selected')?.value);
    const formattedDiscounts = selectedDiscounts.map((item, idx) => {
      const discountTypeValue = item.get('discountType')?.value;
      const discountLabel = this.discounts.find(d => d.value == discountTypeValue)?.label || '';
      const startDate = item.get('startDate')?.value;
      const endDate = item.get('endDate')?.value;
      const rate = item.get('rate')?.value;
      return `折扣設定 ${idx + 1}: ${discountLabel}, ${startDate}, ${endDate}, ${rate}`;
    }).join('; ');

    const annualPerformanceItems = this.getAnnualPerformanceItems(index);
    const selectedAnnuals = annualPerformanceItems.controls.filter(item => item.get('selected')?.value);
    const formattedAnnuals = selectedAnnuals.map((item, idx) => {
      const discountAmount = item.get('discountAmount')?.value;
      const rate = item.get('rate')?.value;
      return `年度業績 ${idx + 1}: ${discountAmount}, ${rate}`;
    }).join('; ');

    const discountLevelItems = this.getDiscountLevelItems(index);
    const selectedLevels = discountLevelItems.controls.filter(item => item.get('selected')?.value);
    const formattedLevels = selectedLevels.map((item, idx) => {
      const discountTypeValue = item.get('discountType')?.value;
      const discountLabel = this.discounts.find(d => d.value == discountTypeValue)?.label || '';
      const startAmount = item.get('startAmount')?.value;
      const endAmount = item.get('endAmount')?.value;
      const rate = item.get('rate')?.value;
      return `折扣層級 ${idx + 1}: ${discountLabel}, ${startAmount}, ${endAmount}, ${rate}`;
    }).join('; ');

    formattedItems = [formattedDiscounts, formattedAnnuals, formattedLevels].filter(s => s).join(' | ');

    discountSummaryControl.setValue(formattedItems);
  }

  onCancelInner(index: number): void {
    const contractStartDate = this.inventoryItems[0]?.contractStartDate || '';
    const contractEndDate = this.inventoryItems[0]?.contractEndDate || '';

    // 保留合約起迄日，重置其他欄位
    this.getDiscountSettingItems(index).controls.forEach(control => {
      control.get('selected')?.setValue(false);
      control.get('discountType')?.setValue('');
      control.get('startDate')?.setValue(contractStartDate); // 保留預設值
      control.get('endDate')?.setValue(contractEndDate); // 保留預設值
      control.get('rate')?.setValue('');
    });

    this.getAnnualPerformanceItems(index).controls.forEach(control => {
      control.get('selected')?.setValue(false);
      control.get('discountAmount')?.setValue('');
      control.get('rate')?.setValue('');
    });

    this.getDiscountLevelItems(index).controls.forEach(control => {
      control.get('selected')?.setValue(false);
      control.get('discountType')?.setValue('');
      control.get('startAmount')?.setValue('');
      control.get('endAmount')?.setValue('');
      control.get('rate')?.setValue('');
    });

    // 清除設定摘要內容
    this.getFormControl(index, 'discountSummary').setValue('');
  }

  onClear(index: number): void {
    const contractStartDate = this.inventoryItems[0]?.contractStartDate || '';
    const contractEndDate = this.inventoryItems[0]?.contractEndDate || '';

    // 保留合約起迄日，清除其他內容
    const discountSettingItems = this.getDiscountSettingItems(index);
    while (discountSettingItems.length < 10) {
      discountSettingItems.push(this.createDiscountSettingItem(contractStartDate, contractEndDate));
    }
    discountSettingItems.controls.forEach(control => {
      control.get('selected')?.setValue(false);
      control.get('discountType')?.setValue('');
      control.get('startDate')?.setValue(contractStartDate); // 保留預設值
      control.get('endDate')?.setValue(contractEndDate); // 保留預設值
      control.get('rate')?.setValue('');
    });

    const annualPerformanceItems = this.getAnnualPerformanceItems(index);
    while (annualPerformanceItems.length < 10) {
      annualPerformanceItems.push(this.createAnnualPerformanceItem());
    }
    annualPerformanceItems.controls.forEach(control => {
      control.get('selected')?.setValue(false);
      control.get('discountAmount')?.setValue('');
      control.get('rate')?.setValue('');
    });

    const discountLevelItems = this.getDiscountLevelItems(index);
    while (discountLevelItems.length < 10) {
      discountLevelItems.push(this.createDiscountLevelItem());
    }
    discountLevelItems.controls.forEach(control => {
      control.get('selected')?.setValue(false);
      control.get('discountType')?.setValue('');
      control.get('startAmount')?.setValue('');
      control.get('endAmount')?.setValue('');
      control.get('rate')?.setValue('');
    });
  }

  onRemoveItem(index: number): void {
    this.items.removeAt(index);
  }

  onCancel(): void {
    this.router.navigate(['TLS1000/TLS13010']);
  }

  submitForm() {
    if (this.dataForm.valid) {
      console.log(this.dataForm.value);
    } else {
      console.error("表單驗證失敗！");
    }
  }
}
