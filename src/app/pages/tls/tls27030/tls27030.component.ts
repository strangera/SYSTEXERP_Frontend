import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileType, FileUploadComponent } from '../../../shared/componentkit/file-upload/file-upload.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
@Component({
  selector: 'app-tls27030',
  templateUrl: './tls27030.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, FileUploadComponent, ButtonComponent, TranslateModule]
})
export class TLS27030Component extends BasicQueryPageComponent<any> implements OnInit {
  fileType: FileType = FileType.PNG;
  uploadUrl = 'https://www.primefaces.org/cdn/api/upload.php';
  queryForm = this.formBuilder.group({
    file1: [],  // [聯合]請款檔
    file2: [],  // [中信]請款檔
    file3: [],  // [中信-停車場]請款檔
  });
  constructor(
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27030', 'TLS/TLS27030cru');
  }
}
