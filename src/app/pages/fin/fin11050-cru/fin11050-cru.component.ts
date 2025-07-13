import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FIN11050Data, Fin11050Service } from '../../../service/api/fin/fin11050.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-fin11050-cru',
    templateUrl: './fin11050-cru.component.html',
    styleUrl: './fin11050-cru.component.scss',
    standalone: true,
    imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, NgIf]
})
export class FIN11050CRUComponent extends BasicCruPageComponent<FIN11050Data> implements OnInit {
  dataForm = this.formBuilder.group({
    format_code: ['', [Validators.required, Validators.maxLength(2)]],    // 格式代號
    format_name: ['', [Validators.required, Validators.maxLength(100)]]   // 格式名稱
  });

  constructor(private fin11050Service: Fin11050Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11050', this.dataForm);
    if (this.isFormReadable) {
      this.dataForm.disable();
    }
  }

  onSubmit(frm: FormGroup): void {
    this.messageService.blockUi();
    this.submitted = true;

    if (frm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    const formValue = frm.getRawValue();

    if (this.isFormCreateable) {
      this.fin11050Service.insertFIN11050(formValue).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.messageService.successBubble('新增成功');
            this.dataForm.reset();
          } else {
            this.messageService.errorBubble(response.Message || '新增失敗');
          }
        },
        error: () => {
          this.messageService.errorBubble('新增失敗');
        },
        complete: () => {
          this.messageService.unblockUi();
          this.submitted = false;
        }
      });
    } else if (this.isFormEditable) {
      this.fin11050Service.updateFIN11050(formValue).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.messageService.successBubble('修改成功');
          } else {
            this.messageService.errorBubble(response.Message || '修改失敗');
          }
        },
        error: () => {
          this.messageService.errorBubble('修改失敗');
        },
        complete: () => {
          this.messageService.unblockUi();
          this.submitted = false;
        }
      });
    } else {
      this.messageService.unblockUi();
      this.submitted = false;
    }
  }
}