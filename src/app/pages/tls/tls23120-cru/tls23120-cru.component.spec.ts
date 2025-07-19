import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23120CRUComponent } from './tls23120-cru.component';

describe('Tls23120CruComponent', () => {
  let component: TLS23120CRUComponent;
  let fixture: ComponentFixture<TLS23120CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23120CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23120CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
