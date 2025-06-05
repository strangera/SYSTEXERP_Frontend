import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2C020CRUComponent } from './tls2c020-cru.component';

describe('TLS2C020CRUComponent', () => {
  let component: TLS2C020CRUComponent;
  let fixture: ComponentFixture<TLS2C020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2C020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2C020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
