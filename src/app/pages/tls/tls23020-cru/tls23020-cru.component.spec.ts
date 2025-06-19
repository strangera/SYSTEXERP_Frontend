import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls23020CruComponent } from './tls23020-cru.component';

describe('Tls23020CruComponent', () => {
  let component: Tls23020CruComponent;
  let fixture: ComponentFixture<Tls23020CruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls23020CruComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls23020CruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
