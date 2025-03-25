import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../service/system/auth.service';
import { PermissionsInfo } from '../../models/system/funsrightInfo';

export interface HasPermissionsValue{
  progNo: string,
  permission: PermissionsInfo,
}

@Directive({
  selector: '[appHasPermission]',
})
export class HasPermissionDirective {
  @Input() set appHasPermission(value: { progNo:string, permission: PermissionsInfo }) {
    if (this.authService.getUserPermissions(value.progNo).permissions?.includes(value.permission)) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    private authService: AuthService
  ) {}

}
