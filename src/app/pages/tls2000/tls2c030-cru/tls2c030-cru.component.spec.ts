import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2C030CRUComponent } from './tls2c030-cru.component';

describe('TLS2C030CRUComponent', () => {
  let component: TLS2C030CRUComponent;
  let fixture: ComponentFixture<TLS2C030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2C030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2C030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
