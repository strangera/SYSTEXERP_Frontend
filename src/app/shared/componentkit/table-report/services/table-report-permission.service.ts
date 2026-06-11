import { inject, Injectable, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CurrentPageService } from 'src/app/core/layout/app.menulist/current-page.service';
import { SystemDataService } from 'src/app/service/system/system-data.service';
import { FunsrightInfo } from 'src/app/shared/models/system/funsrightInfo';

@Injectable()
export class TableReportPermissionService implements OnDestroy {
  private readonly currentPage = inject(CurrentPageService);
  private readonly systemDataService = inject(SystemDataService);
  private readonly destroy$ = new Subject<void>();

  public funInfo?: FunsrightInfo = { PrivilegeBehavior: [] } as unknown as FunsrightInfo;
  public tableKey = 'TableQueryState';

  public initPermission(defaultTableKey: string, callback: (key: string) => void) {
    this.tableKey = defaultTableKey;
    this.currentPage.currentPageProgNo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(progNo => {
        if (progNo) {
          this.funInfo = this.systemDataService.getUserPermissions(progNo);
          const computedKey = progNo + 'TableQueryState';
          callback(computedKey);
        } else {
          this.funInfo = { PrivilegeBehavior: [] } as unknown as FunsrightInfo;
        }
      });
  }

  public hasPermission(action: string): boolean {
    return this.funInfo?.PrivilegeBehavior?.some(behavior => behavior.function_code === action) || false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
