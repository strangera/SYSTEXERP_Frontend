import { Component, Input  } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ValidationService } from '../../service/validation.service';

// Angular Form Builder and Validation Management (source code)
// https://coryrylan.com/blog/angular-form-builder-and-validation-management
// day04 SharedModule(二)
// https://ithelp.ithome.com.tw/articles/10217776
@Component({
  selector: 'app-control-messages',
  templateUrl: './control-messages.component.html',
  styleUrl: './control-messages.component.scss'
})
export class ControlMessagesComponent {
  // 是否按下確認
  @Input() onerror: boolean = false;
  @Input() control!: FormControl | any;
  constructor(private validService: ValidationService) {}

  get errorMessage() {
    if (this.onerror) {
      // control info
      for (const propertyName in this.control.errors) {
        // show error in full page, so don't this.control.touched.
        if ( this.control.errors.hasOwnProperty(propertyName) ) {
          const erroring = this.validService.getValidatorErrorMessage(
            propertyName,
            this.control.errors[propertyName]
          );
          return erroring;
        }
      }
    }
    return null;
  }
}
