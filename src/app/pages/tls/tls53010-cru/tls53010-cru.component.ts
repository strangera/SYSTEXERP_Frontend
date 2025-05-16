// 點單開立
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

// Services
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { InventoryStatusService } from '../../../service/basic/inventory-status.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-tls53010-cru',
  templateUrl: './tls53010-cru.component.html',
  styleUrl: './tls53010-cru.component.scss'
})
export class TLS53010CRUComponent extends BasicCrupageComponent implements OnInit {



  dataForm = this.formBuilder.group({
    inventoryCode: [{ value: '自動編號', disabled: true }], // 新增盤點單編號
    warehouseCode: [null, Validators.required], // 倉別 dropdown
    brandCode: [null, Validators.required],
    inventoryDateFrom: [],
    inventoryDateTo: [],
    inventoryStatus: [null, Validators.required],
    Description: [],
    // ----------------------------------------------------------------
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });

  // Dropdown options
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  inventoryStatusOptions: any[] = [];




  constructor(
    private router: Router,
    private formBuilder: FormBuilder,

    private warehouseService: WarehouseService,
    private brandCodeService: BrandCodeService,
    private inventoryStatusService: InventoryStatusService,
    private authService: AuthService,
    private translate: TranslateService,
    private messageService: NotificationService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '250021';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.warehouseService.getWarehouseOptions().subscribe(data => this.warehouseOptions = data);
    this.brandCodeService.getSystemTypes().subscribe(data => this.brandCodeOptions = data);
    this.inventoryStatusService.getInventoryStatusOptions().subscribe(data => this.inventoryStatusOptions = data);
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };//CRU

    switch (state.crudstatus) {
      case CRUDStatus.Create:
        this.formTitle = '新增資料';
        this.showConfirm = this.canAdd();
        break;
      case CRUDStatus.Edit:
        console.log(state.rowdata);
        this.formTitle = '編輯資料';
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      case CRUDStatus.Read:
        this.formTitle = '顯示資料';
        this.Read(state.rowdata);
        break;
    }//CRU
  }
  // ----------------------------------------------------------------
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      mgname: [],
      barcode: [{ value: '自動帶入', disabled: true }],
      vendorCode: [{ value: '自動帶入', disabled: true }],
      remark: [],
    });
  }

  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.errorBubble(this.translate.instant('form_error_message'));
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onCancel() {
    this.router.navigate(['/TLS5000/TLS53010']);
  }
  switchloadbtn1() { }
  switchloadbtn2() { }
}
