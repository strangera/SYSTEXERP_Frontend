import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS12010CRUComponent } from './tls12010-cru.component';

describe('TLS12010CRUComponent', () => {
  let component: TLS12010CRUComponent;
  let fixture: ComponentFixture<TLS12010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS12010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS12010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
