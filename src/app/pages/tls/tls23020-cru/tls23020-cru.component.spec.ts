import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23020CRUComponent } from './tls23020-cru.component';

describe('Tls23020CruComponent', () => {
  let component: TLS23020CRUComponent;
  let fixture: ComponentFixture<TLS23020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23020CRUComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TLS23020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
