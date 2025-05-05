import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2C010CRUComponent } from './tls2c010-cru.component';

describe('TLS2C010CRUComponent', () => {
  let component: TLS2C010CRUComponent;
  let fixture: ComponentFixture<TLS2C010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2C010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2C010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
