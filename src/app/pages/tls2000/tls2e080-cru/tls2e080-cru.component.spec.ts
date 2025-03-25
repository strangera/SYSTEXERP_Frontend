import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E080CRUComponent } from './tls2e080-cru.component';

describe('TLS2E080CRUComponent', () => {
  let component: TLS2E080CRUComponent;
  let fixture: ComponentFixture<TLS2E080CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E080CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E080CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
