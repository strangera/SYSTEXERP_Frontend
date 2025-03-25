import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS47010CRUComponent } from './tls47010-cru.component';

describe('TLS47010CRUComponent', () => {
  let component: TLS47010CRUComponent;
  let fixture: ComponentFixture<TLS47010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS47010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS47010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
