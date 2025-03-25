import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2F010CRUComponent } from './tls2f010-cru.component';

describe('TLS2F010CRUComponent', () => {
  let component: TLS2F010CRUComponent;
  let fixture: ComponentFixture<TLS2F010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2F010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2F010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
