import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23040CRUComponent } from './tls23040-cru.component';

describe('Tls23040CruComponent', () => {
  let component: TLS23040CRUComponent;
  let fixture: ComponentFixture<TLS23040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
