import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../service/system/auth.service';

export interface HasPermissionsValue {
  progNo: string;
  permission: string;
}

@Directive({
  selector: '[appHasPermission]',
})
export class HasPermissionDirective {
  @Input() set appHasPermission(value: HasPermissionsValue) {
    const funInfo = this.authService.getUserPermissions(value.progNo);
    if (funInfo?.PrivilegeBehavior?.some(behavior => behavior.function_code === value.permission)) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    private authService: AuthService
  ) { }
}
