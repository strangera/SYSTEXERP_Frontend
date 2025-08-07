import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TranslateModule } from '@ngx-translate/core'; // Add this import as requested
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { POS611XOptions } from './tls27040.model';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { POS6118Data, POS6119Data, POS6119PData, TLS27040Service } from '@service/api/tls/tls27040.service';
import { finalize } from 'rxjs';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownModule } from 'primeng/dropdown';
import { Tls27040POS6118Component } from './tls27040-pos6118/tls27040-pos6118.component';
import { Tls27040POS6119Component } from './tls27040-pos6119/tls27040-pos6119.component';
import { Tls27040POS6119pComponent } from './tls27040-pos6119p/tls27040-pos6119p.component';
@Component({
  selector: 'app-tls27040',
  templateUrl: './tls27040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    TranslateModule,
    NgIf,
    DialogComponent,
    CalendarComponent,
    DropdownModule,
    Tls27040POS6118Component,
    Tls27040POS6119Component,
    Tls27040POS6119pComponent,
    NgTemplateOutlet,
  ]
})
export class TLS27040Component extends BasicQueryPageComponent<POS6118Data | POS6119Data | POS6119PData> implements OnInit {
  @ViewChild('pos6118', { static: false }) pos6118!: Tls27040POS6118Component;
  @ViewChild('pos6119', { static: false }) pos6119!: Tls27040POS6119Component;
  @ViewChild('pos6119p', { static: false }) pos6119p!: Tls27040POS6119pComponent;

  selectedBank = '0';
  POS6118Data: POS6118Data[] = [];
  POS6119Data: POS6119Data[] = [];
  POS6119PData: POS6119PData[] = [];
  POS611XOptions = POS611XOptions;             // 收單銀行
  constructor(
    private readonly tls27040Service: TLS27040Service,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27040', 'TLS/TLS27040cru');
  }
  dialogVisible = false;
  dialogLoading = false;
  dialogSubmitted = false;
  dialogQueryForm = this.formBuilder.group({
    ECR_No: ['', [Validators.required, Validators.maxLength(10)]],
    TXN_No: ['', [Validators.required, Validators.maxLength(8)]],
    TXN_Date: [null, [Validators.required]],
    tableName: [null, [Validators.required]],
  })
  onOpenDialog() {
    this.dialogVisible = true;
  }
  onDialogSubmit(frm: FormGroup) {
    this.dialogSubmitted = true;
    this.dialogLoading = true;
    if (!frm.valid) {
      this.dialogLoading = false;
      return;
    }
    const body = {
      ...frm.getRawValue(),
      SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo,
    }
    this.tls27040Service.queryInsCheck(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(res => {
      if (res.Data === true) {
        this.onCreate(frm.getRawValue());
      } else {
        this.messageService.warnBubble(res.Message);
      }
    })
  }

  // 新增一個 getter 來安全地取得 formTemplate
  get currentFormTemplate() {
    switch (this.selectedBank) {
      case '0': return this.pos6118?.formTemplate;
      case '1': return this.pos6119?.formTemplate;
      case '2': return this.pos6119p?.formTemplate;
      default: return null;
    }
  }

  // 新增一個 getter 來安全地取得 tableTemplate
  get currentTableTemplate() {
    switch (this.selectedBank) {
      case '0': return this.pos6118?.tableTemplate;
      case '1': return this.pos6119?.tableTemplate;
      case '2': return this.pos6119p?.tableTemplate;
      default: return null;
    }
  }
}
