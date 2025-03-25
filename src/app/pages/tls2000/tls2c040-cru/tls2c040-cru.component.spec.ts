import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2C040CRUComponent } from './tls2c040-cru.component';

describe('TLS2C040CRUComponent', () => {
  let component: TLS2C040CRUComponent;
  let fixture: ComponentFixture<TLS2C040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2C040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2C040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
