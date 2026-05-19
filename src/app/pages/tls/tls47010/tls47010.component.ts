import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { AccordionModule } from 'primeng/accordion';
import { TLS47010Service } from '../../../service/api/tls/tls47010.service';
import { DataTypeService } from '../../../service/basic/queryDEFTBL.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

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
    AsyncPipe
  ],
})
export class TLS47010Component extends BasicQueryPageComponent<any> implements OnInit {
  ECRNoOptions = this.dropDown.queryPos1002Filtered();
  dataTypeOptions: any[] = [];

  queryForm = this.formBuilder.group({
    ECR_No: [[], Validators.required],
    dataType: [[], Validators.required],
    ...createPaginationConfig([]),
  });

  constructor(
    private dataTypeService: DataTypeService,
    private tls47010Service: TLS47010Service,
    private readonly dropDown: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS47010', '/tls/tls47010cru', this.queryForm);
    this.dataTypeService.getDataOptions().subscribe((res) => {
      this.dataTypeOptions = res.map((x: any) => ({
        label: `${x.No} - ${x.Name}`,
        value: x.No,
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
