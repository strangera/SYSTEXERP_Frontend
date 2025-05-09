import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { AllpayCodeService } from './../../../service/basic/allpay-code.service';
import { WhetherService } from './../../../service/basic/whether.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
//1.1.1.1 營業人申報設定
@Component({
  selector: 'app-fin11010',
  templateUrl: './fin11010.component.html',
  styleUrl: './fin11010.component.scss'
})
export class FIN11010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    bId: [, [Validators.maxLength(8)]], // 營業人統編
    bName: ['', [Validators.maxLength(60)]], // 營業人名稱
    bAddress: ['', [Validators.maxLength(100)]], // 營業地址
    allPayCode: [[] as number[]], // 總繳代號
    status: [[] as number[]], // 審核狀態
    startdate: [], // 申報年月起
    enddate: [], // 申報年月迄
  });
  roles: any[] = [
    { id: 1, roleCode: 'ADMIN', roleName: 'Administrator' },
    { id: 2, roleCode: 'USER', roleName: 'User' },
    { id: 3, roleCode: 'GUEST', roleName: 'Guest' },
  ];
  data: any[] = [];
  columns: any[] = [
    { field: 'col1', header: '營業人統編', visible: true },
    { field: 'col2', header: '營業人名稱', visible: true },
    { field: 'col3', header: '縣市別', visible: true },
    { field: 'col4', header: '營業地址', visible: true },
    { field: 'col5', header: '總繳代號', visible: true },
    { field: 'col6', header: '直接扣抵法(Y/N)', visible: true },
    { field: 'col7', header: '審核狀態', visible: true },
    { field: 'col8', header: '申報年月起', visible: true },
    { field: 'col9', header: '申報年月迄', visible: true },
  ];
  payMethodOptions: any[] = []; //總繳代號
  whetherOptions: any[] = []; // 審核狀態

  constructor(
    private allpayCodeService: AllpayCodeService,
    private whetherService: WhetherService,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('FIN11010', '/FIN1000/FIN11010CRU');
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.whetherOptions = data;
    });
    this.allpayCodeService.getAllpayCodes().subscribe(data => {
      this.payMethodOptions = data;
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // this.xxxService.queryMachine(frm.value as xxxInterface).subscribe((response: any) => {
      //   this.rows = response.xxx;
      // });
    });
  }
  // 匯出申報資料
  onExportReporting() {

  }
}
