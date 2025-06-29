import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';


@Component({
  selector: 'app-tls2a050',
  templateUrl: './tls2a050.component.html',
})
export class TLS2A050Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    status1: [''],
    status2: [''],
    salesDate: [null as Date | null],
    startdate: [null as Date | null],
    enddate: [null as Date | null],
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    // { contactPerson: 'A先生', contactDate: '2024-08-08', UID: '123' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 1, progress: '未審核'},
    // { contactPerson: 'B先生', contactDate: '2024-08-09', UID: '456' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 2, progress: '已審核'},
    // { contactPerson: 'C先生', contactDate: '2024-08-10', UID: '789' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 3, progress: '未審核'},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  statusOptions = [
    { label: '全部', value: 'all' },
    { label: '一般', value: 'ordinary' },
    { label: '停管', value: 'stop' }
  ];
  salesMinDate: Date | null = null;
  salesMaxDate: Date | null = null;
  columns: any[] = [
    { field: 'contactPerson', header: '系統筆數', visible: true },
    { field: 'contactDate', header: '實收筆數', visible: true },
    { field: 'UID', header: '系統金額', visible: true },
    { field: 'industryType', header: '實收金額', visible: true },
    { field: 'category', header: '帳差(實收-系統)', visible: true },
    // 其他欄位
  ];

  constructor(

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2A050', '/TLS/TLS2A050CRU', this.queryForm, (form) => this.onSubmit(form));
    // 初始化權限
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.queryForm.get('salesDate')?.valueChanges.subscribe((val) => {
      if (val) {
        const selected = new Date(val);
        const year = selected.getFullYear();
        const month = selected.getMonth();

        this.salesMinDate = new Date(year, month, 1);
        this.salesMaxDate = new Date(year, month + 1, 0);

        // 可選：重設原來的區間
        this.queryForm.patchValue({
          startdate: this.salesMinDate,
          enddate: this.salesMaxDate,
        });
      }
    });
  }

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
  }

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

  //   onSubmitQuery(frm: FormGroup) {
  //     // 查詢邏輯
  //     this.onSubmit(frm);
  //   }

  //   onClearForm() {
  //     this.queryForm.reset();  // 重置表單
  //   }

  //   onCreate() {
  //     if (this.canAdd()) {
  //       let extras: NavigationExtras = {
  //         state: {
  //           crudstatus: CRUDStatus.Create,
  //           queryform: this.queryForm,
  //         },
  //         skipLocationChange: true
  //       };

  //       //console.log("extra", extras);
  //       this.router.navigate(['/TLS2000/TLS2A050CRU'], extras);
  //     }
  //   }

  //   onEdit(data: any) {
  //     if (this.canEdit()) {
  //       let extras: NavigationExtras = {
  //         state: {
  //           crudstatus: CRUDStatus.Edit,
  //           rowdata: data,
  //           queryform: this.queryForm,
  //         },
  //         skipLocationChange: true
  //       };

  //       this.router.navigate(['/TLS2000/TLS2A050CRU'], extras);
  //     }
  //   }

  //   onDetail(data: any) {
  //     let extras: NavigationExtras = {
  //       state: {
  //         crudstatus: CRUDStatus.Read,
  //         rowdata: data,
  //         queryform: this.queryForm,
  //       },
  //       skipLocationChange: true
  //     };

  //     this.router.navigate(['/TLS2000/TLS2A050CRU'], extras);
  //   }
}
