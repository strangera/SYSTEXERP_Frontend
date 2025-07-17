import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23140CRUComponent } from './tls23140-cru.component';

describe('Tls23140CruComponent', () => {
  let component: TLS23140CRUComponent;
  let fixture: ComponentFixture<TLS23140CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23140CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23140CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
