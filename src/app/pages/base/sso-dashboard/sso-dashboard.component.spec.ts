import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SsoDashboardComponent } from './sso-dashboard.component';

describe('SsoDashboardComponent', () => {
  let component: SsoDashboardComponent;
  let fixture: ComponentFixture<SsoDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SsoDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SsoDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
