import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2K010CRUComponent } from './tls2k010-cru.component';

describe('TLS2K010CRUComponent', () => {
  let component: TLS2K010CRUComponent;
  let fixture: ComponentFixture<TLS2K010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2K010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2K010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
