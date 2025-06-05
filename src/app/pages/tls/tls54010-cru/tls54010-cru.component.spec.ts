import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS54010CRUComponent } from './tls54010-cru.component';

describe('TLS54010CRUComponent', () => {
  let component: TLS54010CRUComponent;
  let fixture: ComponentFixture<TLS54010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS54010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS54010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
