import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2D020CRUComponent } from './tls2d020-cru.component';

describe('TLS2D020CRUComponent', () => {
  let component: TLS2D020CRUComponent;
  let fixture: ComponentFixture<TLS2D020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2D020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2D020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
