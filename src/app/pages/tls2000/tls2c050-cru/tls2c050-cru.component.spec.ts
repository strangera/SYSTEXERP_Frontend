import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2C050CRUComponent } from './tls2c050-cru.component';

describe('TLS2C050CRUComponent', () => {
  let component: TLS2C050CRUComponent;
  let fixture: ComponentFixture<TLS2C050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2C050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2C050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
