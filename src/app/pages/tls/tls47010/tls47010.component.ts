import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { TLS47010Service } from '../../../service/api/tls/tls47010.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';

@Component({
  selector: 'app-tls47010',
  templateUrl: './tls47010.component.html',
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
export class TLS47010Component extends BasicQueryPageComponent<unknown> implements OnInit {
  private readonly tls47010Service = inject(TLS47010Service);
  private readonly dropDown = inject(DropdownApiService);
  ECRNoOptions = this.dropDown.queryPos1002Filtered();
  dataTypeOptions = this.dropDown.queryDefTbl();
  queryForm = this.formBuilder.group({
    DEFTBL_List: [[], Validators.required],
    POS1002_List: [[], Validators.required],
  });
  private allSelected = false;
  constructor() { super(); }
  ngOnInit(): void {
    this.initializePage('TLS47010');
  }
  // 用來接收子元件傳上來的全選狀態
  onEcrNoAllSelected(isAllSelected: boolean): void {
    console.log('全選狀態:', isAllSelected);
    this.allSelected = isAllSelected;
  }
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const requestBody = {
        POS1002_List: this.allSelected ? [] : form.value.POS1002_List,
        DEFTBL_List: form.value.DEFTBL_List
      }
      this.tls47010Service.insertTLS47010(requestBody).pipe(finalize(() => this.loading = false)).subscribe(() => {
        this.messageService.successBubble('下傳成功');
      });
    });
  }
}
