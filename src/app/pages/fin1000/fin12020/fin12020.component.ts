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
import { CounterCodeService } from './../../../service/basic/counter-code.service';

//1.1.2.2 使用完/空白發票繳回作業
@Component({
  selector: 'app-fin12020',
  templateUrl: './fin12020.component.html',
  styleUrl: './fin12020.component.scss'
})
export class FIN12020Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    twodatemm: [,[Validators.required]], // 發票年月
    wordTrack: ['', [Validators.required, Validators.maxLength(2)]], // 字軌
    registerID: [, [Validators.required]], // 收銀機代號
    serialInvoice: [, [Validators.required, Validators.maxLength(8)]], // 發票號碼
    startserialInvoice: [, [Validators.required, this.validationService.numberValidator, Validators.maxLength(8)]], // 發票號碼(起)
    endserialInvoice: [, [Validators.required, this.validationService.numberValidator, Validators.maxLength(8)]], // 發票號碼(迄)
    rollNumber: [1, [Validators.required, this.validationService.numberValidator, Validators.max(99999999)]], // 卷數
    usageStatus: [], // 發票使用狀況
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
    // 其他資料
  ];
  columns: any[]= [
    { field: 'col1', header: '發票年月', visible: true },
    { field: 'col2', header: '字軌', visible: true },
    { field: 'col3', header: '發票號碼(起)', visible: true },
    { field: 'col4', header: '發票號碼(迄)', visible: true },
    { field: 'col5', header: 'NEXT發票配號號碼', visible: true },
    { field: 'col6', header: '使用別', visible: true },
    { field: 'col7', header: '使用狀態', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  //
  usageStatusOptions:any[]=[
    { value: 1, label: '已使用繳回發票' },
    { value: 2, label: '空白已繳回發票' },
  ];
  registerIDOptions:any[]=[];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private counterCodeService: CounterCodeService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110011';
    this.cruPage = '/FIN1000/FIN12020CRU';
    //
    // ----------------------------------------------------------------
    this.counterCodeService.getCounterCodes().subscribe(data => {
      this.registerIDOptions = data;
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
  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
}
