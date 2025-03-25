import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E100CRUComponent } from './tls2e100-cru.component';

describe('TLS2E100CRUComponent', () => {
  let component: TLS2E100CRUComponent;
  let fixture: ComponentFixture<TLS2E100CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E100CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E100CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
