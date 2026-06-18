import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CurrentPageService } from '../../../core/layout/app.menulist/current-page.service';
import { ASS17040Service } from '../../../service/api/ass/ass17040.service';
import { AuthService } from '../../../service/system/auth.service';
import { SystemDataService } from '../../../service/system/system-data.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { PermissionGuardService } from '../../../shared/service/permission-guard.service';
import { QueryStateService } from '../../../shared/service/query-state.service';
import { ASS17040Component } from './ass17040.component';

describe('ASS17040Component', () => {
  let component: ASS17040Component;
  let fixture: ComponentFixture<ASS17040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS17040Component, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ASS17040Service,
          useValue: {
            queryASS17040: () =>
              of({
                Status: '0000',
                Data: {
                  QueryData: {
                    DeptData: [],
                    Data: [],
                    Summary: { Depts: {}, TotalQty: 0, TotalAmt: 0 },
                  },
                  TotalRows: 0,
                  TotalPages: 0,
                },
                TotalCount: 0,
              }),
          },
        },
        {
          provide: DropdownApiService,
          useValue: {
            querySys3100: () => of([]),
            queryFaClassM: () => of([]),
            queryFaClass1: () => of([]),
            queryFaClass2: () => of([]),
            queryFasItemDropdown: () => of([]),
          },
        },
        {
          provide: NotificationService,
          useValue: { blockUi: (): void => { }, unblockUi: (): void => { } },
        },
        { provide: AuthService, useValue: { currentUserValue: {} } },
        {
          provide: QueryStateService,
          useValue: {
            getQueryState: () => of(null),
            setQueryState: (): void => { },
            getQueryStateValue: () => null,
          },
        },
        {
          provide: CurrentPageService,
          useValue: {
            setCurrentProgNo: (): void => { },
            getCurrentProgNo: () => 'ASS17040',
            currentPageProgNo$: of('ASS17040'),
          },
        },
        {
          provide: SystemDataService,
          useValue: {
            getUserPermissions: () => ({
              PrivilegeBehavior: [{ function_code: '10' }],
            }),
          },
        },
        { provide: PermissionGuardService, useValue: { hasPermission: () => true } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ASS17040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
