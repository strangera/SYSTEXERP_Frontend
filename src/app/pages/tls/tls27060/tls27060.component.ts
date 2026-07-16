import { Component, OnInit, ViewChild } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TLS27060Service } from '@service/api/tls/tls27060.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { FileUploadHandlerEvent } from 'primeng/fileupload';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';

type UploadType = 'Points' | 'Voucher';

@Component({
  selector: 'app-tls27060',
  templateUrl: './tls27060.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FileUploadComponent,
  ]
})
export class TLS27060Component extends BasicQueryPageComponent<unknown> implements OnInit {
  @ViewChild('fileUpload1') fileUpload1?: FileUploadComponent;
  @ViewChild('fileUpload2') fileUpload2?: FileUploadComponent;
  files1: File[] = [];
  files2: File[] = [];

  private readonly fileNameRules: Record<UploadType, { pattern: RegExp; sample: string }> = {
    Points: { pattern: /^PointsTransactions_\d{8}\.csv$/i, sample: 'PointsTransactions_yyyymmdd.csv' },
    Voucher: { pattern: /^VoucherTransactions_\d{8}\.csv$/i, sample: 'VoucherTransactions_yyyymmdd.csv' },
  };

  constructor(
    public readonly tls27060Service: TLS27060Service,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27060');
  }

  handleCustomUpload(event: FileUploadHandlerEvent, type: UploadType) {
    if (!event.files || event.files.length === 0) return;

    const rule = this.fileNameRules[type];
    const invalidFiles = event.files.filter(file => !rule.pattern.test(file.name)).map(file => file.name);
    if (invalidFiles.length > 0) {
      this.messageService.errorBubble(`檔名格式錯誤：${invalidFiles.join(', ')}。必須為「${rule.sample}」`);
      return;
    }

    const clientIp = this.authService.getUserInfo()?.client_ip || '';
    this.loading = true;

    this.tls27060Service.uploadTLS27060(event.files, clientIp, type).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
      this.messageService.successBubble(response.Message);
      switch (type) {
        case 'Points':
          this.files1 = [];
          this.fileUpload1?.fileUpload?.clear();
          break;
        case 'Voucher':
          this.files2 = [];
          this.fileUpload2?.fileUpload?.clear();
          break;
      }
    });
  }
}
