import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
// Permissions
import { FunsrightInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

// Services for dropdowns
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

const now = new Date();

@Component({
  selector: 'app-tls28050',
  templateUrl: './tls28050.component.html',
  styleUrls: ['./tls28050.component.scss'],
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class TLS28050Component {

  // 程式編號
  ProgNo: string = '220048';
  // 權限變數
  funInfo?: FunsrightInfo;




  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    date: [now, [Validators.required]],  // 日期
    bagType: [],  // 表類
    floor: []  // 樓層
  });

  // 表格資料
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'categoryName', header: '櫃號名稱', visible: true },
    { field: 'description', header: '說明', visible: true },
    { field: 'buildingName', header: '樓層名稱', visible: true },
    { field: 'status', header: '狀態', visible: true },
    { field: 'sequence', header: '序號', visible: true },
    { field: 'subCategoryName', header: '櫃號名稱', visible: true },
    { field: 'subDescription', header: '說明', visible: true },
    { field: 'subBuildingName', header: '樓層名稱', visible: true },
    { field: 'subStatus', header: '狀態', visible: true },
  ];

  // 下拉選單選項
  bagTypeOptions: any[] = [];
  floorOptions: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {

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

  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm
        },
        skipLocationChange: true
      };
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm
        },
        skipLocationChange: true
      };
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm
      },
      skipLocationChange: true
    };
  }
}
