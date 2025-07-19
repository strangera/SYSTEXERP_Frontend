import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23110CRUComponent } from './tls23110-cru.component';

describe('Tls23110CruComponent', () => {
  let component: TLS23110CRUComponent;
  let fixture: ComponentFixture<TLS23110CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23110CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23110CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
