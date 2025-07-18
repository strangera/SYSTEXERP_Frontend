import { Component } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TranslateModule } from '@ngx-translate/core';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { DataTypeService } from '../../../service/basic/data-type.service';
import { TLS47010Service } from '../../../service/api/tls/tls47010.service'; // ✅ 你需要新增此 service


@Component({
  selector: 'app-tls47010',
  templateUrl: './tls47010.component.html',
  styleUrls: ['./tls47010.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    TranslateModule,
  ],
})
export class TLS47010Component extends BasicQueryPageComponent<any> {
  ECRNoOptions: any[] = []; // 收銀機號下拉選單
  dataTypeOptions: any[] = [];

  queryForm = this.formBuilder.group({
    ECR_No: [[], Validators.required],
    dataType: [[], Validators.required],
    ...createPaginationConfig([]),
  });

  constructor(
    private dataTypeService: DataTypeService,
    private tls47010Service: TLS47010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS47010', '/tls/tls47010cru', this.queryForm);

    this.tls47010Service.ECROptions({}).subscribe((res) => {
      this.ECRNoOptions =
        res?.Data?.map((x: any) => ({
          label: `${x.ECR_No} - ${x.ECR_Name} - ${x.ECR_Status}`,
          value: x.ECR_No,
        })) || [];
    });

    this.dataTypeService.getDataOptions().subscribe((res) => {
      this.dataTypeOptions = res.map((x: any) => ({
        label: `${x.TBL_Name} - ${x.TBL_Remark}`,
        value: x.TBL_Name,
      }));
    });
  }

  onClearForm(): void {
    this.queryForm.reset();
  }
 onDownload(): void {
  const formValue = this.queryForm.value;

  const DEFTBL_List = formValue.dataType || []; // 資料類別（對應 TBL_Name）
  const POS1002_List = formValue.ECR_No || [];  // 收銀機號（對應 ECR_No）

  if (!DEFTBL_List.length || !POS1002_List.length) {
    this.messageService.warnBubble('請選擇收銀機號與資料類別');
    return;
  }

  const payload = {
    DEFTBL_List,
    POS1002_List,
  };

  this.loading = true;
  this.messageService.blockUi();

  this.tls47010Service.insertTLS47010(payload).subscribe({
    next: () => {
      this.messageService.successBubble('下傳成功');
    },
    error: () => {
      this.messageService.errorBubble('下傳失敗');
    },
    complete: () => {
      this.loading = false;
      this.messageService.unblockUi();
    },
  });
}

}
