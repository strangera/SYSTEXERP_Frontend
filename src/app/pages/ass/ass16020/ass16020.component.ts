import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS16020Data, Ass16020Service } from '@service/api/ass/ass16020.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

@Component({
  selector: 'app-ass16020',
  templateUrl: './ass16020.component.html',
  styleUrl: './ass16020.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarRangeComponent,
    InputTextComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    MultiSelectComponent,
    DialogModule,
    TableReportComponent
  ]
})
export class ASS16020Component extends BasicQueryPageComponent<ASS16020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    Inventoryordernumber: [],
    Inventorystatus: [[1, 2]],  // 預設選取
    SInventorydate: [],
    EInventorydate: [],
    SClosingdate: [],
    EClosingdate: [],
    InvStaff: [],
    illustrate: [],
    Reporttype: [0],  // 預設選取
  });
  // Table data
  data: ASS16020Data[] = [];
  QueryDialogData: ASS16020Data[] = [];
  selectedItems: ASS16020Data[] = [];

  public readonly totalRecords = signal<number>(0);

  // Dialog visibility
  arDialogVisible = false;

  columns = [
    { field: 'inventoryNumber', header: '盤點單號', visible: true },
    { field: 'inventoryStatus', header: '盤點狀態', visible: true },
    { field: 'inventoryDate', header: '盤點日期', visible: true },
    { field: 'closingDate', header: '結案日期', visible: true },
    { field: 'inventoryStaff', header: '盤點人員', visible: true },
  ];

  QueryDialogColumns = [
    { field: 'inventoryNumber', header: '盤點單號', visible: true },
    { field: 'inventoryStatus', header: '盤點狀態', visible: true },
    { field: 'inventoryDate', header: '盤點日期', visible: true },
    { field: 'closingDate', header: '結案日期', visible: true },
    { field: 'inventoryStaff', header: '盤點人員', visible: true },
  ];


  // 下拉選單
  Inventorystatus = [
    { value: 1, label: '盤點中' },
    { value: 2, label: '登錄完成' },
    { value: 3, label: '已結案' },

  ];

  Reporttype = [
    { value: 0, label: '全部' },
    { value: 1, label: '差異' },
  ];

  InvStaff = signal<{ label: string; value: string }[]>([]);


  constructor(
    private notificationService: NotificationService,
    private ass16020Service: Ass16020Service,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '310041';
    this.initializePage('ASS16020', 'ass/ass16020cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    // if (frm.valid && this.canQuery()) {
    //   // Submit logic here
    // }

    this.loading = false;
    this.notificationService.unblockUi();

  }

  // onCreate() {
  //   if (this.canAdd()) {
  //     let extras: NavigationExtras = {
  //       state: {
  //         crudstatus: CRUDStatus.Create,
  //         queryform: this.queryForm,
  //       },
  //       skipLocationChange: true,
  //     };
  //     this.router.navigate(['FIN3000/FIN34030CRU'], extras);
  //   }
  // }

  // onEdit(data: any) {
  //   if (this.canEdit()) {
  //     let extras: NavigationExtras = {
  //       state: {
  //         crudstatus: CRUDStatus.Edit,
  //         rowdata: data,
  //         queryform: this.queryForm,
  //       },
  //       skipLocationChange: true,
  //     };
  //     this.router.navigate(['/demoCRU'], extras);
  //   }
  // }

  // onDetail(data: any) {
  //   let extras: NavigationExtras = {
  //     state: {
  //       crudstatus: CRUDStatus.Read,
  //       rowdata: data,
  //       queryform: this.queryForm,
  //     },
  //     skipLocationChange: true,
  //   };
  //   this.router.navigate(['/demoCRU'], extras);
  // }

  /** 打開應收未收查詢 Dialog */
  onQueryDialog() {
    // 打開 Dialog
    this.arDialogVisible = true;
    this.cdr.detectChanges();

    this.QueryDialogData = [
      {
        inventoryNumber: 'IV202603110001',
        inventoryStatus: '已結案',
        inventoryDate: '2026-03-01',
        closingDate: '',
        inventoryStaff: '王小明'
      },
      {
        inventoryNumber: 'IV202603110002',
        inventoryStatus: '盤點中',
        inventoryDate: '2026-03-03',
        closingDate: '',
        inventoryStaff: '陳美玲'
      },
      {
        inventoryNumber: 'IV202603110003',
        inventoryStatus: '登錄完成',
        inventoryDate: '2026-03-05',
        closingDate: '2026-03-06',
        inventoryStaff: '林志宏'
      },
      {
        inventoryNumber: 'IV202603110004',
        inventoryStatus: '登錄完成',
        inventoryDate: '2026-03-07',
        closingDate: '2026-03-08',
        inventoryStaff: '張雅婷'
      },
      {
        inventoryNumber: 'IV202603110005',
        inventoryStatus: '盤點中',
        inventoryDate: '2026-03-09',
        closingDate: '',
        inventoryStaff: '劉冠廷'
      }
    ];

  }

  goReport() {
    this.router.navigate(['/account/ass/ass16020cru']);
  }
  /**
     * 載入下拉選單選項
     */
  private loadDropdownOptions(): void {
    // 盤點人員
    this.ass16020Service.queryTBLUSER_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.Name,
        }));
        this.InvStaff.set(options);
      },
    });
  }
}
