import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS11020CRUComponent } from './tls11020-cru.component';

describe('TLS11020CRUComponent', () => {
  let component: TLS11020CRUComponent;
  let fixture: ComponentFixture<TLS11020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS11020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS11020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
