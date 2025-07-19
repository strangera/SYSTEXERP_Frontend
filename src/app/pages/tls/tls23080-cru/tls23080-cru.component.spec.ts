import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23080CRUComponent } from './tls23080-cru.component';

describe('Tls23080CruComponent', () => {
  let component: TLS23080CRUComponent;
  let fixture: ComponentFixture<TLS23080CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23080CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23080CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
