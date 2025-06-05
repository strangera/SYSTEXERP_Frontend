import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E010CRUComponent } from './tls2e010-cru.component';

describe('TLS2E010CRUComponent', () => {
  let component: TLS2E010CRUComponent;
  let fixture: ComponentFixture<TLS2E010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
