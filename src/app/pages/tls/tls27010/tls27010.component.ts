import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileType, FileUploadComponent } from '../../../shared/componentkit/file-upload/file-upload.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent, TableComponent } from '@shared/componentkit';
@Component({
  selector: 'app-tls27010',
  templateUrl: './tls27010.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, FileUploadComponent, TranslateModule, ButtonComponent, TableComponent]
})
export class TLS27010Component extends BasicQueryPageComponent<any> implements OnInit {
  fileType: FileType = FileType.PNG;
  uploadUrl = 'https://www.primefaces.org/cdn/api/upload.php';
  queryForm = this.formBuilder.group({
    fileSelection: [],
  });
  constructor(
  ) { super() }

  ngOnInit(): void {
    this.initializePage('TLS27010', 'tls/tls27010cru');
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected file:', file);
    }
  }
}
