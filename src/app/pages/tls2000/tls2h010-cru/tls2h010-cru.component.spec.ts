import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2H010CRUComponent } from './tls2h010-cru.component';

describe('TLS2H010CRUComponent', () => {
  let component: TLS2H010CRUComponent;
  let fixture: ComponentFixture<TLS2H010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2H010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2H010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
